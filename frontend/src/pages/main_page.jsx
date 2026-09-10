import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ACCENT = "#FFC94D";
const ACCENT_SOFT = "#5EEAD4";
const BG = "#0B0E14";
const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const JS_DAY_TO_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, duration: 0.5, ease: [0.215, 0.61, 0.355, 1] },
  }),
};

function formatTime(s) {
  return `${s.hour}:${s.minute} ${s.period}`;
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStoredClasses() {
  try {
    const raw = localStorage.getItem("notetaker_classes");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const QUICK_ACTIONS = [
  { key: "chat", icon: "💬", title: "AI Chat", desc: "Ask questions about any past lecture", route: "/chat" },
  { key: "profile", icon: "👤", title: "Profile", desc: "Manage your account and preferences", route: "/profile" },
  { key: "history", icon: "📚", title: "Past Lectures", desc: "Browse every summary you've saved", route: "/lectures" },
  { key: "schedule-edit", icon: "🗓", title: "Edit Schedule", desc: "Add, remove, or update your classes", route: "/user-info" },
  { key: "settings", icon: "⚙", title: "Settings", desc: "Notifications, audio, and account settings", route: "/settings" },
  { key: "support", icon: "🛟", title: "Help & Support", desc: "Report an issue or send feedback", route: "/support" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    setUser(getStoredUser());
    setClasses(getStoredClasses());
  }, []);

  const todayLabel = JS_DAY_TO_LABEL[new Date().getDay()];

  const todaysSessions = useMemo(() => {
    const list = [];
    classes.forEach((c) => {
      (c.sessions || []).forEach((s) => {
        if (s.days?.includes(todayLabel)) {
          list.push({ className: c.className, professorName: c.professorName, ...s });
        }
      });
    });
    // sort by hour/period roughly (24h conversion)
    const to24 = (s) => {
      let h = parseInt(s.hour, 10) % 12;
      if (s.period === "PM") h += 12;
      return h * 60 + parseInt(s.minute, 10);
    };
    return list.sort((a, b) => to24(a) - to24(b));
  }, [classes, todayLabel]);

  const scheduleByDay = useMemo(() => {
    const map = Object.fromEntries(DAY_ORDER.map((d) => [d, []]));
    classes.forEach((c) => {
      (c.sessions || []).forEach((s) => {
        (s.days || []).forEach((d) => {
          if (map[d]) map[d].push({ className: c.className, professorName: c.professorName, ...s });
        });
      });
    });
    return map;
  }, [classes]);

  const firstName = user?.firstName || "there";

  const handleStartRecording = () => {
    // TODO: hook into actual recording/session flow
    navigate("/record");
  };

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: BG, position: "relative", overflowX: "hidden", color: "#F5F1E8" }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes float1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-20px); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-25px,25px); } }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,201,77,0.35); } 50% { box-shadow: 0 0 0 12px rgba(255,201,77,0); } }
        .nt-blob1 { animation: float1 9s ease-in-out infinite; }
        .nt-blob2 { animation: float2 11s ease-in-out infinite; }
        .nt-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; cursor: pointer; }
        .nt-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.35); }
        .nt-btn:active { transform: translateY(0); }
        .nt-card { transition: transform 0.2s ease, border-color 0.2s ease; cursor: pointer; }
        .nt-card:hover { transform: translateY(-4px); border-color: rgba(255,201,77,0.35) !important; }
        .nt-inner { max-width: 1160px; margin: 0 auto; padding: 0 32px; }
        .nt-record-btn { animation: pulse 2.4s ease-in-out infinite; }
        .nt-nav-link { transition: color 0.15s ease; cursor: pointer; }
        .nt-nav-link:hover { color: ${ACCENT} !important; }
        @media (max-width: 900px) {
          .nt-actions-grid { grid-template-columns: 1fr 1fr !important; }
          .nt-main-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .nt-actions-grid { grid-template-columns: 1fr !important; }
          .nt-schedule-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="nt-blob1" style={{ position: "absolute", top: "-10%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${ACCENT}18, transparent 70%)`, filter: "blur(50px)", pointerEvents: "none" }} />
      <div className="nt-blob2" style={{ position: "absolute", top: "10%", right: "-8%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${ACCENT_SOFT}14, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none" }} />

      {/* NAVBAR */}
      <div style={{ position: "relative", zIndex: 2, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="nt-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "grid", placeItems: "center", fontWeight: 900, color: ACCENT }}>
              NT
            </div>
            <span style={{ fontWeight: 800, fontSize: 15 }}>NoteTaker</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <span className="nt-nav-link" onClick={() => navigate("/dashboard")} style={{ fontSize: 13, fontWeight: 700, color: "rgba(245,241,232,0.8)" }}>Dashboard</span>
            <span className="nt-nav-link" onClick={() => navigate("/lectures")} style={{ fontSize: 13, fontWeight: 700, color: "rgba(245,241,232,0.8)" }}>Lectures</span>
            <span className="nt-nav-link" onClick={() => navigate("/chat")} style={{ fontSize: 13, fontWeight: 700, color: "rgba(245,241,232,0.8)" }}>Chat</span>
            <div
              onClick={() => navigate("/profile")}
              className="nt-btn"
              style={{ width: 34, height: 34, borderRadius: "50%", background: `${ACCENT}20`, border: `1px solid ${ACCENT}55`, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, color: ACCENT }}
            >
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <div className="nt-inner" style={{ position: "relative", zIndex: 1, padding: "36px 32px 100px" }}>
        {/* GREETING + START RECORDING */}
        <motion.div initial="hidden" animate="show" custom={0} variants={fadeUp} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT_SOFT, letterSpacing: 1, marginBottom: 6 }}>
            {todayLabel.toUpperCase()} · {new Date().toLocaleDateString(undefined, { month: "long", day: "numeric" })}
          </div>
          <h1 style={{ fontSize: "clamp(26px, 3.5vw, 34px)", fontFamily: "Georgia, serif", fontWeight: 400, margin: 0 }}>
            Welcome back, {firstName}
          </h1>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          custom={1}
          variants={fadeUp}
          onClick={handleStartRecording}
          className="nt-btn nt-record-btn"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "26px 30px",
            borderRadius: 18,
            background: `linear-gradient(135deg, ${ACCENT}25, rgba(255,255,255,0.03))`,
            border: `1px solid ${ACCENT}55`,
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: ACCENT, display: "grid", placeItems: "center", fontSize: 20 }}>
              🎙
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>Start Recording</div>
              <div style={{ fontSize: 13, color: "rgba(245,241,232,0.6)" }}>
                Capture and summarize your lecture live
              </div>
            </div>
          </div>
          <div style={{ fontSize: 24, color: ACCENT }}>→</div>
        </motion.div>

        <div className="nt-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 24 }}>
          {/* TODAY'S CLASSES */}
          <motion.div initial="hidden" animate="show" custom={2} variants={fadeUp}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Today's classes</div>
            {todaysSessions.length === 0 ? (
              <div style={{ padding: 20, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(245,241,232,0.5)", fontSize: 13 }}>
                Nothing scheduled today. Enjoy the break.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {todaysSessions.map((s, i) => (
                  <div key={i} style={{ padding: 16, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{s.className}</div>
                    <div style={{ fontSize: 12, color: "rgba(245,241,232,0.5)", marginTop: 2 }}>{s.professorName}</div>
                    <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: ACCENT, marginTop: 8 }}>
                      {formatTime(s)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* QUICK ACTIONS */}
          <motion.div initial="hidden" animate="show" custom={3} variants={fadeUp}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>Quick actions</div>
            <div className="nt-actions-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {QUICK_ACTIONS.map((a) => (
                <div
                  key={a.key}
                  className="nt-card"
                  onClick={() => navigate(a.route)}
                  style={{ padding: 18, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div style={{ fontSize: 22, marginBottom: 10 }}>{a.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 11.5, color: "rgba(245,241,232,0.55)", lineHeight: 1.5 }}>{a.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* WEEKLY SCHEDULE */}
        <motion.div initial="hidden" animate="show" custom={4} variants={fadeUp} style={{ marginTop: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Weekly schedule</div>
            <span className="nt-nav-link" onClick={() => navigate("/user-info")} style={{ fontSize: 12, fontWeight: 700, color: ACCENT }}>
              Edit
            </span>
          </div>

          {classes.length === 0 ? (
            <div style={{ padding: 20, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(245,241,232,0.5)", fontSize: 13 }}>
              No classes added yet. <span style={{ color: ACCENT, cursor: "pointer" }} onClick={() => navigate("/user-info")}>Add your first class</span>
            </div>
          ) : (
            <div className="nt-schedule-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
              {DAY_ORDER.map((day) => (
                <div key={day} style={{ padding: 12, borderRadius: 12, background: day === todayLabel ? `${ACCENT}10` : "rgba(255,255,255,0.02)", border: day === todayLabel ? `1px solid ${ACCENT}44` : "1px solid rgba(255,255,255,0.06)", minHeight: 100 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: day === todayLabel ? ACCENT : "rgba(245,241,232,0.4)", marginBottom: 8 }}>
                    {day}
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    {scheduleByDay[day].length === 0 ? (
                      <div style={{ fontSize: 11, color: "rgba(245,241,232,0.25)" }}>—</div>
                    ) : (
                      scheduleByDay[day].map((s, i) => (
                        <div key={i} style={{ fontSize: 11, lineHeight: 1.4 }}>
                          <div style={{ fontWeight: 700 }}>{s.className}</div>
                          <div style={{ color: "rgba(245,241,232,0.45)", fontFamily: "'Courier New', monospace" }}>
                            {formatTime(s)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}