// src/pages/StudentPage/NewsDashboard.jsx
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { summarizePost } from "../../services/gemini";
import AIResultModal from "../../components/AIResultModal";
import { useImageViewer } from "./shared"; // <-- add this

export default function NewsDashboard({ news }) {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryText, setSummaryText] = useState("");

  // fullscreen image hook
  const { setFullscreenImage, ImageModal } = useImageViewer(); // <-- add this

  return (
    <>
      <div className="max-w-3xl space-y-4">
        {news.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No official announcements yet.
          </p>
        )}

        {news.map((n) => (
          <Card key={n.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  A
                </div>
                <div>
                  <CardTitle className="text-sm">Admin</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {n.createdAt?.toDate()?.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>{n.text}</p>

              {n.image && (
                <img
                  src={n.image}
                  className="rounded max-h-64 cursor-pointer hover:scale-105 transition"
                  onClick={() => setFullscreenImage(n.image)} // <-- fullscreen
                  alt="announcement"
                />
              )}

              <Button
                type="button"
                size="sm"
                variant="outline"
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
            </CardContent>
          </Card>
        ))}

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
