import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Campaign, Voucher, RedeemLog, Vendor, Branch } from './types';
import { initialCampaigns, initialVouchers, vendors as staticVendors, branches as staticBranches, generateVouchersForCampaign } from './mock-data';

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
  // Data
  campaigns: Campaign[];
  vouchers: Voucher[];
  redeemLogs: RedeemLog[];

  // Static (not persisted — always from mock-data)
  vendors: Vendor[];
  branches: Branch[];

  // Actions — campaigns
  createCampaign: (campaign: Campaign) => void;

  // Actions — vouchers
  generateVouchers: (campaign: Campaign) => Voucher[];
  redeemVoucher: (code: string, vendorId: string, branchId?: string) => Voucher | null;
  markExpired: (codes: string[]) => void;
  saveVouchers: (vouchers: Voucher[]) => void;

  // Actions — reports
  getReport: (campaignId?: string) => CampaignReport[];

  // Actions — reset
  resetData: () => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── initial state ──────────────────────────────────────────────────────
      campaigns:   initialCampaigns,
      vouchers:    initialVouchers,
      redeemLogs:  [],
      vendors:     staticVendors,
      branches:    staticBranches,

      // ── createCampaign ─────────────────────────────────────────────────────
      createCampaign: (campaign) => {
        set((s) => ({ campaigns: [...s.campaigns, campaign] }));
      },

      // ── generateVouchers ───────────────────────────────────────────────────
      generateVouchers: (campaign) => {
        const newVouchers = generateVouchersForCampaign(campaign);
        set((s) => ({ vouchers: [...s.vouchers, ...newVouchers] }));
        return newVouchers;
      },

      // ── redeemVoucher ──────────────────────────────────────────────────────
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

      // ── markExpired ────────────────────────────────────────────────────────
      markExpired: (codes) => {
        const codeSet = new Set(codes);
        set((s) => ({
          vouchers: s.vouchers.map((v) =>
            codeSet.has(v.code) && v.status === 'Active'
              ? { ...v, status: 'Expired' as const }
              : v,
          ),
        }));
      },

      // ── saveVouchers ───────────────────────────────────────────────────────
      saveVouchers: (vouchers) => set({ vouchers }),

      // ── getReport ──────────────────────────────────────────────────────────
      getReport: (campaignId) => {
        const { campaigns, vouchers } = get();
        const targetCampaigns = campaignId
          ? campaigns.filter((c) => c.id === campaignId)
          : campaigns;

        return targetCampaigns.map((campaign) => {
          const cv       = vouchers.filter((v) => v.campaign_id === campaign.id);
          const issued   = cv.length;
          const redeemed = cv.filter((v) => v.status === 'Redeemed').length;
          const expired  = cv.filter((v) => v.status === 'Expired').length;
          const active   = cv.filter((v) => v.status === 'Active').length;
          const redemptionRate = issued > 0 ? Math.round((redeemed / issued) * 100) : 0;
          return { campaign, issued, redeemed, expired, active, redemptionRate };
        });
      },

      // ── resetData ──────────────────────────────────────────────────────────
      resetData: () => {
        set({
          campaigns:  initialCampaigns,
          vouchers:   initialVouchers,
          redeemLogs: [],
        });
      },
    }),
    {
      name: 'ev-store',
      // Only persist mutable data, not static vendors/branches
      partialize: (s) => ({
        campaigns:  s.campaigns,
        vouchers:   s.vouchers,
        redeemLogs: s.redeemLogs,
      }),
    },
  ),
);

// ── Selector hooks (memoised slices) ─────────────────────────────────────────

export const useCampaigns  = () => useStore((s) => s.campaigns);
export const useVouchers   = () => useStore((s) => s.vouchers);
export const useVendors    = () => useStore((s) => s.vendors);
export const useBranches   = () => useStore((s) => s.branches);
export const useRedeemLogs = () => useStore((s) => s.redeemLogs);

// Actions are stable references — access via getState() to avoid re-render loops
export const useActions = () => ({
  createCampaign:   useStore.getState().createCampaign,
  generateVouchers: useStore.getState().generateVouchers,
  redeemVoucher:    useStore.getState().redeemVoucher,
  markExpired:      useStore.getState().markExpired,
  saveVouchers:     useStore.getState().saveVouchers,
  getReport:        useStore.getState().getReport,
  resetData:        useStore.getState().resetData,
});
