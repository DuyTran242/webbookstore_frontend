import React from 'react';
import Shell from './Shell';
import { 
  Users, 
  Bolt, 
  UserPlus, 
  Filter, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'motion/react';

const USERS = [
  { id: '#LB-4921', name: 'Eleanor Hawthorne', initials: 'EH', email: 'e.hawthorne@literary.com', role: 'ADMIN', status: 'Active', avatarBg: 'bg-secondary-container text-on-secondary-container' },
  { id: '#LB-5012', name: 'Julian Moore', initials: 'JM', email: 'j.moore@gmail.com', role: 'CUSTOMER', status: 'Active', avatarBg: 'bg-surface-container-highest text-on-surface-variant' },
  { id: '#LB-5089', name: 'Sarah Alcott', initials: 'SA', email: 'sarah.alcott@library.org', role: 'CUSTOMER', status: 'Inactive', avatarBg: 'bg-surface-container-highest text-on-surface-variant' },
  { id: '#LB-5104', name: 'William Blake', initials: 'WB', email: 'blake@visionary.co', role: 'CUSTOMER', status: 'Active', avatarBg: 'bg-secondary-container text-on-secondary-container' },
  { id: '#LB-5122', name: 'Clara Thorne', initials: 'CT', email: 'c.thorne@archival.net', role: 'ADMIN', status: 'Active', avatarBg: 'bg-surface-container-highest text-on-surface-variant' },
];

export default function UserManagementScreen() {
  return (
    <Shell variant="sidebar" title="User Management">
      <div className="space-y-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Users" 
            value="12,842" 
            icon={<Users size={24} />} 
            trend={<div className="flex items-center gap-1 text-secondary text-sm font-semibold">
              <TrendingUp size={16} /> +12% from last month
            </div>}
          />
          <StatCard 
            title="Active Now" 
            value="843" 
            icon={<Bolt size={24} />} 
            subtitle="Currently browsing the catalog"
          />
          <StatCard 
            title="New Registrations" 
            value="156" 
            icon={<UserPlus size={24} />} 
            subtitle="In the last 24 hours"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/50 p-2 rounded-xl">
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <Select placeholder="All Roles" options={['Admin', 'Customer', 'Librarian']} />
            <Select placeholder="All Statuses" options={['Active', 'Inactive', 'Pending']} />
            <button className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg font-bold text-sm hover:bg-surface-container transition-all">
              <Filter size={18} />
              More Filters
            </button>
          </div>
          <button className="bg-primary text-white px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:opacity-90 transition-all font-bold text-sm w-full lg:w-auto justify-center">
            <UserPlus size={20} />
            Add New User
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl shadow-primary/5 overflow-hidden border border-outline-variant">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container/50 border-b border-outline-variant">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">User ID</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Name</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Email Address</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Role</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {USERS.map((user, idx) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-background transition-colors group"
                  >
                    <td className="px-8 py-5 text-sm text-on-surface-variant font-medium">{user.id}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] ${user.avatarBg}`}>
                          {user.initials}
                        </div>
                        <span className="font-bold text-sm text-primary">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-on-surface-variant">{user.email}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-outline'}`}></div>
                        <span className={`text-sm font-medium ${user.status === 'Active' ? 'text-on-surface' : 'text-on-surface-variant'}`}>{user.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="text-on-surface-variant hover:text-primary transition-colors p-1.5"><Edit2 size={16} /></button>
                        <button className="text-on-surface-variant hover:text-error transition-colors p-1.5"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-5 flex items-center justify-between border-t border-outline-variant">
            <span className="text-sm text-on-surface-variant">Showing 1 to 5 of 12,842 users</span>
            <div className="flex items-center gap-2">
              <PaginationButton icon={<ChevronLeft size={18} />} disabled />
              <PaginationButton label="1" active />
              <PaginationButton label="2" />
              <PaginationButton label="3" />
              <span className="text-xs text-on-surface-variant px-1">...</span>
              <PaginationButton label="2568" />
              <PaginationButton icon={<ChevronRight size={18} />} />
            </div>
          </div>
        </div>

        {/* Health Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-outline-variant">
          <div className="space-y-4">
            <h3 className="font-serif text-2xl text-primary">System Health</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-md">
              Lumina Books user database is synchronized with the global authentication server. 
              All modifications are logged for audit purposes.
            </p>
          </div>
          <div className="flex flex-col md:items-end justify-center gap-4">
            <p className="text-xs text-on-surface-variant">© 2024 Lumina Books Administration Console</p>
            <div className="flex gap-6">
              <a href="#" className="font-bold text-[11px] uppercase tracking-widest text-primary hover:underline">Privacy Policy</a>
              <a href="#" className="font-bold text-[11px] uppercase tracking-widest text-primary hover:underline">Security Protocols</a>
              <a href="#" className="font-bold text-[11px] uppercase tracking-widest text-primary hover:underline">Support</a>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function StatCard({ title, value, icon, trend, subtitle }: { title: string, value: string, icon: React.ReactNode, trend?: React.ReactNode, subtitle?: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-outline-variant/30 shadow-xl shadow-primary/5 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">{title}</span>
        <div className="text-primary opacity-60">{icon}</div>
      </div>
      <div className="font-serif text-4xl font-semibold text-primary">{value}</div>
      {trend}
      {subtitle && <div className="text-on-surface-variant text-sm font-medium">{subtitle}</div>}
    </div>
  );
}

function Select({ placeholder, options }: { placeholder: string, options: string[] }) {
  return (
    <div className="relative min-w-[160px]">
      <select className="w-full bg-white border border-outline-variant rounded-lg py-2 px-3 appearance-none text-sm font-semibold text-on-surface focus:ring-1 focus:ring-primary outline-none cursor-pointer">
        <option>{placeholder}</option>
        {options.map(opt => <option key={opt}>{opt}</option>)}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  );
}

function PaginationButton({ icon, label, active, disabled }: { icon?: React.ReactNode, label?: string, active?: boolean, disabled?: boolean }) {
  return (
    <button 
      disabled={disabled}
      className={`
        w-8 h-8 flex items-center justify-center rounded-lg transition-all text-xs font-bold
        ${active ? 'bg-primary text-white shadow-lg' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
      `}
    >
      {icon || label}
    </button>
  );
}