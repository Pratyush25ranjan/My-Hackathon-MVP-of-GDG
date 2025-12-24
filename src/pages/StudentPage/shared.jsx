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
import {
  improvePost,
  summarizePost,
} from "../../services/gemini";

/* image compression */
export const compressImage = (file, maxWidth = 1000, quality = 0.8) =>
  new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => (img.src = e.target.result);
    reader.readAsDataURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = maxWidth / img.width;

      canvas.width = maxWidth;
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
  });

export function TabButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded text-sm ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const q = collection(db, "posts", postId, "comments");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((d) => d.data()));
    });
    return () => unsubscribe();
  }, [postId]);

  const addComment = async () => {
    if (!text.trim()) return;

    await addDoc(collection(db, "posts", postId, "comments"), {
      text,
      authorEmail: auth.currentUser.email,
      createdAt: serverTimestamp(),
    });

    setText("");
  };

  return (
    <div className="space-y-2">
      {comments.map((c, i) => (
        <p key={i} className="text-xs">
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
