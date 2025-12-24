import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import GgvCommunityAdm from "./GgvCommunityAdm";
import DeptCommunityAdm from "./DeptCommunityAdm";
import StudentsListAdm from "./StudentsListAdm";
import AdminNewsDashboardAdm from "./AdminNewsDashboardAdm";
import { TabButtonAdm } from "./Adminshared";

export default function AdminDashboardAdm() {
  const [activeTab, setActiveTab] = useState("ggv");
  const navigate = useNavigate();

  const [studentTab, setStudentTab] = useState("approved");
  const [reviewStudent, setReviewStudent] = useState(null);
  const [studentPosts, setStudentPosts] = useState([]);

  const [posts, setPosts] = useState([]);
  const [dept, setDept] = useState("all");
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);

  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const blockStudent = async (uid) => {
    await updateDoc(doc(db, "users", uid), { blocked: true });
    setApprovedStudents((list) =>
      list.map((u) => (u.id === uid ? { ...u, blocked: true } : u))
    );
  };

  const unblockStudent = async (uid) => {
    await updateDoc(doc(db, "users", uid), { blocked: false });
    setApprovedStudents((list) =>
      list.map((u) => (u.id === uid ? { ...u, blocked: false } : u))
    );
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const loadStudentPosts = async (email) => {
    const qPosts = query(
      collection(db, "posts"),
      where("authorEmail", "==", email)
    );
    const snap = await getDocs(qPosts);
    setStudentPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const openReviewFromPost = async (post) => {
    try {
      let userDoc = null;

      if (post.authorUid) {
        const snap = await getDocs(
          query(
            collection(db, "users"),
            where("__name__", "==", post.authorUid)
          )
        );
        if (!snap.empty)
          userDoc = { id: snap.docs[0].id, ...snap.docs[0].data() };
      }

      if (!userDoc && post.authorEmail) {
        const snap = await getDocs(
          query(collection(db, "users"), where("email", "==", post.authorEmail))
        );
        if (!snap.empty)
          userDoc = { id: snap.docs[0].id, ...snap.docs[0].data() };
      }

      if (!userDoc) {
        alert("Student record not found for this post.");
        return;
      }

      setReviewStudent(userDoc);
      await loadStudentPosts(userDoc.email);
    } catch (e) {
      console.error("openReviewFromPost error", e);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      const postSnap = await getDocs(collection(db, "posts"));
      setPosts(postSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const userSnap = await getDocs(collection(db, "users"));
      const approved = [];
      const pending = [];

      userSnap.forEach((d) => {
        const data = d.data();
        const user = { id: d.id, ...data };
        data.verified ? approved.push(user) : pending.push(user);
      });

      setApprovedStudents(approved);
      setPendingStudents(pending);
      setLoading(false);
    };

    loadAll();
  }, []);

  const approveUser = async (uid) => {
    await updateDoc(doc(db, "users", uid), { verified: true });
    const user = pendingStudents.find((u) => u.id === uid);
    setPendingStudents((p) => p.filter((u) => u.id !== uid));
    setApprovedStudents((a) => [...a, { ...user, verified: true }]);
  };

  const rejectUser = async (uid) => {
    if (!confirm("Reject and delete this application?")) return;
    await deleteDoc(doc(db, "users", uid));
    setPendingStudents((p) => p.filter((u) => u.id !== uid));
  };

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <div className="min-h-screen bg-muted/40">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-background border-b">
        <h1 className="text-2xl font-bold">CampusConnect</h1>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>

      {/* TABS */}
      <div className="flex gap-4 px-6 py-3 bg-background border-b">
        <TabButtonAdm
          active={activeTab === "ggv"}
          onClick={() => setActiveTab("ggv")}
        >
          GGV Community
        </TabButtonAdm>
        <TabButtonAdm
          active={activeTab === "dept"}
          onClick={() => setActiveTab("dept")}
        >
          Department Community
        </TabButtonAdm>
        <TabButtonAdm
          active={activeTab === "students"}
          onClick={() => setActiveTab("students")}
        >
          Students
        </TabButtonAdm>
        <TabButtonAdm
          active={activeTab === "news"}
          onClick={() => setActiveTab("news")}
        >
          News Dashboard
        </TabButtonAdm>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {activeTab === "ggv" && (
          <GgvCommunityAdm
            posts={posts}
            setFullscreenImage={setFullscreenImage}
            openReviewFromPost={openReviewFromPost}
          />
        )}

        {activeTab === "dept" && (
          <DeptCommunityAdm
            posts={posts}
            dept={dept}
            setDept={setDept}
            setFullscreenImage={setFullscreenImage}
            openReviewFromPost={openReviewFromPost}
          />
        )}

        {activeTab === "news" && <AdminNewsDashboardAdm />}

        {activeTab === "students" && (
          <StudentsListAdm
            studentTab={studentTab}
            setStudentTab={setStudentTab}
            approvedStudents={approvedStudents}
            pendingStudents={pendingStudents}
            setFullscreenImage={setFullscreenImage}
            approveUser={approveUser}
            rejectUser={rejectUser}
            blockStudent={blockStudent}
            unblockStudent={unblockStudent}
            setReviewStudent={setReviewStudent}
            loadStudentPosts={loadStudentPosts}
          />
        )}
      </div>

      {/* FULLSCREEN IMAGE */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage}
            className="max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* REVIEW STUDENT MODAL */}
      {reviewStudent && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center"
          onClick={() => setReviewStudent(null)}
        >
          <div
            className="bg-background p-6 max-w-2xl w-full rounded space-y-4 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              {(reviewStudent.profileImageBase64 || reviewStudent.photoURL) && (
                <img
                  src={
                    reviewStudent.profileImageBase64 ||
                    reviewStudent.photoURL
                  }
                  className="w-16 h-16 rounded-full object-cover"
                  alt="profile"
                />
              )}

              <div>
                <h2 className="text-xl font-bold">
                  {reviewStudent.firstName} {reviewStudent.lastName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {reviewStudent.email}
                </p>
              </div>
            </div>

            <p>
              {reviewStudent.department?.toUpperCase()} • Year{" "}
              {reviewStudent.year}
            </p>

            {reviewStudent.profileImageBase64 && (
              <img
                src={reviewStudent.profileImageBase64}
                className="w-32 rounded"
              />
            )}

            <h3 className="font-semibold mt-4">Posts</h3>

            {studentPosts.length === 0 && (
              <p className="text-sm text-muted-foreground">No posts yet.</p>
            )}

            {studentPosts.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-3">
                    {p.authorPhoto && (
                      <img
                        src={p.authorPhoto}
                        className="w-8 h-8 rounded-full object-cover"
                        alt="author"
                      />
                    )}
                    <p className="text-sm font-medium">
                      {reviewStudent.firstName} {reviewStudent.lastName}
                    </p>
                  </div>

                  <p>{p.text}</p>

                  {p.image && (
                    <img
                      src={p.image}
                      className="rounded max-h-48 mt-2"
                    />
                  )}
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setReviewStudent(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
