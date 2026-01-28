// src/pages/AdminPage/AdminDashboardAdm.jsx
import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { Button } from "../../components/ui/button";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { sendStudentStatusEmail } from "../../utils/email";

import DarkCard from "../../components/ui/DarkCard";

import GgvCommunityAdm from "./GgvCommunityAdm";
import DeptCommunityAdm from "./DeptCommunityAdm";
import AdmClubCommunity from "./AdmClubCommunity";
import StudentsListAdm from "./StudentsListAdm";
import AdminNewsDashboardAdm from "./AdminNewsDashboardAdm";
import StudentHelp from "../StudentHelp/StudentHelp";

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
  const [adminUser, setAdminUser] = useState(null);

  const sidebarItems = [
    { key: "ggv", label: "GGV Community" },
    { key: "dept", label: "Department Community" },
    { key: "clubs", label: "Club Community" },
    { key: "students", label: "Students" },
    { key: "news", label: "News Dashboard" },
    { key: "studentHelp", label: "Student Help" },

    
  ];

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const loadStudentPosts = async (email) => {
    const q = query(
      collection(db, "posts"),
      where("authorEmail", "==", email)
    );
    const snap = await getDocs(q);
    setStudentPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const openReviewFromPost = async (post) => {
    let userDoc = null;

    if (post.authorUid) {
      const snap = await getDocs(
        query(collection(db, "users"), where("__name__", "==", post.authorUid))
      );
      if (!snap.empty) userDoc = { id: snap.docs[0].id, ...snap.docs[0].data() };
    }

    if (!userDoc && post.authorEmail) {
      const snap = await getDocs(
        query(collection(db, "users"), where("email", "==", post.authorEmail))
      );
      if (!snap.empty) userDoc = { id: snap.docs[0].id, ...snap.docs[0].data() };
    }

    if (!userDoc) {
      alert("Student record not found");
      return;
    }

    setReviewStudent(userDoc);
    await loadStudentPosts(userDoc.email);
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

      const adminSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (adminSnap.exists()) {
        setAdminUser({ id: adminSnap.id, ...adminSnap.data() });
      }

      setLoading(false);
    };

    loadAll();
  }, []);

  if (loading) return <p className="p-6 text-white">Loading…</p>;

  return (
    <DashboardLayout
      title="CampusConnect"
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={logout}
    >
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

        {activeTab === "clubs" && (
          <AdmClubCommunity
            posts={posts}
            adminUser={adminUser}
            setFullscreenImage={setFullscreenImage}
          />
        )}

        {activeTab === "news" && <AdminNewsDashboardAdm />}

        {activeTab === "students" && (
          <StudentsListAdm
            studentTab={studentTab}
            setStudentTab={setStudentTab}
            approvedStudents={approvedStudents}
            pendingStudents={pendingStudents}
            setReviewStudent={setReviewStudent}
            loadStudentPosts={loadStudentPosts}
          />
        )}

        {activeTab === "studentHelp" && <StudentHelp role="admin" />}
      </div>

      {/* REVIEW STUDENT MODAL (FIXED DARK) */}
      {reviewStudent && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center"
          onClick={() => setReviewStudent(null)}
        >
          <DarkCard
            className="max-w-2xl w-full space-y-4 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              {reviewStudent.profileImageBase64 && (
                <img
                  src={reviewStudent.profileImageBase64}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h2 className="text-xl font-bold text-white">
                  {reviewStudent.firstName} {reviewStudent.lastName}
                </h2>
                <p className="text-white/60">{reviewStudent.email}</p>
              </div>
            </div>

            <p className="text-white/80">
              {reviewStudent.department} • Year {reviewStudent.year}
            </p>

            <h3 className="font-semibold text-white mt-4">Posts</h3>

            {studentPosts.length === 0 && (
              <p className="text-white/50 text-sm">No posts yet.</p>
            )}

            {studentPosts.map((p) => (
              <DarkCard key={p.id} className="p-3 space-y-2">
                <p className="text-white/90">{p.text}</p>
                {p.image && (
                  <img src={p.image} className="rounded max-h-48" />
                )}
              </DarkCard>
            ))}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setReviewStudent(null)}
            >
              Close
            </Button>
          </DarkCard>
        </div>
      )}

      {/* FULLSCREEN IMAGE */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setFullscreenImage(null)}
        >
          <img src={fullscreenImage} className="max-h-[90vh] max-w-[90vw]" />
        </div>
      )}
    </DashboardLayout>
  );
}