import { useState, useRef, useEffect, useCallback } from 'react';
import { getVouchers, getCampaigns, redeemVoucher } from '@/lib/store';
import { vendors } from '@/lib/mock-data';
import { Voucher, VoucherStatus } from '@/lib/types';
import { ScanLine, CheckCircle2, XCircle, Loader2, Camera, X, Receipt, Calculator } from 'lucide-react';

const statusLabels: Record<VoucherStatus, string> = {
  Active: 'Còn hiệu lực',
  Redeemed: 'Đã sử dụng',
  Expired: 'Hết hạn',
};

const statusStyles: Record<VoucherStatus, string> = {
  Active: 'bg-success/10 text-success border-success/20',
  Redeemed: 'bg-info/10 text-info border-info/20',
  Expired: 'bg-destructive/10 text-destructive border-destructive/20',
};

type Step = 'input' | 'preview' | 'confirm' | 'processing' | 'done' | 'error';

export default function VendorRedeem() {
  const [code, setCode] = useState('');
  const [step, setStep] = useState<Step>('input');
  const [foundVoucher, setFoundVoucher] = useState<Voucher | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [billAmount, setBillAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentVendor = vendors[0];

  // Auto-focus input
  useEffect(() => {
    if (step === 'input') inputRef.current?.focus();
  }, [step]);

  const handleLookup = useCallback(async () => {
    const c = code.trim().toUpperCase();
    if (!c) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const vouchers = getVouchers();
    const v = vouchers.find((x) => x.code === c);
    setLoading(false);

    if (!v) {
      setErrorMsg('Không tìm thấy mã voucher này trong hệ thống');
      setStep('error');
      return;
    }
    setFoundVoucher(v);
    if (v.status === 'Active') {
      setStep('preview');
    } else {
      setErrorMsg(v.status === 'Redeemed'
        ? `Voucher này đã được sử dụng vào ${v.redeemed_at ? new Date(v.redeemed_at).toLocaleString('vi') : 'trước đó'}`
        : 'Voucher này đã hết hạn sử dụng');
      setStep('error');
    }
  }, [code]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLookup();
  };

  const handleConfirmRedeem = async () => {
    setStep('processing');
    await new Promise((r) => setTimeout(r, 1200));
    const v = redeemVoucher(code.trim().toUpperCase(), currentVendor.id);
    if (v) {
      setFoundVoucher(v);
      setStep('done');
    } else {
      setErrorMsg('Không thể xử lý. Vui lòng thử lại.');
      setStep('error');
    }
  };

  const handleFakeScan = async () => {
    setShowScanner(true);
    await new Promise((r) => setTimeout(r, 2500));
    // Pick a random active voucher
    const vouchers = getVouchers();
    const active = vouchers.filter((v) => v.status === 'Active');
    setShowScanner(false);
    if (active.length > 0) {
      const picked = active[Math.floor(Math.random() * active.length)];
      setCode(picked.code);
      setFoundVoucher(picked);
      setStep('preview');
    } else {
      setErrorMsg('Không tìm thấy voucher hợp lệ');
      setStep('error');
    }
  };

  const reset = () => {
    setCode('');
    setStep('input');
    setFoundVoucher(null);
    setErrorMsg('');
    setBillAmount('');
  };

  // Calculate discount
  const discountAmount = (() => {
    if (!foundVoucher || !billAmount) return null;
    const bill = Number(billAmount);
    if (!bill || bill <= 0) return null;
    if (foundVoucher.voucher_type === 'Cash') return Math.min(50000, bill);
    if (foundVoucher.voucher_type === 'Discount %') return Math.round(bill * 0.2);
    return null;
  })();

  return (
    <div className="max-w-md mx-auto space-y-5">
      {/* Vendor badge */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
          <span className="text-xl">{currentVendor.logo}</span>
          <span className="text-sm font-medium text-foreground">{currentVendor.name}</span>
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        </div>
      </div>

      {/* Main card */}
      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-muted/50 px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground text-center flex items-center justify-center gap-2">
            <Receipt className="w-5 h-5 text-primary" /> Đổi voucher
          </h2>
        </div>

        <div className="p-6">
          {/* Step: Input */}
          {step === 'input' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Nhập mã voucher</label>
                <input
                  ref={inputRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  placeholder="VD: EV-ABCD1234"
                  className="w-full rounded-xl border-2 border-input bg-background px-4 py-3.5 text-center text-lg font-mono font-bold text-foreground tracking-widest placeholder:text-muted-foreground/50 placeholder:tracking-normal placeholder:font-normal placeholder:text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-ring/20 transition-all"
                  autoComplete="off"
                />
                <p className="text-[11px] text-muted-foreground mt-1.5 text-center">Nhấn Enter để tra cứu nhanh</p>
              </div>
              <button
                onClick={handleLookup}
                disabled={loading || !code.trim()}
                className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
                {loading ? 'Đang tra cứu...' : 'Tra cứu voucher'}
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">hoặc</span></div>
              </div>
              <button
                onClick={handleFakeScan}
                className="w-full rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" /> Quét mã QR
              </button>
            </div>
          )}

          {/* Step: Preview */}
          {step === 'preview' && foundVoucher && (
            <div className="space-y-5 animate-fade-in">
              {/* Voucher card */}
              <div className={`rounded-xl border-2 p-4 space-y-3 ${statusStyles[foundVoucher.status]}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider">Thông tin voucher</span>
                  <span className="rounded-full bg-card/80 px-2 py-0.5 text-xs font-medium">{statusLabels[foundVoucher.status]}</span>
                </div>
                <div className="bg-card rounded-lg p-4 space-y-2.5 text-sm">
                  <InfoRow label="Mã voucher" value={foundVoucher.code} mono />
                  <InfoRow label="Chiến dịch" value={getCampaigns().find((c) => c.id === foundVoucher.campaign_id)?.name || '-'} />
                  <InfoRow label="Loại" value={foundVoucher.voucher_type === 'Cash' ? 'Tiền mặt' : foundVoucher.voucher_type === 'Discount %' ? 'Giảm giá %' : 'Mua X Tặng Y'} />
                  <InfoRow label="Giá trị" value={foundVoucher.value} highlight />
                  <InfoRow label="Vendor" value={`${vendors.find(v => v.id === foundVoucher.vendor_id)?.logo} ${vendors.find(v => v.id === foundVoucher.vendor_id)?.name}`} />
                  <InfoRow label="Hạn sử dụng" value={foundVoucher.expiry_date} />
                </div>
              </div>

              {/* Bill amount (optional) */}
              <div className="rounded-xl border border-border p-4 space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Calculator className="w-4 h-4 text-muted-foreground" /> Tính giảm giá (tuỳ chọn)
                </label>
                <input
                  type="number"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="Nhập số tiền hoá đơn..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {discountAmount !== null && (
                  <div className="rounded-lg bg-success/10 p-3 flex items-center justify-between animate-scale-in">
                    <span className="text-sm text-muted-foreground">Giảm giá</span>
                    <span className="text-lg font-bold text-success">-{discountAmount.toLocaleString()}₫</span>
                  </div>
                )}
                {discountAmount !== null && billAmount && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Còn phải trả</span>
                    <span className="font-semibold text-foreground">{(Number(billAmount) - discountAmount).toLocaleString()}₫</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <button
                onClick={() => setStep('confirm')}
                className="w-full rounded-xl bg-success py-3 text-sm font-semibold text-success-foreground hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Xác nhận đổi voucher
              </button>
              <button onClick={reset} className="w-full text-sm text-muted-foreground hover:text-foreground transition py-1">
                Huỷ bỏ
              </button>
            </div>
          )}

          {/* Step: Confirm modal */}
          {step === 'confirm' && foundVoucher && (
            <div className="space-y-5 animate-scale-in text-center">
              <div className="w-14 h-14 rounded-full bg-warning/10 flex items-center justify-center mx-auto">
                <Receipt className="w-7 h-7 text-warning" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">Xác nhận đổi voucher?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Mã <span className="font-mono font-medium text-foreground">{foundVoucher.code}</span> · Giá trị: <span className="font-semibold text-primary">{foundVoucher.value}</span>
                </p>
                {discountAmount !== null && (
                  <p className="text-xs text-muted-foreground mt-1">Giảm {discountAmount.toLocaleString()}₫ trên hoá đơn {Number(billAmount).toLocaleString()}₫</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Hành động này không thể hoàn tác</p>
              <div className="flex gap-3">
                <button onClick={() => setStep('preview')} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted transition">
                  Quay lại
                </button>
                <button onClick={handleConfirmRedeem} className="flex-1 rounded-xl bg-success py-2.5 text-sm font-semibold text-success-foreground hover:opacity-90 transition">
                  Đổi ngay
                </button>
              </div>
            </div>
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <div className="py-10 text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">Đang xử lý...</p>
                <p className="text-sm text-muted-foreground">Vui lòng đợi trong giây lát</p>
              </div>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && foundVoucher && (
            <div className="py-6 text-center space-y-5 animate-fade-in">
              {/* Success animation */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center animate-success-pulse">
                  <svg className="w-10 h-10 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" strokeDasharray="100" className="animate-checkmark-draw" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">Đổi voucher thành công! 🎉</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Mã <span className="font-mono font-medium">{foundVoucher.code}</span>
                </p>
              </div>
              {discountAmount !== null && (
                <div className="rounded-xl bg-success/10 border border-success/20 p-4 mx-4">
                  <p className="text-sm text-muted-foreground">Đã giảm</p>
                  <p className="text-2xl font-bold text-success">-{discountAmount.toLocaleString()}₫</p>
                  <p className="text-xs text-muted-foreground mt-1">Khách thanh toán: {(Number(billAmount) - discountAmount).toLocaleString()}₫</p>
                </div>
              )}
              <div className="pt-2">
                <button onClick={reset} className="rounded-xl bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition">
                  Đổi voucher tiếp
                </button>
              </div>
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="py-8 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">Không thể đổi voucher</p>
                <p className="text-sm text-muted-foreground mt-1">{errorMsg}</p>
              </div>
              {foundVoucher && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm text-left mx-4 space-y-1.5">
                  <InfoRow label="Mã" value={foundVoucher.code} mono />
                  <InfoRow label="Trạng thái" value={statusLabels[foundVoucher.status]} />
                </div>
              )}
              <button onClick={reset} className="rounded-xl border border-border px-8 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition">
                Thử lại
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      {step === 'input' && (
        <p className="text-center text-[11px] text-muted-foreground">
          💡 Dành cho thu ngân: nhập mã → nhấn <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono font-medium">Enter</kbd> để tra cứu nhanh
        </p>
      )}

      {/* Fake scanner overlay */}
      {showScanner && <FakeScannerOverlay onClose={() => setShowScanner(false)} />}
    </div>
  );
}

function InfoRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${mono ? 'font-mono text-xs tracking-wider' : ''} ${highlight ? 'text-primary text-base' : 'text-foreground'}`}>{value}</span>
    </div>
  );
}

function FakeScannerOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-foreground/90 flex flex-col items-center justify-center p-6 animate-fade-in">
      <button onClick={onClose} className="absolute top-4 right-4 rounded-full bg-card/20 p-2 text-card hover:bg-card/30 transition">
        <X className="w-5 h-5" />
      </button>
      <div className="relative w-64 h-64 rounded-2xl border-4 border-card/40 overflow-hidden">
        {/* Scanning viewfinder corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
        {/* Scanning line */}
        <div className="absolute left-2 right-2 h-0.5 bg-primary shadow-[0_0_8px_hsl(var(--primary))] animate-scanner-line" />
      </div>
      <div className="mt-6 text-center">
        <p className="text-card font-semibold">Đang quét mã QR...</p>
        <p className="text-card/60 text-sm mt-1">Hướng camera vào mã QR trên voucher</p>
      </div>
      <div className="mt-4">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    </div>
  );
}
