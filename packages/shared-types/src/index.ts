export interface Product {
  id: string;
  name: string;
  price: number;
  thumbnailUrl: string;
  sellerName: string;
  category: string;
  stock: number;
}

export interface Order {
  id: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
}
