import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  DocumentTextIcon,
  CameraIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { registerProperty, uploadPropertyDocument } from '../../services/landService';
import { useAuthStore } from '../../store/authStore';

const STEPS = [
  { id: 1, name: 'Basic Details', icon: BuildingOfficeIcon },
  { id: 2, name: 'Location', icon: MapPinIcon },
  { id: 3, name: 'Documents', icon: DocumentTextIcon },
  { id: 4, name: 'Review', icon: CheckIcon }
];

const PROPERTY_TYPES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'agricultural', label: 'Agricultural' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'mixed', label: 'Mixed Use' }
];

const AREA_UNITS = [
  { value: 'sq_feet', label: 'Square Feet' },
  { value: 'sq_meters', label: 'Square Meters' },
  { value: 'acres', label: 'Acres' },
  { value: 'hectares', label: 'Hectares' },
  { value: 'guntha', label: 'Guntha' },
  { value: 'cents', label: 'Cents' }
];

const DOCUMENT_TYPES = [
  { value: 'title_deed', label: 'Title Deed' },
  { value: 'sale_deed', label: 'Sale Deed' },
  { value: 'survey_map', label: 'Survey Map' },
  { value: 'encumbrance_certificate', label: 'Encumbrance Certificate' },
  { value: 'patta', label: 'Patta / RTC' },
  { value: 'khata', label: 'Khata Certificate' },
  { value: '7_12_extract', label: '7/12 Extract' },
  { value: 'tax_receipt', label: 'Tax Receipt' },
  { value: 'identity_proof', label: 'Identity Proof' },
  { value: 'other', label: 'Other Document' }
];

export default function PropertyRegistration() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState(null);

  const [formData, setFormData] = useState({
    surveyNumber: '',
    subSurveyNumber: '',
    propertyType: 'residential',
    landUse: 'built',
    area: {
      value: '',
      unit: 'sq_feet'
    },
    location: {
      state: '',
      district: '',
      taluk: '',
      village: '',
      ward: '',
      locality: '',
      address: '',
      pincode: ''
    },
    marketValue: '',
    guidanceValue: '',
    encumbrance: {
      hasEncumbrance: false,
      details: '',
      mortgageTo: '',
      mortgageAmount: ''
    },
    notes: ''
  });

  const [documents, setDocuments] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 text-center max-w-md">
          <BuildingOfficeIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
          <p className="text-slate-400 mb-6">Please login to register your property</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Login to Continue
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleDocumentAdd = (e) => {
    const files = Array.from(e.target.files);
    const newDocs = files.map(file => ({
      file,
      type: 'other',
      name: file.name,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setDocuments(prev => [...prev, ...newDocs]);
  };

  const handleDocumentTypeChange = (index, type) => {
    setDocuments(prev => {
      const updated = [...prev];
      updated[index].type = type;
      return updated;
    });
  };

  const handleDocumentRemove = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step) => {
    setError('');
    
    switch (step) {
      case 1:
        if (!formData.surveyNumber) return 'Survey number is required';
        if (!formData.propertyType) return 'Property type is required';
        if (!formData.area.value) return 'Area is required';
        break;
      case 2:
        if (!formData.location.state) return 'State is required';
        if (!formData.location.district) return 'District is required';
        break;
      case 3:
        if (documents.length === 0) return 'At least one document is required';
        break;
      default:
        break;
    }
    return null;
  };

  const handleNext = () => {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Prepare property data
      const propertyData = {
        ...formData,
        area: {
          value: parseFloat(formData.area.value),
          unit: formData.area.unit
        },
        marketValue: formData.marketValue ? parseFloat(formData.marketValue) : undefined,
        guidanceValue: formData.guidanceValue ? parseFloat(formData.guidanceValue) : undefined
      };

      // Register property
      const response = await registerProperty(propertyData);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      const propertyId = response.data.property._id;
      setCreatedPropertyId(response.data.property.propertyId);

      // Upload documents
      for (const doc of documents) {
        try {
          await uploadPropertyDocument(propertyId, doc.file, doc.type, doc.name);
          setUploadedDocs(prev => [...prev, doc.name]);
        } catch (uploadError) {
          console.error('Document upload error:', uploadError);
        }
      }

      setSuccess(true);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to register property');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 text-center max-w-lg">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Property Registered!</h2>
          <p className="text-slate-400 mb-4">
            Your property has been submitted for verification.
          </p>
          <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-400 mb-1">Property ID</p>
            <p className="text-xl font-mono text-blue-400">{createdPropertyId}</p>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            {uploadedDocs.length} document(s) uploaded successfully. 
            Government officials will verify your documents and update the status.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/land/my-properties"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              View My Properties
            </Link>
            <Link
              to="/land"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              Back to Land Registry
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
            to="/land"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Land Registry
          </Link>
          <h1 className="text-3xl font-bold text-white">Register Property</h1>
          <p className="text-slate-400 mt-1">
            Register your property on the blockchain for secure and transparent ownership records
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.id ? 'text-white' : 'text-slate-400'
                } hidden sm:inline`}>
                  {step.name}
                </span>
                {index < STEPS.length - 1 && (
                  <div className={`w-8 sm:w-16 h-1 mx-2 rounded ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-slate-700'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg flex items-center text-red-200">
              <XMarkIcon className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {/* Step 1: Basic Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Basic Property Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Survey Number *
                  </label>
                  <input
                    type="text"
                    name="surveyNumber"
                    value={formData.surveyNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., 123/4A"
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Sub Survey Number
                  </label>
                  <input
                    type="text"
                    name="subSurveyNumber"
                    value={formData.subSurveyNumber}
                    onChange={handleInputChange}
                    placeholder="Optional"
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Property Type *
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  >
                    {PROPERTY_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Land Use
                  </label>
                  <select
                    name="landUse"
                    value={formData.landUse}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="vacant">Vacant</option>
                    <option value="built">Built</option>
                    <option value="cultivated">Cultivated</option>
                    <option value="fallow">Fallow</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Area *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="area.value"
                      value={formData.area.value}
                      onChange={handleInputChange}
                      placeholder="Enter area"
                      className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                    />
                    <select
                      name="area.unit"
                      value={formData.area.unit}
                      onChange={handleInputChange}
                      className="px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                    >
                      {AREA_UNITS.map(unit => (
                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Market Value (₹)
                  </label>
                  <input
                    type="number"
                    name="marketValue"
                    value={formData.marketValue}
                    onChange={handleInputChange}
                    placeholder="Estimated market value"
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Guidance Value (₹)
                  </label>
                  <input
                    type="number"
                    name="guidanceValue"
                    value={formData.guidanceValue}
                    onChange={handleInputChange}
                    placeholder="Government guidance value"
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-lg font-medium text-white mb-4">Encumbrance Details</h3>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    name="encumbrance.hasEncumbrance"
                    checked={formData.encumbrance.hasEncumbrance}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-slate-300">Property has existing encumbrance/mortgage</label>
                </div>
                
                {formData.encumbrance.hasEncumbrance && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Mortgage To
                      </label>
                      <input
                        type="text"
                        name="encumbrance.mortgageTo"
                        value={formData.encumbrance.mortgageTo}
                        onChange={handleInputChange}
                        placeholder="Bank/Institution name"
                        className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Mortgage Amount (₹)
                      </label>
                      <input
                        type="number"
                        name="encumbrance.mortgageAmount"
                        value={formData.encumbrance.mortgageAmount}
                        onChange={handleInputChange}
                        placeholder="Outstanding amount"
                        className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Property Location</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleInputChange}
                    placeholder="e.g., Maharashtra"
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    District *
                  </label>
                  <input
                    type="text"
                    name="location.district"
                    value={formData.location.district}
                    onChange={handleInputChange}
                    placeholder="e.g., Pune"
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Taluk/Tehsil
                  </label>
                  <input
                    type="text"
                    name="location.taluk"
                    value={formData.location.taluk}
                    onChange={handleInputChange}
                    placeholder="e.g., Haveli"
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Village/Town
                  </label>
                  <input
                    type="text"
                    name="location.village"
                    value={formData.location.village}
                    onChange={handleInputChange}
                    placeholder="e.g., Kharadi"
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Ward/Zone
                  </label>
                  <input
                    type="text"
                    name="location.ward"
                    value={formData.location.ward}
                    onChange={handleInputChange}
                    placeholder="Ward number or zone"
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Locality
                  </label>
                  <input
                    type="text"
                    name="location.locality"
                    value={formData.location.locality}
                    onChange={handleInputChange}
                    placeholder="Locality/Area name"
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Address
                </label>
                <textarea
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Complete property address"
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="w-1/2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  name="location.pincode"
                  value={formData.location.pincode}
                  onChange={handleInputChange}
                  placeholder="6-digit pincode"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Upload Documents</h2>
              <p className="text-slate-400 text-sm mb-6">
                Upload property documents for verification. All documents will be hashed and stored securely.
              </p>
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="document-upload"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleDocumentAdd}
                  className="hidden"
                />
                <label htmlFor="document-upload" className="cursor-pointer">
                  <CameraIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-300 font-medium">Click to upload documents</p>
                  <p className="text-slate-500 text-sm mt-1">JPEG, PNG, or PDF (max 10MB each)</p>
                </label>
              </div>

              {/* Document List */}
              {documents.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Uploaded Documents ({documents.length})</h3>
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center gap-4 bg-slate-700/50 rounded-lg p-4">
                      {doc.preview ? (
                        <img src={doc.preview} alt="" className="w-16 h-16 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-16 bg-slate-600 rounded flex items-center justify-center">
                          <DocumentTextIcon className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-white font-medium truncate">{doc.name}</p>
                        <select
                          value={doc.type}
                          onChange={(e) => handleDocumentTypeChange(index, e.target.value)}
                          className="mt-1 px-3 py-1 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
                        >
                          {DOCUMENT_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDocumentRemove(index)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Review & Submit</h2>
              
              <div className="bg-slate-700/30 rounded-xl p-6 space-y-6">
                {/* Property Details Summary */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Property Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Survey Number:</span>
                      <span className="text-white ml-2">{formData.surveyNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Property Type:</span>
                      <span className="text-white ml-2 capitalize">{formData.propertyType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Area:</span>
                      <span className="text-white ml-2">{formData.area.value} {formData.area.unit?.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Market Value:</span>
                      <span className="text-white ml-2">₹{formData.marketValue || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Location Summary */}
                <div className="border-t border-slate-600 pt-4">
                  <h3 className="text-lg font-medium text-white mb-3">Location</h3>
                  <p className="text-slate-300">
                    {[
                      formData.location.locality,
                      formData.location.village,
                      formData.location.taluk,
                      formData.location.district,
                      formData.location.state,
                      formData.location.pincode
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>

                {/* Documents Summary */}
                <div className="border-t border-slate-600 pt-4">
                  <h3 className="text-lg font-medium text-white mb-3">Documents ({documents.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {documents.map((doc, index) => (
                      <span key={index} className="px-3 py-1 bg-slate-600 rounded-full text-sm text-slate-300">
                        {DOCUMENT_TYPES.find(t => t.value === doc.type)?.label || doc.type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Owner Info */}
                <div className="border-t border-slate-600 pt-4">
                  <h3 className="text-lg font-medium text-white mb-3">Owner Information</h3>
                  <div className="text-sm">
                    <p className="text-slate-300">{user?.name}</p>
                    <p className="text-slate-400">{user?.phone} | {user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4">
                <p className="text-blue-300 text-sm">
                  <strong>Note:</strong> By submitting, you confirm that all information provided is accurate. 
                  False declarations may lead to legal consequences. Your property will be verified by 
                  government officials before being registered on the blockchain.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center"
              >
                Next
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Submit Registration
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
