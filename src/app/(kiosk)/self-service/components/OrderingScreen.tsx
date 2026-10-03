import { useMemo, useState } from "react";
import { ProductRead } from "@/interfaces/IProduct";
import { ColorRead } from "@/interfaces/IColor";
import { SizeRead } from "@/interfaces/ISize";
import { TopCategoryRead } from "@/interfaces/ITopCategory";
import { useCart, useCheckout } from "../hooks";
import { ALL_CATEGORIES, CategoryRail } from "./CategoryRail";
import { ProductGrid } from "./ProductGrid";
import { ProductPickerModal } from "./ProductPickerModal";
import { CartPanel } from "./CartPanel";
import { ConfirmationScreen } from "./ConfirmationScreen";

interface OrderingScreenProps {
  categories: TopCategoryRead[];
  products: ProductRead[];
  colors: ColorRead[];
  sizes: SizeRead[];
  onCancel: () => void;
}

export function OrderingScreen({ categories, products, colors, sizes, onCancel }: OrderingScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES);
  const [pickerProduct, setPickerProduct] = useState<ProductRead | null>(null);
  const cart = useCart();
  const checkout = useCheckout();

  const visibleProducts = useMemo(() => {
    if (selectedCategory === ALL_CATEGORIES) return products;
    const categoryId = Number(selectedCategory);
    return products.filter((product) => product.top_category_id === categoryId);
  }, [products, selectedCategory]);

  if (checkout.placedOrder) {
    return <ConfirmationScreen order={checkout.placedOrder} onNewOrder={onCancel} />;
  }

  return (
    <div className="flex h-screen w-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-base-300 bg-base-100 px-4 py-3">
          <h1 className="text-2xl font-bold">Nueva Orden</h1>
        </div>
        <CategoryRail categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
        <ProductGrid products={visibleProducts} onSelect={setPickerProduct} />
      </div>

      <CartPanel
        lines={cart.lines}
        total={cart.total}
        onUpdateQuantity={cart.updateQuantity}
        onRemove={cart.removeLine}
        onCancel={onCancel}
        onCheckout={() => checkout.submit(cart.lines)}
        checkingOut={checkout.status === "submitting"}
        checkoutError={checkout.error}
      />

      {pickerProduct && (
        <ProductPickerModal
          product={pickerProduct}
          colors={colors}
          sizes={sizes}
          onClose={() => setPickerProduct(null)}
          onAdd={cart.addLine}
        />
      )}
    </div>
  );
}
