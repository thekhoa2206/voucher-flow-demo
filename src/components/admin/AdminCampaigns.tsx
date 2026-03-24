import { useState, useMemo, useRef } from 'react';
import { useCampaigns, useVouchers, useVendors, useB2BCustomers, useActions } from '@/lib/useStore';
import { Campaign, VoucherType, VoucherRecipient } from '@/lib/types';
import { Plus, Search, ArrowLeft, ArrowRight, Check, Ticket, Store, Settings, Eye, CheckCircle2, X, Upload, Users } from 'lucide-react';
import { toast } from 'sonner';

type CampaignStatus = 'Đang chạy' | 'Hết hạn';

const voucherTypeLabels: Record<VoucherType, string> = {
  'Cash': 'Tiền mặt',
  'Discount %': 'Giảm giá %',
  'Buy X Get Y': 'Mua X Tặng Y',
};

export default function AdminCampaigns() {
  const campaigns = useCampaigns();
  const allVouchers = useVouchers();
  const vendors = useVendors();
  const [showForm, setShowForm] = useState(false);
  const [successModal, setSuccessModal] = useState<{ name: string; qty: number } | null>(null);
  const [search, setSearch] = useState('');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'Tất cả'>('Tất cả');

  const now = new Date().toISOString().split('T')[0];
  const getCampaignStatus = (c: Campaign): CampaignStatus =>
    c.expiry_date >= now ? 'Đang chạy' : 'Hết hạn';

  const filtered = useMemo(() => {
    let list = campaigns;
    if (search.trim()) list = list.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()));
    if (vendorFilter !== 'all') list = list.filter((c) => c.vendor_id === vendorFilter);
    if (statusFilter !== 'Tất cả') list = list.filter((c) => getCampaignStatus(c) === statusFilter);
    return list;
  }, [campaigns, search, vendorFilter, statusFilter]);

  const handleCreated = (campaign: Campaign, qty: number) => {
    setShowForm(false);
    setSuccessModal({ name: campaign.name, qty });
    toast.success('Tạo chiến dịch thành công!', {
      description: `${campaign.name} · ${qty} voucher đã được phát hành`,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Campaign</h1>
          <p className="text-sm text-muted-foreground">{campaigns.length} chiến dịch · {filtered.length} hiển thị</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> Tạo chiến dịch
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm chiến dịch..."
            className="w-full rounded-lg border border-input bg-card pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="all">Tất cả Vendor</option>
          {vendors.map((v) => <option key={v.id} value={v.id}>{v.logo} {v.name}</option>)}
        </select>
        <div className="flex rounded-lg border border-border bg-card p-0.5 gap-0.5">
          {(['Tất cả', 'Đang chạy', 'Hết hạn'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${statusFilter === s ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">Không tìm thấy chiến dịch</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((c) => {
            const vendor = vendors.find((v) => v.id === c.vendor_id);
            const cv = allVouchers.filter((v) => v.campaign_id === c.id);
            const issued = cv.length;
            const redeemed = cv.filter((v) => v.status === 'Redeemed').length;
            const status = getCampaignStatus(c);
            return (
              <div key={c.id} className="rounded-xl bg-card border border-border p-5 space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{c.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">{vendor?.logo} {vendor?.name}</p>
                    {c.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${status === 'Đang chạy' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{status}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">{voucherTypeLabels[c.voucher_type]}</span>
                  {c.b2b_customer_id && <span className="rounded-full bg-info/10 text-info px-2 py-0.5 text-xs font-medium">B2B</span>}
                  {c.min_spend && <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-xs">Tối thiểu: {c.min_spend.toLocaleString()}₫</span>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                    <p className="text-lg font-bold text-foreground">{issued}</p>
                    <p className="text-[10px] text-muted-foreground">Phát hành</p>
                  </div>
                  <div className="rounded-lg bg-success/5 p-2.5 text-center">
                    <p className="text-lg font-bold text-success">{redeemed}</p>
                    <p className="text-[10px] text-muted-foreground">Đã dùng</p>
                  </div>
                  <div className="rounded-lg bg-info/5 p-2.5 text-center">
                    <p className="text-lg font-bold text-info">{issued > 0 ? ((redeemed / issued) * 100).toFixed(0) : 0}%</p>
                    <p className="text-[10px] text-muted-foreground">Tỷ lệ</p>
                  </div>
                </div>
                <div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: issued > 0 ? `${(redeemed / issued) * 100}%` : '0%' }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Hết hạn: {c.expiry_date}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <CreateCampaignWizard onClose={() => setShowForm(false)} onCreated={handleCreated} />}

      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-8 shadow-xl text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Tạo chiến dịch thành công!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Chiến dịch <strong className="text-foreground">{successModal.name}</strong> đã được tạo với <strong className="text-primary">{successModal.qty}</strong> voucher.
              </p>
            </div>
            <button onClick={() => setSuccessModal(null)} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Wizard ===== */

const STEPS = [
  { id: 1, label: 'Vendor', icon: <Store className="w-4 h-4" /> },
  { id: 2, label: 'B2B & Recipients', icon: <Users className="w-4 h-4" /> },
  { id: 3, label: 'Cấu hình', icon: <Settings className="w-4 h-4" /> },
  { id: 4, label: 'Xác nhận', icon: <Eye className="w-4 h-4" /> },
];

const VOUCHER_TYPES: VoucherType[] = ['Cash', 'Discount %', 'Buy X Get Y'];

function parseCSV(text: string): VoucherRecipient[] {
  const lines = text.trim().split('\n').filter(Boolean);
  const data = lines[0]?.toLowerCase().includes('name') ? lines.slice(1) : lines;
  return data.map((line) => {
    const [name, phone, email, employee_code, company_code] = line.split(',').map((s) => s.trim());
    return { name: name || '', phone: phone || '', email: email || undefined, employee_code: employee_code || undefined, company_code: company_code || undefined };
  }).filter((r) => r.name && r.phone);
}

function CreateCampaignWizard({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Campaign, qty: number) => void }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const vendors = useVendors();
  const b2bCustomers = useB2BCustomers();
  const { createCampaign, generateVouchers, generateVouchersWithRecipients } = useActions();
  const fileRef = useRef<HTMLInputElement>(null);

  // step 1
  const [vendorId, setVendorId] = useState(vendors[0]?.id ?? '');
  // step 2
  const [b2bCustomerId, setB2bCustomerId] = useState('');
  const [recipients, setRecipients] = useState<VoucherRecipient[]>([]);
  // step 3
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [vType, setVType] = useState<VoucherType>('Cash');
  const [qty, setQty] = useState(10);
  const [expiry, setExpiry] = useState('2025-12-31');
  const [minSpend, setMinSpend] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState(0);

  const selectedVendor = vendors.find((v) => v.id === vendorId);

  const canNext = () => {
    if (step === 1) return !!vendorId;
    if (step === 3) return !!name.trim() && qty > 0 && !!expiry;
    return true;
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      setRecipients(parsed);
      if (parsed.length > 0) {
        setQty(parsed.length);
        toast.success(`Đã import ${parsed.length} recipients`);
      } else {
        toast.error('Không đọc được dữ liệu. Kiểm tra định dạng CSV.');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    const campaign: Campaign = {
      id: `camp_${Date.now()}`,
      name,
      description: description || undefined,
      vendor_id: vendorId,
      b2b_customer_id: b2bCustomerId || undefined,
      voucher_type: vType,
      quantity: qty,
      expiry_date: expiry,
      created_at: new Date().toISOString().split('T')[0],
      min_spend: minSpend || undefined,
      max_discount: vType === 'Discount %' && maxDiscount ? maxDiscount : undefined,
    };
    createCampaign(campaign);
    const vouchers = recipients.length > 0
      ? generateVouchersWithRecipients(campaign, recipients)
      : generateVouchers(campaign);
    setSaving(false);
    onCreated(campaign, vouchers.length);
  };

  const valueLabel = () => {
    if (vType === 'Cash') return '50,000 VND';
    if (vType === 'Discount %') return `20%${maxDiscount ? ` (tối đa ${maxDiscount.toLocaleString()}₫)` : ''}`;
    return 'Mua 1 Tặng 1';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Tạo chiến dịch mới</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition"><X className="w-5 h-5" /></button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-5">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
            <div className="absolute top-5 left-0 h-0.5 bg-primary transition-all" style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }} />
            {STEPS.map((s) => (
              <div key={s.id} className="relative flex flex-col items-center gap-1.5 z-10">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${step >= s.id ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground'}`}>
                  {step > s.id ? <Check className="w-3.5 h-3.5" /> : s.icon}
                </div>
                <span className={`text-[10px] font-medium ${step >= s.id ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-5 overflow-y-auto flex-1 min-h-[260px]">

          {/* Step 1: Vendor */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Chọn đối tác vendor cho chiến dịch</p>
              {vendors.map((v) => (
                <button key={v.id} type="button" onClick={() => setVendorId(v.id)}
                  className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${vendorId === v.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-muted-foreground/30'}`}>
                  <span className="text-3xl">{v.logo}</span>
                  <div>
                    <p className="font-medium text-foreground">{v.name}</p>
                    <p className="text-xs text-muted-foreground">{v.industry ?? 'Vendor'}</p>
                  </div>
                  {vendorId === v.id && <div className="ml-auto w-6 h-6 rounded-full bg-primary flex items-center justify-center"><Check className="w-3.5 h-3.5 text-primary-foreground" /></div>}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: B2B Customer + Upload recipients */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Khách hàng B2B (tuỳ chọn)</label>
                <div className="grid gap-2">
                  <button type="button" onClick={() => setB2bCustomerId('')}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${b2bCustomerId === '' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}>
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm">—</div>
                    <p className="text-sm text-muted-foreground">Không gắn B2B</p>
                    {b2bCustomerId === '' && <Check className="ml-auto w-4 h-4 text-primary" />}
                  </button>
                  {b2bCustomers.map((c) => (
                    <button key={c.id} type="button" onClick={() => setB2bCustomerId(c.id)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${b2bCustomerId === c.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}>
                      <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center text-sm">🏢</div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{c.companyName}</p>
                        <p className="text-xs text-muted-foreground">{c.industry} · {c.taxCode}</p>
                      </div>
                      {b2bCustomerId === c.id && <Check className="ml-auto w-4 h-4 text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Upload danh sách recipients (CSV)</label>
                <p className="text-xs text-muted-foreground mb-2">Định dạng: name, phone, email, employee_code, company_code</p>
                <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition w-full justify-center">
                  <Upload className="w-4 h-4" /> Chọn file CSV
                </button>
                {recipients.length > 0 && (
                  <div className="mt-2 rounded-lg bg-success/5 border border-success/20 px-3 py-2 text-xs text-success flex items-center gap-2">
                    <Check className="w-3.5 h-3.5" /> Đã import {recipients.length} recipients
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Config */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tên chiến dịch <span className="text-destructive">*</span></label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Flash Sale Tháng 4"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Mô tả</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Mô tả ngắn..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Loại voucher</label>
                <div className="flex flex-wrap gap-2">
                  {VOUCHER_TYPES.map((t) => (
                    <button type="button" key={t} onClick={() => setVType(t)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${vType === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-foreground'}`}>
                      {voucherTypeLabels[t]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Số lượng <span className="text-destructive">*</span></label>
                  <input type="number" min={1} max={1000} value={qty} onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Ngày hết hạn <span className="text-destructive">*</span></label>
                  <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Chi tiêu tối thiểu (₫)</label>
                  <input type="number" min={0} value={minSpend} onChange={(e) => setMinSpend(Number(e.target.value))} placeholder="0"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                {vType === 'Discount %' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Giảm tối đa (₫)</label>
                    <input type="number" min={0} value={maxDiscount} onChange={(e) => setMaxDiscount(Number(e.target.value))} placeholder="0"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Kiểm tra thông tin trước khi tạo</p>
              <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-primary font-medium">
                  <Ticket className="w-3.5 h-3.5" /> Mẫu voucher
                </div>
                <div className="rounded-lg bg-card border border-border p-3 flex items-center gap-3">
                  <span className="text-2xl">{selectedVendor?.logo}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{valueLabel()}</p>
                    <p className="text-xs text-muted-foreground">{selectedVendor?.name} · {voucherTypeLabels[vType]}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-success/10 text-success px-2 py-0.5 text-[10px] font-medium">Active</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">HSD: {expiry}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border divide-y divide-border text-sm">
                <SummaryRow label="Tên chiến dịch" value={name} />
                <SummaryRow label="Vendor" value={`${selectedVendor?.logo} ${selectedVendor?.name}`} />
                {b2bCustomerId && <SummaryRow label="B2B Customer" value={b2bCustomers.find((c) => c.id === b2bCustomerId)?.companyName ?? b2bCustomerId} />}
                {recipients.length > 0 && <SummaryRow label="Recipients" value={`${recipients.length} người`} />}
                <SummaryRow label="Loại voucher" value={voucherTypeLabels[vType]} />
                <SummaryRow label="Số lượng" value={`${qty} voucher`} highlight />
                <SummaryRow label="Ngày hết hạn" value={expiry} />
                {minSpend > 0 && <SummaryRow label="Chi tiêu tối thiểu" value={`${minSpend.toLocaleString()}₫`} />}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition">
            <ArrowLeft className="w-4 h-4" /> {step === 1 ? 'Hủy' : 'Quay lại'}
          </button>
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext()}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-50">
              Tiếp theo <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-50">
              {saving ? <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Đang tạo...</> : <><Check className="w-4 h-4" /> Tạo {qty} voucher</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</span>
    </div>
  );
}
