import { useState } from 'react';
import { useVendors, useBranches, useB2BCustomers, useActions } from '@/lib/useStore';
import { Vendor, Branch, B2BCustomer } from '@/lib/types';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Building2, Store, X, Phone, Mail, Hash, Briefcase, MapPin } from 'lucide-react';
import { toast } from 'sonner';

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2, 10); }

// ── Shared form field ─────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}{required && <span className="text-destructive ml-0.5">*</span>}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">{children}</div>
      </div>
    </div>
  );
}

// ── Delete confirm ────────────────────────────────────────────────────────────

function ConfirmDelete({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal title="Xác nhận xoá" onClose={onCancel}>
      <p className="text-sm text-muted-foreground">Bạn có chắc muốn xoá <span className="font-semibold text-foreground">{name}</span>? Hành động này không thể hoàn tác.</p>
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted transition">Huỷ</button>
        <button onClick={onConfirm} className="flex-1 rounded-lg bg-destructive py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90 transition">Xoá</button>
      </div>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VENDOR SECTION
// ══════════════════════════════════════════════════════════════════════════════

type VendorModal = { type: 'vendor'; data?: Vendor } | { type: 'branch'; vendorId: string; data?: Branch } | { type: 'deleteVendor'; vendor: Vendor } | { type: 'deleteBranch'; branch: Branch } | null;

function VendorSection() {
  const vendors = useVendors();
  const branches = useBranches();
  const { createVendor, updateVendor, deleteVendor, createBranch, updateBranch, deleteBranch } = useActions();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<VendorModal>(null);

  const toggleExpand = (id: string) => setExpanded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // ── Vendor form ──
  const VendorForm = ({ data }: { data?: Vendor }) => {
    const isEdit = !!data;
    const [form, setForm] = useState({ name: data?.name ?? '', logo: data?.logo ?? '🏪', industry: data?.industry ?? '', contactName: data?.contactName ?? '', contactPhone: data?.contactPhone ?? '', contactEmail: data?.contactEmail ?? '' });
    const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

    const save = () => {
      if (!form.name.trim()) { toast.error('Tên thương hiệu không được để trống'); return; }
      if (isEdit) {
        updateVendor({ ...data!, ...form });
        toast.success('Đã cập nhật vendor');
      } else {
        createVendor({ id: 'v' + uid(), ...form });
        toast.success('Đã thêm vendor mới');
      }
      setModal(null);
    };

    return (
      <>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tên thương hiệu" value={form.name} onChange={set('name')} placeholder="VD: Highland Coffee" required />
          <Field label="Logo (emoji)" value={form.logo} onChange={set('logo')} placeholder="☕" />
        </div>
        <Field label="Ngành hàng" value={form.industry} onChange={set('industry')} placeholder="VD: F&B, Bán lẻ..." />
        <Field label="Người liên hệ" value={form.contactName} onChange={set('contactName')} placeholder="Họ và tên" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Số điện thoại" value={form.contactPhone} onChange={set('contactPhone')} placeholder="09xxxxxxxx" />
          <Field label="Email" value={form.contactEmail} onChange={set('contactEmail')} placeholder="email@..." />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={() => setModal(null)} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted transition">Huỷ</button>
          <button onClick={save} className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition">{isEdit ? 'Lưu' : 'Thêm'}</button>
        </div>
      </>
    );
  };

  // ── Branch form ──
  const BranchForm = ({ vendorId, data }: { vendorId: string; data?: Branch }) => {
    const isEdit = !!data;
    const [name, setName] = useState(data?.name ?? '');

    const save = () => {
      if (!name.trim()) { toast.error('Tên chi nhánh không được để trống'); return; }
      if (isEdit) { updateBranch({ ...data!, name }); toast.success('Đã cập nhật chi nhánh'); }
      else { createBranch({ id: 'br' + uid(), name, vendor_id: vendorId }); toast.success('Đã thêm chi nhánh'); }
      setModal(null);
    };

    return (
      <>
        <Field label="Tên chi nhánh" value={name} onChange={setName} placeholder="VD: Chi nhánh Quận 1" required />
        <div className="flex gap-2 pt-1">
          <button onClick={() => setModal(null)} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted transition">Huỷ</button>
          <button onClick={save} className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition">{isEdit ? 'Lưu' : 'Thêm'}</button>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">Vendor ({vendors.length})</span>
        </div>
        <button onClick={() => setModal({ type: 'vendor' })} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition">
          <Plus className="w-3.5 h-3.5" /> Thêm vendor
        </button>
      </div>

      <div className="space-y-2">
        {vendors.map((v) => {
          const vBranches = branches.filter((b) => b.vendor_id === v.id);
          const open = expanded.has(v.id);
          return (
            <div key={v.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Vendor row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => toggleExpand(v.id)} className="text-muted-foreground hover:text-foreground transition shrink-0">
                  {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                <span className="text-xl shrink-0">{v.logo}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{v.name}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    {v.industry && <span className="text-xs text-muted-foreground flex items-center gap-1"><Briefcase className="w-3 h-3" />{v.industry}</span>}
                    {v.contactName && <span className="text-xs text-muted-foreground">{v.contactName}</span>}
                    {v.contactPhone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{v.contactPhone}</span>}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{vBranches.length} chi nhánh</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setModal({ type: 'vendor', data: v })} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setModal({ type: 'deleteVendor', vendor: v })} className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {/* Branches */}
              {open && (
                <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> Chi nhánh</span>
                    <button onClick={() => setModal({ type: 'branch', vendorId: v.id })} className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <Plus className="w-3 h-3" /> Thêm
                    </button>
                  </div>
                  {vBranches.length === 0 && <p className="text-xs text-muted-foreground italic">Chưa có chi nhánh</p>}
                  {vBranches.map((b) => (
                    <div key={b.id} className="flex items-center justify-between rounded-lg bg-background border border-border px-3 py-2">
                      <span className="text-sm text-foreground">{b.name}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal({ type: 'branch', vendorId: v.id, data: b })} className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition"><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => setModal({ type: 'deleteBranch', branch: b })} className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {modal?.type === 'vendor' && <Modal title={modal.data ? 'Sửa vendor' : 'Thêm vendor mới'} onClose={() => setModal(null)}><VendorForm data={modal.data} /></Modal>}
      {modal?.type === 'branch' && <Modal title={modal.data ? 'Sửa chi nhánh' : 'Thêm chi nhánh'} onClose={() => setModal(null)}><BranchForm vendorId={modal.vendorId} data={modal.data} /></Modal>}
      {modal?.type === 'deleteVendor' && <ConfirmDelete name={modal.vendor.name} onConfirm={() => { deleteVendor(modal.vendor.id); toast.success('Đã xoá vendor'); setModal(null); }} onCancel={() => setModal(null)} />}
      {modal?.type === 'deleteBranch' && <ConfirmDelete name={modal.branch.name} onConfirm={() => { deleteBranch(modal.branch.id); toast.success('Đã xoá chi nhánh'); setModal(null); }} onCancel={() => setModal(null)} />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// B2B CUSTOMER SECTION
// ══════════════════════════════════════════════════════════════════════════════

type B2BModal = { type: 'form'; data?: B2BCustomer } | { type: 'delete'; customer: B2BCustomer } | null;

function B2BSection() {
  const customers = useB2BCustomers();
  const { createB2BCustomer, updateB2BCustomer, deleteB2BCustomer } = useActions();
  const [modal, setModal] = useState<B2BModal>(null);

  const B2BForm = ({ data }: { data?: B2BCustomer }) => {
    const isEdit = !!data;
    const [form, setForm] = useState({
      companyName: data?.companyName ?? '',
      taxCode: data?.taxCode ?? '',
      industry: data?.industry ?? '',
      contactName: data?.contactName ?? '',
      contactPhone: data?.contactPhone ?? '',
      contactEmail: data?.contactEmail ?? '',
    });
    const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

    const save = () => {
      if (!form.companyName.trim()) { toast.error('Tên công ty không được để trống'); return; }
      if (!form.taxCode.trim()) { toast.error('MST không được để trống'); return; }
      if (isEdit) {
        updateB2BCustomer({ ...data!, ...form });
        toast.success('Đã cập nhật khách hàng B2B');
      } else {
        createB2BCustomer({ id: 'b2b' + uid(), ...form });
        toast.success('Đã thêm khách hàng B2B mới');
      }
      setModal(null);
    };

    return (
      <>
        <Field label="Tên công ty" value={form.companyName} onChange={set('companyName')} placeholder="Công ty TNHH..." required />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mã số thuế (MST)" value={form.taxCode} onChange={set('taxCode')} placeholder="0123456789" required />
          <Field label="Ngành nghề" value={form.industry} onChange={set('industry')} placeholder="Công nghệ..." />
        </div>
        <Field label="Người liên hệ" value={form.contactName} onChange={set('contactName')} placeholder="Họ và tên" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Số điện thoại" value={form.contactPhone} onChange={set('contactPhone')} placeholder="09xxxxxxxx" />
          <Field label="Email" value={form.contactEmail} onChange={set('contactEmail')} placeholder="email@..." />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={() => setModal(null)} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted transition">Huỷ</button>
          <button onClick={save} className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition">{isEdit ? 'Lưu' : 'Thêm'}</button>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">Khách hàng B2B ({customers.length})</span>
        </div>
        <button onClick={() => setModal({ type: 'form' })} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition">
          <Plus className="w-3.5 h-3.5" /> Thêm khách hàng
        </button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        {customers.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">Chưa có khách hàng B2B nào</div>
        )}
        {customers.map((c, i) => (
          <div key={c.id} className={`flex items-start gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-border' : ''} bg-card hover:bg-muted/30 transition`}>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">{c.companyName}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="w-3 h-3" />MST: {c.taxCode}</span>
                {c.industry && <span className="text-xs text-muted-foreground flex items-center gap-1"><Briefcase className="w-3 h-3" />{c.industry}</span>}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                {c.contactName && <span className="text-xs text-muted-foreground">{c.contactName}</span>}
                {c.contactPhone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{c.contactPhone}</span>}
                {c.contactEmail && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{c.contactEmail}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setModal({ type: 'form', data: c })} className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => setModal({ type: 'delete', customer: c })} className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      {modal?.type === 'form' && <Modal title={modal.data ? 'Sửa khách hàng B2B' : 'Thêm khách hàng B2B'} onClose={() => setModal(null)}><B2BForm data={modal.data} /></Modal>}
      {modal?.type === 'delete' && <ConfirmDelete name={modal.customer.companyName} onConfirm={() => { deleteB2BCustomer(modal.customer.id); toast.success('Đã xoá khách hàng B2B'); setModal(null); }} onCancel={() => setModal(null)} />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

type Tab = 'vendors' | 'b2b';

export default function AdminPartners() {
  const [tab, setTab] = useState<Tab>('vendors');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Quản lý đối tác</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Vendor và khách hàng B2B</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1 w-fit">
        {([['vendors', 'Vendor'], ['b2b', 'Khách hàng B2B']] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${tab === id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'vendors' && <VendorSection />}
      {tab === 'b2b' && <B2BSection />}
    </div>
  );
}
