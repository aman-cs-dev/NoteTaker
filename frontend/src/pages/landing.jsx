import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthUser } from "../firebase/useAuthUser"; // adjust path to where your hook is

import { motion } from "framer-motion";

import Navbar from "./components/Landing_Navbar.jsx";
import PrimaryButton from "./components/PrimaryButton";

import { signInWithGoogle, signInWithMicrosoft } from "../firebase/firebase.jsx";

const ACCENT = "#FFC94D";      // highlighter amber
const ACCENT_SOFT = "#5EEAD4"; // muted teal, used sparingly

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.6, ease: [0.215, 0.61, 0.355, 1] },
  }),
};

// Signature element: a strip of 5-minute chunks filling in as a lecture
// gets transcribed — mirrors the actual product mechanic instead of a
// generic decorative snippet.
function ChunkStrip() {
  const chunks = [
    { time: "0:00", label: "Intro & syllabus", done: true },
    { time: "5:00", label: "Process scheduling", done: true },
    { time: "10:00", label: "Round robin algorithm", done: true },
    { time: "15:00", label: "...", done: false },
    { time: "20:00", label: "...", done: false },
    { time: "25:00", label: "...", done: false },
  ];

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          color: "rgba(245,241,232,0.4)",
          marginBottom: 2,
        }}
      >
        LIVE — CS 3305, LECTURE 12
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {chunks.map((c, i) => (
          <motion.div
            key={c.time}
            initial={{ opacity: 0, scaleY: 0.4 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: 0.4 + i * 0.12, duration: 0.4 }}
            style={{
              flex: 1,
              height: 34,
              borderRadius: 6,
              background: c.done ? ACCENT : "rgba(255,255,255,0.06)",
              border: c.done ? "none" : "1px dashed rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          color: "rgba(245,241,232,0.65)",
          marginTop: 4,
        }}
      >
        10:00–15:00 · <span style={{ color: ACCENT }}>transcribing…</span>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  const { user, loading } = useAuthUser();

  const [manual_user, setManualUser] = useState(null);
  const [is_manual, set_is_manual] = useState(false);

  useEffect(() => {
    const saved_user = localStorage.getItem("user");

    if (!loading) {
      if (user || saved_user) {
        if (saved_user) {
          const parsedUser = JSON.parse(saved_user);
          setManualUser(parsedUser);
          set_is_manual(parsedUser.is_manual || false);
        }
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogle = async () => {
    try {
      localStorage.removeItem("user");
      const result = await signInWithGoogle();
      console.log("Google user:", result.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Google login error:", err);
      alert(err?.message || "Google login failed");
    }
  };

  const handleMicrosoft = async () => {
    try {
      localStorage.removeItem("user");
      const result = await signInWithMicrosoft();
      console.log("Microsoft user:", result.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Microsoft login error:", err);
      alert(err?.message || "Microsoft login failed");
    }
  };

  const handleManualLogin = async () => {
    try {
      if (!email || !password || !firstName || !lastName) {
        alert("Please fill all the required sections!");
        return;
      }

      const manual_user = {
        firstName,
        lastName,
        email,
        password,
        is_manual: true,
      };

      localStorage.setItem("user", JSON.stringify(manual_user));
      setManualUser(manual_user);
      set_is_manual(true);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error in manual login:", err);
    }
  };

  return (
    <div className="bg">
      <div className="layer">
        <Navbar />

        <main className="container hero">
          <motion.div
            className="card"
            style={{ padding: "clamp(20px, 5vw, 40px)", textAlign: "left" }}
            initial="hidden"
            animate="show"
            variants={fadeUp}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
              <div className="pill">Live transcription • Structured notes</div>
              <div className="pill">Every 5 minutes, automatically</div>
              <div className="pill">Lecture halls & Zoom calls</div>
            </div>

            <motion.h1
              className="h1"
              variants={fadeUp}
              custom={1}
              style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
            >
              Turn your lectures into
              <span style={{ display: "block", color: ACCENT }}>notes you'll actually reread</span>
            </motion.h1>

            <motion.p className="sub" variants={fadeUp} custom={2} style={{ maxWidth: "800px", marginBottom: 32 }}>
              NoteTaker listens while you sit back and pay attention. Every five minutes it
              transcribes, summarizes, and files your notes by course — so you never scramble
              to catch up after class.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="heroGrid" style={{ alignItems: "start" }}>
              <div style={{ display: "grid", gap: 16 }}>
                <div className="featureCard" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ fontWeight: 900, marginBottom: 12, fontSize: 16 }}>What this tool does</div>
                  <div style={{ color: "rgba(255,255,255,0.70)", lineHeight: 1.6, fontSize: 14 }}>
                    <p>• Captures lecture or meeting audio, live.</p>
                    <p>• Transcribes and summarizes every 5 minutes.</p>
                    <p>• Organizes notes by course, saved to your account.</p>
                    <div
                      style={{
                        marginTop: 12,
                        fontSize: 13,
                        opacity: 0.8,
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                        paddingTop: 12,
                      }}
                    >
                      Goal: show up to class, leave with your notes already done.
                    </div>
                  </div>
                </div>

                <div className="featureCard" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontWeight: 900 }}>Quick start</div>
                    <div className="pill">Steps</div>
                  </div>
                  <div style={{ display: "grid", gap: 8, fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 16 }}>
                    <div><strong>1.</strong> Start a session, name the course</div>
                    <div><strong>2.</strong> Let it listen while you focus</div>
                    <div><strong>3.</strong> Review, search, and chat with your notes</div>
                  </div>

                  <ChunkStrip />
                </div>
              </div>

              <div className="card authBox" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>Start taking better notes</div>
                  <div style={{ marginTop: 4, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                    Connect a course and never miss a point.
                  </div>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="pill"
                      style={{ width: "100%", padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.05)", color: "white" }}
                    />
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="pill"
                      style={{ width: "100%", padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.05)", color: "white" }}
                    />
                  </div>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    type="email"
                    className="pill"
                    style={{ width: "100%", padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.05)", color: "white" }}
                  />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    type="password"
                    className="pill"
                    style={{ width: "100%", padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.05)", color: "white" }}
                  />

                  <PrimaryButton style={{ marginTop: 8, background: ACCENT }} onClick={handleManualLogin}>
                    Create account
                  </PrimaryButton>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "10px 0", color: "rgba(255,255,255,0.3)", fontSize: 11 }}>
                    <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.1)" }} />
                    OR
                    <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.1)" }} />
                  </div>

                  <div style={{ display: "grid", gap: 8 }}>
                    <button className="authOption" style={{ width: "100%", cursor: "pointer" }} onClick={handleGoogle}>
                      <div className="authLeft">
                        <div className="iconBadge">G</div>
                        <div className="authTitle" style={{ fontSize: 14 }}>Google</div>
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.6 }}>Continue</div>
                    </button>
                    <button className="authOption" style={{ width: "100%", cursor: "pointer" }} onClick={handleMicrosoft}>
                      <div className="authLeft">
                        <div className="iconBadge">M</div>
                        <div className="authTitle" style={{ fontSize: 14 }}>Microsoft</div>
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.6 }}>Continue</div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            <motion.div className="card" style={{ padding: 20 }} variants={fadeUp} custom={4} initial="hidden" animate="show">
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Why chunked summaries</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.6 }}>
                Breaking a lecture into 5-minute pieces keeps each summary focused and lets
                you review the exact moment something was said, not just a vague gist.
              </div>
            </motion.div>

            <motion.div className="card" style={{ padding: 20 }} variants={fadeUp} custom={5} initial="hidden" animate="show">
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Coming soon</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.6 }}>
                • Chat with any past lecture<br />
                • Search notes across all your courses<br />
                • Shared notes for study groups
              </div>
            </motion.div>
          </div>

          <footer className="footer" style={{ textAlign: "center", marginTop: 40 }}>
            Built for lecture halls, seminar rooms, and Zoom calls • 2026
          </footer>
        </main>
      </div>
    </div>
  );
}