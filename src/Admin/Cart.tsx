import React from 'react';
import Shell from './Shell';
import { 
  Megaphone, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Mail,
  BarChart2
} from 'lucide-react';
import { motion } from 'motion/react';

const CARTS = [
  { id: 1, user: 'Elena Moretti', sub: 'elena.m@example.com', items: '"The Secret History" - Donna Tartt', extraItems: 2, value: '$84.50', status: 'ACTIVE', lastActive: '2 mins ago', initials: 'EM', avatarBg: 'bg-primary/10 text-primary' },
  { id: 2, user: 'Guest User #8821', sub: 'IP: 192.168.1.45', items: '"Klara and the Sun" - Ishiguro', extraItems: 0, value: '$28.00', status: 'ABANDONED', lastActive: '4 hours ago', initials: 'G', avatarBg: 'bg-surface-variant text-on-surface-variant' },
  { id: 3, user: 'Julian West', sub: 'j.west@design.co', items: '"Collected Poems" - Plath', extraItems: 'Special Edition Hardcover', value: '$120.00', status: 'ACTIVE', lastActive: 'Just now', initials: 'JW', avatarBg: 'bg-primary/10 text-primary' },
  { id: 4, user: 'Guest User #8819', sub: 'IP: 72.10.44.112', items: '"Dune" - Frank Herbert', extraItems: 'Mass Market Paperback', value: '$12.99', status: 'ABANDONED', lastActive: '12 hours ago', initials: 'G', avatarBg: 'bg-surface-variant text-on-surface-variant' },
  { id: 5, user: 'Sarah Ahmed', sub: 'sarah.a@gmail.com', items: '"The Overstory" - Richard Powers', extraItems: 1, value: '$56.20', status: 'ACTIVE', lastActive: '15 mins ago', initials: 'SA', avatarBg: 'bg-primary/10 text-primary' },
];

export default function CartInsightsScreen() {
  return (
    <Shell variant="topbar">
      <div className="space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-secondary">ANALYTICS DASHBOARD</span>
            <h1 className="font-serif text-6xl font-semibold text-primary mt-2">Cart Insights</h1>
            <p className="text-on-surface-variant mt-4 text-xl max-w-2xl leading-relaxed">
              Monitoring real-time shopping intent and abandoned cycles to optimize conversion performance.
            </p>
          </div>
          <button className="bg-primary text-white px-8 py-4 flex items-center gap-2 rounded-lg font-bold text-sm shadow-xl hover:opacity-90 transition-all">
            <Megaphone size={20} />
            Trigger Recovery Campaign
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InsightsStat title="ACTIVE CARTS" value="142" trend="+12% vs exp" trendColor="text-secondary" active />
          <InsightsStat title="ABANDONED (24H)" value="84" trend="+5% rate" trendColor="text-error" />
          <InsightsStat title="POTENTIAL REVENUE" value="$12,480" />
          <InsightsStat title="CONVERSION RATE" value="3.2%" trend="Avg. 2.8%" trendColor="text-secondary" />
        </div>

        {/* Console */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-primary/5 overflow-hidden border border-outline-variant">
          {/* Tab Bar */}
          <div className="px-8 py-6 bg-surface border-b border-outline-variant flex flex-wrap items-center justify-between gap-6">
            <div className="flex gap-10">
              <button className="text-[10px] font-extrabold uppercase tracking-widest border-b-2 border-primary pb-2">ALL ACTIVITY</button>
              <button className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors pb-2">ABANDONED</button>
              <button className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors pb-2">ACTIVE NOW</button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-on-surface-variant">Sort by:</span>
              <div className="flex items-center gap-1 font-bold text-sm text-primary cursor-pointer group">
                Last Active <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container/30 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  <th className="px-8 py-4">User Identity</th>
                  <th className="px-8 py-4">Items in Cart</th>
                  <th className="px-8 py-4">Total Value</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {CARTS.map((cart, idx) => (
                  <motion.tr 
                    key={cart.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-surface-container/10 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${cart.avatarBg}`}>
                          {cart.initials}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-primary leading-tight">{cart.user}</p>
                          <p className="text-[11px] text-on-surface-variant">{cart.sub}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-primary">{cart.items}</p>
                        {cart.extraItems && (
                          <p className="text-[11px] text-on-surface-variant">
                            {typeof cart.extraItems === 'number' ? `+ ${cart.extraItems} other titles` : cart.extraItems}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-sm text-primary">{cart.value}</td>
                    <td className="px-8 py-6">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter shadow-sm
                        ${cart.status === 'ACTIVE' ? 'bg-secondary-container text-primary' : 'bg-error-container text-on-error-container'}
                      `}>
                        {cart.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right text-xs font-bold text-on-surface-variant">
                      {cart.lastActive}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-6 border-t border-outline-variant flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant">Showing 1-10 of 142 carts</span>
            <div className="flex gap-2">
              <PaginationBtn icon={<ChevronLeft size={16} />} />
              <PaginationBtn label="1" active />
              <PaginationBtn label="2" />
              <PaginationBtn icon={<ChevronRight size={16} />} />
            </div>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <InsightBox 
            bg="bg-secondary-container/40" 
            icon={<TrendingUp size={24} />} 
            title="Purchase Intent Hotspot"
            text="&quot;The Secret History&quot; is currently in 42 active carts. Suggest adding a &quot;Low Stock&quot; trigger to encourage final checkout for these users."
            link="View detailed item analytics"
          />
          <InsightBox 
            bg="bg-surface-container" 
            icon={<Mail size={24} />} 
            title="Recovery Opportunity"
            text="There are 12 carts over $100 abandoned in the last 6 hours. Consider a personalized 10% discount email for high-value recovery."
            link="Create high-value segment"
          />
        </div>
      </div>
    </Shell>
  );
}

function InsightsStat({ title, value, trend, trendColor, active }: { title: string, value: string, trend?: string, trendColor?: string, active?: boolean }) {
  return (
    <div className={`
      bg-white p-8 border-b-2 shadow-xl shadow-primary/5 transition-all
      ${active ? 'border-primary' : 'border-outline-variant'}
    `}>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-on-surface-variant mb-2">{title}</p>
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-4xl font-semibold text-primary">{value}</span>
        {trend && <span className={`text-[11px] font-bold ${trendColor}`}>{trend}</span>}
      </div>
    </div>
  );
}

function PaginationBtn({ icon, label, active }: { icon?: React.ReactNode, label?: string, active?: boolean }) {
  return (
    <button className={`
      w-8 h-8 rounded-lg flex items-center justify-center transition-all text-xs font-bold
      ${active ? 'bg-primary text-white shadow-lg' : 'border border-outline-variant text-primary hover:bg-primary hover:text-white'}
    `}>
      {icon || label}
    </button>
  );
}

function InsightBox({ bg, icon, title, text, link }: { bg: string, icon: React.ReactNode, title: string, text: string, link: string }) {
  return (
    <div className={`p-10 rounded-2xl ${bg} flex flex-col gap-6`}>
      <div className="flex items-center gap-4 text-primary">
        {icon}
        <h3 className="font-serif text-2xl font-semibold">{title}</h3>
      </div>
      <p className="text-on-surface-variant font-medium leading-relaxed">{text}</p>
      <button className="text-primary font-bold text-sm underline decoration-2 underline-offset-4 hover:no-underline transition-all text-left">
        {link}
      </button>
    </div>
  );
}