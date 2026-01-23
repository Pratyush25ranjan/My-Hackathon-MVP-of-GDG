// src/pages/StudentHelp/StudyMaterials.jsx
const StudyMaterials = ({ role }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Study Materials
      </h2>

      {role === "student" ? (
        <div className="space-y-4">
          <p>Access and download study resources.</p>

          <div className="border rounded-lg p-4 text-muted-foreground">
            Student Study Materials View Placeholder
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p>Upload and manage study materials.</p>

          <div className="border rounded-lg p-4 text-muted-foreground">
            Admin Study Material Management Placeholder
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMaterials;
