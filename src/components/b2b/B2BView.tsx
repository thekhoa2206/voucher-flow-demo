import { useMemo } from 'react';
import { getCampaigns, getVouchers } from '@/lib/store';
import { vendors } from '@/lib/mock-data';

export default function B2BView() {
  const campaigns = useMemo(() => getCampaigns(), []);
  const vouchers = useMemo(() => getVouchers(), []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">B2B Campaign Overview</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {campaigns.map((c) => {
          const cv = vouchers.filter((v) => v.campaign_id === c.id);
          const issued = cv.length;
          const redeemed = cv.filter((v) => v.status === 'Redeemed').length;
          const remaining = cv.filter((v) => v.status === 'Active').length;
          const rate = issued > 0 ? ((redeemed / issued) * 100).toFixed(1) : '0';
          const vendor = vendors.find((v) => v.id === c.vendor_id);

          return (
            <div key={c.id} className="rounded-xl bg-card border border-border p-5 space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">{c.name}</h3>
                <p className="text-sm text-muted-foreground">{vendor?.logo} {vendor?.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xl font-bold text-foreground">{issued}</p>
                  <p className="text-xs text-muted-foreground">Phát hành</p>
                </div>
                <div className="rounded-lg bg-success/10 p-3">
                  <p className="text-xl font-bold text-success">{redeemed}</p>
                  <p className="text-xs text-muted-foreground">Đã dùng</p>
                </div>
                <div className="rounded-lg bg-info/10 p-3">
                  <p className="text-xl font-bold text-info">{remaining}</p>
                  <p className="text-xs text-muted-foreground">Còn lại</p>
                </div>
                <div className="rounded-lg bg-warning/10 p-3">
                  <p className="text-xl font-bold text-warning">{rate}%</p>
                  <p className="text-xs text-muted-foreground">Tỷ lệ dùng</p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${rate}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
