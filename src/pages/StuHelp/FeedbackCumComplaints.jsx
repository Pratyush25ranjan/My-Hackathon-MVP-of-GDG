import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { Button } from "../../components/ui/button";
import { compressImage } from "../StudentPage/shared";

const FeedbackComplaints = ({ role }) => {
  const [type, setType] = useState("feedback"); // feedback | complaint
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  /* ---------------- IMAGE HANDLING ---------------- */
  const handleImageChange = async (file) => {
    if (!file) return;
    const compressed = await compressImage(file);
    setImage(compressed);
    setPreview(compressed);
  };

  /* ---------------- SUBMIT ---------------- */
  const submitFeedback = async () => {
    if (!auth.currentUser) {
      alert("You must be logged in.");
      return;
    }

    if (!title.trim() || !description.trim()) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "feedbackComplaints"), {
        type,
        title,
        description,
        image: image || null,
        status: "pending",
        studentUid: auth.currentUser.uid,
        studentEmail: auth.currentUser.email,
        createdAt: serverTimestamp(),

      });

      setType("feedback");
      setTitle("");
      setDescription("");
      setImage(null);
      setPreview(null);

      alert("Submitted successfully!");
    } catch (error) {
      console.error("Feedback submit error:", error);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ADMIN PLACEHOLDER ---------------- */
  if (role !== "student") {
    return (
      <div className="bg-black text-white border border-white/20 rounded-lg p-4">
        Admin feedback management will be implemented next.
      </div>
    );
  }

  /* ---------------- STUDENT UI ---------------- */
  return (
    <div className="bg-black text-white rounded-lg p-6 space-y-6 shadow max-w-3xl border border-white/10">
      <h2 className="text-xl font-semibold">
        Feedback & Complaints
      </h2>

      {/* TYPE SELECT */}
      <div className="flex gap-3">
        <Button
          variant={type === "feedback" ? "default" : "outline"}
          onClick={() => setType("feedback")}
        >
          Feedback
        </Button>
        <Button
          variant={type === "complaint" ? "default" : "outline"}
          onClick={() => setType("complaint")}
        >
          Complaint
        </Button>
      </div>

      {/* TITLE */}
      <input
        className="
          w-full
          border border-white/20
          rounded-md
          p-2
          bg-black
          text-white
          placeholder-gray-400
          focus:outline-none
          focus:ring-2
          focus:ring-green-500
        "
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* DESCRIPTION */}
      <textarea
        className="
          w-full
          border border-white/20
          rounded-md
          p-2
          min-h-[120px]
          bg-black
          text-white
          placeholder-gray-400
          focus:outline-none
          focus:ring-2
          focus:ring-green-500
        "
        placeholder="Describe your feedback or complaint..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* IMAGE UPLOAD */}
      <input
        type="file"
        accept="image/*"
        className="text-white"
        onChange={(e) => handleImageChange(e.target.files[0])}
      />

      {/* IMAGE PREVIEW */}
      {preview && (
        <div className="w-fit">
          <img
            src={preview}
            alt="Preview"
            className="h-32 rounded border border-white/20 cursor-pointer"
            onClick={() => setZoomImage(preview)}
          />
          <p className="text-xs text-gray-400 mt-1">
            Click image to zoom
          </p>
        </div>
      )}

      {/* SUBMIT */}
      <Button onClick={submitFeedback} disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </Button>

      {/* IMAGE ZOOM */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            className="max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
            alt="zoom"
          />
        </div>
      )}
    </div>
  );
};

export default FeedbackComplaints;
