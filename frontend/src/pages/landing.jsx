import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthUser } from "../firebase/useAuthUser";
import { signInWithGoogle, signInWithMicrosoft } from "../firebase/firebase.jsx";

const ACCENT = "#FFC94D";
const ACCENT_SOFT = "#5EEAD4";
const BG = "#0B0E14";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.6, ease: [0.215, 0.61, 0.355, 1] },
  }),
};

function ChunkStrip() {
  const chunks = [true, true, true, true, false, false, false, false];
  return (
    <div style={{ display: "flex", gap: 4, marginTop: 22, maxWidth: 420 }}>
      {chunks.map((done, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scaleY: 0.3 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: 0.9 + i * 0.08, duration: 0.4 }}
          style={{
            flex: 1,
            height: 30,
            borderRadius: 6,
            background: done ? ACCENT : "rgba(255,255,255,0.08)",
            border: done ? "none" : "1px dashed rgba(255,255,255,0.2)",
          }}
        />
      ))}
    </div>
  );
}

const FEATURES = [
  {
    title: "Live transcription",
    desc: "Captures lecture or meeting audio in real time, whether it's a professor in a room or a Zoom call.",
    icon: "🎙",
  },
  {
    title: "5-minute summaries",
    desc: "Every 5 minutes, a structured summary is generated — key points, important dates, no fluff.",
    icon: "⏱",
  },
  {
    title: "Organized by course",
    desc: "Every lecture is filed under the right class, with the professor, date, and time attached.",
    icon: "🗂",
  },
  {
    title: "One final summary",
    desc: "When class ends, everything is stitched into a single, coherent lecture summary you can actually study from.",
    icon: "📝",
  },
  {
    title: "Chat with your notes",
    desc: "Ask questions about any past lecture and get answers grounded in what was actually said.",
    icon: "💬",
  },
  {
    title: "Built for real classes",
    desc: "Handles pauses, tangents, and messy speech — not a scripted demo, an actual lecture hall.",
    icon: "🎓",
  },
];

const STEPS = [
  { n: "01", title: "Start a session", desc: "Name the course and hit start before class begins." },
  { n: "02", title: "Let it listen", desc: "NoteTaker transcribes and summarizes in the background while you focus." },
  { n: "03", title: "Review & chat", desc: "Come back anytime to read, search, or ask questions about the lecture." },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuthUser();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const saved_user = localStorage.getItem("user");
    if (!loading && (user || saved_user)) {
      navigate("/UserInfo", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleGoogle = async () => {
    try {
      localStorage.removeItem("user");
      await signInWithGoogle();
      navigate("/UserInfo");
    } catch (err) {
      alert(err?.message || "Google login failed");
    }
  };

  const handleMicrosoft = async () => {
    try {
      localStorage.removeItem("user");
      await signInWithMicrosoft();
      navigate("/UserInfo");
    } catch (err) {
      alert(err?.message || "Microsoft login failed");
    }
  };

  const handleEmailSignup = () => {
    if (!email || !password || !firstName) {
      alert("Please fill everything in.");
      return;
    }
    localStorage.setItem("user", JSON.stringify({ firstName, email, password, is_manual: true }));
    navigate("/UserInfo");
  };

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: BG, position: "relative", overflowX: "hidden", color: "#F5F1E8" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes float1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-20px); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-25px,25px); } }
        .nt-blob1 { animation: float1 9s ease-in-out infinite; }
        .nt-blob2 { animation: float2 11s ease-in-out infinite; }
        .nt-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; cursor: pointer; }
        .nt-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
        .nt-btn:active { transform: translateY(0); }
        .nt-input { transition: border-color 0.15s ease, background 0.15s ease; }
        .nt-input:focus { outline: none; border-color: ${ACCENT} !important; background: rgba(255,255,255,0.08) !important; }
        .nt-card { transition: transform 0.2s ease, border-color 0.2s ease; }
        .nt-card:hover { transform: translateY(-4px); border-color: rgba(255,201,77,0.35) !important; }
        .nt-section { width: 100%; }
        .nt-inner { max-width: 1160px; margin: 0 auto; padding: 0 32px; }
        @media (max-width: 900px) {
          .nt-hero-grid { grid-template-columns: 1fr !important; }
          .nt-features-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .nt-features-grid { grid-template-columns: 1fr !important; }
          .nt-steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="nt-blob1" style={{ position: "absolute", top: "-10%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${ACCENT}22, transparent 70%)`, filter: "blur(50px)", pointerEvents: "none" }} />
      <div className="nt-blob2" style={{ position: "absolute", top: "20%", right: "-8%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${ACCENT_SOFT}18, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none" }} />

      {/* NAVBAR */}
      <div className="nt-section" style={{ position: "relative", zIndex: 2 }}>
        <div className="nt-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "grid", placeItems: "center", fontWeight: 900, color: ACCENT }}>
              NT
            </div>
            <span style={{ fontWeight: 800, fontSize: 15 }}>NoteTaker</span>
          </div>
          <button
            className="nt-btn"
            onClick={() => setShowEmailForm(true)}
            style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "white", fontWeight: 700, fontSize: 13 }}
          >
            Sign in
          </button>
        </div>
      </div>

      {/* HERO */}
      <div className="nt-section" style={{ position: "relative", zIndex: 1 }}>
        <div className="nt-inner nt-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 48, alignItems: "center", padding: "40px 32px 90px" }}>
          <motion.div initial="hidden" animate="show">
            <motion.div variants={fadeUp} custom={0} style={{ display: "inline-block", padding: "6px 14px", borderRadius: 999, border: `1px solid ${ACCENT}55`, background: `${ACCENT}15`, color: ACCENT, fontSize: 12, fontWeight: 700, marginBottom: 20 }}>
              Built for lecture halls & Zoom calls
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              style={{ fontSize: "clamp(34px, 5vw, 54px)", lineHeight: 1.1, margin: 0, fontFamily: "Georgia, serif", fontWeight: 400 }}
            >
              Notes that write
              <span style={{ display: "block", color: ACCENT }}>themselves in class</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              style={{ marginTop: 18, color: "rgba(245,241,232,0.65)", fontSize: 17, lineHeight: 1.65, maxWidth: 480 }}
            >
              NoteTaker listens during your lecture, transcribes and summarizes it every
              five minutes, and hands you clean, organized notes the moment class ends.
              No more scrambling to catch up.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <button
                className="nt-btn"
                onClick={() => setShowEmailForm(true)}
                style={{ padding: "14px 26px", borderRadius: 12, border: "none", background: ACCENT, color: "#0B0E14", fontWeight: 800, fontSize: 15 }}
              >
                Get started free
              </button>
              <button
                className="nt-btn"
                onClick={handleGoogle}
                style={{ padding: "14px 26px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "white", fontWeight: 700, fontSize: 15 }}
              >
                Continue with Google
              </button>
            </motion.div>

            <motion.div variants={fadeUp} custom={4}>
              <ChunkStrip />
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "rgba(245,241,232,0.4)", marginTop: 8 }}>
                20:00–25:00 · <span style={{ color: ACCENT }}>transcribing…</span>
              </div>
            </motion.div>
          </motion.div>

          {/* SIGNUP CARD */}
          <motion.div
            id="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{ padding: 28, borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Get started</div>
            <div style={{ color: "rgba(245,241,232,0.5)", fontSize: 13, marginBottom: 22 }}>
              Free to try — no credit card needed.
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <button
                className="nt-btn"
                onClick={handleGoogle}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "13px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "white", fontWeight: 700, fontSize: 14 }}
              >
                <span style={{ fontWeight: 900 }}>G</span> Continue with Google
              </button>
              <button
                className="nt-btn"
                onClick={handleMicrosoft}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "13px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "white", fontWeight: 700, fontSize: 14 }}
              >
                <span style={{ fontWeight: 900 }}>M</span> Continue with Microsoft
              </button>
              <button
                className="nt-btn"
                onClick={() => setShowEmailForm((v) => !v)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "13px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "white", fontWeight: 700, fontSize: 14 }}
              >
                ✉ Continue with email
              </button>

              {showEmailForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  style={{ display: "grid", gap: 10, marginTop: 4, overflow: "hidden" }}
                >
                  <input className="nt-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name"
                    style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "white" }} />
                  <input className="nt-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" type="email"
                    style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "white" }} />
                  <input className="nt-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password"
                    style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "white" }} />
                  <button className="nt-btn" onClick={handleEmailSignup}
                    style={{ padding: 13, borderRadius: 10, border: "none", background: ACCENT, color: "#0B0E14", fontWeight: 800, fontSize: 14 }}>
                    Create account
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="nt-section" style={{ position: "relative", zIndex: 1, background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="nt-inner" style={{ padding: "80px 32px" }}>
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT_SOFT, letterSpacing: 1, marginBottom: 8 }}>WHAT IT DOES</div>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 36px)", fontFamily: "Georgia, serif", fontWeight: 400, margin: 0 }}>
              Everything happens while you're just paying attention
            </h2>
          </motion.div>

          <div className="nt-features-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                className="nt-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                style={{ padding: 24, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div style={{ fontSize: 26, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
                <div style={{ color: "rgba(245,241,232,0.6)", fontSize: 14, lineHeight: 1.6 }}>{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="nt-section" style={{ position: "relative", zIndex: 1 }}>
        <div className="nt-inner" style={{ padding: "80px 32px" }}>
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT_SOFT, letterSpacing: 1, marginBottom: 8 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 36px)", fontFamily: "Georgia, serif", fontWeight: 400, margin: 0 }}>
              Three steps, zero effort during class
            </h2>
          </motion.div>

          <div className="nt-steps-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: 13, color: ACCENT, fontWeight: 700, marginBottom: 10 }}>{s.n}</div>
                <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 8 }}>{s.title}</div>
                <div style={{ color: "rgba(245,241,232,0.6)", fontSize: 14, lineHeight: 1.6 }}>{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="nt-section" style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="nt-inner" style={{ padding: "32px", textAlign: "center", color: "rgba(245,241,232,0.4)", fontSize: 13 }}>
          Built for lecture halls, seminar rooms, and Zoom calls • 2026
        </div>
      </div>
    </div>
  );
}