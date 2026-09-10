import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ACCENT = "#FFC94D";
const ACCENT_SOFT = "#5EEAD4";
const BG = "#0B0E14";
const MAX_CLASSES = 5;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
const PERIODS = ["AM", "PM"];
const ITEM_H = 40;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.6, ease: [0.215, 0.61, 0.355, 1] },
  }),
};

function emptySession() {
  return { id: crypto.randomUUID(), days: [], hour: "9", minute: "00", period: "AM" };
}

function emptyClass() {
  return {
    id: crypto.randomUUID(),
    className: "",
    professorName: "",
    sessions: [emptySession()],
    notes: "",
  };
}

/* ---------- Scroll-snap wheel column (mobile-style time picker) ---------- */
function WheelColumn({ options, value, onChange, width = 56 }) {
  const ref = useRef(null);
  const settleTimeout = useRef(null);
  const didInit = useRef(false);

  useEffect(() => {
    if (!ref.current || didInit.current) return;
    const idx = Math.max(0, options.indexOf(value));
    ref.current.scrollTop = idx * ITEM_H;
    didInit.current = true;
  }, [options, value]);

  const handleScroll = () => {
    if (settleTimeout.current) clearTimeout(settleTimeout.current);
    settleTimeout.current = setTimeout(() => {
      if (!ref.current) return;
      const idx = Math.round(ref.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(options.length - 1, idx));
      ref.current.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
      if (options[clamped] !== value) onChange(options[clamped]);
    }, 100);
  };

  return (
    <div style={{ position: "relative", width }}>
      <div
        ref={ref}
        onScroll={handleScroll}
        className="nt-wheel"
        style={{
          height: ITEM_H * 3,
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
        }}
      >
        <div style={{ height: ITEM_H }} />
        {options.map((opt) => (
          <div
            key={opt}
            style={{
              height: ITEM_H,
              scrollSnapAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: opt === value ? 18 : 14,
              fontWeight: opt === value ? 800 : 500,
              color: opt === value ? ACCENT : "rgba(245,241,232,0.35)",
              transition: "color 0.15s ease, font-size 0.15s ease",
            }}
          >
            {opt}
          </div>
        ))}
        <div style={{ height: ITEM_H }} />
      </div>
      {/* center highlight band */}
      <div
        style={{
          position: "absolute",
          top: ITEM_H,
          left: 0,
          right: 0,
          height: ITEM_H,
          borderTop: `1px solid ${ACCENT}33`,
          borderBottom: `1px solid ${ACCENT}33`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function TimeWheelPicker({ hour, minute, period, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "0 8px" }}>
      <WheelColumn options={HOURS} value={hour} onChange={(v) => onChange({ hour: v })} />
      <span style={{ color: "rgba(245,241,232,0.4)", fontWeight: 800 }}>:</span>
      <WheelColumn options={MINUTES} value={minute} onChange={(v) => onChange({ minute: v })} />
      <WheelColumn options={PERIODS} value={period} onChange={(v) => onChange({ period: v })} width={48} />
    </div>
  );
}

/* ---------- Day pills (multi-select) ---------- */
function DayPills({ selected, onToggle }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {DAYS.map((d) => {
        const active = selected.includes(d);
        return (
          <button
            key={d}
            type="button"
            onClick={() => onToggle(d)}
            className="nt-btn"
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: active ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.12)",
              background: active ? `${ACCENT}20` : "rgba(255,255,255,0.05)",
              color: active ? ACCENT : "rgba(245,241,232,0.7)",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- One session block (days + one time) ---------- */
function SessionBlock({ session, onUpdate, onRemove, canRemove }) {
  const toggleDay = (day) => {
    const days = session.days.includes(day)
      ? session.days.filter((d) => d !== day)
      : [...session.days, day];
    onUpdate({ days });
  };

  return (
    <div style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <label style={{ fontSize: 12, color: "rgba(245,241,232,0.5)", fontWeight: 700 }}>Meets on</label>
        {canRemove && (
          <span
            className="nt-remove"
            onClick={onRemove}
            style={{ fontSize: 12, color: "rgba(245,241,232,0.4)", fontWeight: 700, cursor: "pointer" }}
          >
            Remove time
          </span>
        )}
      </div>
      <DayPills selected={session.days} onToggle={toggleDay} />
      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 12, color: "rgba(245,241,232,0.5)", fontWeight: 700, display: "block", marginBottom: 6 }}>
          At
        </label>
        <TimeWheelPicker
          hour={session.hour}
          minute={session.minute}
          period={session.period}
          onChange={(patch) => onUpdate(patch)}
        />
      </div>
    </div>
  );
}

export default function ClassSetup() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([emptyClass()]);
  const [error, setError] = useState("");

  const updateClass = (id, field, value) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const addClass = () => {
    if (classes.length >= MAX_CLASSES) return;
    setClasses((prev) => [...prev, emptyClass()]);
  };

  const removeClass = (id) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  const addSession = (classId) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, sessions: [...c.sessions, emptySession()] } : c))
    );
  };

  const removeSession = (classId, sessionId) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === classId ? { ...c, sessions: c.sessions.filter((s) => s.id !== sessionId) } : c
      )
    );
  };

  const updateSession = (classId, sessionId, patch) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === classId
          ? { ...c, sessions: c.sessions.map((s) => (s.id === sessionId ? { ...s, ...patch } : s)) }
          : c
      )
    );
  };

  const handleContinue = () => {
    const filled = classes.filter(
      (c) =>
        c.className.trim() &&
        c.professorName.trim() &&
        c.sessions.some((s) => s.days.length > 0)
    );

    if (filled.length === 0) {
      setError("Add at least one class with a name, professor, and a meeting day before continuing.");
      return;
    }

    localStorage.setItem("notetaker_classes", JSON.stringify(filled));
    navigate("/dashboard");
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
        .nt-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
        .nt-input { transition: border-color 0.15s ease, background 0.15s ease; width: 100%; }
        .nt-input:focus { outline: none; border-color: ${ACCENT} !important; background: rgba(255,255,255,0.08) !important; }
        .nt-card { transition: border-color 0.2s ease; }
        .nt-inner { max-width: 760px; margin: 0 auto; padding: 0 32px; }
        .nt-remove { transition: opacity 0.15s ease, color 0.15s ease; cursor: pointer; }
        .nt-remove:hover { color: #ff6b6b !important; }
        .nt-wheel { scrollbar-width: none; -ms-overflow-style: none; }
        .nt-wheel::-webkit-scrollbar { display: none; }
        @media (max-width: 600px) {
          .nt-field-row { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="nt-blob1" style={{ position: "absolute", top: "-10%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${ACCENT}18, transparent 70%)`, filter: "blur(50px)", pointerEvents: "none" }} />
      <div className="nt-blob2" style={{ position: "absolute", bottom: "-15%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${ACCENT_SOFT}14, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        <div className="nt-inner" style={{ display: "flex", alignItems: "center", gap: 10, padding: "24px 32px" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "grid", placeItems: "center", fontWeight: 900, color: ACCENT }}>
            NT
          </div>
          <span style={{ fontWeight: 800, fontSize: 15 }}>NoteTaker</span>
        </div>
      </div>

      <div className="nt-inner" style={{ position: "relative", zIndex: 1, padding: "20px 32px 100px" }}>
        <motion.div initial="hidden" animate="show" style={{ textAlign: "center", marginBottom: 36 }}>
          <motion.div variants={fadeUp} custom={0} style={{ display: "inline-block", padding: "6px 14px", borderRadius: 999, border: `1px solid ${ACCENT}55`, background: `${ACCENT}15`, color: ACCENT, fontSize: 12, fontWeight: 700, marginBottom: 18 }}>
            Almost there
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} style={{ fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.15, margin: 0, fontFamily: "Georgia, serif", fontWeight: 400 }}>
            Tell us about your classes
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} style={{ marginTop: 14, color: "rgba(245,241,232,0.6)", fontSize: 15, lineHeight: 1.6, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
            Add up to {MAX_CLASSES} classes. Each can meet multiple days, and at
            multiple different times if needed.
          </motion.p>
        </motion.div>

        <div style={{ display: "grid", gap: 16 }}>
          <AnimatePresence>
            {classes.map((c, i) => (
              <motion.div
                key={c.id}
                className="nt-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                style={{ padding: 22, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "rgba(245,241,232,0.5)" }}>CLASS {i + 1}</div>
                  {classes.length > 1 && (
                    <span className="nt-remove" onClick={() => removeClass(c.id)} style={{ fontSize: 13, color: "rgba(245,241,232,0.4)", fontWeight: 700 }}>
                      Remove
                    </span>
                  )}
                </div>

                <div className="nt-field-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "rgba(245,241,232,0.5)", fontWeight: 700, display: "block", marginBottom: 6 }}>
                      Class name
                    </label>
                    <input
                      className="nt-input"
                      value={c.className}
                      onChange={(e) => updateClass(c.id, "className", e.target.value)}
                      placeholder="e.g. CS 3305"
                      style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "white" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "rgba(245,241,232,0.5)", fontWeight: 700, display: "block", marginBottom: 6 }}>
                      Professor's name
                    </label>
                    <input
                      className="nt-input"
                      value={c.professorName}
                      onChange={(e) => updateClass(c.id, "professorName", e.target.value)}
                      placeholder="e.g. Dr. Smith"
                      style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "white" }}
                    />
                  </div>
                </div>

                {/* SESSIONS */}
                <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
                  {c.sessions.map((s) => (
                    <SessionBlock
                      key={s.id}
                      session={s}
                      onUpdate={(patch) => updateSession(c.id, s.id, patch)}
                      onRemove={() => removeSession(c.id, s.id)}
                      canRemove={c.sessions.length > 1}
                    />
                  ))}
                  <button
                    type="button"
                    className="nt-btn"
                    onClick={() => addSession(c.id)}
                    style={{ padding: "10px", borderRadius: 10, border: "1px dashed rgba(255,255,255,0.15)", background: "transparent", color: "rgba(245,241,232,0.5)", fontWeight: 700, fontSize: 12 }}
                  >
                    + Add another time for this class
                  </button>
                </div>

                <div>
                  <label style={{ fontSize: 12, color: "rgba(245,241,232,0.5)", fontWeight: 700, display: "block", marginBottom: 6 }}>
                    Anything important to flag? <span style={{ fontWeight: 400, opacity: 0.7 }}>(optional)</span>
                  </label>
                  <textarea
                    className="nt-input"
                    value={c.notes}
                    onChange={(e) => updateClass(c.id, "notes", e.target.value)}
                    placeholder="e.g. Assignment 2 is due next Friday, midterm is in week 8..."
                    rows={2}
                    style={{ padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "white", resize: "vertical", fontFamily: "inherit" }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {classes.length < MAX_CLASSES && (
          <motion.button
            className="nt-btn"
            onClick={addClass}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginTop: 16, width: "100%", padding: "14px", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.2)", background: "transparent", color: "rgba(245,241,232,0.6)", fontWeight: 700, fontSize: 14 }}
          >
            + Add another class ({classes.length}/{MAX_CLASSES})
          </motion.button>
        )}

        {error && (
          <div style={{ marginTop: 14, color: "#ff8a8a", fontSize: 13, textAlign: "center" }}>{error}</div>
        )}

        <button
          className="nt-btn"
          onClick={handleContinue}
          style={{ marginTop: 28, width: "100%", padding: "16px", borderRadius: 12, border: "none", background: ACCENT, color: "#0B0E14", fontWeight: 800, fontSize: 15 }}
        >
          Continue to dashboard
        </button>
      </div>
    </div>
  );
}