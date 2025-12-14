import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaSms, FaMobileAlt, FaShieldAlt, FaFileContract, FaChartLine, FaSearch, FaFileAlt } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';

const Landing = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">CitySamdhaan 🏛️</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/track" className="text-gray-700 hover:text-primary-600 font-medium">
                🔍 Track Complaint
              </Link>
              {isAuthenticated ? (
                <>
                  <span className="text-gray-700">Welcome, {user?.name}</span>
                  <Link
                    to="/dashboard"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-primary-600">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            ✨ No Registration Required - File Complaints Instantly!
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transparent Civic Governance with{' '}
            <span className="text-primary-600">Blockchain Security</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            File civic complaints instantly without registration. Track status in real-time. 
            Every complaint is blockchain-verified for complete transparency and accountability.
          </p>
          <div className="flex justify-center space-x-4 mb-4">
            <Link
              to="/complaint"
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:from-blue-700 hover:to-green-700 transform hover:scale-105 transition-all shadow-lg"
            >
              🚀 File Complaint (No Login!)
            </Link>
            <Link
              to="/track"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 shadow-lg"
            >
              🔍 Track Status
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            ✅ Blockchain Verified | 📱 SMS Updates | 🔒 100% Secure
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why CitySamdhaan?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<FaFileAlt className="text-4xl text-primary-600" />}
            title="No Registration Needed"
            description="File complaints instantly without creating an account. Just provide your name and phone number."
          />
          <FeatureCard
            icon={<FaShieldAlt className="text-4xl text-primary-600" />}
            title="Blockchain Verified"
            description="Every complaint is anchored on Ethereum blockchain for tamper-proof transparency."
          />
          <FeatureCard
            icon={<FaSearch className="text-4xl text-primary-600" />}
            title="Public Tracking"
            description="Track any complaint using its unique ID. No login required to check status."
          />
          <FeatureCard
            icon={<FaSms className="text-4xl text-primary-600" />}
            title="SMS Updates"
            description="Receive automatic SMS notifications on complaint status changes."
          />
          <FeatureCard
            icon={<FaPhoneAlt className="text-4xl text-primary-600" />}
            title="Multi-Channel Support"
            description="File complaints via Web, SMS, IVR calls, or Mobile App - your choice!"
          />
          <FeatureCard
            icon={<FaChartLine className="text-4xl text-primary-600" />}
            title="Real-Time Status"
            description="See exactly where your complaint is - pending, assigned, in-progress, or resolved."
          />
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <Step number="1" title="File Complaint" description="No login needed - just fill the form with your details" />
            <Step number="2" title="Get Complaint ID" description="Receive unique ID like CSB-2024-00123" />
            <Step number="3" title="Track Progress" description="Check status anytime using your complaint ID" />
            <Step number="4" title="Verified Resolution" description="Blockchain-verified completion proof" />
          </div>
        </div>
      </div>

      {/* Blockchain Info Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">🔗 Blockchain-Powered Transparency</h2>
          <p className="text-xl mb-6 opacity-90">
            Every complaint is permanently recorded on Ethereum blockchain. 
            This means no one - not even administrators - can tamper with your complaint history.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
              <div className="text-4xl mb-2">🔒</div>
              <h3 className="font-bold mb-2">Immutable Records</h3>
              <p className="text-sm opacity-90">Cannot be altered or deleted</p>
            </div>
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="font-bold mb-2">Publicly Verifiable</h3>
              <p className="text-sm opacity-90">Anyone can verify on Etherscan</p>
            </div>
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
              <div className="text-4xl mb-2">⏱️</div>
              <h3 className="font-bold mb-2">Timestamped Proof</h3>
              <p className="text-sm opacity-90">Exact date/time recorded forever</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to make your voice heard?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of citizens making their cities better - no registration required!
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/complaint"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-bold hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg"
            >
              🚀 File a Complaint
            </Link>
            <Link
              to="/track"
              className="bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-semibold border-2 border-white hover:bg-primary-800 shadow-lg"
            >
              🔍 Track Complaint
            </Link>
          </div>
          <p className="text-blue-100 mt-6 text-sm">
            Staff login available for department officers and administrators
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">CitySamdhaan 🏛️</h3>
              <p className="text-gray-400">
                Blockchain-powered civic governance platform for transparent and accountable public service delivery.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/complaint" className="text-gray-400 hover:text-white">File Complaint</Link></li>
                <li><Link to="/track" className="text-gray-400 hover:text-white">Track Status</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white">Staff Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>📧 support@citysamadhaan.in</li>
                <li>📞 9876543210</li>
                <li>🔗 Sepolia Testnet</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-400">&copy; 2025 CitySamdhaan. All rights reserved.</p>
            <p className="text-gray-500 mt-2 text-sm">
              Powered by Ethereum Blockchain | Built for Digital India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-100">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Step = ({ number, title, description }) => (
  <div className="text-center">
    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
      {number}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Landing;
