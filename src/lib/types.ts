export type VoucherStatus = 'Active' | 'Redeemed' | 'Expired';
export type VoucherType = 'Cash' | 'Discount %' | 'Buy X Get Y';
export type UserRole = 'admin' | 'vendor' | 'b2b' | 'end-user';
export type SendStatus = 'Pending' | 'Sent' | 'Failed';

export interface Vendor {
  id: string;
  name: string;
  logo: string;
  industry?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface B2BCustomer {
  id: string;
  companyName: string;
  taxCode: string;
  industry: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  vendor_id: string;
  b2b_customer_id?: string;   // optional — campaign riêng cho B2B
  voucher_type: VoucherType;
  quantity: number;
  expiry_date: string;
  created_at: string;
  min_spend?: number;
  max_discount?: number;
}

export interface VoucherRecipient {
  name: string;
  phone: string;
  email?: string;
  employee_code?: string;
  company_code?: string;
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
  branch_id?: string;
  recipient?: VoucherRecipient;
  send_status?: SendStatus;
  sent_at?: string;
}

export interface RedeemLog {
  voucher_code: string;
  vendor_id: string;
  redeemed_at: string;
  branch?: string;
}

export interface Branch {
  id: string;
  name: string;
  vendor_id: string;
}
