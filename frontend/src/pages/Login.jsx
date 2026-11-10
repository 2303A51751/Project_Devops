import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, ArrowRight, UserCheck, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleDemoFill = (email, password) => {
    setFormData({ email, password });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(formData);
      // Route by role
      const dashMap = {
        admin: '/admin/dashboard',
        owner: '/owner/dashboard',
        tenant: '/tenant/dashboard',
        manager: '/manager/dashboard',
      };
      const dest = location.state?.from?.pathname || dashMap[user.role] || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <Building2 className="w-7 h-7" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            PropManage<span className="text-blue-600">Hub</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-slate-900">
          Sign In to Your Portal
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Or{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </button>
          </form>

          {/* Quick Demo Logins Ribbon */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
              One-Click Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@propertymanager.com', 'admin123')}
                className="p-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-left transition font-medium flex items-center"
              >
                <Shield className="w-3.5 h-3.5 mr-1.5 text-blue-600 flex-shrink-0" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('owner1@test.com', 'owner123')}
                className="p-2 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-left transition font-medium flex items-center"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600 flex-shrink-0" />
                Owner
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('manager1@test.com', 'manager123')}
                className="p-2 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-left transition font-medium flex items-center"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1.5 text-amber-600 flex-shrink-0" />
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('tenant1@test.com', 'tenant123')}
                className="p-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-left transition font-medium flex items-center"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1.5 text-purple-600 flex-shrink-0" />
                Tenant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
