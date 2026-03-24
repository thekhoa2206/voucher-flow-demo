import { useMemo, useState, useEffect } from 'react';
import { useVouchers, useCampaigns, useVendors, useBranches } from '@/lib/useStore';
import { History, Filter, TrendingUp, Banknote, LayoutList, Clock } from 'lucide-react';

type ViewMode = 'table' | 'timeline';

const VALUE_MAP: Record<string, number> = {
  '50,000 VND': 50000,
  '20%': 0, // percentage — mock as 30k average
  'Mua 1 Tặng 1': 0,
};

function parseValue(value: string): number {
  if (value.includes('VND')) {
    return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
  }
  if (value.includes('%')) return 30000; // mock average discount value
  return 25000; // mock BXGY value
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDateOnly(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export default function VendorHistory({ branchId: _branchId }: { branchId?: string }) {
  const allRedeemed = useVouchers().filter((v) => v.status === 'Redeemed');
  const campaigns = useCampaigns();
  const vendors = useVendors();
  const branches = useBranches();

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterDate, setFilterDate] = useState('');
  const [filterCampaign, setFilterCampaign] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return allRedeemed.filter((v) => {
      if (filterCampaign && v.campaign_id !== filterCampaign) return false;
      if (filterDate && v.redeemed_at) {
        const vDate = new Date(v.redeemed_at).toISOString().slice(0, 10);
        if (vDate !== filterDate) return false;
      }
      return true;
    }).sort((a, b) => {
      const ta = a.redeemed_at ? new Date(a.redeemed_at).getTime() : 0;
      const tb = b.redeemed_at ? new Date(b.redeemed_at).getTime() : 0;
      return tb - ta;
    });
  }, [allRedeemed, filterDate, filterCampaign]);

  const totalValue = useMemo(() => filtered.reduce((sum, v) => sum + parseValue(v.value), 0), [filtered]);
  const hasFilter = filterDate || filterCampaign;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="h-8 w-56 rounded-lg bg-muted animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 rounded-xl bg-card border border-border animate-pulse" />
          <div className="h-20 rounded-xl bg-card border border-border animate-pulse" />
        </div>
        <div className="h-24 rounded-xl bg-card border border-border animate-pulse" />
        <div className="rounded-xl border border-border overflow-hidden">
          {[1,2,3,4,5].map((i) => <div key={i} className="h-14 border-b border-border bg-card animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lịch sử đổi voucher</h1>
          <p className="text-sm text-muted-foreground">{allRedeemed.length} giao dịch tổng cộng</p>
        </div>
        {/* View toggle */}
        <div className="flex rounded-lg border border-border bg-muted p-0.5 gap-0.5 shrink-0">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${viewMode === 'table' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <LayoutList className="w-3.5 h-3.5" /> Bảng
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${viewMode === 'timeline' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Clock className="w-3.5 h-3.5" /> Timeline
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-card border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{filtered.length}</p>
            <p className="text-xs text-muted-foreground">{hasFilter ? 'Voucher (đã lọc)' : 'Tổng voucher đã dùng'}</p>
          </div>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{totalValue.toLocaleString('vi-VN')}₫</p>
            <p className="text-xs text-muted-foreground">{hasFilter ? 'Tổng giá trị (đã lọc)' : 'Tổng giá trị (mock)'}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-card border border-border p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter className="w-4 h-4 text-muted-foreground" /> Bộ lọc
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Theo ngày</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Theo chiến dịch</label>
            <select
              value={filterCampaign}
              onChange={(e) => setFilterCampaign(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Tất cả chiến dịch</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        {hasFilter && (
          <button
            onClick={() => { setFilterDate(''); setFilterCampaign(''); }}
            className="text-xs text-primary hover:underline"
          >
            Xoá bộ lọc
          </button>
        )}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <History className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Không có giao dịch nào{hasFilter ? ' phù hợp bộ lọc' : ''}</p>
        </div>
      ) : viewMode === 'table' ? (
        <TableView items={filtered} campaigns={campaigns} vendors={vendors} branches={branches} />
      ) : (
        <TimelineView items={filtered} campaigns={campaigns} vendors={vendors} branches={branches} />
      )}
    </div>
  );
}

// ── Table View ──────────────────────────────────────────────────────────────
import { Campaign, Voucher, Vendor, Branch } from '@/lib/types';

function TableView({ items, campaigns, vendors, branches }: { items: Voucher[]; campaigns: Campaign[]; vendors: Vendor[]; branches: Branch[] }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mã voucher</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chiến dịch</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Chi nhánh</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Thời gian</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Giá trị</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((v) => {
              const vendor = vendors.find((vn) => vn.id === v.vendor_id);
              const camp = campaigns.find((c) => c.id === v.campaign_id);
              const branch = branches.find((b) => b.id === v.branch_id);
              return (
                <tr key={v.code} className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-foreground tracking-wider">{v.code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base leading-none">{vendor?.logo}</span>
                      <div>
                        <p className="text-foreground font-medium leading-tight text-xs sm:text-sm">{camp?.name ?? '-'}</p>
                        <p className="text-xs text-muted-foreground">{vendor?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">{branch?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap hidden sm:table-cell">
                    {v.redeemed_at ? formatDate(v.redeemed_at) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-block rounded-full bg-success/10 text-success px-2.5 py-0.5 text-xs font-semibold">{v.value}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Timeline View ────────────────────────────────────────────────────────────
function TimelineView({ items, campaigns, vendors, branches }: { items: Voucher[]; campaigns: Campaign[]; vendors: Vendor[]; branches: Branch[] }) {
  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, Voucher[]>();
    items.forEach((v) => {
      const key = v.redeemed_at ? formatDateOnly(v.redeemed_at) : 'Không rõ';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    });
    return Array.from(map.entries());
  }, [items]);

  return (
    <div className="space-y-6">
      {grouped.map(([date, dayItems]) => (
        <div key={date} className="relative">
          {/* Date label */}
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">{date}</div>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{dayItems.length} giao dịch</span>
          </div>

          {/* Items */}
          <div className="ml-4 space-y-2 border-l-2 border-border pl-5">
            {dayItems.map((v) => {
              const vendor = vendors.find((vn) => vn.id === v.vendor_id);
              const camp = campaigns.find((c) => c.id === v.campaign_id);
              const branch = branches.find((b) => b.id === v.branch_id);
              return (
                <div key={v.code} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[25px] top-3.5 w-3 h-3 rounded-full bg-success border-2 border-background" />
                  <div className="rounded-xl bg-card border border-border p-3.5 flex items-center justify-between gap-3 hover:shadow-sm transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-lg shrink-0">{vendor?.logo}</div>
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-bold text-foreground tracking-wider">{v.code}</p>
                        <p className="text-xs text-muted-foreground truncate">{camp?.name ?? vendor?.name}</p>
                        {branch && <p className="text-[11px] text-muted-foreground/70">{branch.name}</p>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block rounded-full bg-success/10 text-success px-2.5 py-0.5 text-xs font-semibold">{v.value}</span>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {v.redeemed_at ? new Date(v.redeemed_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
