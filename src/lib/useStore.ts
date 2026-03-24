import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Campaign, Voucher, RedeemLog, Vendor, Branch, B2BCustomer } from './types';
import { initialCampaigns, initialVouchers, vendors as staticVendors, branches as staticBranches, b2bCustomers as staticB2BCustomers, generateVouchersForCampaign } from './mock-data';

// ── helpers ───────────────────────────────────────────────────────────────────

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'EV-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ── Report type ───────────────────────────────────────────────────────────────

export interface CampaignReport {
  campaign: Campaign;
  issued: number;
  redeemed: number;
  expired: number;
  active: number;
  redemptionRate: number;
}

// ── Store shape ───────────────────────────────────────────────────────────────

interface AppState {
  campaigns: Campaign[];
  vouchers: Voucher[];
  redeemLogs: RedeemLog[];
  vendors: Vendor[];
  branches: Branch[];
  b2bCustomers: B2BCustomer[];

  // Campaigns
  createCampaign: (campaign: Campaign) => void;

  // Vouchers
  generateVouchers: (campaign: Campaign) => Voucher[];
  generateVouchersWithRecipients: (campaign: Campaign, recipients: import('./types').VoucherRecipient[]) => Voucher[];
  redeemVoucher: (code: string, vendorId: string, branchId?: string) => Voucher | null;
  markExpired: (codes: string[]) => void;
  saveVouchers: (vouchers: Voucher[]) => void;
  updateVoucher: (voucher: Voucher) => void;
  bulkUpdateSendStatus: (codes: string[], status: import('./types').SendStatus) => void;

  // Vendors
  createVendor: (vendor: Vendor) => void;
  updateVendor: (vendor: Vendor) => void;
  deleteVendor: (id: string) => void;

  // Branches
  createBranch: (branch: Branch) => void;
  updateBranch: (branch: Branch) => void;
  deleteBranch: (id: string) => void;

  // B2B Customers
  createB2BCustomer: (customer: B2BCustomer) => void;
  updateB2BCustomer: (customer: B2BCustomer) => void;
  deleteB2BCustomer: (id: string) => void;

  // Reports
  getReport: (campaignId?: string) => CampaignReport[];

  // Reset
  resetData: () => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      campaigns:    initialCampaigns,
      vouchers:     initialVouchers,
      redeemLogs:   [],
      vendors:      staticVendors,
      branches:     staticBranches,
      b2bCustomers: staticB2BCustomers,

      createCampaign: (campaign) => set((s) => ({ campaigns: [...s.campaigns, campaign] })),

      generateVouchers: (campaign) => {
        const newVouchers = generateVouchersForCampaign(campaign);
        set((s) => ({ vouchers: [...s.vouchers, ...newVouchers] }));
        return newVouchers;
      },

      generateVouchersWithRecipients: (campaign, recipients) => {
        const newVouchers = generateVouchersForCampaign(campaign);
        // Assign recipients round-robin; mark send_status Pending
        newVouchers.forEach((v, i) => {
          if (recipients.length > 0) {
            v.recipient = recipients[i % recipients.length];
            v.send_status = 'Pending';
          }
        });
        set((s) => ({ vouchers: [...s.vouchers, ...newVouchers] }));
        return newVouchers;
      },

      redeemVoucher: (code, vendorId, branchId) => {
        const { vouchers, redeemLogs } = get();
        const idx = vouchers.findIndex((v) => v.code === code);
        if (idx === -1 || vouchers[idx].status !== 'Active') return null;
        const now = new Date().toISOString();
        const updated: Voucher = {
          ...vouchers[idx],
          status: 'Redeemed',
          redeemed_at: now,
          redeemed_by: vendorId,
          ...(branchId ? { branch_id: branchId } : {}),
        };
        const newVouchers = [...vouchers];
        newVouchers[idx] = updated;
        const newLog: RedeemLog = {
          voucher_code: code,
          vendor_id: vendorId,
          redeemed_at: now,
          ...(branchId ? { branch: branchId } : {}),
        };
        set({ vouchers: newVouchers, redeemLogs: [...redeemLogs, newLog] });
        return updated;
      },

      markExpired: (codes) => {
        const codeSet = new Set(codes);
        set((s) => ({
          vouchers: s.vouchers.map((v) =>
            codeSet.has(v.code) && v.status === 'Active' ? { ...v, status: 'Expired' as const } : v,
          ),
        }));
      },

      saveVouchers: (vouchers) => set({ vouchers }),

      updateVoucher: (voucher) => set((s) => ({
        vouchers: s.vouchers.map((v) => v.code === voucher.code ? voucher : v),
      })),

      bulkUpdateSendStatus: (codes, status) => {
        const codeSet = new Set(codes);
        const now = new Date().toISOString();
        set((s) => ({
          vouchers: s.vouchers.map((v) =>
            codeSet.has(v.code)
              ? { ...v, send_status: status, ...(status === 'Sent' ? { sent_at: now } : {}) }
              : v,
          ),
        }));
      },

      // ── Vendors ──────────────────────────────────────────────────────────
      createVendor: (vendor) => set((s) => ({ vendors: [...s.vendors, vendor] })),
      updateVendor: (vendor) => set((s) => ({ vendors: s.vendors.map((v) => v.id === vendor.id ? vendor : v) })),
      deleteVendor: (id) => set((s) => ({ vendors: s.vendors.filter((v) => v.id !== id) })),

      // ── Branches ─────────────────────────────────────────────────────────
      createBranch: (branch) => set((s) => ({ branches: [...s.branches, branch] })),
      updateBranch: (branch) => set((s) => ({ branches: s.branches.map((b) => b.id === branch.id ? branch : b) })),
      deleteBranch: (id) => set((s) => ({ branches: s.branches.filter((b) => b.id !== id) })),

      // ── B2B Customers ─────────────────────────────────────────────────────
      createB2BCustomer: (customer) => set((s) => ({ b2bCustomers: [...s.b2bCustomers, customer] })),
      updateB2BCustomer: (customer) => set((s) => ({ b2bCustomers: s.b2bCustomers.map((c) => c.id === customer.id ? customer : c) })),
      deleteB2BCustomer: (id) => set((s) => ({ b2bCustomers: s.b2bCustomers.filter((c) => c.id !== id) })),

      getReport: (campaignId) => {
        const { campaigns, vouchers } = get();
        const targets = campaignId ? campaigns.filter((c) => c.id === campaignId) : campaigns;
        return targets.map((campaign) => {
          const cv = vouchers.filter((v) => v.campaign_id === campaign.id);
          const issued = cv.length;
          const redeemed = cv.filter((v) => v.status === 'Redeemed').length;
          const expired = cv.filter((v) => v.status === 'Expired').length;
          const active = cv.filter((v) => v.status === 'Active').length;
          const redemptionRate = issued > 0 ? Math.round((redeemed / issued) * 100) : 0;
          return { campaign, issued, redeemed, expired, active, redemptionRate };
        });
      },

      resetData: () => set({
        campaigns:    initialCampaigns,
        vouchers:     initialVouchers,
        redeemLogs:   [],
        vendors:      staticVendors,
        branches:     staticBranches,
        b2bCustomers: staticB2BCustomers,
      }),
    }),
    {
      name: 'ev-store',
      partialize: (s) => ({
        campaigns:    s.campaigns,
        vouchers:     s.vouchers,
        redeemLogs:   s.redeemLogs,
        vendors:      s.vendors,
        branches:     s.branches,
        b2bCustomers: s.b2bCustomers,
      }),
    },
  ),
);

// ── Selector hooks ────────────────────────────────────────────────────────────

export const useCampaigns    = () => useStore((s) => s.campaigns);
export const useVouchers     = () => useStore((s) => s.vouchers);
export const useVendors      = () => useStore((s) => s.vendors);
export const useBranches     = () => useStore((s) => s.branches);
export const useB2BCustomers = () => useStore((s) => s.b2bCustomers);
export const useRedeemLogs   = () => useStore((s) => s.redeemLogs);

export const useActions = () => ({
  createCampaign:     useStore.getState().createCampaign,
  generateVouchers:   useStore.getState().generateVouchers,
  generateVouchersWithRecipients: useStore.getState().generateVouchersWithRecipients,
  redeemVoucher:      useStore.getState().redeemVoucher,
  markExpired:        useStore.getState().markExpired,
  saveVouchers:       useStore.getState().saveVouchers,
  createVendor:       useStore.getState().createVendor,
  updateVendor:       useStore.getState().updateVendor,
  deleteVendor:       useStore.getState().deleteVendor,
  createBranch:       useStore.getState().createBranch,
  updateBranch:       useStore.getState().updateBranch,
  deleteBranch:       useStore.getState().deleteBranch,
  createB2BCustomer:  useStore.getState().createB2BCustomer,
  updateB2BCustomer:  useStore.getState().updateB2BCustomer,
  deleteB2BCustomer:  useStore.getState().deleteB2BCustomer,
  updateVoucher:        useStore.getState().updateVoucher,
  bulkUpdateSendStatus: useStore.getState().bulkUpdateSendStatus,
  resetData:          useStore.getState().resetData,
});
