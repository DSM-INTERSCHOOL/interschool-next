"use client";

import { useRef } from "react";
import { buildCommerceUploadUrl } from "@/lib/commerceUploads";
import { useProductPictures } from "../hooks";
import { ProductPicture } from "@/interfaces/IProduct";

interface ProductPictureManagerProps {
  productId: number;
  initialPictures: ProductPicture[];
  initialThumbnail: string | null;
}

export function ProductPictureManager({
  productId,
  initialPictures,
  initialThumbnail,
}: ProductPictureManagerProps) {
  const { pictures, thumbnail, uploading, error, upload, remove, setAsThumbnail } = useProductPictures({
    productId,
    initialPictures,
    initialThumbnail,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await upload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h3 className="card-title text-xl">
          <span className="iconify lucide--image size-5"></span>
          Imágenes
        </h3>

        {error && (
          <div className="alert alert-error">
            <span className="iconify lucide--alert-circle size-6"></span>
            <div>{error}</div>
          </div>
        )}

        <div className="form-control">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full max-w-sm"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading && <span className="loading loading-spinner loading-sm mt-2"></span>}
        </div>

        {pictures.length === 0 ? (
          <p className="text-base-content/60 text-sm">Aún no hay imágenes para este producto.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {pictures.map((picture) => {
              const isThumbnail = thumbnail === picture.path;
              return (
                <div key={picture.id} className="relative group">
                  <img
                    src={buildCommerceUploadUrl(picture.path)}
                    alt=""
                    className={`w-full aspect-square object-cover rounded-lg border-2 ${
                      isThumbnail ? "border-primary" : "border-base-300"
                    }`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
                    <button
                      type="button"
                      className={`btn btn-circle btn-sm ${isThumbnail ? "btn-primary" : "btn-ghost text-white"}`}
                      title="Usar como miniatura"
                      onClick={() => setAsThumbnail(picture)}
                    >
                      <span className="iconify lucide--star size-4"></span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-circle btn-sm btn-ghost text-white"
                      title="Eliminar"
                      onClick={() => remove(picture.id)}
                    >
                      <span className="iconify lucide--trash-2 size-4"></span>
                    </button>
                  </div>
                  {isThumbnail && <div className="badge badge-primary badge-sm absolute top-1 left-1">Miniatura</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
