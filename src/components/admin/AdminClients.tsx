import React, { useState } from 'react';
import { useWiFi } from '../../context/WiFiContext';
import {
  Users,
  Search,
  Wifi,
  Clock,
  LogOut,
  PlusCircle,
  ShieldAlert,
  ArrowDown,
  ArrowUp,
  Signal,
  Smartphone
} from 'lucide-react';

export const AdminClients: React.FC = () => {
  const { clients, disconnectClient, addClientTime, selectedRouter } = useWiFi();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const filteredClients = clients.filter(c =>
    c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.ipAddress.includes(searchTerm) ||
    c.macAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phoneNumber && c.phoneNumber.includes(searchTerm))
  );

  const formatBytes = (bytes: number) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' Go';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' Mo';
    return (bytes / 1024).toFixed(0) + ' Ko';
  };

  const formatRemainingTime = (seconds: number) => {
    if (seconds <= 0) return 'Expiré';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Clients & Sessions Hotspot Actives
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Monitoring en temps réel des utilisateurs connectés sur le routeur {selectedRouter.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Total connectés :</span>
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-1 rounded-md">
            {clients.filter(c => c.status === 'active').length} clients
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrer par IP, MAC, ticket ou téléphone..."
            className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full font-mono"
          />
        </div>
      </div>

      {/* Active Clients High Density Data Grid */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold">
              <th className="py-3 px-3">Client / Adresse IP</th>
              <th className="py-3 px-3">Adresse MAC</th>
              <th className="py-3 px-3">Ticket / Téléphone</th>
              <th className="py-3 px-3">Forfait</th>
              <th className="py-3 px-3">Temps Restant</th>
              <th className="py-3 px-3">Débit Direct (DL / UL)</th>
              <th className="py-3 px-3">Consommation Totale</th>
              <th className="py-3 px-3">Signal</th>
              <th className="py-3 px-3 text-right">Actions MikroTik</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredClients.map((client) => {
              const isExpired = client.remainingSeconds <= 0;
              return (
                <tr key={client.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* IP & Status */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${client.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                      <span className="font-mono font-bold text-white text-xs">{client.ipAddress}</span>
                    </div>
                  </td>

                  {/* MAC Address */}
                  <td className="py-3 px-3 font-mono text-slate-300 text-[11px]">
                    {client.macAddress}
                  </td>

                  {/* Username / Phone */}
                  <td className="py-3 px-3">
                    <div className="font-mono font-semibold text-amber-400">{client.username}</div>
                    {client.phoneNumber && (
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {client.phoneNumber}
                      </span>
                    )}
                  </td>

                  {/* Plan */}
                  <td className="py-3 px-3 text-white font-medium">
                    {client.planName}
                  </td>

                  {/* Remaining Time */}
                  <td className="py-3 px-3">
                    <span className={`font-mono tabular-nums font-semibold ${isExpired ? 'text-red-400' : 'text-slate-200'}`}>
                      {formatRemainingTime(client.remainingSeconds)}
                    </span>
                  </td>

                  {/* Speeds */}
                  <td className="py-3 px-3 font-mono text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 inline-flex items-center gap-0.5">
                        <ArrowDown className="w-3 h-3" />
                        {(client.currentRateDownKbps / 1024).toFixed(1)}M
                      </span>
                      <span className="text-cyan-400 inline-flex items-center gap-0.5">
                        <ArrowUp className="w-3 h-3" />
                        {(client.currentRateUpKbps / 1024).toFixed(1)}M
                      </span>
                    </div>
                  </td>

                  {/* Download / Upload Bytes */}
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                    <div>{formatBytes(client.bytesOut)} DL</div>
                    <span className="text-[10px] text-slate-500">{formatBytes(client.bytesIn)} UL</span>
                  </td>

                  {/* Wi-Fi Signal */}
                  <td className="py-3 px-3 font-mono text-xs">
                    <span className={client.signalDbm > -60 ? 'text-emerald-400' : client.signalDbm > -75 ? 'text-amber-400' : 'text-red-400'}>
                      {client.signalDbm} dBm
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Add 30m Bonus Button */}
                      <button
                        onClick={() => addClientTime(client.id, 30)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] font-semibold transition-colors"
                        title="Ajouter 30 minutes de bonus"
                      >
                        +30m
                      </button>

                      {/* Disconnect client from router */}
                      <button
                        onClick={() => {
                          if (confirm(`Déconnecter immédiatement le client ${client.ipAddress} (${client.username}) ?`)) {
                            disconnectClient(client.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors"
                        title="Déconnecter (Kick Session MikroTik)"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
