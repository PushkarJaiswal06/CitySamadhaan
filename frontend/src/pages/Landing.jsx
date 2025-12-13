import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaSms, FaMobileAlt, FaShieldAlt, FaFileContract, FaChartLine } from 'react-icons/fa';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">CitySamdhaan</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-primary-600">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Digital Governance for{' '}
            <span className="text-primary-600">Everyone, Everywhere</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            File civic complaints via SMS, Voice Calls, Mobile App, or Web Portal.
            Blockchain-secured, transparent, and inclusive governance for all citizens.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-700"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-medium border-2 border-primary-600 hover:bg-primary-50"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Multi-Channel Access
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<FaSms className="text-4xl text-primary-600" />}
            title="SMS Complaints"
            description="File complaints using simple keywords like 'WATER Sector 5'. Works on basic phones."
          />
          <FeatureCard
            icon={<FaPhoneAlt className="text-4xl text-primary-600" />}
            title="IVR Voice System"
            description="Automated voice menus in Hindi and regional languages for illiterate users."
          />
          <FeatureCard
            icon={<FaMobileAlt className="text-4xl text-primary-600" />}
            title="Offline Mobile App"
            description="Field workers can update complaints without internet connectivity."
          />
          <FeatureCard
            icon={<FaShieldAlt className="text-4xl text-primary-600" />}
            title="Blockchain Security"
            description="All complaints anchored on Ethereum blockchain to prevent tampering."
          />
          <FeatureCard
            icon={<FaFileContract className="text-4xl text-primary-600" />}
            title="Land Registry"
            description="Tamper-proof land ownership records with multi-party digital signatures."
          />
          <FeatureCard
            icon={<FaChartLine className="text-4xl text-primary-600" />}
            title="Real-time Tracking"
            description="Track complaint status in real-time with SMS/email notifications."
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
            <Step number="1" title="Register" description="Create an account with phone or email" />
            <Step number="2" title="File Complaint" description="Submit via SMS, call, app, or web" />
            <Step number="3" title="Track Progress" description="Get real-time updates on status" />
            <Step number="4" title="Get Resolution" description="Complaint resolved and verified" />
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
            Join thousands of citizens improving their communities
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100"
          >
            Register Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 CitySamdhaan. All rights reserved.</p>
          <p className="text-gray-400 mt-2">Digital & Inclusive Governance Platform</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Step = ({ number, title, description }) => (
  <div className="text-center">
    <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
      {number}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Landing;
