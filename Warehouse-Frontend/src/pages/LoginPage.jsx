import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiEye, FiEyeOff, FiBox, FiArrowRight, FiShield, FiZap } from 'react-icons/fi';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);

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
      navigate('/dashboard');
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

  const fillCredentials = (user, pass, role) => {
    setUsername(user);
    setPassword(pass);
    setActiveDemo(role);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0" style={{ 
        backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-8xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-8xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-8xl animate-pulse-slow" />

      {/* Main Container */}
      <div className="relative w-full max-w-5xl flex flex-col lg:flex-row items-center gap-8 lg:gap-0">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col items-start text-white pr-12">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <FiBox className="text-white" size={22} />
              </div>
              <span className="text-white/60 text-sm font-medium tracking-wider">WMS</span>
            </div>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            <span className="bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
              Warehouse
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Management
            </span>
          </h1>
          
          <p className="text-lg text-white/40 leading-relaxed mb-8 max-w-md">
            Streamline your inventory, track shipments, and manage orders with precision. 
            The future of warehouse operations starts here.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3">
            {['Real-time Tracking', 'Smart Inventory', 'Multi-warehouse', 'QR Integration'].map((feature) => (
              <span key={feature} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/50">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="w-full lg:w-1/2 max-w-md mx-auto">
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-3xl blur opacity-40 group-hover:opacity-60 transition duration-500" />
            
            {/* Card */}
            <div className="relative bg-[#0f1420]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl shadow-lg mb-3">
                  <FiBox className="text-white" size={30} />
                </div>
                <h1 className="text-2xl font-bold text-white">Warehouse MS</h1>
              </div>

              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <FiShield className="text-blue-400" size={22} />
                  <h2 className="text-xl font-bold text-white">Secure Access</h2>
                </div>
                <p className="text-white/40 text-sm">Sign in to your account to continue</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-white/50 uppercase tracking-widest ml-1">
                    <FiUser size={12} /> Username
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within/input:opacity-100 transition duration-300" />
                    <input 
                      type="text" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="relative w-full px-4 py-3.5 bg-[#1a1f2e] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-white/50 uppercase tracking-widest ml-1">
                    <FiLock size={12} /> Password
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within/input:opacity-100 transition duration-300" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="relative w-full px-4 py-3.5 pr-12 bg-[#1a1f2e] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-all duration-300"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/30 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="relative w-full group/btn mt-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75 group-hover/btn:opacity-100 transition duration-300" />
                  <div className="relative flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-bold text-sm uppercase tracking-wider hover:from-blue-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-50">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Sign In
                        <FiArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <FiZap size={14} className="text-yellow-400" />
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Quick Access</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => fillCredentials('manager', 'manager123', 'manager')}
                    className={`relative group/demo p-4 rounded-2xl border transition-all duration-300 text-left ${
                      activeDemo === 'manager' 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${activeDemo === 'manager' ? 'bg-green-400' : 'bg-white/30'}`} />
                      <span className={`text-sm font-bold ${activeDemo === 'manager' ? 'text-green-300' : 'text-white/50'}`}>Manager</span>
                    </div>
                    <p className="text-xs text-white/30">manager</p>
                    <p className="text-xs text-white/30">manager123</p>
                  </button>
                  
                  <button 
                    onClick={() => fillCredentials('operator', 'operator123', 'operator')}
                    className={`relative group/demo p-4 rounded-2xl border transition-all duration-300 text-left ${
                      activeDemo === 'operator' 
                        ? 'bg-blue-500/10 border-blue-500/30' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${activeDemo === 'operator' ? 'bg-blue-400' : 'bg-white/30'}`} />
                      <span className={`text-sm font-bold ${activeDemo === 'operator' ? 'text-blue-300' : 'text-white/50'}`}>Operator</span>
                    </div>
                    <p className="text-xs text-white/30">operator</p>
                    <p className="text-xs text-white/30">operator123</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, -30px) scale(1.05); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 30px) scale(1.05); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-float { animation: float 12s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 15s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default LoginPage;