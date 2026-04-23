import { ReactNode } from 'react';

interface PlanFeatureGuardProps {
  children: ReactNode;
  feature?: string;
  showUpgradeButton?: boolean;
  blur?: boolean;
}

export function PlanFeatureGuard({ children }: PlanFeatureGuardProps) {
  return <>{children}</>;
}

interface ProBadgeProps {
  tooltip?: string;
}

export function ProBadge({}: ProBadgeProps) {
  return null;
}

interface LockedFeatureButtonProps {
  onClick?: () => void;
  children: ReactNode;
  tooltip?: string;
}

export function LockedFeatureButton({ children }: LockedFeatureButtonProps) {
  return <>{children}</>;
}
