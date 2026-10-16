import React, { useState } from 'react';
import { useWiFi } from '../../context/WiFiContext';
import { MikroTikRouter } from '../../types';
import {
  generateDirectPortalBindingScript,
  generateExternalPortalRedirectHtml,
  generateCaptivePortalHtml
} from '../../services/mikrotikScriptGenerator';
import {
  Router,
  Link2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
  Copy,
  Check,
  Download,
  Globe,
  Shield,
  Key,
  Server,
  Cpu,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
  Plus,
  Trash2,
  Sliders,
  CheckSquare
} from 'lucide-react';

export const AdminRouterBinding: React.FC = () => {
  const {
    routers,
    selectedRouterId,
    setSelectedRouterId,
    selectedRouter,
    updateRouter,
    addRouter,
    deleteRouter,
    testRouterConnection,
    syncRouterWithPortal,
    config
  } = useWiFi();

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'script' | 'redirect_html' | 'guide'>('config');

  // Form states for the selected router
  const [routerName, setRouterName] = useState(selectedRouter.name);
  const [ipAddress, setIpAddress] = useState(selectedRouter.ipAddress);
  const [dnsName, setDnsName] = useState(selectedRouter.dnsName);
  const [hotspotServer, setHotspotServer] = useState(selectedRouter.hotspotServer);
  const [hotspotInterface, setHotspotInterface] = useState(selectedRouter.hotspotInterface || 'bridge-hotspot');
  const [portalUrl, setPortalUrl] = useState(
    selectedRouter.portalUrl || window.location.origin
  );
  const [portalType, setPortalType] = useState<'external_redirect' | 'local_html_pack' | 'api_sync'>(
    selectedRouter.portalType || 'external_redirect'
  );
  const [apiPort, setApiPort] = useState(selectedRouter.apiPort.toString());
  const [apiUser, setApiUser] = useState(selectedRouter.apiUser || 'api-wifizone');
  const [apiPassword, setApiPassword] = useState(selectedRouter.apiPassword || 'MikroTik@2026!');

  // Diagnostic states
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  // Modal new router
  const [showAddRouterModal, setShowAddRouterModal] = useState(false);
  const [newRouterModel, setNewRouterModel] = useState('RB951Ui-2HnD');
  const [newRouterName, setNewRouterName] = useState('');
  const [newRouterLocation, setNewRouterLocation] = useState('');
  const [newRouterIp, setNewRouterIp] = useState('192.168.88.1');

  // Copy states
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync form state when selected router changes
  React.useEffect(() => {
    setRouterName(selectedRouter.name);
    setIpAddress(selectedRouter.ipAddress);
    setDnsName(selectedRouter.dnsName);
    setHotspotServer(selectedRouter.hotspotServer);
    setHotspotInterface(selectedRouter.hotspotInterface || 'bridge-hotspot');
    setPortalUrl(selectedRouter.portalUrl || window.location.origin);
    setPortalType(selectedRouter.portalType || 'external_redirect');
    setApiPort(selectedRouter.apiPort.toString());
    setApiUser(selectedRouter.apiUser || 'api-wifizone');
    setApiPassword(selectedRouter.apiPassword || 'MikroTik@2026!');
    setTestResult(null);
    setSyncResult(null);
  }, [selectedRouterId, selectedRouter]);

  const handleSaveRouterConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateRouter(selectedRouter.id, {
      name: routerName.trim(),
      ipAddress: ipAddress.trim(),
      dnsName: dnsName.trim(),
      hotspotServer: hotspotServer.trim(),
      hotspotInterface: hotspotInterface.trim(),
      portalUrl: portalUrl.trim(),
      portalType,
      apiPort: parseInt(apiPort, 10) || 8728,
      apiUser: apiUser.trim(),
      apiPassword: apiPassword.trim()
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    setTestResult(null);
    try {
      const res = await testRouterConnection(selectedRouter.id);
      setTestResult(res);
    } finally {
      setIsTestingConn(false);
    }
  };

  const handleSyncWithPortal = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncRouterWithPortal(selectedRouter.id);
      setSyncResult(res.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateNewRouter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouterName.trim()) return;

    addRouter({
      name: newRouterName.trim(),
      location: newRouterLocation.trim() || 'Site Principal',
      ipAddress: newRouterIp.trim() || '192.168.88.1',
      apiPort: 8728,
      apiUser: 'api-wifizone',
      apiPassword: 'MikroTik@2026!',
      rosVersion: 'RouterOS v7.15',
      model: newRouterModel,
      status: 'online',
      hotspotServer: `hotspot-${newRouterName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      hotspotInterface: 'bridge-hotspot',
      dnsName: `wifi.${newRouterName.toLowerCase().replace(/[^a-z0-9]/g, '')}.lan`,
      portalUrl: window.location.origin,
      portalType: 'external_redirect',
      pingLatencyMs: 11,
      lastPingStatus: 'success',
      activeClientsCount: 0,
      uptime: '0j 01h 10m',
      lastSync: 'À l\'instant',
      cpuLoadPercent: 18,
      memoryUsedPercent: 35,
      walledGardenCount: 26
    });

    setNewRouterName('');
    setNewRouterLocation('');
    setShowAddRouterModal(false);
  };

  // Generate scripts for currently selected router
  const bindingScript = generateDirectPortalBindingScript(
    {
      ...selectedRouter,
      ipAddress,
      dnsName,
      apiPort: parseInt(apiPort, 10) || 8728,
      apiUser,
      apiPassword
    },
    portalUrl,
    config
  );

  const redirectHtmlCode = generateExternalPortalRedirectHtml(
    portalUrl,
    config,
    selectedRouter
  );

  const copyScriptText = () => {
    navigator.clipboard.writeText(bindingScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const copyHtmlText = () => {
    navigator.clipboard.writeText(redirectHtmlCode);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const downloadFile = (content: string, filename: string) => {
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Liaison Routeur MikroTik & Portail Captif
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              RouterOS v6 / v7
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Associez votre matériel MikroTik (hEX, RB4011, CCR, cAP ac) à votre portail de paiement Mobile Money.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddRouterModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Ajouter un Routeur</span>
          </button>
        </div>
      </div>

      {/* Router Switcher & Live Health Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Router Selector Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <span className="text-xs text-slate-400 font-semibold block">Routeur MikroTik en cours :</span>
          <div className="flex items-center gap-2">
            <Router className="w-5 h-5 text-amber-400 shrink-0" />
            <select
              value={selectedRouterId}
              onChange={(e) => setSelectedRouterId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold outline-none cursor-pointer focus:border-amber-500"
            >
              {routers.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} · {r.model} ({r.ipAddress})
                </option>
              ))}
            </select>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>Emplacement : <strong className="text-slate-300">{selectedRouter.location}</strong></span>
            <span className="font-mono text-cyan-400">{selectedRouter.rosVersion}</span>
          </div>
        </div>

        {/* Live Status & Ping Latency */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">État de Liaison API :</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-emerald-400">Connecté & Synchronisé</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Temps de Réponse API :</span>
              <span className="font-mono font-black text-amber-400 text-sm tabular-nums">
                {selectedRouter.pingLatencyMs || 12} ms
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Clients Connectés :</span>
              <span className="font-mono font-black text-cyan-400 text-sm tabular-nums">
                {selectedRouter.activeClientsCount} en ligne
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Dernière synchro : {selectedRouter.lastSync}</span>
            <span>Uptime : {selectedRouter.uptime}</span>
          </div>
        </div>

        {/* Quick Diagnostics Actions */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs text-slate-400 font-semibold block mb-1">Actions de Diagnostic :</span>
            <p className="text-[11px] text-slate-500">
              Vérifiez la communication bidirectionnelle entre cette plateforme web et RouterOS.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleTestConnection}
              disabled={isTestingConn}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isTestingConn ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Test du port {selectedRouter.apiPort} en cours...</span>
                </>
              ) : (
                <>
                  <Server className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tester Connexion API Routeur</span>
                </>
              )}
            </button>

            <button
              onClick={handleSyncWithPortal}
              disabled={isSyncing}
              className="w-full py-2 px-3 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-950 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Synchronisation...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Synchroniser Utilisateurs Hotspot</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostics Alerts */}
      {testResult && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 text-xs text-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">Diagnostic Routeur Validé avec Succès ({testResult.latencyMs} ms)</h4>
            <p className="text-slate-300 leading-relaxed">{testResult.message}</p>
          </div>
        </div>
      )}

      {syncResult && (
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/80 text-xs text-cyan-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">Synchronisation Terminée</h4>
            <p className="text-slate-300 leading-relaxed">{syncResult}</p>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('config')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'config'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>1. Paramètres & Méthode de Liaison</span>
        </button>

        <button
          onClick={() => setActiveSubTab('script')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'script'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>2. Script de Liaison Automatique (.rsc)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('redirect_html')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'redirect_html'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>3. Fichier Redirection Hotspot (login.html)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('guide')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'guide'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>4. Guide & Checklist WinBox</span>
        </button>
      </div>

      {/* SUB-TAB 1: CONFIGURATION FORM & ARCHITECTURE SELECTION */}
      {activeSubTab === 'config' && (
        <form onSubmit={handleSaveRouterConfig} className="space-y-6">
          {/* Method Selection (3 Modes) */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white mb-1">
                Choisissez l'Architecture de Liaison Routeur &lt;-&gt; Portail
              </h2>
              <p className="text-xs text-slate-400">
                Comment vos clients Wi-Fi accèdent-ils au portail de paiement Mobile Money lorsqu'ils se connectent :
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option A: External Redirect */}
              <div
                onClick={() => setPortalType('external_redirect')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  portalType === 'external_redirect'
                    ? 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-white">Redirection Externe Cloud</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                    Recommandé
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Le routeur redirige automatiquement le navigateur du client vers l'URL sécurisée de ce portail web via un fichier <code className="text-amber-400">login.html</code> léger.
                </p>
              </div>

              {/* Option B: Local HTML Pack */}
              <div
                onClick={() => setPortalType('local_html_pack')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  portalType === 'local_html_pack'
                    ? 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-white">Pack HTML Local MikroTik</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-medium px-2 py-0.5 rounded-full">
                    Autonome
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Les pages sont hébergées directement dans la mémoire flash du routeur (<code className="text-amber-400">Files/hotspot</code>) avec le bouton Mobile Money.
                </p>
              </div>

              {/* Option C: API Sync */}
              <div
                onClick={() => setPortalType('api_sync')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  portalType === 'api_sync'
                    ? 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-white">Synchronisation API Directe</span>
                  <span className="text-[10px] bg-cyan-950/40 text-cyan-300 font-medium px-2 py-0.5 rounded-full">
                    RouterOS v7
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  La plateforme pilote le routeur via le port API (8728) pour créer automatiquement les utilisateurs et déconnecter en direct.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Network Settings */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800">
              Paramètres Réseau du Hotspot MikroTik
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nom du Routeur / Site :
                </label>
                <input
                  type="text"
                  value={routerName}
                  onChange={(e) => setRouterName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Adresse IP Passerelle Hotspot :
                </label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="Ex: 192.168.88.1 ou 10.5.50.1"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nom DNS Local Hotspot :
                </label>
                <input
                  type="text"
                  value={dnsName}
                  onChange={(e) => setDnsName(e.target.value)}
                  placeholder="Ex: wifizone.lan ou login.hotspot"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nom de l'Instance Serveur Hotspot :
                </label>
                <input
                  type="text"
                  value={hotspotServer}
                  onChange={(e) => setHotspotServer(e.target.value)}
                  placeholder="Ex: hotspot1 ou hotspot-marche"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Interface Réseau Hotspot :
                </label>
                <input
                  type="text"
                  value={hotspotInterface}
                  onChange={(e) => setHotspotInterface(e.target.value)}
                  placeholder="Ex: bridge-hotspot ou wlan1"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Portal URL Endpoint */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                URL Complète du Portail Captif (où rediriger les clients Wi-Fi) :
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={portalUrl}
                  onChange={(e) => setPortalUrl(e.target.value)}
                  placeholder="https://votre-wifizone.com ou URL de l'applet"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setPortalUrl(window.location.origin)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 font-semibold whitespace-nowrap"
                  title="Utiliser l'URL de cette application"
                >
                  URL Actuelle
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Cette URL sera automatiquement inscrite dans les règles de <strong>Walled-Garden</strong> du MikroTik pour que les smartphones non connectés puissent charger le portail sans blocage.
              </p>
            </div>
          </div>

          {/* API RouterOS Credentials for Automated User Insertion */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <h2 className="text-base font-bold text-white">Identifiants API RouterOS</h2>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Service /ip service api</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Port de l'API RouterOS :
                </label>
                <input
                  type="number"
                  value={apiPort}
                  onChange={(e) => setApiPort(e.target.value)}
                  placeholder="8728"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Utilisateur API :
                </label>
                <input
                  type="text"
                  value={apiUser}
                  onChange={(e) => setApiUser(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mot de Passe API :
                </label>
                <input
                  type="text"
                  value={apiPassword}
                  onChange={(e) => setApiPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Configuration Enregistrée !</span>
                </>
              ) : (
                <>
                  <span>Enregistrer la Configuration Routeur</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 2: GENERATED BINDING ROUTEROS SCRIPT */}
      {activeSubTab === 'script' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-3">
            <Terminal className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">Comment appliquer ce script sur votre MikroTik ?</h4>
              <p className="text-slate-300 leading-relaxed">
                1. Ouvrez <strong>WinBox</strong> et connectez-vous à votre routeur MikroTik.<br />
                2. Cliquez sur <strong>New Terminal</strong> dans le menu de gauche.<br />
                3. Copiez le script ci-dessous et collez-le directement dans le terminal en faisant un clic droit &gt; <em>Paste</em>.<br />
                4. Les règles de Walled Garden, la résolution DNS et l'utilisateur API seront configurés instantanément.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-mono">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span>Script WinBox · Liaison Routeur &lt;-&gt; Portail Captif</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadFile(bindingScript, `liaison_mikrotik_${selectedRouter.id}.rsc`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger .rsc</span>
                </button>

                <button
                  onClick={copyScriptText}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le Script</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 overflow-x-auto max-h-[500px] overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed">
              <pre>{bindingScript}</pre>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: REDIRECTION HTML TEMPLATE */}
      {activeSubTab === 'redirect_html' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-800/40 text-xs text-blue-200 flex items-start gap-3">
            <Globe className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">Fichier login.html à injecter dans le MikroTik</h4>
              <p className="text-slate-300 leading-relaxed">
                Ce fichier HTML remplace la page de connexion standard de MikroTik. Dès qu'un utilisateur ouvre son navigateur ou se connecte au Wi-Fi, il est automatiquement redirigé vers l'URL de votre portail : <code>{portalUrl}</code> avec son adresse MAC et son IP transmises de manière sécurisée.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-mono">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>hotspot/login.html</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadFile(redirectHtmlCode, 'login.html')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger login.html</span>
                </button>

                <button
                  onClick={copyHtmlText}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {copiedHtml ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le Code HTML</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 overflow-x-auto max-h-[500px] overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed">
              <pre>{redirectHtmlCode}</pre>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: STEP-BY-STEP WINBOX GUIDE & CHECKLIST */}
      {activeSubTab === 'guide' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center font-mono">1</span>
                <span>Ouvrir WinBox & Exécuter le Script</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connectez-vous à votre routeur MikroTik via son adresse IP ou son adresse MAC. Ouvrez le <strong>Terminal</strong> et collez le script généré dans l'onglet 2. Cela paramètre le DNS, les règles Walled Garden et l'utilisateur API.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center font-mono">2</span>
                <span>Glisser-Déposer le fichier login.html</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dans WinBox, ouvrez le menu <strong>Files</strong>. Localisez le dossier nommé <strong>hotspot/</strong>. Téléchargez le fichier <code>login.html</code> depuis l'onglet 3 et glissez-le directement dans ce dossier pour remplacer l'ancien.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center font-mono">3</span>
                <span>Vérifier le Walled Garden</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rendez-vous dans <strong>IP &gt; Hotspot &gt; Walled Garden</strong>. Assurez-vous que le domaine de votre portail et les serveurs d'Orange Money et MTN sont bien présents en action <em>allow</em>.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center font-mono">4</span>
                <span>Tester la Connexion d'un Smartphone</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connectez un téléphone au réseau Wi-Fi. La notification de connexion au portail captif apparaît immédiatement. Cliquez dessus : le portail de paiement Mobile Money s'affiche avec tous vos forfaits en FCFA !
              </p>
            </div>
          </div>

          {/* Interactive Checklist */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Checklist de Validation Déploiement</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-amber-500" />
                <span>Serveur Hotspot activé sur l'interface MikroTik ({selectedRouter.hotspotInterface || 'bridge-hotspot'})</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-amber-500" />
                <span>Walled Garden configuré pour autoriser le portail et les paiements Orange Money / MTN MoMo</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-amber-500" />
                <span>Page <code>login.html</code> de redirection déposée dans <code>Files/hotspot</code></span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-amber-500" />
                <span>Utilisateur API <code>{apiUser}</code> créé avec les droits <code>read, write, test, api</code></span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-amber-500" />
                <span>Service API activé sur le port <code>{apiPort}</code> dans <code>/ip service</code></span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW ROUTER */}
      {showAddRouterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Ajouter un Nouveau Routeur MikroTik</h3>
              <button
                onClick={() => setShowAddRouterModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Fermer
              </button>
            </div>

            <form onSubmit={handleCreateNewRouter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nom du Routeur / Antenne :
                </label>
                <input
                  type="text"
                  value={newRouterName}
                  onChange={(e) => setNewRouterName(e.target.value)}
                  placeholder="Ex: MikroTik Zone Sud - Marché"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Emplacement / Quartier :
                </label>
                <input
                  type="text"
                  value={newRouterLocation}
                  onChange={(e) => setNewRouterLocation(e.target.value)}
                  placeholder="Ex: Carrefour Marché / Poteau 4"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Modèle MikroTik :
                  </label>
                  <select
                    value={newRouterModel}
                    onChange={(e) => setNewRouterModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  >
                    <option value="hEX S (RB760iGS)">hEX S (RB760iGS)</option>
                    <option value="RB4011iGS+">RB4011iGS+</option>
                    <option value="cAP ac / ax">cAP ac / ax</option>
                    <option value="RB951Ui-2HnD">RB951Ui-2HnD</option>
                    <option value="CCR2004-16G-2S+">CCR2004 (Fibre)</option>
                    <option value="MikroTik CHR (Cloud)">MikroTik CHR (Cloud)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Adresse IP Routeur :
                  </label>
                  <input
                    type="text"
                    value={newRouterIp}
                    onChange={(e) => setNewRouterIp(e.target.value)}
                    placeholder="192.168.88.1"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddRouterModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Ajouter le Routeur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
