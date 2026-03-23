import { Campaign, Voucher, RedeemLog, UserRole } from './types';
import { initialCampaigns, initialVouchers } from './mock-data';

const CAMPAIGNS_KEY = 'ev_campaigns';
const VOUCHERS_KEY = 'ev_vouchers';
const LOGS_KEY = 'ev_redeem_logs';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getCampaigns(): Campaign[] {
  return load(CAMPAIGNS_KEY, initialCampaigns);
}

export function saveCampaign(c: Campaign) {
  const list = getCampaigns();
  list.push(c);
  save(CAMPAIGNS_KEY, list);
}

export function getVouchers(): Voucher[] {
  return load(VOUCHERS_KEY, initialVouchers);
}

export function saveVouchers(vouchers: Voucher[]) {
  save(VOUCHERS_KEY, vouchers);
}

export function addVouchers(newVouchers: Voucher[]) {
  const list = getVouchers();
  list.push(...newVouchers);
  save(VOUCHERS_KEY, list);
}

export function redeemVoucher(code: string, vendorId: string, branchId?: string): Voucher | null {
  const list = getVouchers();
  const v = list.find((x) => x.code === code);
  if (!v || v.status !== 'Active') return null;
  v.status = 'Redeemed';
  v.redeemed_at = new Date().toISOString();
  v.redeemed_by = vendorId;
  if (branchId) v.branch_id = branchId;
  save(VOUCHERS_KEY, list);

  const logs = getRedeemLogs();
  logs.push({ voucher_code: code, vendor_id: vendorId, redeemed_at: v.redeemed_at, branch: branchId });
  save(LOGS_KEY, logs);

  return v;
}

export function getRedeemLogs(): RedeemLog[] {
  return load(LOGS_KEY, []);
}

export function resetData() {
  localStorage.removeItem(CAMPAIGNS_KEY);
  localStorage.removeItem(VOUCHERS_KEY);
  localStorage.removeItem(LOGS_KEY);
}
