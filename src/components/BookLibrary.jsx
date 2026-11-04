import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, BookOpen, Download, X, FileText, Image as ImageIcon,
  LogOut, Info, Cpu, User, MessageSquare, Send, CornerDownRight, Trash2
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import myPhoto from '../assets/Me.jpeg';
import cyberBg from '../assets/cyber-bg.jpg';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';

const inputCls =
  'w-full bg-[#1b1038] border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-colors';

const labelCls = 'block text-sm font-semibold text-slate-300 mb-1.5';

const initials = (name = '') => name.trim().slice(0, 2).toUpperCase() || '??';

/* غلاف موحد لكل المودالز: Escape + ضغط على الخلفية + حركة دخول وخروج */
const Modal = ({ onClose, maxW = 'max-w-xl', flex = false, children }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`relative w-full ${maxW} bg-[#140b2a] border border-purple-500/40 rounded-2xl p-6 md:p-8 shadow-[0_0_60px_rgba(147,51,234,0.25)] max-h-[90vh] ${
        flex ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'
      }`}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-purple-900/60 rounded-full transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
      {children}
    </motion.div>
  </motion.div>
);

const BookLibrary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // نظام التعليقات والردود
  const [activeBookForDiscussion, setActiveBookForDiscussion] = useState(null);
  const [comments, setComments] = useState({});
  const [newCommentText, setNewCommentText] = useState('');
  const [replyText, setReplyText] = useState({});

  // حالات الكتب
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coverPreview, setCoverPreview] = useState(null);
  const [publishing, setPublishing] = useState(false);

  // بديل alert و confirm
  const [toast, setToast] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);

  const categories = [
    'All',
    'Fiction & Literature',
    'History & Politics',
    'Philosophy & Psychology',
    'Science & Technology',
    'Business & Economy',
    'Self Development',
    'Arts & Drama'
  ];

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => {
    fetchBooks();
    const savedComments = localStorage.getItem('book_comments_repo');
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setActiveBookForDiscussion(null);
        setBookToDelete(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/books/');
      setBooks(response.data);
      setLoading(false);
    } catch (error) {
      console.log('Error fetching books:', error);
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Fiction & Literature',
    customCategory: '',
    description: '',
    coverFile: null,
    pdfFile: null,
  });

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, coverFile: file });
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, pdfFile: file });
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author) return;

    const finalCategory = formData.category === 'Other' && formData.customCategory
      ? formData.customCategory
      : formData.category;

    const data = new FormData();
    data.append('title', formData.title);
    data.append('author', formData.author);
    data.append('genre', finalCategory);
    data.append('description', formData.description || 'No description provided.');

    const currentUsername = localStorage.getItem('username') || localStorage.getItem('email') || 'CyberUser';
    if (currentUsername) {
      data.append('username', currentUsername);
    }

    if (formData.coverFile) data.append('cover_image', formData.coverFile);
    if (formData.pdfFile) data.append('pdf_file', formData.pdfFile);

    setPublishing(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/books/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBooks([response.data, ...books]);
      setIsModalOpen(false);
      setFormData({ title: '', author: '', category: 'Fiction & Literature', customCategory: '', description: '', coverFile: null, pdfFile: null });
      setCoverPreview(null);
      showToast('Book published successfully!');
    } catch (error) {
      console.error('Error uploading book:', error);
      showToast('Failed to connect to Django API. Make sure backend is running.', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const confirmDeleteBook = async () => {
    if (!bookToDelete) return;
    const bookId = bookToDelete.id;
    setBookToDelete(null);

    try {
      await axios.delete(`http://127.0.0.1:8000/api/books/${bookId}/`);
      setBooks((prev) => prev.filter((book) => book.id !== bookId));
      showToast('Book deleted successfully!');
    } catch (error) {
      console.error('Error deleting book:', error);
      showToast('Could not delete the book.', 'error');
    }
  };

  const handleAddComment = (bookId, e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const currentUser = localStorage.getItem('username') || localStorage.getItem('email') || 'Cyber Reader';
    const newCommentObj = {
      id: Date.now(),
      user: currentUser,
      text: newCommentText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      replies: []
    };

    const bookComments = comments[bookId] || [];
    const updatedBookComments = [newCommentObj, ...bookComments];
    const updatedAllComments = { ...comments, [bookId]: updatedBookComments };

    setComments(updatedAllComments);
    localStorage.setItem('book_comments_repo', JSON.stringify(updatedAllComments));
    setNewCommentText('');
  };

  const handleAddReply = (bookId, commentId, e) => {
    e.preventDefault();
    const replyTxt = replyText[commentId];
    if (!replyTxt || !replyTxt.trim()) return;

    const currentUser = localStorage.getItem('username') || localStorage.getItem('email') || 'Cyber Reader';
    const newReplyObj = {
      id: Date.now(),
      user: currentUser,
      text: replyTxt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const bookComments = comments[bookId] || [];
    const updatedBookComments = bookComments.map(comm => {
      if (comm.id === commentId) {
        return {
          ...comm,
          replies: [...comm.replies, newReplyObj]
        };
      }
      return comm;
    });

    const updatedAllComments = { ...comments, [bookId]: updatedBookComments };
    setComments(updatedAllComments);
    localStorage.setItem('book_comments_repo', JSON.stringify(updatedAllComments));
    setReplyText({ ...replyText, [commentId]: '' });
  };

  const filteredBooks = books.filter(book => {
    const bookCategory = book.genre || book.category;
    const matchesCategory = selectedCategory === 'All' || bookCategory === selectedCategory;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isBookOwner = (bookUsername) => {
    const currentUsername = localStorage.getItem('username');
    const currentEmail = localStorage.getItem('email');
    return (
      bookUsername === currentUsername ||
      bookUsername === currentEmail ||
      !bookUsername ||
      bookUsername === 'CyberUser'
    );
  };

  // التصنيفات المخصصة اللي المستخدمين أضافوها تظهر كـ pills كمان
  const extraCategories = [
    ...new Set(books.map((b) => b.genre || b.category).filter(Boolean)),
  ].filter((c) => !categories.includes(c));
  const shownCategories = [...categories, ...extraCategories];

  const countFor = (cat) =>
    cat === 'All'
      ? books.length
      : books.filter((b) => (b.genre || b.category) === cat).length;

  const isFiltering = selectedCategory !== 'All' || searchQuery.trim() !== '';

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
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex justify-center px-4">
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
            <Link
              to="/login"
              className="p-3 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all flex items-center justify-center"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Link>
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

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-12 space-y-8 relative z-10">

        {/* الهيدر */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-purple-500/20">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-purple-400 mb-3">
              Mohand digital repository
            </p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-none">
              Mohanad <span className="text-purple-300">Library</span>
            </h1>
            <p className="mt-3 font-mono text-xs text-slate-500">
              {loading ? 'Loading…' : `${books.length} ${books.length === 1 ? 'book' : 'books'} published`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/ai-chat')}
              className="flex items-center gap-2 px-5 py-3 border border-purple-500/40 hover:border-purple-300/70 hover:bg-purple-950/50 text-purple-100 rounded-xl font-semibold text-sm transition-all cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-fuchsia-400" />
              <span>AI Summarizer Agent</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm shadow-[0_0_25px_rgba(168,85,247,0.35)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Book</span>
            </button>
          </div>
        </header>

        {/* البحث والتصنيفات */}
        <div className="space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#140b2a]/90 border border-purple-500/30 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition-colors backdrop-blur-md"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {shownCategories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    active
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'border-purple-500/25 text-slate-300 hover:border-purple-400/60 hover:text-white'
                  }`}
                >
                  {cat}
                  <span className={`ml-2 font-mono text-[11px] ${active ? 'text-purple-200' : 'text-slate-500'}`}>
                    {countFor(cat)}
                  </span>
                </button>
              );
            })}
          </div>

          {isFiltering && !loading && (
            <p className="font-mono text-xs text-slate-500">
              Showing {filteredBooks.length} of {books.length}
            </p>
          )}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#140b2a]/80 border border-purple-500/15 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[4/5] bg-purple-950/50" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 bg-purple-950/70 rounded" />
                  <div className="h-3 w-1/2 bg-purple-950/50 rounded" />
                  <div className="h-3 w-full bg-purple-950/40 rounded" />
                  <div className="h-10 w-full bg-purple-950/60 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredBooks.length === 0 && (
          <div className="flex flex-col items-center text-center py-20 px-6 border border-dashed border-purple-500/30 rounded-2xl bg-[#140b2a]/50">
            <BookOpen className="w-10 h-10 text-purple-500/70 mb-4" />
            <h3 className="text-lg font-bold text-white">
              {books.length === 0 ? 'No books yet' : 'No books match your search'}
            </h3>
            <p className="mt-1 text-sm text-slate-400 max-w-sm">
              {books.length === 0
                ? 'The library is empty. Publish the first book to get it started.'
                : 'Try a different title, author, or category.'}
            </p>
            {books.length === 0 ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Book
              </button>
            ) : (
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="mt-6 px-5 py-2.5 border border-purple-500/40 hover:bg-purple-950/50 text-purple-100 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* الكتب */}
        {!loading && filteredBooks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredBooks.map((book) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="group flex flex-col bg-[#140b2a]/90 border border-purple-500/20 hover:border-purple-400/60 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 backdrop-blur-md"
              >
                <div className="relative aspect-[4/5] bg-[#0d071b] overflow-hidden">
                  <img
                    src={book.cover_image || FALLBACK_COVER}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-[#0d071b]/90 border border-purple-400/30 text-purple-200 text-[11px] font-semibold px-2.5 py-1 rounded-md">
                    {book.genre || 'General'}
                  </span>
                </div>

                <div className="flex flex-col flex-1 p-4 gap-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-purple-300 line-clamp-1">{book.author}</p>
                    <p className="text-[13px] text-slate-400 line-clamp-2 leading-relaxed pt-1">
                      {book.description}
                    </p>
                  </div>

                  <div className="mt-auto space-y-2 pt-2">
                    {book.pdf_file ? (
                      <a
                        href={book.pdf_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </a>
                    ) : (
                      <span className="flex items-center justify-center gap-2 w-full py-2.5 bg-purple-950/40 text-slate-500 rounded-xl text-sm font-semibold cursor-not-allowed border border-purple-500/10">
                        <Download className="w-4 h-4" />
                        <span>No PDF attached</span>
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveBookForDiscussion(book)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 border border-purple-500/30 hover:border-purple-400/60 hover:bg-purple-950/50 text-purple-100 rounded-xl text-[13px] font-semibold transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Discussion</span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {comments[book.id]?.length || 0}
                        </span>
                      </button>

                      {isBookOwner(book.username) && (
                        <button
                          onClick={() => setBookToDelete(book)}
                          aria-label={`Delete ${book.title}`}
                          title="Delete book"
                          className="p-2.5 border border-rose-500/25 hover:border-rose-400/60 hover:bg-rose-950/50 text-rose-300 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {!isBookOwner(book.username) && (
                      <p className="font-mono text-[11px] text-slate-500 truncate">
                        By {book.username || 'System'}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>

      {/* Add Book Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Modal key="add-book" onClose={() => setIsModalOpen(false)}>
            <h2 className="text-2xl font-black text-white mb-1">Publish new book</h2>
            <p className="text-sm text-slate-400 mb-6">Add a book to the repository.</p>

            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className={labelCls}>Book Title</label>
                <input
                  type="text"
                  required
                  placeholder="Enter book title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Author Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Author name"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={inputCls}
                  >
                    {categories.filter(c => c !== 'All').map((c, i) => (
                      <option key={i} value={c} className="bg-[#160d30] text-white">{c}</option>
                    ))}
                    <option value="Other" className="bg-[#160d30] text-white">Other...</option>
                  </select>
                </div>
              </div>

              {formData.category === 'Other' && (
                <div>
                  <label className={labelCls}>Custom Category</label>
                  <input
                    type="text"
                    placeholder="Enter new category..."
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    className={inputCls}
                  />
                </div>
              )}

              <div>
                <label className={labelCls}>Cover Image</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#1b1038] border border-dashed border-purple-500/40 hover:border-purple-400 rounded-xl cursor-pointer text-sm text-slate-300 hover:text-white transition-all">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    <span className="truncate">{formData.coverFile ? formData.coverFile.name : 'Select cover (.jpg / .png)'}</span>
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                  {coverPreview && (
                    <img src={coverPreview} alt="Preview" className="w-12 h-14 rounded-lg object-cover border border-purple-400/50" />
                  )}
                </div>
              </div>

              <div>
                <label className={labelCls}>Book PDF File</label>
                <label className="flex items-center justify-center gap-2 p-3 bg-[#1b1038] border border-dashed border-purple-500/40 hover:border-purple-400 rounded-xl cursor-pointer text-sm text-slate-300 hover:text-white transition-all">
                  <FileText className="w-4 h-4 text-fuchsia-400" />
                  <span className="truncate">{formData.pdfFile ? formData.pdfFile.name : 'Select PDF file (.pdf)'}</span>
                  <input type="file" accept=".pdf" onChange={handlePdfChange} className="hidden" />
                </label>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows="3"
                  placeholder="Short description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  {publishing ? 'Publishing…' : 'Publish book'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Discussion Modal */}
      <AnimatePresence>
        {activeBookForDiscussion && (
          <Modal key="discussion" maxW="max-w-2xl" flex onClose={() => setActiveBookForDiscussion(null)}>
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-purple-500/20 pr-10">
              <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-purple-400/40">
                <img
                  src={activeBookForDiscussion.cover_image || FALLBACK_COVER}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-black text-white truncate">{activeBookForDiscussion.title}</h2>
                <p className="text-sm text-purple-300">Community discussion & reviews</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-2 mb-4 min-h-[120px]">
              {comments[activeBookForDiscussion.id]?.length > 0 ? (
                comments[activeBookForDiscussion.id].map((comm) => (
                  <div key={comm.id} className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-600/30 border border-purple-400/40 text-purple-100 text-xs font-bold flex items-center justify-center shrink-0">
                      {initials(comm.user)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-white truncate">{comm.user}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{comm.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed break-words">{comm.text}</p>

                      {comm.replies && comm.replies.length > 0 && (
                        <div className="pl-4 border-l-2 border-purple-500/30 space-y-3 pt-1">
                          {comm.replies.map((rep) => (
                            <div key={rep.id} className="space-y-0.5">
                              <div className="flex items-baseline gap-2">
                                <span className="text-[13px] font-bold text-purple-200 truncate">{rep.user}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{rep.timestamp}</span>
                              </div>
                              <p className="text-[13px] text-slate-300 break-words">{rep.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <form
                        onSubmit={(e) => handleAddReply(activeBookForDiscussion.id, comm.id, e)}
                        className="flex items-center gap-2 pt-1"
                      >
                        <CornerDownRight className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <input
                          type="text"
                          placeholder="Write a reply..."
                          value={replyText[comm.id] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [comm.id]: e.target.value })}
                          className="w-full bg-[#1b1038] border border-purple-500/25 rounded-lg px-3 py-1.5 text-[13px] text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[13px] font-semibold transition-colors cursor-pointer"
                        >
                          Reply
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No reviews yet. Be the first to share your thoughts about this book.
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => handleAddComment(activeBookForDiscussion.id, e)}
              className="flex items-center gap-2 pt-4 border-t border-purple-500/20"
            >
              <input
                type="text"
                placeholder="Write a review or comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className={inputCls}
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Post</span>
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {bookToDelete && (
          <Modal key="delete" maxW="max-w-sm" onClose={() => setBookToDelete(null)}>
            <h2 className="text-xl font-black text-white">Delete this book?</h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">{bookToDelete.title}</span> will be removed from the library. This can't be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setBookToDelete(null)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBook}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

    </div>
  );
};

export default BookLibrary;