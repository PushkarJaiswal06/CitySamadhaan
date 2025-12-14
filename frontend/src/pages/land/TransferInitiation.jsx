import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  UserIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { getPropertyById, initiateTransfer } from '../../services/landService';
import { useAuthStore } from '../../store/authStore';

const TRANSFER_TYPES = [
  { value: 'sale', label: 'Sale', description: 'Transfer through sale transaction' },
  { value: 'gift', label: 'Gift', description: 'Transfer as gift/donation' },
  { value: 'inheritance', label: 'Inheritance', description: 'Transfer through inheritance' },
  { value: 'partition', label: 'Partition', description: 'Division of property' },
  { value: 'exchange', label: 'Exchange', description: 'Property exchange' }
];

export default function TransferInitiation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const propertyIdParam = searchParams.get('property');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [property, setProperty] = useState(null);
  const [success, setSuccess] = useState(false);
  const [createdTransfer, setCreatedTransfer] = useState(null);

  const [formData, setFormData] = useState({
    transferType: 'sale',
    saleAmount: '',
    buyer: {
      name: '',
      phone: '',
      email: '',
      address: ''
    },
    witnesses: [
      { name: '', phone: '', address: '' },
      { name: '', phone: '', address: '' }
    ],
    agreementDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (propertyIdParam) {
      fetchProperty(propertyIdParam);
    } else {
      setLoading(false);
      setError('No property specified');
    }
  }, [propertyIdParam]);

  const fetchProperty = async (id) => {
    try {
      const response = await getPropertyById(id);
      if (response.success) {
        setProperty(response.data.property);
      } else {
        setError('Property not found');
      }
    } catch (err) {
      console.error('Fetch property error:', err);
      setError(err.response?.data?.message || 'Failed to load property');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('buyer.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        buyer: {
          ...prev.buyer,
          [field]: value
        }
      }));
    } else if (name.startsWith('witness')) {
      const match = name.match(/witness(\d+)\.(\w+)/);
      if (match) {
        const [, index, field] = match;
        const idx = parseInt(index);
        setFormData(prev => ({
          ...prev,
          witnesses: prev.witnesses.map((w, i) => 
            i === idx ? { ...w, [field]: value } : w
          )
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const calculateFees = () => {
    const amount = parseFloat(formData.saleAmount) || 0;
    const stampDuty = Math.round(amount * 0.06); // 6% stamp duty
    const registrationFee = Math.round(stampDuty * 0.167); // ~1% of sale
    const mutationFee = 500;
    return {
      stampDuty,
      registrationFee,
      mutationFee,
      total: stampDuty + registrationFee + mutationFee
    };
  };

  const validateForm = () => {
    if (!formData.buyer.name) return 'Buyer name is required';
    if (!formData.buyer.phone) return 'Buyer phone is required';
    if (formData.transferType === 'sale' && !formData.saleAmount) return 'Sale amount is required';
    if (!formData.witnesses[0].name || !formData.witnesses[1].name) {
      return 'At least 2 witnesses are required';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const transferData = {
        propertyId: property._id,
        transferType: formData.transferType,
        saleAmount: formData.transferType === 'sale' ? parseFloat(formData.saleAmount) : undefined,
        buyer: formData.buyer,
        witnesses: formData.witnesses.filter(w => w.name),
        agreementDate: formData.agreementDate
      };

      const response = await initiateTransfer(transferData);
      
      if (response.success) {
        setCreatedTransfer(response.data.transfer);
        setSuccess(true);
      } else {
        setError(response.message || 'Failed to initiate transfer');
      }
    } catch (err) {
      console.error('Transfer initiation error:', err);
      setError(err.response?.data?.message || 'Failed to initiate transfer');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 text-center max-w-md">
          <ArrowPathIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
          <p className="text-slate-400 mb-6">Please login to initiate property transfer</p>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (success && createdTransfer) {
    const fees = calculateFees();
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 text-center max-w-lg">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Transfer Initiated!</h2>
          <p className="text-slate-400 mb-4">Property transfer has been initiated successfully.</p>
          
          <div className="bg-slate-700/50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-slate-400 mb-1">Transfer ID</p>
            <p className="text-xl font-mono text-blue-400 mb-4">{createdTransfer.transferId}</p>
            
            <p className="text-sm text-slate-400 mb-2">Estimated Fees</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Stamp Duty (6%)</span>
                <span>₹{fees.stampDuty.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Registration Fee</span>
                <span>₹{fees.registrationFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Mutation Fee</span>
                <span>₹{fees.mutationFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white font-semibold border-t border-slate-600 pt-1">
                <span>Total</span>
                <span>₹{fees.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6 text-left">
            <h4 className="text-white font-medium mb-2">Next Steps</h4>
            <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside">
              <li>Sign the sale agreement with the buyer</li>
              <li>Pay stamp duty at authorized center</li>
              <li>Submit documents for verification</li>
              <li>Visit sub-registrar office for registration</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={`/land/transfer/${createdTransfer._id}`}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              View Transfer Details
            </Link>
            <Link
              to="/land/my-properties"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              Back to My Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/land/my-properties"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to My Properties
          </Link>
          <h1 className="text-3xl font-bold text-white">Initiate Property Transfer</h1>
          <p className="text-slate-400 mt-1">Start the transfer process for your property</p>
        </div>

        {error && !property && (
          <div className="bg-red-900/50 border border-red-500/50 rounded-xl p-4 text-red-200">
            {error}
          </div>
        )}

        {property && (
          <>
            {/* Property Summary */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Property ID</span>
                  <p className="text-white font-medium">{property.propertyId}</p>
                </div>
                <div>
                  <span className="text-slate-400">Survey Number</span>
                  <p className="text-white font-medium">{property.surveyNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400">Area</span>
                  <p className="text-white font-medium">{property.area?.value} {property.area?.unit?.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-slate-400">Location</span>
                  <p className="text-white font-medium">{property.location?.district}, {property.location?.state}</p>
                </div>
              </div>
            </div>

            {/* Transfer Form */}
            <form onSubmit={handleSubmit}>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 space-y-6">
                {error && (
                  <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-lg flex items-center text-red-200">
                    <XMarkIcon className="h-5 w-5 mr-2" />
                    {error}
                  </div>
                )}

                {/* Transfer Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Transfer Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {TRANSFER_TYPES.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, transferType: type.value }))}
                        className={`p-3 rounded-lg text-center transition-all ${
                          formData.transferType === type.value
                            ? 'bg-blue-600 text-white border-2 border-blue-400'
                            : 'bg-slate-700 text-slate-300 border-2 border-transparent hover:border-slate-600'
                        }`}
                      >
                        <p className="font-medium">{type.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sale Amount (only for sale type) */}
                {formData.transferType === 'sale' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Sale Amount (₹) *
                    </label>
                    <div className="relative">
                      <CurrencyRupeeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        name="saleAmount"
                        value={formData.saleAmount}
                        onChange={handleInputChange}
                        placeholder="Enter sale amount"
                        className="w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    {formData.saleAmount && (
                      <div className="mt-2 p-3 bg-slate-700/50 rounded-lg">
                        <p className="text-sm text-slate-400">
                          Estimated Stamp Duty: <span className="text-white font-medium">₹{calculateFees().stampDuty.toLocaleString()}</span> (6%)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Buyer Details */}
                <div className="border-t border-slate-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-blue-400" />
                    Buyer Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="buyer.name"
                        value={formData.buyer.name}
                        onChange={handleInputChange}
                        placeholder="Buyer's full name"
                        className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="buyer.phone"
                        value={formData.buyer.phone}
                        onChange={handleInputChange}
                        placeholder="10-digit phone number"
                        className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="buyer.email"
                        value={formData.buyer.email}
                        onChange={handleInputChange}
                        placeholder="Email address"
                        className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Agreement Date
                      </label>
                      <input
                        type="date"
                        name="agreementDate"
                        value={formData.agreementDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Address
                    </label>
                    <textarea
                      name="buyer.address"
                      value={formData.buyer.address}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Buyer's address"
                      className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Witnesses */}
                <div className="border-t border-slate-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-400" />
                    Witnesses (Minimum 2 Required)
                  </h3>
                  
                  {formData.witnesses.map((witness, index) => (
                    <div key={index} className="mb-4 p-4 bg-slate-700/30 rounded-lg">
                      <p className="text-sm text-slate-400 mb-3">Witness {index + 1}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <input
                            type="text"
                            name={`witness${index}.name`}
                            value={witness.name}
                            onChange={handleInputChange}
                            placeholder="Full Name *"
                            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <input
                            type="tel"
                            name={`witness${index}.phone`}
                            value={witness.phone}
                            onChange={handleInputChange}
                            placeholder="Phone Number"
                            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            name={`witness${index}.address`}
                            value={witness.address}
                            onChange={handleInputChange}
                            placeholder="Address"
                            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Info Box */}
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
                  <div className="text-sm text-blue-200">
                    <p className="font-medium mb-1">Important Information</p>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      <li>Transfer will go through 7-stage verification process</li>
                      <li>Both parties will need to provide digital consent</li>
                      <li>Stamp duty must be paid before registration</li>
                      <li>All approvals are recorded on blockchain for transparency</li>
                    </ul>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4 border-t border-slate-700">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Initiating Transfer...
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="h-5 w-5 mr-2" />
                        Initiate Transfer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
