import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  Wrench,
  Users,
  Search,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { propertiesAPI, unitsAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const LandingPage = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await propertiesAPI.getAll({ limit: 4 });
        if (res.data?.data) {
          setFeaturedProperties(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load featured properties:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/browse?search=${encodeURIComponent(searchTerm)}&type=${selectedType}`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                PropManage<span className="text-blue-600">Hub</span>
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-blue-600 transition">Features</a>
              <a href="#properties" className="hover:text-blue-600 transition">Properties</a>
              <a href="#workflow" className="hover:text-blue-600 transition">How It Works</a>
              <a href="#roles" className="hover:text-blue-600 transition">Portals</a>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4" /> Next-Gen Property & Tenant Management
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Smarter Property Operations, <span className="text-blue-400">Simplified.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed">
              An all-in-one platform for Property Owners, Managers, and Tenants. Manage leases, automate rental payments, track maintenance requests, and generate actionable analytics.
            </p>

            {/* Quick Search Box */}
            <div className="mt-10 max-w-2xl mx-auto bg-white p-3 rounded-2xl shadow-2xl">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center px-3 bg-slate-50 rounded-xl border border-slate-200">
                  <Search className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by city, title, or landmark..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-2.5 bg-transparent text-slate-800 placeholder-slate-400 text-sm focus:outline-none"
                  />
                </div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-sm focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="house">House</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="commercial">Commercial</option>
                </select>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                  Find Units
                </button>
              </form>
            </div>

            {/* Metrics Ribbon */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-slate-700/60 max-w-4xl mx-auto">
              <div>
                <p className="text-3xl font-extrabold text-white">99.4%</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Occupancy Rate</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-blue-400">$1.2M+</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Rent Processed</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white">24/7</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Maintenance SLA</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-blue-400">4 Roles</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Dedicated Portals</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600">Enterprise Grade Features</h2>
            <p className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              Engineered for End-to-End Real Estate Management
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Property & Units</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Granular multi-unit tracking, automated vacancy status, occupancy rates, and architectural details.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-5">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Rent & Payments</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Instant digital receipts, automated overdue detection, ledger auditing, and multi-channel payment logs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-5">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Maintenance Tickets</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Tenant request triage, priority matrix, manager assignments, status lifecycle, and cost auditing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Lease Compliance</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                30-day and 60-day expiry radar, automated terms validation, deposit escrow status, and 1-click renewals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Showcase */}
      <section id="properties" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600">Portfolio Highlights</h2>
              <p className="mt-1 text-3xl font-bold text-slate-900">Featured Properties</p>
            </div>
            <Link
              to="/browse"
              className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Browse All Units <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.slice(0, 3).map((prop) => (
              <div
                key={prop._id}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition duration-300 flex flex-col"
              >
                <div className="relative h-48 bg-slate-200 overflow-hidden">
                  <img
                    src={prop.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-md text-xs font-semibold text-slate-800 capitalize shadow">
                    {prop.type}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center text-xs text-slate-500 mb-2">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {prop.address?.city}, {prop.address?.state}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {prop.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                      {prop.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      {prop.totalUnits || 3} Rental Units
                    </span>
                    <Link
                      to={`/browse`}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-lg transition"
                    >
                      View Units
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Four Dedicated Portals Section */}
      <section id="roles" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-400">Tailored Experiences</h2>
            <p className="mt-2 text-3xl font-bold sm:text-4xl">Four Purpose-Built Portals</p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-blue-500/50 transition">
              <span className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-500/20 text-blue-300">ADMIN</span>
              <h3 className="text-xl font-bold mt-3">Platform Control</h3>
              <p className="text-xs text-slate-400 mt-2">
                Manage global users, all property listings, system analytics, and exportable financial reports.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 transition">
              <span className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-300">PROPERTY OWNER</span>
              <h3 className="text-xl font-bold mt-3">Asset Performance</h3>
              <p className="text-xs text-slate-400 mt-2">
                Monitor occupancy, approve tenant applications, issue leases, and track incoming rental revenue.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-amber-500/50 transition">
              <span className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-500/20 text-amber-300">PROPERTY MANAGER</span>
              <h3 className="text-xl font-bold mt-3">Day-to-Day Operations</h3>
              <p className="text-xs text-slate-400 mt-2">
                Manage tenant relationships, coordinate vendor repairs, handle renewals, and record collections.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-purple-500/50 transition">
              <span className="px-2.5 py-1 text-xs font-semibold rounded bg-purple-500/20 text-purple-300">TENANT</span>
              <h3 className="text-xl font-bold mt-3">Resident Hub</h3>
              <p className="text-xs text-slate-400 mt-2">
                Browse available units, submit digital applications, download rent receipts, and log service tickets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <Building2 className="w-5 h-5 text-blue-500" />
            <span className="text-lg font-bold text-white">PropManageHub</span>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">B.Tech DevOps & Full Stack</span>
          </div>

          <div className="flex space-x-6 text-xs">
            <Link to="/login" className="hover:text-white transition">Sign In</Link>
            <Link to="/register" className="hover:text-white transition">Register</Link>
            <Link to="/browse" className="hover:text-white transition">Available Units</Link>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Property Rental and Tenant Management Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
