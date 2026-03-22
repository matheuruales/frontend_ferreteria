// =============================================================================
// Domain types — Multivariedades E-commerce
// These types mirror the backend Pydantic schemas and the database enums.
// =============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type UserRole = "cliente" | "gestor_tienda" | "administrador";

export type AccountStatus = "pending" | "active" | "suspended";

export type ProductStatus = "active" | "inactive";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "confirmed"
  | "shipped"
  | "completed"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "cancelled";

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: AccountStatus;
  created_at: string; // ISO 8601
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface AuthUserData {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  user: AuthUserData;
}

// ---------------------------------------------------------------------------
// API utilities
// ---------------------------------------------------------------------------

/** Represents a structured error returned by the FastAPI backend. */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Generic wrapper for API responses.
 * On success, `data` is populated and `error` is null.
 * On failure, `error` is populated and `data` is null.
 */
export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: ApiError };

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export type AdminUser = User;

export type AdminUserList = PaginatedResponse<AdminUser>;

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  short_description?: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  brand?: string;
  category_id?: string;
  status: ProductStatus;
  is_featured: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export type AdminProductList = PaginatedResponse<AdminProduct>;

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  parent_name?: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type AdminCategoryList = PaginatedResponse<AdminCategory>;

export interface DashboardMetric {
  value: number;
  previous_value: number;
  delta_percentage: number;
}

export interface DashboardSalesMonthPoint {
  key: string;
  label: string;
  total: number;
}

export interface DashboardSalesWeekPoint {
  key: string;
  label: string;
  total: number;
}

export interface DashboardSalesWeekdayPoint {
  key: string;
  label: string;
  total: number;
}

export interface DashboardCategorySalesPoint {
  category_name: string;
  total: number;
  percentage: number;
}

export interface DashboardRecentOrder {
  id: string;
  code: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

export interface DashboardLowStockProduct {
  id: string;
  name: string;
  sku?: string;
  stock: number;
}

export interface AdminDashboardSummary {
  sales_this_month: DashboardMetric;
  orders_this_month: DashboardMetric;
  new_customers_this_month: DashboardMetric;
  avg_ticket_this_month: DashboardMetric;
  sales_by_month: DashboardSalesMonthPoint[];
  sales_by_week: DashboardSalesWeekPoint[];
  sales_by_weekday: DashboardSalesWeekdayPoint[];
  sales_by_category: DashboardCategorySalesPoint[];
  recent_orders: DashboardRecentOrder[];
  low_stock_products: DashboardLowStockProduct[];
}

export interface AdminOrder {
  id: string;
  code: string;
  customer_name: string;
  total: number;
  status: OrderStatus;
  created_at: string;
  item_count: number;
}

export interface AdminOrderList {
  items: AdminOrder[];
  total: number;
  page: number;
  per_page: number;
}

export interface AdminOrderDetail {
  id: string;
  code: string;
  customer_name: string;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  total: number;
  created_at: string;
  item_count: number;
  shipping_address?: ShippingAddress;
  items: OrderItem[];
  payment?: PaymentInfo;
}

// ---------------------------------------------------------------------------
// Catalog — Phase 2
// ---------------------------------------------------------------------------

export interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
  position: number;
}

export interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number;
  image_url?: string;
  stock: number;
}

export interface ProductReview {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  user_name?: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  short_description?: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  image_url?: string;
  stock: number;
  brand?: string;
  category_id?: string;
  is_featured: boolean;
  status: ProductStatus;
  rating_average?: number;
  review_count?: number;
  images?: ProductImage[];
  related_products?: RelatedProduct[];
  reviews?: ProductReview[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_featured: boolean;
  sort_order: number;
  parent_id?: string;
  product_count?: number;
  subcategories?: Category[];
}

export interface BrandFacet {
  name: string;
  count: number;
}

export interface HomeData {
  featured_categories: Category[];
  featured_products: Product[];
}

export interface ProductListData {
  products: Product[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ---------------------------------------------------------------------------
// Cart — Phase 2
// ---------------------------------------------------------------------------

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image_url?: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  stock_available: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  item_count: number;
}

// ---------------------------------------------------------------------------
// Checkout — Phase 2
// ---------------------------------------------------------------------------

export interface ShippingAddress {
  recipient_name: string;
  address_line: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface CheckoutSummaryItem {
  product_id: string;
  product_name: string;
  product_image_url?: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface CheckoutSummary {
  items: CheckoutSummaryItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: ShippingAddress;
}

export interface CheckoutSessionResponse {
  checkout_url: string;
  payment_reference: string;
  amount: number;
  amount_in_cents: number;
  currency: string;
}

export interface CheckoutVerifyResponse {
  status: string;
  transaction_id: string;
  payment_reference?: string;
  order_id?: string;
  message?: string;
}

// ---------------------------------------------------------------------------
// Orders — Phase 2
// ---------------------------------------------------------------------------

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image_url?: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface PaymentInfo {
  payment_reference: string;
  provider_transaction_id?: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  total: number;
  created_at: string;
  item_count: number;
  items_preview: Array<{
    product_name: string;
    product_image_url?: string;
    quantity: number;
  }>;
}

export interface OrderDetail {
  id: string;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  total: number;
  created_at: string;
  shipping_address?: ShippingAddress;
  items: OrderItem[];
  payment?: PaymentInfo;
}

export interface PaginatedOrders {
  orders: Order[];
  total: number;
  page: number;
  per_page: number;
}

export interface OrderLookup {
  found: boolean;
  order_id?: string;
}
