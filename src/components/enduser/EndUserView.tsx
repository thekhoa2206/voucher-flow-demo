import { useState, useMemo } from 'react';
import { getVouchers } from '@/lib/store';
import { vendors } from '@/lib/mock-data';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Ticket } from 'lucide-react';

export default function EndUserView() {
  const vouchers = useMemo(() => getVouchers().filter((v) => v.status === 'Active'), []);
  const [selected, setSelected] = useState<string | null>(null);

  const selectedVoucher = vouchers.find((v) => v.code === selected);

  if (selectedVoucher) {
    const vendor = vendors.find((v) => v.id === selectedVoucher.vendor_id);
    return (
      <div className="max-w-sm mx-auto space-y-6">
        <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-primary p-6 text-center">
            <p className="text-primary-foreground/80 text-sm">Voucher</p>
            <p className="text-2xl font-bold text-primary-foreground">{selectedVoucher.value}</p>
            <p className="text-primary-foreground/70 text-sm mt-1">{vendor?.logo} {vendor?.name}</p>
          </div>
          {/* QR */}
          <div className="flex justify-center py-8">
            <div className="rounded-xl border border-border p-4 bg-card">
              <QRCodeSVG value={`evoucher://${selectedVoucher.code}`} size={180} />
            </div>
          </div>
          {/* Details */}
          <div className="px-6 pb-6 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Mã voucher</span><span className="font-mono font-medium text-foreground">{selectedVoucher.code}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Loại</span><span className="text-foreground">{selectedVoucher.voucher_type}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Hết hạn</span><span className="text-foreground">{selectedVoucher.expiry_date}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Trạng thái</span><span className="text-success font-medium">Active</span></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-foreground">Voucher của tôi</h1>
        <p className="text-sm text-muted-foreground">{vouchers.length} voucher khả dụng</p>
      </div>

      {vouchers.length === 0 ? (
        <div className="text-center py-12">
          <Ticket className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Bạn chưa có voucher nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vouchers.map((v) => {
            const vendor = vendors.find((vn) => vn.id === v.vendor_id);
            return (
              <button
                key={v.code}
                onClick={() => setSelected(v.code)}
                className="w-full rounded-xl bg-card border border-border p-4 flex items-center gap-4 text-left hover:border-primary/50 hover:shadow-sm transition"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">{vendor?.logo}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{v.value}</p>
                  <p className="text-xs text-muted-foreground">{vendor?.name} · HSD: {v.expiry_date}</p>
                </div>
                <div className="text-xs font-mono text-muted-foreground">{v.code.slice(-6)}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
