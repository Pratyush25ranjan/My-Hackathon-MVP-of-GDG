// src/pages/Login.jsx


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { loginWithGoogle, resetPassword } from "../services/authService";
import { validateEmailComprehensive } from "../utils/emailValidator";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");

  // ==================== LOGIN HANDLERS ====================

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const emailValidation = validateEmailComprehensive(email);
      if (!emailValidation.isValid) {
        setError(emailValidation.message);
        setLoading(false);
        return;
      }

      if (!password) {
        setError("Password is required");
        setLoading(false);
        return;
      }

      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));

      if (!snap.exists()) {
        setError("User profile not found. Please sign up again.");
        await signOut(auth);
        setLoading(false);
        return;
      }

      const userData = snap.data();

      if (userData.role === "admin") {
        navigate("/admin");
        return;
      }

      if (userData.verified === true) {
        navigate("/feed");
      } else {
        navigate("/pending-verification");
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.code === "auth/user-not-found") {
        setError("Email not found. Please sign up first.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ==================== GOOGLE LOGIN HANDLER ====================

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const { user, error: googleError } = await loginWithGoogle();

      if (googleError) {
        setError(googleError);
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));

      if (!snap.exists()) {
        setError("User profile not found. Please sign up first.");
        setLoading(false);
        return;
      }

      const userData = snap.data();

      if (userData.role === "admin") {
        navigate("/admin");
        return;
      }

      if (userData.verified === true) {
        navigate("/feed");
      } else {
        navigate("/pending-verification");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== FORGOT PASSWORD HANDLERS ====================

  const handleForgotPasswordOpen = () => {
    setForgotPasswordOpen(true);
    setForgotPasswordError("");
    setForgotPasswordMessage("");
  };

  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
    setForgotPasswordEmail("");
    setForgotPasswordMessage("");
    setForgotPasswordError("");
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError("");
    setForgotPasswordMessage("");

    try {
      const emailValidation = validateEmailComprehensive(forgotPasswordEmail);
      if (!emailValidation.isValid) {
        setForgotPasswordError(emailValidation.message);
        setForgotPasswordLoading(false);
        return;
      }

      const { success, message } = await resetPassword(forgotPasswordEmail);

      if (success) {
        setForgotPasswordMessage(message);
        setTimeout(() => {
          handleForgotPasswordClose();
        }, 3000);
      } else {
        setForgotPasswordError(message);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setForgotPasswordError(err.message);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">CampusConnect</CardTitle>
            <CardDescription>The exclusive social platform for your college.</CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4 space-y-2">
              <p className="text-xs font-semibold">Quick Login</p>
              <GoogleSignInButton onClick={handleGoogleLogin} isLoading={loading} text="Sign in with Google" />
            </div>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <button
              type="button"
              onClick={handleForgotPasswordOpen}
              className="w-full text-center text-sm text-primary hover:underline mt-2"
              disabled={loading}
            >
              Forgot Password?
            </button>

            <div className="mt-4 border-t pt-4">
              <p className="text-sm text-center mb-2">Don't have an account?</p>
              <Link to="/signup">
                <Button variant="outline" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==================== FORGOT PASSWORD MODAL ==================== */}
      {forgotPasswordOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleForgotPasswordClose}
        >
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a password reset link.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {forgotPasswordMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                  {forgotPasswordMessage}
                </div>
              )}

              {forgotPasswordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {forgotPasswordError}
                </div>
              )}

              {!forgotPasswordMessage && (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={forgotPasswordLoading}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={forgotPasswordLoading}
                    >
                      {forgotPasswordLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handleForgotPasswordClose}
                      disabled={forgotPasswordLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {forgotPasswordMessage && (
                <Button className="w-full" onClick={handleForgotPasswordClose}>
                  Close
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}