// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AuditTrail
 * @dev Immutable audit trail for all system operations
 * @notice Records every critical action in the system with tamper-proof logs
 */
contract AuditTrail is AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    enum ActionType {
        USER_CREATED,
        USER_UPDATED,
        USER_DELETED,
        COMPLAINT_CREATED,
        COMPLAINT_UPDATED,
        COMPLAINT_ASSIGNED,
        COMPLAINT_RESOLVED,
        DEPARTMENT_CREATED,
        ROLE_ASSIGNED,
        PERMISSION_CHANGED,
        DATA_ACCESSED,
        SYSTEM_CONFIG_CHANGED
    }

    struct AuditEntry {
        uint256 id;
        ActionType actionType;
        address performer;        // Who performed the action
        string entityId;          // ID of affected entity (user, complaint, etc.)
        bytes32 dataHash;         // Hash of action data
        uint256 timestamp;
        string description;
        bytes32 previousHash;     // Hash of previous audit entry (chain integrity)
        bool exists;
    }

    // Audit entry ID => Audit Entry
    mapping(uint256 => AuditEntry) public auditEntries;
    
    // Entity ID => Audit Entry IDs
    mapping(string => uint256[]) public entityAuditHistory;
    
    // Performer address => Audit Entry IDs
    mapping(address => uint256[]) public performerAuditHistory;
    
    // Total audit entries
    uint256 public totalAuditEntries;
    
    // Hash of last audit entry (for chain integrity)
    bytes32 public lastAuditHash;

    // Events
    event AuditRecorded(
        uint256 indexed id,
        ActionType actionType,
        address indexed performer,
        string entityId,
        bytes32 dataHash,
        uint256 timestamp
    );

    event ChainIntegrityVerified(
        uint256 indexed entryId,
        bytes32 currentHash,
        bytes32 previousHash
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }

    /**
     * @dev Record an audit entry
     * @param actionType Type of action performed
     * @param entityId ID of the affected entity
     * @param dataHash Hash of the action data
     * @param description Human-readable description
     */
    function recordAudit(
        ActionType actionType,
        string memory entityId,
        bytes32 dataHash,
        string memory description
    ) external onlyRole(AUDITOR_ROLE) whenNotPaused returns (uint256) {
        require(dataHash != bytes32(0), "Invalid data hash");
        require(bytes(entityId).length > 0, "Invalid entity ID");

        uint256 entryId = totalAuditEntries + 1;

        // Create audit entry with chain integrity
        AuditEntry memory entry = AuditEntry({
            id: entryId,
            actionType: actionType,
            performer: tx.origin, // Actual transaction initiator
            entityId: entityId,
            dataHash: dataHash,
            timestamp: block.timestamp,
            description: description,
            previousHash: lastAuditHash,
            exists: true
        });

        auditEntries[entryId] = entry;
        entityAuditHistory[entityId].push(entryId);
        performerAuditHistory[tx.origin].push(entryId);

        // Update chain hash
        lastAuditHash = keccak256(
            abi.encodePacked(
                entryId,
                uint256(actionType),
                tx.origin,
                entityId,
                dataHash,
                block.timestamp,
                lastAuditHash
            )
        );

        totalAuditEntries = entryId;

        emit AuditRecorded(
            entryId,
            actionType,
            tx.origin,
            entityId,
            dataHash,
            block.timestamp
        );

        return entryId;
    }

    /**
     * @dev Verify audit chain integrity
     * @param entryId Audit entry to verify
     * @return bool True if chain is intact
     */
    function verifyChainIntegrity(uint256 entryId)
        external
        view
        returns (bool)
    {
        require(auditEntries[entryId].exists, "Audit entry not found");
        
        if (entryId == 1) {
            return true; // First entry, no previous hash
        }

        AuditEntry memory entry = auditEntries[entryId];
        AuditEntry memory previousEntry = auditEntries[entryId - 1];

        bytes32 expectedPreviousHash = keccak256(
            abi.encodePacked(
                previousEntry.id,
                uint256(previousEntry.actionType),
                previousEntry.performer,
                previousEntry.entityId,
                previousEntry.dataHash,
                previousEntry.timestamp,
                previousEntry.previousHash
            )
        );

        return entry.previousHash == expectedPreviousHash;
    }

    /**
     * @dev Get audit entry details
     */
    function getAuditEntry(uint256 entryId)
        external
        view
        returns (
            ActionType actionType,
            address performer,
            string memory entityId,
            bytes32 dataHash,
            uint256 timestamp,
            string memory description
        )
    {
        require(auditEntries[entryId].exists, "Audit entry not found");
        AuditEntry memory entry = auditEntries[entryId];
        return (
            entry.actionType,
            entry.performer,
            entry.entityId,
            entry.dataHash,
            entry.timestamp,
            entry.description
        );
    }

    /**
     * @dev Get entity's audit history
     */
    function getEntityAuditHistory(string memory entityId)
        external
        view
        returns (uint256[] memory)
    {
        return entityAuditHistory[entityId];
    }

    /**
     * @dev Get performer's audit history
     */
    function getPerformerAuditHistory(address performer)
        external
        view
        returns (uint256[] memory)
    {
        return performerAuditHistory[performer];
    }

    /**
     * @dev Get total audit entries count
     */
    function getTotalAuditEntries() external view returns (uint256) {
        return totalAuditEntries;
    }

    /**
     * @dev Grant auditor role (admin only)
     */
    function addAuditor(address account) external onlyRole(ADMIN_ROLE) {
        grantRole(AUDITOR_ROLE, account);
    }

    /**
     * @dev Revoke auditor role (admin only)
     */
    function removeAuditor(address account) external onlyRole(ADMIN_ROLE) {
        revokeRole(AUDITOR_ROLE, account);
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

    /**
     * @dev Verify data integrity
     * @param entryId Audit entry ID
     * @param dataHash Hash to verify
     * @return bool True if hash matches
     */
    function verifyDataIntegrity(uint256 entryId, bytes32 dataHash)
        external
        view
        returns (bool)
    {
        require(auditEntries[entryId].exists, "Audit entry not found");
        return auditEntries[entryId].dataHash == dataHash;
    }
}
