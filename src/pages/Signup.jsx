import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../services/firebase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectItem } from "../components/ui/select";

export default function Signup() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");

  const [idImage, setIdImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔒 Auto-lock year for Animation & AIML
  useEffect(() => {
    if (department === "anim" || department === "aiml") {
      setYear("1");
    }
  }, [department]);

  // 🔥 Image compression (Feed-style logic)
  const compressImageToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = img.width;
          canvas.height = img.height;

          ctx.drawImage(img, 0, 0);

          // compression quality
          const compressed = canvas.toDataURL("image/jpeg", 0.6);
          resolve(compressed);
        };
      };

      reader.onerror = reject;
    });

  const handleSignup = async (e) => {
    e.preventDefault();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !department ||
      !year ||
      !idImage
    ) {
      alert("All fields are required");
      return;
    }

    if (!idImage.type.startsWith("image/")) {
      alert("Only image files are allowed");
      return;
    }

    try {
      setLoading(true);

      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const verificationImageBase64 =
        await compressImageToBase64(idImage);

      await setDoc(doc(db, "users", cred.user.uid), {
        firstName,
        lastName,
        email,
        department,
        year,
        verificationImageBase64,
        role: "student",
        verified: false,
        createdAt: serverTimestamp(),
      });

      navigate("/pending-verification");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">
          Student Signup
        </h1>

        {/* Name */}
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="First Name *"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            placeholder="Last Name *"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label>
            College Email <span className="text-red-500">*</span>
          </Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <Label>
            Password <span className="text-red-500">*</span>
          </Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Department */}
        <div className="space-y-1">
          <Label>
            Department <span className="text-red-500">*</span>
          </Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectItem value="">Select department</SelectItem>
            <SelectItem value="cs">Computer Science</SelectItem>
            <SelectItem value="it">Information Technology</SelectItem>
             <SelectItem value="ee">Electrical Engineering</SelectItem>
            <SelectItem value="ece">Electronics & Communication</SelectItem>
            <SelectItem value="me">Mechanical Engineering</SelectItem>
            <SelectItem value="ce">Civil Engineering</SelectItem>
            <SelectItem value="anim">Animation & VFX</SelectItem>
            <SelectItem value="aiml">AI & Machine Learning</SelectItem>
            <SelectItem value="che">Chemical Engineering</SelectItem>
            <SelectItem value="ipe">Industrial and Production Engineering</SelectItem>
          </Select>
        </div>

        {/* Year */}
        <div className="space-y-1">
          <Label>
            Year <span className="text-red-500">*</span>
          </Label>
          <Select value={year} onValueChange={setYear}>
            <SelectItem value="">Select year</SelectItem>
            <SelectItem value="1">1st Year</SelectItem>

            {!["anim", "aiml"].includes(department) && (
              <>
                <SelectItem value="2">2nd Year</SelectItem>
                <SelectItem value="3">3rd Year</SelectItem>
                <SelectItem value="4">4th Year</SelectItem>
              </>
            )}
          </Select>

          {["anim", "aiml"].includes(department) && (
            <p className="text-xs text-muted-foreground">
              This program is available only for 1st year students.
            </p>
          )}
        </div>

        {/* College ID Upload */}
        <div className="space-y-1">
          <Label>
            Upload College ID <span className="text-red-500">*</span>
          </Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setIdImage(e.target.files[0])}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </div>
  );
}
