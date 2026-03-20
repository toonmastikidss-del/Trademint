import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Download, Smartphone, CheckCircle,
  AlertCircle, Share, Plus, Zap, Bell, Shield, Wifi, Home, Star
} from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────

const BENEFITS = [
  { icon: Zap,    title: 'Lightning Fast',        desc: 'Optimized performance with zero loading lag on every trade.' },
  { icon: Wifi,   title: 'Offline Access',         desc: 'Access key features and portfolio even without internet.' },
  { icon: Bell,   title: 'Instant Notifications',  desc: 'Real-time price alerts and trade updates delivered instantly.' },
  { icon: Home,   title: 'One-Tap Launch',          desc: 'Open TradeMint directly from your home screen anytime.' },
  { icon: Shield, title: 'Bank-Level Security',     desc: 'Biometric authentication with end-to-end data encryption.' },
];

const IOS_STEPS = [
  {
    icon: Share,
    title: 'Tap the Share Button',
    desc: 'Find the Share icon at the bottom of your Safari browser toolbar.',
  },
  {
    icon: Plus,
    title: 'Add to Home Screen',
    desc: 'Scroll down in the share sheet and tap "Add to Home Screen".',
  },
  {
    icon: CheckCircle,
    title: 'Confirm Installation',
    desc: 'Tap "Add" in the top-right corner. The app icon will appear on your home screen.',
  },
];

const ANDROID_STEPS = [
  {
    icon: Download,
    title: 'Open Browser Menu',
    desc: 'Tap the three-dot menu (⋮) in the top-right corner of Chrome.',
  },
  {
    icon: Plus,
    title: 'Select "Install App"',
    desc: 'Tap "Install app" or "Add to Home screen" from the menu options.',
  },
  {
    icon: CheckCircle,
    title: 'Confirm Installation',
    desc: 'Tap "Install" to confirm. The TradeMint icon will appear on your home screen.',
  },
];

// ─── Device Detection ─────────────────────────────────────────────────────────

const detectDevice = () => {
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  return 'desktop';
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const C = {
  bg:       '#080C14',
  surface:  '#0F1623',
  surfaceL: '#141D2E',
  border:   '#1C2740',
  borderL:  '#243352',
  accent:   '#3ECFCF',
  accentD:  '#259EA0',
  accentG:  'linear-gradient(135deg, #3ECFCF 0%, #259EA0 100%)',
  gold:     '#F5C842',
  text:     '#E8EFF8',
  textM:    '#8A9BBE',
  textD:    '#4A5878',
  success:  '#2ECC8A',
  warn:     '#F5A623',
  danger:   '#FF5C72',
};

const s = {
  // Layout
  root: {
    background: C.bg,
    minHeight: '100vh',
    color: C.text,
    fontFamily: "'Outfit', 'Nunito', 'Segoe UI', sans-serif",
    paddingBottom: 48,
    position: 'relative',
    overflowX: 'hidden',
  },

  // Decorative bg orb
  bgOrb: {
    position: 'fixed',
    top: -120,
    right: -120,
    width: 380,
    height: 380,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${C.accent}0a 0%, transparent 70%)`,
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgOrb2: {
    position: 'fixed',
    bottom: -80,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: '50%',
    background: `radial-gradient(circle, #3E7BCF0a 0%, transparent 70%)`,
    pointerEvents: 'none',
    zIndex: 0,
  },

  // Top bar
  topBar: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    background: `${C.bg}ee`,
    backdropFilter: 'blur(16px)',
    borderBottom: `1px solid ${C.border}`,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: C.surface,
    border: `1px solid ${C.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: C.text,
    letterSpacing: '0.01em',
  },

  // Content
  content: {
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    position: 'relative',
    zIndex: 1,
  },

  // Hero
  hero: {
    textAlign: 'center',
    paddingTop: 40,
    paddingBottom: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
  },
  logoRing: {
    position: 'relative',
    width: 108,
    height: 108,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRingBorder: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: `1.5px solid ${C.accent}44`,
    animation: 'spin 8s linear infinite',
  },
  logoRingDot: {
    position: 'absolute',
    top: 4,
    left: '50%',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: C.accent,
    transform: 'translateX(-50%)',
  },
  logoBox: {
    width: 88,
    height: 88,
    borderRadius: 26,
    background: `linear-gradient(145deg, #1A2744 0%, #0F1C38 100%)`,
    border: `1px solid ${C.borderL}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 0 0 1px ${C.border}, 0 20px 60px ${C.accent}22, 0 4px 16px rgba(0,0,0,0.5)`,
    position: 'relative',
    zIndex: 1,
  },
  logoInnerGlow: {
    position: 'absolute',
    inset: 0,
    borderRadius: 26,
    background: `radial-gradient(circle at 30% 30%, ${C.accent}18, transparent 60%)`,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: 800,
    letterSpacing: '-0.04em',
    margin: 0,
    background: `linear-gradient(135deg, ${C.text} 0%, ${C.accent} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    fontSize: 13,
    color: C.textM,
    margin: 0,
    lineHeight: 1.7,
    maxWidth: 270,
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  ratingStars: {
    display: 'flex',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: C.textM,
    fontWeight: 600,
  },
  pillRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pill: {
    fontSize: 10,
    fontWeight: 700,
    padding: '4px 12px',
    borderRadius: 20,
    background: C.surface,
    border: `1px solid ${C.border}`,
    color: C.textM,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  pillAccent: {
    color: C.accent,
    borderColor: `${C.accent}44`,
    background: `${C.accent}0f`,
  },
  pillGold: {
    color: C.gold,
    borderColor: `${C.gold}44`,
    background: `${C.gold}0f`,
  },

  // Installed Banner
  installedBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: `linear-gradient(135deg, ${C.success}10, ${C.surface})`,
    border: `1px solid ${C.success}33`,
    borderRadius: 18,
    padding: '16px 20px',
  },
  installedIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: `${C.success}18`,
    border: `1px solid ${C.success}33`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  installedTitle: { margin: 0, fontSize: 14, fontWeight: 700, color: C.text },
  installedSub: { margin: 0, fontSize: 12, color: C.textM, marginTop: 2 },

  // Card
  card: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 20,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
  },

  // Hint bar
  hintBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: `${C.accent}0c`,
    border: `1px solid ${C.accent}22`,
    borderRadius: 12,
    padding: '10px 14px',
  },
  hintDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: C.accent,
    flexShrink: 0,
    boxShadow: `0 0 6px ${C.accent}`,
  },
  hintText: {
    fontSize: 12,
    color: C.accent,
    fontWeight: 600,
  },

  // CTA Button
  ctaBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    background: C.accentG,
    border: 'none',
    borderRadius: 16,
    padding: '18px 24px',
    cursor: 'pointer',
    boxShadow: `0 8px 32px ${C.accent}33, 0 2px 8px rgba(0,0,0,0.3)`,
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  ctaBtnShine: {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '60%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
    animation: 'shine 2.5s ease-in-out infinite',
  },
  ctaBtnDone: {
    background: `linear-gradient(135deg, ${C.success} 0%, #1EA86C 100%)`,
    boxShadow: `0 8px 32px ${C.success}33`,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '0.02em',
    position: 'relative',
    zIndex: 1,
  },

  // Meta row
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    color: C.textD,
    fontWeight: 600,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: '50%',
    background: C.border,
  },

  // Section label
  sectionLabel: {
    margin: 0,
    fontSize: 10,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: C.textD,
  },

  // Guide header
  guideHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    paddingBottom: 4,
    borderBottom: `1px solid ${C.border}`,
  },
  guideIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: `${C.accent}12`,
    border: `1px solid ${C.accent}28`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: 22,
  },
  guideTitle: { margin: 0, fontSize: 16, fontWeight: 800, color: C.text },
  guideSub: { margin: '3px 0 0', fontSize: 12, color: C.textM },
  closeBtn: {
    marginLeft: 'auto',
    background: C.surfaceL,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: C.textM,
    fontSize: 14,
    flexShrink: 0,
  },

  // Steps
  stepsWrap: { display: 'flex', flexDirection: 'column', gap: 10 },
  step: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    background: C.surfaceL,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: '14px 16px',
  },
  stepLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 8,
    background: C.accentG,
    color: '#fff',
    fontSize: 11,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    background: `${C.accent}12`,
    border: `1px solid ${C.accent}25`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: { margin: 0, fontSize: 13, fontWeight: 700, color: C.text },
  stepDesc: { margin: '3px 0 0', fontSize: 12, color: C.textM, lineHeight: 1.5 },

  // Warning tip
  tip: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    background: `${C.warn}0c`,
    border: `1px solid ${C.warn}28`,
    borderRadius: 12,
    padding: '12px 14px',
  },
  tipText: { fontSize: 12, color: C.warn, lineHeight: 1.6 },

  // Benefits
  benefitRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    padding: '14px 0',
  },
  benefitIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    background: `${C.accent}10`,
    border: `1px solid ${C.accent}25`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  benefitTitle: { margin: 0, fontSize: 14, fontWeight: 700, color: C.text },
  benefitDesc: { margin: '3px 0 0', fontSize: 12, color: C.textM, lineHeight: 1.5 },

  // PWA info card
  pwaCard: {
    background: `linear-gradient(135deg, ${C.accent}0a 0%, ${C.surface} 60%)`,
    border: `1px solid ${C.accent}28`,
    borderRadius: 20,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
  },
  pwaTitle: { margin: 0, fontSize: 16, fontWeight: 800, color: C.text },
  pwaSub: { margin: '2px 0 0', fontSize: 12, color: C.textM },
  pwaBody: { margin: 0, fontSize: 13, color: C.textM, lineHeight: 1.75 },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  tag: {
    fontSize: 10,
    fontWeight: 700,
    padding: '5px 12px',
    borderRadius: 20,
    background: `${C.accent}12`,
    border: `1px solid ${C.accent}28`,
    color: C.accent,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },

  // Support row
  supportCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: '14px 18px',
  },
  supportLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  supportIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: `${C.textD}18`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  supportTitle: { margin: 0, fontSize: 13, fontWeight: 700, color: C.text },
  supportSub: { margin: '2px 0 0', fontSize: 11, color: C.textM },
  supportBtn: {
    background: 'none',
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: '7px 14px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
    color: C.accent,
  },

  // Footer
  footer: {
    background: `linear-gradient(135deg, #071D14 0%, ${C.bg} 100%)`,
    border: `1px solid ${C.success}28`,
    borderRadius: 22,
    padding: '28px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  footerNum: {
    margin: 0,
    fontSize: 40,
    fontWeight: 900,
    color: C.success,
    letterSpacing: '-0.05em',
    lineHeight: 1,
  },
  footerLabel: { margin: 0, fontSize: 14, color: C.text, fontWeight: 700 },
  footerSub: { margin: 0, fontSize: 11, color: C.textM, letterSpacing: '0.04em' },
  footerBadge: {
    marginTop: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 14px',
    borderRadius: 20,
    background: `${C.success}10`,
    border: `1px solid ${C.success}28`,
  },
  footerDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: C.success,
    boxShadow: `0 0 6px ${C.success}`,
  },
  footerBadgeText: { fontSize: 10, fontWeight: 800, color: C.success, textTransform: 'uppercase', letterSpacing: '0.1em' },
};

// ─── Component ────────────────────────────────────────────────────────────────

const AppDownload = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled]       = useState(false);
  const [showGuide, setShowGuide]           = useState(false);
  const [installed, setInstalled]           = useState(false);
  const device = detectDevice();

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (device === 'ios') { setShowGuide(true); return; }
    if (!deferredPrompt)  { setShowGuide(true); return; }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') { setInstalled(true); setIsInstalled(true); }
  };

  const ctaLabel = () => {
    if (installed)        return 'Installed Successfully';
    if (device === 'ios') return 'Add to Home Screen';
    if (deferredPrompt)   return 'Install App — It\'s Free';
    return 'Add to Home Screen';
  };

  const guideSteps  = device === 'ios' ? IOS_STEPS : ANDROID_STEPS;
  const guideDevice = device === 'ios' ? 'iPhone / iPad (Safari)' : 'Android (Chrome)';
  const guideEmoji  = device === 'ios' ? '🍎' : '🤖';

  return (
    <div style={s.root}>
      {/* Keyframes */}
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes shine { 0%{left:-100%} 60%,100%{left:150%} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      {/* Decorative orbs */}
      <div style={s.bgOrb} />
      <div style={s.bgOrb2} />

      {/* ── Top Bar ────────────────────────────────────────────────── */}
      <div style={s.topBar}>
        <button onClick={() => navigate('/')} style={s.backBtn}>
          <ChevronLeft size={20} color={C.textM} />
        </button>
        <span style={s.topBarTitle}>Download App</span>
        <div style={{ width: 38 }} />
      </div>

      <div style={s.content}>

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <div style={s.hero}>
          <div style={s.logoRing}>
            <div style={s.logoRingBorder}>
              <div style={s.logoRingDot} />
            </div>
            <div style={s.logoBox}>
              <div style={s.logoInnerGlow} />
              <Smartphone size={44} color={C.accent} strokeWidth={1.5} />
            </div>
          </div>

          <div>
            <h1 style={s.heroTitle}>TradeMint</h1>
          </div>

          <p style={s.heroSub}>
            Experience seamless trading with our mobile app. Fast, secure, and always at your fingertips.
          </p>

          <div style={s.ratingRow}>
            <div style={s.ratingStars}>
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={13} color={C.gold} fill={C.gold} />
              ))}
            </div>
            <span style={s.ratingText}>4.9 · 50K+ Users</span>
          </div>

          <div style={s.pillRow}>
            <span style={s.pill}>v1.0.0</span>
            <span style={{ ...s.pill, ...s.pillAccent }}>PWA</span>
            <span style={{ ...s.pill, ...s.pillGold }}>Free Forever</span>
          </div>
        </div>

        {/* ── Already Installed ──────────────────────────────────────── */}
        {isInstalled && (
          <div style={s.installedBanner}>
            <div style={s.installedIconWrap}>
              <CheckCircle size={22} color={C.success} />
            </div>
            <div>
              <p style={s.installedTitle}>App Already Installed</p>
              <p style={s.installedSub}>You're all set — enjoy trading on the go 🚀</p>
            </div>
          </div>
        )}

        {/* ── Install Card ───────────────────────────────────────────── */}
        {!isInstalled && (
          <div style={s.card}>
            {/* Status hint */}
            <div style={s.hintBar}>
              <div style={s.hintDot} />
              <span style={s.hintText}>
                {device === 'ios'
                  ? 'Open this page in Safari to install'
                  : deferredPrompt
                    ? 'Ready to install — tap the button below'
                    : 'Use Chrome browser for the best install experience'}
              </span>
            </div>

            {/* Main CTA */}
            <button
              onClick={handleInstall}
              style={installed ? { ...s.ctaBtn, ...s.ctaBtnDone } : s.ctaBtn}
            >
              {!installed && <div style={s.ctaBtnShine} />}
              {installed
                ? <CheckCircle size={20} color="#fff" />
                : <Download size={20} color="#fff" />}
              <span style={s.ctaText}>{ctaLabel()}</span>
            </button>

            {/* Meta */}
            <div style={s.metaRow}>
              <span style={s.metaItem}><Shield size={11} color={C.textD} /> Secure & Private</span>
              <span style={s.metaDivider} />
              <span style={s.metaItem}>No App Store Required</span>
              <span style={s.metaDivider} />
              <span style={s.metaItem}>Always Free</span>
            </div>
          </div>
        )}

        {/* ── Install Guide ──────────────────────────────────────────── */}
        {showGuide && (
          <div style={s.card}>
            {/* Header */}
            <div style={s.guideHeader}>
              <div style={s.guideIconWrap}>{guideEmoji}</div>
              <div style={{ flex: 1 }}>
                <p style={s.guideTitle}>How to Install</p>
                <p style={s.guideSub}>{guideDevice}</p>
              </div>
              <button onClick={() => setShowGuide(false)} style={s.closeBtn}>✕</button>
            </div>

            {/* Steps */}
            <div style={s.stepsWrap}>
              {guideSteps.map(({ icon: Icon, title, desc }, i) => (
                <div key={i} style={s.step}>
                  <div style={s.stepLeft}>
                    <div style={s.stepNum}>{i + 1}</div>
                    <div style={s.stepIconCircle}>
                      <Icon size={15} color={C.accent} />
                    </div>
                  </div>
                  <div>
                    <p style={s.stepTitle}>{title}</p>
                    <p style={s.stepDesc}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* iOS Safari warning */}
            {device === 'ios' && (
              <div style={s.tip}>
                <AlertCircle size={14} color={C.warn} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={s.tipText}>
                  <strong>Important:</strong> This only works in Safari. If you're using Chrome or Firefox on iPhone, please switch to Safari first.
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Benefits ───────────────────────────────────────────────── */}
        <div style={s.card}>
          <p style={s.sectionLabel}>Why Install the App?</p>
          {BENEFITS.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={i}
              style={{
                ...s.benefitRow,
                borderBottom: i < BENEFITS.length - 1 ? `1px solid ${C.border}` : 'none',
              }}
            >
              <div style={s.benefitIconWrap}>
                <Icon size={19} color={C.accent} strokeWidth={1.8} />
              </div>
              <div>
                <p style={s.benefitTitle}>{title}</p>
                <p style={s.benefitDesc}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── PWA Info ───────────────────────────────────────────────── */}
        <div style={s.pwaCard}>
          <div>
            <p style={s.pwaTitle}>What is a PWA?</p>
            <p style={s.pwaSub}>Progressive Web App Technology</p>
          </div>
          <p style={s.pwaBody}>
            TradeMint uses Progressive Web App (PWA) technology, giving you a full native-app experience
            without ever visiting an app store. Install once and get automatic updates, offline access,
            and a home screen icon — all with zero storage bloat.
          </p>
          <div style={s.tagRow}>
            {['No APK File', 'Auto Updates', 'Works Offline', 'Lightweight', 'Cross-Platform'].map(t => (
              <span key={t} style={s.tag}>{t}</span>
            ))}
          </div>
        </div>

        {/* ── Support ────────────────────────────────────────────────── */}
        <div style={s.supportCard}>
          <div style={s.supportLeft}>
            <div style={s.supportIconWrap}>
              <AlertCircle size={16} color={C.textD} />
            </div>
            <div>
              <p style={s.supportTitle}>Need Help?</p>
              <p style={s.supportSub}>Our team is available 24/7</p>
            </div>
          </div>
          <button onClick={() => navigate('/support')} style={s.supportBtn}>
            Contact →
          </button>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div style={s.footer}>
          <p style={s.footerNum}>50,000+</p>
          <p style={s.footerLabel}>Happy Traders Worldwide</p>
          <p style={s.footerSub}>Trusted by investors across 30+ countries</p>
          <div style={s.footerBadge}>
            <div style={s.footerDot} />
            <span style={s.footerBadgeText}>Verified & Trusted Platform</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AppDownload;