// src/pages/StudentPage/StudentHome.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  onSnapshot,
  getDoc,
  getDocs,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";

import { auth, db } from "../../services/firebase";
import { Comments, compressImage } from "./shared";

import GgvCommunity from "./GgvCommunity";
import DeptCommunity from "./DeptCommunity";
import ClubCommunity from "./ClubCommunity";
import StudentsList from "./StudentsList";
import NewsDashboard from "./NewsDashboard";
import Help from "../StuHelp/Help";

export default function StudentHome() {
  const navigate = useNavigate();

  /* LOGOUT */
  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  /* ADMIN REDIRECT */
  useEffect(() => {
    const checkAdmin = async () => {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (snap.exists() && snap.data().role === "admin") {
        navigate("/admin");
      }
    };
    checkAdmin();
  }, [navigate]);

  /* STATE */
  const [tab, setTab] = useState("ggv");
  const [posts, setPosts] = useState([]);
  const [students, setStudents] = useState([]);
  const [user, setUser] = useState(null);
  const [userDept, setUserDept] = useState("");

  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState(null);

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [news, setNews] = useState([]);
  const [dept, setDept] = useState("all");

  /* LOAD USER */
  useEffect(() => {
    const loadUser = async () => {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (snap.exists()) {
        const u = snap.data();
        const normalizedDept = (u.department || "").toLowerCase();
        setUser({ ...u, department: normalizedDept });
        setUserDept(normalizedDept);
      }
    };
    loadUser();
  }, []);

  /* NEWS */
  useEffect(() => {
    const qNews = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(qNews, (snap) => {
      setNews(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  /* POSTS */
  useEffect(() => {
    if (!userDept) return;

    let qPosts;

    if (tab === "ggv") {
      qPosts = query(collection(db, "posts"), where("scope", "==", "ggv"));
    } else if (tab === "dept") {
      qPosts = query(
        collection(db, "posts"),
        where("scope", "==", "dept"),
        where("department", "==", userDept)
      );
    } else if (tab === "clubs") {
      qPosts = query(
        collection(db, "posts"),
        where("authorRole", "==", "admin")
      );
    } else {
      return;
    }

    const unsub = onSnapshot(qPosts, (snap) => {
      const livePosts = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );
      setPosts(livePosts);
    });

    return () => unsub();
  }, [tab, userDept]);

  /* STUDENTS */
  useEffect(() => {
    if (tab !== "students") return;

    const loadStudents = async () => {
      const snap = await getDocs(
        query(collection(db, "users"), where("verified", "==", true))
      );

      setStudents(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          department: (d.data().department || "").toLowerCase(),
        }))
      );
    };

    loadStudents();
  }, [tab]);

  /* CREATE POST */
  const createPost = async () => {
    if (!postText.trim() || !user) return;

    let image = null;
    if (postImage) image = await compressImage(postImage);

    await addDoc(collection(db, "posts"), {
      text: postText,
      image,
      authorUid: auth.currentUser.uid,
      authorEmail: user.email,
      authorProfileImageBase64: user.profileImageBase64 || null,
      authorDept: user.department,
      authorYear: user.year,
      scope: tab,
      department: user.department,
      createdAt: serverTimestamp(),
      likes: [],
    });

    setPostText("");
    setPostImage(null);
  };

  /* LIKE */
  const toggleLike = async (post) => {
    const ref = doc(db, "posts", post.id);
    const uid = auth.currentUser.uid;

    if (post.likes.includes(uid)) {
      await updateDoc(ref, { likes: arrayRemove(uid) });
    } else {
      await updateDoc(ref, { likes: arrayUnion(uid) });
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout
      title="CampusConnect"
      sidebarItems={[
        { key: "ggv", label: "GGV Community" },
        { key: "dept", label: "Department Community" },
        { key: "clubs", label: "Club Community" },
        { key: "students", label: "Students" },
        { key: "news", label: "News Dashboard" },
        { key: "help", label: "Help" },
      ]}
      activeTab={tab}
      setActiveTab={setTab}
      headerRight={
  user && (
    <div
      onClick={() => navigate("/profile")}
      className="flex items-center gap-3 cursor-pointer hover:opacity-80"
    >
      {user.profileImageBase64 ? (
        <img
          src={user.profileImageBase64}
          className="h-8 w-8 rounded-full object-cover"
          alt="Profile"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-green-500 text-black flex items-center justify-center text-xs font-bold">
          {user.email[0].toUpperCase()}
        </div>
      )}
      <span className="text-sm text-green-300">
        {user.email}
      </span>
    </div>
  )
}

      
    >
      <div className="p-6">
        {tab === "ggv" && (
          <GgvCommunity
            posts={posts}
            user={user}
            postText={postText}
            setPostText={setPostText}
            postImage={postImage}
            setPostImage={setPostImage}
            createPost={createPost}
            toggleLike={toggleLike}
            navigate={navigate}
            Comments={Comments}
          />
        )}

        {tab === "dept" && (
          <DeptCommunity
            posts={posts}
            user={user}
            postText={postText}
            setPostText={setPostText}
            postImage={postImage}
            setPostImage={setPostImage}
            createPost={createPost}
            toggleLike={toggleLike}
            dept={dept}
            setDept={setDept}
            navigate={navigate}
            Comments={Comments}
          />
        )}

        {tab === "clubs" && (
          <ClubCommunity
            posts={posts}
            toggleLike={toggleLike}
            navigate={navigate}
            Comments={Comments}
            dept={dept}
            setDept={setDept}
          />
        )}

        {tab === "students" && (
          <StudentsList
            students={students}
            search={search}
            setSearch={setSearch}
            filterDept={filterDept}
            setFilterDept={setFilterDept}
            filterYear={filterYear}
            setFilterYear={setFilterYear}
            navigate={navigate}
          />
        )}

        {tab === "news" && <NewsDashboard news={news} />}
        {tab === "help" && <Help role="student" />}
      </div>
    </DashboardLayout>
  );
}