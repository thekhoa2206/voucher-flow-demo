import { useState } from 'react';
import { UserRole } from '@/lib/types';
import { useActions } from '@/lib/useStore';
import AdminDashboard from './admin/AdminDashboard';
import AdminCampaigns from './admin/AdminCampaigns';
import AdminVouchers from './admin/AdminVouchers';
import VendorRedeem from './vendor/VendorRedeem';
import VendorHistory from './vendor/VendorHistory';
import B2BView from './b2b/B2BView';
import EndUserView from './enduser/EndUserView';
import {
  LayoutDashboard, Ticket, ListChecks, ScanLine, History,
  Building2, Smartphone, RotateCcw, ChevronLeft, ChevronRight, Menu, X,
} from 'lucide-react';

// ── Nav config ────────────────────────────────────────────────────────────────

type NavItem = { id: string; label: string; icon: React.ReactNode };

const roleNav: Record<UserRole, NavItem[]> = {
  admin: [
    { id: 'dashboard', label: 'Tổng quan',   icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'campaigns', label: 'Chiến dịch',  icon: <Ticket className="w-5 h-5" /> },
    { id: 'vouchers',  label: 'Voucher',      icon: <ListChecks className="w-5 h-5" /> },
  ],
  vendor: [
    { id: 'redeem',  label: 'Đổi voucher', icon: <ScanLine className="w-5 h-5" /> },
    { id: 'history', label: 'Lịch sử',     icon: <History className="w-5 h-5" /> },
  ],
  b2b:        [{ id: 'b2b',      label: 'Dashboard',    icon: <Building2 className="w-5 h-5" /> }],
  'end-user': [{ id: 'end-user', label: 'Ví Voucher',   icon: <Smartphone className="w-5 h-5" /> }],
};

const rolesMeta: { role: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
  { role: 'admin',    label: 'Quản trị',   icon: <LayoutDashboard className="w-4 h-4" />, color: 'bg-violet-500' },
  { role: 'vendor',   label: 'Thu ngân',   icon: <ScanLine className="w-4 h-4" />,        color: 'bg-blue-500' },
  { role: 'b2b',      label: 'Đối tác',    icon: <Building2 className="w-4 h-4" />,       color: 'bg-emerald-500' },
  { role: 'end-user', label: 'Người dùng', icon: <Smartphone className="w-4 h-4" />,      color: 'bg-orange-500' },
];

// ── AppShell ──────────────────────────────────────────────────────────────────

export default function AppShell() {
  const [role, setRole]         = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<Record<UserRole, string>>({
    admin: 'dashboard', vendor: 'redeem', b2b: 'b2b', 'end-user': 'end-user',
  });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resetData } = useActions();

  const currentRole = rolesMeta.find((r) => r.role === role)!;
  const navItems    = roleNav[role];
  const currentTab  = activeTab[role];

  const handleRoleChange = (r: UserRole) => {
    setRole(r);
    setMobileOpen(false);
  };

  const handleTabChange = (id: string) => {
    setActiveTab((prev) => ({ ...prev, [role]: id }));
    setMobileOpen(false);
  };

  const renderContent = () => {
    if (role === 'admin' && currentTab === 'dashboard') return <AdminDashboard />;
    if (role === 'admin' && currentTab === 'campaigns') return <AdminCampaigns />;
    if (role === 'admin' && currentTab === 'vouchers')  return <AdminVouchers />;
    if (role === 'vendor' && currentTab === 'redeem')   return <VendorRedeem />;
    if (role === 'vendor' && currentTab === 'history')  return <VendorHistory />;
    if (role === 'b2b')      return <B2BView />;
    if (role === 'end-user') return <EndUserView />;
    return null;
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border transition-all duration-300
          lg:relative lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${collapsed ? 'lg:w-[68px]' : 'w-64'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center border-b border-border px-4 h-14 shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            EV
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-foreground text-sm leading-tight">eVoucher</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Demo Platform</p>
            </div>
          )}
          {/* Close on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role switcher */}
        <div className={`px-3 py-3 border-b border-border shrink-0 ${collapsed ? 'px-2' : ''}`}>
          {!collapsed && (
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              Vai trò
            </p>
          )}
          <div className="space-y-0.5">
            {rolesMeta.map((r) => (
              <button
                key={r.role}
                onClick={() => handleRoleChange(r.role)}
                title={collapsed ? r.label : undefined}
                className={`w-full flex items-center rounded-lg transition-all group
                  ${collapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-2'}
                  ${role === r.role
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <span className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-md text-white text-xs ${r.color}`}>
                  {r.icon}
                </span>
                {!collapsed && (
                  <span className="text-sm font-medium truncate">{r.label}</span>
                )}
                {!collapsed && role === r.role && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Page nav */}
        {navItems.length > 1 && (
          <div className={`px-3 py-3 flex-1 ${collapsed ? 'px-2' : ''}`}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                Menu
              </p>
            )}
            <div className="space-y-0.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-lg transition-all
                    ${collapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-2'}
                    ${currentTab === item.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom actions */}
        <div className={`mt-auto border-t border-border px-3 py-3 shrink-0 space-y-0.5 ${collapsed ? 'px-2' : ''}`}>
          <button
            onClick={resetData}
            title="Đặt lại dữ liệu demo"
            className={`w-full flex items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition
              ${collapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-2'}
            `}
          >
            <RotateCcw className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Đặt lại demo</span>}
          </button>

          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Mở rộng' : 'Thu gọn'}
            className={`hidden lg:flex w-full items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition
              ${collapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-2'}
            `}
          >
            {collapsed
              ? <ChevronRight className="w-5 h-5 shrink-0" />
              : <><ChevronLeft className="w-5 h-5 shrink-0" /><span className="text-sm font-medium">Thu gọn</span></>
            }
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar (mobile only) */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-card/80 backdrop-blur-md shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className={`flex items-center justify-center w-6 h-6 rounded-md text-white text-xs ${currentRole.color}`}>
              {currentRole.icon}
            </span>
            <span className="font-semibold text-foreground text-sm">{currentRole.label}</span>
          </div>
          <button
            onClick={resetData}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition"
            title="Đặt lại dữ liệu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 sm:py-6">
            {renderContent()}
          </div>
        </main>

        {/* ── Mobile bottom nav ── */}
        <nav className="lg:hidden shrink-0 border-t border-border bg-card/95 backdrop-blur-md">
          <div className="flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  currentTab === item.id
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className={`p-1 rounded-lg transition-colors ${currentTab === item.id ? 'bg-primary/10' : ''}`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        </nav>

      </div>
    </div>
  );
}
