import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Mail, Lock, Loader2, ArrowRight, Github, Chrome, CheckCircle2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Password Strength Logic
  const getPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length > 5) strength += 1;
    if (pass.length > 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    return strength; // 0 to 4
  };
  const strength = getPasswordStrength(password);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes('@') || password.length < 3) {
      toast.error('Please check your credentials.');
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
    <div className="min-h-screen flex bg-white font-sans selection:bg-indigo-100">
      
      {/* LEFT SIDE: Artistic Brand Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-950 items-center justify-center">
        
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 opacity-40">
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-500 rounded-full mix-blend-multiply filter blur-[120px] animate-blob"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-indigo-500 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] bg-blue-500 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000"></div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10 p-12 w-full max-w-xl">
            {/* Floating Glass Card Effect */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-12 bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white">
                        <CheckCircle2 size={20} />
                    </div>
                    <div>
                        <div className="h-2.5 w-32 bg-white/20 rounded-full mb-2"></div>
                        <div className="h-2 w-20 bg-white/10 rounded-full"></div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-2 w-full bg-white/10 rounded-full"></div>
                    <div className="h-2 w-[90%] bg-white/10 rounded-full"></div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-indigo-200 text-sm font-medium">
                    <Sparkles size={16} /> "Productivity soared by 200%"
                </div>
            </motion.div>

            <h1 className="text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
                Master your day, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
                    one task at a time.
                </span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
                Join thousands of developers and designers who trust AlignTodo to keep their workflow clean, focused, and efficient.
            </p>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-8 lg:p-12 bg-white">
        <div className="w-full max-w-[400px]">
            
            {/* Brand Header */}
            <div className="mb-10 text-center lg:text-left">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 mb-6">
                    <Lock size={24} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {isLogin ? 'Welcome back' : 'Create an account'}
                </h2>
                <p className="text-slate-500 mt-3 text-base">
                    {isLogin ? 'Enter your details to access your workspace.' : 'Start your 30-day free trial. Cancel anytime.'}
                </p>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button className="flex items-center justify-center gap-2.5 h-12 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-medium text-slate-700">
                    <Github size={20} /> GitHub
                </button>
                <button className="flex items-center justify-center gap-2.5 h-12 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-medium text-slate-700">
                    <Chrome size={20} /> Google
                </button>
            </div>

            <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider"><span className="px-4 bg-white text-slate-400 font-medium">Or using email</span></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="email"
                            className="w-full pl-11 pr-4 h-12 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type={showPassword ? "text" : "password"}
                            className="w-full pl-11 pr-11 h-12 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* Password Strength Meter (Only on Signup) */}
                    {!isLogin && password.length > 0 && (
                        <div className="flex gap-1 h-1 mt-2">
                            {[1, 2, 3, 4].map((step) => (
                                <div 
                                    key={step} 
                                    className={`flex-1 rounded-full transition-all duration-300 ${
                                        strength >= step 
                                        ? (strength <= 2 ? 'bg-orange-400' : 'bg-emerald-500') 
                                        : 'bg-slate-100'
                                    }`} 
                                />
                            ))}
                        </div>
                    )}
                </div>

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-bold h-12 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 disabled:opacity-70"
                >
                    {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
                    {!loading && <ArrowRight size={18} />}
                </motion.button>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-slate-600">
                {isLogin ? "New to AlignTodo?" : "Already have an account?"} 
                <button 
                    onClick={() => { setIsLogin(!isLogin); setEmail(''); setPassword(''); }}
                    className="ml-2 font-semibold text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-2"
                >
                    {isLogin ? "Sign up for free" : "Log in"}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
}