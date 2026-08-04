"use client";

import { FeedAttachment } from "@/interfaces/IFeed";

interface Props {
  attachments: FeedAttachment[];
}

const isImage = (type: string) => type.startsWith("image/");
const isVideo = (type: string) => type.startsWith("video/");
const isPdf   = (type: string) => type === "application/pdf";

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const FeedAttachments = ({ attachments }: Props) => {
  if (attachments.length === 0) return null;

  // Images and videos are always shown as visual content regardless of is_inline.
  // Non-media files are only shown as download links when is_inline=false
  // (is_inline=true non-media means they're already embedded in the HTML body).
  const images = attachments.filter((a) => isImage(a.file_type));
  const videos = attachments.filter((a) => isVideo(a.file_type));
  const files  = attachments.filter((a) => !isImage(a.file_type) && !isVideo(a.file_type) && !a.is_inline);

  return (
    <div className="mt-3 space-y-3">
      {/* Image grid */}
      {images.length > 0 && (
        <div className={`grid gap-2 ${images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {images.map((img) => (
            <a key={img.id} href={img.public_url} target="_blank" rel="noopener noreferrer">
              <img
                src={img.public_url}
                alt={img.file_name}
                className="rounded-lg w-full h-auto hover:opacity-90 transition-opacity"
              />
            </a>
          ))}
        </div>
      )}

      {/* Video players */}
      {videos.length > 0 && (
        <div className="space-y-2">
          {videos.map((vid) => (
            <video
              key={vid.id}
              src={vid.public_url}
              controls
              className="rounded-lg w-full max-h-72 bg-black"
            />
          ))}
        </div>
      )}

      {/* File downloads */}
      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((file) => (
            <a
              key={file.id}
              href={file.public_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2.5 rounded-lg bg-base-200 hover:bg-base-300 transition-colors"
            >
              <span className={`iconify size-5 text-base-content/50 shrink-0 ${isPdf(file.file_type) ? "lucide--file-text" : "lucide--file"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.file_name}</p>
                <p className="text-xs text-base-content/40">{formatSize(file.file_size)}</p>
              </div>
              <span className="iconify lucide--download size-4 text-base-content/40 shrink-0" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
