import { useEffect, useRef, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ProductPicture } from "@/interfaces/IProduct";
import { deleteProductPicture, updateProduct, uploadProductPicture } from "@/services/product.service";

interface UseProductPicturesArgs {
  productId?: number;
  initialPictures?: ProductPicture[];
  initialThumbnail?: string | null;
}

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
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (pictureId: number) => {
    if (!productId) return;
    try {
      setError(null);
      const { schoolId } = getOrgConfig();
      await deleteProductPicture({ schoolId, productId, pictureId });
      setPictures((prev) => prev.filter((picture) => picture.id !== pictureId));
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al eliminar la imagen");
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
      setError(err.response?.data?.detail || err.message || "Error al actualizar la miniatura");
    }
  };

  return { pictures, thumbnail, uploading, error, upload, remove, setAsThumbnail };
};
