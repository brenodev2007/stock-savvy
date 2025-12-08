import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, Building, Lock, Mail, User } from 'lucide-react';

export default function Settings() {
  return (
    <AppLayout title="Configurações" subtitle="Preferências do sistema">
      <div className="max-w-2xl space-y-8">
        {/* Company Settings */}
        <section className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Dados da Empresa</h3>
              <p className="text-sm text-muted-foreground">
                Informações básicas da organização
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="company">Nome da Empresa</Label>
                <Input id="company" placeholder="Sua Empresa Ltda" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" placeholder="00.000.000/0001-00" className="mt-1.5" />
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Bell className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Notificações</h3>
              <p className="text-sm text-muted-foreground">
                Configure alertas e avisos
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Estoque baixo</p>
                <p className="text-sm text-muted-foreground">
                  Alerta quando produto atingir estoque mínimo
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Lotes vencendo</p>
                <p className="text-sm text-muted-foreground">
                  Alerta de lotes próximos ao vencimento
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">E-mail diário</p>
                <p className="text-sm text-muted-foreground">
                  Resumo diário de movimentações
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </section>

        {/* User Settings */}
        <section className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <User className="h-5 w-5 text-info" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Minha Conta</h3>
              <p className="text-sm text-muted-foreground">
                Informações pessoais e acesso
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Seu nome" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="mt-1.5"
                />
              </div>
            </div>
            <Button variant="outline">
              <Lock className="mr-2 h-4 w-4" />
              Alterar Senha
            </Button>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancelar</Button>
          <Button>Salvar Alterações</Button>
        </div>
      </div>
    </AppLayout>
  );
}
