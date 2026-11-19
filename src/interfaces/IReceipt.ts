export interface ReceiptItemSnapshot {
  product_id: number;
  title: string;
  color: string | null;
  size: string | null;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

export interface ReceiptPaymentSnapshot {
  payment_method: string;
  amount: string;
  reference: string | null;
}

export interface ReceiptRead {
  id: number;
  school_id: number;
  order_id: number;
  folio: number;
  client_person_internal_id: string | null;
  client_name: string;
  collected_by: string | null; // snapshot of the order's "quien recoge"
  total: string;
  total_in_words: string;
  items: ReceiptItemSnapshot[];
  payments: ReceiptPaymentSnapshot[];
  created: string | null;
}
