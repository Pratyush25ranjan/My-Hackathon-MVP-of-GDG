import { useState } from "react";
import FeedbackComplaints from "./FeedbackCumComplaints";
import LostAndFound from "./LostFoundStuPage";
import StudyMaterials from "./StudyStuff";
import { Button } from "../../components/ui/button";

export default function Help({ role }) {
  const [activeTab, setActiveTab] = useState("feedback");

  return (
    <div className="space-y-6">
      {/* SUB-TABS */}
      <div className="flex gap-3 px-6 py-3 bg-background border-b">
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

      {/* CONTENT */}
      <div className="px-6">
        {activeTab === "feedback" && (
          <div className="bg-background border rounded-lg p-6">
            <FeedbackComplaints role={role} />
          </div>
        )}

        {activeTab === "lost" && (
          <div className="bg-background border rounded-lg p-6">
            <LostAndFound role={role} />
          </div>
        )}

        {activeTab === "study" && (
          <div className="bg-background border rounded-lg p-6">
            <StudyMaterials role={role} />
          </div>
        )}
      </div>
    </div>
  );
}
