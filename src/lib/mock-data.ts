import { Vendor, Campaign, Voucher, Branch } from './types';

export const vendors: Vendor[] = [
  { id: 'v1', name: 'Highland Coffee', logo: '☕' },
  { id: 'v2', name: 'Circle K', logo: '🏪' },
  { id: 'v3', name: 'CGV Cinema', logo: '🎬' },
];

export const branches: Branch[] = [
  { id: 'b1', name: 'Chi nhánh Quận 1', vendor_id: 'v1' },
  { id: 'b2', name: 'Chi nhánh Quận 3', vendor_id: 'v1' },
  { id: 'b3', name: 'Chi nhánh Quận 7', vendor_id: 'v1' },
  { id: 'b4', name: 'Circle K Nguyễn Huệ', vendor_id: 'v2' },
  { id: 'b5', name: 'Circle K Lê Lợi', vendor_id: 'v2' },
  { id: 'b6', name: 'CGV Vincom Center', vendor_id: 'v3' },
  { id: 'b7', name: 'CGV Crescent Mall', vendor_id: 'v3' },
];

export const initialCampaigns: Campaign[] = [
  {
    id: 'camp1',
    name: 'Tết 2025 - Highland Coffee',
    description: 'Giảm 50,000₫ cho mọi hoá đơn tại Highland Coffee. Áp dụng toàn hệ thống.',
    vendor_id: 'v1',
    voucher_type: 'Cash',
    quantity: 10,
    expiry_date: '2025-06-30',
    created_at: '2025-01-15',
  },
  {
    id: 'camp2',
    name: 'Summer Sale - CGV',
    description: 'Giảm 20% giá vé xem phim tại CGV. Không áp dụng ngày lễ và cuối tuần.',
    vendor_id: 'v3',
    voucher_type: 'Discount %',
    quantity: 8,
    expiry_date: '2025-08-31',
    created_at: '2025-03-01',
  },
];

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'EV-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function valueForType(type: string): string {
  if (type === 'Cash') return '50,000 VND';
  if (type === 'Discount %') return '20%';
  return 'Mua 1 Tặng 1';
}

export function generateVouchersForCampaign(campaign: Campaign): Voucher[] {
  return Array.from({ length: campaign.quantity }, () => ({
    code: generateCode(),
    status: 'Active' as const,
    campaign_id: campaign.id,
    vendor_id: campaign.vendor_id,
    expiry_date: campaign.expiry_date,
    value: valueForType(campaign.voucher_type),
    voucher_type: campaign.voucher_type,
  }));
}

// Generate spread-out redeemed_at dates for chart demo
function randomRedeemDate(): string {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const d = new Date(now.getTime() - daysAgo * 86400000);
  d.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));
  return d.toISOString();
}

export const initialVouchers: Voucher[] = [
  ...initialCampaigns.flatMap((c) => {
    const vouchers = generateVouchersForCampaign(c);
    const campBranches = branches.filter((b) => b.vendor_id === c.vendor_id);
    // Mark some as redeemed with varied dates for charts
    vouchers.slice(0, 4).forEach((v, i) => {
      v.status = 'Redeemed';
      v.redeemed_at = randomRedeemDate();
      v.redeemed_by = c.vendor_id;
      v.branch_id = campBranches[i % campBranches.length]?.id;
    });
    vouchers.slice(4, 5).forEach((v) => {
      v.status = 'Expired';
    });
    return vouchers;
  }),
];
