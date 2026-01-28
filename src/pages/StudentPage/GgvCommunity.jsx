// src/pages/StudentPage/GgvCommunity.jsx
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import DarkCard from "../../components/ui/DarkCard";
import { improvePost, summarizePost } from "../../services/gemini";
import AIResultModal from "../../components/AIResultModal";
import { useState } from "react";
import { useImageViewer } from "./shared";

export default function GgvCommunity({
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
}) {
  const [aiOpen, setAiOpen] = useState(false);
  const [aiText, setAiText] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryText, setSummaryText] = useState("");

  const { setFullscreenImage, ImageModal } = useImageViewer();

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* CREATE POST */}
          <DarkCard>
            <h2 className="text-lg font-semibold mb-3">Create Post</h2>

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

            <div className="flex gap-3 mt-3">
              <Button className="flex-1" onClick={createPost}>
                Post
              </Button>

              <Button
                variant="secondary"
                className="flex-1"
                onClick={async () => {
                  if (!postText.trim()) return;
                  const improved = await improvePost(postText);
                  if (!improved) return;
                  setAiText(improved);
                  setAiOpen(true);
                }}
              >
                ✨ Improve with AI
              </Button>
            </div>
          </DarkCard>

          {/* POSTS */}
          {posts.map((post) => (
            <DarkCard key={post.id}>
              <div
                className="flex items-center gap-3 mb-2 cursor-pointer"
                onClick={() => navigate(`/chat/${post.authorUid}`)}
              >
                {post.authorProfileImageBase64 ? (
                  <img
                    src={post.authorProfileImageBase64}
                    className="h-8 w-8 rounded-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm">
                    {post.authorEmail[0].toUpperCase()}
                  </div>
                )}

                <span className="text-sm font-medium">
                  {post.authorEmail}
                </span>
              </div>

              <p className="mb-2">{post.text}</p>

              {post.image && (
                <img
                  src={post.image}
                  className="rounded max-h-64 cursor-pointer hover:scale-105 transition"
                  onClick={() => setFullscreenImage(post.image)}
                  alt=""
                />
              )}

              <div className="flex items-center gap-4 mt-3">
                <button
                  className="text-sm"
                  onClick={() => toggleLike(post)}
                >
                  ❤️ {post.likes?.length || 0}
                </button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
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
            </DarkCard>
          ))}
        </div>
      </div>

      <AIResultModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        title="AI Result"
        helper="Copy and paste into the post."
        text={aiText}
      />

      <AIResultModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        title="AI Summary"
        text={summaryText}
      />

      <ImageModal />
    </>
  );
}