/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Search,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
  useMovements,
  useCreateMovement,
  useUpdateMovement,
  useDeleteMovement,
  MovementType,
  StockMovement,
} from "@/hooks/useMovements";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProducts } from "@/hooks/useProducts";
import { useWarehouses } from "@/hooks/useWarehouses";
import { MovementForm } from "@/components/movements/MovementForm";
import { QuickAddMovement } from "@/components/movements/QuickAddMovement";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const typeConfig = {
  IN: {
    label: "Entrada",
    icon: ArrowDownLeft,
    color: "text-success bg-success/10",
  },
  OUT: {
    label: "Saída",
    icon: ArrowUpRight,
    color: "text-destructive bg-destructive/10",
  },
  TRANSFER: {
    label: "Transferência",
    icon: ArrowRightLeft,
    color: "text-info bg-info/10",
  },
  ADJUST: {
    label: "Ajuste",
    icon: ArrowRightLeft,
    color: "text-warning bg-warning/10",
  },
};

export default function Movements() {
  const { data: movements, isLoading } = useMovements();
  const { data: products } = useProducts();
  const { data: warehouses } = useWarehouses();
  const createMovement = useCreateMovement();
  const updateMovement = useUpdateMovement();
  const deleteMovement = useDeleteMovement();

  const [formOpen, setFormOpen] = useState(false);
  const [movementType, setMovementType] = useState<MovementType>("IN");
  const [search, setSearch] = useState("");
  const [editingMovement, setEditingMovement] = useState<StockMovement | null>(null);
  const [movementToDelete, setMovementToDelete] = useState<StockMovement | null>(
    null
  );

  const openForm = (type: MovementType) => {
    setMovementType(type);
    setEditingMovement(null);
    setFormOpen(true);
  };

  const handleEdit = (movement: StockMovement) => {
    setEditingMovement(movement);
    setMovementType(movement.type);
    setFormOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (editingMovement) {
      await updateMovement.mutateAsync({ ...data, id: editingMovement.id });
    } else {
      await createMovement.mutateAsync(data);
    }
    setFormOpen(false);
    setEditingMovement(null);
  };

  const handleDelete = async () => {
    if (movementToDelete) {
      await deleteMovement.mutateAsync(movementToDelete.id);
      setMovementToDelete(null);
    }
  };

  const filteredMovements = movements?.filter(
    (m) =>
      m.product?.name.toLowerCase().includes(search.toLowerCase()) ||
      m.product?.sku.toLowerCase().includes(search.toLowerCase()) ||
      m.reference?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <AppLayout
        title="Movimentações"
        subtitle="Registre entradas, saídas e transferências"
      >
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Entrada e Saída"
      subtitle="Registre o que entra e sai do estoque"
    >
      <div className="mb-6 flex flex-col gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por produto ou referência..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => openForm("IN")}
          >
            <ArrowDownLeft className="mr-2 h-4 w-4 text-success" />
            <span className="hidden xs:inline">Entrada</span>
            <span className="xs:hidden">Ent.</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => openForm("OUT")}
          >
            <ArrowUpRight className="mr-2 h-4 w-4 text-destructive" />
            <span className="hidden xs:inline">Saída</span>
            <span className="xs:hidden">Saída</span>
          </Button>
          <Button
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => openForm("TRANSFER")}
          >
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Transferência</span>
            <span className="xs:hidden">Transf.</span>
          </Button>
        </div>
      </div>

      <QuickAddMovement 
        products={products || []} 
        warehouses={warehouses || []}
        onAdd={async (data) => {
          await createMovement.mutateAsync(data);
        }}
      />

      {filteredMovements?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ArrowRightLeft className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 font-medium text-foreground">
            Nenhuma movimentação encontrada
          </p>
          <p className="text-sm text-muted-foreground">
            Registre sua primeira movimentação acima.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
            <Table className="table-fixed">
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-center">Tipo</TableHead>
                  <TableHead className="text-center">Produto</TableHead>
                  <TableHead className="text-center">Origem</TableHead>
                  <TableHead className="text-center">Destino</TableHead>
                  <TableHead className="text-center">Quantidade</TableHead>
                  <TableHead className="text-center">Referência</TableHead>
                  <TableHead className="text-center">Data</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements?.map((movement) => {
                  const config = typeConfig[movement.type];
                  const Icon = config.icon;
                  return (
                    <TableRow key={movement.id} className="group transition-colors duration-200">
                      <TableCell className="text-center">
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${config.color}`}
                        >
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-center">
                          <span className="font-semibold text-foreground leading-tight">
                            {movement.product?.name}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground mt-0.5">
                            {movement.product?.sku}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground/80 font-medium text-center">
                        {movement.warehouse_from?.name || <span className="text-muted-foreground/30">—</span>}
                      </TableCell>
                      <TableCell className="text-muted-foreground/80 font-medium text-center">
                        {movement.warehouse_to?.name || <span className="text-muted-foreground/30">—</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-black text-primary text-base">
                          {movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {movement.reference ? (
                          <code className="rounded bg-muted/50 px-2 py-0.5 text-xs font-mono text-muted-foreground border border-border/50">
                            {movement.reference}
                          </code>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {format(
                          new Date(movement.created_at),
                          "dd/MM/yy HH:mm",
                          { locale: ptBR }
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border shadow-xl rounded-xl p-1.5 min-w-[140px]">
                            <DropdownMenuItem onClick={() => handleEdit(movement)} className="rounded-lg gap-2 cursor-pointer">
                              <Pencil className="h-4 w-4" />
                              <span className="font-medium text-sm">Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem
                              onClick={() => setMovementToDelete(movement)}
                              className="text-destructive focus:text-destructive rounded-lg gap-2 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="font-medium text-sm">Excluir</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filteredMovements?.map((movement) => {
              const config = typeConfig[movement.type];
              const Icon = config.icon;
              return (
                <div
                  key={movement.id}
                  className="rounded-lg border border-border bg-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${config.color}`}
                    >
                      <Icon className="h-3 w-3" />
                      {config.label}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(movement.created_at), "dd/MM/yy HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{movement.product?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {movement.product?.sku}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="space-y-1">
                      {movement.warehouse_from && (
                        <p className="text-muted-foreground">
                          De:{" "}
                          <span className="text-foreground">
                            {movement.warehouse_from.name}
                          </span>
                        </p>
                      )}
                      {movement.warehouse_to && (
                        <p className="text-muted-foreground">
                          Para:{" "}
                          <span className="text-foreground">
                            {movement.warehouse_to.name}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{movement.quantity}</p>
                      {movement.reference && (
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {movement.reference}
                        </code>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        onClick={() => handleEdit(movement)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        onClick={() => setMovementToDelete(movement)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}


      <MovementForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingMovement(null);
        }}
        type={movementType}
        products={products || []}
        warehouses={warehouses || []}
        onSubmit={handleSubmit}
        isLoading={createMovement.isPending || updateMovement.isPending}
        initialData={editingMovement}
        onTypeChange={setMovementType}
      />

      <AlertDialog
        open={!!movementToDelete}
        onOpenChange={(open) => !open && setMovementToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir movimentação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta movimentação? Esta ação não pode
              ser desfeita e o estoque será revertido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
