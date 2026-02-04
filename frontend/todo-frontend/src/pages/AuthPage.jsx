import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Mail, Lock, Loader2, ArrowRight, Github, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@') || password.length < 3) {
      toast.error('Please enter valid credentials.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, { email, password });
      login(res.data.token);
      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
      navigate('/todos');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* Left Side - Artistic Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-20">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="url(#grad)" />
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor:"#6366f1", stopOpacity:1}} />
                        <stop offset="100%" style={{stopColor:"#a855f7", stopOpacity:1}} />
                    </linearGradient>
                </defs>
            </svg>
        </div>
        <div className="relative z-10 p-12 text-white max-w-lg">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl font-bold mb-6 leading-tight"
            >
                Focus on what <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">matters most.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-slate-400"
            >
                Experience a task manager that flows with you. Zero friction, complete clarity.
            </motion.p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
            
            {/* Header */}
            <div className="mb-8">
                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
                    <Lock className="text-white h-5 w-5" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">
                    {isLogin ? 'Welcome back' : 'Create an account'}
                </h2>
                <p className="text-slate-500 mt-2">
                    {isLogin ? 'Please enter your details.' : 'Start your 30-day free trial.'}
                </p>
            </div>

            {/* Social Logins (Visual Only) */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                    <Github size={18} /> GitHub
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                    <Chrome size={18} /> Google
                </button>
            </div>

            <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-400">Or continue with</span></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="email"
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-medium"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="password"
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-medium"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign in' : 'Get Started')}
                    {!loading && <ArrowRight size={18} />}
                </motion.button>
            </form>

            {/* Toggle */}
            <p className="mt-8 text-center text-sm text-slate-500">
                {isLogin ? "Don't have an account?" : "Already have an account?"} 
                <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-1.5 font-semibold text-indigo-600 hover:text-indigo-500"
                >
                    {isLogin ? "Sign up" : "Log in"}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
}