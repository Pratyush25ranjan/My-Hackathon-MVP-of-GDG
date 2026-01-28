import DarkCard from "../../components/ui/DarkCard";

export default function GgvCommunityAdm({
  posts,
  setFullscreenImage,
  openReviewFromPost,
}) {
  return (
    <>
      {posts.map((p) => (
        <DarkCard key={p.id} className="space-y-3">
          
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
            <p className="font-medium text-white">
              {p.authorEmail}
            </p>
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