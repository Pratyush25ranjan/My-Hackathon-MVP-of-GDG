import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../services/firebase";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      const snap = await getDoc(doc(db, "users", cred.user.uid));

      if (!snap.exists()) {
        alert("User profile not found. Please sign up again.");
        await signOut(auth);
        setLoading(false);
        return;
      }

      const userData = snap.data();

      // 🔥 ADMIN FIRST
      if (userData.role === "admin") {
        navigate("/admin");
        return;
      }

      // 👨‍🎓 STUDENT FLOW
      if (userData.verified === true) {
        navigate("/feed");
      } else {
        navigate("/pending-verification");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4">
        {/* Info box with demo credentials */}
        <div className="border rounded-md bg-muted/40 px-4 py-3 text-sm">
          <p className="font-semibold mb-1">
            Currently student verification is done manually by Admin.
          </p>
          <p className="mb-2">
            To try the MVP, use the following login credentials:
          </p>

          <div className="mb-2">
            <p className="font-semibold">Admin</p>
            <p>Email: <span className="font-mono">pratyush25ranjan@gmail.com</span></p>
            <p>Password: <span className="font-mono">12345678</span></p>
          </div>

          <div>
            <p className="font-semibold">Verified student</p>
            <p>Email: <span className="font-mono">pratyush2507ranjan@gmail.com</span></p>
            <p>Password: <span className="font-mono">123456</span></p>
          </div>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">CampusConnect</CardTitle>
            <CardDescription>
              The exclusive social platform for your college.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label>College Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>

              <Link to="/signup">
                <Button variant="outline" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
