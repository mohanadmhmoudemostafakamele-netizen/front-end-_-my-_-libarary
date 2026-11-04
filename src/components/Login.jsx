import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, LogIn, Upload, Mail, Lock, User } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import cyberBg from '../assets/cyber-bg.jpg';

const LOGIN_COLOR = '#00f0ff';
const REGISTER_COLOR = '#ff0055';

/* اللون الحالي بيتحط كمتغير --c على الكارت، والحقول بتقرأه عند الـ focus */
const inputCls =
  'w-full pl-11 py-3.5 bg-[#0f1829] border border-[#1e2d48] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[color:var(--c)] focus:shadow-[0_0_18px_-6px_var(--c)] transition-all';

const Field = ({ icon: Icon, children }) => (
  <div className="relative group">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[color:var(--c)] transition-colors pointer-events-none" />
    {children}
  </div>
);

const Login = () => {
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [notice, setNotice] = useState('');

  const BRAND_NAME = "MOHAND LIBRARY";

  // معاينة صورة الأفاتار قبل الرفع
  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setNotice('');

    try {
      if (isRegistering) {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        if (username) formData.append('username', username);
        if (avatarFile) formData.append('avatar', avatarFile);

        await axios.post('http://127.0.0.1:8000/api/register/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        setSuccessMsg('Account created successfully! Please sign in.');
        setIsRegistering(false);
        setPassword('');
      } else {
        const response = await axios.post('http://127.0.0.1:8000/api/login/', {
          email: email,
          password: password
        });

        localStorage.setItem('email', response.data.email);
        localStorage.setItem('username', response.data.username);
        if (response.data.avatar) {
          localStorage.setItem('avatar', response.data.avatar);
        }

        navigate('/library');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (toRegister) => {
    if (toRegister === isRegistering) return;
    setIsRegistering(toRegister);
    setError('');
    setSuccessMsg('');
    setNotice('');
  };

  const themeColor = isRegistering ? REGISTER_COLOR : LOGIN_COLOR;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#050811] overflow-hidden font-mono p-4" dir="ltr">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-55 scale-100 filter brightness-75 contrast-125"
        style={{ backgroundImage: `url(${cyberBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#03050b] via-[#03050b]/30 to-[#03050b]/80" />

      {/* خطوط سكان خفيفة جداً فوق الخلفية */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 3px)'
        }}
      />

      <motion.div
        key={isRegistering ? 'register' : 'login'}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-[460px] p-5 sm:p-8"
      >
        {/* HUD Frames */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute left-0 top-6 bottom-6 w-[3px] transition-all duration-300"
            style={{ backgroundColor: themeColor, boxShadow: `0 0 12px ${themeColor}` }}
          />
          <div className="absolute left-0 top-2 w-3 h-3 border-l-2 border-t-2 transition-colors duration-300" style={{ borderColor: themeColor }} />
          <div className="absolute left-0 bottom-2 w-3 h-3 border-l-2 border-b-2 transition-colors duration-300" style={{ borderColor: themeColor }} />

          <div className="absolute right-0 top-12 bottom-12 w-[3px] bg-[#00f0ff] shadow-[0_0_12px_#00f0ff]" />
          <div className="absolute right-0 top-2 w-4 h-4 border-r-2 border-t-2 border-[#00f0ff]" />
          <div className="absolute right-0 bottom-2 w-4 h-4 border-r-2 border-b-2 border-[#00f0ff]" />

          <div className="absolute bottom-2 right-12 flex items-center gap-2 opacity-90">
            <span className="text-xs font-bold transition-colors duration-300" style={{ color: themeColor }}>+</span>
            <div className="w-24 h-[2px] transition-all duration-300" style={{ backgroundColor: themeColor, boxShadow: `0 0 8px ${themeColor}` }} />
          </div>
        </div>

        <div
          className="w-full bg-[#0c1322]/90 backdrop-blur-xl p-6 sm:p-8 cyber-card border shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col transition-all duration-300"
          style={{ borderColor: `${themeColor}40`, '--c': themeColor }}
        >

          {/* الهيدر */}
          <div className="flex flex-col items-center mb-7 select-none">
            <div className="w-14 h-14 mb-3 flex items-center justify-center relative">
              <div className="absolute inset-0 blur-md rounded-full" style={{ backgroundColor: `${themeColor}20` }} />
              {isRegistering ? (
                <UserPlus className="w-8 h-8 filter drop-shadow" style={{ color: themeColor }} />
              ) : (
                <LogIn className="w-8 h-8 filter drop-shadow" style={{ color: themeColor }} />
              )}
            </div>

            <h1 className="text-xl font-black tracking-[0.3em] text-white uppercase text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              {BRAND_NAME}
            </h1>

            <p className="mt-2 text-[11px] text-slate-500 text-center">
              {isRegistering ? '// create your reader profile' : '// authenticate to access the library'}
            </p>
          </div>

          {/* تبويب Sign in / Sign up */}
          <div className="grid grid-cols-2 mb-6 border select-none" style={{ borderColor: `${themeColor}30` }}>
            {[false, true].map((reg) => {
              const active = isRegistering === reg;
              const color = reg ? REGISTER_COLOR : LOGIN_COLOR;
              return (
                <button
                  key={String(reg)}
                  type="button"
                  onClick={() => switchMode(reg)}
                  className={`py-2.5 text-[11px] font-bold tracking-[0.25em] uppercase transition-all cursor-pointer ${
                    active ? '' : 'text-slate-500 hover:text-slate-200'
                  }`}
                  style={
                    active
                      ? { color, backgroundColor: `${color}18`, boxShadow: `inset 0 -2px 0 ${color}` }
                      : undefined
                  }
                >
                  {reg ? 'Sign up' : 'Sign in'}
                </button>
              );
            })}
          </div>

          {/* الرسائل */}
          {error && (
            <div className="w-full mb-4 px-3 py-2.5 bg-red-500/10 border-l-2 border-red-500 text-red-300 text-xs leading-relaxed">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="w-full mb-4 px-3 py-2.5 bg-emerald-500/10 border-l-2 border-emerald-400 text-emerald-300 text-xs leading-relaxed">
              {successMsg}
            </div>
          )}

          {notice && (
            <div className="w-full mb-4 px-3 py-2.5 bg-amber-500/10 border-l-2 border-amber-400 text-amber-200 text-xs leading-relaxed">
              {notice}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <Field icon={Mail}>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputCls} pr-4`}
              />
            </Field>

            {isRegistering && (
              <>
                <Field icon={User}>
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder="Username (optional)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`${inputCls} pr-4`}
                  />
                </Field>

                <label className="flex items-center gap-3 p-3 bg-[#0f1829] border border-dashed border-[#1e2d48] hover:border-[color:var(--c)] cursor-pointer transition-colors">
                  <div className="w-12 h-12 shrink-0 bg-[#0a1120] border border-[#1e2d48] flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div className="min-w-0 text-xs">
                    <p className="text-slate-200 truncate">
                      {avatarFile ? avatarFile.name : 'Upload profile avatar'}
                    </p>
                    <p className="text-slate-500 mt-0.5">.jpg / .png</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files[0] || null)}
                    className="hidden"
                  />
                </label>
              </>
            )}

            <Field icon={Lock}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputCls} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </Field>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              type="submit"
              className="w-full py-3.5 mt-1 font-black text-xs uppercase tracking-[0.25em] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
              style={{
                backgroundColor: themeColor,
                color: '#050811',
                boxShadow: `0 0 28px -6px ${themeColor}`
              }}
            >
              {loading && (
                <span className="w-3.5 h-3.5 border-2 border-[#050811] border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? 'PROCESSING' : (isRegistering ? 'CREATE ACCOUNT' : 'AUTHENTICATE')}
            </motion.button>
          </form>

          {/* السوشيال */}
          <div className="w-full mt-7 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex-1 h-px bg-slate-800" />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Or continue with</span>
              <span className="flex-1 h-px bg-slate-800" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNotice("Google sign-in isn't connected yet.")}
                className="flex items-center justify-center gap-2.5 py-3 bg-[#0f1829] hover:bg-[#162238] border border-[#1e2d48] hover:border-[color:var(--c)] text-xs font-semibold text-slate-200 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9c-.6-1-1-2.1-1-3.2z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.1L1.6 16c1.9 3.8 5.8 7 10.4 7z"/></svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => setNotice("GitHub sign-in isn't connected yet.")}
                className="flex items-center justify-center gap-2.5 py-3 bg-[#0f1829] hover:bg-[#162238] border border-[#1e2d48] hover:border-[color:var(--c)] text-xs font-semibold text-slate-200 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                <span>GitHub</span>
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;