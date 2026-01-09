import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Warehouse,
  ClipboardList,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Box,
  X,
  Truck,
  LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/useSidebar";
import { useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Produtos", href: "/products", icon: Package },
  { name: "Movimentações", href: "/movements", icon: ArrowLeftRight },
  { name: "Depósitos", href: "/warehouses", icon: Warehouse },
  { name: "Inventário", href: "/inventory", icon: ClipboardList },
  { name: "Envios Shopee", href: "/shopee", icon: Truck },
  { name: "Financeiro", href: "/finance", icon: LineChart },
  { name: "Relatórios", href: "/reports", icon: FileText },
];

const bottomNavigation = [
  { name: "Configurações", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen, isMobile } =
    useSidebar();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile, setMobileOpen]);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between gap-3 border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary flex-shrink-0">
            <Box className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">
                Estoka
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                Gestão de Estoque
              </span>
            </div>
          )}
        </div>
        {isMobile && mobileOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                collapsed && !isMobile ? "justify-center" : "",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )
            }
            title={collapsed && !isMobile ? item.name : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {(!collapsed || isMobile) && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom navigation */}
      <div className="border-t border-sidebar-border px-2 py-4">
        {bottomNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                collapsed && !isMobile ? "justify-center" : "",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )
            }
            title={collapsed && !isMobile ? item.name : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {(!collapsed || isMobile) && <span>{item.name}</span>}
          </NavLink>
        ))}
      </div>

      {/* Collapse toggle - only on desktop */}
      {!isMobile && (
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-sidebar transition-all duration-300",
          isMobile
            ? mobileOpen
              ? "w-64 translate-x-0"
              : "-translate-x-full w-64"
            : collapsed
            ? "w-16"
            : "w-64"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
