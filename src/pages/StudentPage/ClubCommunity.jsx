// src/pages/StudentPage/ClubCommunity.jsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
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
  // Filter by club field
  const filteredPosts = posts.filter((p) => {
    if (dept === "all") return true;
    const postClub = (p.club || "").toLowerCase();
    return postClub === dept;
  });

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryText, setSummaryText] = useState("");

  // fullscreen image hook
  const { setFullscreenImage, ImageModal } = useImageViewer();

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-4">
          {/* club filter */}
          <div className="border p-2 rounded bg-background">
            <label className="text-xs text-muted-foreground block mb-1">
              Filter by Club
            </label>
            <select
              className="border p-2 rounded w-full"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
            >
              <option value="all">All Clubs</option>
              <option value="nex">Nexus</option>
              <option value="gdgc">GDGC</option>
              <option value="gfg">GFG</option>
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
                      alt={post.authorEmail}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {post.authorEmail[0].toUpperCase()}
                    </div>
                  )}

                <div className="flex flex-col">
  {post.club && (
    <span className="text-xs md:text-sm uppercase font-bold text-black">
      {CLUB_LABELS[post.club] || post.club}
    </span>
  )}
  <CardTitle className="text-[11px] md:text-xs font-normal">
    {post.authorEmail}
  </CardTitle>
</div>

                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                <p>{post.text}</p>

                {post.image && (
                  <img
                    src={post.image}
                    className="rounded max-h-64 cursor-pointer hover:scale-105 transition"
                    onClick={() => setFullscreenImage(post.image)}
                    alt="post"
                  />
                )}

                <div className="flex gap-3 items-center">
                  <button
                    className="text-sm"
                    onClick={() => toggleLike(post)}
                  >
                    ❤️ {post.likes?.length || 0}
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

        <AIResultModal
          open={summaryOpen}
          onClose={() => setSummaryOpen(false)}
          title="Summarized Result by AI"
          helper=""
          text={summaryText}
        />
      </div>

      {/* fullscreen image modal */}
      <ImageModal />
    </>
  );
}
