import { useState, useMemo, useEffect, useCallback } from 'react';
import { useVouchers, useCampaigns, useVendors } from '@/lib/useStore';
import { Voucher, VoucherStatus } from '@/lib/types';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Copy, Check, Ticket, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

// ── Status config ─────────────────────────────────────────────────────────────

const statusConfig: Record<VoucherStatus, { label: string; badgeClass: string; icon: React.ReactNode }> = {
  Active:   { label: 'Còn hiệu lực', badgeClass: 'bg-success text-white', icon: <Clock className="w-3 h-3" /> },
  Redeemed: { label: 'Đã sử dụng',   badgeClass: 'bg-muted text-muted-foreground', icon: <CheckCircle2 className="w-3 h-3" /> },
  Expired:  { label: 'Hết hạn',      badgeClass: 'bg-destructive/80 text-white', icon: <XCircle className="w-3 h-3" /> },
};

// ── Countdown hook ────────────────────────────────────────────────────────────

function useCountdown(expiryDate: string) {
  const target = useMemo(() => new Date(expiryDate + 'T23:59:59').getTime(), [expiryDate]);
  const calc = useCallback(() => {
    const diff = target - Date.now();
    if (diff <= 0) return null;
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  }, [target]);
  const [remaining, setRemaining] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setRemaining(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return remaining;
}

// ── Vendor gradient map ───────────────────────────────────────────────────────

const vendorGradients: Record<string, string> = {
  v1: 'from-amber-500 to-orange-400',
  v2: 'from-blue-500 to-cyan-400',
  v3: 'from-red-500 to-pink-400',
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

function WalletSkeleton() {
  return (
    <div className="max-w-sm mx-auto space-y-5">
      <div className="text-center pt-2 space-y-2">
        <div className="h-7 w-32 rounded-lg bg-muted animate-pulse mx-auto" />
        <div className="h-4 w-24 rounded bg-muted animate-pulse mx-auto" />
      </div>
      <div className="h-11 rounded-xl bg-muted animate-pulse" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-border">
            <div className="h-16 bg-muted animate-pulse" />
            <div className="h-px bg-border" />
            <div className="h-14 bg-card animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function EndUserView() {
  const allVouchers = useVouchers();
  const campaigns   = useCampaigns();
  const [selected, setSelected]   = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'used'>('active');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const activeVouchers = useMemo(() => allVouchers.filter((v) => v.status === 'Active'), [allVouchers]);
  const usedVouchers   = useMemo(() => allVouchers.filter((v) => v.status !== 'Active'), [allVouchers]);

  const selectedVoucher = useMemo(
    () => allVouchers.find((v) => v.code === selected) ?? null,
    [allVouchers, selected],
  );

  if (loading) return <WalletSkeleton />;

  if (selectedVoucher) {
    return (
      <VoucherDetail
        voucher={selectedVoucher}
        campaigns={campaigns}
        onBack={() => setSelected(null)}
      />
    );
  }

  const listToShow = activeTab === 'active' ? activeVouchers : usedVouchers;

  return (
    <div className="max-w-sm mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="text-xl font-bold text-foreground">Ví Voucher</h1>
        <p className="text-sm text-muted-foreground">{activeVouchers.length} voucher khả dụng</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-muted p-1 gap-1">
        <TabBtn active={activeTab === 'active'} onClick={() => setActiveTab('active')} count={activeVouchers.length}>Khả dụng</TabBtn>
        <TabBtn active={activeTab === 'used'}   onClick={() => setActiveTab('used')}   count={usedVouchers.length}>Đã dùng</TabBtn>
      </div>

      {/* List */}
      {listToShow.length === 0 ? (
        <div className="text-center py-16">
          <Ticket className="w-14 h-14 mx-auto text-muted-foreground/20 mb-3" />
          <p className="text-muted-foreground text-sm">
            {activeTab === 'active' ? 'Bạn chưa có voucher nào' : 'Chưa có voucher đã dùng'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {listToShow.map((v, i) => (
            <div key={v.code} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}>
              <VoucherCard
                voucher={v}
                campaignName={campaigns.find((c) => c.id === v.campaign_id)?.name}
                onClick={() => setSelected(v.code)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── VoucherCard ───────────────────────────────────────────────────────────────

function VoucherCard({ voucher, campaignName, onClick }: { voucher: Voucher; campaignName?: string; onClick: () => void }) {
  const vendors  = useVendors();
  const vendor   = vendors.find((v) => v.id === voucher.vendor_id);
  const gradient = vendorGradients[voucher.vendor_id] ?? 'from-primary to-primary/70';
  const cfg      = statusConfig[voucher.status];
  const isUsed   = voucher.status !== 'Active';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl overflow-hidden border transition-all ${
        isUsed
          ? 'border-border opacity-70 hover:opacity-90'
          : 'border-transparent shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]'
      }`}
    >
      <div className={`bg-gradient-to-r ${gradient} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{vendor?.logo}</span>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{vendor?.name}</p>
            <p className="text-white/70 text-xs">{voucher.voucher_type === 'Cash' ? 'Tiền mặt' : voucher.voucher_type === 'Discount %' ? 'Giảm giá' : 'Mua X Tặng Y'}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.badgeClass}`}>
          {cfg.icon} {cfg.label}
        </span>
      </div>
      <div className="bg-card flex items-center">
        <div className="w-4 h-4 rounded-full bg-background -ml-2 shrink-0" />
        <div className="flex-1 border-t-2 border-dashed border-border mx-1" />
        <div className="w-4 h-4 rounded-full bg-background -mr-2 shrink-0" />
      </div>
      <div className="bg-card px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-foreground">{voucher.value}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[160px]">{campaignName ?? '—'}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs text-muted-foreground tracking-wider">{voucher.code.slice(-8)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">HSD: {voucher.expiry_date}</p>
        </div>
      </div>
    </button>
  );
}

// ── VoucherDetail ─────────────────────────────────────────────────────────────

function VoucherDetail({ voucher, campaigns, onBack }: {
  voucher: Voucher;
  campaigns: ReturnType<typeof useCampaigns>;
  onBack: () => void;
}) {
  const vendors   = useVendors();
  const vendor    = vendors.find((v) => v.id === voucher.vendor_id);
  const campaign  = campaigns.find((c) => c.id === voucher.campaign_id);
  const gradient  = vendorGradients[voucher.vendor_id] ?? 'from-primary to-primary/70';
  const cfg       = statusConfig[voucher.status];
  const isActive  = voucher.status === 'Active';
  const countdown = useCountdown(voucher.expiry_date);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    toast.success('Đã sao chép mã!', { description: voucher.code, duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-sm mx-auto space-y-4 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <div className="rounded-3xl overflow-hidden shadow-xl border border-border">
        {/* Header gradient */}
        <div className={`bg-gradient-to-br ${gradient} px-6 pt-6 pb-8 relative`}>
          <div className="flex justify-end mb-3">
            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.badgeClass}`}>
              {cfg.icon} {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl shadow-inner">
              {vendor?.logo}
            </div>
            <div>
              <p className="text-white/80 text-xs uppercase tracking-widest">Voucher từ</p>
              <p className="text-white font-bold text-lg leading-tight">{vendor?.name}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-white/70 text-sm">{campaign?.name}</p>
            <p className="text-white font-black text-4xl mt-1 drop-shadow">{voucher.value}</p>
          </div>
        </div>

        {/* Ticket tear */}
        <div className="bg-card flex items-center -mt-1">
          <div className="w-5 h-5 rounded-full bg-background -ml-2.5 shrink-0" />
          <div className="flex-1 border-t-2 border-dashed border-border mx-2" />
          <div className="w-5 h-5 rounded-full bg-background -mr-2.5 shrink-0" />
        </div>

        {/* QR + code */}
        <div className="bg-card px-6 py-6 space-y-5">
          <div className="flex justify-center">
            <div className={`relative rounded-2xl p-4 border-2 ${isActive ? 'border-primary/30 bg-white' : 'border-border bg-muted/30'}`}>
              <QRCodeSVG value={`evoucher://${voucher.code}`} size={200} fgColor={isActive ? '#000000' : '#9ca3af'} />
              {!isActive && (
                <div className="absolute inset-0 rounded-2xl bg-background/60 flex items-center justify-center">
                  <div className="text-center">
                    {voucher.status === 'Redeemed'
                      ? <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto" />
                      : <XCircle className="w-12 h-12 text-destructive/50 mx-auto" />}
                    <p className="text-xs text-muted-foreground mt-1 font-medium">{cfg.label}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Code row */}
          <div
            onClick={isActive ? handleCopy : undefined}
            className={`flex items-center justify-between rounded-xl px-4 py-3 border-2 transition-all ${
              isActive
                ? 'border-dashed border-primary/40 bg-primary/5 cursor-pointer hover:bg-primary/10 active:scale-95'
                : 'border-border bg-muted/30 cursor-default'
            }`}
          >
            <span className="font-mono font-bold text-lg tracking-widest text-foreground">{voucher.code}</span>
            {isActive && (
              <span className={`flex items-center gap-1 text-xs font-semibold transition-all ${copied ? 'text-success' : 'text-primary'}`}>
                {copied ? <><Check className="w-4 h-4" /> Đã sao chép</> : <><Copy className="w-4 h-4" /> Sao chép</>}
              </span>
            )}
          </div>

          {isActive && (
            <button
              onClick={handleCopy}
              className={`w-full rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                copied ? 'bg-success text-white' : 'bg-primary text-primary-foreground hover:opacity-90'
              }`}
            >
              {copied ? <><Check className="w-4 h-4" /> Đã sao chép mã!</> : <><Copy className="w-4 h-4" /> Sao chép mã voucher</>}
            </button>
          )}

          {/* Countdown */}
          {isActive && (
            <div className="rounded-xl bg-muted/50 px-4 py-3">
              {countdown ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground text-center">Thời gian còn lại</p>
                  <div className="flex justify-center gap-2">
                    {[{ v: countdown.d, u: 'ngày' }, { v: countdown.h, u: 'giờ' }, { v: countdown.m, u: 'phút' }, { v: countdown.s, u: 'giây' }].map(({ v, u }) => (
                      <div key={u} className="flex flex-col items-center min-w-[44px]">
                        <span className="text-xl font-black text-foreground tabular-nums">{String(v).padStart(2, '0')}</span>
                        <span className="text-[10px] text-muted-foreground">{u}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-destructive text-center font-medium">Voucher đã hết hạn</p>
              )}
            </div>
          )}

          {/* Info */}
          <div className="space-y-2.5 text-sm border-t border-border pt-4">
            {campaign?.description && (
              <div className="rounded-lg bg-muted/40 px-3 py-2.5">
                <p className="text-xs text-muted-foreground mb-0.5">Mô tả</p>
                <p className="text-foreground text-xs leading-relaxed">{campaign.description}</p>
              </div>
            )}
            <InfoRow label="Hạn sử dụng" value={voucher.expiry_date} />
            <InfoRow label="Loại voucher" value={voucher.voucher_type === 'Cash' ? 'Tiền mặt' : voucher.voucher_type === 'Discount %' ? 'Giảm giá %' : 'Mua X Tặng Y'} />
            {voucher.redeemed_at && (
              <InfoRow label="Đã dùng lúc" value={new Date(voucher.redeemed_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function TabBtn({ active, onClick, count, children }: { active: boolean; onClick: () => void; count: number; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
        active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
        {count}
      </span>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
