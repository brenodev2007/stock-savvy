import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LogOut, Save, User, Mail, CreditCard, Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile } from '@/hooks/useProfiles';
import { toast } from 'sonner';

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(user?.name || '');
  const [cpfCnpj, setCpfCnpj] = useState(user?.cpf_cnpj || '');
  const [hasChanges, setHasChanges] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    checkChanges(value, cpfCnpj);
  };

  const handleCpfCnpjChange = (value: string) => {
    // Remove non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as CPF (000.000.000-00) or CNPJ (00.000.000/0000-00)
    let formatted = '';
    if (cleaned.length <= 11) {
      // CPF
      formatted = cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ
      formatted = cleaned
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
    
    setCpfCnpj(formatted);
    checkChanges(name, formatted);
  };

  const checkChanges = (newName: string, newCpf: string) => {
    setHasChanges(
      newName !== user?.name || 
      newCpf !== (user?.cpf_cnpj || '')
    );
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      await updateProfile.mutateAsync({ 
        name,
        cpf_cnpj: cpfCnpj || null 
      });
      setHasChanges(false);
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Sessão encerrada com sucesso');
    navigate('/');
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
    <AppLayout title="Configurações do Perfil" subtitle="Gerencie seus dados e preferências do sistema">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-primary/10">
                  <AvatarImage src={user?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                    {getInitials(user?.name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-green-500 border-4 border-background flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </p>
                </div>
                <div className="flex gap-2 justify-center sm:justify-start">
                  <Badge variant="secondary" className="gap-1">
                    <User className="h-3 w-3" />
                    Conta Ativa
                  </Badge>
                  {user?.cpf_cnpj && (
                    <Badge variant="outline" className="gap-1">
                      <CreditCard className="h-3 w-3" />
                      {user.cpf_cnpj.length > 14 ? 'CNPJ' : 'CPF'} Cadastrado
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Atualize seus dados cadastrais e informações do perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">
                  Nome / Razão Social
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Digite seu nome ou empresa"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj" className="text-base">
                  CPF / CNPJ
                </Label>
                <Input
                  id="cpf_cnpj"
                  value={cpfCnpj}
                  onChange={(e) => handleCpfCnpjChange(e.target.value)}
                  placeholder="000.000.000-00"
                  maxLength={18}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Informe seu CPF ou CNPJ para identificação fiscal
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email" className="text-base">
                  E-mail
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="h-11 bg-muted/50 pr-10"
                  />
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  O e-mail não pode ser alterado por questões de segurança
                </p>
              </div>
            </div>

            {hasChanges && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                  className="sm:flex-1"
                  size="lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfile.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setName(user?.name || '');
                    setCpfCnpj(user?.cpf_cnpj || '');
                    setHasChanges(false);
                  }}
                  className="sm:flex-1"
                  size="lg"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>



        {/* Session & System Cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Logout Card */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <LogOut className="h-5 w-5" />
                Sessão
              </CardTitle>
              <CardDescription>
                Encerre sua sessão atual no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full"
                size="lg"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair da Conta
              </Button>
            </CardContent>
          </Card>

          {/* System Info Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Sistema
              </CardTitle>
              <CardDescription>
                Informações sobre o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Versão</span>
                <Badge variant="secondary">2.0.0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Backend</span>
                <Badge variant="outline">Node.js + TypeORM</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className="bg-green-500 hover:bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Operacional
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}