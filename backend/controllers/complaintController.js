import Complaint from '../models/Complaint.js';
import Department from '../models/Department.js';
import ComplaintCategory from '../models/ComplaintCategory.js';
import User from '../models/User.js';
import msg91Service from '../services/msg91Service.js';
import cloudinaryService from '../services/cloudinaryService.js';
import blockchainService from '../services/blockchainService.js';

// @desc    Create new complaint
// @route   POST /api/complaints
export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, departmentId, location, priority, source = 'web', language = 'en', media = [] } = req.body;

    // Get department and category
    const department = await Department.findById(departmentId);
    const categoryDoc = await ComplaintCategory.findById(category);

    if (!department || !categoryDoc) {
      return res.status(404).json({
        success: false,
        message: 'Department or category not found'
      });
    }

    // Create complaint
    const complaint = await Complaint.create({
      citizen: req.user._id,
      department: departmentId,
      category,
      title,
      description,
      location,
      priority: priority || categoryDoc.defaultPriority,
      source,
      language,
      status: 'pending',
      media: media || []
    });

    // Anchor complaint on blockchain
    try {
      const blockchainData = await blockchainService.registerComplaint({
        complaintId: complaint.complaintId,
        citizen: req.user._id.toString(),
        citizenAddress: req.user.walletAddress || undefined,
        title: complaint.title,
        description: complaint.description,
        department: department.code,
        category: categoryDoc.code,
        location: complaint.location,
        createdAt: complaint.createdAt
      });

      if (blockchainData) {
        complaint.blockchainHash = blockchainData.transactionHash;
        complaint.blockchainDataHash = blockchainData.dataHash;
        await complaint.save();
        
        console.log(`✅ Complaint ${complaint.complaintId} anchored on blockchain: ${blockchainData.transactionHash}`);
      }
    } catch (blockchainError) {
      console.error('Blockchain anchoring failed (non-critical):', blockchainError.message);
      // Continue without blockchain - it's not critical for complaint creation
    }

    // Increment department counter
    await department.incrementComplaintCount();

    // Send SMS notification to citizen
    await msg91Service.sendComplaintConfirmation(
      req.user.phone,
      complaint.complaintId,
      categoryDoc.name
    );

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('citizen', 'name phone')
      .populate('department', 'name code')
      .populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'Complaint registered successfully',
      data: populatedComplaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create complaint'
    });
  }
};

// @desc    Get all complaints (with filters)
// @route   GET /api/complaints
export const getComplaints = async (req, res) => {
  try {
    const { status, department, priority, page = 1, limit = 20, search } = req.query;
    const userRole = req.user.role.name;

    // Build query based on role
    let query = {};

    if (userRole === 'citizen') {
      query.citizen = req.user._id;
    } else if (userRole === 'department_officer' || userRole === 'department_head') {
      if (req.user.department) {
        query.department = req.user.department._id;
      }
    } else if (userRole === 'field_worker') {
      query.assignedTo = req.user._id;
    }

    // Apply filters
    if (status) query.status = status;
    if (department) query.department = department;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { complaintId: new RegExp(search, 'i') },
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Complaint.countDocuments(query);

    const complaints = await Complaint.find(query)
      .populate('citizen', 'name phone')
      .populate('department', 'name code')
      .populate('category', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    res.json({
      success: true,
      data: {
        complaints,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints'
    });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
export const getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizen', 'name phone email address')
      .populate('department', 'name code contactEmail contactPhone')
      .populate('category', 'name description')
      .populate('assignedTo', 'name phone')
      .populate('updates.updatedBy', 'name')
      .populate('resolution.resolvedBy', 'name');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check SLA breach
    complaint.checkSLABreach();
    await complaint.save();

    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint'
    });
  }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, comment, resolutionNote } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Add update to history
    await complaint.addUpdate(req.user._id, status, comment);

    // Anchor status update on blockchain
    try {
      const blockchainData = await blockchainService.updateComplaintStatus(
        complaint.complaintId,
        {
          status: status,
          comment: comment || '',
          updatedBy: req.user._id.toString(),
          timestamp: new Date().toISOString()
        }
      );

      if (blockchainData) {
        console.log(`✅ Status update for ${complaint.complaintId} anchored: ${blockchainData.transactionHash}`);
      }
      
      // Record audit trail
      await blockchainService.recordAudit({
        actionType: 'COMPLAINT_UPDATED',
        entityId: complaint.complaintId,
        description: `Status changed to ${status} by ${req.user.name || req.user.email}`
      });
    } catch (blockchainError) {
      console.error('Blockchain status update failed (non-critical):', blockchainError.message);
    }

    // If resolved, add resolution
    if (status === 'resolved' && resolutionNote) {
      complaint.resolution.resolutionNote = resolutionNote;
      
      // Record resolution on blockchain
      try {
        await blockchainService.recordAudit({
          actionType: 'COMPLAINT_RESOLVED',
          entityId: complaint.complaintId,
          description: `Complaint resolved: ${resolutionNote}`
        });
      } catch (err) {
        console.error('Failed to record resolution on blockchain:', err.message);
      }
    }

    // Send SMS to citizen
    const citizen = await User.findById(complaint.citizen);
    if (citizen) {
      await msg91Service.sendStatusUpdate(
        citizen.phone,
        complaint.complaintId,
        status
      );
    }

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('citizen', 'name phone')
      .populate('department', 'name')
      .populate('assignedTo', 'name');

    res.json({
      success: true,
      message: 'Complaint status updated',
      data: updatedComplaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint'
    });
  }
};

// @desc    Assign complaint to user
// @route   PATCH /api/complaints/:id/assign
export const assignComplaint = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.assignedTo = assignedTo;
    complaint.status = 'assigned';
    await complaint.save();

    await complaint.addUpdate(req.user._id, 'assigned', `Assigned to field worker`);

    res.json({
      success: true,
      message: 'Complaint assigned successfully',
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to assign complaint'
    });
  }
};

// @desc    Get complaint statistics
// @route   GET /api/complaints/stats
export const getComplaintStats = async (req, res) => {
  try {
    const userRole = req.user.role.name;
    let matchQuery = {};

    // Filter by department for dept users
    if (userRole === 'department_officer' || userRole === 'department_head') {
      if (req.user.department) {
        matchQuery.department = req.user.department._id;
      }
    }

    const stats = await Complaint.aggregate([
      { $match: matchQuery },
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byPriority: [
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ],
          byDepartment: [
            {
              $group: {
                _id: '$department',
                count: { $sum: 1 }
              }
            },
            {
              $lookup: {
                from: 'departments',
                localField: '_id',
                foreignField: '_id',
                as: 'dept'
              }
            },
            { $unwind: '$dept' },
            {
              $project: {
                name: '$dept.name',
                count: 1
              }
            }
          ],
          total: [
            { $count: 'count' }
          ],
          slaBreached: [
            { $match: { 'sla.breached': true } },
            { $count: 'count' }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};

// @desc    Upload complaint image
// @route   POST /api/complaints/upload-image
export const uploadComplaintImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const result = await cloudinaryService.uploadImage(req.file.buffer, {
      folder: 'complaints',
      resource_type: 'image'
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image'
    });
  }
};

// @desc    Add feedback/rating to complaint
// @route   POST /api/complaints/:id/feedback
export const addComplaintFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user is the complaint owner
    if (complaint.citizen.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only rate your own complaints'
      });
    }

    // Check if complaint is resolved or closed
    if (complaint.status !== 'resolved' && complaint.status !== 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate resolved or closed complaints'
      });
    }

    // Add feedback
    complaint.feedback = {
      rating,
      comment,
      submittedAt: new Date()
    };

    await complaint.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add feedback'
    });
  }
};

// @desc    Verify complaint on blockchain
// @route   GET /api/complaints/:id/verify-blockchain
export const verifyComplaintBlockchain = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizen', 'name email')
      .populate('department', 'name code')
      .populate('category', 'name code');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if complaint is anchored on blockchain
    if (!complaint.blockchainHash) {
      return res.status(400).json({
        success: false,
        message: 'Complaint not anchored on blockchain',
        verified: false
      });
    }

    // Verify complaint data integrity
    const verificationResult = await blockchainService.verifyComplaint(
      complaint.complaintId,
      {
        complaintId: complaint.complaintId,
        citizen: complaint.citizen._id.toString(),
        title: complaint.title,
        description: complaint.description,
        department: complaint.department.code,
        category: complaint.category.code,
        location: complaint.location,
        createdAt: complaint.createdAt
      }
    );

    // Get blockchain data
    const blockchainData = await blockchainService.getComplaintFromChain(complaint.complaintId);
    
    // Get status history from blockchain
    const statusHistory = await blockchainService.getStatusHistory(complaint.complaintId);

    res.json({
      success: true,
      verified: verificationResult?.verified || false,
      data: {
        complaintId: complaint.complaintId,
        transactionHash: complaint.blockchainHash,
        dataHash: complaint.blockchainDataHash,
        explorerUrl: blockchainService.getTransactionUrl(complaint.blockchainHash),
        blockchainData: blockchainData,
        statusHistory: statusHistory,
        verificationTimestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Blockchain verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify complaint on blockchain',
      verified: false
    });
  }
};
