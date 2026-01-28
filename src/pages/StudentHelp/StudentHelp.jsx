import { useState } from "react";
import FeedbackComplaints from "./FeedbackComplaints";
import LostAndFound from "./LostAndFound";
import StudyMaterials from "./StudyMaterials";
import { Button } from "../../components/ui/button";

const StudentHelp = ({ role }) => {
  const [activeTab, setActiveTab] = useState("feedback");

  return (
    <div className="space-y-6">
      <div className="flex gap-3 px-6 py-3 rounded-lg bg-black/40 border border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.35)]">
        <Button
          variant={activeTab === "feedback" ? "default" : "outline"}
          onClick={() => setActiveTab("feedback")}
        >
          Feedback & Complaints
        </Button>

        <Button
          variant={activeTab === "lost" ? "default" : "outline"}
          onClick={() => setActiveTab("lost")}
        >
          Lost & Found
        </Button>

        <Button
          variant={activeTab === "study" ? "default" : "outline"}
          onClick={() => setActiveTab("study")}
        >
          Study Materials
        </Button>
      </div>

      <div className="px-6">
        {activeTab === "feedback" && (
          <div className="bg-black/40 border border-green-400 rounded-lg p-6 shadow-[0_0_20px_rgba(34,197,94,0.35)]">
            <FeedbackComplaints role={role} />
          </div>
        )}

        {activeTab === "lost" && (
          <div className="bg-black/40 border border-green-400 rounded-lg p-6 shadow-[0_0_20px_rgba(34,197,94,0.35)]">
            <LostAndFound role={role} />
          </div>
        )}

        {activeTab === "study" && (
          <div className="bg-black/40 border border-green-400 rounded-lg p-6 shadow-[0_0_20px_rgba(34,197,94,0.35)]">
            <StudyMaterials role={role} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHelp;