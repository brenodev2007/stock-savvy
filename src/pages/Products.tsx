import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { useCreateCategory, Category } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Filter,
  Plus,
  Search,
  Upload,
  Package,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  Product,
} from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useStockBalances } from "@/hooks/useStockBalances";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { UpgradePromptModal } from "@/components/subscription/UpgradePromptModal";

export default function Products() {
  // ... existing hooks
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: stockBalances } = useStockBalances();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { canCreate, message: limitMessage, usage: productUsage } = useCanCreate('products');

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const createCategory = useCreateCategory();

  // ... rest of the component

  // Ensure button is not disabled
  // Update onClick handler

  return (
    <AppLayout title="Produtos" subtitle="Gerencie o catálogo de produtos">
      
      <div className="mb-6 flex flex-col gap-4">
        {/* ... search and filters ... */}
        
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              if (!canCreate) {
                setUpgradeModalOpen(true);
                return;
              }
              setEditingProduct(null);
              form.reset();
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={() => {
              setEditingCategory(null);
              setCategoryFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Nova Categoria
          </Button>
        </div>
      </div>

      {/* ... list and tables ... */}

      {/* Dialogs */}
      
      <UpgradePromptModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        feature="Cadastrar Produtos"
        description={limitMessage || "Você atingiu o limite de produtos do seu plano atual."}
      />

      <Dialog
        open={formOpen}
        // ...

  sku: z.string().min(1, "Código é obrigatório").max(50),
  name: z.string().min(1, "Nome é obrigatório").max(200),
  description: z.string().max(500).optional(),
  unit: z.string().min(1, "Unidade é obrigatória"),
  category_id: z.string().optional(),
  cost: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
  min_stock: z.coerce.number().min(0),
});

const units = [
  { value: "un", label: "Unidade (un)" },
  { value: "cx", label: "Caixa (cx)" },
  { value: "pct", label: "Pacote (pct)" },
  { value: "kg", label: "Quilograma (kg)" },
  { value: "l", label: "Litro (l)" },
  { value: "m", label: "Metro (m)" },
  { value: "resma", label: "Resma" },
];

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: stockBalances } = useStockBalances();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { canCreate, message: limitMessage, usage: productUsage } = useCanCreate('products');

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const createCategory = useCreateCategory();

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      unit: "un",
      category_id: "",
      cost: 0,
      price: 0,
      min_stock: 0,
    },
  });

  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      sku: product.sku,
      name: product.name,
      description: product.description || "",
      unit: product.unit,
      category_id: product.category_id || "",
      cost: product.cost,
      price: product.price,
      min_stock: product.min_stock,
    });
    setFormOpen(true);
  };

  const handleCreateCategory = async (data: {
    name: string;
    description?: string;
  }) => {
    await createCategory.mutateAsync(data);
    setCategoryFormOpen(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    if (editingProduct) {
      await updateProduct.mutateAsync({ id: editingProduct.id, ...data });
    } else {
      await createProduct.mutateAsync(data);
    }
    setFormOpen(false);
    setEditingProduct(null);
    form.reset();
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteProduct.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (isLoading) {
    return (
      <AppLayout title="Produtos" subtitle="Gerencie o catálogo de produtos">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Produtos" subtitle="Gerencie o catálogo de produtos">
     
      
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px] sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              if (!canCreate) {
                setUpgradeModalOpen(true);
                return;
              }
              setEditingProduct(null);
              form.reset();
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={() => {
              setEditingCategory(null);
              setCategoryFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Nova Categoria
          </Button>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {filteredProducts?.length || 0} produto(s) encontrado(s)
      </p>

      {/* Desktop table */}
      <div className="hidden lg:block rounded-lg border border-border bg-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Código (Ref.)</th>
              <th>Categoria</th>
              <th className="text-right">Estoque</th>
              <th className="text-right">Custo</th>
              <th className="text-right">Preço</th>
              <th className="text-center">Status</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts?.map((product) => {
              const stock = stockBalances?.filter(b => b.product_id === product.id).reduce((sum, b) => sum + b.quantity, 0) ?? 0;
              const isLowStock = stock < product.min_stock;
              const isOutOfStock = stock === 0;
              return (
                <tr key={product.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {product.name}
                        </p>
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
                      {product.sku}
                    </code>
                  </td>
                  <td className="text-muted-foreground">
                    {product.category?.name ?? "-"}
                  </td>
                  <td className="text-right">
                    <span
                      className={cn(
                        "font-medium",
                        isOutOfStock && "text-destructive",
                        isLowStock && !isOutOfStock && "text-warning"
                      )}
                    >
                      {stock}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      {product.unit}
                    </span>
                  </td>
                  <td className="text-right text-muted-foreground">
                    {formatCurrency(product.cost)}
                  </td>
                  <td className="text-right font-medium">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="text-center">
                    {isOutOfStock ? (
                      <span className="badge-danger">Sem estoque</span>
                    ) : isLowStock ? (
                      <span className="badge-warning">Baixo</span>
                    ) : (
                      <span className="badge-success">OK</span>
                    )}
                  </td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(product)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredProducts?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 font-medium">Nenhum produto cadastrado</p>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {filteredProducts?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 font-medium">Nenhum produto cadastrado</p>
          </div>
        ) : (
          filteredProducts?.map((product) => {
            const stock = stockBalances?.filter(b => b.product_id === product.id).reduce((sum, b) => sum + b.quantity, 0) ?? 0;
            const isLowStock = stock < product.min_stock;
            const isOutOfStock = stock === 0;
            return (
              <div key={product.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{product.name}</p>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{product.sku}</code>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover">
                      <DropdownMenuItem onClick={() => handleEdit(product)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(product)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{product.category?.name ?? "Sem categoria"}</span>
                  {isOutOfStock ? (
                    <span className="badge-danger">Sem estoque</span>
                  ) : isLowStock ? (
                    <span className="badge-warning">Baixo</span>
                  ) : (
                    <span className="badge-success">OK</span>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Estoque</p>
                    <p className={cn(
                      "font-bold",
                      isOutOfStock && "text-destructive",
                      isLowStock && !isOutOfStock && "text-warning"
                    )}>
                      {stock} {product.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Preço</p>
                    <p className="font-bold">{formatCurrency(product.price)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <UpgradePromptModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        feature="Cadastrar Produtos"
        description={limitMessage || "Você atingiu o limite de produtos do seu plano atual."}
      />

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditingProduct(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Atualize as informações do produto."
                : "Preencha os dados para cadastrar um novo produto."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código (Referência)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map((u) => (
                            <SelectItem key={u.value} value={u.value}>
                              {u.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Camiseta de Algodão"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Tamanho M, Cor Azul (Opcional)"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custo (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="min_stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque Mínimo</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                >
                  {(createProduct.isPending || updateProduct.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingProduct ? "Salvar" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Excluir <strong>{deleteTarget?.name}</strong>? Esta ação não pode
              ser desfeita.
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

      <CategoryForm
        open={categoryFormOpen}
        onOpenChange={(open) => setCategoryFormOpen(open)}
        category={editingCategory}
        onSubmit={handleCreateCategory}
        isLoading={createCategory.isPending}
      />
    </AppLayout>
  );
}
