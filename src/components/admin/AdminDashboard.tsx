import React from 'react';
import { useWiFi } from '../../context/WiFiContext';
import {
  TrendingUp,
  CreditCard,
  Users,
  Wifi,
  Smartphone,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Router,
  RefreshCw,
  HardDrive
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    transactions,
    clients,
    plans,
    vouchers,
    selectedRouter,
    setAdminTab,
    config
  } = useWiFi();

  // Financial metrics
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const totalRevenue = completedTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Today's revenue (simulate filtering by today's date "2026-10-16")
  const todayTransactions = completedTransactions.filter(t => t.createdAt.startsWith('2026-10-16'));
  const todayRevenue = todayTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Breakdown by Operator
  const omTransactions = completedTransactions.filter(t => t.operator === 'orange_money');
  const omRevenue = omTransactions.reduce((acc, t) => acc + t.amount, 0);

  const momoTransactions = completedTransactions.filter(t => t.operator === 'mtn_momo');
  const momoRevenue = momoTransactions.reduce((acc, t) => acc + t.amount, 0);

  const cashTransactions = completedTransactions.filter(t => t.operator === 'cash');
  const cashRevenue = cashTransactions.reduce((acc, t) => acc + t.amount, 0);

  const activeClients = clients.filter(c => c.status === 'active');
  const totalDownloadBandwidth = activeClients.reduce((acc, c) => acc + c.currentRateDownKbps, 0);
  const totalUploadBandwidth = activeClients.reduce((acc, c) => acc + c.currentRateUpKbps, 0);

  // 7-day revenue trend data
  const daysTrend = [
    { day: 'Sam', date: '10/10', revenue: 21500, txnCount: 28 },
    { day: 'Dim', date: '11/10', revenue: 34000, txnCount: 42 },
    { day: 'Lun', date: '12/10', revenue: 18500, txnCount: 24 },
    { day: 'Mar', date: '13/10', revenue: 22000, txnCount: 30 },
    { day: 'Mer', date: '14/10', revenue: 27500, txnCount: 35 },
    { day: 'Jeu', date: '15/10', revenue: 31000, txnCount: 39 },
    { day: 'Ven', date: '16/10', revenue: todayRevenue || 28500, txnCount: todayTransactions.length || 36 }
  ];

  const maxRevenue = Math.max(...daysTrend.map(d => d.revenue));

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Vue d'Ensemble des Revenus & Hotspot
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Suivi des ventes Mobile Money en temps réel et performances du routeur {selectedRouter.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Dernière mise à jour :</span>
          <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-md">
            Direct (Temps Réel)
          </span>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Chiffre d'Affaires Global</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white font-mono tabular-nums">
              {totalRevenue.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs font-bold text-amber-400">FCFA</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {completedTransactions.length} forfaits vendus au total
          </p>
        </div>

        {/* Today's Sales */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ventes du Jour</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-400 font-mono tabular-nums">
              {todayRevenue.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs font-bold text-slate-400">FCFA</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {todayTransactions.length} transactions réussies aujourd'hui
          </p>
        </div>

        {/* Active Hotspot Clients */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Clients Connectés MikroTik</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-400 font-mono tabular-nums">
              {activeClients.length}
            </span>
            <span className="text-xs text-slate-400">en ligne</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Sur le serveur <span className="font-mono text-slate-300">{selectedRouter.hotspotServer}</span>
          </p>
        </div>

        {/* Live Bandwidth Traffic */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Bande Passante Actuelle</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white font-mono tabular-nums">
              {(totalDownloadBandwidth / 1024).toFixed(1)}
            </span>
            <span className="text-xs font-bold text-purple-400">Mbps DL</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Upload: {(totalUploadBandwidth / 1024).toFixed(1)} Mbps
          </p>
        </div>
      </div>

      {/* Operator Revenue Split Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Orange Money Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-orange-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-xs">
                OM
              </div>
              <span className="font-bold text-sm text-white">Orange Money</span>
            </div>
            <span className="text-xs font-mono text-orange-400 font-semibold">
              {omTransactions.length} ventes
            </span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono tabular-nums mb-1">
            {omRevenue.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-400">FCFA</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-orange-500 h-full rounded-full"
              style={{ width: `${totalRevenue > 0 ? (omRevenue / totalRevenue) * 100 : 0}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1.5">
            {totalRevenue > 0 ? Math.round((omRevenue / totalRevenue) * 100) : 0}% du chiffre d'affaires
          </span>
        </div>

        {/* MTN MoMo Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-yellow-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-yellow-400 flex items-center justify-center text-slate-950 font-black text-xs">
                M
              </div>
              <span className="font-bold text-sm text-white">MTN Mobile Money</span>
            </div>
            <span className="text-xs font-mono text-yellow-400 font-semibold">
              {momoTransactions.length} ventes
            </span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono tabular-nums mb-1">
            {momoRevenue.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-400">FCFA</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-yellow-400 h-full rounded-full"
              style={{ width: `${totalRevenue > 0 ? (momoRevenue / totalRevenue) * 100 : 0}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1.5">
            {totalRevenue > 0 ? Math.round((momoRevenue / totalRevenue) * 100) : 0}% du chiffre d'affaires
          </span>
        </div>

        {/* Cash / Guichet Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-black text-xs">
                $
              </div>
              <span className="font-bold text-sm text-white">Espèces / Revendeurs</span>
            </div>
            <span className="text-xs font-mono text-slate-400 font-semibold">
              {cashTransactions.length} ventes
            </span>
          </div>
          <div className="text-xl font-extrabold text-white font-mono tabular-nums mb-1">
            {cashRevenue.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-400">FCFA</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-slate-400 h-full rounded-full"
              style={{ width: `${totalRevenue > 0 ? (cashRevenue / totalRevenue) * 100 : 0}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1.5">
            {totalRevenue > 0 ? Math.round((cashRevenue / totalRevenue) * 100) : 0}% du chiffre d'affaires
          </span>
        </div>
      </div>

      {/* 2-Column Split: Revenue Trend Chart & Popular Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): 7-Day Revenue Trend Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Évolution des Ventes (7 Derniers Jours)</h2>
              <p className="text-xs text-slate-400">Revenus quotidiens générés par Orange Money et MTN MoMo</p>
            </div>
            <span className="text-xs font-mono text-amber-400 font-semibold">En FCFA</span>
          </div>

          {/* Bar Chart Visual */}
          <div className="pt-6 pb-2">
            <div className="grid grid-cols-7 gap-3 items-end h-44">
              {daysTrend.map((d, index) => {
                const heightPercent = Math.max(15, Math.round((d.revenue / maxRevenue) * 100));
                const isToday = index === daysTrend.length - 1;
                return (
                  <div key={d.date} className="flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                      {d.revenue.toLocaleString('fr-FR')}
                    </span>
                    <div
                      className={`w-full rounded-t-lg transition-all group-hover:brightness-125 ${
                        isToday
                          ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-lg shadow-amber-500/20'
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                    <div className="text-center">
                      <span className={`block text-xs font-semibold ${isToday ? 'text-amber-400' : 'text-slate-300'}`}>
                        {d.day}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{d.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right (1 col): Top Forfaits Ranking */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Forfaits les Plus Achetés</h2>
            <button
              onClick={() => setAdminTab('plans')}
              className="text-xs text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Gérer</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {plans.slice(0, 5).map((plan, index) => {
              // Approximate share
              const count = index === 0 ? 32 : index === 1 ? 26 : index === 2 ? 48 : index === 3 ? 14 : 9;
              return (
                <div key={plan.id} className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white truncate">{plan.name}</span>
                    <span className="font-mono text-amber-400 font-bold tabular-nums">
                      {plan.price} FCFA
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{plan.durationLabel} · {plan.dataLimitLabel}</span>
                    <span className="font-mono">{count} ventes</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Dernières Transactions Mobile Money</h2>
            <p className="text-xs text-slate-400">Ventes automatisées reçues par Orange Money et MTN MoMo</p>
          </div>

          <button
            onClick={() => setAdminTab('transactions')}
            className="text-xs font-semibold text-amber-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Voir toutes les transactions ({transactions.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-3 px-3">Réf / ID</th>
                <th className="py-3 px-3">Opérateur</th>
                <th className="py-3 px-3">Numéro Client</th>
                <th className="py-3 px-3">Forfait</th>
                <th className="py-3 px-3 text-right">Montant</th>
                <th className="py-3 px-3">Code Ticket Généré</th>
                <th className="py-3 px-3">Statut</th>
                <th className="py-3 px-3">Date & Heure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.slice(0, 6).map((txn) => {
                return (
                  <tr key={txn.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-slate-300">
                      {txn.operatorRef || txn.id}
                    </td>
                    <td className="py-3 px-3">
                      {txn.operator === 'orange_money' ? (
                        <span className="inline-flex items-center gap-1.5 text-orange-400 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          Orange Money
                        </span>
                      ) : txn.operator === 'mtn_momo' ? (
                        <span className="inline-flex items-center gap-1.5 text-yellow-400 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                          MTN MoMo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
                          Espèces Guichet
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {txn.phoneNumber}
                    </td>
                    <td className="py-3 px-3 text-white font-medium">
                      {txn.planName}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-400 tabular-nums">
                      {txn.amount.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {txn.voucherCode}
                    </td>
                    <td className="py-3 px-3">
                      {txn.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Succès
                        </span>
                      ) : txn.status === 'processing' ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          En attente USSD
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Échec
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {txn.createdAt}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
