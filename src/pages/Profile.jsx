// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

import { auth, db } from "../services/firebase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";

export default function Profile() {
  const navigate = useNavigate();
  const uid = auth.currentUser.uid;
  const email = auth.currentUser.email;

  /* ---------------- STATES ---------------- */
  const [tab, setTab] = useState("details");
  const [user, setUser] = useState(null);
  const isLocked = user?.verified === true;

  const [previewImage, setPreviewImage] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [filterMonth, setFilterMonth] = useState("");

  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editImage, setEditImage] = useState(null);

  const DEPT_LABELS = {
    it: "IT",
    cs: "CSE",
    ee: "EE",
    ece: "ECE",
    me: "ME",
    ipe: "IPE",
    che: "CHE",
    ce: "CE",
    aiml: "AIML",
    anim: "ANIM",
  };

  /* ---------------- IMAGE COMPRESSION ---------------- */
  const compressImage = (file, maxWidth = 900, quality = 0.8) =>
    new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => (img.src = e.target.result);
      reader.readAsDataURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(maxWidth / img.width, 1);

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
    });

  /* ---------------- LOAD PROFILE ---------------- */
  useEffect(() => {
    const loadProfile = async () => {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const data = snap.data();
        setUser(data);
        setPreviewImage(data.profileImageBase64 || null);
      }
    };
    loadProfile();
  }, [uid]);

  /* ---------------- LOAD MY POSTS (by uid) ---------------- */
  useEffect(() => {
    if (tab !== "posts") return;

    const loadPosts = async () => {
      const q = query(collection(db, "posts"), where("authorUid", "==", uid));
      const snap = await getDocs(q);
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    loadPosts();
  }, [tab, uid]);

  /* ---------------- SORT + FILTER ---------------- */
  const visiblePosts = posts
    .filter((p) => {
      if (!filterMonth) return true;
      const date =
        p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
      const m = date.getMonth() + 1;
      return String(m) === filterMonth;
    })
    .sort((a, b) => {
      const da =
        a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const db_ =
        b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);

      if (sortBy === "newest") return db_ - da;
      if (sortBy === "oldest") return da - db_;
      if (sortBy === "likes")
        return (b.likes?.length || 0) - (a.likes?.length || 0);
      if (sortBy === "comments")
        return (b.commentCount || 0) - (a.commentCount || 0);
      return 0;
    });

  /* ---------------- HANDLERS ---------------- */
  const handleProfileImageChange = async (file) => {
    if (!file) return;
    const img = await compressImage(file);
    setPreviewImage(img);
  };

  const saveProfile = async () => {
    try {
      if (!previewImage) {
        alert("No image selected");
        return;
      }

      // 1) update user document
      await updateDoc(doc(db, "users", uid), {
        profileImageBase64: previewImage,
      });

      // 2) update all posts by this user so admin/student feeds see new pic
      const q = query(collection(db, "posts"), where("authorUid", "==", uid));
      const snap = await getDocs(q);

      await Promise.all(
        snap.docs.map((d) =>
          updateDoc(d.ref, {
            authorProfileImageBase64: previewImage,
          })
        )
      );

      alert("Profile picture updated successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  const deletePost = async (postId) => {
    await deleteDoc(doc(db, "posts", postId));
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const saveEdit = async (id) => {
    const data = { text: editText };
    if (editImage) data.image = editImage;

    await updateDoc(doc(db, "posts", id), data);

    setEditingPostId(null);
    setEditImage(null);
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (!user) return null;

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-muted/40">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-background border-b">
        <button onClick={() => navigate(-1)}>← Back</button>
        <h1 className="font-bold text-xl">Your Profile</h1>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>

      {/* TABS */}
      <div className="flex gap-4 px-6 py-3 bg-background border-b">
        <TabButton active={tab === "details"} onClick={() => setTab("details")}>
          Personal Details
        </TabButton>
        <TabButton active={tab === "posts"} onClick={() => setTab("posts")}>
          Your Posts
        </TabButton>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {/* ========== DETAILS ========== */}
        {tab === "details" && user && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              {/* Profile Image (ONLY editable field) */}
              <div className="flex flex-col items-center gap-3">
                <img
                  src={previewImage}
                  onClick={() =>
                    previewImage && setFullscreenImage(previewImage)
                  }
                  className="h-24 w-24 rounded-full object-cover cursor-pointer"
                />

                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleProfileImageChange(e.target.files[0])
                  }
                />

                <p className="text-xs text-muted-foreground text-center">
                  You can update your profile picture from here.
                  <br />
                  Other personal details are locked after verification.
                </p>
              </div>

              {/* LOCKED FIELDS */}
              <Input value={user.firstName || ""} disabled />
              <Input value={user.lastName || ""} disabled />
              <Input value={email || ""} disabled />
              <Input value={DEPT_LABELS[user.department] || ""} disabled />
              <Input value={user.year || ""} disabled />

              {/* Save button (image only) */}
              <Button onClick={saveProfile} className="w-full">
                Save Profile Picture
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ========== POSTS ========== */}
        {tab === "posts" && (
          <>
            {/* SORT + FILTER */}
            <div className="flex gap-3 mb-4">
              <select
                value={sortBy || "newest"}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="likes">Most Liked</option>
                <option value="comments">Most Commented</option>
              </select>

              <select
                value={filterMonth || ""}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="">All Months</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "short",
                    })}
                  </option>
                ))}
              </select>
            </div>

            {visiblePosts.map((post) => (
              <Card key={post.id} className="mb-6">
                <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                  {/* LEFT */}
                  <div className="lg:col-span-2 space-y-3">
                    {editingPostId === post.id ? (
                      <>
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const img = await compressImage(
                              e.target.files[0]
                            );
                            setEditImage(img);
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => saveEdit(post.id)}
                        >
                          Save
                        </Button>
                      </>
                    ) : (
                      <p>{post.text}</p>
                    )}

                    {post.image && (
                      <img
                        src={post.image}
                        className="rounded max-h-64 cursor-pointer"
                        onClick={() => setFullscreenImage(post.image)}
                      />
                    )}

                    <div className="flex justify-between text-xs">
                      <span>❤️ {post.likes?.length || 0}</span>
                      <div className="space-x-3">
                        <button
                          onClick={() => {
                            setEditingPostId(post.id);
                            setEditText(post.text);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-500"
                          onClick={() => deletePost(post.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <CommentsPanel postId={post.id} />
                </CardContent>
              </Card>
            ))}
          </>
        )}
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

/* ---------------- COMMENTS PANEL ---------------- */
function CommentsPanel({ postId }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(
        collection(db, "posts", postId, "comments")
      );
      setComments(snap.docs.map((d) => d.data()));
    };
    load();
  }, [postId]);

  return (
    <div className="border-l pl-4 max-h-[400px] overflow-y-auto">
      <h4 className="font-semibold text-sm mb-2">Comments</h4>
      {comments.map((c, i) => (
        <div key={i}>
          <p className="text-xs font-medium">{c.authorEmail}</p>
          <p className="text-xs text-muted-foreground">{c.text}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------------- TAB BUTTON ---------------- */
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
