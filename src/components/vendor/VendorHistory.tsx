import { useMemo } from 'react';
import { getVouchers, getCampaigns } from '@/lib/store';
import { vendors } from '@/lib/mock-data';
import { History } from 'lucide-react';

export default function VendorHistory() {
  const redeemed = useMemo(() => getVouchers().filter((v) => v.status === 'Redeemed'), []);
  const campaigns = useMemo(() => getCampaigns(), []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lịch sử đổi voucher</h1>
        <p className="text-sm text-muted-foreground">{redeemed.length} giao dịch</p>
      </div>
      {redeemed.length === 0 ? (
        <div className="text-center py-16">
          <History className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Chưa có giao dịch nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {redeemed.map((v) => {
            const vendor = vendors.find((vn) => vn.id === v.vendor_id);
            const camp = campaigns.find((c) => c.id === v.campaign_id);
            return (
              <div key={v.code} className="rounded-xl bg-card border border-border p-4 flex items-center justify-between hover:shadow-sm transition">
                <div>
                  <p className="font-mono text-sm font-medium text-foreground">{v.code}</p>
                  <p className="text-xs text-muted-foreground">{vendor?.logo} {vendor?.name}</p>
                  {camp && <p className="text-[11px] text-muted-foreground">{camp.name}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{v.value}</p>
                  <p className="text-xs text-muted-foreground">{v.redeemed_at ? new Date(v.redeemed_at).toLocaleString('vi') : ''}</p>
                  <span className="inline-block mt-1 rounded-full bg-info/10 text-info px-2 py-0.5 text-[10px] font-medium">Đã sử dụng</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
