import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  Shield,
  Key,
  CheckCircle2,
  X,
  Search,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Home,
  Users,
  ExternalLink,
  Wind,
  Droplets,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hero filter tabs
  const [activeTab, setActiveTab] = useState('Rent');
  const [selectedCity, setSelectedCity] = useState('Hyderabad');
  const [heroSearch, setHeroSearch] = useState('');

  // Card Favorites
  const [favorites, setFavorites] = useState({});

  // Forgot Password Modal State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState({ success: false, message: '' });

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const executeLogin = async (credentials) => {
    setLoading(true);
    setError('');

    try {
      const user = await login(credentials);
      const dashMap = {
        admin: '/admin/dashboard',
        owner: '/owner/dashboard',
        tenant: '/tenant/dashboard',
        manager: '/manager/dashboard',
      };
      const dest = location.state?.from?.pathname || dashMap[user?.role] || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      let msg = err.response?.data?.message;
      if (!msg) {
        if (
          err.response?.status === 500 ||
          err.response?.status === 503 ||
          err.message?.includes('500') ||
          err.message?.includes('Network Error')
        ) {
          msg =
            'Backend server on port 5000 is not reachable. Please ensure the backend is running (cd backend && npm run dev, or run start-dev.bat).';
        } else {
          msg = err.message || 'Invalid email or password. Please try again.';
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (email, password) => {
    setFormData({ email, password });
    await executeLogin({ email, password });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }
    await executeLogin(formData);
  };

  const handleRequestToken = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your registered email address');
      return;
    }

    setForgotLoading(true);
    setForgotStatus({ success: false, message: '' });

    try {
      const res = await authAPI.forgotPassword({ email: forgotEmail });
      setForgotStatus({
        success: true,
        message:
          res.data?.message ||
          'Reset token generated! For demo purposes, the token has been auto-filled below.',
      });

      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken);
      }
      setForgotStep(2);
      toast.success('Reset token generated successfully!');
    } catch (err) {
      console.error('Forgot password error:', err);
      const msg = err.response?.data?.message || 'Failed to request password reset token.';
      setForgotStatus({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetToken || !newPassword) {
      toast.error('Please enter both the reset token and your new password.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authAPI.resetPassword(resetToken, { password: newPassword });
      toast.success(res.data?.message || 'Password reset successfully! Please sign in.');
      setIsForgotOpen(false);
      setFormData({ email: forgotEmail, password: newPassword });
    } catch (err) {
      console.error('Reset password error:', err);
      const msg = err.response?.data?.message || 'Password reset failed or token expired.';
      setForgotStatus({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const openForgotModal = () => {
    setForgotStep(1);
    setForgotEmail(formData.email || '');
    setResetToken('');
    setNewPassword('');
    setForgotStatus({ success: false, message: '' });
    setIsForgotOpen(true);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/20 to-emerald-50/20 font-sans text-slate-800 flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="p-2 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl text-white shadow-md shadow-sky-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                  PropManage<span className="text-sky-600">Hub</span>
                </span>
                <span className="text-[10px] font-bold tracking-wider text-amber-600 uppercase mt-0.5">
                  Select Living
                </span>
              </div>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
              <span className="px-3 py-1 bg-sky-50 border border-sky-200/80 rounded-full text-sky-800 flex items-center gap-1.5 cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {selectedCity}
              </span>
              <a href="#select-homes" className="hover:text-sky-600 transition">Select Homes</a>
              <Link to="/browse" className="hover:text-sky-600 transition">Explore Rentals</Link>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-sky-600 transition"
              >
                Create Account
              </Link>
              <a
                href="#login-card"
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Light Sunlit Palette */}
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

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading, Tabs, Search, and Stats */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900 drop-shadow-sm">
                Discover a place you'll love
              </h1>

              {/* Pill Tabs: Buy, Rent, Full House, Flatmates, Co-Living/ PG */}
              <div className="inline-flex flex-wrap items-center bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-sky-200/80 shadow-md gap-1">
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
              <div className="bg-white rounded-full shadow-xl shadow-sky-100/60 p-1.5 sm:p-2 flex items-center max-w-xl mx-auto lg:mx-0 border border-sky-200/80">
                {/* City Dropdown */}
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

                {/* Divider */}
                <div className="w-[1px] h-6 bg-slate-200 mx-1" />

                {/* Text Input */}
                <input
                  type="text"
                  placeholder="Search Locality, Landmark or Tech Park"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                />

                {/* Search Action Button */}
                <button
                  type="button"
                  onClick={() => navigate(`/browse?search=${encodeURIComponent(heroSearch)}`)}
                  className="p-2 sm:p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-sm transition flex-shrink-0"
                >
                  <Search className="w-4 h-4 sm:w-5 h-5" />
                </button>
              </div>

              {/* 3 Key Stats Counters with Light Green, Light Yellow, and Light Blue Cards */}
              <div className="pt-4 grid grid-cols-3 gap-3 sm:gap-6 max-w-lg mx-auto lg:mx-0">
                {/* Light Green Card */}
                <div className="p-3 bg-emerald-50/90 border border-emerald-200/80 rounded-2xl flex items-center space-x-2.5 shadow-xs">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 flex-shrink-0">
                    <Home className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">1,00,000+</p>
                    <p className="text-[10px] sm:text-[11px] text-emerald-800 font-medium">Homes Rented</p>
                  </div>
                </div>

                {/* Light Yellow Card */}
                <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex items-center space-x-2.5 shadow-xs">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-600 flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">2,00,000+</p>
                    <p className="text-[10px] sm:text-[11px] text-amber-800 font-medium">Happy Customers</p>
                  </div>
                </div>

                {/* Light Blue Card */}
                <div className="p-3 bg-sky-50/90 border border-sky-200/80 rounded-2xl flex items-center space-x-2.5 shadow-xs">
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

            {/* Right Column: Portal Sign In Card in Light Colors */}
            <div id="login-card" className="lg:col-span-5 max-w-md w-full mx-auto">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-sky-100/90 p-6 sm:p-8">
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center p-2.5 bg-sky-50 text-sky-600 rounded-2xl mb-2 border border-sky-200/70">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Sign In to Your Portal
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Or{' '}
                    <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700">
                      create a new account
                    </Link>
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r-xl">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={openForgotModal}
                        className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 transition"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 transition"
                  >
                    {loading ? 'Authenticating...' : 'Sign In'}
                    {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </button>
                </form>

                {/* One-Click Instant Demo Credentials Ribbon with Light Pastel Buttons */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2.5">
                    One-Click Demo Credentials
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Admin: Light Blue */}
                    <button
                      type="button"
                      onClick={() => handleDemoFill('admin@propertymanager.com', 'admin123')}
                      className="p-2 border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl text-left transition font-semibold flex items-center justify-between shadow-xs"
                    >
                      <span className="flex items-center">
                        <Shield className="w-3.5 h-3.5 mr-1.5 text-sky-600 flex-shrink-0" />
                        Admin
                      </span>
                      <span className="text-[10px] text-sky-500 font-normal">Instant</span>
                    </button>

                    {/* Owner: Light Green */}
                    <button
                      type="button"
                      onClick={() => handleDemoFill('owner1@test.com', 'owner123')}
                      className="p-2 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-left transition font-semibold flex items-center justify-between shadow-xs"
                    >
                      <span className="flex items-center">
                        <UserCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600 flex-shrink-0" />
                        Owner
                      </span>
                      <span className="text-[10px] text-emerald-500 font-normal">Instant</span>
                    </button>

                    {/* Manager: Light Yellow */}
                    <button
                      type="button"
                      onClick={() => handleDemoFill('manager1@test.com', 'manager123')}
                      className="p-2 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-left transition font-semibold flex items-center justify-between shadow-xs"
                    >
                      <span className="flex items-center">
                        <UserCheck className="w-3.5 h-3.5 mr-1.5 text-amber-600 flex-shrink-0" />
                        Manager
                      </span>
                      <span className="text-[10px] text-amber-500 font-normal">Instant</span>
                    </button>

                    {/* Tenant: Light Lavender */}
                    <button
                      type="button"
                      onClick={() => handleDemoFill('tenant1@test.com', 'tenant123')}
                      className="p-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-left transition font-semibold flex items-center justify-between shadow-xs"
                    >
                      <span className="flex items-center">
                        <UserCheck className="w-3.5 h-3.5 mr-1.5 text-purple-600 flex-shrink-0" />
                        Tenant
                      </span>
                      <span className="text-[10px] text-purple-500 font-normal">Instant</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section in Light Palette */}
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
                Nestaway Select brings you premium, fully furnished homes maintained by Nestaway - designed for comfort, convenience, and a seamless move-in experience.
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

            {/* Right Cards Showcase in Warm Light Yellow / Pastel */}
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

                    {/* Card Body */}
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

      {/* Floating CTA WhatsApp Button in Light Green */}
      <a
        href="https://wa.me/?text=Hello%20PropManageHub,%20I%20am%20looking%20for%20a%20rental%20property"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl font-bold text-xs transition duration-300 transform hover:scale-105"
      >
        <MessageCircle className="w-4 h-4 fill-white" />
        <span>Find Your Perfect Home</span>
      </a>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-sky-50 to-emerald-50">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-sky-100 text-sky-600 rounded-xl">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {forgotStep === 1 ? 'Reset Password' : 'Set New Password'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {forgotStep === 1
                      ? 'Step 1 of 2: Generate reset token'
                      : 'Step 2 of 2: Apply your new password'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsForgotOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotStatus.message && (
              <div
                className={`mx-5 mt-4 p-3 rounded-xl text-xs font-medium border ${
                  forgotStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                {forgotStatus.message}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestToken} className="p-5 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered account email. A secure reset token will be generated on the server.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. tenant1@test.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                  >
                    {forgotLoading ? 'Processing...' : 'Request Token'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste 64-char hex token"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Auto-filled from demo environment response
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs text-sky-600 hover:underline"
                  >
                    Back to step 1
                  </button>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotOpen(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
                    >
                      {forgotLoading ? 'Updating...' : 'Set New Password'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer in Light Colors */}
      <footer className="bg-slate-100/90 text-slate-600 py-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs">
          <p className="font-semibold text-slate-700">© {new Date().getFullYear()} PropManageHub. Property Rental and Tenant Management Platform.</p>
          <p className="mt-1 text-slate-500">Academic DevOps & Full Stack Course Project — B.Tech IV Year I Sem</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
