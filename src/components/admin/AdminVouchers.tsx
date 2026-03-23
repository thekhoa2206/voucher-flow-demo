import { useState, useMemo, useCallback } from 'react';
import { getVouchers, getCampaigns, saveVouchers } from '@/lib/store';
import { vendors } from '@/lib/mock-data';
import { Voucher, VoucherStatus } from '@/lib/types';
import { QRCodeSVG } from 'qrcode.react';
import { Search, Download, Clock, X, CheckCircle2, AlertCircle, Ticket } from 'lucide-react';

const statusColors: Record<VoucherStatus, string> = {
  Active: 'bg-success/10 text-success',
  Redeemed: 'bg-info/10 text-info',
  Expired: 'bg-destructive/10 text-destructive',
};

const statusIcons: Record<VoucherStatus, React.ReactNode> = {
  Active: <CheckCircle2 className="w-3.5 h-3.5" />,
  Redeemed: <Ticket className="w-3.5 h-3.5" />,
  Expired: <AlertCircle className="w-3.5 h-3.5" />,
};

export default function AdminVouchers() {
  const [allVouchers, setAllVouchers] = useState(() => getVouchers());
  const campaigns = useMemo(() => getCampaigns(), []);
  const [statusFilter, setStatusFilter] = useState<VoucherStatus | 'All'>('All');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailVoucher, setDetailVoucher] = useState<Voucher | null>(null);

  const statuses: (VoucherStatus | 'All')[] = ['All', 'Active', 'Redeemed', 'Expired'];

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
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((v) => v.code)));
    }
  };

  const handleExportCSV = useCallback(() => {
    const rows = filtered.filter((v) => selected.size === 0 || selected.has(v.code));
    const header = 'Code,Status,Campaign,Vendor,Type,Value,Expiry,Redeemed At\n';
    const csv = header + rows.map((v) => {
      const camp = campaigns.find((c) => c.id === v.campaign_id);
      const vendor = vendors.find((vn) => vn.id === v.vendor_id);
      return `${v.code},${v.status},${camp?.name || ''},${vendor?.name || ''},${v.voucher_type},${v.value},${v.expiry_date},${v.redeemed_at || ''}`;
    }).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vouchers.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered, selected, campaigns]);

  const handleMarkExpired = useCallback(() => {
    const codes = selected.size > 0 ? selected : new Set(filtered.filter((v) => v.status === 'Active').map((v) => v.code));
    const updated = allVouchers.map((v) => codes.has(v.code) && v.status === 'Active' ? { ...v, status: 'Expired' as const } : v);
    saveVouchers(updated);
    setAllVouchers(updated);
    setSelected(new Set());
  }, [allVouchers, selected, filtered]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Danh sách Voucher</h1>
          <p className="text-sm text-muted-foreground">{allVouchers.length} voucher · {filtered.length} hiển thị</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={handleMarkExpired} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition">
            <Clock className="w-3.5 h-3.5" /> Mark Expired
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã voucher..."
            className="w-full rounded-lg border border-input bg-card pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Status tabs */}
        <div className="flex rounded-lg border border-border bg-card p-0.5 gap-0.5">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                statusFilter === s ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s} ({s === 'All' ? allVouchers.length : allVouchers.filter((v) => v.status === s).length})
            </button>
          ))}
        </div>

        {/* Campaign filter */}
        <select
          value={campaignFilter}
          onChange={(e) => setCampaignFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">Tất cả Campaign</option>
          {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Selected actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/20 px-4 py-2.5 text-sm">
          <span className="font-medium text-primary">{selected.size} đã chọn</span>
          <button onClick={() => setSelected(new Set())} className="text-xs text-muted-foreground hover:text-foreground transition">Bỏ chọn</button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium w-10">
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded border-border accent-primary" />
                </th>
                <th className="text-left px-4 py-3 font-medium">Mã</th>
                <th className="text-left px-4 py-3 font-medium">Campaign</th>
                <th className="text-left px-4 py-3 font-medium">Vendor</th>
                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                <th className="text-right px-4 py-3 font-medium">Hết hạn</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Không tìm thấy voucher</td></tr>
              )}
              {filtered.map((v) => {
                const vendor = vendors.find((vn) => vn.id === v.vendor_id);
                const camp = campaigns.find((c) => c.id === v.campaign_id);
                return (
                  <tr
                    key={v.code}
                    onClick={() => setDetailVoucher(v)}
                    className={`border-b border-border last:border-0 cursor-pointer transition ${selected.has(v.code) ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                  >
                    <td className="px-4 py-3" onClick={(e) => { e.stopPropagation(); toggleSelect(v.code); }}>
                      <input type="checkbox" checked={selected.has(v.code)} onChange={() => toggleSelect(v.code)} className="rounded border-border accent-primary" />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">{v.code}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{camp?.name || '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{vendor?.logo} {vendor?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[v.status]}`}>
                        {statusIcons[v.status]} {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground text-xs">{v.expiry_date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer/Modal */}
      {detailVoucher && (
        <VoucherDetailDrawer voucher={detailVoucher} onClose={() => setDetailVoucher(null)} />
      )}
    </div>
  );
}

function VoucherDetailDrawer({ voucher, onClose }: { voucher: Voucher; onClose: () => void }) {
  const vendor = vendors.find((v) => v.id === voucher.vendor_id);
  const campaigns = getCampaigns();
  const camp = campaigns.find((c) => c.id === voucher.campaign_id);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-card border-l border-border shadow-2xl overflow-y-auto animate-in slide-in-from-right">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Chi tiết Voucher</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status banner */}
          <div className={`rounded-xl p-4 text-center ${statusColors[voucher.status]}`}>
            <span className="text-lg font-bold">{voucher.status}</span>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="rounded-xl border border-border p-5 bg-card">
              <QRCodeSVG value={`evoucher://${voucher.code}`} size={160} />
            </div>
          </div>

          {/* Code */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Mã voucher</p>
            <p className="font-mono text-lg font-bold text-foreground tracking-wider">{voucher.code}</p>
          </div>

          {/* Details grid */}
          <div className="rounded-xl border border-border divide-y divide-border">
            <DetailRow label="Campaign" value={camp?.name || '-'} />
            <DetailRow label="Vendor" value={`${vendor?.logo} ${vendor?.name}`} />
            <DetailRow label="Loại" value={voucher.voucher_type} />
            <DetailRow label="Giá trị" value={voucher.value} highlight />
            <DetailRow label="Ngày hết hạn" value={voucher.expiry_date} />
          </div>

          {/* Redemption history */}
          {voucher.status === 'Redeemed' && voucher.redeemed_at && (
            <div className="rounded-xl border border-border p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" /> Lịch sử sử dụng
              </h3>
              <div className="rounded-lg bg-muted/50 p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thời gian</span>
                  <span className="text-foreground">{new Date(voucher.redeemed_at).toLocaleString('vi')}</span>
                </div>
                {voucher.redeemed_by && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vendor</span>
                    <span className="text-foreground">{vendors.find((v) => v.id === voucher.redeemed_by)?.name || voucher.redeemed_by}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</span>
    </div>
  );
}
