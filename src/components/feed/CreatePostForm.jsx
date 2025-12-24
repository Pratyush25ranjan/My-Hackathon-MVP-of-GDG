import { Image as ImageIcon, Video, Paperclip } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

import { currentUser } from "../../data/data";

export default function CreatePostForm() {
  return (
    <div>
      <div className="flex gap-4">
        <Avatar>
          <AvatarImage
            src={currentUser.avatarUrl}
            alt={currentUser.name}
          />
          <AvatarFallback>
            {currentUser.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="w-full">
          <Textarea
            placeholder={`What's on your mind, ${
              currentUser.name.split(" ")[0]
            }?`}
            className="w-full border-none bg-transparent p-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
            rows={2}
          />

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <div className="flex gap-1">
              <Button variant="ghost" size="icon">
                <ImageIcon className="text-primary" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="text-primary" />
              </Button>
              <Button variant="ghost" size="icon">
                <Paperclip className="text-primary" />
              </Button>
            </div>

            <Button disabled className="rounded-full">
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
