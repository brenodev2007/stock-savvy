import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'warning' | 'success';
  className?: string;
}

const variants = {
  default: 'bg-card',
  primary: 'bg-primary text-primary-foreground',
  warning: 'bg-warning/10 border-warning/20',
  success: 'bg-success/10 border-success/20',
};

const iconVariants = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary-foreground/20 text-primary-foreground',
  warning: 'bg-warning/20 text-warning',
  success: 'bg-success/20 text-success',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'stat-card animate-fade-in',
        variants[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className={cn(
              'stat-label',
              variant === 'primary' && 'text-primary-foreground/70'
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              'stat-value mt-2',
              variant === 'primary' && 'text-primary-foreground'
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className={cn(
                'mt-1 text-sm text-muted-foreground',
                variant === 'primary' && 'text-primary-foreground/70'
              )}
            >
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs. mês anterior</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg',
            iconVariants[variant]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
