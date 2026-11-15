import { useEffect, useRef, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ProductPicture } from "@/interfaces/IProduct";
import { deleteProductPicture, updateProduct, uploadProductPicture } from "@/services/product.service";

interface UseProductPicturesArgs {
  productId?: number;
  initialPictures?: ProductPicture[];
  initialThumbnail?: string | null;
}

// err.response?.data?.detail is usually a string, but FastAPI returns it as
// an array of {type, loc, msg, input} objects for a request-validation
// (422) error -- rendering that array directly as a React child crashes,
// so this always collapses it down to a plain string first.
const extractErrorMessage = (err: any, fallback: string): string => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((e) => e?.msg || JSON.stringify(e)).join("; ") || fallback;
  }
  return err?.message || fallback;
};

// Only meaningful once productId exists -- the backend requires the product
// to already be persisted before any picture can be attached to it.
export const useProductPictures = ({
  productId,
  initialPictures,
  initialThumbnail,
}: UseProductPicturesArgs) => {
  const [pictures, setPictures] = useState<ProductPicture[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current || initialPictures === undefined) return;
    seededRef.current = true;
    setPictures(initialPictures);
    setThumbnail(initialThumbnail ?? null);
  }, [initialPictures, initialThumbnail]);

  const upload = async (file: File) => {
    if (!productId) return;
    try {
      setUploading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const added = await uploadProductPicture({ schoolId, productId, file });
      setPictures((prev) => [...prev, { id: added.id, product_id: productId, path: added.path }]);
      // The first picture a product gets becomes its thumbnail automatically
      // -- otherwise a brand-new product shows no image anywhere (order
      // entry, products list) until someone remembers to star one. Once a
      // thumbnail is set (here or explicitly via setAsThumbnail), later
      // uploads never override it on their own.
      if (!thumbnail) {
        await updateProduct({ schoolId, productId, dto: { thumbnail: added.path } });
        setThumbnail(added.path);
      }
    } catch (err: any) {
      setError(extractErrorMessage(err, "Error al subir la imagen"));
    } finally {
      setUploading(false);
    }
  };

  const remove = async (pictureId: number) => {
    if (!productId) return;
    try {
      setError(null);
      const { schoolId } = getOrgConfig();
      const removed = pictures.find((picture) => picture.id === pictureId);
      await deleteProductPicture({ schoolId, productId, pictureId });
      const remaining = pictures.filter((picture) => picture.id !== pictureId);
      setPictures(remaining);
      // Deleting the picture that was the thumbnail must never leave it
      // pointing at a now-gone image -- mirrors what the backend just did
      // to Product.thumbnail in ProductService.delete_picture, so local
      // state doesn't drift from what actually got persisted.
      if (removed && thumbnail === removed.path) {
        setThumbnail(remaining[0]?.path ?? null);
      }
    } catch (err: any) {
      setError(extractErrorMessage(err, "Error al eliminar la imagen"));
    }
  };

  const setAsThumbnail = async (picture: ProductPicture) => {
    if (!productId) return;
    try {
      setError(null);
      const { schoolId } = getOrgConfig();
      await updateProduct({ schoolId, productId, dto: { thumbnail: picture.path } });
      setThumbnail(picture.path);
    } catch (err: any) {
      setError(extractErrorMessage(err, "Error al actualizar la miniatura"));
    }
  };

  return { pictures, thumbnail, uploading, error, upload, remove, setAsThumbnail };
};
