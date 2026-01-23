// // src/pages/StuHelp/StudyStuff.jsx
// const StudyMaterials = ({ role }) => {
//   return (
//     <div>
//       <h2 className="text-xl font-semibold mb-4">
//         Study Materials
//       </h2>

//       {role === "student" ? (
//         <div className="space-y-4">
//           <p>Access and download study resources.</p>

//           <div className="border rounded-lg p-4 text-muted-foreground">
//             Student Study Materials View Placeholder
//           </div>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           <p>Upload and manage study materials.</p>

//           <div className="border rounded-lg p-4 text-muted-foreground">
//             Admin Study Material Management Placeholder
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StudyMaterials;

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";
import { Button } from "../../components/ui/button";

const StudyMaterials = ({ role }) => {
  const [materials, setMaterials] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ LOAD STUDY MATERIALS (SAFE – NO REALTIME)
  useEffect(() => {
    if (role !== "student") return;

    const loadMaterials = async () => {
      try {
        const q = query(
          collection(db, "studyMaterials"),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setMaterials(data);
      } catch (err) {
        console.error("Study materials fetch error:", err.message);
        setError("Failed to load study materials.");
      } finally {
        setLoading(false);
      }
    };

    loadMaterials();
  }, [role]);

  // ---------------- ADMIN PLACEHOLDER ----------------
  if (role !== "student") {
    return (
      <div className="border rounded-lg p-4 text-muted-foreground">
        Admin study material upload & management will be implemented next.
      </div>
    );
  }

  // FILTER LOGIC
  const filteredMaterials =
    filter === "all"
      ? materials
      : materials.filter((m) => m.type === filter);

  // ---------------- STUDENT UI ----------------
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Study Materials</h2>

      {/* FILTER BUTTONS */}
      <div className="flex gap-3 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "notes" ? "default" : "outline"}
          onClick={() => setFilter("notes")}
        >
          Notes
        </Button>
        <Button
          variant={filter === "papers" ? "default" : "outline"}
          onClick={() => setFilter("papers")}
        >
          Question Papers
        </Button>
        <Button
          variant={filter === "slides" ? "default" : "outline"}
          onClick={() => setFilter("slides")}
        >
          Slides
        </Button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="border rounded-lg p-6 text-muted-foreground">
          Loading study materials...
        </div>
      ) : error ? (
        <div className="border rounded-lg p-6 text-red-500">
          {error}
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="border rounded-lg p-6 text-muted-foreground">
          No study materials available yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredMaterials.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 bg-background space-y-2"
            >
              <h3 className="font-semibold">{item.title}</h3>

              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>

              <div className="text-xs text-muted-foreground">
                Subject: {item.subject || "General"} • Type: {item.type}
              </div>

              {item.fileUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(item.fileUrl, "_blank")}
                >
                  Download
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyMaterials;
