import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  useTransform
} from 'framer-motion';
import { Phone, BookOpen, Cpu, User, Info, LogOut, ArrowUpRight, Code2, Terminal } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import myPhoto from '../assets/Me.jpeg';
import cyberBg from '../assets/cyber-bg.jpg';
import pythonIcon from '../assets/Python.ico';
import djangoIcon from '../assets/django-svgrepo-com.ico';
import reactIcon from '../assets/react.ico';
import tailwindIcon from '../assets/tailwindcss.ico';
import jsIcon from '../assets/javascript.ico';
import sqlIcon from '../assets/sql-database-sql-azure-svgrepo-com.ico';

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

const GLYPHS = '!<>-_\\/[]{}=+*^?#01';

/* تأثير فك التشفير */
const useScramble = (text, delay = 0, duration = 900) => {
  const [out, setOut] = useState(() => text.replace(/./g, '_'));

  useEffect(() => {
    let raf;
    let start;
    const timeout = setTimeout(() => {
      const tick = (t) => {
        if (!start) start = t;
        const p = Math.min((t - start) / duration, 1);
        const revealed = Math.floor(p * text.length);
        let s = '';
        for (let i = 0; i < text.length; i++) {
          s += i < revealed ? text[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setOut(p < 1 ? s : text);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [text, delay, duration]);

  return out;
};

/* كتابة ومسح متكرر لمجموعة كلمات */
const ROLES = ['Full Stack AI Developer', 'Data Scientist', 'CS & AI Student'];

const useTypewriter = (words, typeSpeed = 70, eraseSpeed = 35, hold = 1600) => {
  const [text, setText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIdx];
    let timeout;

    if (!deleting && text === word) {
      timeout = setTimeout(() => setDeleting(true), hold);
    } else if (deleting && text === '') {
      setDeleting(false);
      setWordIdx((i) => (i + 1) % words.length);
    } else {
      timeout = setTimeout(
        () => setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)),
        deleting ? eraseSpeed : typeSpeed
      );
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, wordIdx, words, typeSpeed, eraseSpeed, hold]);

  return text;
};

/* ------------------------------------------------------------------ */
/*  Small components                                                   */
/* ------------------------------------------------------------------ */

const Reveal = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({ number, title }) => (
  <div className="flex items-center justify-between mb-6 pb-3 border-b border-purple-500/15">
    <div className="flex items-center gap-2 font-mono text-xs tracking-widest text-purple-400">
      <span className="text-fuchsia-400 font-bold">{number}</span>
      <span>// {title}</span>
    </div>
    <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
  </div>
);

const cardStyle =
  'relative bg-[#110822]/90 border border-purple-500/20 hover:border-purple-400/40 rounded-3xl p-7 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-500 group overflow-hidden';

const SpotlightCard = ({
  children,
  className = '',
  contentClassName = '',
  color = 'rgba(168,85,247,0.14)'
}) => {
  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const background = useMotionTemplate`radial-gradient(340px circle at ${mx}px ${my}px, ${color}, transparent 70%)`;

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  return (
    <div onMouseMove={onMove} className={`group relative overflow-hidden ${className}`}>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background }}
      />
      <div className={`relative z-10 ${contentClassName}`}>{children}</div>
    </div>
  );
};

const ScrambleText = ({ text, delay }) => {
  const out = useScramble(text, delay);
  return (
    <span className="relative inline-block">
      <span className="invisible">{text}</span>
      <span className="absolute inset-0 whitespace-nowrap">{out}</span>
    </span>
  );
};

const TiltPhoto = () => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [9, -9]), { stiffness: 150, damping: 16 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-9, 9]), { stiffness: 150, damping: 16 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const cyan = '#00f0ff';
  const pink = '#ff0055';

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="w-full max-w-[320px] [perspective:1000px]"
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="relative">

        <span className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2" style={{ borderColor: cyan, filter: `drop-shadow(0 0 6px ${cyan})` }} />
        <span className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2" style={{ borderColor: cyan, filter: `drop-shadow(0 0 6px ${cyan})` }} />
        <span className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2" style={{ borderColor: pink, filter: `drop-shadow(0 0 6px ${pink})` }} />
        <span className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2" style={{ borderColor: pink, filter: `drop-shadow(0 0 6px ${pink})` }} />

        <div className="relative h-[420px] rounded-3xl overflow-hidden border-2 border-purple-400/30 bg-[#120a22] shadow-2xl">
          <img
            src={myPhoto}
            alt="Mohanad Mostafa"
            className="w-full h-full object-cover object-[center_20%]"
          />

          <motion.div
            aria-hidden="true"
            className="absolute left-0 right-0 h-20 pointer-events-none bg-gradient-to-b from-transparent via-cyan-300/15 to-transparent"
            animate={{ top: ['-25%', '110%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
          />

          <div className="absolute bottom-0 inset-x-0 p-4 pt-10 bg-gradient-to-t from-black/75 to-transparent flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-white/80">
            <span>// Egypt</span>
            <span>AOU · CS & AI</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const AboutMe = () => {
  const location = useLocation();
  const role = useTypewriter(ROLES);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });

  const cx = useMotionValue(-600);
  const cy = useMotionValue(-600);
  const pageGlow = useMotionTemplate`radial-gradient(520px circle at ${cx}px ${cy}px, rgba(168,85,247,0.11), transparent 70%)`;

  useEffect(() => {
    const move = (e) => {
      cx.set(e.clientX);
      cy.set(e.clientY);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [cx, cy]);

  const contactLinks = [
    {
      name: 'Facebook',
      label: 'Mohanad Facebook',
      url: 'https://www.facebook.com',
      icon: (
        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.37 14.5 5 15.5 5H18V0h-3.808C10.59 0 9 1.581 9 4.615V8z"/>
        </svg>
      )
    },
    {
      name: 'WhatsApp',
      label: '+20 106 815 1437',
      url: 'https://wa.me/201068151437',
      icon: <Phone className="w-4 h-4 text-emerald-400" />
    },
    {
      name: 'LinkedIn',
      label: 'mohanad-mhmoude',
      url: 'https://www.linkedin.com/in/mohanad-mhmoude-mostafa-kamele-a9ba0541a/',
      icon: (
        <svg className="w-4 h-4 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      )
    },
    {
      name: 'GitHub',
      label: 'mohanad-netizen',
      url: 'https://github.com/mohanadmhmoudemostafakamele-netizen',
      icon: (
        <svg className="w-4 h-4 text-slate-200" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      )
    }
  ];

  const techSkills = [
    { name: 'Python', icon: pythonIcon },
    { name: 'Django', icon: djangoIcon },
    { name: 'React.js', icon: reactIcon },
    { name: 'Tailwind', icon: tailwindIcon },
    { name: 'JavaScript', icon: jsIcon },
    { name: 'SQL', icon: sqlIcon },
  ];

  const softSkills = ['Teamwork & Leadership', 'Critical Thinking', 'Communication', 'Time Management'];
  const skillSet = ['Full Stack AI', 'Data Analysis', 'Machine Learning', 'RESTful APIs'];
  const interests = ['AI & Deep Learning', 'Software Architecture'];

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
    <div className="min-h-screen bg-[#03050b] text-slate-100 p-6 md:p-12 font-sans relative overflow-hidden pb-48 selection:bg-purple-500 selection:text-white" dir="ltr">

      <motion.div
        style={{ scaleX: progress }}
        className="fixed top-0 left-0 right-0 h-[3px] origin-left bg-gradient-to-r from-purple-500 to-fuchsia-500 z-[60]"
      />

      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 filter brightness-75 contrast-125 pointer-events-none"
        style={{ backgroundImage: `url(${cyberBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#03050b] via-[#03050b]/85 to-[#03050b]/95 pointer-events-none" />

      <motion.div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1]" style={{ background: pageGlow }} />

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex justify-center px-4">
        <div className="bg-[#0f071e]/95 backdrop-blur-2xl border border-purple-500/30 shadow-[0_20px_50px_rgba(76,29,149,0.3)] px-6 py-3 rounded-full flex items-center gap-6 md:gap-10 transition-all">
          <Link to="/library" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform">
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

      <div className="max-w-7xl mx-auto space-y-20 relative z-10">

        {/* ============ HERO ============ */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-center pt-8">

          <div className="md:col-span-7 order-2 md:order-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/50 border border-purple-500/20 text-purple-300 text-xs font-mono tracking-widest uppercase">
              <Code2 className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Portfolio & Research Profile</span>
            </div>

            <h1
              aria-label="Mohanad Mahmoude Mostafa"
              className="text-5xl md:text-7xl font-black leading-[1] tracking-tight text-white"
            >
              <span aria-hidden="true" className="block">
                <ScrambleText text="Mohanad" delay={150} />
              </span>
              <span
                aria-hidden="true"
                className="block"
                style={{ WebkitTextStroke: '2px #c084fc', color: 'transparent' }}
              >
                <ScrambleText text="Mahmoude" delay={400} />
              </span>
              <span aria-hidden="true" className="block">
                <ScrambleText text="Mostafa" delay={650} />
              </span>
            </h1>

            <p className="font-mono text-lg md:text-xl font-semibold text-purple-200 h-8 flex items-center">
              <span className="sr-only">Full Stack AI Developer & Data Scientist</span>
              <span aria-hidden="true" className="flex items-center">
                <span className="text-fuchsia-400 mr-2">&gt;</span>
                {role}
                <span className="inline-block w-[2px] h-5 ml-1 bg-fuchsia-400 animate-pulse" />
              </span>
            </p>

            <p className="text-base text-slate-300 leading-relaxed max-w-xl">
              Based in Egypt, and a Computer Science student at Arab Open University (AOU).
            </p>

            {/* كود بايثون وذكاء اصطناعي حقيقي وعالي الفخامة جوه التيرمينال */}
            <div className="max-w-xl rounded-2xl overflow-hidden border border-purple-500/25 bg-[#0b0618]/90 backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-purple-500/15 bg-[#110822]">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-3 flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                  <Terminal className="w-3 h-3 text-fuchsia-400" />
                  mohanad_core.py
                </span>
              </div>
              <div className="p-4 font-mono text-[12px] leading-relaxed space-y-1 text-slate-300">
                <p><span className="text-fuchsia-400">import</span> <span className="text-purple-300">torch</span></p>
                <p><span className="text-fuchsia-400">import</span> <span className="text-purple-300">torch.nn</span> <span className="text-fuchsia-400">as</span> <span className="text-purple-300">nn</span></p>
                <p className="pt-1"><span className="text-fuchsia-400">class</span> <span className="text-yellow-300">MohanadNeuralArchitect</span>(nn.Module):</p>
                <p className="pl-4"><span className="text-fuchsia-400">def</span> <span className="text-blue-300">__init__</span>(self):</p>
                <p className="pl-8 text-slate-400">self.developer = <span className="text-emerald-300">"Mohanad Mostafa"</span></p>
                <p className="pl-8 text-slate-400">self.domain = <span className="text-emerald-300">"Full Stack AI & Data Science"</span></p>
                <p className="pl-4 pt-1"><span className="text-fuchsia-400">def</span> <span className="text-blue-300">deploy</span>(self):</p>
                <p className="pl-8 text-purple-300">return <span className="text-emerald-300">f"Status: {self.developer} building scalable AI apps."</span></p>
              </div>
            </div>

            {/* روابط التواصل */}
            <ul className="max-w-xl grid sm:grid-cols-2 gap-3 pt-2">
              {contactLinks.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#110822]/80 border border-purple-500/15 hover:border-purple-400/40 text-slate-300 hover:text-white transition-all shadow-sm"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/20">
                        {item.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-bold">{item.name}</span>
                        <span className="block font-mono text-[10px] text-slate-400 truncate">{item.label}</span>
                      </span>
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* الصورة الشخصية */}
          <div className="md:col-span-5 flex justify-center order-1 md:order-2">
            <TiltPhoto />
          </div>

        </section>

        {/* ============ BENTO GRID SECTION ============ */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-5">

          {/* 01 Education */}
          <Reveal className="md:col-span-5">
            <SpotlightCard
              className="h-full rounded-3xl p-7 bg-gradient-to-br from-[#5b3eb4] via-[#4c2fae] to-[#3a2096] border border-purple-300/30 shadow-xl"
              contentClassName="h-full flex flex-col justify-between"
              color="rgba(255,255,255,0.13)"
            >
              <div>
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10 font-mono text-xs tracking-widest text-purple-200">
                  <span className="text-white font-bold">01 // EDUCATION</span>
                  <span className="px-3 py-1 rounded-full bg-black/20 text-[10px] font-mono border border-white/10">2026 - Present</span>
                </div>
                <h3 className="text-3xl font-black text-white tracking-tight mb-2">Arab Open University</h3>
                <p className="text-xs md:text-sm text-purple-100 leading-relaxed font-mono">
                  Bachelor of Computer Science (CS & AI Track).
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-purple-200 font-mono">
                <span>Degree Track</span>
                <span className="font-bold text-white">Artificial Intelligence</span>
              </div>
            </SpotlightCard>
          </Reveal>

          {/* 02 Soft skills */}
          <Reveal className="md:col-span-7">
            <SpotlightCard className={`${cardStyle} h-full`} contentClassName="h-full flex flex-col justify-between">
              <SectionHeader number="02" title="SOFT SKILLS" />
              <ul className="grid sm:grid-cols-2 gap-3">
                {softSkills.map((s) => (
                  <li key={s} className="flex items-center gap-3 p-4 rounded-2xl bg-[#180f30]/60 border border-purple-500/15 text-xs md:text-sm font-semibold text-slate-200 hover:border-purple-400/40 transition-all">
                    <span className="w-2 h-2 rounded-full bg-fuchsia-400 shrink-0 shadow-[0_0_8px_#e879f9]" />
                    {s}
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </Reveal>

          {/* 03 Technical skills */}
          <Reveal className="md:col-span-8">
            <SpotlightCard className={`${cardStyle} h-full`}>
              <SectionHeader number="03" title="TECHNICAL SKILLS" />
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {techSkills.map((skill) => (
                  <div
                    key={skill.name}
                    className="bg-[#180f30]/80 border border-purple-500/20 hover:border-purple-400/50 rounded-2xl p-4 flex flex-col items-center gap-2.5 transition-all hover:-translate-y-1 group/skill shadow-sm"
                  >
                    <div className="w-10 h-10 p-2 bg-[#100720] rounded-xl flex items-center justify-center group-hover/skill:scale-110 transition-transform border border-purple-500/15">
                      <img src={skill.icon} alt={skill.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-200 text-center tracking-wide">{skill.name}</span>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </Reveal>

          {/* 04 Interests */}
          <Reveal className="md:col-span-4">
            <SpotlightCard className={`${cardStyle} h-full`} contentClassName="h-full flex flex-col justify-between">
              <SectionHeader number="04" title="INTERESTS" />
              <ul className="space-y-3">
                {interests.map((s, i) => (
                  <li key={s} className="p-4 rounded-2xl bg-[#180f30]/60 border border-purple-500/15 text-sm md:text-base font-bold text-white flex items-center justify-between">
                    <span>{s}</span>
                    <span className="text-fuchsia-400 font-mono text-xs">/0{i + 1}</span>
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </Reveal>

          {/* 05 Core expertise */}
          <Reveal className="md:col-span-12">
            <SpotlightCard className={cardStyle}>
              <SectionHeader number="05" title="CORE EXPERTISE" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {skillSet.map((s, i) => (
                  <div key={s} className="p-5 rounded-2xl bg-[#180f30]/60 border border-purple-500/20 hover:border-purple-400/40 transition-all">
                    <span className="font-mono text-xs text-fuchsia-400 font-bold">0{i + 1} //</span>
                    <p className="mt-2 text-base md:text-lg font-black text-white tracking-wide">{s}</p>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </Reveal>

          {/* CTA */}
          <Reveal className="md:col-span-12">
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-950/60 via-[#130826] to-fuchsia-950/60 border border-purple-500/30 rounded-3xl p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-lg md:text-xl font-black text-white tracking-wide">Ready to explore books & publications repository?</h4>
                <p className="text-xs md:text-sm text-purple-200/80 font-mono mt-1">Access the complete digital library system.</p>
              </div>
              <Link
                to="/library"
                className="shrink-0 px-7 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs md:text-sm font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all hover:scale-105 flex items-center gap-2.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-white" />
                <span>Go to Digital Library</span>
              </Link>
            </div>
          </Reveal>

        </section>
      </div>
    </div>
  );
};

AboutMe.displayName = 'AboutMe';

export default AboutMe;