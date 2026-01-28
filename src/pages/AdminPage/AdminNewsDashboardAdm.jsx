// src/pages/AdminPage/AdmNewsDashboardAdm.jsx
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import DarkCard from "../../components/ui/DarkCard";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { compressImage } from "../StudentPage/shared";

export default function AdmNewsDashboardAdm() {
  const [news, setNews] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);

  /* ---------------- LOAD NEWS ---------------- */
  useEffect(() => {
    const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setNews(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  /* ---------------- CREATE NEWS ---------------- */
  const createNews = async () => {
    if (!text.trim()) return;

    let img = null;
    if (image) img = await compressImage(image);

    await addDoc(collection(db, "news"), {
      text,
      image: img,
      authorUid: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    });

    setText("");
    setImage(null);
  };

  /* ---------------- DELETE NEWS ---------------- */
  const deleteNews = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    await deleteDoc(doc(db, "news", id));
  };

  return (
    <div className="space-y-6">
      {/* CREATE ANNOUNCEMENT */}
      <DarkCard>
        <h2 className="text-lg font-semibold mb-3">
          Create Announcement
        </h2>

        <div className="space-y-3">
          <Textarea
            placeholder="Write an official announcement..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />

          <Button onClick={createNews}>Publish</Button>
        </div>
      </DarkCard>

      {/* ANNOUNCEMENTS LIST */}
      <div className="space-y-4">
        {news.map((n) => (
          <DarkCard key={n.id}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-white/60">
                  {n.createdAt?.toDate()?.toLocaleString()}
                </p>
              </div>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteNews(n.id)}
              >
                Delete
              </Button>
            </div>

            <p className="text-white/90">{n.text}</p>

            {n.image && (
              <img
                src={n.image}
                className="mt-3 max-h-64 rounded"
                alt="announcement"
              />
            )}
          </DarkCard>
        ))}

        {news.length === 0 && (
          <p className="text-sm text-white/60">
            No announcements yet.
          </p>
        )}
      </div>
    </div>
  );
}