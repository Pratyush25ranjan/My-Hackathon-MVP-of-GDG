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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { compressImage } from "../StudentPage/shared";

export default function AdmClubCommunity({ posts, adminUser, setFullscreenImage }) {
  const [club, setClub] = useState("all");
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);

  // Only this admin's posts, optionally filtered by club
  const filtered = posts.filter((p) => {
    const isMine = p.authorUid === auth.currentUser?.uid;
    if (!isMine) return false;

    if (club === "all") return true;
    const postClub = (p.club || "").toLowerCase();
    return postClub === club;
  });

  const resetForm = () => {
    setPostText("");
    setPostImage(null);
    setOriginalImage(null);
    setEditingId(null);
  };

  const handleCreateOrUpdate = async () => {
    if (!postText.trim()) return;
    if (!adminUser) return;
    if (club === "all") {
      alert("Please select a club before creating a post.");
      return;
    }

    let image = originalImage || null;

    if (postImage) {
      image = await compressImage(postImage);
    }

    if (editingId) {
      // update existing post
      await updateDoc(doc(db, "posts", editingId), {
        text: postText,
        image,
        club,
        updatedAt: serverTimestamp(),
      });
    } else {
      // create new post
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
        club: club, // "nex" | "gdgc" | "gfg"
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
      {/* create / edit club post */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? "Edit Club Post" : "Create Club Post"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground block">
              Select Club
            </label>
            <select
              className="border p-2 rounded w-full"
              value={club}
              onChange={(e) => setClub(e.target.value)}
            >
              <option value="all">-- Select Club --</option>
              <option value="nex">Nexus</option>
              <option value="gdgc">GDGC</option>
              <option value="gfg">GFG</option>
            </select>
          </div>

          <Textarea
            placeholder="Write an announcement or update for this club..."
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
          />

          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setPostImage(e.target.files?.[0] || null)}
          />

          {/* show current image while editing */}
          {editingId && originalImage && (
            <img
              src={originalImage}
              className="max-h-40 rounded border"
              alt="current"
            />
          )}

          <div className="flex gap-2">
            <Button onClick={handleCreateOrUpdate} className="flex-1">
              {editingId ? "Update Post" : "Create Post"}
            </Button>
            {editingId && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={resetForm}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* list of my posts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">My Club Posts</h2>
          <select
            className="border p-2 rounded"
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
          <Card key={p.id}>
            <CardContent className="px-5 py-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(p.authorProfileImageBase64 || p.authorPhoto) && (
                    <img
                      src={p.authorProfileImageBase64 || p.authorPhoto}
                      alt="author"
                      className="w-5 h-5 rounded-full object-cover border border-border"
                    />
                  )}
                  <p className="font-medium">
                    {p.authorEmail} •{" "}
                    <span className="text-xs uppercase text-muted-foreground">
                      {p.club || "No club tag"}
                    </span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(p)}
                  >
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

              <p>{p.text}</p>

              {p.image && (
                <img
                  src={p.image}
                  className="max-h-64 rounded cursor-pointer"
                  onClick={() => setFullscreenImage(p.image)}
                />
              )}
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No posts yet for this club.
          </p>
        )}
      </div>
    </div>
  );
}
