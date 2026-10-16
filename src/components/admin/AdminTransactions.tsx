import React, { useState } from 'react';
import { useWiFi } from '../../context/WiFiContext';
import { PaymentOperator } from '../../types';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Code,
  ShieldCheck,
  Check,
  Copy
} from 'lucide-react';

export const AdminTransactions: React.FC = () => {
  const { transactions, plans, simulateIncomingWebhook } = useWiFi();
  const [searchTerm, setSearchTerm] = useState('');
  const [operatorFilter, setOperatorFilter] = useState<'all' | 'orange_money' | 'mtn_momo' | 'cash'>('all');
  const [showWebhookTester, setShowWebhookTester] = useState(false);
  const [copiedTxnId, setCopiedTxnId] = useState<string | null>(null);

  // Webhook Simulator form state
  const [whOperator, setWhOperator] = useState<PaymentOperator>('orange_money');
  const [whPhone, setWhPhone] = useState('+237 6 99 88 77 66');
  const [whPlanId, setWhPlanId] = useState(plans[0]?.id || '');
  const [whStatus, setWhStatus] = useState<'completed' | 'failed'>('completed');
  const [whPayloadPreview, setWhPayloadPreview] = useState('');

  const selectedPlan = plans.find(p => p.id === whPlanId) || plans[0];

  const handleSimulateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    const opPrefix = whOperator === 'orange_money' ? 'OM-WEBHOOK' : 'MOMO-WEBHOOK';
    const fakeRef = `${opPrefix}-${Date.now().toString().slice(-6)}`;

    simulateIncomingWebhook({
      operator: whOperator,
      phoneNumber: whPhone.trim(),
      amount: selectedPlan ? selectedPlan.price : 500,
      planId: selectedPlan ? selectedPlan.id : '',
      operatorRef: fakeRef,
      status: whStatus
    });

    setShowWebhookTester(false);
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.operatorRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phoneNumber.includes(searchTerm) ||
      t.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.voucherCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesOperator = operatorFilter === 'all' || t.operator === operatorFilter;
    return matchesSearch && matchesOperator;
  });

  const copyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedTxnId(ref);
    setTimeout(() => setCopiedTxnId(null), 2000);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Transactions Financières & Mobile Money
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Journal complet des paiements encaissés par Orange Money, MTN MoMo et guichet.
          </p>
        </div>

        <button
          onClick={() => setShowWebhookTester(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-bold text-xs transition-colors shadow-sm"
        >
          <Code className="w-4 h-4" />
          <span>Simulateur Webhook IPN</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par référence, numéro ou ticket..."
            className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full font-mono"
          />
        </div>

        {/* Operator Segmented Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
          <button
            onClick={() => setOperatorFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              operatorFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tous ({transactions.length})
          </button>
          <button
            onClick={() => setOperatorFilter('orange_money')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              operatorFilter === 'orange_money'
                ? 'bg-orange-500 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Orange Money
          </button>
          <button
            onClick={() => setOperatorFilter('mtn_momo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              operatorFilter === 'mtn_momo'
                ? 'bg-yellow-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            MTN MoMo
          </button>
          <button
            onClick={() => setOperatorFilter('cash')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              operatorFilter === 'cash'
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Espèces
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold">
              <th className="py-3 px-3">Réf Opérateur</th>
              <th className="py-3 px-3">Opérateur</th>
              <th className="py-3 px-3">Téléphone Payeur</th>
              <th className="py-3 px-3">Forfait Acheté</th>
              <th className="py-3 px-3 text-right">Montant Encaissé</th>
              <th className="py-3 px-3">Ticket Wi-Fi Émis</th>
              <th className="py-3 px-3">Statut Paiement</th>
              <th className="py-3 px-3">Date & Heure</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredTransactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-slate-200 font-semibold">{txn.operatorRef}</span>
                    <button
                      onClick={() => copyRef(txn.operatorRef)}
                      className="text-slate-500 hover:text-amber-400 p-0.5"
                    >
                      {copiedTxnId === txn.operatorRef ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block">{txn.id}</span>
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
                    <span className="text-slate-400">Espèces Guichet</span>
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

                <td className="py-3 px-3 font-mono text-white font-bold tracking-wider">
                  {txn.voucherCode}
                </td>

                <td className="py-3 px-3">
                  {txn.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Encaissé
                    </span>
                  ) : txn.status === 'processing' ? (
                    <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Attente Push
                    </span>
                  ) : (
                    <div>
                      <span className="inline-flex items-center gap-1 text-red-400 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Échec
                      </span>
                      {txn.failureReason && (
                        <span className="text-[10px] text-slate-500 block max-w-xs truncate">
                          {txn.failureReason}
                        </span>
                      )}
                    </div>
                  )}
                </td>

                <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                  {txn.createdAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: WEBHOOK SIMULATOR */}
      {showWebhookTester && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">Simulateur de Webhook Mobile Money (IPN)</h3>
              </div>
              <button
                onClick={() => setShowWebhookTester(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Fermer
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Simulez la réception d'une notification instantanée de paiement (Callback HTTP POST) venant de l'API Orange Money ou MTN MoMo pour tester la génération automatique de voucher.
            </p>

            <form onSubmit={handleSimulateWebhook} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Opérateur Source :
                  </label>
                  <select
                    value={whOperator}
                    onChange={(e) => setWhOperator(e.target.value as PaymentOperator)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  >
                    <option value="orange_money">Orange Money WebPay API</option>
                    <option value="mtn_momo">MTN MoMo Collection API</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Statut de la Réponse :
                  </label>
                  <select
                    value={whStatus}
                    onChange={(e) => setWhStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  >
                    <option value="completed">200 SUCCESS (Paiement validé)</option>
                    <option value="failed">400 FAILED (Solde insuffisant ou rejet)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Numéro Client Payeur :
                </label>
                <input
                  type="text"
                  value={whPhone}
                  onChange={(e) => setWhPhone(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Forfait Convié :
                </label>
                <select
                  value={whPlanId}
                  onChange={(e) => setWhPlanId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.price} FCFA
                    </option>
                  ))}
                </select>
              </div>

              {/* JSON Payload preview */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
                <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold">
                  Payload JSON simulé :
                </span>
                <pre className="text-cyan-400 overflow-x-auto">
{JSON.stringify({
  event: "payment.notification",
  operator: whOperator,
  reference: `${whOperator === 'orange_money' ? 'OM' : 'MOMO'}-WH-${Math.floor(100000 + Math.random() * 900000)}`,
  amount: selectedPlan ? selectedPlan.price : 500,
  currency: "XAF",
  phone: whPhone,
  status: whStatus === 'completed' ? 'SUCCESS' : 'FAILED'
}, null, 2)}
                </pre>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWebhookTester(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Émettre le Webhook Test</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
