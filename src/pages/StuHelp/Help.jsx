// src/pages/StuHelp/Help.jsx
import { useState } from "react";
import FeedbackComplaints from "./FeedbackCumComplaints";
import LostAndFound from "./LostFoundStuPage";
import StudyMaterials from "./StudyStuff";
import DarkCard from "../../components/ui/DarkCard";

export default function Help({ role }) {
  const [activeTab, setActiveTab] = useState("feedback");

  return (
    <div className="space-y-6">

      {/* SUB TABS */}
      <DarkCard>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-4 py-2 rounded-md text-sm transition ${
              activeTab === "feedback"
                ? "bg-green-500 text-black"
                : "bg-black/40 text-white hover:bg-white/10"
            }`}
          >
            Feedback & Complaints
          </button>

          <button
            onClick={() => setActiveTab("lost")}
            className={`px-4 py-2 rounded-md text-sm transition ${
              activeTab === "lost"
                ? "bg-green-500 text-black"
                : "bg-black/40 text-white hover:bg-white/10"
            }`}
          >
            Lost & Found
          </button>

          <button
            onClick={() => setActiveTab("study")}
            className={`px-4 py-2 rounded-md text-sm transition ${
              activeTab === "study"
                ? "bg-green-500 text-black"
                : "bg-black/40 text-white hover:bg-white/10"
            }`}
          >
            Study Materials
          </button>
        </div>
      </DarkCard>

      {/* CONTENT */}
      {activeTab === "feedback" && (
        <DarkCard>
          <FeedbackComplaints role={role} />
        </DarkCard>
      )}

      {activeTab === "lost" && (
        <DarkCard>
          <LostAndFound role={role} />
        </DarkCard>
      )}

      {activeTab === "study" && (
        <DarkCard>
          <StudyMaterials role={role} />
        </DarkCard>
      )}
    </div>
  );
}