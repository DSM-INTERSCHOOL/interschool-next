export type ProductType = "SINGLE" | "KIT";
export type ProductStatus = "ACTIVO" | "INACTIVO";
export type ObjetoImp = "01" | "02" | "03";

export interface ProductPriceInput {
  price: number;
  size_id?: number;
  color_id?: number;
}

export interface ProductPrice extends ProductPriceInput {
  id: number;
  product_id: number;
}

export interface ProductPicture {
  id: number;
  product_id: number;
  path: string;
}

export interface ProductSubProductInput {
  sub_product_id: number;
  quantity: number;
}

export interface ProductCreate {
  product_key?: string;
  title: string;
  description: string;
  type: ProductType;
  status?: ProductStatus;
  discount: number;
  tax: boolean;
  tax_base?: number;
  product_sat_id?: number;
  thumbnail?: string;
  clave_unidad_medida_sat?: string;
  objeto_imp?: ObjetoImp;
  color_ids: number[];
  size_ids: number[];
  category_ids: number[];
  sub_products: ProductSubProductInput[];
  prices: ProductPriceInput[];
}

// prices_to_add/price_ids_to_remove replace ProductCreate.prices -- there is
// no "update an existing price's amount in place" operation on the backend;
// changing an amount means removing that price id and adding a new one.
export interface ProductUpdate
  extends Partial<Omit<ProductCreate, "prices" | "sub_products">> {
  sub_products?: ProductSubProductInput[];
  prices_to_add?: ProductPriceInput[];
  price_ids_to_remove?: number[];
}

export interface ProductRead {
  id: number;
  school_id: number;
  product_key: string | null;
  title: string;
  description: string;
  type: ProductType;
  status: ProductStatus;
  discount: number;
  tax: boolean;
  tax_base: number | null;
  product_sat_id: number | null;
  thumbnail: string | null;
  clave_unidad_medida_sat: string | null;
  objeto_imp: ObjetoImp | null;
  created: string | null;
  modified: string | null;
  prices: ProductPrice[];
  pictures: ProductPicture[];
  color_ids: number[];
  size_ids: number[];
  category_ids: number[];
  sub_products: ProductSubProductInput[];
}

export interface ProductPictureAdded {
  id: number;
  path: string;
}
