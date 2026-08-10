import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase.jsx"; // adjust path based on file location

export function useAuthUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);

      if (u) {
        localStorage.setItem(
          "auth_user",
          JSON.stringify({
            uid: u.uid,
            email: u.email || "",
            displayName: u.displayName || "",
            photoURL: u.photoURL || "",
          })
        );
      } else {
        localStorage.removeItem("auth_user");
      }
    });

    return () => unsub();
  }, []);

  return { user, loading };
}
