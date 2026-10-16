import React, { useState } from 'react';
import { useWiFi } from '../../context/WiFiContext';
import { Voucher } from '../../types';
import {
  Ticket,
  Plus,
  Printer,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Trash2,
  QrCode,
  Wifi
} from 'lucide-react';

export const AdminVouchers: React.FC = () => {
  const {
    vouchers,
    plans,
    generateBatchVouchers,
    deleteVoucher,
    config,
    selectedRouter
  } = useWiFi();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'active' | 'expired'>('all');
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Batch generator state
  const [batchPlanId, setBatchPlanId] = useState<string>(plans[0]?.id || '');
  const [batchQuantity, setBatchQuantity] = useState<number>(20);
  const [batchPrefix, setBatchPrefix] = useState<string>('WIFI');
  const [batchPinLength, setBatchPinLength] = useState<number>(4);

  const handleGenerateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    generateBatchVouchers({
      planId: batchPlanId,
      quantity: Number(batchQuantity),
      prefix: batchPrefix.trim().toUpperCase(),
      pinLength: Number(batchPinLength)
    });
    setShowBatchModal(false);
  };

  const filteredVouchers = vouchers.filter(v => {
    const matchesSearch =
      v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.usedByPhone && v.usedByPhone.includes(searchTerm));

    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const exportCsv = () => {
    const headers = ['Code', 'PIN', 'Forfait', 'Prix_FCFA', 'Duree', 'Debit', 'Statut', 'Date_Creation', 'Telephone_Client'];
    const rows = filteredVouchers.map(v => [
      v.code,
      v.pin,
      `"${v.planName}"`,
      v.price,
      `"${v.durationLabel}"`,
      v.speedLimit,
      v.status,
      v.createdAt,
      v.usedByPhone || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tickets_wifizone_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Non-print controls header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Gestion des Tickets & Vouchers
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Génération en masse, suivi des stocks de tickets et impression de cartes de recharge prêtes à la vente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPrintPreview(!isPrintPreview)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              isPrintPreview
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isPrintPreview ? 'Mode Tableau' : 'Aperçu Impression'}</span>
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter CSV</span>
          </button>

          <button
            onClick={() => setShowBatchModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Générer un Lot de Tickets</span>
          </button>
        </div>
      </div>

      {/* PRINT VIEW: Thermal or Card Cut Grid */}
      {isPrintPreview ? (
        <div className="space-y-4">
          <div className="no-print flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-300">
              Affichage de {filteredVouchers.length} tickets prêts pour découpe et vente directe.
            </span>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Lancer l'Impression Papier (A4 / Ticket)</span>
            </button>
          </div>

          <div className="ticket-print-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredVouchers.map((v) => (
              <div
                key={v.id}
                className="ticket-card p-4 rounded-xl border border-slate-700 bg-slate-900 text-white flex flex-col justify-between relative shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-dashed border-slate-700 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-extrabold text-[11px] tracking-tight">{config.general.hotspotName}</span>
                    </div>
                    <span className="text-xs font-black text-amber-400 font-mono tabular-nums">
                      {v.price} F
                    </span>
                  </div>

                  <div className="text-center my-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block">IDENTIFIANT / LOGIN</span>
                    <div className="font-mono font-black text-base tracking-widest text-white my-0.5">
                      {v.code}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      PIN : <strong className="font-mono text-amber-400">{v.pin}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-dashed border-slate-700 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Durée : <strong className="text-slate-200">{v.durationLabel}</strong></span>
                    <span>Débit : <strong className="font-mono text-cyan-400">{v.speedLimit}</strong></span>
                  </div>
                </div>

                <div className="text-[9px] text-slate-500 text-center mt-2 pt-1 border-t border-slate-800">
                  Connectez-vous sur : <strong className="text-slate-400">{selectedRouter.dnsName}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher code, forfait ou téléphone..."
                className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full font-mono"
              />
            </div>

            {/* Status Segmented Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tous ({vouchers.length})
              </button>
              <button
                onClick={() => setStatusFilter('available')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === 'available'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                En Stock ({vouchers.filter(v => v.status === 'available').length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Actifs ({vouchers.filter(v => v.status === 'active').length})
              </button>
              <button
                onClick={() => setStatusFilter('expired')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === 'expired'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Expirés ({vouchers.filter(v => v.status === 'expired').length})
              </button>
            </div>
          </div>

          {/* Vouchers Table */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-3 px-3">Code Ticket</th>
                  <th className="py-3 px-3">PIN</th>
                  <th className="py-3 px-3">Forfait Internet</th>
                  <th className="py-3 px-3 text-right">Prix</th>
                  <th className="py-3 px-3">Durée & Vitesse</th>
                  <th className="py-3 px-3">Émission</th>
                  <th className="py-3 px-3">Statut</th>
                  <th className="py-3 px-3">Client / Téléphone</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredVouchers.map((vch) => (
                  <tr key={vch.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm tracking-wider">
                          {vch.code}
                        </span>
                        <button
                          onClick={() => copyCode(vch.code)}
                          className="text-slate-500 hover:text-amber-400 p-1"
                          title="Copier"
                        >
                          {copiedCode === vch.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-amber-400 font-semibold">
                      {vch.pin}
                    </td>
                    <td className="py-3 px-3 text-white font-medium">
                      {vch.planName}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-200 tabular-nums">
                      {vch.price} FCFA
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {vch.durationLabel} · <span className="font-mono text-cyan-400">{vch.speedLimit}</span>
                    </td>
                    <td className="py-3 px-3">
                      {vch.issuedType === 'online_payment' ? (
                        <span className="text-orange-400 font-semibold text-[11px]">Mobile Money</span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Lot Imprimé</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {vch.status === 'available' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          En Stock
                        </span>
                      ) : vch.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-cyan-400 font-medium">
                          <Clock className="w-3 h-3" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                          Expiré
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {vch.usedByPhone || '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer le ticket ${vch.code} ?`)) {
                            deleteVoucher(vch.id);
                          }
                        }}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="Supprimer le ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: BATCH VOUCHER GENERATOR */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Générateur de Lots de Tickets</h3>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Fermer
              </button>
            </div>

            <form onSubmit={handleGenerateBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sélectionnez le Forfait :
                </label>
                <select
                  value={batchPlanId}
                  onChange={(e) => setBatchPlanId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900">
                      {p.name} ({p.price} FCFA - {p.durationLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Quantité de tickets :
                  </label>
                  <select
                    value={batchQuantity}
                    onChange={(e) => setBatchQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 font-mono"
                  >
                    <option value={10}>10 tickets</option>
                    <option value={20}>20 tickets</option>
                    <option value={50}>50 tickets</option>
                    <option value={100}>100 tickets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Préfixe Code :
                  </label>
                  <input
                    type="text"
                    value={batchPrefix}
                    onChange={(e) => setBatchPrefix(e.target.value)}
                    placeholder="Ex: WIFI"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Longueur du PIN secret :
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="pinLength"
                      checked={batchPinLength === 4}
                      onChange={() => setBatchPinLength(4)}
                    />
                    <span>4 chiffres (Standard)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="pinLength"
                      checked={batchPinLength === 6}
                      onChange={() => setBatchPinLength(6)}
                    />
                    <span>6 chiffres (Sécurisé)</span>
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                Les tickets générés seront immédiatement injectables sur MikroTik et disponibles pour l'impression papier.
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Générer le Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
