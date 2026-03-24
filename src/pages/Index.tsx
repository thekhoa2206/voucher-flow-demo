import { useState } from 'react';
import { Account } from '@/lib/auth';
import { useVendors, useBranches } from '@/lib/useStore';
import LoginScreen from '@/components/LoginScreen';
import BranchSelectScreen from '@/components/vendor/BranchSelectScreen';
import AppShell from '@/components/AppShell';

function VendorBranchGate({ account, onLogout }: { account: Account; onLogout: () => void }) {
  const vendors = useVendors();
  const branches = useBranches();
  const [branchId, setBranchId] = useState<string | null>(null);

  // Use first vendor as the "vendor account" vendor — in a real app this would come from account data
  const vendor = vendors[0];
  const vendorBranches = branches.filter((b) => b.vendor_id === vendor?.id);

  if (!branchId) {
    return (
      <BranchSelectScreen
        vendor={vendor}
        branches={vendorBranches}
        onSelect={setBranchId}
        onLogout={onLogout}
      />
    );
  }

  return <AppShell account={account} branchId={branchId} onLogout={onLogout} />;
}

const Index = () => {
  const [account, setAccount] = useState<Account | null>(null);

  const handleLogout = () => setAccount(null);

  if (!account) {
    return <LoginScreen onLogin={setAccount} />;
  }

  // Vendor role gets branch selection step before entering the app
  if (account.role === 'vendor') {
    return <VendorBranchGate account={account} onLogout={handleLogout} />;
  }

  return <AppShell account={account} onLogout={handleLogout} />;
};

export default Index;
