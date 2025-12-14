// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LandRegistry
 * @dev Smart contract for immutable land registry records on blockchain
 * Stores property hashes, ownership records, and transfer history
 */
contract LandRegistry {
    // Property structure on blockchain
    struct Property {
        string propertyId;          // Unique property ID (e.g., PROP-MH-PUN-2024-000001)
        bytes32 propertyHash;       // Hash of complete property details
        address currentOwner;       // Ethereum address of current owner
        uint256 registrationDate;   // Timestamp of registration
        bool isVerified;            // Verification status
        bool isActive;              // Active status
    }

    // Transfer structure on blockchain
    struct Transfer {
        string transferId;          // Unique transfer ID (e.g., LT-2024-00000001)
        string propertyId;          // Associated property ID
        bytes32 transferHash;       // Hash of transfer details
        address seller;             // Seller's Ethereum address
        address buyer;              // Buyer's Ethereum address
        uint256 saleAmount;         // Sale amount in Wei
        uint256 transferDate;       // Timestamp of transfer
        string stage;               // Current stage of transfer
        bool isCompleted;           // Transfer completion status
    }

    // Document verification structure
    struct Document {
        bytes32 documentHash;       // SHA-256 hash of document
        string documentType;        // Type of document
        uint256 uploadDate;         // Timestamp of upload
        address uploadedBy;         // Address of uploader
        bool isVerified;            // Verification status
    }

    // State variables
    mapping(string => Property) public properties;              // propertyId => Property
    mapping(string => Transfer[]) public propertyTransfers;     // propertyId => Transfer history
    mapping(string => Document[]) public propertyDocuments;     // propertyId => Documents
    mapping(bytes32 => bool) public documentExists;             // documentHash => exists
    mapping(address => string[]) public ownerProperties;        // owner => propertyIds
    
    string[] public allPropertyIds;                             // Array of all property IDs
    
    // Contract owner
    address public admin;
    
    // Authorized verifiers (government officials)
    mapping(address => bool) public authorizedVerifiers;
    mapping(address => string) public verifierRoles;            // address => role (surveyor, registrar, tehsildar)
    
    // Events
    event PropertyRegistered(
        string indexed propertyId,
        bytes32 propertyHash,
        address indexed owner,
        uint256 timestamp
    );
    
    event PropertyVerified(
        string indexed propertyId,
        address indexed verifier,
        string role,
        uint256 timestamp
    );
    
    event TransferInitiated(
        string indexed transferId,
        string indexed propertyId,
        address indexed seller,
        address buyer,
        uint256 saleAmount,
        uint256 timestamp
    );
    
    event TransferCompleted(
        string indexed transferId,
        string indexed propertyId,
        address indexed newOwner,
        uint256 timestamp
    );
    
    event TransferStageUpdated(
        string indexed transferId,
        string stage,
        uint256 timestamp
    );
    
    event DocumentAdded(
        string indexed propertyId,
        bytes32 documentHash,
        string documentType,
        uint256 timestamp
    );
    
    event OwnershipTransferred(
        string indexed propertyId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender], "Not an authorized verifier");
        _;
    }
    
    modifier propertyExists(string memory _propertyId) {
        require(properties[_propertyId].registrationDate != 0, "Property does not exist");
        _;
    }
    
    // Constructor
    constructor() {
        admin = msg.sender;
        authorizedVerifiers[msg.sender] = true;
        verifierRoles[msg.sender] = "admin";
    }
    
    /**
     * @dev Add authorized verifier
     */
    function addVerifier(address _verifier, string memory _role) external onlyAdmin {
        authorizedVerifiers[_verifier] = true;
        verifierRoles[_verifier] = _role;
    }
    
    /**
     * @dev Remove authorized verifier
     */
    function removeVerifier(address _verifier) external onlyAdmin {
        authorizedVerifiers[_verifier] = false;
        delete verifierRoles[_verifier];
    }
    
    /**
     * @dev Register a new property on blockchain
     */
    function registerProperty(
        string memory _propertyId,
        bytes32 _propertyHash,
        address _owner
    ) external onlyVerifier returns (bool) {
        require(properties[_propertyId].registrationDate == 0, "Property already registered");
        require(_owner != address(0), "Invalid owner address");
        
        Property memory newProperty = Property({
            propertyId: _propertyId,
            propertyHash: _propertyHash,
            currentOwner: _owner,
            registrationDate: block.timestamp,
            isVerified: false,
            isActive: true
        });
        
        properties[_propertyId] = newProperty;
        allPropertyIds.push(_propertyId);
        ownerProperties[_owner].push(_propertyId);
        
        emit PropertyRegistered(_propertyId, _propertyHash, _owner, block.timestamp);
        return true;
    }
    
    /**
     * @dev Verify property by authorized official
     */
    function verifyProperty(string memory _propertyId) 
        external 
        onlyVerifier 
        propertyExists(_propertyId) 
        returns (bool) 
    {
        properties[_propertyId].isVerified = true;
        
        emit PropertyVerified(
            _propertyId,
            msg.sender,
            verifierRoles[msg.sender],
            block.timestamp
        );
        return true;
    }
    
    /**
     * @dev Add document hash to property
     */
    function addDocument(
        string memory _propertyId,
        bytes32 _documentHash,
        string memory _documentType
    ) external propertyExists(_propertyId) returns (bool) {
        require(!documentExists[_documentHash], "Document already exists");
        
        Document memory newDoc = Document({
            documentHash: _documentHash,
            documentType: _documentType,
            uploadDate: block.timestamp,
            uploadedBy: msg.sender,
            isVerified: false
        });
        
        propertyDocuments[_propertyId].push(newDoc);
        documentExists[_documentHash] = true;
        
        emit DocumentAdded(_propertyId, _documentHash, _documentType, block.timestamp);
        return true;
    }
    
    /**
     * @dev Initiate property transfer
     */
    function initiateTransfer(
        string memory _transferId,
        string memory _propertyId,
        address _seller,
        address _buyer,
        uint256 _saleAmount,
        bytes32 _transferHash
    ) external propertyExists(_propertyId) returns (bool) {
        require(_buyer != address(0), "Invalid buyer address");
        require(properties[_propertyId].currentOwner == _seller, "Seller is not the owner");
        
        Transfer memory newTransfer = Transfer({
            transferId: _transferId,
            propertyId: _propertyId,
            transferHash: _transferHash,
            seller: _seller,
            buyer: _buyer,
            saleAmount: _saleAmount,
            transferDate: block.timestamp,
            stage: "initiated",
            isCompleted: false
        });
        
        propertyTransfers[_propertyId].push(newTransfer);
        
        emit TransferInitiated(
            _transferId,
            _propertyId,
            _seller,
            _buyer,
            _saleAmount,
            block.timestamp
        );
        return true;
    }
    
    /**
     * @dev Update transfer stage
     */
    function updateTransferStage(
        string memory _transferId,
        string memory _propertyId,
        string memory _stage
    ) external onlyVerifier propertyExists(_propertyId) returns (bool) {
        Transfer[] storage transfers = propertyTransfers[_propertyId];
        
        for (uint i = 0; i < transfers.length; i++) {
            if (keccak256(bytes(transfers[i].transferId)) == keccak256(bytes(_transferId))) {
                transfers[i].stage = _stage;
                
                emit TransferStageUpdated(_transferId, _stage, block.timestamp);
                return true;
            }
        }
        
        revert("Transfer not found");
    }
    
    /**
     * @dev Complete property transfer and update ownership
     */
    function completeTransfer(
        string memory _transferId,
        string memory _propertyId
    ) external onlyVerifier propertyExists(_propertyId) returns (bool) {
        Property storage property = properties[_propertyId];
        Transfer[] storage transfers = propertyTransfers[_propertyId];
        
        for (uint i = 0; i < transfers.length; i++) {
            if (keccak256(bytes(transfers[i].transferId)) == keccak256(bytes(_transferId))) {
                require(!transfers[i].isCompleted, "Transfer already completed");
                
                address previousOwner = property.currentOwner;
                address newOwner = transfers[i].buyer;
                
                // Update transfer status
                transfers[i].isCompleted = true;
                transfers[i].stage = "completed";
                
                // Update property ownership
                property.currentOwner = newOwner;
                
                // Update owner properties mapping
                ownerProperties[newOwner].push(_propertyId);
                
                emit TransferCompleted(_transferId, _propertyId, newOwner, block.timestamp);
                emit OwnershipTransferred(_propertyId, previousOwner, newOwner, block.timestamp);
                return true;
            }
        }
        
        revert("Transfer not found");
    }
    
    /**
     * @dev Get property details
     */
    function getProperty(string memory _propertyId) 
        external 
        view 
        propertyExists(_propertyId) 
        returns (
            string memory propertyId,
            bytes32 propertyHash,
            address currentOwner,
            uint256 registrationDate,
            bool isVerified,
            bool isActive
        ) 
    {
        Property memory prop = properties[_propertyId];
        return (
            prop.propertyId,
            prop.propertyHash,
            prop.currentOwner,
            prop.registrationDate,
            prop.isVerified,
            prop.isActive
        );
    }
    
    /**
     * @dev Get property transfer history
     */
    function getTransferHistory(string memory _propertyId) 
        external 
        view 
        propertyExists(_propertyId) 
        returns (Transfer[] memory) 
    {
        return propertyTransfers[_propertyId];
    }
    
    /**
     * @dev Get property documents
     */
    function getPropertyDocuments(string memory _propertyId) 
        external 
        view 
        propertyExists(_propertyId) 
        returns (Document[] memory) 
    {
        return propertyDocuments[_propertyId];
    }
    
    /**
     * @dev Verify document hash exists
     */
    function verifyDocumentHash(bytes32 _documentHash) external view returns (bool) {
        return documentExists[_documentHash];
    }
    
    /**
     * @dev Get properties owned by address
     */
    function getPropertiesByOwner(address _owner) external view returns (string[] memory) {
        return ownerProperties[_owner];
    }
    
    /**
     * @dev Get total number of properties
     */
    function getTotalProperties() external view returns (uint256) {
        return allPropertyIds.length;
    }
    
    /**
     * @dev Get all property IDs (paginated)
     */
    function getAllPropertyIds(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (string[] memory) 
    {
        require(_offset < allPropertyIds.length, "Offset out of bounds");
        
        uint256 end = _offset + _limit;
        if (end > allPropertyIds.length) {
            end = allPropertyIds.length;
        }
        
        string[] memory result = new string[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = allPropertyIds[i];
        }
        
        return result;
    }
}
