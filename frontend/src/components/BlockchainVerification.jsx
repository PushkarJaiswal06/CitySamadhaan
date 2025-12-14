import React, { useState } from 'react';
import { Check, AlertCircle, ExternalLink, Shield } from 'lucide-react';

const BlockchainVerification = ({ complaint }) => {
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  if (!complaint.blockchainHash) {
    return null; // Don't show if not anchored on blockchain
  }

  const getBlockchainExplorerUrl = (txHash) => {
    // Determine network from environment or default to Sepolia
    const network = import.meta.env.VITE_BLOCKCHAIN_NETWORK || 'sepolia';
    
    if (network === 'sepolia') {
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    } else if (network === 'mainnet') {
      return `https://etherscan.io/tx/${txHash}`;
    }
    return null;
  };

  const verifyComplaint = async () => {
    setVerifying(true);
    try {
      const response = await fetch(`/api/complaints/${complaint._id}/verify-blockchain`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      setVerificationResult(data);
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationResult({ verified: false, error: 'Failed to verify' });
    } finally {
      setVerifying(false);
    }
  };

  const explorerUrl = getBlockchainExplorerUrl(complaint.blockchainHash);

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <div>
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              Blockchain Verified
              <Check className="h-4 w-4 text-green-600" />
            </h4>
            <p className="text-xs text-gray-600 mt-1">
              This complaint is immutably recorded on Ethereum blockchain
            </p>
          </div>
        </div>
        
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors"
          >
            View on Etherscan
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Transaction Hash:</span>
          <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 font-mono">
            {complaint.blockchainHash.slice(0, 10)}...{complaint.blockchainHash.slice(-8)}
          </code>
        </div>
        
        {complaint.blockchainDataHash && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Data Hash:</span>
            <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 font-mono">
              {complaint.blockchainDataHash.slice(0, 10)}...{complaint.blockchainDataHash.slice(-8)}
            </code>
          </div>
        )}

        <button
          onClick={verifyComplaint}
          disabled={verifying}
          className="mt-2 w-full px-3 py-2 bg-white border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {verifying ? 'Verifying...' : 'Verify Data Integrity'}
        </button>

        {verificationResult && (
          <div className={`mt-2 p-2 rounded-md text-sm ${
            verificationResult.verified 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {verificationResult.verified ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="font-medium">Verified: Data integrity confirmed</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Verification failed: Data may have been tampered</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-blue-200">
        <p className="text-xs text-gray-500 leading-relaxed">
          <strong>Why blockchain?</strong> Once recorded on the blockchain, this complaint data cannot be altered or deleted by anyone, ensuring complete transparency and accountability in the civic complaint resolution process.
        </p>
      </div>
    </div>
  );
};

export default BlockchainVerification;
