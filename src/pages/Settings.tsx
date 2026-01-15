import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Save, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile } from '@/hooks/useProfiles';
import { toast } from 'sonner';

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(user?.name || '');
  const [hasChanges, setHasChanges] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    setHasChanges(value !== user?.name);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      await updateProfile.mutateAsync({ name });
      setHasChanges(false);
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Sessão encerrada');
    navigate('/auth');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppLayout title="Configurações" subtitle="Gerencie seu perfil e preferências">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Profile Section */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.avatar_url || undefined} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {getInitials(user?.name || 'U')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Informações do Perfil</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome / Razão Social</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="mt-1.5"
                  placeholder="Seu nome ou empresa"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="mt-1.5 bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  O e-mail não pode ser alterado
                </p>
              </div>
            </div>

            {hasChanges && (
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfile.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setName(user?.name || '');
                    setHasChanges(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Sessão</h3>
            <Button variant="destructive" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair da Conta
            </Button>
          </div>
        </div>

        {/* Info Section */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Sistema</h3>
              <p className="text-sm text-muted-foreground">
                Versão 2.0 - Powered by Node.js + TypeORM
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}