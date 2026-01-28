import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { Button } from "../../components/ui/button";
import { db } from "../../services/firebase";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomImage, setZoomImage] = useState(null);

  /* ---------------- LOAD FEEDBACKS ---------------- */
  useEffect(() => {
    const q = query(
      collection(db, "feedbackComplaints"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setFeedbacks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Admin feedback listener error:", err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  /* ---------------- DELETE ---------------- */
  const deleteFeedback = async (id) => {
    if (!confirm("Mark resolved & delete this feedback?")) return;
    await deleteDoc(doc(db, "feedbackComplaints", id));
  };

  /* ---------------- STATES ---------------- */
  if (loading) {
    return <div className="p-6 text-gray-400">Loading feedbacks...</div>;
  }

  if (feedbacks.length === 0) {
    return <div className="p-6 text-gray-400">No feedback yet.</div>;
  }

  /* ---------------- RENDER ---------------- */
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">
        Feedback & Complaints (Admin)
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        {feedbacks.map((f) => (
          <div
            key={f.id}
            className="
              bg-black
              text-white
              border border-white/20
              rounded-lg
              p-4
              space-y-2
            "
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-white">{f.title}</h3>
              <span className="text-xs px-2 py-1 rounded bg-white/10 text-white">
                {f.type}
              </span>
            </div>

            <p className="text-sm text-white">{f.description}</p>

            <p className="text-xs text-gray-400">
              By: {f.studentEmail}
            </p>

            {f.image && (
              <img
                src={f.image}
                className="h-28 rounded cursor-pointer border border-white/20"
                onClick={() => setZoomImage(f.image)}
                alt="feedback"
              />
            )}
<div className="mt-2 flex justify-end">
  <div
    className="
      border border-red-500
      rounded
      p-1
      bg-black
    "
  >
    <Button
      variant="destructive"
      size="sm"
      className="
        px-3
        py-1
        text-xs
        rounded-none
        font-medium
      "
      onClick={() => deleteFeedback(f.id)}
    >
      Resolve and Delete
    </Button>
  </div>
</div>
          </div>
        ))}
      </div>

      {/* IMAGE ZOOM */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            className="max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
            alt="zoom"
          />
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
