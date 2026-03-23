import { useState, useMemo } from 'react';
import { getCampaigns, saveCampaign, addVouchers } from '@/lib/store';
import { vendors, generateVouchersForCampaign } from '@/lib/mock-data';
import { Campaign, VoucherType } from '@/lib/types';
import { Plus, X } from 'lucide-react';

interface Props {
  onCreated: () => void;
}

export default function AdminCampaigns({ onCreated }: Props) {
  const [campaigns, setCampaigns] = useState(() => getCampaigns());
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [vendorId, setVendorId] = useState(vendors[0].id);
  const [vType, setVType] = useState<VoucherType>('Cash');
  const [qty, setQty] = useState(10);
  const [expiry, setExpiry] = useState('2025-12-31');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    const campaign: Campaign = {
      id: `camp_${Date.now()}`,
      name,
      vendor_id: vendorId,
      voucher_type: vType,
      quantity: qty,
      expiry_date: expiry,
      created_at: new Date().toISOString().split('T')[0],
    };
    saveCampaign(campaign);
    const vouchers = generateVouchersForCampaign(campaign);
    addVouchers(vouchers);
    setCampaigns(getCampaigns());
    setShowForm(false);
    setSaving(false);
    setName('');
    onCreated();
  };

  const voucherTypes: VoucherType[] = ['Cash', 'Discount %', 'Buy X Get Y'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> Tạo Campaign
        </button>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Tạo Campaign mới</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tên campaign</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="VD: Flash Sale Tháng 4" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Vendor</label>
                <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  {vendors.map((v) => <option key={v.id} value={v.id}>{v.logo} {v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Loại voucher</label>
                <div className="flex gap-2">
                  {voucherTypes.map((t) => (
                    <button type="button" key={t} onClick={() => setVType(t)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${vType === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-foreground'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Số lượng</label>
                  <input type="number" min={1} max={1000} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Ngày hết hạn</label>
                  <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <button type="submit" disabled={saving || !name} className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-50">
                {saving ? 'Đang tạo...' : `Tạo & Generate ${qty} voucher`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Campaign List */}
      <div className="grid gap-4 sm:grid-cols-2">
        {campaigns.map((c) => {
          const vendor = vendors.find((v) => v.id === c.vendor_id);
          return (
            <div key={c.id} className="rounded-xl bg-card border border-border p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{c.name}</h3>
                  <p className="text-sm text-muted-foreground">{vendor?.logo} {vendor?.name}</p>
                </div>
                <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">{c.voucher_type}</span>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>SL: <strong className="text-foreground">{c.quantity}</strong></span>
                <span>Hết hạn: <strong className="text-foreground">{c.expiry_date}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
