import DarkCard from "../../components/ui/DarkCard";

export default function DeptCommunityAdm({
  posts,
  dept,
  setDept,
  setFullscreenImage,
  openReviewFromPost,
}) {
  const filtered = posts.filter((p) => {
    if (dept === "all") return true;
    const postDept = (p.department || p.authorDept || "").toLowerCase();
    return postDept === dept;
  });

  return (
    <>
      <select
        className="mb-4 w-full rounded-lg bg-zinc-900 border border-white/20 p-2 text-white outline-none focus:ring-2 focus:ring-green-400"
        value={dept}
        onChange={(e) => setDept(e.target.value)}
      >
        <option value="all">All Departments</option>
        <option value="cs">CSE</option>
        <option value="it">IT</option>
        <option value="ee">EE</option>
        <option value="ece">ECE</option>
        <option value="me">ME</option>
        <option value="ce">Civil Engineering</option>
        <option value="che">Chemical Engineering</option>
        <option value="ipe">IPE</option>
        <option value="aiml">AIML</option>
        <option value="anim">ANIM</option>
      </select>

      {filtered.map((p) => (
        <DarkCard key={p.id} className="space-y-3 mb-4">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => openReviewFromPost(p)}
          >
            {(p.authorProfileImageBase64 || p.authorPhoto) && (
              <img
                src={p.authorProfileImageBase64 || p.authorPhoto}
                alt="author"
                className="w-6 h-6 rounded-full object-cover border border-white/20"
              />
            )}
            <p className="font-medium text-white">{p.authorEmail}</p>
          </div>

          <p className="text-white/90">{p.text}</p>

          {p.image && (
            <img
              src={p.image}
              className="max-h-64 rounded cursor-pointer hover:scale-[1.02] transition"
              onClick={() => setFullscreenImage(p.image)}
              alt="post"
            />
          )}
        </DarkCard>
      ))}
    </>
  );
}