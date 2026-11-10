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
  Home,
  Key,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Wind,
  Droplets,
  Zap,
  MessageCircle,
} from 'lucide-react';
import { propertiesAPI } from '../services/api';

const LandingPage = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('Hyderabad');
  const [activeTab, setActiveTab] = useState('Rent');
  const [favorites, setFavorites] = useState({});

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
    navigate(`/browse?search=${encodeURIComponent(searchTerm)}&city=${selectedCity}`);
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sampleHouses = [
    {
      id: 1,
      title: 'Single Bed for Rent in Gajularamaram, Hyderabad',
      type: 'For Boys, Girls',
      apartment: 'Gajularamaram Suites',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
      price: '₹ 14,500',
      deposit: '2 Months',
      area: '1,161 sq.ft',
      amenities: ['balcony', 'borewell_water', 'fan'],
    },
    {
      id: 2,
      title: 'Single Bed for Rent in Mahindra ashvitha Apartment, Kukatpally...',
      type: 'For Boys, Girls, Family',
      apartment: 'Mahindra ashvitha Apartment',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
      price: '₹ 17,000',
      deposit: '2 Months',
      area: '2,250 sq.ft',
      amenities: ['balcony', 'fan', 'power_backup'],
    },
    {
      id: 3,
      title: 'Single Bed for Rent in Sharada Apartments, Erramanzil',
      type: 'For Boys, Girls',
      apartment: 'Sharada Apartments',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
      price: '₹ 21,000',
      deposit: '2 Months',
      area: '1,800 sq.ft',
      amenities: ['balcony', 'biometric'],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                  PropManage<span className="text-blue-600">Hub</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-amber-600 uppercase mt-0.5">
                  Select Living
                </span>
              </div>
            </div>

            {/* Middle Nav Links */}
            <div className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
              <span className="px-3 py-1 bg-slate-100 rounded-full text-slate-700 flex items-center gap-1.5 cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {selectedCity}
              </span>
              <a href="#select-homes" className="hover:text-blue-600 transition">Select Homes</a>
              <a href="#features" className="hover:text-blue-600 transition">Platform Features</a>
              <a href="#roles" className="hover:text-blue-600 transition">User Portals</a>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section matching Image 1 */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Indigo/Navy Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1600&auto=format&fit=crop&q=85")',
          }}
        />
        {/* Deep Slate/Indigo Tint Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-blue-950/85 to-indigo-950/90" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
              Discover a place you'll love
            </h1>

            {/* Pill Tabs */}
            <div className="inline-flex flex-wrap items-center bg-blue-900/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-lg gap-1 justify-center">
              <button
                type="button"
                onClick={() => setActiveTab('Buy')}
                className={`relative px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'Buy'
                    ? 'bg-white text-blue-900 shadow'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Buy
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('Rent')}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'Rent'
                    ? 'bg-white text-blue-900 shadow'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Rent
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('Full House')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  activeTab === 'Full House'
                    ? 'bg-white text-blue-900 shadow'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Full House
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('Flatmates')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  activeTab === 'Flatmates'
                    ? 'bg-white text-blue-900 shadow'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Flatmates
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('Co-Living/ PG')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  activeTab === 'Co-Living/ PG'
                    ? 'bg-white text-blue-900 shadow'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Co-Living/ PG
              </button>
            </div>

            {/* Capsule Search Bar */}
            <form onSubmit={handleSearch} className="bg-white rounded-full shadow-2xl p-1.5 sm:p-2 flex items-center max-w-2xl mx-auto border border-slate-200">
              <div className="relative pl-3 pr-2">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="appearance-none bg-transparent text-slate-800 text-xs sm:text-sm font-bold pr-6 focus:outline-none cursor-pointer"
                >
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="New York">New York</option>
                </select>
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </span>
              </div>

              <div className="w-[1px] h-6 bg-slate-200 mx-1" />

              <input
                type="text"
                placeholder="Search Locality, Landmark or Tech Park"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />

              <button
                type="submit"
                className="p-2 sm:p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow transition flex-shrink-0"
              >
                <Search className="w-4 h-4 sm:w-5 h-5" />
              </button>
            </form>

            {/* 3 Key Stats Counters with Amber Icons */}
            <div className="pt-8 grid grid-cols-3 gap-3 sm:gap-8 max-w-xl mx-auto border-t border-white/10">
              <div className="flex items-center justify-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400 flex-shrink-0">
                  <Home className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm sm:text-base font-extrabold text-white leading-tight">1,00,000+</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-300">Homes Rented / Sold</p>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400 flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm sm:text-base font-extrabold text-white leading-tight">2,00,000+</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-300">Happy Customers</p>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400 flex-shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm sm:text-base font-extrabold text-white leading-tight">1,00,000+</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-300">Trusted Owners</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section matching Image 2 */}
      <section id="select-homes" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Info Panel */}
            <div className="lg:col-span-3 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Premium Homes. Zero Hassle.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Nestaway Select brings you premium, fully furnished homes maintained by Nestaway - designed for comfort, convenience, and a seamless move-in experience.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row lg:flex-col gap-2.5">
                <Link
                  to="/browse"
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:border-slate-400 text-xs font-bold rounded-full text-center transition"
                >
                  Learn More
                </Link>
                <Link
                  to="/browse"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-full text-center shadow transition"
                >
                  Explore Select Houses
                </Link>
              </div>

              {/* Cute Pastel Houses Graphic */}
              <div className="pt-6 hidden lg:block opacity-75">
                <svg width="120" height="70" viewBox="0 0 120 70" fill="none">
                  <path d="M10 40L25 25L40 40V65H10V40Z" fill="#93c5fd" />
                  <path d="M45 30L60 15L75 30V65H45V30Z" fill="#c4b5fd" />
                  <path d="M80 45L95 30L110 45V65H80V45Z" fill="#fde047" />
                </svg>
              </div>
            </div>

            {/* Right Cards Showcase */}
            <div className="lg:col-span-9">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {sampleHouses.map((house) => (
                  <div
                    key={house.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition group"
                  >
                    {/* Image with Select Badge & Actions */}
                    <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                      <img
                        src={house.image}
                        alt={house.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />

                      {/* Select Premium Badge */}
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-slate-900/85 backdrop-blur-sm text-amber-300 text-[10px] font-bold rounded-md flex items-center gap-1 shadow">
                        <span className="italic font-serif">Select</span> Premium
                      </div>

                      {/* Top Right Action Icons */}
                      <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5">
                        <button
                          type="button"
                          className="p-1.5 bg-white/80 hover:bg-white backdrop-blur-sm text-slate-700 rounded-full shadow-sm transition"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(house.id)}
                          className="p-1.5 bg-white/80 hover:bg-white backdrop-blur-sm text-slate-700 rounded-full shadow-sm transition"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              favorites[house.id] ? 'fill-red-500 text-red-500' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Carousel Arrow Controls */}
                      <button
                        type="button"
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center shadow transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/70 hover:bg-white text-slate-800 flex items-center justify-center shadow transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Pagination Dots */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug">
                          {house.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">{house.type}</p>
                        <p className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 mt-0.5">
                          {house.apartment} <ExternalLink className="w-3 h-3" />
                        </p>

                        {/* Amenities Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {house.amenities.map((amenity, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium flex items-center gap-1"
                            >
                              {amenity === 'balcony' && <Wind className="w-2.5 h-2.5" />}
                              {amenity === 'borewell_water' && <Droplets className="w-2.5 h-2.5" />}
                              {amenity === 'power_backup' && <Zap className="w-2.5 h-2.5" />}
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Price, Deposit & Area Row */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="grid grid-cols-3 gap-1 text-center py-1">
                          <div className="text-left">
                            <p className="text-xs sm:text-sm font-extrabold text-slate-900">{house.price}</p>
                            <p className="text-[10px] text-slate-400">Rent /month</p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-slate-800">{house.deposit}</p>
                            <p className="text-[10px] text-slate-400">Deposit</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-bold text-slate-800">{house.area}</p>
                            <p className="text-[10px] text-slate-400">Area</p>
                          </div>
                        </div>

                        {/* Visit for FREE Action Button */}
                        <Link
                          to="/browse"
                          className="mt-2.5 w-full block py-2 text-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
                        >
                          Visit For FREE
                        </Link>
                      </div>
                    </div>

                    {/* Bottom Discount Ribbon */}
                    <div className="bg-emerald-50 px-3 py-1.5 border-t border-emerald-100 text-center">
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                        🏷️ 100% off on Platform Fee
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating CTA WhatsApp Button in Bottom-Right */}
      <a
        href="https://wa.me/?text=Hello%20PropManageHub,%20I%20am%20looking%20for%20a%20rental%20property"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-2xl font-bold text-xs transition duration-300 transform hover:scale-105"
      >
        <MessageCircle className="w-4 h-4 fill-white" />
        <span>Find Your Perfect Home</span>
      </a>

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
