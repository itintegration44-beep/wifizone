import React from 'react';
import { useWiFi } from '../../context/WiFiContext';
import {
  LayoutDashboard,
  Tag,
  Ticket,
  Users,
  CreditCard,
  Terminal,
  Settings,
  Wifi,
  ExternalLink,
  Link2
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const {
    adminTab,
    setAdminTab,
    setViewMode,
    config,
    clients,
    transactions,
    vouchers
  } = useWiFi();

  const activeClientsCount = clients.filter(c => c.status === 'active').length;
  const pendingTransactionsCount = transactions.filter(t => t.status === 'processing').length;
  const availableVouchersCount = vouchers.filter(v => v.status === 'available').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tableau de Bord',
      icon: LayoutDashboard,
    },
    {
      id: 'plans',
      label: 'Forfaits & Débits',
      icon: Tag,
    },
    {
      id: 'vouchers',
      label: 'Tickets & Vouchers',
      icon: Ticket,
      badge: availableVouchersCount > 0 ? `${availableVouchersCount} dispo` : undefined
    },
    {
      id: 'clients',
      label: 'Clients & Sessions',
      icon: Users,
      badge: activeClientsCount > 0 ? `${activeClientsCount} en ligne` : undefined
    },
    {
      id: 'transactions',
      label: 'Transactions & MoMo',
      icon: CreditCard,
      badge: pendingTransactionsCount > 0 ? `${pendingTransactionsCount} en cours` : undefined
    },
    {
      id: 'binding',
      label: 'Liaison Routeur & Portail',
      icon: Link2,
    },
    {
      id: 'mikrotik',
      label: 'Scripts RouterOS',
      icon: Terminal,
    },
    {
      id: 'gateways',
      label: 'Passerelles & Config',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/95 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div>
        {/* Brand Lockup */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md shadow-orange-500/20 font-black">
            <Wifi className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="truncate">
            <h1 className="font-extrabold text-sm text-white tracking-tight truncate">
              MikroTik WiFiZone
            </h1>
            <p className="text-[11px] text-slate-400">Gestion & Mobile Money</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAdminTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                      isActive
                        ? 'bg-slate-950/20 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User & Help Section */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Réseau Hotspot</span>
            <span className="text-emerald-400 font-medium">Actif</span>
          </div>
          <div className="text-xs font-mono font-bold text-white truncate">
            {config.general.defaultDns}
          </div>
        </div>

        <button
          onClick={() => setViewMode('portal')}
          className="w-full py-2.5 px-3 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          <span>Ouvrir Portail Captif</span>
        </button>
      </div>
    </aside>
  );
};
