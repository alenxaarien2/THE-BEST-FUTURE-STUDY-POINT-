import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Video, FileText, Lock, Unlock, Phone, MessageCircle,
  MapPin, Sparkles, Award, BarChart3, Play, PlusCircle, Trash2,
  X, RefreshCw, Mic, GraduationCap, Layers, ExternalLink, Search, ShieldCheck
} from 'lucide-react';

// --- PERMANENT CLOUD REALTIME DATABASE URL ---
const FIREBASE_DB_URL = "https://chandibari-farma-default-rtdb.asia-southeast1.firebasedatabase.app";

// --- 3 ACADEMIC WINGS (CLASS 1 TO 12) ---
const WINGS = [
  {
    id: 'wing_1_8',
    title: 'Class 1 to 8',
    subtitle: 'Junior & Foundation Wing',
    badge: 'Strong Basics • Olympiad & Navodaya Prep',
    classes: ['Class 1-5', 'Class 6', 'Class 7', 'Class 8'],
    subjects: ['Mathematics', 'Science', 'English Grammar & Lit', 'Social Studies', 'Hindi', 'Sanskrit'],
    accent: 'from-cyan-400 to-blue-600',
    borderGlow: 'border-cyan-500/50',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
  },
  {
    id: 'wing_9_10',
    title: 'Class 9 & 10',
    subtitle: 'BSEB Matriculation Board Wing',
    badge: '450+ Marks Target • Chapter-Wise Notes & OMR Tests',
    classes: ['Class 9', 'Class 10 (Matric)'],
    subjects: ['Mathematics', 'Science (Phy/Chem/Bio)', 'Social Science (SST)', 'English', 'Hindi', 'Sanskrit'],
    accent: 'from-amber-400 to-orange-600',
    borderGlow: 'border-amber-400/60',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40'
  },
  {
    id: 'wing_11_12',
    title: 'Class 11 & 12',
    subtitle: 'BSEB Intermediate Board Wing',
    badge: 'Board Special Batch • Objective & Subjective Series',
    classes: ['Class 11', 'Class 12 (Inter)'],
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English Core', 'Hindi Core', 'Arts Stream'],
    accent: 'from-emerald-400 to-teal-600',
    borderGlow: 'border-emerald-400/50',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
  }
];

// --- INITIAL DEMO STUDY MATERIALS (SEQUENTIAL CHAPTERS) ---
const INITIAL_MATERIALS = [
  {
    id: 'mat_1',
    wingId: 'wing_9_10',
    className: 'Class 10 (Matric)',
    subject: 'Mathematics',
    chapterNo: 1,
    chapterTitle: 'Real Numbers (Bihar Board VVI Concepts & Proofs)',
    description: 'Complete explanation of Euclid Division Lemma, HCF/LCM, Irrational number proofs, and top 50 BSEB Board objective questions.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    pdfUrl: 'https://biharboardonline.bihar.gov.in',
    createdAt: 'Today',
    teacher: 'Ranjan Sir'
  },
  {
    id: 'mat_2',
    wingId: 'wing_9_10',
    className: 'Class 10 (Matric)',
    subject: 'Science (Phy/Chem/Bio)',
    chapterNo: 1,
    chapterTitle: 'Reflection and Refraction of Light',
    description: 'Ray diagrams, Mirror Formula, Lens Maker concepts, numerical problems, and previous 10 years Bihar Board questions.',
    videoUrl: '',
    pdfUrl: 'https://biharboardonline.bihar.gov.in',
    createdAt: 'Today',
    teacher: 'Ranjan Sir'
  },
  {
    id: 'mat_3',
    wingId: 'wing_11_12',
    className: 'Class 12 (Inter)',
    subject: 'Physics',
    chapterNo: 1,
    chapterTitle: 'Electric Charges and Fields (Electrostatics)',
    description: 'Coulomb Law, Electric Dipole, Gauss Theorem derivations, and 5-Mark Long Answer questions for Bihar Board Intermediate Exam.',
    videoUrl: '',
    pdfUrl: 'https://biharboardonline.bihar.gov.in',
    createdAt: 'Today',
    teacher: 'Ranjan Sir'
  },
  {
    id: 'mat_4',
    wingId: 'wing_1_8',
    className: 'Class 8',
    subject: 'Mathematics',
    chapterNo: 1,
    chapterTitle: 'Rational Numbers & Linear Equations',
    description: 'Step-by-step foundation concepts, properties of rational numbers, and solved exercise problems.',
    videoUrl: '',
    pdfUrl: '',
    createdAt: 'Today',
    teacher: 'Ranjan Sir'
  }
];

const INITIAL_NOTICES = [
  "🔥 New Target Batch for Bihar Board Class 10th & 12th (2027 Exam) is now open for admission!",
  "🏆 Weekly OMR Sheet Pattern Test every Sunday under the direct guidance of Ranjan Sir.",
  "📍 Campus Address: Jurawanpur, 400m from Chakausan, Near Double Transformer • Contact: 7549172190"
];

// Convert standard YouTube links to embeddable URL
function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
}

export default function App() {
  // 'student' | 'admin' (Two separate interfaces)
  const [viewMode, setViewMode] = useState('student');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // --- ADMIN PASSWORD (CHANGE HERE IF NEEDED) ---
  const [adminPassword] = useState('Ranjan@2026');

  // Navigation & Filters for Student Portal
  const [selectedWingId, setSelectedWingId] = useState('wing_9_10');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [saraswatiImgError, setSaraswatiImgError] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Cloud-Synced State
  const [materials, setMaterials] = useState(() => {
    const saved = localStorage.getItem('tbfsp_materials_v1');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [notices, setNotices] = useState(() => {
    const saved = localStorage.getItem('tbfsp_notices_v1');
    return saved ? JSON.parse(saved) : INITIAL_NOTICES;
  });

  // Admin Form State
  const [matForm, setMatForm] = useState({
    wingId: 'wing_9_10',
    className: 'Class 10 (Matric)',
    subject: 'Mathematics',
    chapterNo: 1,
    chapterTitle: '',
    description: '',
    videoUrl: '',
    pdfUrl: ''
  });
  const [newNoticeText, setNewNoticeText] = useState('');
  const [adminMsg, setAdminMsg] = useState('');

  useEffect(() => {
    localStorage.setItem('tbfsp_materials_v1', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('tbfsp_notices_v1', JSON.stringify(notices));
  }, [notices]);

  // --- REALTIME FIREBASE SYNC ---
  const syncFromCloud = async () => {
    try {
      setSyncing(true);
      const res = await fetch(`${FIREBASE_DB_URL}/bestfuturestudypoint.json`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          if (data.materials) setMaterials(data.materials);
          if (data.notices) setNotices(data.notices);
          return data;
        }
      }
    } catch (e) {
      console.error('Cloud sync error:', e);
    } finally {
      setSyncing(false);
    }
    return null;
  };

  const pushToCloud = async (uMaterials, uNotices) => {
    try {
      setSyncing(true);
      await fetch(`${FIREBASE_DB_URL}/bestfuturestudypoint.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materials: uMaterials ?? materials,
          notices: uNotices ?? notices
        })
      });
    } catch (e) {
      console.error('Cloud push error:', e);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    syncFromCloud();
    const interval = setInterval(() => {
      syncFromCloud();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const currentWing = useMemo(
    () => WINGS.find((w) => w.id === selectedWingId) || WINGS[1],
    [selectedWingId]
  );

  // Reset sub-filters when switching wings
  const handleSelectWing = (wingId) => {
    setSelectedWingId(wingId);
    setSelectedClass('All');
    setSelectedSubject('All');
  };

  // Filtered & Chapter-Sequenced Materials
  const filteredMaterials = useMemo(() => {
    return materials
      .filter((m) => m.wingId === selectedWingId)
      .filter((m) => (selectedClass === 'All' ? true : m.className === selectedClass))
      .filter((m) => (selectedSubject === 'All' ? true : m.subject === selectedSubject))
      .filter((m) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          m.chapterTitle.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => Number(a.chapterNo) - Number(b.chapterNo));
  }, [materials, selectedWingId, selectedClass, selectedSubject, searchQuery]);

  // Admin: Add Sequential Study Material
  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!matForm.chapterTitle.trim()) return;

    const newEntry = {
      id: 'mat_' + Date.now(),
      wingId: matForm.wingId,
      className: matForm.className,
      subject: matForm.subject,
      chapterNo: Number(matForm.chapterNo) || 1,
      chapterTitle: matForm.chapterTitle.trim(),
      description: matForm.description.trim() || 'Important Bihar Board study material & notes.',
      videoUrl: matForm.videoUrl.trim(),
      pdfUrl: matForm.pdfUrl.trim(),
      createdAt: new Date().toLocaleDateString('en-IN'),
      teacher: 'Ranjan Sir'
    };

    const latest = await syncFromCloud();
    const baseMats = latest?.materials || materials;
    const updated = [newEntry, ...baseMats];
    setMaterials(updated);
    await pushToCloud(updated, latest?.notices || notices);

    setMatForm((prev) => ({
      ...prev,
      chapterNo: Number(prev.chapterNo) + 1,
      chapterTitle: '',
      description: '',
      videoUrl: '',
      pdfUrl: ''
    }));
    setAdminMsg('Chapter material published and synced to all student devices!');
    setTimeout(() => setAdminMsg(''), 4000);
  };

  const handleDeleteMaterial = async (id) => {
    const updated = materials.filter((m) => m.id !== id);
    setMaterials(updated);
    await pushToCloud(updated, notices);
  };

  const handleAddNotice = async (e) => {
    e.preventDefault();
    if (!newNoticeText.trim()) return;
    const updated = [newNoticeText.trim(), ...notices];
    setNotices(updated);
    await pushToCloud(materials, updated);
    setNewNoticeText('');
  };

  const handleDeleteNotice = async (idx) => {
    const updated = notices.filter((_, i) => i !== idx);
    setNotices(updated);
    await pushToCloud(materials, updated);
  };

  const adminSelectedWingObj = WINGS.find((w) => w.id === matForm.wingId) || WINGS[1];

  return (
    <div className="min-h-screen obsidian-3d-bg text-slate-100 pb-28 font-sans relative overflow-x-hidden">
      {/* 3D HOLOGRAPHIC & OBSIDIAN TITANIUM STYLES */}
      <style>{`
        .obsidian-3d-bg {
          background: radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 45%, #020617 100%);
          background-attachment: fixed;
        }
        .hologram-title {
          background: linear-gradient(90deg, #67e8f9 0%, #fde047 35%, #ffffff 50%, #38bdf8 75%, #fde047 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: holoShine 4s linear infinite;
          filter: drop-shadow(0 0 18px rgba(56, 189, 248, 0.35));
        }
        @keyframes holoShine {
          to { background-position: 200% center; }
        }
        .holo-ring {
          box-shadow: 0 0 30px rgba(56, 189, 248, 0.55), inset 0 0 20px rgba(250, 204, 21, 0.45);
          animation: floatPulse 4s ease-in-out infinite;
        }
        @keyframes floatPulse {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-6px) scale(1.03); }
        }
        .card-3d-dark {
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.92) 0%, rgba(15, 23, 42, 0.96) 100%);
          backdrop-filter: blur(16px);
          border-radius: 24px;
          border: 1px solid rgba(148, 163, 184, 0.22);
          box-shadow: 
            0 20px 40px -12px rgba(0, 0, 0, 0.75),
            0 6px 0px #090d16,
            inset 0 1px 1px rgba(255, 255, 255, 0.15);
          transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .card-3d-dark:hover {
          transform: translateY(-5px);
          border-color: rgba(56, 189, 248, 0.45);
          box-shadow: 
            0 28px 55px -12px rgba(14, 165, 233, 0.28),
            0 8px 0px #090d16,
            inset 0 1px 2px rgba(255, 255, 255, 0.25);
        }
        .btn-3d-cyan {
          background: linear-gradient(180deg, #06b6d4 0%, #0284c7 100%);
          box-shadow: 0 5px 0 #0c4a6e, 0 10px 20px rgba(6, 182, 212, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4);
          transition: all 0.15s ease;
        }
        .btn-3d-cyan:active {
          transform: translateY(4px);
          box-shadow: 0 1px 0 #0c4a6e;
        }
        .btn-3d-gold {
          background: linear-gradient(180deg, #fde047 0%, #eab308 100%);
          box-shadow: 0 5px 0 #854d0e, 0 10px 20px rgba(234, 179, 8, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.8);
          transition: all 0.15s ease;
        }
        .btn-3d-gold:active {
          transform: translateY(4px);
          box-shadow: 0 1px 0 #854d0e;
        }
        .bar-3d {
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4);
        }
      `}</style>

      {/* Ambient Holographic Grid & Light Orbs */}
      <div className="pointer-events-none fixed top-10 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="pointer-events-none fixed bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.65)]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-lg">
                🪷
              </div>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">
                BSEB Class 1 to 12 Premier Institute
              </span>
              <h2 className="text-sm sm:text-base font-black tracking-wide text-white">
                THE BEST FUTURE STUDY POINT
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={syncFromCloud}
              title="Sync Latest Study Materials"
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 transition"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            </button>

            {viewMode === 'student' ? (
              <button
                onClick={() => {
                  if (isAdminAuthenticated) {
                    setViewMode('admin');
                  } else {
                    setShowLoginModal(true);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/40 shadow-md transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </button>
            ) : (
              <button
                onClick={() => setViewMode('student')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black btn-3d-cyan text-white"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Exit to Student Website</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* INTERFACE 1: STUDENT WEBSITE PORTAL                                 */}
      {/* =================================================================== */}
      {viewMode === 'student' && (
        <main className="max-w-6xl mx-auto px-4 pt-6 space-y-10 relative z-10">
          {/* 3D HOLOGRAM HERO & MAA SARASWATI EMBLEM */}
          <section className="card-3d-dark p-6 sm:p-10 relative overflow-hidden border border-cyan-500/30">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Centerpiece 3D Hologram Logo with Goddess Saraswati */}
              <div className="relative shrink-0 flex flex-col items-center">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full p-1.5 bg-gradient-to-tr from-cyan-400 via-amber-300 to-cyan-500 holo-ring relative flex items-center justify-center">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex flex-col items-center justify-center relative border-2 border-amber-300/60">
                    {!saraswatiImgError ? (
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Saraswati_Raja_Ravi_Varma.jpg/440px-Saraswati_Raja_Ravi_Varma.jpg"
                        alt="Goddess Maa Saraswati"
                        onError={() => setSaraswatiImgError(true)}
                        className="w-full h-full object-cover object-top brightness-110 contrast-105"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <div className="text-5xl mb-1">🪷🪕</div>
                        <span className="text-xs font-black text-amber-300">Maa Saraswati</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent py-1.5 text-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                        Vidya Dadati Vinayam
                      </span>
                    </div>
                  </div>
                </div>
                <span className="mt-3 px-3 py-1 rounded-full text-[11px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  ✨ 3D Hologram Institute Emblem
                </span>
              </div>

              {/* Holographic Coaching Title & Founder Info */}
              <div className="flex-1 text-center lg:text-left space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-black">
                  <Sparkles className="w-3.5 h-3.5" /> BIHAR BOARD (BSEB) NO. 1 RESULT-ORIENTED INSTITUTE
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase hologram-title leading-tight">
                  THE BEST FUTURE STUDY POINT
                </h1>

                <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl leading-relaxed">
                  Complete digital & offline learning ecosystem for <strong className="text-white">Class 1 to 12 (Bihar Board)</strong>. Access chapter-wise sequential video lectures, VVI board notes, and weekly OMR test series.
                </p>

                {/* Founder & Location Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-900/90 border border-slate-700/80 p-3.5 rounded-2xl flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl btn-3d-gold text-slate-950 flex items-center justify-center font-black text-lg shrink-0">
                      👨‍🏫
                    </div>
                    <div className="text-left">
                      <div className="text-[11px] text-slate-400 font-bold uppercase">Founder & Director</div>
                      <div className="text-sm sm:text-base font-black text-amber-300">Ranjan Sir</div>
                      <div className="text-xs font-bold text-emerald-400">+91 7549172190</div>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-700/80 p-3.5 rounded-2xl flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl btn-3d-cyan text-white flex items-center justify-center font-black text-lg shrink-0">
                      📍
                    </div>
                    <div className="text-left">
                      <div className="text-[11px] text-slate-400 font-bold uppercase">Campus Location</div>
                      <div className="text-xs sm:text-sm font-black text-white leading-snug">
                        Jurawanpur (400m from Chakausan)
                      </div>
                      <div className="text-[11px] font-bold text-cyan-300">Near Double Transformer</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                  <a
                    href="tel:7549172190"
                    className="btn-3d-cyan text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" /> Call Ranjan Sir (7549172190)
                  </a>
                  <a
                    href={`https://wa.me/917549172190?text=${encodeURIComponent(
                      'Hello Ranjan Sir, I want to inquire about admission and study material at THE BEST FUTURE STUDY POINT.'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-3d-gold text-slate-950 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp Inquiry
                  </a>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Jurawanpur+Chakausan+Bihar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 px-4 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition"
                  >
                    <MapPin className="w-4 h-4 text-amber-400" /> View on Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Live Announcements Ticker */}
            <div className="mt-7 pt-4 border-t border-slate-800/90 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
              <span className="bg-amber-400 text-slate-950 font-black px-3 py-1 rounded-lg shrink-0 uppercase tracking-wider">
                📢 Live Updates
              </span>
              <div className="flex-1 overflow-x-auto whitespace-nowrap text-slate-200 font-bold space-x-6 no-scrollbar">
                {notices.map((n, idx) => (
                  <span key={idx} className="inline-block">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 1: 3 DEDICATED ACADEMIC WINGS (1-8, 9-10, 11-12) */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
                  Step 1 • Select Your Academic Division
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  3 Dedicated Bihar Board Wings (Class 1 to 12)
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-semibold">
                Click on your class division below to open sequential chapter-wise lectures & notes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {WINGS.map((wing) => {
                const isSelected = selectedWingId === wing.id;
                const count = materials.filter((m) => m.wingId === wing.id).length;
                return (
                  <div
                    key={wing.id}
                    onClick={() => handleSelectWing(wing.id)}
                    className={`card-3d-dark p-6 cursor-pointer relative overflow-hidden transition ${
                      isSelected ? `ring-4 ring-cyan-400 ${wing.borderGlow}` : 'opacity-90 hover:opacity-100'
                    }`}
                  >
                    <div className={`h-1.5 w-24 rounded-full bg-gradient-to-r ${wing.accent} mb-4`}></div>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-black px-3 py-1 rounded-full border ${wing.badgeBg}`}>
                        {wing.subtitle}
                      </span>
                      <span className="text-xs font-black text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700">
                        {count} Chapters
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-white mt-3">{wing.title}</h3>
                    <p className="text-xs text-slate-300 font-semibold mt-1">{wing.badge}</p>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                      {wing.classes.map((cls) => (
                        <span
                          key={cls}
                          className="text-[11px] font-bold bg-slate-900/90 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700"
                        >
                          {cls}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between text-xs font-black text-cyan-300">
                      <span>{isSelected ? '● Currently Viewing Wing' : 'Click to Open Study Material'}</span>
                      <span>→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 2: CHAPTER-WISE SEQUENTIAL STUDY MATERIAL EXPLORER */}
          <section className="card-3d-dark p-6 sm:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-300">
                  {currentWing.subtitle} • Sequential Syllabus
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  {currentWing.title} — Chapter-Wise Video Lectures & Notes
                </h3>
              </div>

              {/* Search Box */}
              <div className="relative w-full lg:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chapter name or topic..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Class & Subject Filters */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black text-slate-400 mr-1">Filter Class:</span>
                {['All', ...currentWing.classes].map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                      selectedClass === cls
                        ? 'btn-3d-cyan text-white'
                        : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black text-slate-400 mr-1">Filter Subject:</span>
                {['All', ...currentWing.subjects].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                      selectedSubject === sub
                        ? 'btn-3d-gold text-slate-950'
                        : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Chapters List (Sorted by Sequence 1, 2, 3...) */}
            {filteredMaterials.length === 0 ? (
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-10 text-center space-y-2">
                <BookOpen className="w-10 h-10 text-cyan-400 mx-auto" />
                <h4 className="text-base font-black text-white">No Chapters Uploaded for This Filter Yet</h4>
                <p className="text-xs text-slate-400">
                  Ranjan Sir will upload sequential chapters for this section soon, or try selecting "All" subjects above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredMaterials.map((item) => {
                  const embedUrl = getYoutubeEmbedUrl(item.videoUrl);
                  return (
                    <div
                      key={item.id}
                      className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-cyan-400/60 transition shadow-lg"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black px-3 py-1 rounded-lg shadow">
                            CHAPTER {String(item.chapterNo).padStart(2, '0')}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-extrabold bg-slate-800 text-amber-300 px-2.5 py-0.5 rounded-md border border-slate-700">
                              {item.className}
                            </span>
                            <span className="text-[11px] font-extrabold bg-slate-800 text-cyan-300 px-2.5 py-0.5 rounded-md border border-slate-700">
                              {item.subject}
                            </span>
                          </div>
                        </div>

                        <h4 className="text-base sm:text-lg font-black text-white leading-snug">
                          {item.chapterTitle}
                        </h4>

                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                        <span className="text-[11px] font-bold text-slate-400">
                          👨‍🏫 By <strong className="text-amber-300">{item.teacher || 'Ranjan Sir'}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          {item.videoUrl && (
                            <button
                              onClick={() =>
                                embedUrl
                                  ? setActiveVideoModal({ title: item.chapterTitle, embedUrl })
                                  : window.open(item.videoUrl, '_blank')
                              }
                              className="flex-1 sm:flex-initial btn-3d-cyan text-white px-3.5 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" /> Watch Video Lecture
                            </button>
                          )}

                          {item.pdfUrl && (
                            <a
                              href={item.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 sm:flex-initial btn-3d-gold text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5" /> Study Notes / PDF
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* SECTION 3: 3D BIHAR BOARD ANALYTICS & TOPPER PERFORMANCE GRAPH */}
          <section className="card-3d-dark p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4" /> 3D Bihar Board Result Analytics
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Consistent Topper Performance Under Ranjan Sir
                </h3>
              </div>
              <span className="text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-3 py-1.5 rounded-xl">
                🏆 100% Board Success Record
              </span>
            </div>

            {/* 3D Interactive Visual Bar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 bg-slate-950/80 border border-slate-800 rounded-2xl p-6">
                <div className="text-xs font-bold text-slate-400 mb-6">
                  Year-on-Year Bihar Board First Division & Distinction Growth (%)
                </div>
                <div className="grid grid-cols-4 gap-4 items-end h-48 pt-6 px-2 border-b border-slate-800">
                  {[
                    { year: '2023 BSEB', pct: 88, label: '88% 1st Div', color: 'from-cyan-500 to-blue-700' },
                    { year: '2024 BSEB', pct: 92, label: '92% 1st Div', color: 'from-cyan-400 to-blue-600' },
                    { year: '2025 BSEB', pct: 96, label: '96% 1st Div', color: 'from-emerald-400 to-teal-600' },
                    { year: '2026 Target', pct: 100, label: '450+ Toppers', color: 'from-amber-300 to-orange-500' }
                  ].map((bar) => (
                    <div key={bar.year} className="flex flex-col items-center h-full justify-end group">
                      <span className="text-[11px] font-black text-amber-300 mb-1.5">{bar.label}</span>
                      <div
                        style={{ height: `${bar.pct}%` }}
                        className={`w-full max-w-[64px] rounded-t-2xl bg-gradient-to-t ${bar.color} bar-3d transition-all duration-500 group-hover:brightness-125`}
                      ></div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-4 text-center pt-2.5 text-xs font-black text-slate-300">
                  <span>2023 Batch</span>
                  <span>2024 Batch</span>
                  <span>2025 Batch</span>
                  <span className="text-amber-300">2026-27 Batch</span>
                </div>
              </div>

              {/* Institute Highlights */}
              <div className="space-y-3">
                {[
                  { title: 'Sequential Chapter Notes', val: '100% BSEB NCERT Pattern', icon: '📚' },
                  { title: 'Weekly OMR Board Tests', val: 'Every Sunday Live Evaluation', icon: '🎯' },
                  { title: 'Doubt Clearing Sessions', val: 'Direct Guidance by Ranjan Sir', icon: '⚡' },
                  { title: 'Campus Location', val: 'Jurawanpur, Near Double Transformer', icon: '📍' }
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-3">
                    <div className="text-2xl">{stat.icon}</div>
                    <div>
                      <div className="text-xs font-black text-white">{stat.title}</div>
                      <div className="text-[11px] font-bold text-cyan-300">{stat.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* =================================================================== */}
      {/* INTERFACE 2: DEDICATED ADMIN STUDIO (ONLY FOR RANJAN SIR / ADMIN)   */}
      {/* =================================================================== */}
      {viewMode === 'admin' && isAdminAuthenticated && (
        <main className="max-w-6xl mx-auto px-4 pt-6 space-y-8 relative z-10">
          <div className="card-3d-dark p-6 border-2 border-amber-400/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Dedicated Admin Control Studio
              </span>
              <h1 className="text-2xl font-black text-white mt-0.5">
                Welcome, Ranjan Sir — Upload Sequential Study Material
              </h1>
              <p className="text-xs text-slate-300">
                Any chapter, video lecture link, or PDF link added here will immediately appear on all student devices in chapter sequence.
              </p>
            </div>
            <button
              onClick={() => {
                setIsAdminAuthenticated(false);
                setViewMode('student');
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shrink-0"
            >
              Lock Admin & Logout
            </button>
          </div>

          {adminMsg && (
            <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-200 p-4 rounded-2xl text-sm font-black">
              ✅ {adminMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Chapter Form */}
            <form onSubmit={handleAddMaterial} className="lg:col-span-2 card-3d-dark p-6 space-y-4 text-xs">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2 border-b border-slate-800 pb-3">
                <PlusCircle className="w-5 h-5" /> Add New Chapter Material (In Sequence)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-black text-slate-300 mb-1">1. Select Academic Wing *</label>
                  <select
                    value={matForm.wingId}
                    onChange={(e) => {
                      const w = WINGS.find((item) => item.id === e.target.value) || WINGS[0];
                      setMatForm((prev) => ({
                        ...prev,
                        wingId: w.id,
                        className: w.classes[0],
                        subject: w.subjects[0]
                      }));
                    }}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white"
                  >
                    {WINGS.map((w) => (
                      <option key={w.id} value={w.id}>{w.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-300 mb-1">2. Select Class *</label>
                  <select
                    value={matForm.className}
                    onChange={(e) => setMatForm((prev) => ({ ...prev, className: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white"
                  >
                    {adminSelectedWingObj.classes.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-300 mb-1">3. Select Subject *</label>
                  <select
                    value={matForm.subject}
                    onChange={(e) => setMatForm((prev) => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white"
                  >
                    {adminSelectedWingObj.subjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-black text-cyan-300 mb-1">Chapter No. (Sequence) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={matForm.chapterNo}
                    onChange={(e) => setMatForm((prev) => ({ ...prev, chapterNo: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-cyan-500/50 rounded-xl font-black text-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block font-black text-slate-300 mb-1">Chapter Title / Topic Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Trigonometry Ratios & Identities (VVI Board Questions)"
                    value={matForm.chapterTitle}
                    onChange={(e) => setMatForm((prev) => ({ ...prev, chapterTitle: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-slate-300 mb-1">Chapter Summary / Important Notes</label>
                <textarea
                  rows={3}
                  placeholder="Write important formulas, board exam weightage, or chapter instructions for students..."
                  value={matForm.description}
                  onChange={(e) => setMatForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-cyan-300 mb-1">YouTube / Video Lecture Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={matForm.videoUrl}
                    onChange={(e) => setMatForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block font-black text-amber-300 mb-1">Google Drive / PDF Notes Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={matForm.pdfUrl}
                    onChange={(e) => setMatForm((prev) => ({ ...prev, pdfUrl: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white"
                  />
                </div>
              </div>

              <button type="submit" disabled={syncing} className="w-full btn-3d-gold text-slate-950 font-black py-3.5 rounded-2xl text-sm">
                {syncing ? 'Uploading & Syncing...' : '🚀 Publish Chapter to Student Website'}
              </button>
            </form>

            {/* Live Notice Board Manager */}
            <div className="card-3d-dark p-6 space-y-4 text-xs h-fit">
              <h3 className="text-base font-black text-cyan-300 border-b border-slate-800 pb-3">
                📢 Manage Live Announcements
              </h3>
              <form onSubmit={handleAddNotice} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write new batch or test notice..."
                  value={newNoticeText}
                  onChange={(e) => setNewNoticeText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white"
                />
                <button type="submit" className="btn-3d-cyan text-white px-4 py-2 rounded-xl font-black">
                  Add
                </button>
              </form>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notices.map((n, idx) => (
                  <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-slate-200 font-semibold">{n}</span>
                    <button onClick={() => handleDeleteNotice(idx)} className="text-red-400 hover:text-red-300 font-black shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Existing Uploaded Chapters Manager */}
          <div className="card-3d-dark p-6 space-y-4">
            <h3 className="text-base font-black text-white">
              📚 Manage All Uploaded Chapters ({materials.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {materials.map((m) => (
                <div key={m.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <span className="text-cyan-400 font-black">
                      Ch {m.chapterNo} • {m.className} ({m.subject})
                    </span>
                    <h4 className="font-bold text-white mt-0.5">{m.chapterTitle}</h4>
                  </div>
                  <button
                    onClick={() => handleDeleteMaterial(m.id)}
                    className="bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white p-2 rounded-lg transition shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ADMIN PASSWORD MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-3d-dark max-w-md w-full p-6 space-y-4 text-xs border border-amber-400/50">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-black text-sm text-amber-300">🔐 Admin Studio Authentication</h3>
              <button onClick={() => setShowLoginModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <p className="text-slate-300 font-medium">
              Restricted to Founder <strong className="text-white">Ranjan Sir</strong> & Administrator. Enter secret password to open the study material upload studio:
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Enter Admin Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (passwordInput === adminPassword) {
                      setIsAdminAuthenticated(true);
                      setShowLoginModal(false);
                      setViewMode('admin');
                      setPasswordInput('');
                    } else {
                      alert('Incorrect Admin Password!');
                    }
                  }
                }}
                className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-black text-white"
              />
              <button
                onClick={() => {
                  if (passwordInput === adminPassword) {
                    setIsAdminAuthenticated(true);
                    setShowLoginModal(false);
                    setViewMode('admin');
                    setPasswordInput('');
                  } else {
                    alert('Incorrect Admin Password!');
                  }
                }}
                className="btn-3d-gold text-slate-950 px-5 py-2.5 rounded-xl font-black"
              >
                Unlock Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP YOUTUBE VIDEO LECTURE PLAYER MODAL */}
      {activeVideoModal && (
        <div
          onClick={() => setActiveVideoModal(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div onClick={(e) => e.stopPropagation()} className="card-3d-dark max-w-3xl w-full p-4 space-y-3 border border-cyan-400/50">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-cyan-300 truncate pr-4">{activeVideoModal.title}</h4>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-black"
              >
                ✕ Close Player
              </button>
            </div>
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
              <iframe
                src={activeVideoModal.embedUrl}
                title={activeVideoModal.title}
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto px-4 mt-14 text-center text-xs text-slate-400 relative z-10">
        <div className="card-3d-dark py-6 px-6 space-y-2 border border-slate-800">
          <div className="text-sm font-black hologram-title uppercase">
            THE BEST FUTURE STUDY POINT
          </div>
          <p className="text-slate-300 font-bold">
            Founder & Director: <strong className="text-amber-300">Ranjan Sir</strong> • Contact: <strong className="text-emerald-400">+91 7549172190</strong>
          </p>
          <p className="text-slate-400">
            📍 Location: Jurawanpur, 400m from Chakausan, Near Double Transformer (Bihar)
          </p>
        </div>
      </footer>

      {/* 3D HUMANOID AI TUTOR FOR STUDENTS */}
      <HumanoidAITutor />
    </div>
  );
}

// ===================================================================
// 3D HUMANOID AI TUTOR (VOICE & TEXT ASSISTANT FOR CLASS 1 TO 12)
// ===================================================================
function HumanoidAITutor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find((v) => v.lang.includes('en-IN') || v.lang.includes('hi-IN')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 1.03;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      const welcome =
        "Welcome to THE BEST FUTURE STUDY POINT! I am your 3D AI Tutor. Ask me any question from Class 1 to 12 Bihar Board syllabus!";
      setMessages([{ sender: 'bot', text: welcome }]);
      setTimeout(() => speakText(welcome), 300);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };
    recognition.start();
  };

  const sendMessage = async (customText = null) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userText = textToSend.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    if (!customText) setInput('');
    setLoading(true);

    const systemPrompt =
      "You are the official 3D Humanoid AI Tutor for 'THE BEST FUTURE STUDY POINT', a premier coaching institute in Jurawanpur (400m from Chakausan, Near Double Transformer), founded by Ranjan Sir (Contact: 7549172190). You teach Bihar Board (BSEB) students from Class 1 to 12. Answer clearly, concisely, and helpfully in English (or in the language the student uses). Never mention OpenAI or Google.";

    try {
      const res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userText }
          ],
          model: 'openai'
        })
      });
      const reply = await res.text();
      const finalReply = reply || 'Please try asking your question again.';
      setMessages((prev) => [...prev, { sender: 'bot', text: finalReply }]);
      speakText(finalReply);
    } catch (err) {
      const fallback = 'Network error. Please check your internet connection.';
      setMessages((prev) => [...prev, { sender: 'bot', text: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '22px', right: '22px', zIndex: 9999 }}>
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="btn-3d-cyan text-white px-5 py-3.5 rounded-full font-black text-xs sm:text-sm flex items-center gap-2.5 border border-cyan-300"
        >
          <span className="text-lg">🤖</span>
          <span>3D AI Doubt Solver</span>
        </button>
      )}

      {isOpen && (
        <div className="w-[340px] sm:w-[370px] h-[490px] card-3d-dark border-2 border-cyan-400/60 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl btn-3d-gold text-slate-950 flex items-center justify-center font-black">
                🤖
              </div>
              <div>
                <div className="text-xs font-black text-white">FuturePoint 3D AI Tutor</div>
                <div className="text-[10px] font-bold text-cyan-300">
                  {isSpeaking ? '🔊 Speaking...' : '● Online • BSEB 1-12 Expert'}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                window.speechSynthesis?.cancel();
                setIsOpen(false);
              }}
              className="text-slate-400 hover:text-white font-black text-base"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-950/80 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl max-w-[85%] leading-relaxed font-semibold ${
                  m.sender === 'user'
                    ? 'ml-auto bg-cyan-600 text-white'
                    : 'mr-auto bg-slate-900 text-slate-100 border border-slate-800'
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && <div className="text-cyan-400 font-bold text-xs">✨ Solving your doubt...</div>}
            {isListening && <div className="text-amber-300 font-black text-xs text-center">🎙️ Listening... Speak now</div>}
          </div>

          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <button
              onClick={startListening}
              className={`p-2.5 rounded-xl text-white ${isListening ? 'bg-red-600' : 'btn-3d-cyan'}`}
            >
              <Mic className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask any Class 1-12 doubt..."
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading}
              className="btn-3d-gold text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
