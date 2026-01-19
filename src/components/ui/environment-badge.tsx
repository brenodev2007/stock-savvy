import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface EnvironmentBadgeProps {
  environment?: 'development' | 'production';
  className?: string;
}

/**
 * Badge que indica se o sistema está em modo sandbox ou produção
 */
export function EnvironmentBadge({ environment = 'development', className = '' }: EnvironmentBadgeProps) {
  const isDevelopment = environment === 'development';

  return (
    <Badge 
      variant={isDevelopment ? 'outline' : 'default'}
      className={`${isDevelopment ? 'border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400' : 'border-green-500 text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-400'} ${className}`}
    >
      {isDevelopment ? (
        <>
          <AlertCircle className="h-3 w-3 mr-1" />
          Modo Sandbox
        </>
      ) : (
        <>
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Produção
        </>
      )}
    </Badge>
  );
}
