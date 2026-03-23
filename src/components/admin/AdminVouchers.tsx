import { useState, useMemo } from 'react';
import { getVouchers } from '@/lib/store';
import { vendors } from '@/lib/mock-data';
import { VoucherStatus } from '@/lib/types';

const statusColors: Record<VoucherStatus, string> = {
  Active: 'bg-success/10 text-success',
  Redeemed: 'bg-info/10 text-info',
  Expired: 'bg-destructive/10 text-destructive',
};

export default function AdminVouchers() {
  const vouchers = useMemo(() => getVouchers(), []);
  const [filter, setFilter] = useState<VoucherStatus | 'All'>('All');

  const filtered = filter === 'All' ? vouchers : vouchers.filter((v) => v.status === filter);
  const statuses: (VoucherStatus | 'All')[] = ['All', 'Active', 'Redeemed', 'Expired'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Danh sách Voucher</h1>

      {/* Filter */}
      <div className="flex gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              filter === s ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {s} {s !== 'All' && `(${vouchers.filter((v) => v.status === s).length})`}
            {s === 'All' && `(${vouchers.length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium">Mã</th>
                <th className="text-left px-4 py-3 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 font-medium">Vendor</th>
                <th className="text-left px-4 py-3 font-medium">Loại</th>
                <th className="text-left px-4 py-3 font-medium">Giá trị</th>
                <th className="text-right px-4 py-3 font-medium">Hết hạn</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => {
                const vendor = vendors.find((vn) => vn.id === v.vendor_id);
                return (
                  <tr key={v.code} className="border-b border-border last:border-0 hover:bg-muted/30 transition">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">{v.code}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[v.status]}`}>{v.status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{vendor?.logo} {vendor?.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.voucher_type}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{v.value}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{v.expiry_date}</td>
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
