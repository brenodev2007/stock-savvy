import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link2, Loader2 } from 'lucide-react';

export function ShopeeConnectButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const currentUrl = window.location.origin;
      const callbackUrl = `${currentUrl}/shopee-callback`;

      const session = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopee-oauth?action=auth-url&redirect_url=${encodeURIComponent(callbackUrl)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.data.session?.access_token || ''}`,
          },
        }
      );

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.auth_url) {
        window.open(result.auth_url, '_blank', 'width=600,height=700');
        toast.info('Complete a autorização na janela do Shopee');
      }
    } catch (error: any) {
      console.error('Error connecting to Shopee:', error);
      toast.error(error.message || 'Erro ao conectar com Shopee');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleConnect} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Link2 className="h-4 w-4 mr-2" />
      )}
      Conectar Conta Shopee
    </Button>
  );
}
