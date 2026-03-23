import { useMemo, useState, useEffect } from 'react';
import { useCampaigns, useVouchers, useVendors, useBranches } from '@/lib/useStore';
import { Campaign, Voucher, VoucherStatus, Vendor, Branch } from '@/lib/types';
import { ArrowLeft, BarChart3, CheckCircle2, Clock, XCircle, ChevronRight } from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<VoucherStatus, { label: string; className: string }> = {
  Active:   { label: 'Còn hiệu lực', className: 'bg-success/10 text-success' },
  Redeemed: { label: 'Đã sử dụng',   className: 'bg-info/10 text-info' },
  Expired:  { label: 'Hết hạn',      className: 'bg-muted text-muted-foreground' },
};

function rateColor(rate: number) {
  if (rate >= 70) return 'bg-success';
  if (rate >= 40) return 'bg-warning';
  return 'bg-primary';
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function B2BView() {
  const campaigns = useCampaigns();
  const vouchers  = useVouchers();
  const vendors   = useVendors();
  const branches  = useBranches();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map((i) => <div key={i} className="h-20 rounded-xl bg-card border border-border animate-pulse" />)}
        </div>
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-36 rounded-xl bg-card border border-border animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (selectedId) {
    const campaign = campaigns.find((c) => c.id === selectedId)!;
    const cv = vouchers.filter((v) => v.campaign_id === selectedId);
    return (
      <CampaignDetail
        campaign={campaign}
        vouchers={cv}
        vendors={vendors}
        branches={branches}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  // Summary totals
  const totalIssued   = vouchers.length;
  const totalRedeemed = vouchers.filter((v) => v.status === 'Redeemed').length;
  const totalActive   = vouchers.filter((v) => v.status === 'Active').length;
  const overallRate   = totalIssued > 0 ? Math.round((totalRedeemed / totalIssued) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">B2B Dashboard</h1>
        <p className="text-sm text-muted-foreground">Báo cáo hiệu quả phân phối voucher</p>
      </div>

      {/* Overall summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Tổng phát hành" value={totalIssued}   color="text-foreground" />
        <SummaryCard label="Đã sử dụng"     value={totalRedeemed} color="text-success" />
        <SummaryCard label="Còn lại"         value={totalActive}   color="text-info" />
        <SummaryCard label="Tỷ lệ dùng"     value={`${overallRate}%`} color="text-warning" />
      </div>

      {/* Campaign list */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Chiến dịch ({campaigns.length})
        </p>
        {campaigns.map((c) => {
          const cv       = vouchers.filter((v) => v.campaign_id === c.id);
          const issued   = cv.length;
          const redeemed = cv.filter((v) => v.status === 'Redeemed').length;
          const expired  = cv.filter((v) => v.status === 'Expired').length;
          const active   = cv.filter((v) => v.status === 'Active').length;
          const rate     = issued > 0 ? Math.round((redeemed / issued) * 100) : 0;
          const vendor   = vendors.find((v) => v.id === c.vendor_id);

          return (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="w-full text-left rounded-xl bg-card border border-border p-5 space-y-4 hover:border-primary/40 hover:shadow-md transition-all group"
            >
              {/* Campaign header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl shrink-0">
                    {vendor?.logo}
                  </div>                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{vendor?.name} · HSD: {c.expiry_date}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition shrink-0 mt-1" />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <StatCell label="Phát hành" value={issued}   />
                <StatCell label="Đã dùng"   value={redeemed} accent="text-success" />
                <StatCell label="Còn lại"   value={active}   accent="text-info" />
                <StatCell label="Hết hạn"   value={expired}  accent="text-muted-foreground" />
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tỷ lệ sử dụng</span>
                  <span className="font-semibold text-foreground">{rate}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${rateColor(rate)}`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-xl bg-card border border-border p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function StatCell({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-lg bg-muted/50 py-2 px-1">
      <p className={`text-lg font-bold ${accent ?? 'text-foreground'}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
    </div>
  );
}

// ── Campaign Detail ───────────────────────────────────────────────────────────

function CampaignDetail({
  campaign,
  vouchers,
  vendors,
  branches,
  onBack,
}: {
  campaign: Campaign;
  vouchers: Voucher[];
  vendors: Vendor[];
  branches: Branch[];
  onBack: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState<VoucherStatus | 'all'>('all');
  const vendor = vendors.find((v) => v.id === campaign.vendor_id);

  const issued   = vouchers.length;
  const redeemed = vouchers.filter((v) => v.status === 'Redeemed').length;
  const active   = vouchers.filter((v) => v.status === 'Active').length;
  const expired  = vouchers.filter((v) => v.status === 'Expired').length;
  const rate     = issued > 0 ? Math.round((redeemed / issued) * 100) : 0;

  const filtered = statusFilter === 'all'
    ? vouchers
    : vouchers.filter((v) => v.status === statusFilter);

  const tabs: { key: VoucherStatus | 'all'; label: string; count: number }[] = [
    { key: 'all',      label: 'Tất cả',       count: issued },
    { key: 'Active',   label: 'Còn hiệu lực', count: active },
    { key: 'Redeemed', label: 'Đã dùng',      count: redeemed },
    { key: 'Expired',  label: 'Hết hạn',      count: expired },
  ];

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      {/* Campaign header card */}
      <div className="rounded-xl bg-card border border-border p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
            {vendor?.logo}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{campaign.name}</h2>
            <p className="text-sm text-muted-foreground">{vendor?.name} · Loại: {campaign.voucher_type} · HSD: {campaign.expiry_date}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <StatCell label="Phát hành" value={issued} />
          <StatCell label="Đã dùng"   value={redeemed} accent="text-success" />
          <StatCell label="Còn lại"   value={active}   accent="text-info" />
          <StatCell label="Hết hạn"   value={expired}  accent="text-muted-foreground" />
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Tỷ lệ sử dụng</span>
            <span className="font-semibold text-foreground">{rate}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${rateColor(rate)}`}
              style={{ width: `${rate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Voucher list */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Danh sách voucher</p>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                statusFilter === t.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label} <span className="opacity-70">({t.count})</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mã voucher</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Chi nhánh</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Thời gian dùng</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((v) => {
                const cfg    = statusConfig[v.status];
                const branch = branches.find((b) => b.id === v.branch_id);
                return (
                  <tr key={v.code} className="bg-card hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-foreground tracking-wider">{v.code}</span>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{v.value}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                      {branch?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                      {v.redeemed_at
                        ? new Date(v.redeemed_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
                        {v.status === 'Active'   && <Clock className="w-3 h-3" />}
                        {v.status === 'Redeemed' && <CheckCircle2 className="w-3 h-3" />}
                        {v.status === 'Expired'  && <XCircle className="w-3 h-3" />}
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Không có voucher nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
