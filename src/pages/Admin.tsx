import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Search,
  User as UserIcon,
} from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface UserData {
  id: string;
  email: string;
  name: string;
  cpf_cnpj: string | null;
  is_active: boolean;
  role: string;
  created_at: string;
}

export default function Admin() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users = [], isLoading } = useQuery<UserData[]>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return data;
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: string;
      is_active: boolean;
    }) => {
      const { data } = await api.patch(`/admin/users/${id}/status`, {
        is_active,
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || "Erro ao alterar status do usuário"
      );
    },
  });

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout
      title="Painel Administrativo"
      subtitle="Gerencie os acessos e permissões dos usuários"
    >
      <div className="space-y-6">
        {/* Search bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            {filteredUsers.length} usuário(s) encontrado(s)
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    Carregando usuários...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="p-4 bg-muted/20 rounded-full mb-4">
                        <UserIcon className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                      <p className="font-bold text-muted-foreground/60 uppercase tracking-widest text-xs">
                        Nenhum usuário encontrado
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="group transition-colors duration-200">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                          <UserIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground leading-tight">
                            {user.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.cpf_cnpj || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(
                        new Date(user.created_at),
                        "dd 'de' MMMM, yyyy",
                        { locale: ptBR }
                      )}
                    </TableCell>
                    <TableCell>
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          <ShieldAlert className="h-3.5 w-3.5" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400">
                          <UserIcon className="h-3.5 w-3.5" /> Usuário
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                          <CheckCircle2 className="h-4 w-4" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm text-destructive font-medium">
                          <XCircle className="h-4 w-4" /> Inativo
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={user.is_active ? "destructive" : "default"}
                        size="sm"
                        disabled={toggleStatusMutation.isPending}
                        onClick={() =>
                          toggleStatusMutation.mutate({
                            id: user.id,
                            is_active: !user.is_active,
                          })
                        }
                      >
                        {user.is_active ? "Desativar" : "Ativar Acesso"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Carregando usuários...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="font-medium text-muted-foreground">
                Nenhum usuário encontrado
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="rounded-xl border border-border bg-card p-4 space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  {/* Role badge */}
                  {user.role === "admin" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 flex-shrink-0">
                      <ShieldAlert className="h-3 w-3" /> Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 flex-shrink-0">
                      <UserIcon className="h-3 w-3" /> Usuário
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex items-center justify-between text-sm border-t border-border pt-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      CPF/CNPJ:{" "}
                      <span className="text-foreground font-medium">
                        {user.cpf_cnpj || "-"}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cadastro:{" "}
                      <span className="text-foreground font-medium">
                        {format(new Date(user.created_at), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </span>
                    </p>
                  </div>
                  {user.is_active ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                      <CheckCircle2 className="h-4 w-4" /> Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm text-destructive font-medium">
                      <XCircle className="h-4 w-4" /> Inativo
                    </span>
                  )}
                </div>

                {/* Action */}
                <Button
                  variant={user.is_active ? "destructive" : "default"}
                  size="sm"
                  className="w-full"
                  disabled={toggleStatusMutation.isPending}
                  onClick={() =>
                    toggleStatusMutation.mutate({
                      id: user.id,
                      is_active: !user.is_active,
                    })
                  }
                >
                  {user.is_active ? "Desativar Acesso" : "Ativar Acesso"}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}