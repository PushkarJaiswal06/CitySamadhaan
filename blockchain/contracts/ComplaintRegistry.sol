// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ComplaintRegistry
 * @dev Immutable registry for civic complaints on Ethereum blockchain
 * @notice This contract anchors complaint data ensuring tamper-proof records
 */
contract ComplaintRegistry is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    struct Complaint {
        string complaintId;      // Off-chain complaint ID (e.g., CMP001234)
        bytes32 dataHash;        // Keccak256 hash of complaint data
        address citizen;         // Citizen's Ethereum address (optional)
        uint256 timestamp;       // Block timestamp
        string status;           // Current status
        string department;       // Department code
        bool exists;             // Check if complaint exists
    }

    struct StatusUpdate {
        string status;
        bytes32 updateHash;      // Hash of update data
        address updatedBy;
        uint256 timestamp;
        string comment;
    }

    // Complaint ID => Complaint
    mapping(string => Complaint) public complaints;
    
    // Complaint ID => Status Updates
    mapping(string => StatusUpdate[]) public complaintUpdates;
    
    // Citizen address => Complaint IDs
    mapping(address => string[]) public citizenComplaints;
    
    // Total complaints registered
    uint256 public totalComplaints;
    
    // All complaint IDs
    string[] public allComplaintIds;

    // Events
    event ComplaintRegistered(
        string indexed complaintId,
        bytes32 dataHash,
        address indexed citizen,
        string department,
        uint256 timestamp
    );

    event StatusUpdated(
        string indexed complaintId,
        string status,
        bytes32 updateHash,
        address indexed updatedBy,
        uint256 timestamp
    );

    event ComplaintResolved(
        string indexed complaintId,
        bytes32 resolutionHash,
        address indexed resolvedBy,
        uint256 timestamp
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    /**
     * @dev Register a new complaint on blockchain
     * @param complaintId Unique complaint identifier
     * @param dataHash Keccak256 hash of complaint data
     * @param citizen Citizen's address (can be zero address)
     * @param department Department code
     */
    function registerComplaint(
        string memory complaintId,
        bytes32 dataHash,
        address citizen,
        string memory department
    ) external onlyRole(OPERATOR_ROLE) whenNotPaused nonReentrant {
        require(!complaints[complaintId].exists, "Complaint already registered");
        require(dataHash != bytes32(0), "Invalid data hash");
        require(bytes(complaintId).length > 0, "Invalid complaint ID");

        complaints[complaintId] = Complaint({
            complaintId: complaintId,
            dataHash: dataHash,
            citizen: citizen,
            timestamp: block.timestamp,
            status: "pending",
            department: department,
            exists: true
        });

        allComplaintIds.push(complaintId);
        
        if (citizen != address(0)) {
            citizenComplaints[citizen].push(complaintId);
        }

        totalComplaints++;

        emit ComplaintRegistered(
            complaintId,
            dataHash,
            citizen,
            department,
            block.timestamp
        );
    }

    /**
     * @dev Update complaint status
     * @param complaintId Complaint identifier
     * @param newStatus New status
     * @param updateHash Hash of update data
     * @param comment Optional comment
     */
    function updateStatus(
        string memory complaintId,
        string memory newStatus,
        bytes32 updateHash,
        string memory comment
    ) external onlyRole(OPERATOR_ROLE) whenNotPaused {
        require(complaints[complaintId].exists, "Complaint not found");
        require(updateHash != bytes32(0), "Invalid update hash");

        complaints[complaintId].status = newStatus;

        StatusUpdate memory update = StatusUpdate({
            status: newStatus,
            updateHash: updateHash,
            updatedBy: msg.sender,
            timestamp: block.timestamp,
            comment: comment
        });

        complaintUpdates[complaintId].push(update);

        emit StatusUpdated(
            complaintId,
            newStatus,
            updateHash,
            msg.sender,
            block.timestamp
        );

        // Emit resolved event if status is resolved
        if (keccak256(bytes(newStatus)) == keccak256(bytes("resolved"))) {
            emit ComplaintResolved(
                complaintId,
                updateHash,
                msg.sender,
                block.timestamp
            );
        }
    }

    /**
     * @dev Verify complaint data integrity
     * @param complaintId Complaint identifier
     * @param dataHash Hash to verify against
     * @return bool True if hash matches
     */
    function verifyComplaint(
        string memory complaintId,
        bytes32 dataHash
    ) external view returns (bool) {
        require(complaints[complaintId].exists, "Complaint not found");
        return complaints[complaintId].dataHash == dataHash;
    }

    /**
     * @dev Get complaint details
     */
    function getComplaint(string memory complaintId)
        external
        view
        returns (
            bytes32 dataHash,
            address citizen,
            uint256 timestamp,
            string memory status,
            string memory department
        )
    {
        require(complaints[complaintId].exists, "Complaint not found");
        Complaint memory c = complaints[complaintId];
        return (c.dataHash, c.citizen, c.timestamp, c.status, c.department);
    }

    /**
     * @dev Get complaint status history
     */
    function getStatusHistory(string memory complaintId)
        external
        view
        returns (StatusUpdate[] memory)
    {
        require(complaints[complaintId].exists, "Complaint not found");
        return complaintUpdates[complaintId];
    }

    /**
     * @dev Get citizen's complaints
     */
    function getCitizenComplaints(address citizen)
        external
        view
        returns (string[] memory)
    {
        return citizenComplaints[citizen];
    }

    /**
     * @dev Get total complaints count
     */
    function getTotalComplaints() external view returns (uint256) {
        return totalComplaints;
    }

    /**
     * @dev Grant operator role (admin only)
     */
    function addOperator(address account) external onlyRole(ADMIN_ROLE) {
        grantRole(OPERATOR_ROLE, account);
    }

    /**
     * @dev Revoke operator role (admin only)
     */
    function removeOperator(address account) external onlyRole(ADMIN_ROLE) {
        revokeRole(OPERATOR_ROLE, account);
    }

    /**
     * @dev Pause contract (emergency stop)
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
