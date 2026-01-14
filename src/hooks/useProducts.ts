import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  unit: string;
  category_id: string | null;
  cost: number;
  price: number;
  min_stock: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
  } | null;
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/products');
      return data as Product[];
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: {
      sku: string;
      name: string;
      description?: string;
      unit: string;
      category_id?: string;
      cost: number;
      price: number;
      min_stock: number;
    }) => {
      const { data } = await api.post('/products', product);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto criado com sucesso');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message;
      if (errorMessage?.includes('SKU já cadastrado')) {
        toast.error('SKU já existe. Use um código único.');
      } else {
        toast.error('Erro ao criar produto: ' + errorMessage);
      }
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data } = await api.put(`/products/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto atualizado com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar produto: ' + (error.response?.data?.error || error.message));
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto excluído com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir produto: ' + (error.response?.data?.error || error.message));
    },
  });
}
