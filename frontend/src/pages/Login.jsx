import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, ArrowRight, UserCheck, Shield, Key, CheckCircle2, X } from 'lucide-react';
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

  // Forgot Password Modal State
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: request token, 2: reset password
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState({ success: false, message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const executeLogin = async (credentials) => {
    setLoading(true);
    setError('');

    try {
      const user = await login(credentials);
      // Route by role
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
        message: 'Reset token generated! For demo evaluation, it has been auto-filled below.',
      });
      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken);
      }
      setForgotStep(2);
      toast.success('Reset token generated');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate reset token. User not found.';
      setForgotStatus({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetToken || !newPassword) {
      toast.error('Please provide both the reset token and your new password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setForgotLoading(true);

    try {
      await authAPI.resetPassword(resetToken, { password: newPassword });
      toast.success('Password successfully reset! You can now log in.');
      setFormData({
        email: forgotEmail,
        password: newPassword,
      });
      setIsForgotOpen(false);
      setForgotStep(1);
      setForgotEmail('');
      setResetToken('');
      setNewPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired reset token';
      toast.error(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const openForgotModal = () => {
    setForgotEmail(formData.email || '');
    setForgotStep(1);
    setForgotStatus({ success: false, message: '' });
    setResetToken('');
    setNewPassword('');
    setIsForgotOpen(true);
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
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={openForgotModal}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                >
                  Forgot password?
                </button>
              </div>
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

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
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
                className={`mx-5 mt-4 p-3 rounded-lg text-xs font-medium border ${
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Back to step 1
                  </button>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotOpen(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
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
    </div>
  );
};

export default Login;
