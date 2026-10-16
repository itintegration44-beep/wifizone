import React, { useState } from 'react';
import { useWiFi } from '../../context/WiFiContext';
import {
  Settings,
  Save,
  CheckCircle2,
  Smartphone,
  Shield,
  Wifi,
  Globe,
  Key,
  HelpCircle
} from 'lucide-react';

export const AdminGateways: React.FC = () => {
  const { config, updateConfig } = useWiFi();

  // Local state initialized with current config
  const [formData, setFormData] = useState(config);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Passerelles de Paiement & Paramètres WiFiZone
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Configuration des clés API Orange Money, MTN MoMo et personnalisation de la boutique hotspot.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>Paramètres Enregistrés !</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Enregistrer les Modifications</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Hotspot General Branding */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Wifi className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white">Identité & Personnalisation du Hotspot</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nom Commercial du Hotspot :
              </label>
              <input
                type="text"
                value={formData.general.hotspotName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    general: { ...formData.general, hotspotName: e.target.value }
                  })
                }
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Numéro Support WhatsApp (Clients Wi-Fi) :
              </label>
              <input
                type="text"
                value={formData.general.supportWhatsapp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    general: { ...formData.general, supportWhatsapp: e.target.value }
                  })
                }
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Message d'Accueil sur le Portail Captif :
            </label>
            <input
              type="text"
              value={formData.general.welcomeMessage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  general: { ...formData.general, welcomeMessage: e.target.value }
                })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Section 2: Orange Money API Config */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-orange-950/60 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-orange-600 flex items-center justify-center text-white font-bold text-[10px]">
                OM
              </div>
              <h2 className="text-base font-bold text-white">Passerelle Orange Money (WebPay & Push USSD)</h2>
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.orangeMoney.enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    orangeMoney: { ...formData.orangeMoney, enabled: e.target.checked }
                  })
                }
                className="rounded"
              />
              <span>Activer Orange Money</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Merchant ID (Identifiant Marchand Orange) :
              </label>
              <input
                type="text"
                value={formData.orangeMoney.merchantId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    orangeMoney: { ...formData.orangeMoney, merchantId: e.target.value }
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Code USSD Client :
              </label>
              <input
                type="text"
                value={formData.orangeMoney.ussdCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    orangeMoney: { ...formData.orangeMoney, ussdCode: e.target.value }
                  })
                }
                placeholder="#150# (CMR) ou #144# (CIV/SEN)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Orange API Client Key :
              </label>
              <input
                type="text"
                value={formData.orangeMoney.apiKey}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    orangeMoney: { ...formData.orangeMoney, apiKey: e.target.value }
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Token Authentication URL :
              </label>
              <input
                type="text"
                value={formData.orangeMoney.tokenUrl}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    orangeMoney: { ...formData.orangeMoney, tokenUrl: e.target.value }
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: MTN Mobile Money API Config */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-yellow-950/60 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-yellow-400 flex items-center justify-center text-slate-950 font-black text-[10px]">
                M
              </div>
              <h2 className="text-base font-bold text-white">Passerelle MTN Mobile Money (MoMo API)</h2>
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.mtnMomo.enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mtnMomo: { ...formData.mtnMomo, enabled: e.target.checked }
                  })
                }
                className="rounded"
              />
              <span>Activer MTN MoMo</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                MoMo Subscription Key (Primary Key Ocp-Apim) :
              </label>
              <input
                type="text"
                value={formData.mtnMomo.subscriptionKey}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mtnMomo: { ...formData.mtnMomo, subscriptionKey: e.target.value }
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                API User UUID (X-Reference-Id) :
              </label>
              <input
                type="text"
                value={formData.mtnMomo.apiUser}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mtnMomo: { ...formData.mtnMomo, apiUser: e.target.value }
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Environnement Cible :
              </label>
              <select
                value={formData.mtnMomo.targetEnv}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mtnMomo: { ...formData.mtnMomo, targetEnv: e.target.value as any }
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
              >
                <option value="live">Production (Live MoMo)</option>
                <option value="sandbox">Sandbox (Développement / Tests)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Code USSD Client :
              </label>
              <input
                type="text"
                value={formData.mtnMomo.ussdCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mtnMomo: { ...formData.mtnMomo, ussdCode: e.target.value }
                  })
                }
                placeholder="*126# (CMR) ou *133# (CIV)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Aggregator Option */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">Agrégateur de Paiement Alternatif</h2>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.aggregator.enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    aggregator: { ...formData.aggregator, enabled: e.target.checked }
                  })
                }
                className="rounded"
              />
              <span>Activer Passerelle Unifiée</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Fournisseur :
              </label>
              <select
                value={formData.aggregator.provider}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    aggregator: { ...formData.aggregator, provider: e.target.value as any }
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
              >
                <option value="cinetpay">CinetPay (Afrique Centrale & Ouest)</option>
                <option value="notchpay">NotchPay</option>
                <option value="touchpay">TouchPay (InTouch)</option>
                <option value="direct">API Directes Uniquement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Site ID / Service ID :
              </label>
              <input
                type="text"
                value={formData.aggregator.siteId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    aggregator: { ...formData.aggregator, siteId: e.target.value }
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Clé Secrète API :
              </label>
              <input
                type="password"
                value={formData.aggregator.apiKey}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    aggregator: { ...formData.aggregator, apiKey: e.target.value }
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
