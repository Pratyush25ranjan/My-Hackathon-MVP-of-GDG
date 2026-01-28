// src/pages/StudentPage/NewsDashboard.jsx
import { useState } from "react";
import DarkCard from "../../components/ui/DarkCard";
import { Button } from "../../components/ui/button";
import { summarizePost } from "../../services/gemini";
import AIResultModal from "../../components/AIResultModal";
import { useImageViewer } from "./shared";

export default function NewsDashboard({ news }) {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryText, setSummaryText] = useState("");

  const { setFullscreenImage, ImageModal } = useImageViewer();

  return (
    <>
      <div className="max-w-3xl space-y-6">
        {news.length === 0 && (
          <p className="text-sm text-gray-400">
            No official announcements yet.
          </p>
        )}

        {news.map((n) => (
          <DarkCard key={n.id}>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold">
                A
              </div>

              <div>
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-gray-400">
                  {n.createdAt?.toDate()?.toLocaleString()}
                </p>
              </div>
            </div>

            <p className="mb-2">{n.text}</p>

            {n.image && (
              <img
                src={n.image}
                className="rounded max-h-64 cursor-pointer hover:scale-105 transition"
                onClick={() => setFullscreenImage(n.image)}
                alt="announcement"
              />
            )}

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={async () => {
                if (!n.text) return;
                const summary = await summarizePost(n.text);
                if (!summary) return;
                setSummaryText(summary);
                setSummaryOpen(true);
              }}
            >
              🧠 AI Summary
            </Button>
          </DarkCard>
        ))}
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