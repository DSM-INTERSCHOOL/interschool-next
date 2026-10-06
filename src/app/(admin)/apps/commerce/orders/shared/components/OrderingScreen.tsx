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
import { PickupNameScreen } from "./PickupNameScreen";
import { PaymentMethodScreen } from "./PaymentMethodScreen";
import { ConfirmationScreen } from "./ConfirmationScreen";

interface OrderingScreenProps {
  categories: TopCategoryRead[];
  products: ProductRead[];
  colors: ColorRead[];
  sizes: SizeRead[];
  // The client the order is for. Self-service passes the logged-in
  // person's own id; OPERATOR mode passes whichever client was searched
  // and selected before reaching this screen. Undefined for guest
  // checkout.
  clientPersonInternalId: string | undefined;
  onCancel: () => void;
}

export function OrderingScreen({
  categories,
  products,
  colors,
  sizes,
  clientPersonInternalId,
  onCancel,
}: OrderingScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES);
  const [pickerProduct, setPickerProduct] = useState<ProductRead | null>(null);
  const [showPickupScreen, setShowPickupScreen] = useState(false);
  const cart = useCart();
  const checkout = useCheckout();

  const visibleProducts = useMemo(() => {
    if (selectedCategory === ALL_CATEGORIES) return products;
    const categoryId = Number(selectedCategory);
    return products.filter((product) => product.top_category_id === categoryId);
  }, [products, selectedCategory]);

  if (checkout.phase === "done" && checkout.instructions) {
    return <ConfirmationScreen instructions={checkout.instructions} onNewOrder={onCancel} />;
  }

  // Order already exists (still PENDING) -- show the payment-method
  // screen until it's placed, including while retrying after an error on
  // the checkout step itself (order stays put, no need to recreate it).
  if (checkout.order) {
    return (
      <PaymentMethodScreen
        total={Number(checkout.order.total)}
        submitting={checkout.phase === "submittingPayment"}
        error={checkout.error}
        onChoose={checkout.choosePaymentMethod}
      />
    );
  }

  if (showPickupScreen) {
    return (
      <PickupNameScreen
        total={cart.total}
        submitting={checkout.phase === "creatingOrder"}
        error={checkout.error}
        onBack={() => setShowPickupScreen(false)}
        onSubmit={(pickupName) =>
          checkout.createOrderWithDetails(cart.lines, pickupName, clientPersonInternalId)
        }
      />
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex bg-base-100">
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
        onProceedToPickup={() => setShowPickupScreen(true)}
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
