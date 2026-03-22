/**
 * Centralized HTTP client for the FastAPI backend.
 *
 * All communication between the Next.js frontend and the backend MUST go
 * through this module. This enforces Principle X (decoupled external
 * integrations): the backend URL and auth headers are managed in one place.
 *
 * Usage:
 *   import { apiClient } from "@/lib/api-client";
 *   const result = await apiClient.auth.login({ email, password });
 */

import { getToken } from "@/lib/auth";
import type {
  AdminCategory,
  AdminCategoryList,
  AdminDashboardSummary,
  AdminOrderDetail,
  AdminOrder,
  AdminOrderList,
  AdminProduct,
  AdminProductList,
  AdminUserList,
  ApiError,
  ApiResponse,
  BrandFacet,
  Category,
  Cart,
  CheckoutSessionResponse,
  CheckoutSummary,
  CheckoutVerifyResponse,
  HomeData,
  LoginResponse,
  OrderDetail,
  OrderLookup,
  PaginatedOrders,
  Product,
  ProductListData,
  ShippingAddress,
  User,
} from "@/types";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Core request method
// ---------------------------------------------------------------------------

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    return {
      data: null,
      error: {
        message: "Error de conexión. Verifica tu conexión a internet.",
        code: "NETWORK_ERROR",
      },
    };
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
    const errorCode =
      typeof errorBody["code"] === "string" ? errorBody["code"] : undefined;
    const detail = errorBody["detail"];
    let message = "Ocurrió un error. Por favor, intenta de nuevo.";

    if (typeof detail === "string") {
      message = detail;
    } else if (Array.isArray(detail) && detail.length > 0) {
      const parts = detail
        .map((entry) => {
          if (!entry || typeof entry !== "object") return null;
          const e = entry as Record<string, unknown>;
          const msg = typeof e["msg"] === "string" ? e["msg"] : "";
          const loc = Array.isArray(e["loc"])
            ? e["loc"].map((x) => String(x)).join(".")
            : "";
          if (!msg) return null;
          return loc ? `${loc}: ${msg}` : msg;
        })
        .filter((x): x is string => Boolean(x));
      if (parts.length > 0) {
        message = parts.join(" | ");
      }
    }

    const apiError: ApiError = {
      message,
      ...(errorCode !== undefined && { code: errorCode }),
      status: response.status,
    };
    return { data: null, error: apiError };
  }

  // 204 No Content — return null as data
  if (response.status === 204) {
    return { data: null as T, error: null };
  }

  const data = (await response.json()) as T;
  return { data, error: null };
}

// ---------------------------------------------------------------------------
// Auth module
// ---------------------------------------------------------------------------

const auth = {
  register: (body: { full_name: string; email: string; password: string }) =>
    request<{ message: string; user_id: string }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  logout: () =>
    request<{ message: string }>("/api/v1/auth/logout", { method: "POST" }),

  me: () => request<User>("/api/v1/auth/me"),

  resendVerification: (body: { email: string }) =>
    request<{ message: string }>("/api/v1/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  verifyEmailCode: (body: { email: string; code: string }) =>
    request<{ message: string }>("/api/v1/auth/verify-email-code", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  forgotPassword: (body: { email: string }) =>
    request<{ message: string }>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  resetPassword: (body: {
    token: string;
    new_password: string;
    confirm_password: string;
  }) =>
    request<{ message: string }>("/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ---------------------------------------------------------------------------
// Users module
// ---------------------------------------------------------------------------

const users = {
  me: () => request<User>("/api/v1/users/me"),

  updateMe: (body: { full_name?: string }) =>
    request<User>("/api/v1/users/me", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

// ---------------------------------------------------------------------------
// Admin module
// ---------------------------------------------------------------------------

const admin = {
  listUsers: (params?: {
    page?: number;
    per_page?: number;
    role?: string;
    status?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.per_page !== undefined)
      query.set("per_page", String(params.per_page));
    if (params?.role) query.set("role", params.role);
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    return request<AdminUserList>(
      `/api/v1/admin/users${qs ? `?${qs}` : ""}`
    );
  },

  updateRole: (userId: string, body: { role: string }) =>
    request<User>(`/api/v1/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  updateStatus: (userId: string, body: { status: string }) =>
    request<User>(`/api/v1/admin/users/${userId}/status`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  listProducts: (params?: {
    page?: number;
    per_page?: number;
    q?: string;
    status?: "active" | "inactive";
  }) => {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.per_page !== undefined)
      query.set("per_page", String(params.per_page));
    if (params?.q) query.set("q", params.q);
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    return request<AdminProductList>(
      `/api/v1/admin/products${qs ? `?${qs}` : ""}`
    );
  },

  getProduct: (productId: string) =>
    request<AdminProduct>(`/api/v1/admin/products/${productId}`),

  createProduct: (body: {
    name: string;
    slug?: string;
    sku?: string;
    short_description?: string;
    description?: string;
    price: number;
    compare_at_price?: number;
    stock: number;
    brand?: string;
    category_id?: string;
    status?: "active" | "inactive";
    is_featured?: boolean;
    image_url?: string;
  }) =>
    request<AdminProduct>("/api/v1/admin/products", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateProduct: (
    productId: string,
    body: {
      name?: string;
      slug?: string;
      sku?: string;
      short_description?: string;
      description?: string;
      price?: number;
      compare_at_price?: number;
      stock?: number;
      brand?: string;
      category_id?: string;
      status?: "active" | "inactive";
      is_featured?: boolean;
      image_url?: string;
    }
  ) =>
    request<AdminProduct>(`/api/v1/admin/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteProduct: (productId: string) =>
    request<{ deleted: boolean }>(`/api/v1/admin/products/${productId}`, {
      method: "DELETE",
    }),

  listCategories: (params?: {
    page?: number;
    per_page?: number;
    q?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.per_page !== undefined)
      query.set("per_page", String(params.per_page));
    if (params?.q) query.set("q", params.q);
    const qs = query.toString();
    return request<AdminCategoryList>(
      `/api/v1/admin/categories${qs ? `?${qs}` : ""}`
    );
  },

  getCategory: (categoryId: string) =>
    request<AdminCategory>(`/api/v1/admin/categories/${categoryId}`),

  createCategory: (body: {
    name: string;
    slug?: string;
    description?: string;
    image_url?: string;
    parent_id?: string | null;
    is_featured?: boolean;
    sort_order?: number;
  }) =>
    request<AdminCategory>("/api/v1/admin/categories", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateCategory: (
    categoryId: string,
    body: {
      name?: string;
      slug?: string;
      description?: string;
      image_url?: string;
      parent_id?: string | null;
      is_featured?: boolean;
      sort_order?: number;
    }
  ) =>
    request<AdminCategory>(`/api/v1/admin/categories/${categoryId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteCategory: (categoryId: string) =>
    request<{ deleted: boolean }>(`/api/v1/admin/categories/${categoryId}`, {
      method: "DELETE",
    }),

  getDashboardSummary: () =>
    request<AdminDashboardSummary>("/api/v1/admin/dashboard"),

  listOrders: (params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.per_page !== undefined)
      query.set("per_page", String(params.per_page));
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    return request<AdminOrderList>(
      `/api/v1/admin/orders${qs ? `?${qs}` : ""}`
    );
  },

  getOrder: (orderId: string) =>
    request<AdminOrderDetail>(`/api/v1/admin/orders/${orderId}`),

  updateOrderStatus: (orderId: string, body: { status: string }) =>
    request<AdminOrder>(`/api/v1/admin/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

// ---------------------------------------------------------------------------
// Catalog module — Phase 2
// ---------------------------------------------------------------------------

const catalog = {
  home: () => request<HomeData>("/api/v1/catalog/home"),

  listProducts: (params?: {
    q?: string;
    category_slug?: string;
    brand?: string;
    min_price?: number;
    max_price?: number;
    min_rating?: number;
    in_stock?: boolean;
    on_sale?: boolean;
    page?: number;
    per_page?: number;
    sort?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.q) query.set("q", params.q);
    if (params?.category_slug) query.set("category_slug", params.category_slug);
    if (params?.brand) query.set("brand", params.brand);
    if (params?.min_price !== undefined)
      query.set("min_price", String(params.min_price));
    if (params?.max_price !== undefined)
      query.set("max_price", String(params.max_price));
    if (params?.min_rating !== undefined)
      query.set("min_rating", String(params.min_rating));
    if (params?.in_stock !== undefined)
      query.set("in_stock", String(params.in_stock));
    if (params?.on_sale !== undefined)
      query.set("on_sale", String(params.on_sale));
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.per_page !== undefined)
      query.set("per_page", String(params.per_page));
    if (params?.sort) query.set("sort", params.sort);
    const qs = query.toString();
    return request<ProductListData>(`/api/v1/catalog/products${qs ? `?${qs}` : ""}`);
  },

  getProduct: (slug: string) =>
    request<Product>(`/api/v1/catalog/products/${slug}`),

  listCategories: () =>
    request<{ categories: Category[] }>("/api/v1/catalog/categories"),

  listBrands: () =>
    request<{ brands: BrandFacet[] }>("/api/v1/catalog/brands"),
};

// ---------------------------------------------------------------------------
// Cart module — Phase 2
// ---------------------------------------------------------------------------

const cart = {
  getCart: () => request<Cart>("/api/v1/cart"),

  addItem: (body: { product_id: string; quantity: number }) =>
    request<{ id: string; product_id: string; quantity: number; subtotal: number }>(
      "/api/v1/cart/items",
      { method: "POST", body: JSON.stringify(body) }
    ),

  updateItem: (itemId: string, body: { quantity: number }) =>
    request<{ id: string; product_id: string; quantity: number; subtotal: number }>(
      `/api/v1/cart/items/${itemId}`,
      { method: "PUT", body: JSON.stringify(body) }
    ),

  removeItem: (itemId: string) =>
    request<null>(`/api/v1/cart/items/${itemId}`, { method: "DELETE" }),

  clearCart: () => request<null>("/api/v1/cart", { method: "DELETE" }),
};

// ---------------------------------------------------------------------------
// Checkout module — Phase 2
// ---------------------------------------------------------------------------

const checkout = {
  validateCheckout: (body: { shipping_address: ShippingAddress }) =>
    request<CheckoutSummary>("/api/v1/checkout/validate", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  createSession: (body: { shipping_address: ShippingAddress }) =>
    request<CheckoutSessionResponse>("/api/v1/checkout/session", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  verifyTransaction: (body: { transaction_id: string }) =>
    request<CheckoutVerifyResponse>("/api/v1/checkout/verify", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ---------------------------------------------------------------------------
// Orders module — Phase 2
// ---------------------------------------------------------------------------

const orders = {
  listOrders: (params?: { page?: number; per_page?: number }) => {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.per_page !== undefined)
      query.set("per_page", String(params.per_page));
    const qs = query.toString();
    return request<PaginatedOrders>(`/api/v1/orders${qs ? `?${qs}` : ""}`);
  },

  getOrder: (orderId: string) =>
    request<OrderDetail>(`/api/v1/orders/${orderId}`),

  lookupByPaymentReference: (paymentReference: string) => {
    const query = new URLSearchParams({
      payment_reference: paymentReference,
    });
    return request<OrderLookup>(`/api/v1/orders/lookup?${query.toString()}`);
  },
};

// ---------------------------------------------------------------------------
// Exported client
// ---------------------------------------------------------------------------

export const apiClient = { auth, users, admin, catalog, cart, checkout, orders };
