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
import { db, auth } from "../../services/firebase";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomImage, setZoomImage] = useState(null);

 useEffect(() => {
  const unsubAuth = auth.onAuthStateChanged((user) => {
    if (!user) return;

    const q = query(
      collection(db, "feedbackComplaints"),
      orderBy("createdAt", "desc")
    );

    const unsubSnap = onSnapshot(
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

    return () => unsubSnap();
  });

  return () => unsubAuth();
}, []);



  const deleteFeedback = async (id) => {
    if (!confirm("Mark resolved & delete this feedback?")) return;
    await deleteDoc(doc(db, "feedbackComplaints", id));
  };

  if (loading) {
    return (
      <div className="p-6 text-muted-foreground">
        Loading feedbacks...
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="p-6 text-muted-foreground">
        No feedback or complaints yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        Feedback & Complaints (Admin)
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        {feedbacks.map((f) => (
          <div
            key={f.id}
            className="border rounded-lg p-4 space-y-2 bg-background"
          >
            <div className="flex justify-between">
              <h3 className="font-semibold">{f.title}</h3>
              <span className="text-xs px-2 py-1 rounded bg-muted">
                {f.type}
              </span>
            </div>

            <p className="text-sm">{f.description}</p>

            <p className="text-xs text-muted-foreground">
              By: {f.studentEmail}
            </p>

            {f.image && (
              <img
                src={f.image}
                className="h-28 rounded cursor-pointer border"
                onClick={() => setZoomImage(f.image)}
              />
            )}

            <Button
              variant="destructive"
              onClick={() => deleteFeedback(f.id)}
            >
              Resolve & Delete
            </Button>
          </div>
        ))}
      </div>

      {/* IMAGE ZOOM */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            className="max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
