// src/pages/components/Navbar_Login.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthUser } from "../../firebase/useAuthUser";
import { getAuth, signOut } from "firebase/auth";
import { useEffect, useRef, useState } from "react";

const ACCENT = "#FFC94D";

export default function Navbar_Login() {
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  const doSignOut = async () => {
    await signOut(getAuth());
    setOpen(false);
    navigate("/", { replace: true });
  };

  const localUser = (() => {
    try {
      const data = localStorage.getItem("user");
      return data && data.startsWith("{") ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  })();

  const safeName = localUser?.is_manual
    ? localUser.firstName || "User"
    : user?.displayName?.split(" ")[0] || "Account";

  const initials = (localUser?.firstName || user?.displayName || user?.email || "U")
    .slice(0, 1)
    .toUpperCase();

  const photo = user?.photoURL;

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(10px)",
        background: "rgba(8,10,16,0.55)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="container" style={{ padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              display: "grid",
              placeItems: "center",
              fontWeight: 950,
              color: ACCENT,
            }}
          >
            NT
          </div>
          <Link
            to="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              textDecoration: "none",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontWeight: 900, fontSize: 14, color: "rgba(255,255,255,0.9)" }}>
                NoteTaker
              </div>
              <div style={{ fontWeight: 950, fontSize: 16, fontFamily: "'Instrument Serif', serif" }}>
                Lecture notes, automatically
              </div>
            </div>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <NavItem to="/lectures">Lectures</NavItem>
          <NavItem to="/about">About</NavItem>
          <NavItem to="/how-it-works">How it works</NavItem>
          <NavItem to="/privacy">Privacy Policy</NavItem>

          {user && (
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setOpen((v) => !v)}
                className="pill"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 10,
                    overflow: "hidden",
                    background: photo ? "transparent" : `linear-gradient(135deg, ${ACCENT} 0%, #E8963A 100%)`,
                    border: "1px solid rgba(255,255,255,0.15)",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 950,
                    color: "#0B0E14",
                    fontSize: 12,
                  }}
                >
                  {photo ? (
                    <img src={photo} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    initials
                  )}
                </div>
                <span style={{ opacity: 0.9 }}>{safeName}</span>
                <span style={{ opacity: 0.6 }}>▾</span>
              </button>

              {open && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    marginTop: 10,
                    width: 260,
                    borderRadius: 16,
                    background: "rgba(12,14,20,0.92)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    boxShadow: "0 22px 70px rgba(0,0,0,0.55)",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: 14, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <button
                      onClick={() => {
                        setOpen(false);
                        navigate("/profile?view=details");
                      }}
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 950, fontSize: 13, color: "rgba(255,255,255,0.9)" }}>
                        {safeName}
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 12,
                          color: ACCENT,
                          fontWeight: 900,
                          textDecoration: "underline",
                          textUnderlineOffset: 3,
                        }}
                      >
                        Account settings
                      </div>
                    </button>
                  </div>

                  <MenuBtn
                    label="Account details"
                    onClick={() => {
                      setOpen(false);
                      navigate("/profile?view=details");
                    }}
                  />
                  <MenuBtn
                    label="Past lectures"
                    onClick={() => {
                      setOpen(false);
                      navigate("/lectures");
                    }}
                  />

                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
                  <MenuBtn label="Sign out" danger onClick={doSignOut} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NavItem({ to, children }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        fontWeight: 800,
        fontSize: 14,
        padding: "8px 12px",
        borderRadius: 10,
        transition: "all 0.18s ease",
        color: active ? ACCENT : "rgba(255,255,255,0.85)",
        background: active ? "rgba(255,201,77,0.12)" : "transparent",
        border: active ? "1px solid rgba(255,201,77,0.35)" : "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (active) return;
        e.target.style.color = ACCENT;
        e.target.style.background = "rgba(255,255,255,0.06)";
      }}
      onMouseLeave={(e) => {
        if (active) return;
        e.target.style.color = "rgba(255,255,255,0.85)";
        e.target.style.background = "transparent";
      }}
      onMouseDown={(e) => {
        e.target.style.transform = "scale(0.96)";
      }}
      onMouseUp={(e) => {
        e.target.style.transform = "scale(1)";
      }}
    >
      {children}
    </Link>
  );
}

function MenuBtn({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "12px 14px",
        background: danger ? "rgba(255,70,90,0.10)" : "transparent",
        border: "none",
        color: "white",
        cursor: "pointer",
        fontWeight: 900,
        fontSize: 13,
      }}
    >
      {label}
    </button>
  );
}