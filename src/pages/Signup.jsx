// src/pages/Signup.jsx
// REPLACE YOUR ENTIRE Signup.jsx FILE WITH THIS

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { signUpWithEmail, signUpWithGoogle } from "../services/authService";
import { validateEmailComprehensive } from "../utils/emailValidator";
import imageCompression from "browser-image-compression";

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("cs");
  const [year, setYear] = useState("1");
  const [verificationImage, setVerificationImage] = useState(null);
  const [verificationImagePreview, setVerificationImagePreview] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle image file selection and convert to base64
  const handleImageChange = async (e) => {

    const file = e.target.files[0];
    
    if (!file) {
      setVerificationImage(null);
      setVerificationImagePreview(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setEmailError("Please upload a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setEmailError("Image size must be less than 5MB");
      return;
    }

    // Convert to base64
    const options = {
  maxSizeMB: 0.3,           // VERY IMPORTANT (300 KB)
  maxWidthOrHeight: 1024,
  useWebWorker: true,
};

try {
  const compressedFile = await imageCompression(file, options);

  const reader = new FileReader();
  reader.onloadend = () => {
    setVerificationImage(reader.result);
    setVerificationImagePreview(reader.result);
    setEmailError("");
  };
  reader.readAsDataURL(compressedFile);
} catch (error) {
  console.error("Image compression failed:", error);
  setEmailError("Failed to process image");
}
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailError("");

    try {
      // Validate personal info
      if (!firstName.trim() || !lastName.trim()) {
        setEmailError("First and last names are required");
        setLoading(false);
        return;
      }

      // Validate email
      const emailValidation = validateEmailComprehensive(email);
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.message);
        setLoading(false);
        return;
      }

      // Validate password
      if (!password || password.length < 6) {
        setEmailError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setEmailError("Passwords do not match");
        setLoading(false);
        return;
      }

      // Validate identity proof
      if (!verificationImage) {
        setEmailError("Proof of Identity (College ID/Bonafide) is required");
        setLoading(false);
        return;
      }

      // Call signup
      const { user, error } = await signUpWithEmail(
        email,
        password,
        firstName,
        lastName,
        department,
        year,
        verificationImage // Pass base64 image
      );

      if (error) {
        setEmailError(error);
        setLoading(false);
        return;
      }

      navigate("/pending-verification");
    } catch (err) {
      console.error("Signup error:", err);
      setEmailError(err.message || "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setEmailError("");

    try {
      if (!firstName.trim() || !lastName.trim()) {
        setEmailError("First and last names are required");
        setLoading(false);
        return;
      }

      // Validate identity proof for Google signup too
      if (!verificationImage) {
        setEmailError("Proof of Identity (College ID/Bonafide) is required");
        setLoading(false);
        return;
      }

      const { user, error } = await signUpWithGoogle(
        firstName,
        lastName,
        department,
        year,
        verificationImage // Pass base64 image
      );

      if (error) {
        setEmailError(error);
        setLoading(false);
        return;
      }

      navigate("/pending-verification");
    } catch (err) {
      console.error("Google signup error:", err);
      setEmailError(err.message || "An error occurred during Google signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join CampusConnect today</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {emailError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {emailError}
              </div>
            )}

            {/* Personal Info Section */}
            <div className="space-y-3 pb-4 border-b">
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label className="text-xs">First Name</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Last Name</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs">Department</Label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                >
                  <option value="cs">Computer Science (CSE)</option>
                  <option value="it">Information Technology (IT)</option>
                  <option value="ee">Electrical Engineering (EE)</option>
                  <option value="ece">Electronics & Communication (ECE)</option>
                  <option value="me">Mechanical Engineering (ME)</option>
                  <option value="ce">Civil Engineering (CE)</option>
                  <option value="che">Chemical Engineering (CHE)</option>
                  <option value="ipe">Instrumentation & Process (IPE)</option>
                  <option value="aiml">AI & Machine Learning (AIML)</option>
                  <option value="anim">Animation (ANIM)</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs">Year of Study</Label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loading}
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              {/* Identity Proof Upload - REQUIRED */}
              <div className="grid gap-2">
                <Label className="text-xs">
                  📋 Proof of Identity <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Upload College ID / Bonafide Certificate (JPG, PNG, PDF)
                </p>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                  required
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />

                {/* Image Preview */}
                {verificationImagePreview && (
                  <div className="mt-3 border rounded-md p-3 bg-gray-50">
                    <p className="text-xs font-semibold mb-2">Preview:</p>
                    <img
                      src={verificationImagePreview}
                      alt="Identity Proof Preview"
                      className="w-full h-40 object-cover rounded-md border"
                    />
                    <p className="text-xs text-green-600 mt-2">✅ Image uploaded successfully</p>
                  </div>
                )}
              </div>
            </div>

            {/* GOOGLE OAUTH OPTION */}
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold mb-2">Option 1: Sign up with Google</p>
                <GoogleSignInButton
                  onClick={handleGoogleSignup}
                  isLoading={loading}
                  text="Sign up with Google"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">OR</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold mb-2">Option 2: Sign up with Email</p>
              </div>
            </div>

            {/* EMAIL/PASSWORD FORM */}
            <form onSubmit={handleEmailSignup} className="grid gap-3">
              <div className="grid gap-2">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Must be a valid email address
                </p>
              </div>

              <div className="grid gap-2">
                <Label className="text-xs">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-xs">Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up with Email"}
              </Button>
            </form>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold hover:underline">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}