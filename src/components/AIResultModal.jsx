// src/components/AIResultModal.jsx
import { Button } from "./ui/button";

export default function AIResultModal({ open, title, helper, text, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-background max-w-lg w-full mx-4 rounded-md shadow-lg p-4 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        {helper && (
          <p className="text-xs text-muted-foreground">{helper}</p>
        )}

        <textarea
          className="w-full h-48 border rounded p-2 text-sm bg-muted"
          readOnly
          value={text}
        />

        <p className="text-[11px] text-muted-foreground">
          Tip: Select, copy, and paste this wherever you need.
        </p>

        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
