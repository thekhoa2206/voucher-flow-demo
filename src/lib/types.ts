export type VoucherStatus = 'Active' | 'Redeemed' | 'Expired';
export type VoucherType = 'Cash' | 'Discount %' | 'Buy X Get Y';
export type UserRole = 'admin' | 'vendor' | 'b2b' | 'end-user';

export interface Vendor {
  id: string;
  name: string;
  logo: string;
}

export interface Campaign {
  id: string;
  name: string;
  vendor_id: string;
  voucher_type: VoucherType;
  quantity: number;
  expiry_date: string;
  created_at: string;
}

export interface Voucher {
  code: string;
  status: VoucherStatus;
  campaign_id: string;
  vendor_id: string;
  expiry_date: string;
  value: string;
  voucher_type: VoucherType;
  redeemed_at?: string;
  redeemed_by?: string;
}

export interface RedeemLog {
  voucher_code: string;
  vendor_id: string;
  redeemed_at: string;
}
