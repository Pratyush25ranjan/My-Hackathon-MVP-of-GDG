import { Card, CardContent } from "../../components/ui/card";

export default function GgvCommunityAdm({
  posts,
  setFullscreenImage,
  openReviewFromPost,
}) {
  return (
    <>
      {posts.map((p) => (
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
