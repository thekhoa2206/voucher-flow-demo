import { useState } from 'react';
import { getVouchers, redeemVoucher } from '@/lib/store';
import { vendors } from '@/lib/mock-data';
import { ScanLine, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VendorRedeem() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [foundVoucher, setFoundVoucher] = useState<any>(null);
  const [step, setStep] = useState<'input' | 'preview' | 'done'>('input');

  const currentVendor = vendors[0]; // demo as Highland Coffee

  const handleLookup = async () => {
    if (!code.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const vouchers = getVouchers();
    const v = vouchers.find((x) => x.code === code.trim().toUpperCase());
    setLoading(false);
    if (v && v.status === 'Active') {
      setFoundVoucher(v);
      setStep('preview');
    } else {
      setResult('error');
      setFoundVoucher(v || null);
    }
  };

  const handleRedeem = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const v = redeemVoucher(code.trim().toUpperCase(), currentVendor.id);
    setLoading(false);
    if (v) {
      setResult('success');
      setFoundVoucher(v);
      setStep('done');
    } else {
      setResult('error');
    }
  };

  const reset = () => {
    setCode('');
    setResult(null);
    setFoundVoucher(null);
    setStep('input');
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Đang đăng nhập với tư cách</p>
        <p className="text-lg font-semibold text-foreground">{currentVendor.logo} {currentVendor.name}</p>
      </div>

      <div className="rounded-2xl bg-card border border-border p-6 space-y-5">
        <h2 className="text-lg font-semibold text-foreground text-center">Redeem Voucher</h2>

        {step === 'input' && (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Mã voucher</label>
              <input
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setResult(null); }}
                placeholder="VD: EV-ABCD1234"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={handleLookup}
              disabled={loading || !code.trim()}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
              {loading ? 'Đang tra cứu...' : 'Tra cứu'}
            </button>
            <button onClick={() => { /* fake scan */ }} className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition flex items-center justify-center gap-2">
              <ScanLine className="w-4 h-4" /> Scan QR (demo)
            </button>
            {result === 'error' && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <XCircle className="w-4 h-4" />
                {foundVoucher ? `Voucher đã ${foundVoucher.status}` : 'Không tìm thấy voucher'}
              </div>
            )}
          </>
        )}

        {step === 'preview' && foundVoucher && (
          <div className="space-y-4">
            <div className="rounded-xl bg-muted p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Mã:</span><span className="font-mono font-medium text-foreground">{foundVoucher.code}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Loại:</span><span className="text-foreground">{foundVoucher.voucher_type}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Giá trị:</span><span className="font-semibold text-primary">{foundVoucher.value}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Trạng thái:</span><span className="text-success font-medium">{foundVoucher.status}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Hết hạn:</span><span className="text-foreground">{foundVoucher.expiry_date}</span></div>
            </div>
            <button
              onClick={handleRedeem}
              disabled={loading}
              className="w-full rounded-lg bg-success py-2.5 text-sm font-medium text-success-foreground hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {loading ? 'Đang xử lý...' : 'Confirm Redeem'}
            </button>
            <button onClick={reset} className="w-full text-sm text-muted-foreground hover:text-foreground transition">Hủy</button>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Redeem thành công!</p>
              <p className="text-sm text-muted-foreground">Voucher <span className="font-mono">{foundVoucher?.code}</span></p>
            </div>
            <button onClick={reset} className="rounded-lg border border-border px-6 py-2 text-sm font-medium text-foreground hover:bg-muted transition">
              Redeem voucher khác
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
