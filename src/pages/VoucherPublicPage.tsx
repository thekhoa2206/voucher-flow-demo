import { useParams } from 'react-router-dom';
import { useVouchers, useCampaigns, useVendors } from '@/lib/useStore';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { VoucherStatus } from '@/lib/types';

const statusConfig: Record<VoucherStatus, { label: string; icon: React.ReactNode; className: string; bg: string }> = {
  Active:   { label: 'Còn hiệu lực', icon: <Clock className="w-5 h-5" />,         className: 'text-success',             bg: 'bg-success/10' },
  Redeemed: { label: 'Đã sử dụng',   icon: <CheckCircle2 className="w-5 h-5" />,  className: 'text-info',                bg: 'bg-info/10' },
  Expired:  { label: 'Hết hạn',      icon: <AlertCircle className="w-5 h-5" />,   className: 'text-destructive',         bg: 'bg-destructive/10' },
};

export default function VoucherPublicPage() {
  const { code } = useParams<{ code: string }>();
  const vouchers  = useVouchers();
  const campaigns = useCampaigns();
  const vendors   = useVendors();

  const voucher = vouchers.find((v) => v.code === code?.toUpperCase());

  if (!voucher) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-lg font-bold text-foreground">Không tìm thấy voucher</h1>
          <p className="text-sm text-muted-foreground">Mã <span className="font-mono font-semibold">{code}</span> không tồn tại.</p>
        </div>
      </div>
    );
  }

  const campaign = campaigns.find((c) => c.id === voucher.campaign_id);
  const vendor   = vendors.find((v) => v.id === voucher.vendor_id);
  const cfg      = statusConfig[voucher.status];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-black text-xs">EV</div>
            <span className="font-bold text-foreground">eVoucher</span>
          </div>
          <p className="text-xs text-muted-foreground">Voucher điện tử</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-card border border-border shadow-lg overflow-hidden">
          {/* Vendor banner */}
          <div className="bg-primary/5 border-b border-border px-6 py-4 flex items-center gap-3">
            <span className="text-4xl">{vendor?.logo}</span>
            <div>
              <p className="font-bold text-foreground">{vendor?.name}</p>
              <p className="text-xs text-muted-foreground">{campaign?.name}</p>
            </div>
          </div>

          {/* QR + code */}
          <div className="flex flex-col items-center gap-3 py-6 px-6">
            <div className={`p-3 rounded-xl ${voucher.status !== 'Active' ? 'opacity-40 grayscale' : ''}`}>
              <QRCodeSVG value={voucher.code} size={160} />
            </div>
            <span className="font-mono text-xl font-bold tracking-widest text-foreground">{voucher.code}</span>
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${cfg.bg} ${cfg.className}`}>
              {cfg.icon} {cfg.label}
            </div>
          </div>

          {/* Details */}
          <div className="border-t border-border divide-y divide-border text-sm">
            <Row label="Giá trị" value={voucher.value} />
            <Row label="Loại" value={voucher.voucher_type} />
            <Row label="Hết hạn" value={voucher.expiry_date} />
            {voucher.redeemed_at && (
              <Row label="Đã dùng lúc" value={new Date(voucher.redeemed_at).toLocaleString('vi-VN')} />
            )}
            {voucher.recipient && (
              <Row label="Người nhận" value={voucher.recipient.name} />
            )}
          </div>
        </div>

        {voucher.status === 'Active' && (
          <p className="text-center text-xs text-muted-foreground">
            Xuất trình mã QR này cho thu ngân để đổi voucher
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-2.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
