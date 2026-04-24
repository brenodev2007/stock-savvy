import { ReactNode, useState, useEffect } from 'react';
import { AppSidebar } from './AppSidebar';
import { cn } from '@/lib/utils';
import { Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSidebar } from '@/hooks/useSidebar';
import { GlobalSearch } from '@/components/header/GlobalSearch';
import { NotificationsPopover } from '@/components/header/NotificationsPopover';
import { UserProfileMenu } from '@/components/header/UserProfileMenu';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const { collapsed, isMobile, setMobileOpen } = useSidebar();
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />

      {/* Main content */}
      <div
        className={cn(
          'transition-all duration-300 min-h-screen flex flex-col main-scrollbar overflow-y-auto',
          isMobile ? 'ml-0' : collapsed ? 'ml-20' : 'ml-72'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center justify-between border-b border-border bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile menu button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(true)}
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            {title && (
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-semibold text-foreground truncate">{title}</h1>
                {subtitle && (
                  <p className="text-xs md:text-sm text-muted-foreground truncate hidden sm:block">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Search - hidden on mobile, opens modal */}
            <Button
              variant="outline"
              className="hidden lg:flex items-center gap-2 text-muted-foreground w-48 xl:w-64 justify-start"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span className="text-sm">Buscar...</span>
              <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
            </Button>

            {/* Mobile search button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>

            {/* Notifications */}
            <NotificationsPopover />

            {/* User menu */}
            <UserProfileMenu />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
