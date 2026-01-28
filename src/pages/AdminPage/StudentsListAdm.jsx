import { Button } from "../../components/ui/button";
import DarkCard from "../../components/ui/DarkCard";
import { formatYearAdm } from "./Adminshared";

export default function StudentsListAdm({
  studentTab,
  setStudentTab,
  approvedStudents,
  pendingStudents,
  setFullscreenImage,
  approveUser,
  rejectUser,
  blockStudent,
  unblockStudent,
  setReviewStudent,
  loadStudentPosts,
}) {
  return (
    <>
      <div className="flex gap-4 mb-6">
        <Button
          variant={studentTab === "approved" ? "default" : "outline"}
          onClick={() => setStudentTab("approved")}
        >
          Approved Students
        </Button>

        <Button
          variant={studentTab === "pending" ? "default" : "outline"}
          onClick={() => setStudentTab("pending")}
        >
          Pending Students
        </Button>
      </div>

      {studentTab === "approved" && (
        <div className="grid gap-4">
          {approvedStudents.map((u) => (
            <DarkCard key={u.id} className="space-y-2">
              <div className="flex items-center gap-3">
                {(u.profileImageBase64 || u.photoURL) && (
                  <img
                    src={u.profileImageBase64 || u.photoURL}
                    className="w-10 h-10 rounded-full object-cover border border-white/20"
                    alt="profile"
                  />
                )}
                <p className="font-medium text-white">
                  {u.firstName} {u.lastName}
                </p>
              </div>

              <p className="text-sm text-white/70">{u.email}</p>

              <p className="text-sm text-white/80">
                {u.department?.toUpperCase()} • {formatYearAdm(u.year)}
              </p>

              {u.blocked && (
                <p className="text-xs text-red-400 font-semibold">
                  BLOCKED
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  size="sm"
                  onClick={async () => {
                    setReviewStudent(u);
                    await loadStudentPosts(u.email);
                  }}
                >
                  Review Student
                </Button>

                {!u.blocked ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => blockStudent(u.id)}
                  >
                    Block Student
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => unblockStudent(u.id)}
                  >
                    Unblock Student
                  </Button>
                )}
              </div>
            </DarkCard>
          ))}
        </div>
      )}

      {studentTab === "pending" && (
        <div className="grid gap-6">
          {pendingStudents.map((u) => (
            <DarkCard key={u.id} className="space-y-3">
              <p className="font-medium text-white">
                {u.firstName} {u.lastName}
              </p>

              <p className="text-sm text-white/70">{u.email}</p>

              <p className="text-sm text-white/80">
                {u.department?.toUpperCase()} • {formatYearAdm(u.year)}
              </p>

              {u.verificationImageBase64 && (
                <img
                  src={u.verificationImageBase64}
                  className="w-32 border border-white/20 rounded cursor-pointer"
                  onClick={() =>
                    setFullscreenImage(u.verificationImageBase64)
                  }
                  alt="verification"
                />
              )}

              <div className="flex gap-3">
                <Button size="sm" onClick={() => approveUser(u.id)}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => rejectUser(u.id)}
                >
                  Reject
                </Button>
              </div>
            </DarkCard>
          ))}
        </div>
      )}
    </>
  );
}