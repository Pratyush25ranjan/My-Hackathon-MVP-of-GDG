import placeholderData from "./placeholder-images.json";

const PlaceHolderImages = placeholderData.placeholderImages;


const getImage = (id) =>
  PlaceHolderImages.find((img) => img.id === id);

/* -------------------- USERS -------------------- */

const user1 = {
  id: "u1",
  name: "Sarah Lee",
  department: "Computer Science",
  year: 3,
  isVerified: true,
  avatarUrl: getImage("user-avatar-1")?.imageUrl,
  avatarHint: getImage("user-avatar-1")?.imageHint,
};

const user2 = {
  id: "u2",
  name: "Mike Johnson",
  department: "Mechanical Engineering",
  year: 2,
  isVerified: true,
  avatarUrl: getImage("user-avatar-2")?.imageUrl,
  avatarHint: getImage("user-avatar-2")?.imageHint,
};

const user3 = {
  id: "u3",
  name: "Emily Chen",
  department: "Electrical Engineering",
  year: 4,
  isVerified: true,
  avatarUrl: getImage("user-avatar-3")?.imageUrl,
  avatarHint: getImage("user-avatar-3")?.imageHint,
};

const user4 = {
  id: "u4",
  name: "David Kim",
  department: "Computer Science",
  year: 3,
  isVerified: true,
  avatarUrl: getImage("user-avatar-4")?.imageUrl,
  avatarHint: getImage("user-avatar-4")?.imageHint,
};

export const currentUser = {
  id: "u5",
  name: "Alex Doe",
  department: "Computer Science",
  year: 1,
  isVerified: true,
  avatarUrl: getImage("user-avatar-current")?.imageUrl,
  avatarHint: getImage("user-avatar-current")?.imageHint,
};

export const users = [
  user1,
  user2,
  user3,
  user4,
  currentUser,
];

/* -------------------- POSTS -------------------- */

export const posts = [
  {
    id: "p1",
    author: user1,
    content:
      "Just finished my AI project! It was a tough one but learned a lot. Anyone else taking Advanced AI next semester?",
    image: {
      url: getImage("post-image-1")?.imageUrl,
      hint: getImage("post-image-1")?.imageHint,
    },
    createdAt: "2h ago",
    likes: 42,
    comments: 8,
  },
  {
    id: "p2",
    author: user2,
    content:
      "Looking for a study group for Thermodynamics. We meet at the library on Tuesdays and Thursdays. DM me if you're interested!",
    createdAt: "5h ago",
    likes: 15,
    comments: 3,
  },
  {
    id: "p3",
    author: user3,
    content:
      "Huge shoutout to the organizers of the tech fest! It was an amazing experience. Can't wait for next year. #TechFest2024",
    image: {
      url: getImage("post-image-2")?.imageUrl,
      hint: getImage("post-image-2")?.imageHint,
    },
    createdAt: "1d ago",
    likes: 128,
    comments: 21,
  },
  {
    id: "p4",
    author: user4,
    content:
      "Does anyone have notes for the latest Data Structures lecture? I missed it due to a doctor's appointment. Would really appreciate it!",
    createdAt: "2d ago",
    likes: 9,
    comments: 5,
  },
];

/* -------------------- COMMUNITIES -------------------- */

export const communities = [
  { id: "cs", name: "Computer Science" },
  { id: "me", name: "Mechanical Eng." },
  { id: "ee", name: "Electrical Eng." },
  { id: "ce", name: "Civil Eng." },
];

/* -------------------- ANNOUNCEMENTS -------------------- */

export const announcements = [
  {
    id: "a1",
    title: "Mid-Term Exam Schedule Released",
    content:
      "The schedule for the upcoming mid-term examinations has been posted on the college website. Please review it carefully.",
    author: user3,
    createdAt: "3d ago",
  },
  {
    id: "a2",
    title: 'Annual Tech Fest "Innovate 2024"',
    content:
      "Get ready for the biggest tech event of the year! Innovate 2024 is happening from Oct 25-27. Register now!",
    author: user3,
    createdAt: "5d ago",
  },
  {
    id: "a3",
    title: "Workshop on Robotics (CS Dept)",
    content:
      "A hands-on workshop on robotics will be conducted for all Computer Science students on Oct 20th.",
    author: user1,
    createdAt: "6d ago",
    department: "Computer Science",
  },
];

/* -------------------- AI DISCUSSION DUMMY -------------------- */

export const DUMMY_DISCUSSION = `
UserA: Hey everyone, has anyone started working on the final year project proposals? The deadline is approaching fast.
UserB: I've started brainstorming ideas for my project in machine learning. I'm thinking of something related to natural language processing.
UserC: That sounds cool! I'm in the civil engineering department, and our team is planning to work on sustainable building materials. We're looking for one more member, preferably with some knowledge of material science.
UserA: I'm also in CS. I was thinking about a project on blockchain technology, maybe a decentralized voting system for college elections.
UserD: A decentralized voting system sounds ambitious but very relevant! You should check out the latest research papers on that topic. Professor Smith is an expert in that area, you could probably ask him for guidance.
UserB: For the ML project, I'm stuck on which dataset to use. Does anyone have recommendations for good quality text datasets?
UserA: You can check out Kaggle or the UCI Machine Learning Repository. They have a lot of publicly available datasets. For NLP, the IMDB movie reviews dataset is a classic for sentiment analysis.
UserC: Thanks for the suggestion, UserA. For our project, we are trying to find recycled materials that can be used in construction. It's challenging but rewarding.
UserE: I'm a first-year student and all this sounds so exciting! Can seniors share some tips on how to approach these major projects?
UserD: My advice would be to start early, form a good team, and choose a topic you are genuinely passionate about. It makes the long hours much more bearable. And don't hesitate to ask for help from professors!
UserA: Exactly! And document everything from day one. It will save you a lot of headache later.
`;
