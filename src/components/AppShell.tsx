import { useState } from 'react';
import { UserRole } from '@/lib/types';
import { Account } from '@/lib/auth';
import { useActions, useBranches } from '@/lib/useStore';
import AdminDashboard from './admin/AdminDashboard';
import AdminCampaigns from './admin/AdminCampaigns';
import AdminVouchers from './admin/AdminVouchers';
import AdminPartners from './admin/AdminPartners';
import VendorRedeem from './vendor/VendorRedeem';
import VendorHistory from './vendor/VendorHistory';
import B2BView from './b2b/B2BView';
import EndUserView from './enduser/EndUserView';
import {
  LayoutDashboard, Ticket, ListChecks, ScanLine, History,
  Building2, Smartphone, RotateCcw, ChevronLeft, ChevronRight,
  Menu, X, LogOut, ShieldCheck, Users, MapPin,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type NavItem = { id: string; label: string; icon: React.ReactNode };

// ── Role metadata ─────────────────────────────────────────────────────────────

const ROLE_META: Record<UserRole, {
  label: string;
  icon: React.ReactNode;
  badgeColor: string;   // tailwind bg class for icon badge
  accentBg: string;     // sidebar active bg
  accentText: string;   // sidebar active text
}> = {
  admin: {
    label: 'Quản trị viên',
    icon: <ShieldCheck className="w-4 h-4" />,
    badgeColor: 'bg-violet-500',
    accentBg: 'bg-violet-500',
    accentText: 'text-white',
  },
  vendor: {
    label: 'Thu ngân',
    icon: <ScanLine className="w-4 h-4" />,
    badgeColor: 'bg-blue-500',
    accentBg: 'bg-blue-500',
    accentText: 'text-white',
  },
  b2b: {
    label: 'Đối tác B2B',
    icon: <Building2 className="w-4 h-4" />,
    badgeColor: 'bg-emerald-500',
    accentBg: 'bg-emerald-500',
    accentText: 'text-white',
  },
  'end-user': {
    label: 'Người dùng',
    icon: <Smartphone className="w-4 h-4" />,
    badgeColor: 'bg-orange-500',
    accentBg: 'bg-orange-500',
    accentText: 'text-white',
  },
};

// ── Nav items per role ────────────────────────────────────────────────────────

const ROLE_NAV: Record<UserRole, NavItem[]> = {
  admin: [
    { id: 'dashboard', label: 'Tổng quan',  icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'campaigns', label: 'Chiến dịch', icon: <Ticket className="w-5 h-5" /> },
    { id: 'vouchers',  label: 'Voucher',     icon: <ListChecks className="w-5 h-5" /> },
    { id: 'partners',  label: 'Đối tác',     icon: <Users className="w-5 h-5" /> },
  ],
  vendor: [
    { id: 'redeem',  label: 'Đổi voucher', icon: <ScanLine className="w-5 h-5" /> },
    { id: 'history', label: 'Lịch sử',     icon: <History className="w-5 h-5" /> },
  ],
  b2b:        [{ id: 'b2b',      label: 'Dashboard B2B', icon: <Building2 className="w-5 h-5" /> }],
  'end-user': [{ id: 'end-user', label: 'Ví Voucher',    icon: <Smartphone className="w-5 h-5" /> }],
};



// ── Content renderer ──────────────────────────────────────────────────────────

function renderContent(role: UserRole, tab: string, account: Account, branchId?: string) {
  if (role === 'admin') {
    if (tab === 'dashboard') return <AdminDashboard />;
    if (tab === 'campaigns') return <AdminCampaigns />;
    if (tab === 'vouchers')  return <AdminVouchers />;
    if (tab === 'partners')  return <AdminPartners />;
  }
  if (role === 'vendor') {
    if (tab === 'redeem')  return <VendorRedeem branchId={branchId} />;
    if (tab === 'history') return <VendorHistory branchId={branchId} />;
  }
  if (role === 'b2b')      return <B2BView account={account} />;
  if (role === 'end-user') return <EndUserView account={account} />;
  return null;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  account: Account;
  onLogout: () => void;
  branchId?: string;
}

// ── AppShell ──────────────────────────────────────────────────────────────────

export default function AppShell({ account, onLogout, branchId }: Props) {
  // Active view role — locked to account's own role
  const [viewRole] = useState<UserRole>(account.role);

  // Per-role active tab memory
  const [activeTabs, setActiveTabs] = useState<Record<UserRole, string>>({
    admin: 'dashboard', vendor: 'redeem', b2b: 'b2b', 'end-user': 'end-user',
  });

  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resetData } = useActions();
  const branches = useBranches();
  const currentBranch = branchId ? branches.find((b) => b.id === branchId) : null;

  const meta       = ROLE_META[viewRole];
  const navItems   = ROLE_NAV[viewRole];
  const currentTab = activeTabs[viewRole];

  const switchTab = (id: string) => { setActiveTabs((p) => ({ ...p, [viewRole]: id })); setMobileOpen(false); };

  // ── Sidebar nav item ──
  const NavBtn = ({ item }: { item: NavItem }) => {
    const active = currentTab === item.id;
    return (
      <button
        onClick={() => switchTab(item.id)}
        title={collapsed ? item.label : undefined}
        className={`w-full flex items-center rounded-xl transition-all duration-150
          ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'}
          ${active
            ? `${meta.accentBg} ${meta.accentText} shadow-sm`
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
        `}
      >
        <span className="shrink-0">{item.icon}</span>
        {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ════════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════════ */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border
        transition-[width,transform] duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? 'lg:w-[68px]' : 'w-64'}
      `}>

        {/* ── Logo ── */}
        <div className={`flex items-center h-14 border-b border-border shrink-0 px-4 ${collapsed ? 'justify-center px-0' : 'gap-3'}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm shadow-sm">
            EV
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="font-bold text-foreground text-sm leading-tight">eVoucher</p>
              <p className="text-[10px] text-muted-foreground">Demo Platform</p>
            </div>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto p-1 rounded-md text-muted-foreground hover:text-foreground transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── User card ── */}
        <div className={`shrink-0 border-b border-border ${collapsed ? 'py-3 flex justify-center' : 'p-3'}`}>
          {collapsed ? (
            <div
              title={`${account.displayName} · ${meta.label}`}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg cursor-default"
            >
              {account.avatar}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 border border-border/60 px-3 py-2.5">
              <span className="text-2xl shrink-0">{account.avatar}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">{account.displayName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white ${meta.badgeColor}`}>
                    {meta.icon} {meta.label}
                  </span>
                </div>
                {currentBranch && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />{currentBranch.name}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Page nav ── */}
        <div className={`flex-1 overflow-y-auto ${collapsed ? 'py-2 px-2' : 'px-3 py-3'}`}>
          {!collapsed && navItems.length > 1 && (
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              Menu
            </p>
          )}
          <div className="space-y-0.5">
            {navItems.map((item) => <NavBtn key={item.id} item={item} />)}
          </div>
        </div>

        {/* ── Bottom actions ── */}
        <div className={`shrink-0 border-t border-border space-y-0.5 ${collapsed ? 'py-2 px-2' : 'px-3 py-3'}`}>
          {/* Reset demo — admin only */}
          {account.role === 'admin' && (
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
          )}

          {/* Logout */}
          <button
            onClick={onLogout}
            title="Đăng xuất"
            className={`w-full flex items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition
              ${collapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-2'}
            `}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Đăng xuất</span>}
          </button>

          {/* Collapse — desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
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

      {/* ════════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════════ */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-card/80 backdrop-blur-md shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Current page label */}
          <div className="flex items-center gap-2">
            <span className={`flex items-center justify-center w-6 h-6 rounded-md text-white text-xs ${meta.badgeColor}`}>
              {meta.icon}
            </span>
            <span className="font-semibold text-foreground text-sm">
              {navItems.find((n) => n.id === currentTab)?.label ?? meta.label}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 sm:py-6">
            {renderContent(viewRole, currentTab, account, branchId)}
          </div>
        </main>

        {/* Mobile bottom nav — only when multiple tabs */}
        {navItems.length > 1 && (
          <nav className="lg:hidden shrink-0 border-t border-border bg-card/95 backdrop-blur-md safe-area-bottom">
            <div className="flex">
              {navItems.map((item) => {
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => switchTab(item.id)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                      active ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <span className={`p-1.5 rounded-xl transition-colors ${active ? `${meta.accentBg} text-white` : ''}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
