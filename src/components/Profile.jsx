import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, BookOpen, LogOut, Info, Edit3, Save, Camera, Cpu, Plus } from 'lucide-react';
import axios from 'axios';
import myPhoto from '../assets/Me.jpeg';
import cyberBg from '../assets/cyber-bg.jpg';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=300&q=80';

const DEFAULT_BIO = 'Full-Stack Developer & AI Enthusiast building modern user-centric interfaces.';
const BIO_MAX = 300;

const cardCls =
  'bg-[#140b2a]/90 border border-purple-500/20 rounded-2xl p-6 md:p-7 backdrop-blur-md';

const Label = ({ n, children }) => (
  <p className="font-mono text-[11px] tracking-[0.2em] uppercase flex items-center gap-2">
    <span className="text-fuchsia-400">{n}</span>
    <span className="text-purple-300/80">/ {children}</span>
  </p>
);

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [userBooks, setUserBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [commentsCount, setCommentsCount] = useState(0);

  const [bio, setBio] = useState('');
  const [savedBio, setSavedBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => {
    const storedUsername = localStorage.getItem('username') || 'Cyberpunk Netizen';
    const storedEmail = localStorage.getItem('email') || 'user@digital-library.net';

    let storedAvatar = localStorage.getItem('avatar') || '';
    if (storedAvatar && storedAvatar.startsWith('/')) {
      storedAvatar = `http://127.0.0.1:8000${storedAvatar}`;
    }

    const storedBio = localStorage.getItem('user_bio') || DEFAULT_BIO;

    setUsername(storedUsername);
    setEmail(storedEmail);
    setAvatar(storedAvatar);
    setBio(storedBio);
    setSavedBio(storedBio);

    // عدد تعليقاتك وردودك المحفوظة في المكتبة
    let count = 0;
    try {
      const all = JSON.parse(localStorage.getItem('book_comments_repo') || '{}');
      Object.values(all).forEach((list) => {
        list.forEach((c) => {
          if (c.user === storedUsername) count += 1;
          (c.replies || []).forEach((r) => {
            if (r.user === storedUsername) count += 1;
          });
        });
      });
    } catch (err) {
      console.error(err);
    }
    setCommentsCount(count);

    fetchUserBooks(storedUsername);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchUserBooks = async (currentUsername) => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/books/');
      const myBooks = response.data.filter(book => book.username === currentUsername);
      setUserBooks(myBooks);
    } catch (error) {
      console.error('Error fetching user books:', error);
    } finally {
      setBooksLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setAvatar(base64String);
        try {
          localStorage.setItem('avatar', base64String);
          showToast('Profile picture updated.');
        } catch (err) {
          console.error(err);
          showToast('Image is too large to save. Try a smaller one.', 'error');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBio = () => {
    localStorage.setItem('user_bio', bio);
    setSavedBio(bio);
    setIsEditingBio(false);
    showToast('Bio saved.');
  };

  const handleCancelBio = () => {
    setBio(savedBio);
    setIsEditingBio(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navLink = (to, title, Icon) => (
    <Link
      to={to}
      className={`p-3 rounded-full transition-all flex items-center justify-center ${
        location.pathname === to
          ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.7)] scale-110'
          : 'text-slate-400 hover:text-purple-300 hover:bg-purple-950/40'
      }`}
      title={title}
    >
      <Icon className="w-4 h-4" />
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-sans relative overflow-hidden pb-40" dir="ltr">

      {/* الخلفية */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45 filter brightness-75 contrast-125 pointer-events-none"
        style={{ backgroundImage: `url(${cyberBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#03050b] via-[#03050b]/80 to-[#03050b]/90 pointer-events-none" />

      {/* الدوك */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex justify-center px-4">
        <div className="bg-[#120a24]/95 backdrop-blur-2xl border border-purple-500/40 shadow-[0_15px_50px_rgba(112,26,238,0.4)] px-6 py-3 rounded-full flex items-center gap-6 md:gap-10 transition-all">

          <Link to="/library" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform">
              <img src={myPhoto} alt="Logo" className="w-full h-full object-cover" />
            </div>
          </Link>

          <div className="flex items-center gap-3 md:gap-5">
            {navLink('/library', 'Library', BookOpen)}
            {navLink('/ai-chat', 'AI Summarizer Agent', Cpu)}
            {navLink('/profile', 'User Profile', User)}
            {navLink('/about', 'About Developer', Info)}

            <button
              onClick={handleLogout}
              className="p-3 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all flex items-center justify-center cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.message}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="fixed top-6 right-6 z-[60] max-w-sm"
          >
            <div className="flex items-stretch bg-[#120a24] border border-purple-500/40 rounded-xl overflow-hidden shadow-2xl">
              <span className={`w-1.5 ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-400'}`} />
              <p className="px-4 py-3 text-sm text-slate-100">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* المحتوى */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 md:pt-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ===== كارت الهوية ===== */}
        <aside className="lg:col-span-4 lg:sticky lg:top-8 self-start">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="rounded-2xl overflow-hidden border border-purple-500/25 bg-[#140b2a]/90 backdrop-blur-md"
          >
            <div className="h-28 bg-gradient-to-br from-[#5b3eb4] to-[#3a2096] relative">
              <span className="absolute top-4 left-5 font-mono text-[11px] tracking-[0.25em] uppercase text-purple-100/80">
                User profile
              </span>
            </div>

            <div className="px-6 pb-6">
              <div className="relative -mt-14 w-28 h-28">
                <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-[#140b2a] bg-[#100622] flex items-center justify-center">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={() => setAvatar('')}
                    />
                  ) : (
                    <User className="w-12 h-12 text-purple-400" />
                  )}
                </div>

                <label
                  className="absolute -bottom-1 -right-1 p-2 rounded-full bg-purple-600 hover:bg-purple-500 border-2 border-[#140b2a] cursor-pointer transition-colors"
                  title="Change photo"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              <h1 className="mt-4 text-2xl font-black text-white break-words">{username}</h1>
              <p className="mt-1.5 flex items-center gap-2 font-mono text-xs text-slate-400 break-all">
                <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                {email}
              </p>

              <div className="mt-6 pt-5 border-t border-purple-500/20 grid grid-cols-2">
                <div>
                  <p className="text-3xl font-black text-white leading-none">{userBooks.length}</p>
                  <p className="mt-1.5 font-mono text-[11px] uppercase tracking-widest text-slate-500">Books</p>
                </div>
                <div className="border-l border-purple-500/20 pl-5">
                  <p className="text-3xl font-black text-white leading-none">{commentsCount}</p>
                  <p className="mt-1.5 font-mono text-[11px] uppercase tracking-widest text-slate-500">Comments</p>
                </div>
              </div>
            </div>
          </motion.div>
        </aside>

        {/* ===== العمود الأيمن ===== */}
        <main className="lg:col-span-8 space-y-6 min-w-0">

          {/* Bio */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
            className={cardCls}
          >
            <div className="flex items-center justify-between gap-3 mb-5">
              <Label n="01">Bio</Label>

              {!isEditingBio ? (
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-purple-500/30 hover:border-purple-300/60 hover:bg-purple-950/50 text-purple-100 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit bio</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancelBio}
                    className="px-4 py-2 text-[13px] font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBio}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[13px] font-bold transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>

            {isEditingBio ? (
              <div>
                <textarea
                  rows="4"
                  dir="auto"
                  maxLength={BIO_MAX}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a short summary about yourself..."
                  className="w-full bg-[#1b1038] border border-purple-500/40 rounded-xl p-4 text-[15px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 resize-none leading-relaxed"
                />
                <p className="mt-1.5 text-right font-mono text-[11px] text-slate-500">
                  {bio.length}/{BIO_MAX}
                </p>
              </div>
            ) : (
              <p dir="auto" className="text-[15px] text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                {bio}
              </p>
            )}
          </motion.section>

          {/* الكتب المنشورة */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Label n="02">Published books</Label>
                <span className="font-mono text-xs text-slate-500">{userBooks.length}</span>
              </div>

              {userBooks.length > 0 && (
                <Link
                  to="/library"
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-purple-300 hover:text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add book
                </Link>
              )}
            </div>

            {booksLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1].map((i) => (
                  <div key={i} className="flex items-center gap-4 bg-[#140b2a]/80 border border-purple-500/15 rounded-2xl p-3 animate-pulse">
                    <div className="w-16 h-20 rounded-lg bg-purple-950/60 shrink-0" />
                    <div className="flex-1 space-y-2.5">
                      <div className="h-4 w-3/4 bg-purple-950/70 rounded" />
                      <div className="h-3 w-1/2 bg-purple-950/50 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!booksLoading && userBooks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userBooks.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center gap-4 bg-[#140b2a]/90 border border-purple-500/20 hover:border-purple-400/60 rounded-2xl p-3 pr-4 transition-all hover:-translate-y-0.5 backdrop-blur-md"
                  >
                    <img
                      src={book.cover_image || FALLBACK_COVER}
                      alt={book.title}
                      className="w-16 h-20 rounded-lg object-cover shrink-0 border border-purple-400/20"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-white line-clamp-1">{book.title}</h3>
                      <p className="text-[13px] text-purple-300 line-clamp-1">{book.author}</p>
                      <span className="inline-block mt-2 text-[11px] font-semibold text-purple-200 bg-purple-950/70 border border-purple-500/30 px-2 py-0.5 rounded-md">
                        {book.genre || 'General'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!booksLoading && userBooks.length === 0 && (
              <div className="flex flex-col items-center text-center py-14 px-6 border border-dashed border-purple-500/30 rounded-2xl bg-[#140b2a]/50">
                <BookOpen className="w-9 h-9 text-purple-500/70 mb-4" />
                <h3 className="text-base font-bold text-white">No published books yet</h3>
                <p className="mt-1 text-sm text-slate-400 max-w-xs">
                  Books you publish in the library will show up here.
                </p>
                <Link
                  to="/library"
                  className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Go to library
                </Link>
              </div>
            )}
          </motion.section>

        </main>

      </div>
    </div>
  );
};

export default Profile;