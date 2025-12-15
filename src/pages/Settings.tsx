import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bell,
  Building,
  User,
  LogOut,
  Users,
  Save,
  Shield,
  Mail,
  Calendar,
  Undo2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles, useUpdateProfile, useUpdateUserRole } from '@/hooks/useProfiles';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Loader2, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const roleLabels = {
  admin: 'Administrador',
  manager: 'Gerente',
  operator: 'Operador',
};

const roleBadgeColors = {
  admin: 'bg-destructive/10 text-destructive border-destructive/20',
  manager: 'bg-warning/10 text-warning border-warning/20',
  operator: 'bg-info/10 text-info border-info/20',
};

export default function Settings() {
  const { profile, signOut, roles, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const { data: allUsers, isLoading: usersLoading } = useProfiles();
  const updateProfile = useUpdateProfile();
  const updateUserRole = useUpdateUserRole();
  const {
    settings,
    hasChanges,
    updateSettings,
    updateNotifications,
    saveSettings,
    resetSettings,
  } = useSettings();

  const [editingName, setEditingName] = useState(profile?.name || '');
  const [profileHasChanges, setProfileHasChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);

  // Email Change States
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailStep, setEmailStep] = useState<'input' | 'verify'>('input');
  const [newEmail, setNewEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Sessão encerrada');
    navigate('/auth');
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    await updateProfile.mutateAsync({ 
      userId: user.id, 
      name: editingName,
      avatar_url: uploadedAvatarUrl !== null ? uploadedAvatarUrl : undefined
    });
    setProfileHasChanges(false);
    setUploadedAvatarUrl(null);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida (JPG, PNG)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      toast.error('A imagem deve ter no máximo 2MB');
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setUploadedAvatarUrl(data.publicUrl);
      setProfileHasChanges(true);
      toast.success('Imagem carregada. Clique em "Salvar Alterações" para confirmar.');
    } catch (error: any) {
      toast.error('Erro ao fazer upload da imagem: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInitiateEmailChange = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error("Por favor, insira um e-mail válido.");
      return;
    }

    setIsEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      
      toast.success("Código de verificação enviado para o novo e-mail.");
      setEmailStep('verify');
    } catch (error: any) {
      toast.error("Erro ao iniciar troca de e-mail: " + error.message);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    if (otpCode.length !== 6) {
      toast.error("O código deve ter 6 dígitos.");
      return;
    }

    setIsEmailLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: newEmail,
        token: otpCode,
        type: 'email_change',
      });

      if (error) throw error;

      toast.success("E-mail atualizado com sucesso!");
      setIsEmailModalOpen(false);
      setNewEmail('');
      setOtpCode('');
      setEmailStep('input');
      // Auth state listener in AuthProvider will likely pick up the change
    } catch (error: any) {
      toast.error("Erro ao verificar código: " + error.message);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleSaveSettings = () => {
    saveSettings();
    toast.success('Configurações salvas com sucesso');
  };

  const handleNameChange = (value: string) => {
    setEditingName(value);
    setProfileHasChanges(value !== profile?.name);
  };

  const handleRoleChange = async (userId: string, role: 'admin' | 'manager' | 'operator') => {
    await updateUserRole.mutateAsync({ userId, role });
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
    <AppLayout title="Configurações" subtitle="Preferências do sistema e gerenciamento">
      <div className="w-full max-w-4xl mx-auto">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4 hidden sm:block" />
              <span>Meu Perfil</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4 hidden sm:block" />
                <span>Usuários</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="settings" className="gap-2">
              <Building className="h-4 w-4 hidden sm:block" />
              <span>Sistema</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <div className="relative group">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20 cursor-pointer">
                    <AvatarImage src={uploadedAvatarUrl || profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {getInitials(profile?.name || 'U')}
                    </AvatarFallback>
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                  </Avatar>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <Camera className="h-3 w-3" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground">{profile?.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {profile?.email}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {roles.map((r) => (
                      <Badge
                        key={r.id}
                        variant="outline"
                        className={roleBadgeColors[r.role]}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {roleLabels[r.role]}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Informações Pessoais</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Razão Social</Label>
                    <Input
                      id="name"
                      value={profile?.name || ''}
                      disabled
                      className="mt-1.5 bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      value={profile?.email || ''}
                      disabled
                      className="mt-1.5 bg-muted"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEmailModalOpen(true)}
                      className="mt-2 h-8 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-3 w-3 mr-1.5" />
                      Alterar E-mail
                    </Button>
                  </div>
                </div>

                <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Alterar E-mail</DialogTitle>
                      <DialogDescription>
                        {emailStep === 'input' 
                          ? "Informe o novo endereço de e-mail. Enviaremos um código de verificação."
                          : `Digite o código enviado para ${newEmail} para confirmar a alteração.`
                        }
                      </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                      {emailStep === 'input' ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Novo E-mail</Label>
                            <Input 
                              value={newEmail} 
                              onChange={(e) => setNewEmail(e.target.value)}
                              placeholder="novo@email.com"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center py-4">
                          <InputOTP
                            maxLength={6}
                            value={otpCode}
                            onChange={(value) => setOtpCode(value)}
                          >
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      {emailStep === 'input' ? (
                        <Button onClick={handleInitiateEmailChange} disabled={isEmailLoading}>
                          {isEmailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Enviar Código
                        </Button>
                      ) : (
                        <div className="flex gap-2 w-full justify-end">
                          <Button variant="ghost" onClick={() => setEmailStep('input')} disabled={isEmailLoading}>
                            Voltar
                          </Button>
                          <Button onClick={handleVerifyEmailChange} disabled={isEmailLoading}>
                            {isEmailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Validar e Alterar
                          </Button>
                        </div>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>


                {profileHasChanges && (
                  <div className="flex gap-2 pt-2">
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
                        setEditingName(profile?.name || '');
                        setProfileHasChanges(false);
                      }}
                    >
                      <Undo2 className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Sessão</h3>
                <Button variant="destructive" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair da Conta
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab (Admin only) */}
          {isAdmin && (
            <TabsContent value="users" className="space-y-6">
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Gerenciamento de Usuários
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Gerencie os papéis e permissões dos usuários
                      </p>
                    </div>
                  </div>
                </div>

                {usersLoading ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuário</TableHead>
                          <TableHead className="hidden sm:table-cell">E-mail</TableHead>
                          <TableHead>Papel</TableHead>
                          <TableHead className="hidden md:table-cell">Criado em</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allUsers?.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={u.avatar_url || undefined} />
                                  <AvatarFallback className="text-xs bg-muted">
                                    {getInitials(u.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="font-medium text-foreground truncate">
                                    {u.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground sm:hidden truncate">
                                    {u.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <span className="text-muted-foreground">{u.email}</span>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={u.roles[0]?.role || 'operator'}
                                onValueChange={(value) =>
                                  handleRoleChange(
                                    u.user_id,
                                    value as 'admin' | 'manager' | 'operator'
                                  )
                                }
                                disabled={u.user_id === user?.id}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Administrador</SelectItem>
                                  <SelectItem value="manager">Gerente</SelectItem>
                                  <SelectItem value="operator">Operador</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDistanceToNow(new Date(u.created_at), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Company Info */}
            <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="company">Nome da Empresa</Label>
                  <Input
                    id="company"
                    placeholder="Sua Empresa Ltda"
                    value={settings.companyName}
                    onChange={(e) => updateSettings({ companyName: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0001-00"
                    value={settings.cnpj}
                    onChange={(e) => updateSettings({ cnpj: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </section>

            {/* Notifications */}
            <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <Bell className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Notificações</h3>
                  <p className="text-sm text-muted-foreground">Configure alertas e avisos</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">Estoque baixo</p>
                    <p className="text-sm text-muted-foreground">
                      Alerta quando produto atingir estoque mínimo
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.lowStock}
                    onCheckedChange={(checked) => updateNotifications('lowStock', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">Lotes vencendo</p>
                    <p className="text-sm text-muted-foreground">
                      Alerta de lotes próximos ao vencimento
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.expiringLots}
                    onCheckedChange={(checked) => updateNotifications('expiringLots', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">E-mail diário</p>
                    <p className="text-sm text-muted-foreground">
                      Resumo diário de movimentações
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.dailyEmail}
                    onCheckedChange={(checked) => updateNotifications('dailyEmail', checked)}
                  />
                </div>
              </div>
            </section>

            {/* Save Button */}
            {hasChanges && (
              <div className="flex flex-col sm:flex-row gap-2 sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-border shadow-lg">
                <Button onClick={handleSaveSettings} className="flex-1 sm:flex-none">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
                <Button variant="outline" onClick={resetSettings}>
                  <Undo2 className="h-4 w-4 mr-2" />
                  Descartar
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
