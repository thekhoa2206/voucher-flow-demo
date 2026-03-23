import { Vendor, Campaign, Voucher } from './types';

export const vendors: Vendor[] = [
  { id: 'v1', name: 'Highland Coffee', logo: '☕' },
  { id: 'v2', name: 'Circle K', logo: '🏪' },
  { id: 'v3', name: 'CGV Cinema', logo: '🎬' },
];

export const initialCampaigns: Campaign[] = [
  {
    id: 'camp1',
    name: 'Tết 2025 - Highland Coffee',
    vendor_id: 'v1',
    voucher_type: 'Cash',
    quantity: 10,
    expiry_date: '2025-06-30',
    created_at: '2025-01-15',
  },
  {
    id: 'camp2',
    name: 'Summer Sale - CGV',
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

export const initialVouchers: Voucher[] = [
  ...initialCampaigns.flatMap((c) => {
    const vouchers = generateVouchersForCampaign(c);
    // Mark some as redeemed for demo
    vouchers.slice(0, 3).forEach((v) => {
      v.status = 'Redeemed';
      v.redeemed_at = '2025-02-20T10:30:00Z';
    });
    vouchers.slice(3, 4).forEach((v) => {
      v.status = 'Expired';
    });
    return vouchers;
  }),
];
