"use client";

import { FeedRead } from "@/interfaces/IFeed";

interface Props {
  feed: FeedRead;
  onToggle: (feed: FeedRead) => void;
}

export const FeedLikeButton = ({ feed, onToggle }: Props) => (
  <button
    className={`btn btn-sm btn-ghost gap-1.5 ${feed.user_liked ? "text-error" : "text-base-content/50"}`}
    onClick={() => onToggle(feed)}
  >
    <span className={`iconify size-4 ${feed.user_liked ? "lucide--heart" : "lucide--heart"}`}
      style={{ fill: feed.user_liked ? "currentColor" : "none", stroke: "currentColor" }}
    />
    <span className="text-sm">{feed.likes}</span>
  </button>
);
