import {
  Heart,
  MessageCircle,
  Share2,
  ShieldCheck,
  MoreHorizontal,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

export default function PostCard({ post }) {
  return (
    <div className="cursor-pointer p-4 transition-colors animate-in fade-in hover:bg-muted/50">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={post.author.avatarUrl}
            alt={post.author.name}
            data-ai-hint={post.author.avatarHint}
          />
          <AvatarFallback>
            {post.author.name.slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold">{post.author.name}</span>

              {post.author.isVerified && (
                <ShieldCheck className="h-4 w-4 text-chart-2" />
              )}

              <span className="text-muted-foreground">
                @{post.author.name.replace(/\s+/g, "").toLowerCase()} &middot;{" "}
                {post.createdAt}
              </span>
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <p className="mt-1">{post.content}</p>

          {post.image && (
            <div className="relative mt-3 aspect-video overflow-hidden rounded-lg border">
              <img
                src={post.image.url}
                alt="Post"
                className="h-full w-full object-cover"
                data-ai-hint={post.image.hint}
              />
            </div>
          )}

          <div className="mt-4 flex max-w-sm items-center justify-between text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 hover:text-destructive"
            >
              <Heart className="h-4 w-4" />
              <span className="text-xs">{post.likes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{post.comments}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 hover:text-primary"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

