import Property from '../models/Property.js';
import LandTransfer from '../models/LandTransfer.js';
import cloudinaryService from '../services/cloudinaryService.js';
import landRegistryBlockchain from '../services/landRegistryBlockchainService.js';
import crypto from 'crypto';

// Helper to generate document hash
const generateDocumentHash = (content) => {
  return crypto.createHash('sha256').update(content).digest('hex');
};

// Helper to generate property hash for blockchain
const generatePropertyHash = (property) => {
  const dataString = JSON.stringify({
    surveyNumber: property.surveyNumber,
    location: property.location,
    area: property.area,
    currentOwner: property.currentOwner,
    documents: property.documents.map(d => d.hash)
  });
  return crypto.createHash('sha256').update(dataString).digest('hex');
};

// ==================== PROPERTY CONTROLLERS ====================

// Register a new property
export const registerProperty = async (req, res) => {
  try {
    const {
      surveyNumber,
      subSurveyNumber,
      location,
      area,
      propertyType,
      landUse,
      marketValue,
      guidanceValue,
      encumbrance,
      notes
    } = req.body;

    // Check if property with same survey number exists in same district
    const existingProperty = await Property.findOne({
      surveyNumber,
      'location.district': location.district
    });

    if (existingProperty) {
      return res.status(400).json({
        success: false,
        message: 'Property with this survey number already exists in this district'
      });
    }

    const property = new Property({
      surveyNumber,
      subSurveyNumber,
      location,
      area,
      propertyType,
      landUse,
      currentOwner: req.user._id,
      ownerName: req.user.name,
      ownerPhone: req.user.phone,
      ownerEmail: req.user.email,
      marketValue: marketValue ? { amount: marketValue, valuationDate: new Date() } : undefined,
      guidanceValue: guidanceValue ? { amount: guidanceValue } : undefined,
      encumbrance,
      status: 'submitted',
      createdBy: req.user._id,
      notes,
      ownershipHistory: [{
        owner: req.user._id,
        ownerName: req.user.name,
        acquiredDate: new Date(),
        transferType: 'original_registration'
      }]
    });

    await property.save();

    // Register property on blockchain
    try {
      if (landRegistryBlockchain.isAvailable()) {
        const blockchainResult = await landRegistryBlockchain.registerProperty(
          {
            propertyId: property.propertyId,
            surveyNumber: property.surveyNumber,
            location: property.location,
            area: property.area,
            propertyType: property.propertyType,
            owner: property.currentOwner
          },
          req.user._id.toString()
        );

        if (blockchainResult) {
          property.blockchain = {
            propertyHash: blockchainResult.propertyHash,
            txHash: blockchainResult.txHash,
            blockNumber: blockchainResult.blockNumber,
            verified: false
          };
          await property.save();
        }
      }
    } catch (blockchainError) {
      console.error('Blockchain registration failed:', blockchainError.message);
      // Continue even if blockchain fails
    }

    res.status(201).json({
      success: true,
      message: 'Property registered successfully',
      data: { property }
    });
  } catch (error) {
    console.error('Register property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering property',
      error: error.message
    });
  }
};

// Get all properties (with filters)
export const getProperties = async (req, res) => {
  try {
    const {
      status,
      district,
      state,
      propertyType,
      owner,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // Build filter query
    if (status) query.status = status;
    if (district) query['location.district'] = { $regex: district, $options: 'i' };
    if (state) query['location.state'] = { $regex: state, $options: 'i' };
    if (propertyType) query.propertyType = propertyType;
    if (owner) query.currentOwner = owner;

    // If user is a citizen, only show their properties
    if (req.user.role.name === 'citizen') {
      query.currentOwner = req.user._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('currentOwner', 'name phone email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Property.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching properties',
      error: error.message
    });
  }
};

// Get single property by ID
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('currentOwner', 'name phone email')
      .populate('ownershipHistory.owner', 'name phone')
      .populate('documents.uploadedBy', 'name')
      .populate('documents.verifiedBy', 'name');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: { property }
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching property',
      error: error.message
    });
  }
};

// Public verify property by propertyId or survey number
export const verifyProperty = async (req, res) => {
  try {
    const { propertyId, surveyNumber, district } = req.query;

    let property;

    if (propertyId) {
      property = await Property.findOne({ propertyId })
        .select('propertyId surveyNumber location area propertyType status ownerName blockchain verificationStatus')
        .lean();
    } else if (surveyNumber && district) {
      property = await Property.findOne({ surveyNumber, 'location.district': district })
        .select('propertyId surveyNumber location area propertyType status ownerName blockchain verificationStatus')
        .lean();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide propertyId or surveyNumber with district'
      });
    }

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found in registry'
      });
    }

    res.json({
      success: true,
      data: {
        property,
        isBlockchainVerified: property.blockchain?.verified || false,
        verificationHash: property.blockchain?.propertyHash
      }
    });
  } catch (error) {
    console.error('Verify property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying property',
      error: error.message
    });
  }
};

// Upload document to property
export const uploadPropertyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType, documentName } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership or official access
    const isOwner = property.currentOwner.toString() === req.user._id.toString();
    const isOfficial = ['land_registry', 'surveyor', 'sub_registrar', 'tehsildar', 'admin', 'super_admin']
      .includes(req.user.role.name);

    if (!isOwner && !isOfficial) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload documents to this property'
      });
    }

    // Upload to Cloudinary
    const result = await cloudinaryService.uploadLandDocument(file.buffer, property.propertyId);

    // Generate document hash
    const documentHash = generateDocumentHash(file.buffer);

    const documentEntry = {
      type: documentType || 'other',
      name: documentName || file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      hash: documentHash,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };

    property.documents.push(documentEntry);
    await property.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        document: documentEntry,
        documentHash
      }
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
};

// Verify property (official action)
export const verifyPropertyByOfficial = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationType, remarks, approved } = req.body;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const userRole = req.user.role.name;

    // Check authorization based on role
    const roleVerificationMapping = {
      'surveyor': 'surveyVerified',
      'sub_registrar': 'documentsVerified',
      'tehsildar': 'titleVerified',
      'land_registry': 'titleVerified'
    };

    if (!roleVerificationMapping[userRole] && !['admin', 'super_admin'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify properties'
      });
    }

    // Update verification status
    const verificationField = verificationType || roleVerificationMapping[userRole];
    if (verificationField) {
      property.verificationStatus[verificationField] = approved;
    }

    // Update verifiedBy based on role
    if (userRole === 'surveyor') {
      property.verifiedBy.surveyor = {
        user: req.user._id,
        date: new Date(),
        remarks
      };
    } else if (userRole === 'sub_registrar') {
      property.verifiedBy.registrar = {
        user: req.user._id,
        date: new Date(),
        remarks
      };
    } else if (userRole === 'tehsildar') {
      property.verifiedBy.tehsildar = {
        user: req.user._id,
        date: new Date(),
        remarks
      };
    }

    // Check if all verifications are complete
    const { documentsVerified, surveyVerified, titleVerified } = property.verificationStatus;
    if (documentsVerified && surveyVerified && titleVerified) {
      property.status = 'verified';
      
      // Generate blockchain hash
      property.blockchain.propertyHash = generatePropertyHash(property);
      property.blockchain.verified = true;

      // Verify property on blockchain
      try {
        if (landRegistryBlockchain.isAvailable()) {
          const blockchainResult = await landRegistryBlockchain.verifyProperty(property.propertyId);
          if (blockchainResult) {
            property.blockchain.verificationTxHash = blockchainResult.txHash;
            property.blockchain.verificationBlockNumber = blockchainResult.blockNumber;
          }
        }
      } catch (blockchainError) {
        console.error('Blockchain verification failed:', blockchainError.message);
      }
    } else if (!approved) {
      property.status = 'rejected';
    }

    await property.save();

    res.json({
      success: true,
      message: `Property ${approved ? 'verified' : 'rejected'} successfully`,
      data: { property }
    });
  } catch (error) {
    console.error('Verify property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying property',
      error: error.message
    });
  }
};

// ==================== TRANSFER CONTROLLERS ====================

// Initiate land transfer
export const initiateTransfer = async (req, res) => {
  try {
    const {
      propertyId,
      buyer,
      transferType,
      saleAmount,
      witnesses,
      agreementDate
    } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if user is the property owner
    if (property.currentOwner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the property owner can initiate a transfer'
      });
    }

    // Check if property is verified
    if (property.status !== 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Property must be verified before transfer'
      });
    }

    // Check if there's an active transfer
    if (property.transferStatus === 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'There is already an active transfer for this property'
      });
    }

    // Calculate stamp duty
    const stampDutyRate = 0.06; // 6% - should be configurable by state
    const stampDutyAmount = Math.round((saleAmount || property.marketValue?.amount || 0) * stampDutyRate);

    const transfer = new LandTransfer({
      property: property._id,
      propertyId: property.propertyId,
      seller: {
        user: req.user._id,
        name: req.user.name,
        phone: req.user.phone,
        email: req.user.email
      },
      buyer,
      transferType,
      saleAmount,
      marketValue: property.marketValue?.amount,
      guidanceValue: property.guidanceValue?.amount,
      financials: {
        stampDuty: { amount: stampDutyAmount },
        registrationFee: { amount: Math.round(stampDutyAmount * 0.167) }, // ~1% of sale
        mutationFee: { amount: 500 } // Fixed fee
      },
      witnesses,
      agreementDate: agreementDate || new Date(),
      currentStage: 'initiated',
      initiatedBy: req.user._id,
      stageHistory: [{
        stage: 'initiated',
        enteredAt: new Date()
      }]
    });

    await transfer.save();

    // Update property transfer status
    property.transferStatus = 'initiated';
    property.activeTransfer = transfer._id;
    await property.save();

    // Record transfer on blockchain
    try {
      if (landRegistryBlockchain.isAvailable()) {
        const blockchainResult = await landRegistryBlockchain.initiateTransfer(
          {
            transferId: transfer.transferId,
            propertyId: property.propertyId,
            transferType: transfer.transferType,
            saleAmount: transfer.saleAmount || 0,
            seller: req.user._id.toString(),
            buyer: buyer.email // Using email as buyer identifier
          },
          req.user._id.toString(),
          buyer.email // Temporary, will be replaced when buyer registers
        );

        if (blockchainResult) {
          transfer.blockchain = {
            transferHash: blockchainResult.transferHash,
            txHash: blockchainResult.txHash,
            blockNumber: blockchainResult.blockNumber
          };
          await transfer.save();
        }
      }
    } catch (blockchainError) {
      console.error('Blockchain transfer initiation failed:', blockchainError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Land transfer initiated successfully',
      data: {
        transfer,
        estimatedFees: {
          stampDuty: stampDutyAmount,
          registrationFee: Math.round(stampDutyAmount * 0.167),
          mutationFee: 500,
          total: stampDutyAmount + Math.round(stampDutyAmount * 0.167) + 500
        }
      }
    });
  } catch (error) {
    console.error('Initiate transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating transfer',
      error: error.message
    });
  }
};

// Get all transfers
export const getTransfers = async (req, res) => {
  try {
    const {
      status,
      stage,
      role, // For officials to see pending approvals
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (stage) query.currentStage = stage;

    const userRole = req.user.role.name;

    // Filter based on user role
    if (userRole === 'citizen') {
      query.$or = [
        { 'seller.user': req.user._id },
        { 'buyer.user': req.user._id }
      ];
    } else if (userRole === 'surveyor') {
      if (role === 'pending') {
        query.currentStage = 'surveyor_verification';
        query.status = 'active';
      }
    } else if (userRole === 'sub_registrar') {
      if (role === 'pending') {
        query.currentStage = 'sub_registrar_review';
        query.status = 'active';
      }
    } else if (userRole === 'tehsildar') {
      if (role === 'pending') {
        query.currentStage = 'tehsildar_approval';
        query.status = 'active';
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transfers, total] = await Promise.all([
      LandTransfer.find(query)
        .populate('property', 'propertyId surveyNumber location area')
        .populate('seller.user', 'name phone')
        .populate('buyer.user', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      LandTransfer.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        transfers,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get transfers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transfers',
      error: error.message
    });
  }
};

// Get single transfer
export const getTransferById = async (req, res) => {
  try {
    const transfer = await LandTransfer.findById(req.params.id)
      .populate('property')
      .populate('seller.user', 'name phone email')
      .populate('buyer.user', 'name phone email')
      .populate('approvals.approvedBy', 'name')
      .populate('documents.uploadedBy', 'name');

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    res.json({
      success: true,
      data: { transfer }
    });
  } catch (error) {
    console.error('Get transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transfer',
      error: error.message
    });
  }
};

// Approve transfer stage (for officials)
export const approveTransferStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, remarks, signature } = req.body;

    const transfer = await LandTransfer.findById(id).populate('property');
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    const userRole = req.user.role.name;

    // Define stage transitions based on role
    const roleStageMapping = {
      'surveyor': {
        currentStage: 'surveyor_verification',
        nextStage: 'sub_registrar_review',
        approvalStage: 'surveyor_approved'
      },
      'sub_registrar': {
        currentStage: 'sub_registrar_review',
        nextStage: 'registration_complete',
        approvalStage: 'sub_registrar_approved'
      },
      'tehsildar': {
        currentStage: 'tehsildar_approval',
        nextStage: 'mutation_completed',
        approvalStage: 'tehsildar_approved'
      }
    };

    const roleConfig = roleStageMapping[userRole];

    if (!roleConfig && !['admin', 'super_admin', 'land_registry'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this transfer stage'
      });
    }

    // Verify current stage matches expected stage for this role
    if (roleConfig && transfer.currentStage !== roleConfig.currentStage) {
      return res.status(400).json({
        success: false,
        message: `Transfer is not at ${roleConfig.currentStage} stage`
      });
    }

    if (approved) {
      // Add approval
      const approval = {
        stage: roleConfig?.approvalStage || 'admin_approved',
        approvedBy: req.user._id,
        approverRole: userRole,
        digitalSignature: signature,
        remarks,
        timestamp: new Date()
      };

      await transfer.addApproval(approval);

      // Advance to next stage
      await transfer.advanceStage(roleConfig?.nextStage || 'transfer_complete', approval);

      // If transfer is complete, update property
      if (transfer.currentStage === 'mutation_completed' || transfer.currentStage === 'transfer_complete') {
        const property = transfer.property;
        
        // Update property owner
        property.ownershipHistory.push({
          owner: transfer.buyer.user,
          ownerName: transfer.buyer.name,
          acquiredDate: new Date(),
          transferType: transfer.transferType,
          saleAmount: transfer.saleAmount,
          transferId: transfer._id
        });

        property.currentOwner = transfer.buyer.user;
        property.ownerName = transfer.buyer.name;
        property.ownerPhone = transfer.buyer.phone;
        property.ownerEmail = transfer.buyer.email;
        property.transferStatus = 'none';
        property.activeTransfer = null;

        await property.save();

        transfer.status = 'completed';
        transfer.completionDate = new Date();
        await transfer.save();

        // Complete transfer on blockchain
        try {
          if (landRegistryBlockchain.isAvailable()) {
            const blockchainResult = await landRegistryBlockchain.completeTransfer(
              transfer.transferId,
              property.propertyId
            );
            if (blockchainResult) {
              transfer.blockchain.completionTxHash = blockchainResult.txHash;
              transfer.blockchain.completionBlockNumber = blockchainResult.blockNumber;
              property.blockchain.lastTransferTxHash = blockchainResult.txHash;
              await transfer.save();
              await property.save();
            }
          }
        } catch (blockchainError) {
          console.error('Blockchain transfer completion failed:', blockchainError.message);
        }
      } else {
        // Update stage on blockchain for intermediate stages
        try {
          if (landRegistryBlockchain.isAvailable()) {
            await landRegistryBlockchain.updateTransferStage(
              transfer.transferId,
              transfer.property.propertyId,
              transfer.currentStage
            );
          }
        } catch (blockchainError) {
          console.error('Blockchain stage update failed:', blockchainError.message);
        }
      }
    } else {
      // Reject transfer
      await transfer.reject(req.user._id, remarks, transfer.currentStage);

      // Update property status
      const property = transfer.property;
      property.transferStatus = 'none';
      property.activeTransfer = null;
      await property.save();
    }

    res.json({
      success: true,
      message: approved ? 'Transfer stage approved successfully' : 'Transfer rejected',
      data: { transfer }
    });
  } catch (error) {
    console.error('Approve transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing transfer approval',
      error: error.message
    });
  }
};

// Update transfer stage (advance workflow)
export const updateTransferStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, paymentInfo, documentInfo } = req.body;

    const transfer = await LandTransfer.findById(id);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    // Validate stage transition
    const validTransitions = {
      'initiated': ['agreement_signed'],
      'agreement_signed': ['stamp_duty_paid'],
      'stamp_duty_paid': ['documents_submitted'],
      'documents_submitted': ['documents_verified'],
      'documents_verified': ['surveyor_verification'],
      'registration_complete': ['mutation_initiated'],
      'mutation_initiated': ['field_verification'],
      'field_verification': ['tehsildar_approval']
    };

    if (!validTransitions[transfer.currentStage]?.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: `Invalid stage transition from ${transfer.currentStage} to ${stage}`
      });
    }

    // Handle specific stage updates
    if (stage === 'stamp_duty_paid' && paymentInfo) {
      transfer.financials.stampDuty.paid = true;
      transfer.financials.stampDuty.paidDate = new Date();
      transfer.financials.stampDuty.receiptNumber = paymentInfo.receiptNumber;
      transfer.financials.stampDuty.receiptUrl = paymentInfo.receiptUrl;
    }

    await transfer.advanceStage(stage);

    res.json({
      success: true,
      message: 'Transfer stage updated successfully',
      data: { transfer }
    });
  } catch (error) {
    console.error('Update transfer stage error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating transfer stage',
      error: error.message
    });
  }
};

// Upload transfer document
export const uploadTransferDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType, documentName } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const transfer = await LandTransfer.findById(id);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    // Upload to Cloudinary
    const result = await cloudinaryService.uploadLandDocument(file.buffer, transfer.transferId);

    // Generate document hash
    const documentHash = generateDocumentHash(file.buffer);

    const documentEntry = {
      type: documentType || 'other',
      name: documentName || file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      hash: documentHash,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };

    transfer.documents.push(documentEntry);
    await transfer.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        document: documentEntry,
        documentHash
      }
    });
  } catch (error) {
    console.error('Upload transfer document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
};

// Cancel transfer
export const cancelTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const transfer = await LandTransfer.findById(id).populate('property');
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    // Only seller or admin can cancel
    const isSeller = transfer.seller.user?.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role.name);

    if (!isSeller && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this transfer'
      });
    }

    await transfer.cancel(req.user._id, reason);

    // Update property status
    const property = transfer.property;
    property.transferStatus = 'none';
    property.activeTransfer = null;
    await property.save();

    res.json({
      success: true,
      message: 'Transfer cancelled successfully',
      data: { transfer }
    });
  } catch (error) {
    console.error('Cancel transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling transfer',
      error: error.message
    });
  }
};

// Get transfer statistics (for dashboard)
export const getTransferStats = async (req, res) => {
  try {
    const userRole = req.user.role.name;

    const stats = await LandTransfer.aggregate([
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byStage: [
            { $match: { status: 'active' } },
            { $group: { _id: '$currentStage', count: { $sum: 1 } } }
          ],
          recent: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            { $project: { transferId: 1, currentStage: 1, status: 1, createdAt: 1 } }
          ]
        }
      }
    ]);

    // Get pending count for current user's role
    let pendingCount = 0;
    const pendingStageMapping = {
      'surveyor': 'surveyor_verification',
      'sub_registrar': 'sub_registrar_review',
      'tehsildar': 'tehsildar_approval'
    };

    if (pendingStageMapping[userRole]) {
      pendingCount = await LandTransfer.countDocuments({
        status: 'active',
        currentStage: pendingStageMapping[userRole]
      });
    }

    res.json({
      success: true,
      data: {
        ...stats[0],
        pendingApprovals: pendingCount
      }
    });
  } catch (error) {
    console.error('Get transfer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

export default {
  // Property
  registerProperty,
  getProperties,
  getPropertyById,
  verifyProperty,
  uploadPropertyDocument,
  verifyPropertyByOfficial,
  
  // Transfer
  initiateTransfer,
  getTransfers,
  getTransferById,
  approveTransferStage,
  updateTransferStage,
  uploadTransferDocument,
  cancelTransfer,
  getTransferStats
};
