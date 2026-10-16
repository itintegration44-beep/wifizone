import React, { useState } from 'react';
import { useWiFi } from '../../context/WiFiContext';
import { Plan } from '../../types';
import {
  Tag,
  Plus,
  Trash2,
  Check,
  Copy,
  Terminal,
  Clock,
  Wifi,
  HardDrive,
  Users,
  Shield,
  AlertCircle
} from 'lucide-react';

export const AdminPlans: React.FC = () => {
  const { plans, addPlan, deletePlan, togglePlanActive } = useWiFi();
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedProfileId, setCopiedProfileId] = useState<string | null>(null);

  // Form State for new plan
  const [name, setName] = useState('');
  const [price, setPrice] = useState('500');
  const [durationMinutes, setDurationMinutes] = useState('1440');
  const [durationLabel, setDurationLabel] = useState('24 Heures');
  const [dataLimitMb, setDataLimitMb] = useState('6000');
  const [isUnlimitedData, setIsUnlimitedData] = useState(false);
  const [speedRateLimit, setSpeedRateLimit] = useState('8M/4M');
  const [description, setDescription] = useState('Navigation fluide et streaming.');
  const [simultaneousUsers, setSimultaneousUsers] = useState(1);

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const priceNum = parseInt(price, 10) || 100;
    const durNum = parseInt(durationMinutes, 10) || 60;
    const dataNum = isUnlimitedData ? null : parseInt(dataLimitMb, 10) || null;
    const profileSlug = `prof_${name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 16)}_${priceNum}f`;

    addPlan({
      name: name.trim(),
      price: priceNum,
      durationMinutes: durNum,
      durationLabel: durationLabel.trim() || `${durNum} min`,
      dataLimitMb: dataNum,
      dataLimitLabel: isUnlimitedData ? 'Illimité' : dataNum ? `${dataNum >= 1000 ? (dataNum / 1000).toFixed(1) + ' Go' : dataNum + ' Mo'}` : 'Illimité',
      speedRateLimit: speedRateLimit.trim() || '5M/2M',
      mikrotikProfile: profileSlug,
      description: description.trim(),
      isActive: true,
      simultaneousUsers: simultaneousUsers || 1
    });

    // Reset & close
    setName('');
    setShowAddModal(false);
  };

  const copyRouterOsCommand = (plan: Plan) => {
    const cmd = `/ip hotspot user profile add name="${plan.mikrotikProfile}" rate-limit="${plan.speedRateLimit}" session-timeout=${plan.durationMinutes}m shared-users=${plan.simultaneousUsers} status-autorefresh=1m`;
    navigator.clipboard.writeText(cmd);
    setCopiedProfileId(plan.id);
    setTimeout(() => setCopiedProfileId(null), 2000);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Forfaits & Profils de Vitesse MikroTik
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Configurez les tarifs en FCFA, les quotas de données et les limitations de débit injectées dans le routeur.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un Nouveau Forfait</span>
        </button>
      </div>

      {/* Plans List Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              plan.isActive
                ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                : 'bg-slate-950/60 border-slate-800/40 opacity-60'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-base text-white">{plan.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Profil MikroTik : <code className="text-amber-400">{plan.mikrotikProfile}</code>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-white font-mono tabular-nums">
                    {plan.price.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-xs text-amber-400 font-bold ml-1">FCFA</span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Durée validité :</span>
                  <span className="font-semibold text-slate-200">{plan.durationLabel}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Volume Data :</span>
                  <span className="font-semibold text-emerald-400">{plan.dataLimitLabel}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Débit (Rate-Limit) :</span>
                  <span className="font-mono font-bold text-cyan-400">{plan.speedRateLimit}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Appareils simultanés :</span>
                  <span className="font-mono text-slate-300">{plan.simultaneousUsers} client</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-4">{plan.description}</p>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => copyRouterOsCommand(plan)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors"
                title="Copier la commande MikroTik RouterOS"
              >
                {copiedProfileId === plan.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copié !</span>
                  </>
                ) : (
                  <>
                    <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    <span>Script WinBox</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePlanActive(plan.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    plan.isActive
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {plan.isActive ? 'Actif' : 'Suspendu'}
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Supprimer le forfait "${plan.name}" ?`)) {
                      deletePlan(plan.id);
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-950/50 text-slate-500 hover:text-red-400 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD NEW PLAN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Nouveau Forfait WiFiZone</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Fermer
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nom du Forfait :
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Pass Spécial 2 Heures"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Prix (FCFA) :
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="50"
                    step="50"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Débit MikroTik (Download / Upload) :
                  </label>
                  <input
                    type="text"
                    value={speedRateLimit}
                    onChange={(e) => setSpeedRateLimit(e.target.value)}
                    placeholder="Ex: 5M/2M"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Durée en minutes :
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => {
                      setDurationMinutes(e.target.value);
                      const m = parseInt(e.target.value, 10);
                      if (m >= 1440) setDurationLabel(`${Math.floor(m / 1440)} Jours`);
                      else if (m >= 60) setDurationLabel(`${Math.floor(m / 60)} Heures`);
                      else setDurationLabel(`${m} Minutes`);
                    }}
                    required
                    min="10"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Libellé durée affiché :
                  </label>
                  <input
                    type="text"
                    value={durationLabel}
                    onChange={(e) => setDurationLabel(e.target.value)}
                    placeholder="Ex: 2 Heures"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Limite de Données (Quota) :
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUnlimitedData}
                      onChange={(e) => setIsUnlimitedData(e.target.checked)}
                      className="rounded"
                    />
                    <span>Illimité (No FUP)</span>
                  </label>
                </div>
                {!isUnlimitedData && (
                  <input
                    type="number"
                    value={dataLimitMb}
                    onChange={(e) => setDataLimitMb(e.target.value)}
                    placeholder="Volume en Mo (ex: 2000 pour 2 Go)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description pour les clients :
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Enregistrer & Injecter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
