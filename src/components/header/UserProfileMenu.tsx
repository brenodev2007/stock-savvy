import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';

export function UserProfileMenu() {
  const { profile, roles, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default" className="text-[10px] px-1.5 py-0">Admin</Badge>;
      case 'manager':
        return <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Gerente</Badge>;
      case 'operator':
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0">Operador</Badge>;
      default:
        return null;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(profile?.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-popover">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(profile?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="font-medium leading-none">{profile?.name || 'Usuário'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {profile?.email}
              </p>
              {roles.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {roles.map((roleObj) => (
                    <span key={roleObj.id}>{getRoleBadge(roleObj.role)}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <User className="mr-2 h-4 w-4" />
          Meu Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Configurações
        </DropdownMenuItem>
        {roles.some((r) => r.role === 'admin') && (
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Shield className="mr-2 h-4 w-4" />
            Administração
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
