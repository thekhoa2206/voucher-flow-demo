import { useState, useMemo, useCallback, useEffect } from 'react';
import { useVouchers, useVendors, useCampaigns, useActions } from '@/lib/useStore';
import { Voucher, VoucherStatus } from '@/lib/types';
import { QRCodeSVG } from 'qrcode.react';
import { Search, Download, Clock, X, CheckCircle2, AlertCircle, Ticket, Calendar, Tag, Store } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<VoucherStatus, string> = {
  Active:   'bg-success/10 text-success',
  Redeemed: 'bg-info/10 text-info',
  Expired:  'bg-destructive/10 text-destructive',
};

const statusIcons: Record<VoucherStatus, React.ReactNode> = {
  Active:   <CheckCircle2 className="w-3.5 h-3.5" />,
  Redeemed: <Ticket className="w-3.5 h-3.5" />,
  Expired:  <AlertCircle className="w-3.5 h-3.5" />,
};

const STATUSES: (VoucherStatus | 'All')[] = ['All', 'Active', 'Redeemed', 'Expired'];

export default function AdminVouchers() {
  const allVouchers = useVouchers();
  const campaigns   = useCampaigns();
  const vendors     = useVendors();
  const { markExpired } = useActions();

  const [loading, setLoading]               = useState(true);
  const [statusFilter, setStatusFilter]     = useState<VoucherStatus | 'All'>('All');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [search, setSearch]                 = useState('');
  const [selected, setSelected]             = useState<Set<string>>(new Set());
  const [detailVoucher, setDetailVoucher]   = useState<Voucher | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    let list = allVouchers;
    if (statusFilter !== 'All') list = list.filter((v) => v.status === statusFilter);
    if (campaignFilter !== 'all') list = list.filter((v) => v.campaign_id === campaignFilter);
    if (search.trim()) {
      const q = search.trim().toUpperCase();
      list = list.filter((v) => v.code.includes(q));
    }
    return list;
  }, [allVouchers, statusFilter, campaignFilter, search]);

  const toggleSelect = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((v) => v.code)));
  };

  const handleExportCSV = useCallback(() => {
    const rows = filtered.filter((v) => selected.size === 0 || selected.has(v.code));
    const header = 'Code,Status,Campaign,Vendor,Type,Value,Expiry,Redeemed At\n';
    const csv = header + rows.map((v) => {
      const camp   = campaigns.find((c) => c.id === v.campaign_id);
      const vendor = vendors.find((vn) => vn.id === v.vendor_id);
      return `${v.code},${v.status},${camp?.name ?? ''},${vendor?.name ?? ''},${v.voucher_type},${v.value},${v.expiry_date},${v.redeemed_at ?? ''}`;
    }).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'vouchers.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Xuất CSV thành công', { description: `${rows.length} voucher đã được xuất` });
  }, [filtered, selected, campaigns, vendors]);

  const handleMarkExpired = useCallback(() => {
    const codes = selected.size > 0
      ? [...selected]
      : filtered.filter((v) => v.status === 'Active').map((v) => v.code);
    if (codes.length === 0) {
      toast.info('Không có voucher Active nào để đánh dấu');
      return;
    }
    markExpired(codes);
    setSelected(new Set());
    toast.success('Đã đánh dấu hết hạn', { description: `${codes.length} voucher đã được cập nhật` });
  }, [selected, filtered, markExpired]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <div className="space-y-1.5">
            <div className="h-7 w-48 rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 rounded-lg bg-muted animate-pulse" />
            <div className="h-9 w-36 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-9 w-48 rounded-lg bg-muted animate-pulse" />
          <div className="h-9 w-64 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="h-11 bg-muted/50 border-b border-border" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 border-b border-border bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Danh sách Voucher</h1>
          <p className="text-sm text-muted-foreground">{allVouchers.length} voucher · {filtered.length} hiển thị</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition">
            <Download className="w-3.5 h-3.5" /> Xuất CSV
          </button>
          <button onClick={handleMarkExpired} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition">
            <Clock className="w-3.5 h-3.5" /> Đánh dấu hết hạn
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã voucher..."
              className="w-full rounded-lg border border-input bg-card pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Tất cả chiến dịch</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex rounded-lg border border-border bg-card p-0.5 gap-0.5 overflow-x-auto scrollbar-none">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-md px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                statusFilter === s ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s} ({s === 'All' ? allVouchers.length : allVouchers.filter((v) => v.status === s).length})
            </button>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/20 px-4 py-2.5 text-sm animate-fade-in">
          <span className="font-medium text-primary">{selected.size} đã chọn</span>
          <button onClick={() => setSelected(new Set())} className="text-xs text-muted-foreground hover:text-foreground transition">
            Bỏ chọn
          </button>
        </div>
      )}

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="rounded border-border accent-primary"
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium">Mã</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Chiến dịch</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Vendor</th>
                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">Hết hạn</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    Không tìm thấy voucher
                  </td>
                </tr>
              )}
              {filtered.map((v) => {
                const vendor = vendors.find((vn) => vn.id === v.vendor_id);
                const camp   = campaigns.find((c) => c.id === v.campaign_id);
                return (
                  <tr
                    key={v.code}
                    onClick={() => setDetailVoucher(v)}
                    className={`border-b border-border last:border-0 cursor-pointer transition ${
                      selected.has(v.code) ? 'bg-primary/5' : 'hover:bg-muted/30'
                    }`}
                  >
                    <td className="px-4 py-3" onClick={(e) => { e.stopPropagation(); toggleSelect(v.code); }}>
                      <input
                        type="checkbox"
                        checked={selected.has(v.code)}
                        onChange={() => toggleSelect(v.code)}
                        className="rounded border-border accent-primary"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">{v.code}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">{camp?.name ?? '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{vendor?.logo} {vendor?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[v.status]}`}>
                        {statusIcons[v.status]} {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground text-xs hidden sm:table-cell">{v.expiry_date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {detailVoucher && (
        <VoucherDetailDrawer voucher={detailVoucher} onClose={() => setDetailVoucher(null)} />
      )}
    </div>
  );
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────

function VoucherDetailDrawer({ voucher, onClose }: { voucher: Voucher; onClose: () => void }) {
  const campaigns = useCampaigns();
  const vendors   = useVendors();
  const camp   = campaigns.find((c) => c.id === voucher.campaign_id);
  const vendor = vendors.find((v) => v.id === voucher.vendor_id);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-card border-l border-border shadow-2xl animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Chi tiết Voucher</h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* QR Code */}
          <div className="flex flex-col items-center gap-3 rounded-xl bg-muted/40 p-5">
            <QRCodeSVG value={voucher.code} size={140} className="rounded-lg" />
            <span className="font-mono text-lg font-bold tracking-widest text-foreground">{voucher.code}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[voucher.status]}`}>
              {statusIcons[voucher.status]} {voucher.status}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <DetailRow icon={<Tag className="w-4 h-4" />} label="Loại" value={voucher.voucher_type} />
            <DetailRow icon={<Tag className="w-4 h-4" />} label="Giá trị" value={voucher.value} />
            <DetailRow icon={<Store className="w-4 h-4" />} label="Chiến dịch" value={camp?.name ?? '-'} />
            <DetailRow icon={<Store className="w-4 h-4" />} label="Vendor" value={vendor ? `${vendor.logo} ${vendor.name}` : '-'} />
            <DetailRow icon={<Calendar className="w-4 h-4" />} label="Hết hạn" value={voucher.expiry_date} />
            {voucher.redeemed_at && (
              <DetailRow icon={<CheckCircle2 className="w-4 h-4" />} label="Đổi lúc" value={new Date(voucher.redeemed_at).toLocaleString('vi-VN')} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="w-24 text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
