import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProductsTable } from '@/components/products/ProductsTable';
import { ProductForm } from '@/components/products/ProductForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Filter, Plus, Search, Upload } from 'lucide-react';
import {
  mockProducts,
  mockCategories,
  mockStockBalances,
} from '@/data/mockData';
import { Product } from '@/types/inventory';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Products() {
  const [products, setProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate stock balances by product
  const stockByProduct: Record<string, number> = {};
  mockStockBalances.forEach((balance) => {
    stockByProduct[balance.productId] =
      (stockByProduct[balance.productId] ?? 0) + balance.quantity;
  });

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || product.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleDelete = (product: Product) => {
    setDeleteProduct(product);
  };

  const confirmDelete = () => {
    if (deleteProduct) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));
      toast.success('Produto excluído com sucesso');
      setDeleteProduct(null);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                ...data,
                category: mockCategories.find((c) => c.id === data.categoryId),
                updatedAt: new Date(),
              }
            : p
        )
      );
      toast.success('Produto atualizado com sucesso');
    } else {
      const newProduct: Product = {
        id: String(Date.now()),
        ...data,
        category: mockCategories.find((c) => c.id === data.categoryId),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      toast.success('Produto cadastrado com sucesso');
    }

    setIsLoading(false);
    setFormOpen(false);
    setEditingProduct(null);
  };

  const handleFormClose = (open: boolean) => {
    if (!open) {
      setEditingProduct(null);
    }
    setFormOpen(open);
  };

  return (
    <AppLayout title="Produtos" subtitle="Gerencie o catálogo de produtos">
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome ou SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {mockCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredProducts.length} produto(s) encontrado(s)
        </p>
      </div>

      {/* Products Table */}
      <ProductsTable
        products={filteredProducts}
        stockBalances={stockByProduct}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Product Form Dialog */}
      <ProductForm
        open={formOpen}
        onOpenChange={handleFormClose}
        product={editingProduct}
        categories={mockCategories}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto{' '}
              <strong>{deleteProduct?.name}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
