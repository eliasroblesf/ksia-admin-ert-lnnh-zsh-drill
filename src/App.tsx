/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { scenarios23, Scenario23 } from './data/scenarios';
import { translations, LanguageMode } from './data/translations';
import { 
  Building2, 
  Clock, 
  Send, 
  ChevronRight, 
  RefreshCcw,
  CheckCircle2,
  Download,
  Info,
  Share2,
  Volume2,
  VolumeX,
  HelpCircle,
  Search,
  Sparkles,
  Copy,
  Check,
  UserCheck,
  Edit3,
  Radio,
  ShieldAlert,
  Zap,
  Layers,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

type AppStage = 'SPLASH' | 'CHOICE' | 'READING' | 'REPORTING' | 'RESULT';
type OfficeFilter = 'ALL' | 'HR' | 'FINANCE' | 'IT' | 'EXECUTIVE' | 'GROUND';

export default function App() {
  const [lang, setLang] = useState<LanguageMode>('en');
  
  // Student identification state with local storage persistence
  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem('ksia_student_name') || '';
  });
  const [badgeNumber, setBadgeNumber] = useState<string>(() => {
    return localStorage.getItem('ksia_badge_number') || '';
  });
  const [splashError, setSplashError] = useState<string>('');

  // Initial stage: show splash screen if student info is missing, or start at splash by default
  const [stage, setAppStage] = useState<AppStage>(() => {
    const savedName = localStorage.getItem('ksia_student_name');
    const savedBadge = localStorage.getItem('ksia_badge_number');
    return (savedName && savedBadge) ? 'CHOICE' : 'SPLASH';
  });

  const [selectedScenario, setSelectedScenario] = useState<Scenario23 | null>(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [filter, setFilter] = useState<OfficeFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  
  // User answers - Part 1: Initial Discovery (L-N-N-H)
  const [userL, setUserL] = useState('');
  const [userN_Nature, setUserN_Nature] = useState('');
  const [userN_Numbers, setUserN_Numbers] = useState('');
  const [userH, setUserH] = useState('');

  // User answers - Part 2: Ongoing Operations Zone Check-In (Z-S-H)
  const [userZ_Zone, setUserZ_Zone] = useState('');
  const [userS_Status, setUserS_Status] = useState('');
  const [userH_Hazard, setUserH_Hazard] = useState('');
  
  // Time tracking
  const readingStartTimeRef = React.useRef(0);
  const reportingStartTimeRef = React.useRef(0);
  const [readingDuration, setReadingDuration] = useState(0);
  const [reportingDuration, setReportingDuration] = useState(0);

  // Active translation set
  const t = translations[lang === 'ar' ? 'ar' : 'en'];
  const isRTL = lang === 'ar';

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (lang === 'ar') {
      return mins > 0 ? `${mins} دقيقة و ${secs} ثانية` : `${secs} ثانية`;
    }
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Handle student splash screen submission
  const handleStartFromSplash = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = studentName.trim();
    const cleanBadge = badgeNumber.trim();
    
    if (!cleanName || !cleanBadge) {
      setSplashError(t.studentRequiredAlert);
      return;
    }
    
    setSplashError('');
    localStorage.setItem('ksia_student_name', cleanName);
    localStorage.setItem('ksia_badge_number', cleanBadge);
    setAppStage('CHOICE');
  };

  // Switch/change trainee
  const handleChangeTrainee = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setAppStage('SPLASH');
  };

  // Speech synthesis for non-native speakers practicing listening
  const handleSpeak = (text: string, voiceLang: 'en' | 'ar') => {
    if (!('speechSynthesis' in window)) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLang === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startScenario = (scenario: Scenario23) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setSelectedScenario(scenario);
    setAppStage('READING');
    setTimeLeft(120);
    setIsTimerRunning(true);
    // Reset answers
    setUserL('');
    setUserN_Nature('');
    setUserN_Numbers('');
    setUserH('');
    setUserZ_Zone('');
    setUserS_Status('');
    setUserH_Hazard('');
    
    readingStartTimeRef.current = Date.now();
    reportingStartTimeRef.current = 0;
  };

  const handleNextFromReading = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    const now = Date.now();
    const duration = readingStartTimeRef.current > 0 ? Math.round((now - readingStartTimeRef.current) / 1000) : 0;
    setReadingDuration(duration);
    setAppStage('REPORTING');
    reportingStartTimeRef.current = now;
    setTimeLeft(300); // 5 minutes for reporting
    setIsTimerRunning(true);
  }, []);

  const handleSubmit = useCallback(() => {
    const now = Date.now();
    const duration = reportingStartTimeRef.current > 0 ? Math.round((now - reportingStartTimeRef.current) / 1000) : 0;
    setReportingDuration(duration);
    setAppStage('RESULT');
    setIsTimerRunning(false);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0f766e', '#14b8a6', '#0284c7']
    });
  }, []);

  const isFormComplete = useMemo(() => {
    return Boolean(
      userL.trim() &&
      userN_Nature.trim() &&
      userN_Numbers.trim() &&
      userH.trim() &&
      userZ_Zone.trim() &&
      userS_Status.trim() &&
      userH_Hazard.trim()
    );
  }, [userL, userN_Nature, userN_Numbers, userH, userZ_Zone, userS_Status, userH_Hazard]);

  const shareWhatsApp = () => {
    if (!selectedScenario) return;
    const title = lang === 'ar' ? selectedScenario.titleAr : selectedScenario.title;
    const text = `*KSIA ERT Topic 2.3 Report (Airport Admin Offices)*
*Trainee:* ${studentName.trim() || 'N/A'}
*Badge ID:* ${badgeNumber.trim() || 'N/A'}
*Incident #${selectedScenario.id}:* ${title}
*Date:* ${new Date().toLocaleString()}

*Drill Performance:*
- Reading Phase: ${formatDuration(readingDuration)}
- Reporting Phase: ${formatDuration(reportingDuration)}

*Part 1: Initial Discovery (L-N-N-H):*
*L - Location:* ${userL}
*N - Nature:* ${userN_Nature}
*N - Numbers:* ${userN_Numbers}
*H - Hazards:* ${userH}

*Part 2: Operational Zone Check-In (Z-S-H):*
*Z - Zone:* ${userZ_Zone}
*S - Status:* ${userS_Status}
*H - Hazard:* ${userH_Hazard}`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = () => {
    if (!selectedScenario) return;
    const reportText = `[KSIA ERT Administrative Drill - Topic 2.3]
Trainee: ${studentName.trim()} | Badge #: ${badgeNumber.trim()}
Incident #${selectedScenario.id}: ${selectedScenario.title}
Date: ${new Date().toLocaleString()}

--- PART 1: INITIAL DISCOVERY (L-N-N-H) ---
L (Location): ${userL}
N (Nature): ${userN_Nature}
N (Numbers): ${userN_Numbers}
H (Hazards): ${userH}

--- PART 2: OPERATIONAL ZONE CHECK-IN (Z-S-H) ---
Z (Zone): ${userZ_Zone}
S (Status): ${userS_Status}
H (Hazard): ${userH_Hazard}

Time: Reading ${formatDuration(readingDuration)} | Reporting ${formatDuration(reportingDuration)}`;

    navigator.clipboard.writeText(reportText).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  useEffect(() => {
    let timer: number;
    if (isTimerRunning && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      if (stage === 'READING') {
        handleNextFromReading();
      } else if (stage === 'REPORTING') {
        handleSubmit();
      }
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft, stage, handleNextFromReading, handleSubmit]);

  const resetApp = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (studentName.trim() && badgeNumber.trim()) {
      setAppStage('CHOICE');
    } else {
      setAppStage('SPLASH');
    }
    setSelectedScenario(null);
    setIsTimerRunning(false);
  };

  // Filtered scenarios
  const filteredScenarios = useMemo(() => {
    return scenarios23.filter(sc => {
      const matchesSearch = 
        sc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.titleAr.includes(searchQuery) ||
        sc.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.floor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.scenarioText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.scenarioTextAr.includes(searchQuery) ||
        sc.id.toString() === searchQuery.trim();

      if (!matchesSearch) return false;

      if (filter === 'ALL') return true;
      if (filter === 'HR') return sc.department.includes('Human Resources') || sc.department.includes('Training');
      if (filter === 'FINANCE') return sc.department.includes('Finance') || sc.department.includes('Procurement');
      if (filter === 'IT') return sc.department.includes('IT');
      if (filter === 'EXECUTIVE') return sc.department.includes('Executive') || sc.department.includes('Legal') || sc.department.includes('Audit');
      if (filter === 'GROUND') return sc.department.includes('Archive') || sc.department.includes('Lobby') || sc.department.includes('Mailroom') || sc.department.includes('Facilities') || sc.department.includes('Transit');
      return true;
    });
  }, [filter, searchQuery]);

  // Export 2-page executive certified PDF
  const exportPDF = useCallback(() => {
    if (!selectedScenario) return;
    
    const doc = new jsPDF();
    const margin = 18;
    let y = 18;

    // === PAGE 1: PART 1 INITIAL DISCOVERY (L-N-N-H) ===
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 44, 'F');
    doc.setTextColor(255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('KSIA ERT Readiness Drill Report (Part 1)', margin, 18);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Topic 2.3: Initial Incident Discovery Report (L-N-N-H) • Airport Admin Offices', margin, 26);
    doc.setFontSize(8.5);
    doc.text('King Salman International Airport • Emergency Response Team Training Directorate', margin, 34);

    y = 52;
    
    // Official Trainee Identification Box
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, 174, 22, 2, 2, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`TRAINEE: ${studentName.trim().toUpperCase() || 'NOT SPECIFIED'}`, margin + 5, y + 8);
    doc.text(`BADGE ID: ${badgeNumber.trim().toUpperCase() || 'N/A'}`, margin + 5, y + 15);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`DATE: ${new Date().toLocaleString()}`, margin + 105, y + 8);
    doc.text(`LOCATION: Airport Admin Building`, margin + 105, y + 15);

    y += 28;

    // Incident Context
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Incident #${selectedScenario.id}: ${selectedScenario.title}`, margin, y);
    y += 5;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Dept: ${selectedScenario.department} | Floor: ${selectedScenario.floor}`, margin, y);
    y += 4.5;
    doc.text(`Reading Duration: ${formatDuration(readingDuration)} | Reporting Duration: ${formatDuration(reportingDuration)}`, margin, y);
    y += 8;

    // User Report Box (L-N-N-H)
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, 174, 68, 2, 2, 'FD');
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PART 1: CANDIDATE INITIAL RADIO BROADCAST (L-N-N-H)', margin + 5, y + 8);

    const userLnnhSections = [
      { tag: 'L (Location):', val: userL || 'No location provided.' },
      { tag: 'N (Nature):', val: userN_Nature || 'No nature provided.' },
      { tag: 'N (Numbers):', val: userN_Numbers || 'No numbers provided.' },
      { tag: 'H (Hazards):', val: userH || 'No hazards provided.' }
    ];

    let subY = y + 16;
    doc.setFontSize(8.5);
    userLnnhSections.forEach(item => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(item.tag, margin + 5, subY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(item.val, 132);
      doc.text(lines, margin + 36, subY);
      subY += Math.max(lines.length * 4.2, 5.5) + 3;
    });

    y = subY + 8;

    // Facilitator Benchmark (L-N-N-H)
    doc.setFillColor(240, 253, 250); // teal-50
    doc.setDrawColor(153, 246, 228);
    doc.roundedRect(margin, y, 174, 70, 2, 2, 'FD');

    doc.setTextColor(15, 118, 110);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PART 1: FACILITATOR EXTRACTION BENCHMARK (L-N-N-H)', margin + 5, y + 8);

    const keyLnnhSections = [
      { tag: 'L (Location):', val: selectedScenario.extractionKey.l },
      { tag: 'N (Nature):', val: selectedScenario.extractionKey.n_nature },
      { tag: 'N (Numbers):', val: selectedScenario.extractionKey.n_numbers },
      { tag: 'H (Hazards):', val: selectedScenario.extractionKey.h }
    ];

    subY = y + 16;
    doc.setFontSize(8.5);
    keyLnnhSections.forEach(item => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 118, 110);
      doc.text(item.tag, margin + 5, subY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(19, 78, 74);
      const lines = doc.splitTextToSize(item.val, 132);
      doc.text(lines, margin + 36, subY);
      subY += Math.max(lines.length * 4.2, 5.5) + 3;
    });

    // Page 1 Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`KSIA ERT Topic 2.3 Report • Page 1 of 2 • Trainee: ${studentName.trim()}`, margin, 288);

    // === PAGE 2: PART 2 OPERATIONAL ZONE CHECK-IN (Z-S-H) ===
    doc.addPage();
    y = 18;

    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 44, 'F');
    doc.setTextColor(255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('KSIA ERT Operational Report (Part 2)', margin, 18);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Topic 2.3: Streamlined 3-Part Operational Zone Check-In (Z-S-H)', margin, 26);
    doc.setFontSize(8.5);
    doc.text('High-Velocity Protocol for Deployed Sweep Teams, Barrier Monitors & Evacuation Marshals', margin, 34);

    y = 52;

    // Tactical Protocol Rationale Note
    doc.setFillColor(254, 243, 199); // amber-100
    doc.setDrawColor(251, 191, 36);
    doc.roundedRect(margin, y, 174, 18, 2, 2, 'FD');
    doc.setTextColor(146, 64, 14); // amber-800
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('RADIO NET VELOCITY & DISCIPLINE PRINCIPLE:', margin + 5, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.text('Ongoing operations require rapid check-ins (<15 sec) across dispersed sectors to prevent clogging command radio nets.', margin + 5, y + 12);

    y += 24;

    // User Report Box (Z-S-H)
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, 174, 62, 2, 2, 'FD');
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PART 2: CANDIDATE OPERATIONAL ZONE TRANSMISSION (Z-S-H)', margin + 5, y + 8);

    const userZshSections = [
      { tag: 'Z (Zone):', val: userZ_Zone || 'No operational zone provided.' },
      { tag: 'S (Status):', val: userS_Status || 'No zone status provided.' },
      { tag: 'H (Hazard):', val: userH_Hazard || 'No zone hazard provided.' }
    ];

    subY = y + 16;
    doc.setFontSize(8.5);
    userZshSections.forEach(item => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(item.tag, margin + 5, subY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(item.val, 132);
      doc.text(lines, margin + 36, subY);
      subY += Math.max(lines.length * 4.2, 5.5) + 3.5;
    });

    y = subY + 8;

    // Facilitator Benchmark (Z-S-H)
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(153, 246, 228);
    doc.roundedRect(margin, y, 174, 66, 2, 2, 'FD');

    doc.setTextColor(15, 118, 110);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PART 2: FACILITATOR EXTRACTION BENCHMARK (Z-S-H)', margin + 5, y + 8);

    const keyZshSections = [
      { tag: 'Z (Zone):', val: selectedScenario.zshExtractionKey.z_zone },
      { tag: 'S (Status):', val: selectedScenario.zshExtractionKey.s_status },
      { tag: 'H (Hazard):', val: selectedScenario.zshExtractionKey.h_hazard }
    ];

    subY = y + 16;
    doc.setFontSize(8.5);
    keyZshSections.forEach(item => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 118, 110);
      doc.text(item.tag, margin + 5, subY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(19, 78, 74);
      const lines = doc.splitTextToSize(item.val, 132);
      doc.text(lines, margin + 36, subY);
      subY += Math.max(lines.length * 4.2, 5.5) + 3.5;
    });

    // Certification Stamp Card
    y = subY + 8;
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, 174, 20, 2, 2, 'FD');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('OFFICIAL READINESS CERTIFICATION STAMP', margin + 5, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Verified dual-format radio competency for KSIA Admin ERT Officer: ${studentName.trim()} [ID: ${badgeNumber.trim()}]`, margin + 5, y + 14);

    // Page 2 Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`KSIA ERT Topic 2.3 Report • Page 2 of 2 • Certified System Evaluation`, margin, 288);

    const safeBadge = badgeNumber.trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'REPORT';
    doc.save(`KSIA_Report_${safeBadge}_Scenario_${selectedScenario.id}.pdf`);
  }, [selectedScenario, studentName, badgeNumber, userL, userN_Nature, userN_Numbers, userH, userZ_Zone, userS_Status, userH_Hazard, readingDuration, reportingDuration, formatDuration]);

  // Insert helper phrase into answer box
  const insertPhrase = (field: 'L' | 'N1' | 'N2' | 'H' | 'Z' | 'S' | 'HZ', phrase: string) => {
    if (field === 'L') {
      setUserL(prev => prev ? `${prev}, ${phrase}` : phrase);
    } else if (field === 'N1') {
      setUserN_Nature(prev => prev ? `${prev}, ${phrase}` : phrase);
    } else if (field === 'N2') {
      setUserN_Numbers(prev => prev ? `${prev}, ${phrase}` : phrase);
    } else if (field === 'H') {
      setUserH(prev => prev ? `${prev}, ${phrase}` : phrase);
    } else if (field === 'Z') {
      setUserZ_Zone(prev => prev ? `${prev}, ${phrase}` : phrase);
    } else if (field === 'S') {
      setUserS_Status(prev => prev ? `${prev}, ${phrase}` : phrase);
    } else if (field === 'HZ') {
      setUserH_Hazard(prev => prev ? `${prev}, ${phrase}` : phrase);
    }
  };

  return (
    <div 
      className={`min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-100 flex flex-col ${isRTL ? 'font-arabic' : 'font-sans'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <OfflineIndicator />
      
      {/* Top Navigation & Language Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo & Branding */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={resetApp}
            title={lang === 'ar' ? 'العودة للصفحة الرئيسية' : 'Return to Home'}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md group-hover:bg-teal-700 transition-colors">
              <Building2 className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-950 tracking-tight">KSIA ERT</span>
                <span className="hidden sm:inline-flex rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-800 border border-teal-200">
                  {t.badgeAdmin}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 tracking-wide mt-0.5">
                {lang === 'ar' ? 'مكاتب المطار الإدارية • الموضوع 2.3' : 'Airport Administrative Offices • Topic 2.3'}
              </p>
            </div>
          </div>

          {/* Right Controls: Student Badge Chip, Language Selector, Guide, PWA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student ID badge chip if registered */}
            {stage !== 'SPLASH' && studentName && (
              <button
                onClick={handleChangeTrainee}
                className="flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/90 px-2.5 py-1.5 text-xs font-bold text-teal-900 hover:bg-teal-100 transition-colors shadow-2xs group"
                title={lang === 'ar' ? 'انقر لتعديل بيانات المتدرب' : 'Click to change trainee name/badge'}
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                <span className="truncate max-w-[120px] sm:max-w-[150px]">{studentName}</span>
                <span className="text-[10px] text-teal-600 bg-teal-200/60 px-1.5 py-0.2 rounded font-mono font-bold">
                  {badgeNumber}
                </span>
                <Edit3 className="w-3 h-3 text-teal-600 opacity-60 group-hover:opacity-100 ml-0.5" />
              </button>
            )}

            {/* Guide Button */}
            <button
              onClick={() => setShowGuideModal(true)}
              className="hidden lg:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-teal-600" />
              <span>{t.lnnhGuideBtn}</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setLang('en')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  lang === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="English (Primary)"
              >
                EN
              </button>
              <button
                onClick={() => setLang('ar')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  lang === 'ar' ? 'bg-white text-slate-900 shadow-xs font-arabic' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="العربية"
              >
                عربي
              </button>
              <button
                onClick={() => setLang('bilingual')}
                className={`hidden sm:inline-flex rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  lang === 'bilingual' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Bilingual / ثنائي اللغة"
              >
                EN / عربي
              </button>
            </div>

            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <AnimatePresence mode="wait">
          {/* STAGE 0: STUDENT BADGING SPLASH SCREEN */}
          {stage === 'SPLASH' && (
            <motion.div
              key="splash"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mx-auto max-w-lg space-y-6 pt-6 sm:pt-12"
            >
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
                <div className="text-center space-y-3">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 shadow-inner">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                      {t.splashTitle}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                      {t.splashSubtitle}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleStartFromSplash} className="space-y-4">
                  {splashError && (
                    <div className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700 border border-red-200 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{splashError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      {t.studentNameLabel} *
                    </label>
                    <input 
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder={t.studentNamePlaceholder}
                      className="w-full rounded-xl border border-slate-200 p-3.5 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 bg-slate-50/50"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      {t.badgeNumberLabel} *
                    </label>
                    <input 
                      type="text"
                      value={badgeNumber}
                      onChange={(e) => setBadgeNumber(e.target.value)}
                      placeholder={t.badgeNumberPlaceholder}
                      className="w-full rounded-xl border border-slate-200 p-3.5 text-sm font-mono font-bold text-slate-900 outline-none transition-all focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 bg-slate-50/50"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-slate-900 py-4 text-base font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-98 cursor-pointer"
                    >
                      <span>{t.startDrillBtn}</span>
                      <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  <p className="text-center text-[11px] text-slate-400 font-medium pt-1">
                    {t.officialRecordNote}
                  </p>
                </form>
              </div>
            </motion.div>
          )}

          {/* STAGE 1: SCENARIO SELECTION & DRILL RULES */}
          {stage === 'CHOICE' && (
            <motion.div
              key="choice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Drill Rules Banner with Dual-Format Protocol Context */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-teal-800 text-xs font-black">
                        2.3
                      </span>
                      <h2 className="text-lg sm:text-xl font-black text-slate-950">
                        {t.drillRulesTitle}
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      {t.drillRulesDesc}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                      <Radio className="w-3.5 h-3.5 text-teal-600" />
                      <span>{lang === 'ar' ? 'نموذج ثنائي: L-N-N-H ثم Z-S-H' : 'Dual Protocol: L-N-N-H & Z-S-H'}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Phase 1</span>
                    <p className="text-xs font-bold text-slate-800">{t.rule1}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-1">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Phase 2</span>
                    <p className="text-xs font-bold text-slate-800">{t.rule2}</p>
                  </div>
                  <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-3.5 space-y-1">
                    <span className="text-[11px] font-black text-teal-700 uppercase tracking-widest block">Initial (L-N-N-H)</span>
                    <p className="text-xs font-bold text-teal-950">{t.rule3}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3.5 space-y-1">
                    <span className="text-[11px] font-black text-amber-700 uppercase tracking-widest block">Ongoing (Z-S-H)</span>
                    <p className="text-xs font-bold text-amber-950">{t.rule4}</p>
                  </div>
                </div>
              </div>

              {/* Department Filters & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rtl:right-3.5 rtl:left-auto" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 rtl:pr-10 rtl:pl-4 text-xs sm:text-sm font-medium outline-none transition-all focus:border-slate-900 shadow-2xs"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  {(['ALL', 'HR', 'FINANCE', 'IT', 'EXECUTIVE', 'GROUND'] as OfficeFilter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
                        filter === f 
                          ? 'bg-white text-slate-900 shadow-xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {f === 'ALL' && t.filterAll}
                      {f === 'HR' && t.filterHr}
                      {f === 'FINANCE' && t.filterFinance}
                      {f === 'IT' && t.filterIt}
                      {f === 'EXECUTIVE' && t.filterExecutive}
                      {f === 'GROUND' && t.filterGround}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scenarios Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredScenarios.map((sc) => (
                  <div
                    key={sc.id}
                    onClick={() => startScenario(sc)}
                    className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:-translate-y-1 hover:border-slate-900 hover:shadow-lg cursor-pointer"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900 text-white text-xs font-black">
                          #{sc.id}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                          {sc.floor}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
                          {lang === 'ar' ? sc.titleAr : sc.title}
                        </h3>
                        {lang === 'bilingual' && (
                          <p className="text-xs text-teal-800 font-arabic font-bold mt-1">
                            {sc.titleAr}
                          </p>
                        )}
                        <p className="text-xs font-semibold text-slate-400 mt-1">
                          {lang === 'ar' ? sc.departmentAr : sc.department}
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium">
                        {lang === 'ar' ? sc.scenarioTextAr : sc.scenarioText}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-teal-800 group-hover:text-teal-950 flex items-center gap-1">
                        <span>{lang === 'ar' ? 'ابدأ التمرين (LNNH + ZSH)' : 'Start Drill (LNNH + ZSH)'}</span>
                      </span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STAGE 2: READING PHASE */}
          {stage === 'READING' && selectedScenario && (
            <motion.div
              key="reading"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto max-w-3xl space-y-6"
            >
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block">
                      {selectedScenario.department} • {selectedScenario.floor}
                    </span>
                    <h2 className="text-2xl font-black text-slate-950 mt-1">
                      {lang === 'ar' ? selectedScenario.titleAr : selectedScenario.title}
                    </h2>
                    {lang === 'bilingual' && (
                      <h3 className="text-xl font-bold text-teal-800 font-arabic mt-1">
                        {selectedScenario.titleAr}
                      </h3>
                    )}
                  </div>

                  <div className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-mono text-xl font-bold shadow-inner ${
                    timeLeft <= 20 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-900'
                  }`}>
                    <Clock className="w-5 h-5 text-slate-500" />
                    <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>

                {/* Scenario Body Text */}
                <div className="rounded-2xl bg-slate-50 p-5 sm:p-6 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {t.readingPhaseTitle}
                    </span>

                    {/* Audio Read-Aloud for Non-Native Speakers */}
                    <button
                      onClick={() => handleSpeak(
                        lang === 'ar' ? selectedScenario.scenarioTextAr : selectedScenario.scenarioText,
                        lang === 'ar' ? 'ar' : 'en'
                      )}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-4 h-4 text-red-500" />
                          <span className="text-red-600">{t.stopListening}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-teal-600" />
                          <span>{t.listenScenario}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-base sm:text-lg leading-relaxed text-slate-800 font-medium">
                    {lang === 'ar' ? selectedScenario.scenarioTextAr : selectedScenario.scenarioText}
                  </p>

                  {lang === 'bilingual' && (
                    <div className="pt-3 border-t border-slate-200">
                      <p className="text-xs font-bold text-slate-400 mb-1 font-arabic">الترجمة العربية:</p>
                      <p className="text-base leading-relaxed text-slate-700 font-arabic font-medium" dir="rtl">
                        {selectedScenario.scenarioTextAr}
                      </p>
                    </div>
                  )}
                </div>

                {/* Dual-Format Strategy Notice */}
                <div className="rounded-2xl bg-slate-900 text-white p-4.5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-teal-300">
                    <Radio className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'مطلوب في مرحلة التقرير (نموذجان):' : 'Dual-Format Reporting Required in Next Step:'}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-200">
                    <div className="bg-white/10 rounded-xl p-2.5">
                      <span className="font-black text-white block mb-0.5">1. L-N-N-H (Initial Discovery)</span>
                      <p className="text-slate-300 text-[11px] leading-tight">
                        {lang === 'ar' ? 'الموقع، الطبيعة، الأعداد، المخاطر لإطلاق الاستجابة الأولى.' : 'Location, Nature, Numbers, Hazards for initial dispatch alert.'}
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-2.5">
                      <span className="font-black text-amber-300 block mb-0.5">2. Z-S-H (Operational Check-In)</span>
                      <p className="text-slate-300 text-[11px] leading-tight">
                        {lang === 'ar' ? 'القطاع، الحالة، الخطر للتحديث السريع أثناء المسح والإخلاء.' : 'Zone, Status, Hazard for lean high-velocity check-ins.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reading Timer Progress Bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 120, ease: "linear" }}
                    className={`h-full ${timeLeft <= 15 ? 'bg-red-500' : 'bg-slate-900'}`}
                  />
                </div>

                {/* Proceed Button */}
                <div className="pt-2">
                  <button
                    onClick={handleNextFromReading}
                    className="w-full group flex items-center justify-center gap-3 rounded-2xl bg-slate-900 py-4 text-lg font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-98 cursor-pointer"
                  >
                    <span>{t.proceedToReport}</span>
                    <ChevronRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 3: REPORTING IN DUAL FORMAT (L-N-N-H & Z-S-H) */}
          {stage === 'REPORTING' && selectedScenario && (
            <motion.div
              key="reporting"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mx-auto max-w-3xl space-y-6"
            >
              {/* Header with Student Identification & Countdown Timer */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                      {t.reportingPhaseTitle}
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
                      {t.reportingPhaseSubtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-mono text-xl font-bold shadow-inner ${
                      timeLeft <= 45 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-900'
                    }`}>
                      <Clock className="w-5 h-5 text-slate-500" />
                      <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                        {t.scenarioLabel}
                      </span>
                      <p className="text-base font-black text-slate-900">#{selectedScenario.id}</p>
                    </div>
                  </div>
                </div>

                {/* Trainee Identity Banner */}
                {studentName && (
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-teal-700" />
                      <span className="font-bold text-slate-700">{t.traineeLabel}:</span>
                      <span className="font-extrabold text-slate-900">{studentName}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-bold text-slate-700">{t.badgeLabel}:</span>
                      <span className="font-mono font-bold text-teal-800">{badgeNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        (userL && userN_Nature && userN_Numbers && userH) 
                          ? 'bg-teal-100 text-teal-800' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        Part 1: {(userL && userN_Nature && userN_Numbers && userH) ? '✓ Ready' : 'Incomplete'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        (userZ_Zone && userS_Status && userH_Hazard) 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        Part 2: {(userZ_Zone && userS_Status && userH_Hazard) ? '✓ Ready' : 'Incomplete'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Scenario Quick Reference Reminder */}
              <div className="rounded-2xl border border-slate-200 bg-slate-100/70 p-4 text-xs space-y-1">
                <span className="font-bold text-slate-700 uppercase tracking-wider block">
                  {lang === 'ar' ? 'تذكير بالحادث الإداري المختار:' : 'Incident Briefing Reference:'}
                </span>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {lang === 'ar' ? selectedScenario.scenarioTextAr : selectedScenario.scenarioText}
                </p>
              </div>

              {/* ======================================================== */}
              {/* PART 1: INITIAL INCIDENT DISCOVERY (L-N-N-H)             */}
              {/* ======================================================== */}
              <div className="rounded-3xl border-2 border-slate-300 bg-slate-50/50 p-5 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <span className="rounded-md bg-slate-900 px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                      {t.part1SectionBadge}
                    </span>
                    <h3 className="text-lg font-black text-slate-950 mt-1">
                      {t.part1SectionTitle}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    4 Required Fields
                  </span>
                </div>
                
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {t.part1SectionDesc}
                </p>

                <div className="space-y-4">
                  {/* L - LOCATION */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 transition-all focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-900/5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-900 text-white text-[11px] font-black">L</span>
                        <span>{t.l_title}</span>
                      </label>
                      <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                        {t.l_question}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{t.l_subtext}</p>
                    <textarea
                      value={userL}
                      onChange={(e) => setUserL(e.target.value)}
                      placeholder={t.l_placeholder}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm font-medium outline-none transition-all focus:border-slate-900 min-h-[65px]"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'اقتراحات:' : 'Quick add:'}</span>
                      {[
                        lang === 'ar' ? 'مبنى إدارة المطار' : 'Airport Admin Building',
                        lang === 'ar' ? 'الطابق الثالث غرفة 305' : '3rd Floor Room 305',
                        lang === 'ar' ? 'القبو B1' : 'Basement B1',
                        lang === 'ar' ? 'ردهة الاستقبال الرئيسية' : 'Main Reception Lobby'
                      ].map((phrase, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => insertPhrase('L', phrase)}
                          className="rounded-md bg-slate-100 hover:bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 transition-colors"
                        >
                          + {phrase}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* N1 - NATURE */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 transition-all focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-900/5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-900 text-white text-[11px] font-black">N</span>
                        <span>{t.n1_title}</span>
                      </label>
                      <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                        {t.n1_question}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{t.n1_subtext}</p>
                    <textarea
                      value={userN_Nature}
                      onChange={(e) => setUserN_Nature(e.target.value)}
                      placeholder={t.n1_placeholder}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm font-medium outline-none transition-all focus:border-slate-900 min-h-[65px]"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'اقتراحات:' : 'Quick add:'}</span>
                      {[
                        lang === 'ar' ? 'حريق جهاز كهربائي ودخان' : 'Appliance fire with smoke',
                        lang === 'ar' ? 'سقوط أثاث واحتجاز' : 'Heavy cabinet fall entrapment',
                        lang === 'ar' ? 'انفجار أنبوب مياه وغرق' : 'Pipe burst flooding office',
                        lang === 'ar' ? 'سقوط وإصابة رأس' : 'Slip and fall head injury'
                      ].map((phrase, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => insertPhrase('N1', phrase)}
                          className="rounded-md bg-slate-100 hover:bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 transition-colors"
                        >
                          + {phrase}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* N2 - NUMBERS */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 transition-all focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-900/5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-900 text-white text-[11px] font-black">N</span>
                        <span>{t.n2_title}</span>
                      </label>
                      <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                        {t.n2_question}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{t.n2_subtext}</p>
                    <textarea
                      value={userN_Numbers}
                      onChange={(e) => setUserN_Numbers(e.target.value)}
                      placeholder={t.n2_placeholder}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm font-medium outline-none transition-all focus:border-slate-900 min-h-[65px]"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'اقتراحات:' : 'Quick add:'}</span>
                      {[
                        lang === 'ar' ? 'شخص واحد واعٍ ومصاب' : '1 person conscious and injured',
                        lang === 'ar' ? 'شخص واحد فاقد الوعي' : '1 person unconscious',
                        lang === 'ar' ? 'إخلاء جميع الموظفين بسلام' : 'All colleagues safely evacuated',
                        lang === 'ar' ? 'صفر إصابات بشرية' : 'Zero casualties'
                      ].map((phrase, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => insertPhrase('N2', phrase)}
                          className="rounded-md bg-slate-100 hover:bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 transition-colors"
                        >
                          + {phrase}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* H - HAZARDS */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 transition-all focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-900/5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-900 text-white text-[11px] font-black">H</span>
                        <span>{t.h_title}</span>
                      </label>
                      <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                        {t.h_question}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{t.h_subtext}</p>
                    <textarea
                      value={userH}
                      onChange={(e) => setUserH(e.target.value)}
                      placeholder={t.h_placeholder}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm font-medium outline-none transition-all focus:border-slate-900 min-h-[65px]"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'اقتراحات:' : 'Quick add:'}</span>
                      {[
                        lang === 'ar' ? 'تيار كهربائي متصل' : 'Live electrical current',
                        lang === 'ar' ? 'دخان ينتشر بالممر' : 'Smoke spreading in hallway',
                        lang === 'ar' ? 'أرضية مبللة زلقة' : 'Slippery wet flooring',
                        lang === 'ar' ? 'الباب مسدود بالصناديق' : 'Door blocked by boxes'
                      ].map((phrase, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => insertPhrase('H', phrase)}
                          className="rounded-md bg-slate-100 hover:bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 transition-colors"
                        >
                          + {phrase}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* PART 2: STREAMLINED ZONE STATUS CHECK-IN (Z-S-H)         */}
              {/* ======================================================== */}
              <div className="rounded-3xl border-2 border-amber-300 bg-amber-50/40 p-5 sm:p-6 space-y-5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-3">
                  <div>
                    <span className="rounded-md bg-amber-800 px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5 w-fit">
                      <Zap className="w-3 h-3 text-amber-300" />
                      <span>{t.part2SectionBadge}</span>
                    </span>
                    <h3 className="text-lg font-black text-slate-950 mt-1">
                      {t.part2SectionTitle}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200">
                    3 Lean Velocity Items
                  </span>
                </div>

                {/* Tactical Operational Rationale Box */}
                <div className="rounded-2xl bg-white/90 border border-amber-200 p-4 text-xs space-y-1.5 text-amber-950">
                  <div className="flex items-center gap-1.5 font-black text-amber-900">
                    <Activity className="w-4 h-4 text-amber-600" />
                    <span>{lang === 'ar' ? 'لماذا نتحول إلى نموذج Z-S-H أثناء العمليات؟' : 'Operational Rationale for Shifting to Z-S-H:'}</span>
                  </div>
                  <p className="leading-relaxed font-medium text-slate-700">
                    {t.part2SectionDesc}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Z - ZONE */}
                  <div className="rounded-2xl border border-amber-200/90 bg-white p-4 space-y-2 transition-all focus-within:border-amber-600 focus-within:ring-4 focus-within:ring-amber-500/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-800 text-white text-[11px] font-black">Z</span>
                        <span>{t.z_title}</span>
                      </label>
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-200">
                        {t.z_question}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{t.z_subtext}</p>
                    <textarea
                      value={userZ_Zone}
                      onChange={(e) => setUserZ_Zone(e.target.value)}
                      placeholder={t.z_placeholder}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm font-medium outline-none transition-all focus:border-amber-700 min-h-[65px]"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'اقتراحات:' : 'Tactical chips:'}</span>
                      {[
                        lang === 'ar' ? 'منطقة الجناح الشرقي' : 'Zone East Wing',
                        lang === 'ar' ? 'منطقة الطابق الثالث' : 'Zone 3rd Floor',
                        lang === 'ar' ? 'قطاع مكاتب تقنية المعلومات' : 'Zone 2-IT Server Sector',
                        lang === 'ar' ? 'قطاع قبو الأرشيف B1' : 'Zone B1-Records Archive',
                        lang === 'ar' ? 'درج الطوارئ المركزي A' : 'Zone Stairwell Core A'
                      ].map((phrase, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => insertPhrase('Z', phrase)}
                          className="rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200/60 px-2 py-0.5 text-[10px] font-semibold text-amber-900 transition-colors"
                        >
                          + {phrase}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* S - STATUS */}
                  <div className="rounded-2xl border border-amber-200/90 bg-white p-4 space-y-2 transition-all focus-within:border-amber-600 focus-within:ring-4 focus-within:ring-amber-500/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-800 text-white text-[11px] font-black">S</span>
                        <span>{t.s_title}</span>
                      </label>
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-200">
                        {t.s_question}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{t.s_subtext}</p>
                    <textarea
                      value={userS_Status}
                      onChange={(e) => setUserS_Status(e.target.value)}
                      placeholder={t.s_placeholder}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm font-medium outline-none transition-all focus:border-amber-700 min-h-[65px]"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'اقتراحات:' : 'Tactical chips:'}</span>
                      {[
                        lang === 'ar' ? 'اكتمل المسح بنسبة 100%' : 'Primary sweep 100% complete',
                        lang === 'ar' ? 'الإخلاء جارٍ نحو مخارج الطوارئ' : 'Evacuation active & moving to stairs',
                        lang === 'ar' ? 'القطاع خالٍ تماماً من الأشخاص' : 'Sector all clear of occupants',
                        lang === 'ar' ? 'تم تثبيت وإسعاف المصاب' : 'Casualty stabilized on site',
                        lang === 'ar' ? 'باب مغلق بحاجة لفتح بالقوة' : 'Locked door, forced entry needed'
                      ].map((phrase, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => insertPhrase('S', phrase)}
                          className="rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200/60 px-2 py-0.5 text-[10px] font-semibold text-amber-900 transition-colors"
                        >
                          + {phrase}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* H - HAZARDS (OPERATIONAL) */}
                  <div className="rounded-2xl border border-amber-200/90 bg-white p-4 space-y-2 transition-all focus-within:border-amber-600 focus-within:ring-4 focus-within:ring-amber-500/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-800 text-white text-[11px] font-black">H</span>
                        <span>{t.hz_title}</span>
                      </label>
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-200">
                        {t.hz_question}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{t.hz_subtext}</p>
                    <textarea
                      value={userH_Hazard}
                      onChange={(e) => setUserH_Hazard(e.target.value)}
                      placeholder={t.hz_placeholder}
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm font-medium outline-none transition-all focus:border-amber-700 min-h-[65px]"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'اقتراحات:' : 'Tactical chips:'}</span>
                      {[
                        lang === 'ar' ? 'القطاع آمن ولا توجد مخاطر حالية' : 'Sector secure, no active hazards',
                        lang === 'ar' ? 'تسرب دخان كثيف نحو سقف الممر' : 'Heavy smoke banking in corridor',
                        lang === 'ar' ? 'أسلاك كهربائية نشطة مكشوفة' : 'Live exposed electrical wiring',
                        lang === 'ar' ? 'مياه زلقة تسيل على الأرضية' : 'Slippery water accumulation on floor',
                        lang === 'ar' ? 'قطع زجاج أو جبس مهددة بالسقوط' : 'Falling debris / overhead hazard'
                      ].map((phrase, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => insertPhrase('HZ', phrase)}
                          className="rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200/60 px-2 py-0.5 text-[10px] font-semibold text-amber-900 transition-colors"
                        >
                          + {phrase}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Broadcast Button */}
              <div className="pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={!isFormComplete}
                  className="w-full group flex items-center justify-center gap-3 rounded-2xl bg-slate-900 py-4 text-base sm:text-lg font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl active:scale-98 cursor-pointer"
                >
                  <Send className={`w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  <span>{t.submitReport}</span>
                </button>

                {!isFormComplete && (
                  <p className="text-center text-xs text-slate-400 mt-2 font-medium">
                    {t.missingFieldsAlert}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* STAGE 4: EVALUATION & RESULTS */}
          {stage === 'RESULT' && selectedScenario && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto max-w-5xl space-y-6"
            >
              {/* Header Box with Trainee Identification & Completed Status */}
              <div className="text-center space-y-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                    {t.drillCompletedTitle}
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto mt-1">
                    {t.drillCompletedSubtitle}
                  </p>
                </div>

                {/* Trainee Credential Record Card */}
                <div className="mx-auto max-w-lg rounded-2xl border border-teal-200 bg-teal-50/80 p-4 text-xs">
                  <div className="grid grid-cols-2 gap-3 text-left rtl:text-right">
                    <div>
                      <span className="text-[10px] font-bold text-teal-800 uppercase tracking-widest block">
                        {t.traineeLabel}
                      </span>
                      <p className="text-sm font-black text-teal-950 mt-0.5">
                        {studentName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-teal-800 uppercase tracking-widest block">
                        {t.badgeLabel}
                      </span>
                      <p className="text-sm font-mono font-bold text-teal-900 mt-0.5">
                        {badgeNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-teal-200/60 flex items-center justify-between text-[11px] text-teal-800">
                    <span>{lang === 'ar' ? 'سجل رسمي موثق (L-N-N-H & Z-S-H)' : 'Certified Dual-Protocol Evaluation'}</span>
                    <span className="font-mono">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Timing & Protocol Badges */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <div className="rounded-xl bg-slate-100 px-4 py-2 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      {t.readingTime}
                    </span>
                    <span className="text-base font-black text-slate-900 flex items-center justify-center gap-1.5 mt-0.5">
                      <Clock className="w-4 h-4 text-slate-500" />
                      {formatDuration(readingDuration)}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-100 px-4 py-2 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      {t.reportingTime}
                    </span>
                    <span className="text-base font-black text-slate-900 flex items-center justify-center gap-1.5 mt-0.5">
                      <Clock className="w-4 h-4 text-slate-500" />
                      {formatDuration(reportingDuration)}
                    </span>
                  </div>

                  <div className="rounded-xl bg-amber-50 px-4 py-2 border border-amber-200 text-center">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block">
                      {lang === 'ar' ? 'انضباط اللاسلكي' : 'Radio Discipline'}
                    </span>
                    <span className="text-base font-black text-amber-950 flex items-center justify-center gap-1.5 mt-0.5">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <span>{lang === 'ar' ? 'أقل من 15 ث' : '< 15s Target'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* ========================================================== */}
              {/* RESULTS SECTION 1: INITIAL DISCOVERY (L-N-N-H)             */}
              {/* ========================================================== */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-extrabold uppercase tracking-wider text-slate-800 px-1 border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-900 text-white text-xs font-black">1</span>
                    <span>{t.part1InitialTitle}</span>
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-1 text-xs text-teal-700 hover:text-teal-900 cursor-pointer font-bold"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-teal-600" />
                        <span>{t.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t.copyFeedback}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {/* User Answer Column */}
                  <div className="rounded-3xl border-2 border-slate-200 bg-white p-5 space-y-3.5 shadow-xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                      {t.yourReport}
                    </span>

                    <div>
                      <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-md inline-block mb-1">
                        L - Location
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {userL || '—'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-md inline-block mb-1">
                        N - Nature
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {userN_Nature || '—'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-md inline-block mb-1">
                        N - Numbers
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {userN_Numbers || '—'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-md inline-block mb-1">
                        H - Hazards
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {userH || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Facilitator Extraction Key Column */}
                  <div className="rounded-3xl border-2 border-teal-200 bg-teal-50/70 p-5 space-y-3.5 shadow-xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block">
                      {t.standardKey}
                    </span>

                    <div>
                      <span className="text-[10px] font-black bg-teal-700 text-white px-2 py-0.5 rounded-md inline-block mb-1">
                        L - Location / الموقع
                      </span>
                      <div className="bg-white/80 p-2.5 rounded-xl border border-teal-200/80">
                        <p className="text-xs sm:text-sm text-teal-950 font-bold leading-relaxed">
                          {selectedScenario.extractionKey.l}
                        </p>
                        <p className="text-xs text-teal-800 font-arabic font-semibold mt-1" dir="rtl">
                          {selectedScenario.extractionKey.l_ar}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-black bg-teal-700 text-white px-2 py-0.5 rounded-md inline-block mb-1">
                        N - Nature / طبيعة الحادث
                      </span>
                      <div className="bg-white/80 p-2.5 rounded-xl border border-teal-200/80">
                        <p className="text-xs sm:text-sm text-teal-950 font-bold leading-relaxed">
                          {selectedScenario.extractionKey.n_nature}
                        </p>
                        <p className="text-xs text-teal-800 font-arabic font-semibold mt-1" dir="rtl">
                          {selectedScenario.extractionKey.n_nature_ar}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-black bg-teal-700 text-white px-2 py-0.5 rounded-md inline-block mb-1">
                        N - Numbers / الأعداد والإصابات
                      </span>
                      <div className="bg-white/80 p-2.5 rounded-xl border border-teal-200/80">
                        <p className="text-xs sm:text-sm text-teal-950 font-bold leading-relaxed">
                          {selectedScenario.extractionKey.n_numbers}
                        </p>
                        <p className="text-xs text-teal-800 font-arabic font-semibold mt-1" dir="rtl">
                          {selectedScenario.extractionKey.n_numbers_ar}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-black bg-teal-700 text-white px-2 py-0.5 rounded-md inline-block mb-1">
                        H - Hazards / المخاطر المحيطة
                      </span>
                      <div className="bg-white/80 p-2.5 rounded-xl border border-teal-200/80">
                        <p className="text-xs sm:text-sm text-teal-950 font-bold leading-relaxed">
                          {selectedScenario.extractionKey.h}
                        </p>
                        <p className="text-xs text-teal-800 font-arabic font-semibold mt-1" dir="rtl">
                          {selectedScenario.extractionKey.h_ar}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================== */}
              {/* RESULTS SECTION 2: OPERATIONAL ZONE CHECK-IN (Z-S-H)       */}
              {/* ========================================================== */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-sm font-extrabold uppercase tracking-wider text-amber-900 px-1 border-b border-amber-200 pb-2">
                  <span className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-800 text-white text-xs font-black">2</span>
                    <span>{t.part2ZshTitle}</span>
                  </span>
                  <span className="text-xs text-amber-800 font-bold">
                    {t.zshRadioDisciplineRule}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {/* User Answer Column */}
                  <div className="rounded-3xl border-2 border-amber-200 bg-white p-5 space-y-3.5 shadow-xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
                      {t.yourReport}
                    </span>

                    <div>
                      <span className="text-[10px] font-black bg-amber-800 text-white px-2 py-0.5 rounded-md inline-block mb-1">
                        Z - Zone
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                        {userZ_Zone || '—'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-black bg-amber-800 text-white px-2 py-0.5 rounded-md inline-block mb-1">
                        S - Status
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                        {userS_Status || '—'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-black bg-amber-800 text-white px-2 py-0.5 rounded-md inline-block mb-1">
                        H - Hazard
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                        {userH_Hazard || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Facilitator Extraction Key Column */}
                  <div className="rounded-3xl border-2 border-teal-200 bg-teal-50/70 p-5 space-y-3.5 shadow-xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block">
                      {t.standardKey}
                    </span>

                    <div>
                      <span className="text-[10px] font-black bg-teal-700 text-white px-2 py-0.5 rounded-md inline-block mb-1">
                        Z - Zone / القطاع الميداني
                      </span>
                      <div className="bg-white/80 p-2.5 rounded-xl border border-teal-200/80">
                        <p className="text-xs sm:text-sm text-teal-950 font-bold leading-relaxed">
                          {selectedScenario.zshExtractionKey.z_zone}
                        </p>
                        <p className="text-xs text-teal-800 font-arabic font-semibold mt-1" dir="rtl">
                          {selectedScenario.zshExtractionKey.z_zone_ar}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-black bg-teal-700 text-white px-2 py-0.5 rounded-md inline-block mb-1">
                        S - Status / الحالة التشغيلية
                      </span>
                      <div className="bg-white/80 p-2.5 rounded-xl border border-teal-200/80">
                        <p className="text-xs sm:text-sm text-teal-950 font-bold leading-relaxed">
                          {selectedScenario.zshExtractionKey.s_status}
                        </p>
                        <p className="text-xs text-teal-800 font-arabic font-semibold mt-1" dir="rtl">
                          {selectedScenario.zshExtractionKey.s_status_ar}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-black bg-teal-700 text-white px-2 py-0.5 rounded-md inline-block mb-1">
                        H - Hazard / الخطر المستجد
                      </span>
                      <div className="bg-white/80 p-2.5 rounded-xl border border-teal-200/80">
                        <p className="text-xs sm:text-sm text-teal-950 font-bold leading-relaxed">
                          {selectedScenario.zshExtractionKey.h_hazard}
                        </p>
                        <p className="text-xs text-teal-800 font-arabic font-semibold mt-1" dir="rtl">
                          {selectedScenario.zshExtractionKey.h_hazard_ar}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: PDF, WhatsApp, New Drill */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={exportPDF}
                  className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl bg-slate-900 py-4 text-sm sm:text-base font-bold text-white transition-all hover:bg-slate-800 hover:shadow-md active:scale-98 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.downloadPdf}</span>
                </button>

                <button
                  onClick={shareWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl bg-[#128C7E] py-4 text-sm sm:text-base font-bold text-white transition-all hover:bg-[#0c6b60] hover:shadow-md active:scale-98 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{t.shareWhatsApp}</span>
                </button>

                <button
                  onClick={resetApp}
                  className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl border-2 border-slate-200 bg-white py-4 text-sm sm:text-base font-bold text-slate-800 transition-all hover:border-slate-900 hover:shadow-md active:scale-98 cursor-pointer"
                >
                  <RefreshCcw className="w-4 h-4" />
                  <span>{t.newDrill}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Comprehensive L-N-N-H and Z-S-H Educational Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-widest block">
                  Topic 2.3 • Operational Protocol Reference
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {t.guideTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t.guideSubtitle}
                </p>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Operational Transition Explanation */}
            <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 space-y-2 text-xs text-amber-950">
              <span className="font-extrabold text-amber-900 uppercase tracking-wider block">
                {lang === 'ar' ? 'التحول العملياتي من L-N-N-H إلى Z-S-H' : 'The Operational Shift: Initial vs Recurring Radio Traffic'}
              </span>
              <p className="leading-relaxed">
                {lang === 'ar' 
                  ? 'بينما يُستخدم تقرير L-N-N-H حصرياً عند اكتشاف الحادث الأولي، تتطلب العمليات الجارية تنسيقاً سريعاً وموجزاً (Z-S-H). بمجرد انتشار أعضاء فريق الطوارئ عبر قطاعات مختلفة (لإجراء المسح، مراقبة حواجز الحريق، أو إدارة الإخلاء)، فإن شغل الشبكة اللاسلكية بسرد تفصيلي طويل يعطل سيطرة القيادة وتواصل الوحدات.'
                  : 'While the L-N-N-H report is deployed exclusively upon initial incident discovery, ongoing operations require a much leaner, high-velocity check-in format. Once multiple ERT members are deployed across different zones—conducting sweeps, monitoring fire barriers, or overseeing evacuations—clogging the radio network with detailed narratives disrupts command control. For recurring updates, the team shifts to Z-S-H (Zone, Status, Hazard).'
                }
              </p>
            </div>

            {/* Part 1: L-N-N-H Breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Part 1: Initial Discovery (L-N-N-H)
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-900 text-white text-xs font-black">L</span>
                    <strong className="text-xs text-slate-900">Location • أين المشكلة؟</strong>
                  </div>
                  <p className="text-[11px] text-slate-600">Building, floor, and room number where units must rush.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-900 text-white text-xs font-black">N</span>
                    <strong className="text-xs text-slate-900">Nature • ماذا حدث؟</strong>
                  </div>
                  <p className="text-[11px] text-slate-600">Fire, chemical smoke, water leak, or person collapsed.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-900 text-white text-xs font-black">N</span>
                    <strong className="text-xs text-slate-900">Numbers • كم عدد المصابين؟</strong>
                  </div>
                  <p className="text-[11px] text-slate-600">Headcount, conscious vs unconscious, and evacuation tally.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-900 text-white text-xs font-black">H</span>
                    <strong className="text-xs text-slate-900">Hazards • ما هي المخاطر؟</strong>
                  </div>
                  <p className="text-[11px] text-slate-600">Live wires, spreading flames, slippery floors, or smoke.</p>
                </div>
              </div>
            </div>

            {/* Part 2: Z-S-H Breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-amber-900 uppercase tracking-wider">
                Part 2: Operational Zone Check-In (Z-S-H)
              </h4>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-800 text-white text-xs font-black">Z</span>
                    <strong className="text-xs text-amber-950">Zone • القطاع</strong>
                  </div>
                  <p className="text-[11px] text-amber-900">Assigned tactical sector, hallway wing, stairwell, or barrier checkpoint.</p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-800 text-white text-xs font-black">S</span>
                    <strong className="text-xs text-amber-950">Status • الحالة</strong>
                  </div>
                  <p className="text-[11px] text-amber-900">Primary sweep complete, evacuation actively moving, or area clear.</p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-800 text-white text-xs font-black">H</span>
                    <strong className="text-xs text-amber-950">Hazard • الخطر</strong>
                  </div>
                  <p className="text-[11px] text-amber-900">Emerging hazards, secondary smoke ingress, live power, or 'All Clear'.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-6xl px-4 text-center space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {lang === 'ar' 
              ? 'تدريب جاهزية فريق الاستجابة للطوارئ • الموضوع 2.3 • نموذج L-N-N-H و Z-S-H'
              : 'Emergency Response Team Readiness Training • Topic 2.3 • Dual Protocol (L-N-N-H & Z-S-H)'
            }
          </p>
          <p className="text-[11px] text-slate-400">
            {lang === 'ar'
              ? 'مخصص لموظفي المكاتب الإدارية ومساعدي الإدارات • مطار الملك سلمان الدولي'
              : 'Designed for Administrative Staff, Non-Technical Personnel & Non-Native English Speakers • King Salman International Airport'
            }
          </p>
        </div>
      </footer>
    </div>
  );
}
