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
        {/* Heading */}
        <h2 className="text-lg font-semibold text-black">
          {title}
        </h2>

        {/* Helper text */}
        {helper && (
          <p className="text-xs text-black">
            {helper}
          </p>
        )}

        {/* Result text */}
        <textarea
          className="w-full h-48 border rounded p-2 text-sm bg-muted text-black"
          readOnly
          value={text}
        />

        {/* Tip */}
        <p className="text-[11px] text-black">
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
