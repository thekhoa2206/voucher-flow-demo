import { UserRole } from './types';

export interface Account {
  username: string;
  password: string;
  role: UserRole;
  displayName: string;
  avatar: string;
  description: string;
  b2b_customer_id?: string; // linked B2B customer for b2b role
}

// 4 accounts — 1 per role as defined in MVP brief
export const ACCOUNTS: Account[] = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    displayName: 'Admin',
    avatar: '🛡️',
    description: 'Quản lý toàn bộ hệ thống, chiến dịch và voucher',
  },
  {
    username: 'vendor',
    password: 'vendor123',
    role: 'vendor',
    displayName: 'Thu ngân',
    avatar: '🏪',
    description: 'Redeem voucher tại quầy, xem lịch sử giao dịch',
  },
  {
    username: 'partner',
    password: 'partner123',
    role: 'b2b',
    displayName: 'ABC Tech',
    avatar: '🏢',
    description: 'Công ty TNHH ABC Tech — xem chiến dịch & voucher của mình',
    b2b_customer_id: 'b2b1',
  },
  {
    username: 'partner2',
    password: 'partner123',
    role: 'b2b',
    displayName: 'XYZ Holdings',
    avatar: '🏦',
    description: 'Tập đoàn XYZ Holdings — xem chiến dịch & voucher của mình',
    b2b_customer_id: 'b2b2',
  },
  {
    username: 'user',
    password: 'user123',
    role: 'end-user',
    displayName: 'Người dùng',
    avatar: '👤',
    description: 'Xem ví voucher, hiển thị QR để thu ngân quét',
  },
];

export function authenticate(username: string, password: string): Account | null {
  return ACCOUNTS.find(
    (a) => a.username === username.trim().toLowerCase() && a.password === password,
  ) ?? null;
}
