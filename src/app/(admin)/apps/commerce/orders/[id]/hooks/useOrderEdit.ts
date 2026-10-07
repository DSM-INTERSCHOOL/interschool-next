import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ProductRead } from "@/interfaces/IProduct";
import { ColorRead } from "@/interfaces/IColor";
import { SizeRead } from "@/interfaces/ISize";
import { OrderRead, OrderUpdate } from "@/interfaces/IOrder";
import { getProducts } from "@/services/product.service";
import { getColors } from "@/services/color.service";
import { getSizes } from "@/services/size.service";
import {
  createOrderDetail,
  deleteOrderDetail,
  getOrder,
  updateOrder,
  updateOrderDetail,
} from "@/services/order.service";

export const useOrderEdit = (orderId: number) => {
  const [order, setOrder] = useState<OrderRead | null>(null);
  const [products, setProducts] = useState<ProductRead[]>([]);
  const [colors, setColors] = useState<ColorRead[]>([]);
  const [sizes, setSizes] = useState<SizeRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const [orderData, productsData, colorsData, sizesData] = await Promise.all([
        getOrder({ schoolId, orderId }),
        // Unfiltered by order_mode/top_category on purpose -- editing an
        // existing order can add any product, not just what either
        // order-entry flow currently exposes.
        getProducts({ schoolId, status: "ACTIVO", limit: 500 }),
        getColors({ schoolId }),
        getSizes({ schoolId }),
      ]);
      setOrder(orderData);
      setProducts(productsData);
      setColors(colorsData);
      setSizes(sizesData);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar la orden");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const runAction = async (action: () => Promise<void>) => {
    try {
      setActionLoading(true);
      setActionError(null);
      await action();
      await load();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || err.message || "No se pudo completar la acción");
    } finally {
      setActionLoading(false);
    }
  };

  const saveOrderInfo = (fields: OrderUpdate) =>
    runAction(async () => {
      const { schoolId } = getOrgConfig();
      await updateOrder({ schoolId, orderId, dto: fields });
    });

  const updateLineQuantity = (detailId: number, amount: number) =>
    runAction(async () => {
      const { schoolId } = getOrgConfig();
      await updateOrderDetail({ schoolId, detailId, dto: { amount } });
    });

  const removeLine = (detailId: number) =>
    runAction(async () => {
      const { schoolId } = getOrgConfig();
      await deleteOrderDetail({ schoolId, detailId });
    });

  const addLine = (params: {
    productId: number;
    color?: string;
    size?: string;
    amount: number;
    price: number;
  }) =>
    runAction(async () => {
      const { schoolId } = getOrgConfig();
      await createOrderDetail({
        schoolId,
        dto: {
          order_id: orderId,
          product_id: params.productId,
          amount: params.amount,
          color: params.color,
          size: params.size,
          price: params.price,
        },
      });
    });

  return {
    order,
    products,
    colors,
    sizes,
    loading,
    error,
    actionLoading,
    actionError,
    saveOrderInfo,
    updateLineQuantity,
    removeLine,
    addLine,
  };
};
