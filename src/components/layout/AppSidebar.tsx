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
  X,
  Calculator,
  Shield,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/useSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Vendas", href: "/shops", icon: ShoppingBag },
  { name: "Simulações", href: "/simulations", icon: Calculator },
  { name: "Produtos", href: "/products", icon: Package },
  { name: "Entrada e Saída", href: "/movements", icon: ArrowLeftRight },
  { name: "Contagem de Estoque", href: "/inventory", icon: ClipboardList },
  { name: "Locais de Estoque", href: "/warehouses", icon: Warehouse },
  { name: "Relatórios", href: "/reports", icon: FileText },
];

const bottomNavigation = [
  { name: "Configurações", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen, isMobile } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile, setMobileOpen]);

  const navLinkClass = (isActive: boolean) =>
    cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 group",
      collapsed && !isMobile ? "justify-center" : "",
      isActive
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
        : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
    );

  const bottomNavLinkClass = (isActive: boolean) =>
    cn(
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 group",
      collapsed && !isMobile ? "justify-center" : "",
      isActive
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
        : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
    );

  const iconClass = "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110";

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar dark:bg-zinc-950 border-r border-sidebar-border shadow-2xl shadow-black/10">
      {/* Logo */}
      <div className="flex h-20 items-center justify-between gap-3 px-6 mb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 flex-shrink-0 transition-transform hover:scale-110">
            <ShoppingBag className="h-5 w-5 text-primary-foreground" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-sm font-black text-sidebar-foreground tracking-tight uppercase">
                ESTOKA
              </span>
              <span className="text-[10px] text-sidebar-foreground/50 font-bold uppercase tracking-widest">
                Controle de Estoque
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
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2 custom-scrollbar">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) => navLinkClass(isActive)}
            title={collapsed && !isMobile ? item.name : undefined}
          >
            <item.icon className={iconClass} />
            {(!collapsed || isMobile) && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom navigation */}
      <div className="border-t border-sidebar-border px-3 py-4 space-y-1.5">
        {user?.role === "admin" && (
          <NavLink
            to="/admin"
            className={({ isActive }) => bottomNavLinkClass(isActive)}
            title={collapsed && !isMobile ? "Admin" : undefined}
          >
            <Shield className={iconClass} />
            {(!collapsed || isMobile) && <span>Painel Admin</span>}
          </NavLink>
        )}
        {bottomNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) => bottomNavLinkClass(isActive)}
            title={collapsed && !isMobile ? item.name : undefined}
          >
            <item.icon className={iconClass} />
            {(!collapsed || isMobile) && <span>{item.name}</span>}
          </NavLink>
        ))}
      </div>

      {/* Collapse toggle - only on desktop */}
      {!isMobile && (
        <div className="p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-sidebar-foreground/40 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-xl"
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
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden animate-in fade-in duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-sidebar transition-all duration-300 ease-in-out",
          isMobile
            ? mobileOpen
              ? "w-72 translate-x-0"
              : "-translate-x-full w-72"
            : collapsed
            ? "w-20"
            : "w-72"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}