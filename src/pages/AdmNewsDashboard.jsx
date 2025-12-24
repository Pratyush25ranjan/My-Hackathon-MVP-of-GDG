import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";

import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { improvePost, summarizePost } from "../services/gemini";
import AIResultModal from "../components/AIResultModal";

/* ================= IMAGE COMPRESSION ================= */
const compressImage = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const scale = MAX_WIDTH / img.width;

        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

export default function AdmNewsDashboard() {
  const [activeTab, setActiveTab] = useState("post"); // post | history

  const [news, setNews] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // AI modal for "Improve with AI" (admin post box)
  const [aiOpen, setAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");

  // AI modal for summary in history
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryText, setSummaryText] = useState("");

  /* ================= LOAD NEWS ================= */
  useEffect(() => {
    const q = query(
      collection(db, "news"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setNews(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });

    return () => unsub();
  }, []);

  /* ================= POST / UPDATE ================= */
  const postOrUpdate = async () => {
    if (!text.trim()) return;

    if (editingId) {
      await updateDoc(doc(db, "news", editingId), {
        text,
        image: image || null,
        editedAt: serverTimestamp(),
      });
      setEditingId(null);
    } else {
      await addDoc(collection(db, "news"), {
        text,
        image: image || null,
        createdAt: serverTimestamp(),
        authorName: "Admin",
      });
    }

    setText("");
    setImage(null);
  };

  /* ================= DELETE ================= */
  const deleteNews = async (id) => {
    if (!confirm("Delete this post?")) return;
    await deleteDoc(doc(db, "news", id));
  };

  return (
    <div className="space-y-6">
      {/* ================= INTERNAL TABS ================= */}
      <div className="flex gap-4">
        <Button
          variant={activeTab === "post" ? "default" : "outline"}
          onClick={() => setActiveTab("post")}
        >
          Post News
        </Button>

        <Button
          variant={activeTab === "history" ? "default" : "outline"}
          onClick={() => setActiveTab("history")}
        >
          Post History
        </Button>
      </div>

      {/* ================= POST TAB ================= */}
      {activeTab === "post" && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <Textarea
              placeholder="Write official college news..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const compressed = await compressImage(file);
                setImage(compressed);
              }}
            />

            {image && (
              <img
                src={image}
                className="max-h-48 rounded border"
              />
            )}

            <div className="flex gap-3">
              <Button onClick={postOrUpdate}>
                {editingId ? "Update Post" : "Post News"}
              </Button>

              {editingId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setText("");
                    setImage(null);
                  }}
                >
                  Cancel
                </Button>
              )}

              {/* Improve with AI for admin post */}
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  if (!text.trim()) return;
                  try {
                    const improved = await improvePost(text);
                    if (!improved) return;
                    setAiText(improved);
                    setAiOpen(true); // show modal
                  } catch (err) {
                    console.error("AI error in improvePost (admin):", err);
                  }
                }}
              >
                ✨ Improve with AI
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ================= HISTORY TAB ================= */}
      {activeTab === "history" && (
        <div className="grid gap-4">
          {news.map((n) => (
            <Card key={n.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{n.authorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {n.createdAt?.toDate()?.toLocaleString()}
                      {n.editedAt && " (edited)"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setActiveTab("post");
                        setEditingId(n.id);
                        setText(n.text);
                        setImage(n.image || null);
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteNews(n.id)}
                    >
                      Delete
                    </Button>

                    {/* AI Summary for admin history item */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (!n.text) return;
                        try {
                          const summary = await summarizePost(n.text);
                          if (!summary) return;
                          setSummaryText(summary);
                          setSummaryOpen(true);
                        } catch (err) {
                          console.error(
                            "AI error in summarizePost (admin history):",
                            err
                          );
                        }
                      }}
                    >
                      🧠 AI Summary
                    </Button>
                  </div>
                </div>

                <p>{n.text}</p>

                {n.image && (
                  <img
                    src={n.image}
                    className="max-h-64 rounded border"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for Improve with AI (admin post editor) */}
      <AIResultModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        title="AI Result"
        helper="Select, copy, and paste in the Post section."
        text={aiText}
      />

      {/* Modal for AI Summary in history */}
      <AIResultModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        title="Summarized Result by AI"
        helper=""
        text={summaryText}
      />
    </div>
  );
}
