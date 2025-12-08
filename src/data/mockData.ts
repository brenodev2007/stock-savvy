import { Product, Category, Warehouse, StockBalance, StockMovement, DashboardStats } from '@/types/inventory';

export const mockCategories: Category[] = [
  { id: '1', name: 'Eletrônicos', description: 'Componentes eletrônicos e dispositivos', createdAt: new Date() },
  { id: '2', name: 'Escritório', description: 'Material de escritório', createdAt: new Date() },
  { id: '3', name: 'Ferramentas', description: 'Ferramentas e equipamentos', createdAt: new Date() },
  { id: '4', name: 'Embalagens', description: 'Materiais de embalagem', createdAt: new Date() },
  { id: '5', name: 'Limpeza', description: 'Produtos de limpeza', createdAt: new Date() },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'ELEC-001',
    name: 'Cabo USB-C 2m',
    description: 'Cabo USB-C para carregamento rápido',
    unit: 'un',
    categoryId: '1',
    category: mockCategories[0],
    cost: 12.50,
    price: 29.90,
    minStock: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    sku: 'ELEC-002',
    name: 'Mouse Wireless',
    description: 'Mouse sem fio ergonômico',
    unit: 'un',
    categoryId: '1',
    category: mockCategories[0],
    cost: 35.00,
    price: 79.90,
    minStock: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    sku: 'OFIC-001',
    name: 'Papel A4 500fls',
    description: 'Resma de papel A4 75g',
    unit: 'resma',
    categoryId: '2',
    category: mockCategories[1],
    cost: 22.00,
    price: 32.90,
    minStock: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    sku: 'TOOL-001',
    name: 'Chave de Fenda Phillips',
    description: 'Chave de fenda Phillips #2',
    unit: 'un',
    categoryId: '3',
    category: mockCategories[2],
    cost: 8.50,
    price: 18.90,
    minStock: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    sku: 'PACK-001',
    name: 'Caixa Papelão P',
    description: 'Caixa de papelão pequena 20x15x10cm',
    unit: 'un',
    categoryId: '4',
    category: mockCategories[3],
    cost: 1.20,
    price: 2.50,
    minStock: 500,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    sku: 'LIMP-001',
    name: 'Detergente 500ml',
    description: 'Detergente neutro líquido',
    unit: 'un',
    categoryId: '5',
    category: mockCategories[4],
    cost: 2.80,
    price: 5.90,
    minStock: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockWarehouses: Warehouse[] = [
  { id: '1', name: 'Depósito Central', address: 'Rua Principal, 100', isActive: true, createdAt: new Date() },
  { id: '2', name: 'Loja Matriz', address: 'Av. Comercial, 500', isActive: true, createdAt: new Date() },
  { id: '3', name: 'CD Norte', address: 'Rod. Norte, km 45', isActive: true, createdAt: new Date() },
];

export const mockStockBalances: StockBalance[] = [
  { productId: '1', warehouseId: '1', quantity: 45, product: mockProducts[0], warehouse: mockWarehouses[0] },
  { productId: '1', warehouseId: '2', quantity: 12, product: mockProducts[0], warehouse: mockWarehouses[1] },
  { productId: '2', warehouseId: '1', quantity: 28, product: mockProducts[1], warehouse: mockWarehouses[0] },
  { productId: '3', warehouseId: '1', quantity: 85, product: mockProducts[2], warehouse: mockWarehouses[0] },
  { productId: '4', warehouseId: '1', quantity: 15, product: mockProducts[3], warehouse: mockWarehouses[0] },
  { productId: '5', warehouseId: '1', quantity: 320, product: mockProducts[4], warehouse: mockWarehouses[0] },
  { productId: '6', warehouseId: '2', quantity: 90, product: mockProducts[5], warehouse: mockWarehouses[1] },
];

export const mockMovements: StockMovement[] = [
  {
    id: '1',
    productId: '1',
    warehouseToId: '1',
    quantity: 100,
    type: 'IN',
    userId: '1',
    reason: 'Compra',
    reference: 'NF-123456',
    timestamp: new Date(Date.now() - 86400000),
    product: mockProducts[0],
  },
  {
    id: '2',
    productId: '1',
    warehouseFromId: '1',
    quantity: 10,
    type: 'OUT',
    userId: '1',
    reason: 'Venda',
    reference: 'PED-789',
    timestamp: new Date(Date.now() - 43200000),
    product: mockProducts[0],
  },
  {
    id: '3',
    productId: '2',
    warehouseFromId: '1',
    warehouseToId: '2',
    quantity: 5,
    type: 'TRANSFER',
    userId: '1',
    reason: 'Reposição loja',
    timestamp: new Date(),
    product: mockProducts[1],
  },
];

export const mockDashboardStats: DashboardStats = {
  totalProducts: 156,
  totalValue: 45780.50,
  lowStockCount: 8,
  expiringCount: 3,
  movementsToday: 24,
  warehousesCount: 3,
};

export const getLowStockProducts = (): (Product & { currentStock: number })[] => {
  return mockProducts
    .map(product => {
      const balance = mockStockBalances
        .filter(b => b.productId === product.id)
        .reduce((sum, b) => sum + b.quantity, 0);
      return { ...product, currentStock: balance };
    })
    .filter(p => p.currentStock < p.minStock);
};
