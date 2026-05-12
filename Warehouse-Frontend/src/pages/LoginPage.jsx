import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiEye, FiEyeOff, FiBox } from 'react-icons/fi';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, role } = response.data;
      login(token, role);
      toast.success(`Welcome back, ${username}!`);
      
      if (role === 'OPERATOR') {
        navigate('/operator');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Invalid username or password');
      } else {
        toast.error('Server error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 
                    flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30" />
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
              <FiBox className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Warehouse MS</h1>
            <p className="text-blue-200 text-sm">Secure Login Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2 ml-1">Username</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300" size={20} />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2 ml-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300" size={20} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white">
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-bold text-lg hover:shadow-lg transition">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-xs text-blue-300 font-medium mb-3 uppercase tracking-wider">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div onClick={() => fillCredentials('manager', 'manager123')} className="p-2 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20">
                <span className="text-blue-300 font-bold">Manager</span>
                <p className="text-white/70 mt-1">manager / manager123</p>
              </div>
              <div onClick={() => fillCredentials('operator', 'operator123')} className="p-2 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20">
                <span className="text-green-300 font-bold">Operator</span>
                <p className="text-white/70 mt-1">operator / operator123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;