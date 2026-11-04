import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Send,
  ArrowLeft,
  FileText,
  Cpu,
  Paperclip,
  X,
  BookOpen,
  User,
  Info,
  LogOut,
  Copy,
  Check
} from 'lucide-react';

import cyberBg from '../assets/cyber-bg.jpg';
import myPhoto from '../assets/Me.jpeg';

const SUGGESTIONS = [
  'Summarize this book',
  'List the key ideas',
  'Explain it in simple terms',
  'Create study questions'
];

const formatSize = (bytes) =>
  bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/* تنسيق خفيف لردود الـ AI: **bold** و `code` و قوائم و عناوين و ```code``` من غير أي مكتبة */
const renderInline = (text) =>
  text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-[#0d071b] border border-purple-500/20 font-mono text-[13px] text-fuchsia-200">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });

const FormattedText = ({ text }) => {
  const blocks = [];
  let list = null;
  let code = null;

  const flushList = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  text.split('\n').forEach((line) => {
    if (line.trim().startsWith('```')) {
      if (code) {
        blocks.push(code);
        code = null;
      } else {
        flushList();
        code = { type: 'code', lines: [] };
      }
      return;
    }
    if (code) {
      code.lines.push(line);
      return;
    }

    const ul = line.match(/^\s*[-*•]\s+(.*)/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)/);
    if (ul || ol) {
      const type = ul ? 'ul' : 'ol';
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push((ul || ol)[1]);
      return;
    }

    flushList();
    if (line.trim() === '') return;

    const h = line.match(/^#{1,3}\s+(.*)/);
    blocks.push(h ? { type: 'h', text: h[1] } : { type: 'p', text: line });
  });

  flushList();
  if (code) blocks.push(code);

  return (
    <div className="space-y-2.5">
      {blocks.map((b, i) => {
        if (b.type === 'h') {
          return <h4 key={i} dir="auto" className="font-bold text-white text-base pt-1">{renderInline(b.text)}</h4>;
        }
        if (b.type === 'ul') {
          return (
            <ul key={i} dir="auto" className="list-disc list-inside space-y-1">
              {b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}
            </ul>
          );
        }
        if (b.type === 'ol') {
          return (
            <ol key={i} dir="auto" className="list-decimal list-inside space-y-1">
              {b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}
            </ol>
          );
        }
        if (b.type === 'code') {
          return (
            <pre key={i} dir="ltr" className="p-3 rounded-lg bg-[#0d071b] border border-purple-500/20 font-mono text-[13px] text-slate-200 overflow-x-auto">
              {b.lines.join('\n')}
            </pre>
          );
        }
        return <p key={i} dir="auto" className="whitespace-pre-wrap">{renderInline(b.text)}</p>;
      })}
    </div>
  );
};

export default function BookChatPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'مرحباً بك في وحدة الذكاء الاصطناعي السيبرانية (Mohanad AI Agent)! قم برفع كتاب PDF أو أي ملف، واسألني عن أي تفاصيل وسأقوم بتحليله والرد عليك فوراً.'
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // النزول تلقائياً لآخر رسالة عند وصول رسالة جديدة
  useEffect(() => {
    const container = chatContainerRef.current;

    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  const canSend = !loading && (inputPrompt.trim() || attachedFile);

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  // إرسال الرسائل والملفات إلى Django Backend
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (loading) return;
    if (!inputPrompt.trim() && !attachedFile) return;

    const userMsg = inputPrompt;
    const currentFile = attachedFile;

    setMessages(prev => [
      ...prev,
      {
        sender: 'user',
        text: userMsg,
        file: currentFile ? currentFile.name : null
      }
    ]);

    setInputPrompt('');
    setAttachedFile(null);
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const formData = new FormData();

      if (currentFile) {
        formData.append('pdf_file', currentFile);
      }

      formData.append('prompt', userMsg || 'تحليل هذا الملف');

      const response = await axios.post(
        'http://127.0.0.1:8000/api/ai-summarize/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const aiReply =
        response.data.summary ||
        response.data.output ||
        response.data.message ||
        'تم استلام تحليل الإيجنت بنجاح.';

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply
        }
      ]);

    } catch (err) {
      console.error(err);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          isError: true,
          text: 'حدث خطأ في الاتصال بالسيرفر السيبراني. تأكد من تشغيل الباك إند.'
        }
      ]);

    } finally {
      setLoading(false);
    }
  };

  // Enter يرسل، و Shift+Enter سطر جديد
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (canSend) handleSendMessage(e);
    }
  };

  const handleInputChange = (e) => {
    setInputPrompt(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const navLink = (to, title, Icon) => (
    <Link
      to={to}
      className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
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
    <div
      className="flex flex-col h-screen min-h-0 bg-[#050811] text-white font-sans relative overflow-hidden"
      dir="ltr"
    >

      {/* الخلفية */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45 filter brightness-75 contrast-125 pointer-events-none"
        style={{ backgroundImage: `url(${cyberBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#03050b] via-[#03050b]/80 to-[#03050b]/90 pointer-events-none" />

      {/* الهيدر */}
      <header className="flex items-center justify-between px-4 md:px-8 py-3.5 border-b border-purple-500/20 bg-[#0d071b]/85 backdrop-blur-md relative z-20 shrink-0">

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/library')}
            className="border border-purple-500/30 hover:border-purple-300/60 hover:bg-purple-950/50 text-purple-200 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Library</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/25 border border-purple-400/40 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-fuchsia-300" />
            </div>
            <h1 className="text-sm md:text-base font-black tracking-wide text-white">
              MOHAND AI CHATBOT AGENT
            </h1>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Secure Cyber Agent Active
        </div>

      </header>

      {/* الرسائل */}
      <main
        ref={chatContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 md:p-8 space-y-6 max-w-4xl w-full mx-auto relative z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
      >

        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';

          return (
            <div key={index} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>

              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-purple-600/25 border border-purple-400/40 flex items-center justify-center shrink-0 mt-1">
                  <Cpu className="w-4 h-4 text-fuchsia-300" />
                </div>
              )}

              <div className="max-w-[88%] md:max-w-2xl min-w-0">
                <div
                  className={`text-[15px] leading-relaxed break-words ${
                    isUser
                      ? 'bg-purple-600 text-white rounded-2xl rounded-br-md px-5 py-3.5'
                      : `bg-[#140b2a]/95 backdrop-blur-md text-slate-200 rounded-2xl rounded-bl-md px-5 py-4 border ${
                          msg.isError ? 'border-rose-500/40' : 'border-purple-500/25'
                        }`
                  }`}
                >
                  {isUser ? (
                    <>
                      {msg.file && (
                        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg bg-black/25 text-xs">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{msg.file}</span>
                        </div>
                      )}
                      {msg.text && (
                        <p dir="auto" className="whitespace-pre-wrap">{msg.text}</p>
                      )}
                    </>
                  ) : (
                    <FormattedText text={msg.text} />
                  )}
                </div>

                {!isUser && index > 0 && !msg.isError && (
                  <button
                    onClick={() => handleCopy(msg.text, index)}
                    className="mt-1.5 ml-1 flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-purple-300 transition-colors cursor-pointer"
                  >
                    {copiedIndex === index ? (
                      <><Check className="w-3 h-3" /> Copied</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy</>
                    )}
                  </button>
                )}

                {/* اقتراحات جاهزة تظهر مع أول رسالة بس */}
                {index === 0 && messages.length === 1 && !loading && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setInputPrompt(s);
                          textareaRef.current?.focus();
                        }}
                        className="px-3.5 py-2 rounded-full border border-purple-500/30 hover:border-purple-400/70 hover:bg-purple-950/50 text-[13px] text-slate-200 transition-colors cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          );
        })}

        {/* مؤشر التحميل */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-purple-600/25 border border-purple-400/40 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4 text-fuchsia-300" />
            </div>

            <div className="bg-[#140b2a]/95 border border-purple-500/25 rounded-2xl rounded-bl-md px-5 py-4 flex items-center gap-3 backdrop-blur-md">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-slate-400">Analyzing and generating a response…</span>
            </div>
          </div>
        )}

      </main>

      {/* منطقة الإدخال */}
      <div className="shrink-0 px-4 pt-3 pb-2 relative z-20 flex justify-center">

        <form
          onSubmit={handleSendMessage}
          className="max-w-4xl w-full mx-auto bg-[#140b2a]/95 backdrop-blur-xl border border-purple-500/30 focus-within:border-purple-400/70 p-2.5 rounded-2xl shadow-2xl transition-colors"
        >

          {/* الملف المرفق */}
          {attachedFile && (
            <div className="flex items-center justify-between gap-3 bg-[#1b1038] border border-fuchsia-500/30 px-3 py-2 rounded-xl mb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-fuchsia-400 shrink-0" />
                <span className="truncate text-[13px] text-slate-200">{attachedFile.name}</span>
                <span className="font-mono text-[11px] text-slate-500 shrink-0">
                  {formatSize(attachedFile.size)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                aria-label="Remove attached file"
                className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">

            {/* إرفاق ملف */}
            <label
              className="cursor-pointer p-3 text-slate-400 hover:text-fuchsia-300 hover:bg-purple-950/60 rounded-xl transition-colors flex items-center justify-center shrink-0"
              title="Attach PDF or image"
            >
              <Paperclip className="w-5 h-5" />
              <input
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setAttachedFile(e.target.files[0]);
                  }
                  e.target.value = '';
                }}
              />
            </label>

            {/* الرسالة */}
            <textarea
              ref={textareaRef}
              rows={1}
              dir="auto"
              value={inputPrompt}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask the AI agent, request summaries, or discuss concepts..."
              className="flex-1 min-w-0 resize-none bg-transparent px-2 py-3 text-[15px] leading-5 text-white placeholder-slate-500 focus:outline-none"
            />

            {/* إرسال */}
            <button
              type="submit"
              disabled={!canSend}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-950/60 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold px-4 md:px-5 py-3 rounded-xl transition-colors flex items-center gap-2 cursor-pointer text-sm shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden md:inline">Send</span>
            </button>

          </div>

          <p className="hidden md:block px-2 pt-1.5 text-[11px] text-slate-600 font-mono">
            Enter to send · Shift + Enter for a new line
          </p>

        </form>

      </div>

      {/* الدوك */}
      <div className="shrink-0 flex justify-center px-4 pb-3 relative z-20">

        <div className="bg-[#120a24]/95 backdrop-blur-2xl border border-purple-500/40 shadow-[0_15px_50px_rgba(112,26,238,0.4)] px-4 md:px-6 py-2.5 rounded-full flex items-center gap-4 md:gap-10 transition-all">

          <Link to="/library" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform">
              <img src={myPhoto} alt="Logo" className="w-full h-full object-cover" />
            </div>
          </Link>

          <div className="flex items-center gap-2 md:gap-5">
            {navLink('/library', 'Library', BookOpen)}
            {navLink('/ai-chat', 'AI Agent', Cpu)}
            {navLink('/profile', 'Profile', User)}
            {navLink('/about', 'About', Info)}

            <Link
              to="/login"
              className="p-2.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-950/35 transition-all flex items-center justify-center"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}