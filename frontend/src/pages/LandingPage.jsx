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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/20 to-emerald-50/20 text-slate-800 font-sans">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl text-white shadow-md shadow-sky-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                  PropManage<span className="text-sky-600">Hub</span>
                </span>
                <span className="text-[10px] font-bold tracking-wider text-amber-600 uppercase mt-0.5">
                  Select Living
                </span>
              </div>
            </div>

            {/* Middle Nav Links */}
            <div className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
              <span className="px-3 py-1 bg-sky-50 border border-sky-200/80 rounded-full text-sky-800 flex items-center gap-1.5 cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {selectedCity}
              </span>
              <a href="#select-homes" className="hover:text-sky-600 transition">Select Homes</a>
              <a href="#features" className="hover:text-sky-600 transition">Platform Features</a>
              <a href="#roles" className="hover:text-sky-600 transition">User Portals</a>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-sky-600 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Light Colors */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1600&auto=format&fit=crop&q=85")',
          }}
        />
        {/* Luminous Light Sunlit Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-sky-50/92 to-emerald-50/90 backdrop-blur-xs" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-slate-900 drop-shadow-sm">
              Discover a place you'll love
            </h1>

            {/* Light Colors Pill Tabs: Buy, Rent, Full House, Flatmates, Co-Living/ PG */}
            <div className="inline-flex flex-wrap items-center bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-sky-200/80 shadow-md gap-1 justify-center">
              <button
                type="button"
                onClick={() => setActiveTab('Buy')}
                className={`relative px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'Buy'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50'
                }`}
              >
                Buy
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('Rent')}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'Rent'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Rent
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('Full House')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  activeTab === 'Full House'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50'
                }`}
              >
                Full House
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('Flatmates')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  activeTab === 'Flatmates'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50'
                }`}
              >
                Flatmates
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('Co-Living/ PG')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  activeTab === 'Co-Living/ PG'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50'
                }`}
              >
                Co-Living/ PG
              </button>
            </div>

            {/* Capsule Search Bar */}
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-full shadow-xl shadow-sky-100/60 p-1.5 sm:p-2 flex items-center max-w-2xl mx-auto border border-sky-200/80"
            >
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
                className="p-2 sm:p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-sm transition flex-shrink-0"
              >
                <Search className="w-4 h-4 sm:w-5 h-5" />
              </button>
            </form>

            {/* 3 Key Stats Counters with Light Green, Light Yellow, and Light Blue Cards */}
            <div className="pt-8 grid grid-cols-3 gap-3 sm:gap-6 max-w-xl mx-auto">
              {/* Stat 1: Light Green Card */}
              <div className="p-3 bg-emerald-50/90 border border-emerald-200/80 rounded-2xl flex items-center justify-center space-x-2.5 shadow-xs">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 flex-shrink-0">
                  <Home className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">1,00,000+</p>
                  <p className="text-[10px] sm:text-[11px] text-emerald-800 font-medium">Homes Rented</p>
                </div>
              </div>

              {/* Stat 2: Light Yellow Card */}
              <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex items-center justify-center space-x-2.5 shadow-xs">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-600 flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">2,00,000+</p>
                  <p className="text-[10px] sm:text-[11px] text-amber-800 font-medium">Happy Customers</p>
                </div>
              </div>

              {/* Stat 3: Light Blue Card */}
              <div className="p-3 bg-sky-50/90 border border-sky-200/80 rounded-2xl flex items-center justify-center space-x-2.5 shadow-xs">
                <div className="p-2 rounded-xl bg-sky-100 text-sky-600 flex-shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">1,00,000+</p>
                  <p className="text-[10px] sm:text-[11px] text-sky-800 font-medium">Trusted Owners</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section id="select-homes" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Info Panel */}
            <div className="lg:col-span-3 space-y-4">
              <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
                Premium Homes
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Zero Hassle. Complete Comfort.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Nestaway Select brings you premium, fully furnished homes maintained with verified standards — designed for comfort, convenience, and a seamless move-in experience.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row lg:flex-col gap-2.5">
                <Link
                  to="/browse"
                  className="px-5 py-2.5 border border-sky-300 text-sky-800 bg-sky-50 hover:bg-sky-100 text-xs font-bold rounded-full text-center transition"
                >
                  Learn More
                </Link>
                <Link
                  to="/browse"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-full text-center shadow transition"
                >
                  Explore Select Houses
                </Link>
              </div>

              {/* Cute Pastel Houses Graphic */}
              <div className="pt-6 hidden lg:block opacity-85">
                <svg width="120" height="70" viewBox="0 0 120 70" fill="none">
                  <path d="M10 40L25 25L40 40V65H10V40Z" fill="#bae6fd" />
                  <path d="M45 30L60 15L75 30V65H45V30Z" fill="#a7f3d0" />
                  <path d="M80 45L95 30L110 45V65H80V45Z" fill="#fef08a" />
                </svg>
              </div>
            </div>

            {/* Right Cards Showcase with Light Pastels */}
            <div className="lg:col-span-9">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {sampleHouses.map((house) => (
                  <div
                    key={house.id}
                    className="bg-white rounded-2xl border border-amber-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition group"
                  >
                    {/* Image with Select Badge & Actions */}
                    <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                      <img
                        src={house.image}
                        alt={house.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />

                      {/* Select Premium Light Yellow Ribbon Badge */}
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-amber-100/95 backdrop-blur-sm text-amber-900 border border-amber-300 text-[10px] font-bold rounded-md flex items-center gap-1 shadow-xs">
                        <span className="italic font-serif">Select</span> Premium
                      </div>

                      {/* Top Right Action Icons */}
                      <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5">
                        <button
                          type="button"
                          className="p-1.5 bg-white/90 hover:bg-white backdrop-blur-sm text-slate-700 rounded-full shadow-sm transition"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(house.id)}
                          className="p-1.5 bg-white/90 hover:bg-white backdrop-blur-sm text-slate-700 rounded-full shadow-sm transition"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              favorites[house.id] ? 'fill-rose-500 text-rose-500' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Carousel Arrow Controls */}
                      <button
                        type="button"
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow transition"
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

                    {/* Card Body in Light Yellow Warm Tone */}
                    <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-amber-50/20">
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug">
                          {house.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">{house.type}</p>
                        <p className="text-[11px] text-sky-600 font-semibold flex items-center gap-1 mt-0.5">
                          {house.apartment} <ExternalLink className="w-3 h-3" />
                        </p>

                        {/* Amenities Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {house.amenities.map((amenity, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-sky-50 text-sky-800 border border-sky-100 rounded text-[10px] font-medium flex items-center gap-1"
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
                          className="mt-2.5 w-full block py-2 text-center text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition"
                        >
                          Visit For FREE
                        </Link>
                      </div>
                    </div>

                    {/* Bottom Discount Ribbon */}
                    <div className="bg-emerald-50 px-3 py-1.5 border-t border-emerald-100 text-center">
                      <span className="text-[10px] font-bold text-emerald-800 flex items-center justify-center gap-1">
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

      {/* Floating CTA WhatsApp Button in Light Green/Teal */}
      <a
        href="https://wa.me/?text=Hello%20PropManageHub,%20I%20am%20looking%20for%20a%20rental%20property"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl font-bold text-xs transition duration-300 transform hover:scale-105"
      >
        <MessageCircle className="w-4 h-4 fill-white" />
        <span>Find Your Perfect Home</span>
      </a>

      {/* Key Features Section with Light Pastel Cards */}
      <section id="features" className="py-20 bg-gradient-to-b from-white via-sky-50/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-sky-600">Enterprise Grade Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Engineered for End-to-End Real Estate Management
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Light Blue Card */}
            <div className="bg-gradient-to-br from-white to-sky-50/70 p-6 rounded-2xl border border-sky-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Property & Units</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Granular multi-unit tracking, automated vacancy status, occupancy rates, and architectural details.
              </p>
            </div>

            {/* Light Green Card */}
            <div className="bg-gradient-to-br from-white to-emerald-50/70 p-6 rounded-2xl border border-emerald-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-5">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Rent & Payments</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Instant digital receipts, automated overdue detection, ledger auditing, and multi-channel payment logs.
              </p>
            </div>

            {/* Light Yellow Card */}
            <div className="bg-gradient-to-br from-white to-amber-50/70 p-6 rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-5">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Maintenance Tickets</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Tenant request triage, priority matrix, manager assignments, status lifecycle, and cost auditing.
              </p>
            </div>

            {/* Light Purple / Lavender Card */}
            <div className="bg-gradient-to-br from-white to-purple-50/70 p-6 rounded-2xl border border-purple-200/80 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Lease Compliance</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                30-day and 60-day expiry radar, automated terms validation, deposit escrow status, and 1-click renewals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Four Dedicated Portals Section in Light Colors */}
      <section id="roles" className="py-20 bg-gradient-to-b from-sky-50/30 via-slate-50 to-emerald-50/30 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-sky-600">Tailored Experiences</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Four Purpose-Built Portals</p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Admin Portal: Light Blue Card */}
            <div className="p-6 rounded-2xl bg-sky-50/90 border border-sky-200 hover:border-sky-400 transition shadow-xs flex flex-col justify-between">
              <div>
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-sky-100 text-sky-800 border border-sky-200">
                  ADMIN
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-4">Platform Control</h3>
                <p className="text-xs text-slate-600 mt-2">
                  Manage global users, all property listings, system analytics, and exportable financial reports.
                </p>
              </div>
              <Link to="/login" className="mt-6 text-xs font-bold text-sky-600 flex items-center gap-1 hover:text-sky-700">
                Access Admin Portal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Owner Portal: Light Green Card */}
            <div className="p-6 rounded-2xl bg-emerald-50/90 border border-emerald-200 hover:border-emerald-400 transition shadow-xs flex flex-col justify-between">
              <div>
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                  PROPERTY OWNER
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-4">Asset Performance</h3>
                <p className="text-xs text-slate-600 mt-2">
                  Monitor occupancy, approve tenant applications, issue leases, and track incoming rental revenue.
                </p>
              </div>
              <Link to="/login" className="mt-6 text-xs font-bold text-emerald-600 flex items-center gap-1 hover:text-emerald-700">
                Access Owner Portal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Manager Portal: Light Yellow Card */}
            <div className="p-6 rounded-2xl bg-amber-50/90 border border-amber-200 hover:border-amber-400 transition shadow-xs flex flex-col justify-between">
              <div>
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
                  PROPERTY MANAGER
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-4">Day-to-Day Operations</h3>
                <p className="text-xs text-slate-600 mt-2">
                  Manage tenant relationships, coordinate vendor repairs, handle renewals, and record collections.
                </p>
              </div>
              <Link to="/login" className="mt-6 text-xs font-bold text-amber-700 flex items-center gap-1 hover:text-amber-800">
                Access Manager Portal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Tenant Portal: Light Purple Card */}
            <div className="p-6 rounded-2xl bg-purple-50/90 border border-purple-200 hover:border-purple-400 transition shadow-xs flex flex-col justify-between">
              <div>
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-100 text-purple-800 border border-purple-200">
                  TENANT
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-4">Resident Hub</h3>
                <p className="text-xs text-slate-600 mt-2">
                  Browse available units, submit digital applications, download rent receipts, and log service tickets.
                </p>
              </div>
              <Link to="/login" className="mt-6 text-xs font-bold text-purple-600 flex items-center gap-1 hover:text-purple-700">
                Access Tenant Portal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer in Light Colors */}
      <footer className="bg-slate-100/90 text-slate-600 py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-lg text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-slate-900">PropManageHub</span>
            <span className="text-xs bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
              B.Tech DevOps & Full Stack
            </span>
          </div>

          <div className="flex space-x-6 text-xs font-medium">
            <Link to="/login" className="hover:text-sky-600 transition">Sign In</Link>
            <Link to="/register" className="hover:text-sky-600 transition">Register</Link>
            <Link to="/browse" className="hover:text-sky-600 transition">Available Units</Link>
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
