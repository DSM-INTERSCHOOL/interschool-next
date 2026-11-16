export interface SalesGeneralOrderRow {
  order_id: number;
  id_orden: number;
  paid_at: string | null;
  client_person_internal_id: string | null;
  client_name: string;
  items_count: number;
  total_amount: string;
}

export interface SalesGeneralReport {
  start: string;
  end: string;
  orders_count: number;
  items_count: number;
  total_amount: string;
  average_ticket: string;
  orders: SalesGeneralOrderRow[];
}

export interface SalesByProductRow {
  product_id: number;
  title: string;
  color: string | null;
  size: string | null;
  quantity: number;
  amount: string;
}

export interface SalesByTopCategoryRow {
  top_category_id: number | null;
  description: string;
  quantity: number;
  amount: string;
}

export interface SalesByCategoryRow {
  category_id: number;
  description: string;
  quantity: number;
  amount: string;
}

export interface SalesByCategoryProductRow {
  category_id: number;
  category_description: string;
  product_id: number;
  product_title: string;
  quantity: number;
  amount: string;
}

export interface SalesByUserRow {
  person_internal_id: string | null;
  name: string;
  orders_count: number;
  quantity: number;
  amount: string;
}
