import { useMemo } from 'react';
import { getVouchers } from '@/lib/store';
import { vendors } from '@/lib/mock-data';

export default function VendorHistory() {
  const redeemed = useMemo(() => getVouchers().filter((v) => v.status === 'Redeemed'), []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Lịch sử Redeem</h1>
      {redeemed.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Chưa có giao dịch nào</p>
      ) : (
        <div className="space-y-3">
          {redeemed.map((v) => {
            const vendor = vendors.find((vn) => vn.id === v.vendor_id);
            return (
              <div key={v.code} className="rounded-xl bg-card border border-border p-4 flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-medium text-foreground">{v.code}</p>
                  <p className="text-xs text-muted-foreground">{vendor?.logo} {vendor?.name} · {v.voucher_type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{v.value}</p>
                  <p className="text-xs text-muted-foreground">{v.redeemed_at ? new Date(v.redeemed_at).toLocaleDateString('vi') : ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
