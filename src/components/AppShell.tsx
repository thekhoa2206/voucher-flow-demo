import { useState } from 'react';
import { UserRole } from '@/lib/types';
import { resetData } from '@/lib/store';
import AdminDashboard from './admin/AdminDashboard';
import AdminCampaigns from './admin/AdminCampaigns';
import AdminVouchers from './admin/AdminVouchers';
import VendorRedeem from './vendor/VendorRedeem';
import VendorHistory from './vendor/VendorHistory';
import B2BView from './b2b/B2BView';
import EndUserView from './enduser/EndUserView';
import { LayoutDashboard, Ticket, ListChecks, ScanLine, History, Building2, Smartphone, RotateCcw } from 'lucide-react';

const roleTabs: { role: UserRole; label: string; icon: React.ReactNode }[] = [
  { role: 'admin', label: 'Admin', icon: <LayoutDashboard className="w-4 h-4" /> },
  { role: 'vendor', label: 'Vendor', icon: <ScanLine className="w-4 h-4" /> },
  { role: 'b2b', label: 'B2B', icon: <Building2 className="w-4 h-4" /> },
  { role: 'end-user', label: 'End User', icon: <Smartphone className="w-4 h-4" /> },
];

const adminTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'campaigns', label: 'Campaigns', icon: <Ticket className="w-4 h-4" /> },
  { id: 'vouchers', label: 'Vouchers', icon: <ListChecks className="w-4 h-4" /> },
];

const vendorTabs = [
  { id: 'redeem', label: 'Redeem', icon: <ScanLine className="w-4 h-4" /> },
  { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
];

export default function AppShell() {
  const [role, setRole] = useState<UserRole>('admin');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [vendorTab, setVendorTab] = useState('redeem');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleReset = () => {
    resetData();
    refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">EV</div>
            <span className="font-semibold text-foreground text-lg tracking-tight">eVoucher</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Role Switcher */}
            <div className="flex rounded-lg border border-border bg-muted p-0.5 gap-0.5">
              {roleTabs.map((t) => (
                <button
                  key={t.role}
                  onClick={() => { setRole(t.role); refresh(); }}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    role === t.role
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.icon}
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>
            <button onClick={handleReset} className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition" title="Reset demo data">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Sub-navigation for admin/vendor */}
      {(role === 'admin' || role === 'vendor') && (
        <div className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-7xl gap-1 px-4 py-1">
            {(role === 'admin' ? adminTabs : vendorTabs).map((t) => (
              <button
                key={t.id}
                onClick={() => role === 'admin' ? setAdminTab(t.id) : setVendorTab(t.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition ${
                  (role === 'admin' ? adminTab : vendorTab) === t.id
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6" key={refreshKey}>
        {role === 'admin' && adminTab === 'dashboard' && <AdminDashboard />}
        {role === 'admin' && adminTab === 'campaigns' && <AdminCampaigns onCreated={refresh} />}
        {role === 'admin' && adminTab === 'vouchers' && <AdminVouchers />}
        {role === 'vendor' && vendorTab === 'redeem' && <VendorRedeem />}
        {role === 'vendor' && vendorTab === 'history' && <VendorHistory />}
        {role === 'b2b' && <B2BView />}
        {role === 'end-user' && <EndUserView />}
      </main>
    </div>
  );
}
