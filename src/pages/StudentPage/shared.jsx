// src/pages/StudentPage/shared.jsx
import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Button } from "../../components/ui/button";
import { improvePost, summarizePost } from "../../services/gemini";

/* ================= IMAGE COMPRESSION ================= */
export const compressImage = (file, maxWidth = 1000, quality = 0.8) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result);
          r.readAsDataURL(blob);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
  });

/* ================= TAB BUTTON ================= */
export function TabButton({ active, children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded text-sm ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground"
      } ${className}`}
    >
      {children}
    </button>
  );
}

/* ================= COMMENTS ================= */
export function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!postId) return;

    const q = collection(db, "posts", postId, "comments");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsubscribe();
  }, [postId]);

  const addComment = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    await addDoc(collection(db, "posts", postId, "comments"), {
      text: trimmed,
      authorEmail: auth.currentUser?.email || "unknown",
      createdAt: serverTimestamp(),
    });

    setText("");
  };

  return (
    <div className="mt-4 space-y-3 bg-black/40 border border-white/10 rounded-lg p-3">
      {/* COMMENTS LIST */}
      {comments.map((c) => (
        <p key={c.id} className="text-xs text-gray-200">
          <span className="font-semibold text-white">
            {c.authorEmail}
          </span>
          : {c.text}
        </p>
      ))}

      {/* COMMENT INPUT */}
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="
            flex-1
            bg-black
            text-white
            border border-white/20
            rounded-md
            px-3 py-2
            text-sm
            placeholder-gray-400
            focus:outline-none
            focus:ring-2
            focus:ring-green-500
          "
        />

        <Button size="sm" onClick={addComment}>
          Send
        </Button>
      </div>
    </div>
  );
}

/* ================= FULLSCREEN IMAGE VIEWER ================= */
export function useImageViewer() {
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const ImageModal = () =>
    fullscreenImage ? (
      <div
        className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center overflow-auto"
        onClick={() => setFullscreenImage(null)}
      >
        <img
          src={fullscreenImage}
          alt="fullscreen"
          className="max-h-[90vh] max-w-[90vw]"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    ) : null;

  return { fullscreenImage, setFullscreenImage, ImageModal };
}
