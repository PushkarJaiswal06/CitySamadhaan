import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapIcon, 
  DocumentTextIcon, 
  ShieldCheckIcon, 
  ArrowRightIcon,
  BuildingOfficeIcon,
  CubeTransparentIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export default function LandRegistry() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('propertyId');

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Blockchain Verified',
      description: 'Every property record is cryptographically secured and immutably stored on the blockchain, ensuring authenticity and preventing fraud.'
    },
    {
      icon: DocumentTextIcon,
      title: 'Digital Document Vault',
      description: 'Securely store all property documents with SHA-256 hashing. Documents are verified by multiple officials before registration.'
    },
    {
      icon: ArrowPathIcon,
      title: 'Transparent Transfers',
      description: '7-stage transfer workflow with multi-party approval from Surveyor, Sub-Registrar, and Tehsildar ensures legal compliance.'
    },
    {
      icon: UserGroupIcon,
      title: 'Multi-Party Verification',
      description: 'Property verification by authorized government officials with digital signatures at each stage of the process.'
    }
  ];

  const services = [
    {
      title: 'Register Property',
      description: 'Register your property on the blockchain with verified documents and ownership records.',
      icon: BuildingOfficeIcon,
      link: '/land/register',
      color: 'bg-blue-500'
    },
    {
      title: 'Verify Property',
      description: 'Check the authenticity of any property registration using property ID or survey number.',
      icon: MagnifyingGlassIcon,
      link: '/land/verify',
      color: 'bg-green-500'
    },
    {
      title: 'Transfer Property',
      description: 'Initiate property transfer with complete documentation and multi-party approval workflow.',
      icon: ArrowPathIcon,
      link: '/land/transfer',
      color: 'bg-purple-500'
    },
    {
      title: 'My Properties',
      description: 'View and manage all your registered properties and ongoing transfers.',
      icon: ClipboardDocumentCheckIcon,
      link: '/land/my-properties',
      color: 'bg-orange-500'
    }
  ];

  const transferStages = [
    { name: 'Agreement Signed', description: 'Sale agreement between buyer and seller' },
    { name: 'Stamp Duty Paid', description: 'Payment of applicable stamp duty' },
    { name: 'Documents Verified', description: 'Document verification by officials' },
    { name: 'Surveyor Approved', description: 'Land survey and verification' },
    { name: 'Sub-Registrar Approved', description: 'Registration at sub-registrar office' },
    { name: 'Mutation Initiated', description: 'Revenue records update initiated' },
    { name: 'Tehsildar Approved', description: 'Final approval and mutation complete' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <MapIcon className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">Land Registry Portal</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/land/verify" className="text-slate-300 hover:text-white transition-colors">
                Verify Property
              </Link>
              <Link to="/login" className="text-slate-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-blue-600/20 rounded-2xl backdrop-blur-sm border border-blue-500/30">
              <CubeTransparentIcon className="h-16 w-16 text-blue-400" />
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            Blockchain-Powered
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Land Registry
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10">
            Secure, transparent, and tamper-proof property registration system. 
            Every transaction is verified by multiple officials and permanently recorded on the blockchain.
          </p>
          
          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/land/register"
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
            >
              Register Property
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/land/verify"
              className="inline-flex items-center px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all border border-slate-600"
            >
              <MagnifyingGlassIcon className="mr-2 h-5 w-5" />
              Verify Property
            </Link>
          </div>
          
          {/* Quick Verify Box */}
          <div className="max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Property Verification</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="propertyId">Property ID</option>
                <option value="surveyNumber">Survey Number</option>
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchType === 'propertyId' ? 'Enter Property ID...' : 'Enter Survey Number...'}
                className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              <Link
                to={`/land/verify?${searchType}=${searchQuery}`}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Verify
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why Blockchain Land Registry?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Traditional land records are prone to fraud and disputes. Our blockchain-powered system ensures complete transparency and security.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all">
                <div className="p-3 bg-blue-600/20 rounded-lg w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Our Services</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Complete suite of property registration and transfer services
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Link
                key={index}
                to={service.link}
                className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className={`p-3 ${service.color} rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}>
                  <service.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{service.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{service.description}</p>
                <span className="inline-flex items-center text-blue-400 text-sm font-medium group-hover:text-blue-300">
                  Get Started
                  <ArrowRightIcon className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Transfer Workflow Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Transfer Workflow</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              7-stage secure transfer process with multi-party verification
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500 hidden lg:block"></div>
            
            <div className="space-y-8 lg:space-y-0">
              {transferStages.map((stage, index) => (
                <div key={index} className={`flex items-center lg:justify-center ${index % 2 === 0 ? '' : 'lg:flex-row-reverse'}`}>
                  <div className={`w-full lg:w-5/12 ${index % 2 === 0 ? 'lg:text-right lg:pr-12' : 'lg:text-left lg:pl-12'}`}>
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700 inline-block">
                      <div className="flex items-center space-x-3">
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full ${
                          index === 0 ? 'bg-blue-500' : 'bg-slate-600'
                        } text-white text-sm font-bold`}>
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-semibold text-white">{stage.name}</h4>
                          <p className="text-slate-400 text-sm">{stage.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Center dot */}
                  <div className="hidden lg:flex items-center justify-center w-4 h-4 bg-blue-500 rounded-full border-4 border-slate-900 relative z-10"></div>
                  
                  {/* Empty space on the other side */}
                  <div className="hidden lg:block w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-12 border border-blue-500/30">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Register Your Property?</h2>
            <p className="text-slate-300 mb-8">
              Join thousands of property owners who have secured their land records on the blockchain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
              >
                Create Account
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/land/verify"
                className="inline-flex items-center px-8 py-4 bg-transparent border border-slate-500 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all"
              >
                Verify Existing Property
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <MapIcon className="h-6 w-6 text-blue-400" />
            <span className="text-slate-400">Land Registry Portal - Part of CitySamdhaan</span>
          </div>
          <div className="flex space-x-6 text-slate-400 text-sm">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/land/verify" className="hover:text-white">Verify</Link>
            <Link to="/login" className="hover:text-white">Login</Link>
            <Link to="/register" className="hover:text-white">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
