import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
}

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return data;
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/notifications/${id}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
