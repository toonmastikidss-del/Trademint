import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Download, Smartphone, CheckCircle,
  AlertCircle, Share, Plus, Zap, Bell, Shield, Wifi, Home
} from 'lucide-react';

const BENEFITS = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Optimised for mobile — zero lag trading' },
  { icon: Wifi, title: 'Offline Access', desc: 'Key features work without internet' },
  { icon: Bell, title: 'Instant Notifications', desc: 'Price alerts delivered in real-time' },
  { icon: Home, title: 'One-Tap Access', desc: 'Launch directly from your home screen' },
  { icon: Shield, title: 'Bank-Level Security', desc: 'Biometric auth & end-to-end encryption' },
];

const IOS_STEPS = [
  { icon: Share, label: 'Safari mein Share button tap karo (bottom toolbar)' },
  { icon: Plus, label: '"Add to Home Screen" select karo' },
  { icon: CheckCircle, label: 'Top-right mein "Add" tap karo — done!' },
];

const detectDevice = () => {
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  return 'desktop';
};

/* ═══════════════════════════════════════════════════════════════════════ */
const AppDownload = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installed, setInstalled] = useState(false);
  const device = detectDevice();

  useEffect(() => {
    // Already running as installed PWA?
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Chrome / Edge / Android Chrome fires this event when app is installable
    const handler = (e) => {
      e.preventDefault();     // stop Chrome's mini bar
      setDeferredPrompt(e);   // save it so we can fire it on button click
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  /* ── Main install handler ─────────────────────────────────────────── */
  const handleInstall = async () => {
    if (device === 'ios') {
      // iOS Safari doesn't support beforeinstallprompt — show manual guide
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // Chrome prompt not available yet (maybe already installed or HTTPS missing)
      setShowIOSGuide(true);
      return;
    }

    // 🔥 This triggers the native Chrome "Install App" dialog
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    if (outcome === 'accepted') {
      setInstalled(true);
      setIsInstalled(true);
    }
  };

  /* ── CTA label ────────────────────────────────────────────────────── */
  const ctaLabel = () => {
    if (installed) return 'Installed Successfully ✓';
    if (device === 'ios') return 'Add to Home Screen';
    if (deferredPrompt) return 'Install App';
    return 'Add to Home Screen';
  };

  /* ═══════════════════════════ RENDER ════════════════════════════════ */
  return (
    <div style={s.root}>

      {/* Top Bar */}
      <div style={s.topBar}>
        <button onClick={() => navigate('/')} style={s.iconBtn}>
          <ChevronLeft size={22} color="#cbd5e1" />
        </button>
        <span style={s.topBarTitle}>Download App</span>
        <div style={{ width: 36 }} />
      </div>

      <div style={s.content}>

        {/* Hero */}
        <div style={s.hero}>
          <div style={s.logoWrap}>
            <div style={s.logoPulse} />
            <div style={s.logoBox}>
              <Smartphone size={52} color="#fff" />
            </div>
          </div>
          <h1 style={s.heroTitle}>TradeMint</h1>
          <p style={s.heroSub}>Trade smarter, faster &amp; safer — right from your phone.</p>
          <div style={s.pillRow}>
            <span style={s.pill}>v1.0.0</span>
            <span style={s.pill}>PWA</span>
            <span style={{ ...s.pill, ...s.pillGreen }}>Free</span>
          </div>
        </div>

        {/* Already Installed Banner */}
        {isInstalled && (
          <div style={s.installedBanner}>
            <CheckCircle size={22} color="#34d399" />
            <div>
              <p style={s.installedTitle}>App is Installed!</p>
              <p style={s.installedSub}>You're all set — happy trading 🚀</p>
            </div>
          </div>
        )}

        {/* Install Card */}
        {!isInstalled && (
          <div style={s.card}>
            <div style={s.installHint}>
              <Smartphone size={14} color="#49bace" />
              <span style={s.installHintText}>
                {device === 'ios'
                  ? 'Open in Safari to install'
                  : deferredPrompt
                    ? 'Chrome install prompt ready!'
                    : 'Use Chrome browser for best experience'}
              </span>
            </div>

            {/* 🔥 THE MAIN BUTTON — triggers Chrome's native install dialog */}
            <button
              onClick={handleInstall}
              style={installed ? { ...s.ctaBtn, ...s.ctaBtnDone } : s.ctaBtn}
            >
              {installed
                ? <CheckCircle size={22} color="#fff" />
                : <Download size={22} color="#fff" />}
              <span style={s.ctaText}>{ctaLabel()}</span>
            </button>

            <div style={s.metaRow}>
              <span style={s.metaItem}><Shield size={11} /> Secure</span>
              <span style={s.metaDot} />
              <span style={s.metaItem}>No APK needed</span>
              <span style={s.metaDot} />
              <span style={s.metaItem}>Always free</span>
            </div>
          </div>
        )}

        {/* iOS / Manual Guide */}
        {showIOSGuide && (
          <div style={s.card}>
            <div style={s.guideHeader}>
              <span style={{ fontSize: 26 }}>{device === 'ios' ? '🍎' : '📲'}</span>
              <div>
                <p style={s.guideTitle}>Manual Install Guide</p>
                <p style={s.guideSub}>{device === 'ios' ? 'iPhone / iPad — Safari' : 'Follow browser steps'}</p>
              </div>
              <button onClick={() => setShowIOSGuide(false)} style={s.closeBtn}>✕</button>
            </div>

            <div style={s.stepsWrap}>
              {IOS_STEPS.map(({ icon: Icon, label }, i) => (
                <div key={i} style={s.step}>
                  <div style={s.stepNum}>{i + 1}</div>
                  <div style={s.stepIcon}><Icon size={16} color="#49bace" /></div>
                  <p style={s.stepText}>{label}</p>
                </div>
              ))}
            </div>

            {device === 'ios' && (
              <div style={s.tip}>
                <AlertCircle size={13} color="#f59e0b" />
                <span style={s.tipText}>Safari browser zaroori hai — Chrome/Firefox mein ye option nahi aata iOS par.</span>
              </div>
            )}
          </div>
        )}

        {/* Benefits */}
        <div style={s.card}>
          <p style={s.sectionLabel}>Why install?</p>
          {BENEFITS.map(({ icon: Icon, title, desc }, i) => (
            <div key={i} style={{
              ...s.benefitRow,
              borderBottom: i < BENEFITS.length - 1 ? `1px solid #21262d` : 'none'
            }}>
              <div style={s.benefitIcon}><Icon size={18} color="#49bace" /></div>
              <div>
                <p style={s.benefitTitle}>{title}</p>
                <p style={s.benefitDesc}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* PWA Info */}
        <div style={{ ...s.card, ...s.cardAccent }}>
          <p style={s.pwaTitle}>What is PWA?</p>
          <p style={s.pwaBody}>
            Koi APK download nahi, koi App Store nahi — bas browser mein install karo aur
            native app jaisi feel milegi. Automatic updates, offline support, aur home screen shortcut.
          </p>
          <div style={s.tagRow}>
            {['No APK', 'Auto updates', 'Works offline', 'Lightweight'].map(t => (
              <span key={t} style={s.tag}>{t}</span>
            ))}
          </div>
        </div>

        {/* Support */}
        <div style={s.supportRow}>
          <AlertCircle size={13} color="#64748b" />
          <span style={s.supportText}>Koi problem?&nbsp;</span>
          <button onClick={() => navigate('/support')} style={s.supportLink}>Contact Support →</button>
        </div>

        {/* Footer */}
        <div style={s.footer}>
          <p style={s.footerNum}>50,000+</p>
          <p style={s.footerLabel}>Happy traders worldwide</p>
          <span style={s.footerBadge}>
            <span style={s.footerDot} /> Trusted Platform
          </span>
        </div>

      </div>
    </div>
  );
};

/* ═══════════════════════════════ STYLES ═══════════════════════════════ */
const C = {
  bg: '#0d1117', surface: '#161b22', border: '#21262d',
  accent: '#49bace', accentD: '#2d9bb0',
  text: '#e6edf3', muted: '#7d8590',
  success: '#34d399',
};

const s = {
  root: { background: C.bg, minHeight: '100vh', color: C.text, fontFamily: "'DM Sans','Segoe UI',sans-serif", paddingBottom: 40 },
  topBar: { position: 'sticky', top: 0, zIndex: 50, background: C.surface, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' },
  topBarTitle: { fontSize: 16, fontWeight: 700, color: C.text },
  content: { padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 },

  hero: { textAlign: 'center', paddingTop: 36, paddingBottom: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  logoWrap: { position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoPulse: { position: 'absolute', inset: -10, borderRadius: '50%', background: `${C.accent}1a` },
  logoBox: { width: 100, height: 100, borderRadius: 28, background: `linear-gradient(135deg,${C.accent},${C.accentD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 3px ${C.border}, 0 16px 40px ${C.accent}44` },
  heroTitle: { fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', margin: 0, background: `linear-gradient(135deg,#fff 30%,${C.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSub: { fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.6, maxWidth: 260 },
  pillRow: { display: 'flex', gap: 8 },
  pill: { fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: C.surface, border: `1px solid ${C.border}`, color: C.muted },
  pillGreen: { color: C.success, borderColor: `${C.success}44`, background: `${C.success}11` },

  installedBanner: { display: 'flex', alignItems: 'center', gap: 12, background: '#0d2b20', border: `1px solid ${C.success}44`, borderRadius: 16, padding: '14px 18px' },
  installedTitle: { margin: 0, fontSize: 14, fontWeight: 700, color: C.text },
  installedSub: { margin: 0, fontSize: 12, color: C.muted },

  card: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 14 },
  cardAccent: { background: `linear-gradient(135deg,${C.accent}0d,${C.surface})`, borderColor: `${C.accent}33` },

  installHint: { display: 'flex', alignItems: 'center', gap: 6, background: `${C.accent}0f`, border: `1px solid ${C.accent}2a`, borderRadius: 10, padding: '9px 12px' },
  installHintText: { fontSize: 12, color: C.accent, fontWeight: 600 },

  ctaBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: `linear-gradient(135deg,${C.accent},${C.accentD})`, border: 'none', borderRadius: 14, padding: '17px 24px', cursor: 'pointer', boxShadow: `0 8px 24px ${C.accent}44` },
  ctaBtnDone: { background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 8px 24px #05966944' },
  ctaText: { fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '0.01em' },

  metaRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.muted },
  metaDot: { width: 3, height: 3, borderRadius: '50%', background: C.border },

  guideHeader: { display: 'flex', alignItems: 'center', gap: 12 },
  guideTitle: { margin: 0, fontSize: 15, fontWeight: 700, color: C.text },
  guideSub: { margin: 0, fontSize: 11, color: C.muted },
  closeBtn: { marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 16 },
  stepsWrap: { display: 'flex', flexDirection: 'column', gap: 10 },
  step: { display: 'flex', alignItems: 'center', gap: 12, background: `${C.bg}99`, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px' },
  stepNum: { width: 22, height: 22, borderRadius: '50%', background: C.accent, color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepIcon: { width: 34, height: 34, borderRadius: 10, background: `${C.accent}18`, border: `1px solid ${C.accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepText: { margin: 0, fontSize: 13, color: C.text, lineHeight: 1.5 },
  tip: { display: 'flex', alignItems: 'flex-start', gap: 8, background: '#1c1400', border: '1px solid #f59e0b33', borderRadius: 10, padding: '10px 12px' },
  tipText: { fontSize: 12, color: '#fbbf24', lineHeight: 1.5 },

  sectionLabel: { margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted },
  benefitRow: { display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 0' },
  benefitIcon: { width: 38, height: 38, borderRadius: 10, background: `${C.accent}15`, border: `1px solid ${C.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  benefitTitle: { margin: 0, fontSize: 14, fontWeight: 700, color: C.text },
  benefitDesc: { margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.5 },

  pwaTitle: { margin: 0, fontSize: 15, fontWeight: 800, color: C.text },
  pwaBody: { margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.7 },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  tag: { fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: `${C.accent}18`, border: `1px solid ${C.accent}33`, color: C.accent },

  supportRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  supportText: { fontSize: 12, color: C.muted },
  supportLink: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: C.accent },

  footer: { background: 'linear-gradient(135deg,#0d2b20,#0d1117)', border: `1px solid ${C.success}33`, borderRadius: 24, padding: '28px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  footerNum: { margin: 0, fontSize: 36, fontWeight: 900, color: C.success, letterSpacing: '-0.04em', lineHeight: 1 },
  footerLabel: { margin: 0, fontSize: 13, color: C.text, fontWeight: 600 },
  footerBadge: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em' },
  footerDot: { display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: C.success },
};

export default AppDownload;