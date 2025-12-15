import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'operator';
  created_at: string;
}

interface UserWithRoles extends Profile {
  roles: UserRole[];
}

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) throw error;

      // Fetch all roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('*');

      // Combine profiles with their roles
      const usersWithRoles: UserWithRoles[] = profiles.map((profile) => ({
        ...profile,
        roles: (roles || []).filter((r) => r.user_id === profile.user_id) as UserRole[],
      }));

      return usersWithRoles;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, name, avatar_url }: { userId: string; name: string; avatar_url?: string | null }) => {
      const updates: any = { 
        name, 
        updated_at: new Date().toISOString() 
      };
      
      if (avatar_url !== undefined) {
        updates.avatar_url = avatar_url;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Perfil atualizado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar perfil: ' + error.message);
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: 'admin' | 'manager' | 'operator';
    }) => {
      // First delete existing roles
      await supabase.from('user_roles').delete().eq('user_id', userId);

      // Then insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Papel do usuário atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar papel: ' + error.message);
    },
  });
}
