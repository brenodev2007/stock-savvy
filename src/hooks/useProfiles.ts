import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  cpf_cnpj?: string | null;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, avatar_url, cpf_cnpj }: { name: string; avatar_url?: string | null; cpf_cnpj?: string | null }) => {
      const { data } = await api.put('/auth/me', {
        name,
        avatar_url,
        cpf_cnpj
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Perfil atualizado com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar perfil: ' + (error.response?.data?.error || error.message));
    },
  });
}
