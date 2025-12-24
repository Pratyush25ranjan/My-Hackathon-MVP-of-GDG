import { Navigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function RequiredVerified({ children }) {
  const [state, setState] = useState("loading");

  useEffect(() => {
    const check = async () => {
      const user = auth.currentUser;

      if (!user) {
        setState("blocked");
        return;
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setState("blocked");
        return;
      }

      const userData = snap.data();

      // ✅ DEBUG (SAFE)
      console.log("FIRESTORE USER 👉", userData);

      // 🔥 ADMIN BYPASS
      if (userData.role === "admin") {
        setState("allowed");
        return;
      }

      if (userData.verified === true) {
        setState("allowed");
      } else {
        setState("blocked");
      }
    };

    check();
  }, []);

  if (state === "loading") return null;

  if (state === "blocked") {
    return <Navigate to="/pending-verification" replace />;
  }

  return children;
}
