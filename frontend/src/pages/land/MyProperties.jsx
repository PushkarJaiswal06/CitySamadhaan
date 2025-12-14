import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowPathIcon,
  PlusIcon,
  CheckBadgeIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { getProperties, getTransfers } from '../../services/landService';
import { useAuthStore } from '../../store/authStore';

export default function MyProperties() {
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('properties');
  const [properties, setProperties] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propertiesRes, transfersRes] = await Promise.all([
        getProperties(),
        getTransfers()
      ]);
      
      if (propertiesRes.success) {
        setProperties(propertiesRes.data?.properties || []);
      }
      if (transfersRes.success) {
        setTransfers(transfersRes.data?.transfers || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-500/20 text-gray-400',
      submitted: 'bg-yellow-500/20 text-yellow-400',
      under_verification: 'bg-blue-500/20 text-blue-400',
      verified: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
      dispute: 'bg-orange-500/20 text-orange-400',
      active: 'bg-blue-500/20 text-blue-400',
      completed: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-gray-500/20 text-gray-400'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
        {status?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
      case 'completed':
        return <CheckBadgeIcon className="h-5 w-5 text-green-400" />;
      case 'submitted':
      case 'under_verification':
      case 'active':
        return <ClockIcon className="h-5 w-5 text-yellow-400" />;
      case 'rejected':
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const formatArea = (area) => {
    if (!area) return 'N/A';
    const units = {
      'sq_feet': 'sq. ft.',
      'sq_meters': 'sq. m.',
      'acres': 'acres',
      'hectares': 'hectares'
    };
    return `${area.value?.toLocaleString() || 0} ${units[area.unit] || area.unit}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 text-center max-w-md">
          <BuildingOfficeIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
          <p className="text-slate-400 mb-6">Please login to view your properties</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/land"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Land Registry
            </Link>
            <h1 className="text-3xl font-bold text-white">My Properties</h1>
            <p className="text-slate-400 mt-1">Manage your registered properties and transfers</p>
          </div>
          <Link
            to="/land/register"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Register New Property
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'properties'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <BuildingOfficeIcon className="h-5 w-5 inline mr-2" />
            Properties ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab('transfers')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'transfers'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <ArrowPathIcon className="h-5 w-5 inline mr-2" />
            Transfers ({transfers.length})
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500/50 rounded-xl p-4 mb-6 text-red-200">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <>
            {/* Properties Tab */}
            {activeTab === 'properties' && (
              <div className="space-y-4">
                {properties.length === 0 ? (
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700 text-center">
                    <BuildingOfficeIcon className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Properties Yet</h3>
                    <p className="text-slate-400 mb-6">You haven't registered any properties yet.</p>
                    <Link
                      to="/land/register"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Register Your First Property
                    </Link>
                  </div>
                ) : (
                  properties.map((property) => (
                    <div
                      key={property._id}
                      className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-blue-600/20 rounded-lg">
                            <BuildingOfficeIcon className="h-8 w-8 text-blue-400" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="text-lg font-semibold text-white">
                                {property.propertyId}
                              </h3>
                              {getStatusBadge(property.status)}
                            </div>
                            <p className="text-slate-400 text-sm mb-2">
                              Survey No: {property.surveyNumber}
                            </p>
                            <div className="flex items-center text-slate-400 text-sm">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {property.location?.village || property.location?.locality}, {property.location?.district}, {property.location?.state}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-sm">Area</p>
                          <p className="text-white font-medium">{formatArea(property.area)}</p>
                          <p className="text-slate-500 text-xs capitalize mt-1">{property.propertyType}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(property.status)}
                          <span className="text-sm text-slate-400">
                            {property.status === 'verified' && 'Property verified on blockchain'}
                            {property.status === 'submitted' && 'Awaiting verification'}
                            {property.status === 'under_verification' && 'Under official verification'}
                            {property.status === 'rejected' && 'Verification rejected'}
                            {property.status === 'draft' && 'Draft - complete registration'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/land/property/${property._id}`}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View Details
                          </Link>
                          {property.status === 'verified' && property.transferStatus === 'none' && (
                            <Link
                              to={`/land/transfer/new?property=${property._id}`}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
                            >
                              <ArrowPathIcon className="h-4 w-4 mr-1" />
                              Transfer
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Transfers Tab */}
            {activeTab === 'transfers' && (
              <div className="space-y-4">
                {transfers.length === 0 ? (
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700 text-center">
                    <ArrowPathIcon className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Transfers</h3>
                    <p className="text-slate-400">You don't have any property transfers yet.</p>
                  </div>
                ) : (
                  transfers.map((transfer) => (
                    <div
                      key={transfer._id}
                      className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {transfer.transferId}
                            </h3>
                            {getStatusBadge(transfer.status)}
                          </div>
                          <p className="text-slate-400 text-sm mb-1">
                            Property: {transfer.propertyId || transfer.property?.propertyId}
                          </p>
                          <p className="text-slate-400 text-sm">
                            {transfer.transferType?.charAt(0).toUpperCase() + transfer.transferType?.slice(1)} • 
                            {transfer.saleAmount ? ` ₹${transfer.saleAmount.toLocaleString()}` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-sm">Current Stage</p>
                          <p className="text-white font-medium capitalize">
                            {transfer.currentStage?.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                        <div className="flex items-center space-x-6 text-sm">
                          <div>
                            <span className="text-slate-500">Seller:</span>
                            <span className="text-slate-300 ml-1">{transfer.seller?.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Buyer:</span>
                            <span className="text-slate-300 ml-1">{transfer.buyer?.name}</span>
                          </div>
                        </div>
                        <Link
                          to={`/land/transfer/${transfer._id}`}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
