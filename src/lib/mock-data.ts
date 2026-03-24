import { Vendor, Campaign, Voucher, Branch, B2BCustomer, SendStatus } from './types';

export const vendors: Vendor[] = [
  { id: 'v1', name: 'Highland Coffee', logo: '☕', industry: 'F&B', contactName: 'Nguyễn Văn A', contactPhone: '0901234567', contactEmail: 'highland@example.com' },
  { id: 'v2', name: 'Circle K', logo: '🏪', industry: 'Bán lẻ', contactName: 'Trần Thị B', contactPhone: '0912345678', contactEmail: 'circlek@example.com' },
  { id: 'v3', name: 'CGV Cinema', logo: '🎬', industry: 'Giải trí', contactName: 'Lê Văn C', contactPhone: '0923456789', contactEmail: 'cgv@example.com' },
];

export const b2bCustomers: B2BCustomer[] = [
  { id: 'b2b1', companyName: 'Công ty TNHH ABC Tech', taxCode: '0123456789', industry: 'Công nghệ', contactName: 'Phạm Minh Đức', contactPhone: '0934567890', contactEmail: 'duc@abctech.vn' },
  { id: 'b2b2', companyName: 'Tập đoàn XYZ Holdings', taxCode: '9876543210', industry: 'Tài chính', contactName: 'Hoàng Thị Lan', contactPhone: '0945678901', contactEmail: 'lan@xyz.vn' },
  { id: 'b2b3', companyName: 'Công ty CP Đầu tư DEF', taxCode: '1122334455', industry: 'Bất động sản', contactName: 'Vũ Quốc Hùng', contactPhone: '0956789012', contactEmail: 'hung@def.vn' },
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
  // ── b2b1: ABC Tech ──────────────────────────────────────────────────────────
  {
    id: 'camp1',
    name: 'Tết 2025 - Highland Coffee',
    description: 'Giảm 50,000₫ cho mọi hoá đơn tại Highland Coffee. Áp dụng toàn hệ thống.',
    vendor_id: 'v1',
    b2b_customer_id: 'b2b1',
    voucher_type: 'Cash',
    quantity: 12,
    expiry_date: '2026-06-30',
    created_at: '2025-01-15',
    min_spend: 100000,
  },
  {
    id: 'camp3',
    name: 'Team Building Q2 - Circle K',
    description: 'Voucher mua sắm tại Circle K dành cho nhân viên ABC Tech tham gia team building.',
    vendor_id: 'v2',
    b2b_customer_id: 'b2b1',
    voucher_type: 'Cash',
    quantity: 15,
    expiry_date: '2026-09-30',
    created_at: '2025-04-01',
  },
  // ── b2b2: XYZ Holdings ──────────────────────────────────────────────────────
  {
    id: 'camp2',
    name: 'Summer Sale - CGV',
    description: 'Giảm 20% giá vé xem phim tại CGV. Không áp dụng ngày lễ và cuối tuần.',
    vendor_id: 'v3',
    b2b_customer_id: 'b2b2',
    voucher_type: 'Discount %',
    quantity: 10,
    expiry_date: '2026-08-31',
    created_at: '2025-03-01',
    max_discount: 50000,
  },
  {
    id: 'camp4',
    name: 'Phúc lợi tháng 6 - Highland',
    description: 'Voucher cà phê Highland dành cho ban lãnh đạo XYZ Holdings.',
    vendor_id: 'v1',
    b2b_customer_id: 'b2b2',
    voucher_type: 'Buy X Get Y',
    quantity: 8,
    expiry_date: '2025-12-31',
    created_at: '2025-06-01',
  },
  // ── b2b3: DEF Investment ────────────────────────────────────────────────────
  {
    id: 'camp5',
    name: 'Khai trương VP mới - CGV',
    description: 'Tặng voucher xem phim CGV cho toàn bộ nhân viên nhân dịp khai trương văn phòng mới.',
    vendor_id: 'v3',
    b2b_customer_id: 'b2b3',
    voucher_type: 'Cash',
    quantity: 20,
    expiry_date: '2026-12-31',
    created_at: '2025-05-10',
  },
  {
    id: 'camp6',
    name: 'Sinh nhật công ty - Circle K',
    description: 'Voucher mua sắm Circle K kỷ niệm 5 năm thành lập Công ty CP Đầu tư DEF.',
    vendor_id: 'v2',
    b2b_customer_id: 'b2b3',
    voucher_type: 'Discount %',
    quantity: 10,
    expiry_date: '2025-11-30',
    created_at: '2025-05-20',
    max_discount: 30000,
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

const mockRecipients = [
  // b2b1 — ABC Tech
  { name: 'Nguyễn Văn An',    phone: '0901111111', email: 'an@abctech.vn',    employee_code: 'EMP001', company_code: 'b2b1' },
  { name: 'Trần Thị Bình',    phone: '0902222222', email: 'binh@abctech.vn',  employee_code: 'EMP002', company_code: 'b2b1' },
  { name: 'Lê Minh Cường',    phone: '0903333333', email: 'cuong@abctech.vn', employee_code: 'EMP003', company_code: 'b2b1' },
  { name: 'Đỗ Thị Hoa',       phone: '0905555555', email: 'hoa@abctech.vn',   employee_code: 'EMP004', company_code: 'b2b1' },
  // b2b2 — XYZ Holdings
  { name: 'Phạm Thị Dung',    phone: '0904444444', email: 'dung@xyz.vn',      employee_code: 'EMP001', company_code: 'b2b2' },
  { name: 'Hoàng Minh Tuấn',  phone: '0906666666', email: 'tuan@xyz.vn',      employee_code: 'EMP002', company_code: 'b2b2' },
  { name: 'Vũ Thị Mai',       phone: '0907777777', email: 'mai@xyz.vn',       employee_code: 'EMP003', company_code: 'b2b2' },
  // b2b3 — DEF Investment
  { name: 'Bùi Quốc Hùng',   phone: '0908888888', email: 'hung@def.vn',      employee_code: 'EMP001', company_code: 'b2b3' },
  { name: 'Ngô Thị Linh',     phone: '0909999999', email: 'linh@def.vn',      employee_code: 'EMP002', company_code: 'b2b3' },
  { name: 'Đinh Văn Khoa',    phone: '0910000000', email: 'khoa@def.vn',      employee_code: 'EMP003', company_code: 'b2b3' },
  { name: 'Lý Thị Thanh',     phone: '0911111111', email: 'thanh@def.vn',     employee_code: 'EMP004', company_code: 'b2b3' },
];

// Recipients grouped by b2b customer
const recipientsByB2B: Record<string, typeof mockRecipients> = {
  b2b1: mockRecipients.filter((r) => r.company_code === 'b2b1'),
  b2b2: mockRecipients.filter((r) => r.company_code === 'b2b2'),
  b2b3: mockRecipients.filter((r) => r.company_code === 'b2b3'),
};

const sendStatuses: SendStatus[] = ['Sent', 'Sent', 'Sent', 'Pending', 'Failed'];

export const initialVouchers: Voucher[] = [
  ...initialCampaigns.flatMap((c) => {
    const vouchers = generateVouchersForCampaign(c);
    const campBranches = branches.filter((b) => b.vendor_id === c.vendor_id);
    const recipients = c.b2b_customer_id ? (recipientsByB2B[c.b2b_customer_id] ?? mockRecipients) : mockRecipients;

    // First ~40%: Redeemed with recipient + branch
    const redeemedCount = Math.max(1, Math.floor(vouchers.length * 0.4));
    vouchers.slice(0, redeemedCount).forEach((v, i) => {
      v.status = 'Redeemed';
      v.redeemed_at = randomRedeemDate();
      v.redeemed_by = c.vendor_id;
      v.branch_id = campBranches[i % campBranches.length]?.id;
      v.recipient = recipients[i % recipients.length];
      v.send_status = 'Sent';
      v.sent_at = randomRedeemDate();
    });
    // 1 Expired
    vouchers.slice(redeemedCount, redeemedCount + 1).forEach((v) => {
      v.status = 'Expired';
      v.recipient = recipients[0];
      v.send_status = 'Sent';
      v.sent_at = randomRedeemDate();
    });
    // Rest: Active with mixed send status
    vouchers.slice(redeemedCount + 1).forEach((v, i) => {
      v.recipient = recipients[i % recipients.length];
      v.send_status = sendStatuses[i % sendStatuses.length];
      if (v.send_status === 'Sent') v.sent_at = randomRedeemDate();
    });
    return vouchers;
  }),
];
