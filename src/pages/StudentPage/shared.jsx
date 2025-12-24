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
import { Input } from "../../components/ui/input";
import { improvePost, summarizePost } from "../../services/gemini";

/* image compression */
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
    <div className="space-y-2">
      {comments.map((c) => (
        <p key={c.id} className="text-xs">
          <b>{c.authorEmail}</b>: {c.text}
        </p>
      ))}

      <div className="flex gap-1">
        <Input
          placeholder="Comment"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button size="sm" onClick={addComment}>
          Send
        </Button>
      </div>
    </div>
  );
}

// Reusable fullscreen image viewer
export function useImageViewer() {
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const ImageModal = () =>
    fullscreenImage ? (
      <div
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
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
