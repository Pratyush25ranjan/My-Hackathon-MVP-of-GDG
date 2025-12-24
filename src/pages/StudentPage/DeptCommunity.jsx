// src/pages/StudentPage/DeptCommunity.jsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { improvePost, summarizePost } from "../../services/gemini";
import AIResultModal from "../../components/AIResultModal";
import { useState } from "react";

export default function DeptCommunity({
  posts,
  user,
  postText,
  setPostText,
  postImage,
  setPostImage,
  createPost,
  toggleLike,
  navigate,
  Comments,
  dept,
  setDept,
}) {
  const filteredPosts = posts.filter((p) => {
    if (dept === "all") return true;
    const postDept = (p.department || p.authorDept || "").toLowerCase();
    return postDept === dept;
  });

  const [aiOpen, setAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryText, setSummaryText] = useState("");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Create Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              placeholder="Write something..."
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setPostImage(e.target.files?.[0] || null)}
            />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={createPost}>
                Post
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={async () => {
                  if (!postText.trim()) return;

                  try {
                    console.log("AI button clicked, text =", postText);
                    const improved = await improvePost(postText);
                    console.log("AI result =", improved);
                    if (!improved) return;
                    setAiText(improved);
                    setAiOpen(true);
                  } catch (err) {
                    console.error("AI error in improvePost:", err);
                  }
                }}
              >
                ✨ Improve with AI
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* department filter */}
        <div className="border p-2 rounded bg-background">
          <label className="text-xs text-muted-foreground block mb-1">
            Filter by Department
          </label>
          <select
            className="border p-2 rounded w-full"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="cs">CSE</option>
            <option value="it">IT</option>
            <option value="ee">EE</option>
            <option value="ece">ECE</option>
            <option value="me">ME</option>
            <option value="ce">CE (Civil Engineering)</option>
            <option value="che">CE (Chemical Engineering)</option>
            <option value="ipe">IPE</option>
            <option value="aiml">AIML</option>
            <option value="anim">ANIM</option>
          </select>
        </div>

        {filteredPosts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/chat/${post.authorUid}`)}
              >
                {post.authorProfileImageBase64 ? (
                  <img
                    src={post.authorProfileImageBase64}
                    className="h-8 w-8 rounded-full object-cover hover:scale-110 transition"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {post.authorEmail[0].toUpperCase()}
                  </div>
                )}
                <CardTitle className="text-sm hover:underline">
                  {post.authorEmail}
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              <p>{post.text}</p>

              {post.image && (
                <img
                  src={post.image}
                  className="rounded max-h-64 cursor-pointer hover:scale-105 transition"
                />
              )}

              <div className="flex gap-3 items-center">
                <button
                  className="text-sm"
                  onClick={() => toggleLike(post)}
                >
                  ❤️ {post.likes.length}
                </button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!post.text) return;
                    const summary = await summarizePost(post.text);
                    if (!summary) return;
                    setSummaryText(summary);
                    setSummaryOpen(true);
                  }}
                >
                  🧠 AI Summary
                </Button>
              </div>

              <Comments postId={post.id} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI modal for Improve with AI */}
      <AIResultModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        title="AI Result"
        helper="Select, copy, and paste in the Post section."
        text={aiText}
      />

      {/* AI modal for Summary */}
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
