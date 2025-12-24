import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { improvePost, summarizePost } from "../../services/gemini";
import { auth, db } from "../../services/firebase";
import { TabButton, Comments, compressImage } from "./shared";
import GgvCommunity from "./GgvCommunity";
import DeptCommunity from "./DeptCommunity";
import ClubCommunity from "./ClubCommunity";
import StudentsList from "./StudentsList";
import NewsDashboard from "./NewsDashboard";

export default function StudentHome() {
  const navigate = useNavigate();

  // admin redirect
  useEffect(() => {
    const checkAdmin = async () => {
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (snap.exists() && snap.data().role === "admin") {
        navigate("/admin");
      }
    };
    checkAdmin();
  }, [navigate]);

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

  // load user
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

  // news
  useEffect(() => {
    const qNews = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(qNews, (snap) => {
      setNews(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // posts (GGV + Dept + Clubs)
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
      // Only posts created by admin for Club Community
      qPosts = query(
        collection(db, "posts"),
        where("authorRole", "==", "admin")
      );
    } else {
      return;
    }

    const unsubscribe = onSnapshot(qPosts, (snapshot) => {
      const livePosts = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );
      setPosts(livePosts);
    });

    return () => unsubscribe();
  }, [tab, userDept]);

  // students
  useEffect(() => {
    if (tab !== "students") return;
    const loadStudents = async () => {
      const snap = await getDocs(
        query(collection(db, "users"), where("verified", "==", true))
      );
      setStudents(
        snap.docs.map((d) => {
          const u = d.data();
          return {
            id: d.id,
            ...u,
            department: (u.department || "").toLowerCase(),
          };
        })
      );
    };
    loadStudents();
  }, [tab]);

  // create post (for GGV and Dept tabs)
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
      authorName: `${user.firstName} ${user.lastName}`,
      authorDept: user.department,
      authorYear: user.year,
      scope: tab, // "ggv" or "dept"
      department: user.department,
      createdAt: serverTimestamp(),
      likes: [],
    });

    setPostText("");
    setPostImage(null);
  };

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
    <div className="min-h-screen bg-muted/40">
      {/* top bar */}
      <div className="flex justify-between items-center px-6 py-4 bg-background border-b">
        <h1 className="font-bold text-xl">CampusConnect</h1>
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          {user.profileImageBase64 ? (
            <img
              src={user.profileImageBase64}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              {user.email[0].toUpperCase()}
            </div>
          )}
          <span className="text-sm">{user.email}</span>
        </div>
      </div>

      {/* tabs */}
      <div className="flex gap-4 px-6 py-3 bg-background border-b">
        <TabButton active={tab === "ggv"} onClick={() => setTab("ggv")}>
          GGV Community
        </TabButton>
        <TabButton active={tab === "dept"} onClick={() => setTab("dept")}>
          Department Community
        </TabButton>
        <TabButton active={tab === "clubs"} onClick={() => setTab("clubs")}>
          Club Community
        </TabButton>
        <TabButton active={tab === "students"} onClick={() => setTab("students")}>
          Students
        </TabButton>
        <TabButton active={tab === "news"} onClick={() => setTab("news")}>
          News Dashboard
        </TabButton>
      </div>

      {/* content */}
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
            improvePost={improvePost}
            summarizePost={summarizePost}
            dept={dept}
            setDept={setDept}
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
            improvePost={improvePost}
            summarizePost={summarizePost}
            dept={dept}
            setDept={setDept}
            navigate={navigate}
            Comments={Comments}
          />
        )}

        {tab === "clubs" && (
          <ClubCommunity
            posts={posts}
            user={user}
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
      </div>
    </div>
  );
}
