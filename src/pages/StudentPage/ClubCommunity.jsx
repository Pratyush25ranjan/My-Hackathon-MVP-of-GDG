// src/pages/StudentPage/ClubCommunity.jsx
import { Button } from "../../components/ui/button";
import DarkCard from "../../components/ui/DarkCard";
import { summarizePost } from "../../services/gemini";
import AIResultModal from "../../components/AIResultModal";
import { useState } from "react";
import { useImageViewer } from "./shared";

const CLUB_LABELS = {
  nex: "Nexus",
  gdgc: "GDGC",
  gfg: "GFG",
};

export default function ClubCommunity({
  posts,
  user,
  toggleLike,
  navigate,
  Comments,
  dept,
  setDept,
}) {
  const filteredPosts = posts.filter((p) => {
    if (dept === "all") return true;
    const postClub = (p.club || "").toLowerCase();
    return postClub === dept;
  });

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryText, setSummaryText] = useState("");

  const { setFullscreenImage, ImageModal } = useImageViewer();

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">

          {/* CLUB FILTER */}
          <DarkCard>
            <label className="text-sm mb-2 block text-gray-300">
              Filter by Club
            </label>

            <select
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
            >
              <option value="all">All Clubs</option>
              <option value="nex">Nexus</option>
              <option value="gdgc">GDGC</option>
              <option value="gfg">GFG</option>
            </select>
          </DarkCard>

          {/* POSTS */}
          {filteredPosts.map((post) => (
            <DarkCard key={post.id}>
              <div
                className="flex items-center gap-3 cursor-pointer mb-2"
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

                <div className="flex flex-col">
                  {post.club && (
                    <span className="text-xs uppercase font-semibold text-green-400">
                      {CLUB_LABELS[post.club] || post.club}
                    </span>
                  )}
                  <span className="text-xs text-gray-300">
                    {post.authorEmail}
                  </span>
                </div>
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

              <div className="flex gap-4 items-center mt-3">
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

      {/* AI Summary Modal */}
      <AIResultModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        title="Summarized Result by AI"
        text={summaryText}
      />

      {/* Fullscreen Image */}
      <ImageModal />
    </>
  );
}