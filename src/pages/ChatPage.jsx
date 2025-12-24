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
import { explainForStudents, generateConversationResponse } from "../services/gemini";
import { auth, db } from "../services/firebase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";

/* ---------- LOCAL MESSAGE ---------- */
function createLocalMessage({ text, image, sender, receiver, roomId }) {
  return {
    id: "local_" + Date.now(),
    text,
    image,
    sender,
    receiver,
    roomId,
    createdAt: { seconds: Date.now() / 1000 },
    __local: true,
  };
}

/* ---------- ROOM ID (SAFE) ---------- */
function getRoomId(a, b) {
  return [a, b].sort().join("_");
}

/* ---------- TIME FORMAT ---------- */
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

/* ---------- IMAGE COMPRESSION ---------- */
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

  /* ---------- AI HELP MESSAGE (Improve with AI) ---------- */
  const handleAIHelp = async () => {
    if (!message.trim()) return;

    try {
      const aiResponse = await generateConversationResponse(
        message,
        user?.department || "CSE"
      );

      if (!aiResponse) return;

      // Match your messages data structure
      const newMessage = createLocalMessage({
        text: aiResponse,
        sender: "AI",
        receiver: uid,
        roomId: getRoomId(me.uid, uid),
      });

      setMessages((prev) => [...prev, newMessage]);
      setMessage(""); // Clear input
    } catch (err) {
      console.error("AI conversation error:", err);
    }
  };

  /* ---------- DEBUG (optional) ---------- */
  useEffect(() => {
    if (!me || !uid) return;
    // console.log("ROOM ID:", getRoomId(me.uid, uid));
  }, [me, uid]);

  /* ---------- LOAD CHAT USER ---------- */
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
        .map((d) => ({
          id: d.id,
          ...d.data(),
        }))
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
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        50
      );
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

    const localMsg = createLocalMessage({
      text,
      image,
      sender: me.uid,
      receiver: uid,
      roomId,
    });

    setMessages((prev) => [...prev, localMsg]);

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
    <div className="min-h-screen bg-muted/40 p-6">
      <div className="max-w-6xl mx-auto bg-background border rounded-lg flex">
        {/* LEFT */}
        <div className="w-1/4 border-r p-4 text-center space-y-4">
          <img
            src={user.profileImageBase64}
            className="h-24 w-24 rounded-full mx-auto cursor-pointer hover:scale-110 transition"
            onClick={() => setFullscreenImage(user.profileImageBase64)}
          />
          <div className="text-sm">
            <p className="font-semibold">
              {user.firstName} {user.lastName}
            </p>
            <p>
              {user.department.toUpperCase()} • Year {user.year}
            </p>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-3/4 p-4">
          {/* TABS */}
          <div className="flex gap-4 mb-4">
            <TabButton
              active={tab === "messages"}
              onClick={() => setTab("messages")}
            >
              Messages
            </TabButton>
            <TabButton
              active={tab === "posts"}
              onClick={() => setTab("posts")}
            >
              Posts by @{user.firstName}
            </TabButton>
          </div>

          {/* MESSAGES */}
          {tab === "messages" && (
            <>
              <div className="h-80 overflow-y-auto space-y-2 mb-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2 rounded max-w-xs text-sm ${
                      m.sender === me.uid
                        ? "ml-auto bg-primary text-primary-foreground"
                        : m.sender === "AI"
                        ? "ml-auto bg-amber-100 text-black"
                        : "bg-muted"
                    }`}
                  >
                    {m.text && <p>{m.text}</p>}
                    {m.image && (
                      <img
                        src={m.image}
                        className="mt-2 rounded max-w-[200px] cursor-pointer hover:scale-105 transition"
                        onClick={() => setFullscreenImage(m.image)}
                      />
                    )}
                    <span className="block text-[10px] opacity-70 mt-1">
                      {formatMessageTime(m.createdAt)}
                    </span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleAIHelp}>
                  ✨ Improve with AI
                </Button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
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
                <Card key={p.id}>
                  <CardContent className="p-3">
                    <p>{p.text}</p>
                    {p.image && (
                      <img
                        src={p.image}
                        className="mt-2 rounded max-h-48 cursor-pointer hover:scale-105 transition"
                        onClick={() => setFullscreenImage(p.image)}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
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
      className={`px-4 py-2 rounded ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}
