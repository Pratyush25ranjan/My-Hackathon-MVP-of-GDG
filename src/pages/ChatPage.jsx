import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { generateConversationResponse } from "../services/gemini";
import { auth, db } from "../services/firebase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import DarkCard from "../components/ui/DarkCard";

/* ---------- HELPERS ---------- */
function getRoomId(a, b) {
  return [a, b].sort().join("_");
}

function formatMessageTime(ts) {
  if (!ts) return "";
  try {
    return ts.toDate().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

const compressImage = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });

export default function ChatPage() {
  const { uid } = useParams();
  const me = auth.currentUser;

  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("messages");

  const [message, setMessage] = useState("");
  const [chatImage, setChatImage] = useState(null);

  const [messages, setMessages] = useState([]);
  const [posts, setPosts] = useState([]);

  const [fullscreenImage, setFullscreenImage] = useState(null);
  const bottomRef = useRef(null);

  /* ---------- LOAD USER ---------- */
  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, "users", uid)).then(
      (snap) => snap.exists() && setUser(snap.data())
    );
  }, [uid]);

  /* ---------- REALTIME CHAT ---------- */
  useEffect(() => {
    if (!me || !uid) return;

    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", me.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const serverMsgs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (m) =>
            m.participants?.includes(me.uid) &&
            m.participants?.includes(uid)
        )
        .sort(
          (a, b) =>
            (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
        );

      setMessages(serverMsgs);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    });

    return () => unsub();
  }, [me, uid]);

  /* ---------- LOAD POSTS ---------- */
  useEffect(() => {
    if (tab !== "posts" || !uid) return;

    const q = query(
      collection(db, "posts"),
      where("authorUid", "==", uid)
    );

    getDocs(q).then((snap) =>
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [tab, uid]);

  /* ---------- SEND MESSAGE ---------- */
  const sendMessage = async () => {
    if (!me) return;
    if (!message.trim() && !chatImage) return;

    const text = message;
    const imgFile = chatImage;
    const roomId = getRoomId(me.uid, uid);

    setMessage("");
    setChatImage(null);

    let image = null;
    if (imgFile) image = await compressImage(imgFile);

    await addDoc(collection(db, "messages"), {
      text,
      image,
      sender: me.uid,
      receiver: uid,
      roomId,
      participants: [me.uid, uid],
      createdAt: serverTimestamp(),
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <div className="max-w-6xl mx-auto flex gap-6">

        {/* LEFT PROFILE */}
        <DarkCard className="w-1/4 text-center space-y-4">
          <img
            src={user.profileImageBase64}
            className="h-24 w-24 rounded-full mx-auto cursor-pointer hover:scale-110 transition"
            onClick={() => setFullscreenImage(user.profileImageBase64)}
          />
          <div className="text-sm">
            <p className="font-semibold">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-zinc-400">
              {user.department.toUpperCase()} • Year {user.year}
            </p>
            <p className="text-zinc-500">{user.email}</p>
          </div>
        </DarkCard>

        {/* RIGHT */}
        <DarkCard className="flex-1">
          {/* TABS */}
          <div className="flex gap-3 mb-4">
            <TabButton active={tab === "messages"} onClick={() => setTab("messages")}>
              Messages
            </TabButton>
            <TabButton active={tab === "posts"} onClick={() => setTab("posts")}>
              Posts
            </TabButton>
          </div>

          {/* MESSAGES */}
          {tab === "messages" && (
            <>
              <div className="h-80 overflow-y-auto space-y-2 mb-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2 rounded-lg max-w-xs text-sm ${
                      m.sender === me.uid
                        ? "ml-auto bg-green-500/20 border border-green-400"
                        : "bg-zinc-800 border border-white/10"
                    }`}
                  >
                    {m.text && <p>{m.text}</p>}
                    {m.image && (
                      <img
                        src={m.image}
                        className="mt-2 rounded cursor-pointer"
                        onClick={() => setFullscreenImage(m.image)}
                      />
                    )}
                    <span className="block text-[10px] opacity-60 mt-1">
                      {formatMessageTime(m.createdAt)}
                    </span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* INPUT ROW */}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={async () => {
                    const ai = await generateConversationResponse(
                      message,
                      user.department
                    );
                    if (ai) setMessage(ai);
                  }}
                >
                  ✨ AI
                </Button>

                {/* 🔥 FIXED INPUT (TEXT VISIBILITY) */}
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="!text-black !caret-black placeholder:text-gray-400"
                />

                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setChatImage(e.target.files?.[0] || null)
                  }
                />

                <Button onClick={sendMessage}>Send</Button>
              </div>
            </>
          )}

          {/* POSTS */}
          {tab === "posts" && (
            <div className="space-y-4">
              {posts.map((p) => (
                <DarkCard key={p.id}>
                  <p>{p.text}</p>
                  {p.image && (
                    <img
                      src={p.image}
                      className="mt-2 rounded cursor-pointer"
                      onClick={() => setFullscreenImage(p.image)}
                    />
                  )}
                </DarkCard>
              ))}
            </div>
          )}
        </DarkCard>
      </div>

      {/* FULLSCREEN IMAGE */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage}
            className="max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

/* ---------- TAB BUTTON ---------- */
function TabButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-lg text-sm transition ${
        active
          ? "bg-green-500/20 border border-green-400"
          : "bg-zinc-800 border border-white/10 text-zinc-300"
      }`}
    >
      {children}
    </button>
  );
}