import React, { useState } from 'react';
import { useWiFi } from '../../context/WiFiContext';
import {
  generateWalledGardenScript,
  generateProfilesScript,
  generateHotspotSetupScript,
  generateCaptivePortalHtml
} from '../../services/mikrotikScriptGenerator';
import {
  Terminal,
  Copy,
  Check,
  Download,
  ShieldAlert,
  Code,
  FileCode,
  CheckCircle2,
  Server
} from 'lucide-react';

export const AdminMikrotikConfig: React.FC = () => {
  const { plans, config, selectedRouter } = useWiFi();
  const [activeTab, setActiveTab] = useState<'walled_garden' | 'profiles' | 'setup' | 'html'>('walled_garden');
  const [copied, setCopied] = useState(false);

  const walledGardenScript = generateWalledGardenScript(config);
  const profilesScript = generateProfilesScript(plans);
  const setupScript = generateHotspotSetupScript(selectedRouter, config);
  const htmlTemplate = generateCaptivePortalHtml(config, selectedRouter);

  const getCurrentContent = () => {
    switch (activeTab) {
      case 'walled_garden': return walledGardenScript;
      case 'profiles': return profilesScript;
      case 'setup': return setupScript;
      case 'html': return htmlTemplate;
    }
  };

  const copyCurrent = () => {
    navigator.clipboard.writeText(getCurrentContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScriptFile = () => {
    const content = getCurrentContent();
    const ext = activeTab === 'html' ? 'html' : 'rsc';
    const filename = `mikrotik_${activeTab}_${selectedRouter.id}.${ext}`;
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Générateur de Scripts MikroTik RouterOS
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Exportez les commandes prêtes à coller dans WinBox (Terminal) pour configurer automatiquement le routeur.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadScriptFile}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger le Fichier ({activeTab === 'html' ? '.html' : '.rsc'})</span>
          </button>

          <button
            onClick={copyCurrent}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copié dans le Presse-Papier !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copier le Script WinBox</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('walled_garden')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'walled_garden'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Walled Garden (Bypass Mobile Money)
        </button>

        <button
          onClick={() => setActiveTab('profiles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'profiles'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Profils & Débits Hotspot
        </button>

        <button
          onClick={() => setActiveTab('setup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'setup'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Installation Complète Hotspot
        </button>

        <button
          onClick={() => setActiveTab('html')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'html'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          4. Page Captive MikroTik (login.html)
        </button>
      </div>

      {/* Information Banner for current tab */}
      {activeTab === 'walled_garden' && (
        <div className="p-4 rounded-2xl bg-orange-950/30 border border-orange-800/60 text-xs text-orange-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">Pourquoi le Walled Garden est obligatoire pour Mobile Money ?</h4>
            <p className="text-slate-300 leading-relaxed">
              Lorsqu'un client se connecte au Wi-Fi, MikroTik bloque tout le trafic internet jusqu'à l'authentification. Ces règles autorisent expressément les serveurs de passerelle Orange Money et MTN MoMo afin que le client puisse initier et valider le paiement même sans forfait actif !
            </p>
          </div>
        </div>
      )}

      {activeTab === 'html' && (
        <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/60 text-xs text-blue-200 flex items-start gap-3">
          <FileCode className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">Comment installer cette page sur le routeur MikroTik ?</h4>
            <p className="text-slate-300 leading-relaxed">
              Dans WinBox, ouvrez le menu <strong>Files</strong>, localisez le dossier <strong>hotspot/</strong> et remplacez le fichier <strong>login.html</strong> existant par ce fichier. Il intègre le bouton d'achat direct Orange / MTN et le formulaire de connexion par ticket.
            </p>
          </div>
        </div>
      )}

      {/* Code Editor / Viewer Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Terminal WinBox · {activeTab === 'html' ? 'login.html' : 'commandes RouterOS (.rsc)'}</span>
          </div>

          <span className="text-[11px] font-mono text-slate-500">
            Routeur cible : {selectedRouter.name} ({selectedRouter.rosVersion})
          </span>
        </div>

        <div className="p-4 overflow-x-auto max-h-[500px] overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed selection:bg-amber-500 selection:text-slate-950">
          <pre>{getCurrentContent()}</pre>
        </div>
      </div>
    </div>
  );
};
