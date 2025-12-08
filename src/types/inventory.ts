export type UserRole = 'admin' | 'manager' | 'operator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unit: string;
  categoryId?: string;
  category?: Category;
  cost: number;
  price: number;
  minStock: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Warehouse {
  id: string;
  name: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ProductLot {
  id: string;
  productId: string;
  lotNumber: string;
  quantity: number;
  manufactureDate?: Date;
  expiryDate?: Date;
  cost: number;
  createdAt: Date;
}

export interface StockBalance {
  productId: string;
  warehouseId: string;
  quantity: number;
  product?: Product;
  warehouse?: Warehouse;
}

export type MovementType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUST';

export interface StockMovement {
  id: string;
  productId: string;
  warehouseFromId?: string;
  warehouseToId?: string;
  quantity: number;
  type: MovementType;
  userId: string;
  reason?: string;
  reference?: string;
  lotId?: string;
  timestamp: Date;
  product?: Product;
  user?: User;
}

export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  expiringCount: number;
  movementsToday: number;
  warehousesCount: number;
}
