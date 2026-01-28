// src/pages/AdminPage/AdmClubCommunity.jsx
import { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import DarkCard from "../../components/ui/DarkCard";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { compressImage } from "../StudentPage/shared";

export default function AdmClubCommunity({
  posts,
  adminUser,
  setFullscreenImage,
}) {
  const [club, setClub] = useState("all");
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);

  /* ---------------- FILTER POSTS ---------------- */
  const filtered = posts.filter((p) => {
    const isMine = p.authorUid === auth.currentUser?.uid;
    if (!isMine) return false;

    if (club === "all") return true;
    return (p.club || "").toLowerCase() === club;
  });

  const resetForm = () => {
    setPostText("");
    setPostImage(null);
    setOriginalImage(null);
    setEditingId(null);
    setClub("all");
  };

  /* ---------------- CREATE / UPDATE ---------------- */
  const handleCreateOrUpdate = async () => {
    if (!postText.trim() || !adminUser) return;
    if (club === "all") {
      alert("Please select a club.");
      return;
    }

    let image = originalImage || null;
    if (postImage) image = await compressImage(postImage);

    if (editingId) {
      await updateDoc(doc(db, "posts", editingId), {
        text: postText,
        image,
        club,
        updatedAt: serverTimestamp(),
      });
    } else {
      await addDoc(collection(db, "posts"), {
        text: postText,
        image,
        authorUid: auth.currentUser.uid,
        authorEmail: adminUser.email,
        authorProfileImageBase64: adminUser.profileImageBase64 || null,
        authorName: `${adminUser.firstName} ${adminUser.lastName}`,
        authorDept: (adminUser.department || "").toLowerCase(),
        authorYear: adminUser.year || "",
        authorRole: "admin",
        club,
        scope: "clubs",
        createdAt: serverTimestamp(),
        likes: [],
      });
    }

    resetForm();
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setPostText(p.text || "");
    setOriginalImage(p.image || null);
    setPostImage(null);
    setClub((p.club || "all").toLowerCase());
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this club post?")) return;
    await deleteDoc(doc(db, "posts", id));
  };

  return (
    <div className="space-y-6">
      {/* CREATE / EDIT */}
      <DarkCard>
        <h2 className="text-lg font-semibold mb-3">
          {editingId ? "Edit Club Post" : "Create Club Post"}
        </h2>

        <div className="space-y-3">
          <select
            className="w-full rounded bg-zinc-900 border border-white/20 p-2 text-white"
            value={club}
            onChange={(e) => setClub(e.target.value)}
          >
            <option value="all">-- Select Club --</option>
            <option value="nex">Nexus</option>
            <option value="gdgc">GDGC</option>
            <option value="gfg">GFG</option>
          </select>

          <Textarea
            placeholder="Write an update for this club..."
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />

          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setPostImage(e.target.files?.[0] || null)}
          />

          {editingId && originalImage && (
            <img
              src={originalImage}
              className="max-h-40 rounded border border-white/20"
              alt="current"
            />
          )}

          <div className="flex gap-2">
            <Button onClick={handleCreateOrUpdate} className="flex-1">
              {editingId ? "Update Post" : "Create Post"}
            </Button>

            {editingId && (
              <Button variant="outline" className="flex-1" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </DarkCard>

      {/* MY POSTS */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">My Club Posts</h2>

          <select
            className="rounded bg-black/40 border border-white/20 p-2 text-white"
            value={club}
            onChange={(e) => setClub(e.target.value)}
          >
            <option value="all">All Clubs</option>
            <option value="nex">Nexus</option>
            <option value="gdgc">GDGC</option>
            <option value="gfg">GFG</option>
          </select>
        </div>

        {filtered.map((p) => (
          <DarkCard key={p.id}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                {(p.authorProfileImageBase64 || p.authorPhoto) && (
                  <img
                    src={p.authorProfileImageBase64 || p.authorPhoto}
                    className="w-6 h-6 rounded-full object-cover border border-white/20"
                    alt="author"
                  />
                )}
                <p className="text-sm">
                  {p.authorEmail} •{" "}
                  <span className="uppercase text-xs text-white/60">
                    {p.club}
                  </span>
                </p>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(p)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(p.id)}
                >
                  Delete
                </Button>
              </div>
            </div>

            <p className="text-white/90">{p.text}</p>

            {p.image && (
              <img
                src={p.image}
                className="mt-3 max-h-64 rounded cursor-pointer"
                onClick={() => setFullscreenImage(p.image)}
                alt="post"
              />
            )}
          </DarkCard>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm text-white/60">
            No posts yet for this club.
          </p>
        )}
      </div>
    </div>
  );
}