import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  CheckBadgeIcon,
  XCircleIcon,
  MapPinIcon,
  CubeTransparentIcon,
  DocumentTextIcon,
  UserIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { verifyProperty } from '../../services/landService';

export default function PropertyVerification() {
  const [searchParams] = useSearchParams();
  const [searchType, setSearchType] = useState('propertyId');
  const [propertyId, setPropertyId] = useState('');
  const [surveyNumber, setSurveyNumber] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  // Check for query params on load
  useEffect(() => {
    const propId = searchParams.get('propertyId');
    const survNum = searchParams.get('surveyNumber');
    
    if (propId) {
      setPropertyId(propId);
      setSearchType('propertyId');
      handleSearch(null, 'propertyId', propId);
    } else if (survNum) {
      setSurveyNumber(survNum);
      setSearchType('surveyNumber');
    }
  }, [searchParams]);

  const handleSearch = async (e, type = searchType, id = propertyId) => {
    if (e) e.preventDefault();
    setError('');
    setResult(null);
    setSearched(true);
    setLoading(true);

    try {
      let params = {};
      if (type === 'propertyId') {
        if (!id.trim()) {
          setError('Please enter a Property ID');
          setLoading(false);
          return;
        }
        params = { propertyId: id.trim() };
      } else {
        if (!surveyNumber.trim() || !district.trim()) {
          setError('Please enter both Survey Number and District');
          setLoading(false);
          return;
        }
        params = { surveyNumber: surveyNumber.trim(), district: district.trim() };
      }

      const response = await verifyProperty(params);
      
      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.message || 'Property not found');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.response?.data?.message || 'Property not found in registry');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'verified': 'bg-green-500',
      'submitted': 'bg-yellow-500',
      'under_verification': 'bg-blue-500',
      'rejected': 'bg-red-500',
      'draft': 'bg-gray-500',
      'dispute': 'bg-orange-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const formatArea = (area) => {
    if (!area) return 'N/A';
    const units = {
      'sq_feet': 'sq. ft.',
      'sq_meters': 'sq. m.',
      'acres': 'acres',
      'hectares': 'hectares',
      'guntha': 'guntha',
      'cents': 'cents'
    };
    return `${area.value?.toLocaleString() || 0} ${units[area.unit] || area.unit}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/land"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Land Registry
          </Link>
          
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <MagnifyingGlassIcon className="h-10 w-10 text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Verify Property</h1>
          <p className="text-slate-400">
            Check the authenticity of any registered property
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-8">
          <div className="flex space-x-4 mb-6">
            <button
              type="button"
              onClick={() => setSearchType('propertyId')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                searchType === 'propertyId'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Search by Property ID
            </button>
            <button
              type="button"
              onClick={() => setSearchType('surveyNumber')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                searchType === 'surveyNumber'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Search by Survey Number
            </button>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            {searchType === 'propertyId' ? (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Property ID
                </label>
                <input
                  type="text"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  placeholder="e.g., PROP-MH-PUN-2024-000001"
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Survey Number
                  </label>
                  <input
                    type="text"
                    value={surveyNumber}
                    onChange={(e) => setSurveyNumber(e.target.value)}
                    placeholder="e.g., 123/4A"
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    District
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g., Pune"
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  Verify Property
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500/50 rounded-xl p-4 mb-8 flex items-center">
            <XCircleIcon className="h-6 w-6 text-red-400 mr-3" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {/* Results */}
        {result && result.property && (
          <div className="space-y-6">
            {/* Verification Status Banner */}
            <div className={`rounded-xl p-6 ${
              result.isBlockchainVerified 
                ? 'bg-green-900/30 border border-green-500/50' 
                : 'bg-yellow-900/30 border border-yellow-500/50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {result.isBlockchainVerified ? (
                    <CheckBadgeIcon className="h-12 w-12 text-green-400" />
                  ) : (
                    <ExclamationTriangleIcon className="h-12 w-12 text-yellow-400" />
                  )}
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-white">
                      {result.isBlockchainVerified ? 'Verified on Blockchain' : 'Pending Verification'}
                    </h3>
                    <p className={result.isBlockchainVerified ? 'text-green-300' : 'text-yellow-300'}>
                      {result.isBlockchainVerified 
                        ? 'This property record is cryptographically secured and immutable'
                        : 'This property is registered but not yet verified on blockchain'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CubeTransparentIcon className={`h-8 w-8 ${result.isBlockchainVerified ? 'text-green-400' : 'text-yellow-400'}`} />
                </div>
              </div>
              
              {result.verificationHash && (
                <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Verification Hash (SHA-256)</p>
                  <p className="font-mono text-sm text-slate-300 break-all">{result.verificationHash}</p>
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Property Details</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(result.property.status)}`}>
                  {result.property.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <DocumentTextIcon className="h-5 w-5 text-blue-400 mt-1 mr-3" />
                    <div>
                      <p className="text-sm text-slate-400">Property ID</p>
                      <p className="text-white font-medium">{result.property.propertyId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <DocumentTextIcon className="h-5 w-5 text-blue-400 mt-1 mr-3" />
                    <div>
                      <p className="text-sm text-slate-400">Survey Number</p>
                      <p className="text-white font-medium">{result.property.surveyNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPinIcon className="h-5 w-5 text-blue-400 mt-1 mr-3" />
                    <div>
                      <p className="text-sm text-slate-400">Location</p>
                      <p className="text-white font-medium">
                        {result.property.location?.village || result.property.location?.locality || ''}, {' '}
                        {result.property.location?.district || ''}, {' '}
                        {result.property.location?.state || ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-400 mt-1 mr-3" />
                    <div>
                      <p className="text-sm text-slate-400">Property Type</p>
                      <p className="text-white font-medium capitalize">
                        {result.property.propertyType?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <DocumentTextIcon className="h-5 w-5 text-blue-400 mt-1 mr-3" />
                    <div>
                      <p className="text-sm text-slate-400">Area</p>
                      <p className="text-white font-medium">{formatArea(result.property.area)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <UserIcon className="h-5 w-5 text-blue-400 mt-1 mr-3" />
                    <div>
                      <p className="text-sm text-slate-400">Registered Owner</p>
                      <p className="text-white font-medium">{result.property.ownerName || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              {result.property.verificationStatus && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <h4 className="text-lg font-semibold text-white mb-4">Verification Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(result.property.verificationStatus).map(([key, value]) => (
                      <div key={key} className="flex items-center">
                        {value ? (
                          <CheckBadgeIcon className="h-5 w-5 text-green-400 mr-2" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-slate-500 mr-2" />
                        )}
                        <span className={`text-sm ${value ? 'text-green-400' : 'text-slate-500'}`}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-slate-800/30 rounded-xl p-4 flex items-start">
              <ShieldCheckIcon className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-slate-300">
                  This verification was performed against the blockchain-anchored records. 
                  For any disputes or concerns, please contact the Land Registry Department.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {searched && !loading && !result && !error && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700 text-center">
            <XCircleIcon className="h-16 w-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Property Found</h3>
            <p className="text-slate-400">
              The property you're looking for is not registered in our system.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
