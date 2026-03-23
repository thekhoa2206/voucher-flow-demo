import { useMemo, useState, useEffect } from 'react';
import { getVouchers, getCampaigns } from '@/lib/store';
import { vendors } from '@/lib/mock-data';
import { Ticket, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const vouchers = useMemo(() => getVouchers(), []);
  const campaigns = useMemo(() => getCampaigns(), []);

  const total = vouchers.length;
  const redeemed = vouchers.filter((v) => v.status === 'Redeemed').length;
  const rate = total > 0 ? ((redeemed / total) * 100).toFixed(1) : '0';
  const gmv = redeemed * 50000;

  const vendorStats = vendors.map((vendor) => {
    const vv = vouchers.filter((v) => v.vendor_id === vendor.id);
    return {
      ...vendor,
      total: vv.length,
      redeemed: vv.filter((v) => v.status === 'Redeemed').length,
    };
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-card border border-border animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-card border border-border animate-pulse" />
      </div>
    );
  }

  const stats = [
    { label: 'Tổng voucher', value: total, icon: <Ticket className="w-5 h-5" />, color: 'text-info bg-info/10' },
    { label: 'Đã sử dụng', value: redeemed, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-success bg-success/10' },
    { label: 'Tỷ lệ dùng', value: `${rate}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-warning bg-warning/10' },
    { label: 'GMV (mock)', value: `${(gmv / 1000).toFixed(0)}K`, icon: <DollarSign className="w-5 h-5" />, color: 'text-accent bg-accent/10' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-card border border-border p-5 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Vendor breakdown */}
      <div className="rounded-xl bg-card border border-border p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">Theo Vendor</h2>
        <div className="space-y-3">
          {vendorStats.map((vs) => (
            <div key={vs.id} className="flex items-center gap-4">
              <span className="text-2xl">{vs.logo}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{vs.name}</span>
                  <span className="text-xs text-muted-foreground">{vs.redeemed}/{vs.total}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: vs.total > 0 ? `${(vs.redeemed / vs.total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent campaigns */}
      <div className="rounded-xl bg-card border border-border p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">Campaigns gần đây</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 font-medium">Tên</th>
                <th className="text-left py-2 font-medium">Vendor</th>
                <th className="text-left py-2 font-medium">Loại</th>
                <th className="text-right py-2 font-medium">SL</th>
                <th className="text-right py-2 font-medium">Hết hạn</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const vendor = vendors.find((v) => v.id === c.vendor_id);
                return (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium text-foreground">{c.name}</td>
                    <td className="py-3">{vendor?.logo} {vendor?.name}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">{c.voucher_type}</span>
                    </td>
                    <td className="py-3 text-right">{c.quantity}</td>
                    <td className="py-3 text-right text-muted-foreground">{c.expiry_date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
