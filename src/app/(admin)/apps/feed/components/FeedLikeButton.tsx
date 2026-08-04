"use client";

import { FeedRead } from "@/interfaces/IFeed";

interface Props {
  feed: FeedRead;
  onToggle: (feed: FeedRead) => void;
}

export const FeedLikeButton = ({ feed, onToggle }: Props) => (
  <button
    className={`btn btn-sm gap-1.5 ${feed.user_liked ? "btn-primary" : "btn-ghost text-base-content/50"}`}
    onClick={() => onToggle(feed)}
  >
    <span className="iconify lucide--thumbs-up size-4" />
    <span className="text-sm">{feed.likes}</span>
  </button>
);
