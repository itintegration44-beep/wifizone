import React from 'react';
import { useWiFi } from '../../context/WiFiContext';
import {
  ExternalLink,
  Router,
  CheckCircle2,
  Clock,
  Cpu
} from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const {
    adminTab,
    routers,
    selectedRouterId,
    setSelectedRouterId,
    selectedRouter,
    setViewMode,
    config
  } = useWiFi();

  const getTabLabel = () => {
    switch (adminTab) {
      case 'dashboard': return 'Tableau de Bord';
      case 'plans': return 'Forfaits & Profils MikroTik';
      case 'vouchers': return 'Tickets & Vouchers';
      case 'clients': return 'Clients & Sessions Actives';
      case 'transactions': return 'Transactions Mobile Money';
      case 'binding': return 'Liaison Routeur & Portail Captif';
      case 'mikrotik': return 'Générateur Scripts RouterOS';
      case 'gateways': return 'Passerelles & Paramètres';
      default: return 'Administration';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md">
      {/* Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-xs md:text-sm">
        <span className="font-semibold text-slate-400">{config.general.hotspotName}</span>
        <span className="text-slate-600">/</span>
        <span className="font-bold text-white">{getTabLabel()}</span>
      </div>

      {/* Right Zone: Router Selection & Switch View Button */}
      <div className="flex items-center gap-3">
        {/* Router Selector */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
          <Router className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <select
            value={selectedRouterId}
            onChange={(e) => setSelectedRouterId(e.target.value)}
            className="bg-transparent text-white font-medium outline-none cursor-pointer text-xs"
          >
            {routers.map(r => (
              <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                {r.name} ({r.model})
              </option>
            ))}
          </select>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </div>

        {/* Router Quick Stats */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 border-l border-slate-800 pl-3">
          <span className="flex items-center gap-1 font-mono">
            <Cpu className="w-3 h-3 text-cyan-400" />
            CPU {selectedRouter.cpuLoadPercent}%
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-amber-400" />
            {selectedRouter.uptime}
          </span>
        </div>

        {/* View Client Portal Button */}
        <button
          onClick={() => setViewMode('portal')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Tester Portail Client</span>
        </button>
      </div>
    </header>
  );
};
