import { useMemo, useState, useEffect } from 'react';
import { useCampaigns, useVouchers, useVendors, useB2BCustomers } from '@/lib/useStore';
import { Ticket, CheckCircle2, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type TimeRange = '7d' | '30d';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const allVouchers = useVouchers();
  const campaigns = useCampaigns();
  const vendors = useVendors();
  const b2bCustomers = useB2BCustomers();

  // Filter by campaign
  const vouchers = useMemo(
    () => campaignFilter === 'all' ? allVouchers : allVouchers.filter((v) => v.campaign_id === campaignFilter),
    [allVouchers, campaignFilter]
  );

  // KPIs
  const total = vouchers.length;
  const redeemed = vouchers.filter((v) => v.status === 'Redeemed').length;
  const rate = total > 0 ? ((redeemed / total) * 100).toFixed(1) : '0';
  const gmv = redeemed * 50000;

  // Line chart data: redemptions per day within time range
  const lineData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : 30;
    const now = new Date();
    const buckets: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
      buckets[key] = 0;
    }
    vouchers
      .filter((v) => v.status === 'Redeemed' && v.redeemed_at)
      .forEach((v) => {
        const d = new Date(v.redeemed_at!);
        const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
        if (diff < days) {
          const key = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
          if (buckets[key] !== undefined) buckets[key]++;
        }
      });
    return Object.entries(buckets).map(([date, count]) => ({ date, count }));
  }, [vouchers, timeRange]);

  // Bar chart data: top vendors by redemptions
  const barData = useMemo(() => {
    return vendors.map((vendor) => {
      const count = vouchers.filter((v) => v.vendor_id === vendor.id && v.status === 'Redeemed').length;
      return { name: vendor.name, logo: vendor.logo, count };
    }).sort((a, b) => b.count - a.count);
  }, [vouchers]);

  const barColors = ['hsl(168, 80%, 36%)', 'hsl(210, 92%, 55%)', 'hsl(262, 60%, 55%)'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-card border border-border animate-pulse" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="h-72 rounded-xl bg-card border border-border animate-pulse" />
          <div className="h-72 rounded-xl bg-card border border-border animate-pulse" />
        </div>
        <div className="h-48 rounded-xl bg-card border border-border animate-pulse" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Tổng phát hành',
      value: total.toLocaleString(),
      icon: <Ticket className="w-5 h-5" />,
      color: 'text-info bg-info/10',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: 'Đã sử dụng',
      value: redeemed.toLocaleString(),
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: 'text-success bg-success/10',
      trend: '+8%',
      trendUp: true,
    },
    {
      label: 'Tỷ lệ sử dụng',
      value: `${rate}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-warning bg-warning/10',
      trend: '-2%',
      trendUp: false,
    },
    {
      label: 'Tổng GMV',
      value: `${(gmv / 1000).toLocaleString()}K ₫`,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-accent bg-accent/10',
      trend: '+15%',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tổng quan</h1>
          <p className="text-sm text-muted-foreground">Tổng quan hiệu suất voucher</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Campaign filter */}
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Tất cả chiến dịch</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Time range */}
          <div className="flex rounded-lg border border-border bg-card p-0.5">
            {(['7d', '30d'] as TimeRange[]).map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  timeRange === t
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === '7d' ? '7 ngày' : '30 ngày'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-card border border-border p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>{s.icon}</div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${s.trendUp ? 'text-success' : 'text-destructive'}`}>
                {s.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {s.trend}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Line Chart */}
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Lượt đổi theo ngày</h2>
              <p className="text-xs text-muted-foreground">{timeRange === '7d' ? '7 ngày' : '30 ngày'} gần nhất</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 89%)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'hsl(220, 9%, 46%)' }}
                  axisLine={false}
                  tickLine={false}
                  interval={timeRange === '7d' ? 0 : 'preserveStartEnd'}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(220, 9%, 46%)' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(220, 13%, 89%)',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(168, 80%, 36%)"
                  strokeWidth={2.5}
                  dot={{ fill: 'hsl(168, 80%, 36%)', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  name="Redemptions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Vendor hàng đầu</h2>
            <p className="text-xs text-muted-foreground">Số lượt đổi theo vendor</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 89%)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: 'hsl(220, 9%, 46%)' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: 'hsl(222, 47%, 11%)' }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0, 0%, 100%)',
                    border: '1px solid hsl(220, 13%, 89%)',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Redemptions" radius={[0, 6, 6, 0]}>
                  {barData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent campaigns table */}
      <div className="rounded-xl bg-card border border-border p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Chiến dịch gần đây</h2>        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2.5 font-medium">Tên</th>
                <th className="text-left py-2.5 font-medium hidden sm:table-cell">Vendor</th>
                <th className="text-left py-2.5 font-medium hidden md:table-cell">Loại</th>
                <th className="text-right py-2.5 font-medium">Phát hành</th>
                <th className="text-right py-2.5 font-medium">Đã dùng</th>
                <th className="text-right py-2.5 font-medium hidden sm:table-cell">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const vendor = vendors.find((v) => v.id === c.vendor_id);
                const cv = allVouchers.filter((v) => v.campaign_id === c.id);
                const issued = cv.length;
                const red = cv.filter((v) => v.status === 'Redeemed').length;
                const r = issued > 0 ? ((red / issued) * 100).toFixed(1) : '0';
                return (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition">
                    <td className="py-3 font-medium text-foreground">{c.name}</td>
                    <td className="py-3 text-muted-foreground hidden sm:table-cell">{vendor?.logo} {vendor?.name}</td>
                    <td className="py-3 hidden md:table-cell">
                      <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">{c.voucher_type}</span>
                    </td>
                    <td className="py-3 text-right font-medium text-foreground">{issued}</td>
                    <td className="py-3 text-right font-medium text-success">{red}</td>
                    <td className="py-3 text-right hidden sm:table-cell">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">{r}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* B2B Breakdown */}
      {b2bCustomers.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Phân tích theo B2B Customer</h2>
          <div className="space-y-3">
            {b2bCustomers.map((b2b) => {
              const b2bCampaigns = campaigns.filter((c) => c.b2b_customer_id === b2b.id);
              const b2bVouchers = allVouchers.filter((v) =>
                b2bCampaigns.some((c) => c.id === v.campaign_id)
              );
              const issued = b2bVouchers.length;
              const redeemed = b2bVouchers.filter((v) => v.status === 'Redeemed').length;
              const sent = b2bVouchers.filter((v) => v.send_status === 'Sent').length;
              const pending = b2bVouchers.filter((v) => v.send_status === 'Pending').length;
              const rate = issued > 0 ? Math.round((redeemed / issued) * 100) : 0;
              if (issued === 0) return null;
              return (
                <div key={b2b.id} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">🏢</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{b2b.companyName}</p>
                        <p className="text-xs text-muted-foreground">{b2b.industry} · {b2bCampaigns.length} chiến dịch</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-foreground shrink-0">{rate}%</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="rounded bg-muted/50 py-1.5">
                      <p className="font-bold text-foreground">{issued}</p>
                      <p className="text-muted-foreground">Phát hành</p>
                    </div>
                    <div className="rounded bg-success/5 py-1.5">
                      <p className="font-bold text-success">{redeemed}</p>
                      <p className="text-muted-foreground">Đã dùng</p>
                    </div>
                    <div className="rounded bg-info/5 py-1.5">
                      <p className="font-bold text-info">{sent}</p>
                      <p className="text-muted-foreground">Đã gửi</p>
                    </div>
                    <div className="rounded bg-warning/5 py-1.5">
                      <p className="font-bold text-warning">{pending}</p>
                      <p className="text-muted-foreground">Chờ gửi</p>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${rate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
