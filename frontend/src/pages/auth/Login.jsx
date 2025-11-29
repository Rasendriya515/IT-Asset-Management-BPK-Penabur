import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import schoolBg from '../../assets/images/school-bg.jpg';
import logoBpk from '../../assets/images/logo-bpk.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const response = await api.post('/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token, role } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('role', role);

      if (role === 'admin') {
        navigate('/dashboard');
      } else if (role === 'user') {
        navigate('/user/home');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error(err);
      setError('Username atau Password salah!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-blue-500">
      <div className="absolute inset-0 z-0">
        <img 
          src={schoolBg}
          alt="Background" 
          className="w-full h-full object-cover opacity-50 filter grayscale"
        />
        <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 mx-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
             <img 
               src={logoBpk}
               alt="Logo" 
               className="h-24 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform"
             />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-wide">IT ASSET MANAGEMENT</h1>
          <p className="text-sm text-gray-500 font-medium tracking-widest mt-1">BPK PENABUR</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 text-sm rounded-lg flex items-center border border-red-200 animate-pulse">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-3 top-3 text-gray-400 group-focus-within:text-penabur-blue transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Username"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-penabur-blue focus:border-transparent outline-none transition-all bg-white/50 focus:bg-white"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-penabur-blue transition-colors" size={20} />
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-penabur-blue focus:border-transparent outline-none transition-all bg-white/50 focus:bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-penabur-blue transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-penabur-blue hover:bg-penabur-dark text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/30 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            &copy; 2025 IT Asset Management - BPK PENABUR
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;