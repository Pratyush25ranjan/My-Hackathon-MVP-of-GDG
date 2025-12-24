import { Card, CardContent } from "../../components/ui/card";

export default function DeptCommunityAdm({
  posts,
  dept,
  setDept,
  setFullscreenImage,
  openReviewFromPost,
}) {
  const filtered = posts.filter(
    (p) => dept === "all" || p.department === dept
  );

  return (
    <>
      <select
        className="border p-2 rounded"
        value={dept}
        onChange={(e) => setDept(e.target.value)}
      >
        <option value="all">All Departments</option>
        <option value="cs">CSE</option>
        <option value="it">IT</option>
        <option value="ee">EE</option>
        <option value="ece">ECE</option>
        <option value="me">ME</option>
        <option value="ce">CE(Civil Engineering)</option>
        <option value="che">CE(Chemical Engineering)</option>
        <option value="ipe">IPE</option>
        <option value="aiml">AIML</option>
        <option value="anim">ANIM</option>
      </select>

      {filtered.map((p) => (
        <Card key={p.id}>
          <CardContent className="px-5 py-6 space-y-3">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => openReviewFromPost(p)}
            >
              {(p.authorProfileImageBase64 || p.authorPhoto) && (
                <img
                  src={p.authorProfileImageBase64 || p.authorPhoto}
                  alt="author"
                  className="w-5 h-5 rounded-full object-cover border border-border"
                />
              )}
              <p className="font-medium">{p.authorEmail}</p>
            </div>

            <p>{p.text}</p>

            {p.image && (
              <img
                src={p.image}
                className="max-h-64 rounded cursor-pointer"
                onClick={() => setFullscreenImage(p.image)}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
}
