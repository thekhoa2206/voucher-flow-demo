import { useState } from 'react';
import { Branch, Vendor } from '@/lib/types';
import { MapPin, ChevronRight, LogOut } from 'lucide-react';

interface Props {
  vendor: Vendor;
  branches: Branch[];
  onSelect: (branchId: string) => void;
  onLogout: () => void;
}

export default function BranchSelectScreen({ vendor, branches, onSelect, onLogout }: Props) {
  const [selected, setSelected] = useState<string>(branches[0]?.id ?? '');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500 text-white text-2xl shadow-lg shadow-blue-500/25 mb-1">
            {vendor.logo}
          </div>
          <h1 className="text-xl font-bold text-foreground">{vendor.name}</h1>
          <p className="text-sm text-muted-foreground">Chọn chi nhánh làm việc hôm nay</p>
        </div>

        {/* Branch list */}
        <div className="rounded-2xl bg-card border border-border shadow-xl shadow-black/5 overflow-hidden">
          {branches.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Chưa có chi nhánh nào được cấu hình
            </div>
          ) : (
            <div className="divide-y divide-border">
              {branches.map((b) => {
                const active = selected === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelected(b.id)}
                    className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors
                      ${active ? 'bg-blue-500/8' : 'hover:bg-muted/50'}`}
                  >
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors
                      ${active ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      <MapPin className="w-4 h-4" />
                    </span>
                    <span className={`flex-1 text-sm font-medium ${active ? 'text-blue-600' : 'text-foreground'}`}>
                      {b.name}
                    </span>
                    {active && <ChevronRight className="w-4 h-4 text-blue-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirm button */}
        <button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className="w-full rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <MapPin className="w-4 h-4" />
          Bắt đầu làm việc
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition py-1"
        >
          <LogOut className="w-3.5 h-3.5" /> Đăng xuất
        </button>
      </div>
    </div>
  );
}
