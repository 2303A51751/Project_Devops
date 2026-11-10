import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Verify token is still valid
          const response = await authAPI.getMe();
          const userData = response.data.data || response.data.user || response.data;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      // Support all backend response formats
      const authToken = response.data.token || response.data.data?.token;
      const userData =
        response.data.user ||
        response.data.data?.user ||
        response.data.data ||
        response.data;

      if (!authToken || !userData) {
        throw new Error('Authentication token or user data was not returned');
      }

      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      toast.success(`Welcome back, ${userData.name || 'User'}!`);
      return userData;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      throw error;
    }
  }, []);

  const register = useCallback(async (data) => {
    try {
      const response = await authAPI.register(data);
      toast.success('Registration successful! Please log in.');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateProfile = useCallback(async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data.data || response.data.user || response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully!');
      return updatedUser;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile.';
      toast.error(message);
      throw error;
    }
  }, []);

  const changePassword = useCallback(async (data) => {
    try {
      await authAPI.changePassword(data);
      toast.success('Password changed successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password.';
      toast.error(message);
      throw error;
    }
  }, []);

  const getDashboardPath = useCallback(() => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'owner': return '/owner/dashboard';
      case 'tenant': return '/tenant/dashboard';
      case 'manager': return '/manager/dashboard';
      default: return '/login';
    }
  }, [user]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    getDashboardPath,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
