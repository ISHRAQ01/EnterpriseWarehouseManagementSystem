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
  const [cardTransform, setCardTransform] = useState({ rotateX: 0, rotateY: 0 });

  const { login } = useAuth();
  const navigate = useNavigate();

  // 3D Mouse Movement Effect
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    setCardTransform({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setCardTransform({ rotateX: 0, rotateY: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token } = response.data;
      login(token);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 
                    flex items-center justify-center p-4 perspective-1000 overflow-hidden relative">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full 
                        blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full 
                        blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                        w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* 3D Floating Card */}
      <div 
        className="relative w-full max-w-md transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${cardTransform.rotateX}deg) rotateY(${cardTransform.rotateY}deg)`,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Card Shadow/Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 
                        rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000" />
        
        {/* Main Card */}
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 
                        rounded-2xl p-8 shadow-2xl"
             style={{ transform: 'translateZ(50px)' }}>
          
          {/* 3D Logo Section */}
          <div className="text-center mb-8" style={{ transform: 'translateZ(30px)' }}>
            <div className="inline-flex items-center justify-center w-20 h-20 
                            bg-gradient-to-br from-blue-500 to-purple-600 
                            rounded-2xl shadow-lg shadow-blue-500/50 mb-4 
                            transform hover:scale-110 transition-transform duration-300
                            border border-white/30">
              <FiBox className="text-white drop-shadow-lg" size={40} 
                     style={{ transform: 'translateZ(20px)' }} />
            </div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
              Warehouse MS
            </h1>
            <p className="text-blue-200 text-sm">Secure Login Portal</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Username Input with 3D effect */}
            <div className="group" style={{ transform: 'translateZ(20px)' }}>
              <label className="block text-sm font-medium text-blue-200 mb-2 ml-1">
                Username
              </label>
              <div className="relative transform transition-all duration-300 
                            group-focus-within:scale-105 group-focus-within:shadow-lg">
                <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 
                                   text-blue-300" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 
                           rounded-xl text-white placeholder-blue-300/50
                           focus:outline-none focus:border-blue-400 focus:bg-white/20
                           transition-all duration-300 backdrop-blur-sm
                           shadow-inner"
                />
              </div>
            </div>

            {/* Password Input with 3D effect */}
            <div className="group" style={{ transform: 'translateZ(20px)' }}>
              <label className="block text-sm font-medium text-blue-200 mb-2 ml-1">
                Password
              </label>
              <div className="relative transform transition-all duration-300 
                            group-focus-within:scale-105 group-focus-within:shadow-lg">
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 
                                   text-blue-300" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 
                           rounded-xl text-white placeholder-blue-300/50
                           focus:outline-none focus:border-blue-400 focus:bg-white/20
                           transition-all duration-300 backdrop-blur-sm
                           shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 
                           text-blue-300 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* 3D Button */}
            <div style={{ transform: 'translateZ(40px)' }}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 
                              rounded-xl blur opacity-75 group-hover:opacity-100 
                              transition duration-200" />
                <div className="relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 
                              rounded-xl text-white font-bold text-lg shadow-xl
                              transform transition-all duration-200 
                              group-hover:translate-y-[-2px] group-active:translate-y-[1px]
                              flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent 
                                      rounded-full animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    'Sign In Securely'
                  )}
                </div>
              </button>
            </div>
          </form>

          {/* Test Credentials Card */}
          <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
               style={{ transform: 'translateZ(10px)' }}>
            <p className="text-xs text-blue-300 font-medium mb-3 uppercase tracking-wider">
              Demo Credentials
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2 bg-white/10 rounded-lg border border-white/10 
                            hover:bg-white/20 transition-colors cursor-pointer">
                <span className="text-purple-300 font-bold">Admin</span>
                <p className="text-white/70 mt-1">admin / admin123</p>
              </div>
              <div className="p-2 bg-white/10 rounded-lg border border-white/10 
                            hover:bg-white/20 transition-colors cursor-pointer">
                <span className="text-green-300 font-bold">Operator</span>
                <p className="text-white/70 mt-1">operator / op123</p>
              </div>
            </div>
          </div>

          {/* 3D Decorative Elements */}
          <div className="absolute -top-2 -right-2 w-20 h-20 bg-blue-500/20 rounded-full 
                          blur-2xl pointer-events-none" />
          <div className="absolute -bottom-2 -left-2 w-20 h-20 bg-purple-500/20 rounded-full 
                          blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* CSS for 3D Perspective */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;