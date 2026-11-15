import { useMemo, useState } from "react";
import { ProductRead } from "@/interfaces/IProduct";
import { ColorRead } from "@/interfaces/IColor";
import { SizeRead } from "@/interfaces/ISize";
import { OrderMode, TopCategoryRead } from "@/interfaces/ITopCategory";
import { cartLineKey, useCart, useCheckout, useClientBalance, useProductAvailability } from "../hooks";
import { ALL_CATEGORIES, CategoryRail } from "./CategoryRail";
import { ProductGrid } from "./ProductGrid";
import { ProductPickerModal } from "./ProductPickerModal";
import { ProductSearchModal } from "./ProductSearchModal";
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
  // Display-only: who to show as "cliente activo" in the header.
  // OPERATOR mode sets this (the searched/selected client's name);
  // self-service leaves it unset -- there's nothing to disambiguate when
  // the logged-in person is always both the submitter and the client.
  clientLabel?: string;
  // Display-only, small/discreet: which physical warehouse this screen is
  // selling from (OPERATOR mode only -- self-service omits it, there's
  // nothing to disambiguate for the person using the kiosk themselves).
  warehouseLabel?: string;
  orderMode: OrderMode;
  onCancel: () => void;
}

export function OrderingScreen({
  categories,
  products,
  colors,
  sizes,
  clientPersonInternalId,
  clientLabel,
  warehouseLabel,
  orderMode,
  onCancel,
}: OrderingScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES);
  const [pickerProduct, setPickerProduct] = useState<ProductRead | null>(null);
  const [showPickupScreen, setShowPickupScreen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const cart = useCart();
  const checkout = useCheckout();
  const { getAvailableQty } = useProductAvailability(products, orderMode);
  const walletBalance = useClientBalance(clientPersonInternalId);

  // How many MORE of this exact variant can still be added -- nets the raw
  // available quantity against what's already sitting in the cart for it,
  // since addLine merges into that same line rather than stacking a second
  // one. CartPanel's own +/- stepper checks getAvailableQty directly
  // instead (a line's quantity there is the full amount, not an addition).
  const getRemainingStock = (productId: number, colorId: number | null, sizeId: number | null) => {
    const available = getAvailableQty(productId, colorId, sizeId);
    if (available === null) return null;
    const inCart = cart.lines.find((l) => l.key === cartLineKey(productId, colorId, sizeId))?.quantity ?? 0;
    return Math.max(0, available - inCart);
  };

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
        orderId={checkout.order.id}
        total={Number(checkout.order.total)}
        submitting={checkout.phase === "submittingPayment"}
        error={checkout.error}
        clientLabel={clientLabel}
        onChoose={checkout.choosePaymentMethod}
        walletBalance={walletBalance}
        onChooseSaldo={checkout.choosePaymentWithBalance}
        speiEnabled={checkout.speiEnabled}
      />
    );
  }

  if (showPickupScreen) {
    return (
      <PickupNameScreen
        total={cart.total}
        submitting={checkout.phase === "creatingOrder"}
        error={checkout.error}
        clientLabel={clientLabel}
        onBack={() => setShowPickupScreen(false)}
        onSubmit={(pickupName) =>
          checkout.createOrderWithDetails(cart.lines, pickupName, clientPersonInternalId, orderMode)
        }
      />
    );
  }

  return (
    <div className="flex h-[75vh] min-h-[32rem] w-full overflow-hidden rounded-2xl border border-base-300 bg-base-100">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-base-300 bg-base-100 px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Nueva Orden</h1>
              {clientLabel && (
                <div className="badge badge-lg badge-outline gap-2 py-4">
                  <span className="iconify lucide--user-round size-4"></span>
                  {clientLabel}
                </div>
              )}
            </div>
            {warehouseLabel && (
              <p className="flex items-center gap-1 text-xs text-base-content/40">
                <span className="iconify lucide--warehouse size-3"></span>
                {warehouseLabel}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="btn btn-outline btn-sm h-auto gap-2 rounded-xl px-4 py-2 font-semibold"
          >
            <span className="iconify lucide--search size-4"></span>
            Buscar
          </button>
        </div>
        <CategoryRail categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
        <ProductGrid products={visibleProducts} onSelect={setPickerProduct} />
      </div>

      <CartPanel
        lines={cart.lines}
        total={cart.total}
        onUpdateQuantity={cart.updateQuantity}
        onRemove={cart.removeLine}
        onCancel={() => setConfirmCancel(true)}
        onProceedToPickup={() => setShowPickupScreen(true)}
        getAvailableQty={getAvailableQty}
      />

      {pickerProduct && (
        <ProductPickerModal
          product={pickerProduct}
          colors={colors}
          sizes={sizes}
          onClose={() => setPickerProduct(null)}
          onAdd={cart.addLine}
          getRemainingStock={getRemainingStock}
        />
      )}

      {searchOpen && (
        <ProductSearchModal
          products={products}
          onClose={() => setSearchOpen(false)}
          onSelect={(product) => {
            setSearchOpen(false);
            setPickerProduct(product);
          }}
        />
      )}

      {confirmCancel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setConfirmCancel(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-base-100 p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="iconify lucide--alert-triangle mx-auto mb-3 size-12 text-warning"></span>
            <h2 className="text-xl font-bold">¿Cancelar esta orden?</h2>
            <p className="mt-2 text-base-content/60">
              {cart.lines.length > 0
                ? "Se perderán los artículos agregados al carrito."
                : "Se cerrará esta pantalla sin crear ninguna orden."}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setConfirmCancel(false)}
                className="btn btn-lg h-auto w-full rounded-2xl py-3 text-lg"
              >
                Continuar con la orden
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-error btn-lg h-auto w-full rounded-2xl py-3 text-lg"
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
