import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebase";
import { Button } from "../../components/ui/button";
import { compressImage } from "../StudentPage/shared";
import { updateDoc } from "firebase/firestore";

const LostAndFound = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("new");

  // form
  const [type, setType] = useState("lost");
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // data
  const [allPosts, setAllPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [userCache, setUserCache] = useState({});
const [editingId, setEditingId] = useState(null);
const [editDescription, setEditDescription] = useState("");
const [editImage, setEditImage] = useState(null);
  // image compress
  const handleImageChange = async (file) => {
    if (!file) return;
    const compressed = await compressImage(file);
    setImage(compressed);
    setPreview(compressed);
  };
const saveEdit = async (id) => {
  const data = { description: editDescription };
  if (editImage) data.image = editImage;

  await updateDoc(doc(db, "lostAndFound", id), data);

  setEditingId(null);
  setEditImage(null);
};

  // submit
  const submitItem = async () => {
    if (!itemName || !description || !location) {
      alert("Fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "lostAndFound"), {
        type,
        itemName,
        description,
        location,
        date: date || null,
        image: image || null,
        createdAt: serverTimestamp(),

        // 🔥 MUST MATCH FIRESTORE RULES
        studentUid: auth.currentUser.uid,
        studentEmail: auth.currentUser.email,
      });

      setItemName("");
      setDescription("");
      setLocation("");
      setDate("");
      setImage(null);
      setPreview(null);
      setType("lost");

      alert("Post submitted");
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  // fetch user profile (cached)
  const getUser = async (uid) => {
    if (userCache[uid]) return userCache[uid];

    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;

    setUserCache((prev) => ({ ...prev, [uid]: snap.data() }));
    return snap.data();
  };

  // all posts
  useEffect(() => {
    const q = query(
      collection(db, "lostAndFound"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      for (const p of posts) {
        if (!userCache[p.studentUid]) {
          await getUser(p.studentUid);
        }
      }

      setAllPosts(posts);
    });

    return () => unsub();
  }, []);

  // my posts
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "lostAndFound"),
      where("studentUid", "==", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      setMyPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);


  const deletePost = async (id) => {
    if (!confirm("Delete this post?")) return;
    await deleteDoc(doc(db, "lostAndFound", id));
  };

  const openChat = (uid) => {
    navigate(`/chat/${uid}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Lost & Found Department</h2>

      {/* TABS */}
      <div className="flex gap-3">
        {["new", "all", "mine"].map((t) => (
          <Button
            key={t}
            variant={activeTab === t ? "default" : "outline"}
            onClick={() => setActiveTab(t)}
          >
            {t === "new" ? "New Post" : t === "all" ? "All Posts" : "My Posts"}
          </Button>
        ))}
      </div>

      {/* NEW */}
      {activeTab === "new" && (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex gap-3">
            {["lost", "found"].map((v) => (
              <Button
                key={v}
                variant={type === v ? "default" : "outline"}
                onClick={() => setType(v)}
              >
                {v}
              </Button>
            ))}
          </div>

          <input
            className="w-full border border-white/20 bg-zinc-900 text-white placeholder-white/50 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Item name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <textarea
            className="w-full border border-white/20 bg-zinc-900 text-white placeholder-white/50 p-2 rounded min-h-[100px] focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            className="w-full border border-white/20 bg-zinc-900 text-white placeholder-white/50 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <input
            type="date"
            className="w-full border border-white/20 bg-zinc-900 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e.target.files[0])}
          />

          {preview && (
            <img
              src={preview}
              className="h-32 rounded cursor-pointer border"
              onClick={() => setZoomImage(preview)}
            />
          )}

          <Button onClick={submitItem} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      )}

      {/* ALL POSTS */}
      {activeTab === "all" && (
        <div className="grid md:grid-cols-2 gap-4">
          {allPosts.map((p) => {
            const user = userCache[p.studentUid];

            return (
              <div key={p.id} className="border rounded-lg p-4 space-y-2">
                {/* PROFILE */}
                {user && (
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => openChat(p.studentUid)}
                  >
                    <img
                      src={user.profileImageBase64}
                      className="h-10 w-10 rounded-full border"
                    />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                )}

                <h3 className="font-semibold">
                  {p.itemName} ({p.type})
                </h3>

                <p>{p.description}</p>

                <p className="text-xs text-muted-foreground">
                  {p.location}
                </p>

                {p.image && (
                  <img
                    src={p.image}
                    className="h-28 rounded cursor-pointer border"
                    onClick={() => setZoomImage(p.image)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MY POSTS */}
{activeTab === "mine" && (
  <div className="grid md:grid-cols-2 gap-4">
    {myPosts.map((p) => (
      <div
        key={p.id}
        className="border rounded-lg p-4 space-y-3 bg-black text-white"
      >
        <h3 className="font-semibold">
          {p.itemName} ({p.type})
        </h3>

        {/* EDIT MODE */}
        {editingId === p.id ? (
          <>
            <textarea
              className="
                w-full
                bg-black
                text-white
                border border-white/20
                rounded
                p-2
                min-h-[100px]
              "
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />

            <input
              type="file"
              accept="image/*"
              className="text-white"
              onChange={async (e) => {
                const img = await compressImage(e.target.files[0]);
                setEditImage(img);
              }}
            />

            {editImage && (
              <img
                src={editImage}
                className="h-28 rounded border border-white/20"
                alt="preview"
              />
            )}

            <div className="flex gap-2">
              <Button size="sm" onClick={() => saveEdit(p.id)}>
                Save
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingId(null)}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <p>{p.description}</p>

            {/* ✅ IMAGE NOW VISIBLE */}
            {p.image && (
              <img
                src={p.image}
                className="h-28 rounded border border-white/20 cursor-pointer"
                onClick={() => setZoomImage(p.image)}
                alt="lost-found"
              />
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setEditingId(p.id);
                  setEditDescription(p.description);
                  setEditImage(null);
                }}
              >
                Edit
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => deletePost(p.id)}
              >
                Delete
              </Button>
            </div>
          </>
        )}
      </div>
    ))}
  </div>
)}


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
          />
        </div>
      )}
    </div>
  );
};

export default LostAndFound;
