import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import ProductoKardexPage from "../ProductoKardexPage";

export const metadata: Metadata = {
  title: "Producto Kardex - Interschool",
};

export default function ProductoKardexRoutePage() {
  return (
    <>
      <PageTitle
        title="Producto Kardex"
      />
      <div className="mt-6">
        <ProductoKardexPage />
      </div>
    </>
  );
}
