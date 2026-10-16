import React, { useState } from 'react';
import { useWiFi } from '../context/WiFiContext';
import { Plan, PaymentOperator } from '../types';
import {
  Wifi,
  Smartphone,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  Download,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  LogOut,
  Sliders,
  Send
} from 'lucide-react';

export const ClientPortal: React.FC = () => {
  const {
    plans,
    config,
    paymentState,
    initiatePayment,
    confirmPaymentManually,
    cancelPayment,
    resetPaymentState,
    connectClientWithVoucher,
    clients,
    setViewMode,
    selectedRouter
  } = useWiFi();

  const [activeTab, setActiveTab] = useState<'buy' | 'voucher' | 'status'>('buy');
  const [selectedPlan, setSelectedPlan] = useState<Plan>(plans[2] || plans[0]); // default to 24h
  const [selectedOperator, setSelectedOperator] = useState<PaymentOperator>('orange_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCountry, setPhoneCountry] = useState('+237');
  const [inputVoucherCode, setInputVoucherCode] = useState('');
  const [inputVoucherPin, setInputVoucherPin] = useState('');
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccess, setVoucherSuccess] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if current device has an active session
  const activeUserSession = clients.find(c => c.status === 'active' && (c.ipAddress === '10.5.50.77' || c.ipAddress === '10.5.50.48'));

  const handleStartPayment = (plan: Plan, operator?: PaymentOperator) => {
    setSelectedPlan(plan);
    if (operator) {
      setSelectedOperator(operator);
    }
    // Pre-fill phone if empty
    if (!phoneNumber) {
      setPhoneNumber(operator === 'mtn_momo' ? '677102934' : '699451280');
    }
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    const fullPhone = `${phoneCountry} ${phoneNumber.trim()}`;
    initiatePayment({
      planId: selectedPlan.id,
      operator: selectedOperator,
      phoneNumber: fullPhone,
      countryCode: phoneCountry.replace('+', '')
    });
  };

  const handleConnectVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError(null);
    setVoucherSuccess(null);

    if (!inputVoucherCode.trim()) {
      setVoucherError('Veuillez saisir votre code ticket.');
      return;
    }

    setIsConnecting(true);
    setTimeout(() => {
      const result = connectClientWithVoucher(inputVoucherCode, inputVoucherPin);
      setIsConnecting(false);
      if (result.success) {
        setVoucherSuccess(result.message);
        setActiveTab('status');
      } else {
        setVoucherError(result.message);
      }
    }, 600);
  };

  const handleAutoConnectAfterPayment = () => {
    if (!paymentState.generatedVoucher) return;
    const result = connectClientWithVoucher(paymentState.generatedVoucher.code, paymentState.generatedVoucher.pin);
    if (result.success) {
      resetPaymentState();
      setActiveTab('status');
    }
  };

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Top Bar Banner for Hotspot */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-lg shadow-orange-500/20">
              <Wifi className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">{config.general.hotspotName}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <p className="text-xs text-slate-400">
                MikroTik Hotspot · SSID: <span className="text-amber-400 font-medium">K-WIFI-ZONE-FIBRE</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setViewMode('admin')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800/60 hover:bg-slate-800 text-xs font-medium text-slate-200 transition-colors whitespace-nowrap"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Console Admin</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex-1 flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-xl mb-6 shadow-inner">
          <button
            onClick={() => setActiveTab('buy')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'buy'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Acheter un Forfait</span>
          </button>

          <button
            onClick={() => setActiveTab('voucher')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'voucher'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>J'ai un Ticket</span>
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'status'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Mon Statut {activeUserSession && '· Connecté'}</span>
          </button>
        </div>

        {/* TAB 1: BUY INTERNET FORFAIT */}
        {activeTab === 'buy' && (
          <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-2">
                Paiement Instantané Orange Money & MTN MoMo
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                Activez votre accès internet immédiat sans vous déplacer. Débit haut débit sur fibre optique.
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans
                .filter(p => p.isActive)
                .map(plan => {
                  const isSelected = selectedPlan.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-slate-900/90 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/50'
                          : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider shadow">
                          Plus Populaire
                        </div>
                      )}

                      <div>
                        <div className="flex items-baseline justify-between mb-1">
                          <h2 className="text-base font-bold text-white">{plan.name}</h2>
                          <div className="text-right">
                            <span className="text-xl font-extrabold text-amber-400 tabular-nums">
                              {plan.price.toLocaleString('fr-FR')}
                            </span>
                            <span className="text-xs text-slate-400 ml-1">FCFA</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                          <span className="font-semibold text-slate-300">{plan.durationLabel}</span>
                          <span>·</span>
                          <span className="text-emerald-400 font-medium">{plan.dataLimitLabel}</span>
                          <span>·</span>
                          <span className="text-cyan-400 font-mono text-[11px]">{plan.speedRateLimit}</span>
                        </div>

                        <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                          {plan.description}
                        </p>
                      </div>

                      {/* Operator Quick Buttons */}
                      <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          {/* Orange Money Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartPayment(plan, 'orange_money');
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors shadow-sm"
                          >
                            <span className="font-bold">Orange</span> Money
                          </button>

                          {/* MTN MoMo Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartPayment(plan, 'mtn_momo');
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                          >
                            <span className="font-extrabold">MTN</span> MoMo
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Selected Plan Checkout Box */}
            <div className="mt-8 p-6 rounded-2xl border border-slate-800 bg-slate-900/80 max-w-xl mx-auto shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <div>
                  <span className="text-xs text-slate-400 block">Forfait sélectionné :</span>
                  <span className="text-base font-bold text-white">{selectedPlan.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400 tabular-nums">
                    {selectedPlan.price.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">FCFA</span>
                </div>
              </div>

              <form onSubmit={handleSubmitPayment} className="space-y-4">
                {/* Operator Selector Tabs */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Choisissez votre moyen de paiement Mobile Money :
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedOperator('orange_money')}
                      className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                        selectedOperator === 'orange_money'
                          ? 'border-orange-500 bg-orange-950/40 text-orange-200 ring-2 ring-orange-500/50'
                          : 'border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-slate-950 font-black text-[10px]">
                        OM
                      </div>
                      <span>Orange Money (#150#)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedOperator('mtn_momo')}
                      className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                        selectedOperator === 'mtn_momo'
                          ? 'border-yellow-400 bg-yellow-950/40 text-yellow-200 ring-2 ring-yellow-400/50'
                          : 'border-slate-800 bg-slate-900 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-slate-950 font-black text-[10px]">
                        M
                      </div>
                      <span>MTN Mobile Money (*126#)</span>
                    </button>
                  </div>
                </div>

                {/* Phone Input with Country */}
                <div>
                  <label htmlFor="payer_phone" className="block text-xs font-semibold text-slate-300 mb-2">
                    Numéro de téléphone payeur :
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-700 bg-slate-950 overflow-hidden focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all">
                    <select
                      value={phoneCountry}
                      onChange={(e) => setPhoneCountry(e.target.value)}
                      className="bg-slate-900 border-r border-slate-800 px-3 py-3 text-xs font-semibold text-slate-200 outline-none"
                    >
                      <option value="+237">🇨🇲 +237 (CMR)</option>
                      <option value="+225">🇨🇮 +225 (CIV)</option>
                      <option value="+221">🇸🇳 +221 (SEN)</option>
                      <option value="+226">🇧🇫 +226 (BFA)</option>
                      <option value="+241">🇬🇦 +241 (GAB)</option>
                      <option value="+228">🇹🇬 +228 (TGO)</option>
                    </select>

                    <input
                      id="payer_phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Ex: 699 45 12 80 ou 07 00 12 34"
                      required
                      className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-slate-500 outline-none font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Paiement sécurisé. Vous recevrez une invite USSD sur votre écran pour valider votre code PIN.
                  </p>
                </div>

                {/* Submit Checkout Button */}
                <button
                  type="submit"
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                    selectedOperator === 'orange_money'
                      ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/20'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                  }`}
                >
                  <span>Valider et Payer {selectedPlan.price.toLocaleString('fr-FR')} FCFA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: VOUCHER CODE QUICK LOGIN */}
        {activeTab === 'voucher' && (
          <div className="max-w-md mx-auto w-full py-4 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Connexion par Code Ticket</h2>
              <p className="text-xs text-slate-400">
                Saisissez l'identifiant figurant sur votre ticket ou reçu Mobile Money pour vous connecter au Wi-Fi.
              </p>
            </div>

            <form onSubmit={handleConnectVoucher} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4 shadow-xl">
              {voucherError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <span>{voucherError}</span>
                </div>
              )}

              {voucherSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{voucherSuccess}</span>
                </div>
              )}

              <div>
                <label htmlFor="voucher_code_input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Code Ticket / Identifiant (Username) :
                </label>
                <input
                  id="voucher_code_input"
                  type="text"
                  value={inputVoucherCode}
                  onChange={(e) => setInputVoucherCode(e.target.value)}
                  placeholder="Ex: 7842-1904 ou 849201"
                  required
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base text-white font-mono tracking-wider placeholder-slate-600 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="voucher_pin_input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Code PIN / Mot de passe (facultatif si code unique) :
                </label>
                <input
                  id="voucher_pin_input"
                  type="password"
                  value={inputVoucherPin}
                  onChange={(e) => setInputVoucherPin(e.target.value)}
                  placeholder="Code PIN à 4 chiffres (ex: 8492)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-slate-600 outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isConnecting}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authentification MikroTik en cours...</span>
                  </>
                ) : (
                  <>
                    <span>Se Connecter au Wi-Fi</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Ticket button */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setInputVoucherCode('7842-1904');
                  setInputVoucherPin('8492');
                }}
                className="text-xs text-amber-400 hover:underline inline-flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                <span>Tester avec le ticket de démonstration : 7842-1904</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SESSION STATUS */}
        {activeTab === 'status' && (
          <div className="max-w-md mx-auto w-full py-4 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <Wifi className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Statut de Votre Connexion</h2>
              <p className="text-xs text-slate-400">
                Informations en direct de votre session active sur le routeur {selectedRouter.name}.
              </p>
            </div>

            {activeUserSession ? (
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 space-y-5 shadow-2xl">
                {/* Active Status Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Session Active</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">IP: {activeUserSession.ipAddress}</span>
                </div>

                {/* Countdown Time Remaining */}
                <div className="text-center py-2">
                  <span className="text-xs text-slate-400 block mb-1">Temps de connexion restant :</span>
                  <div className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums tracking-tight">
                    {Math.floor(activeUserSession.remainingSeconds / 3600)}h{' '}
                    {Math.floor((activeUserSession.remainingSeconds % 3600) / 60)}m{' '}
                    {activeUserSession.remainingSeconds % 60}s
                  </div>
                </div>

                {/* Progress bar and metrics */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Forfait : <strong className="text-white">{activeUserSession.planName}</strong></span>
                    <span>Ticket : <strong className="font-mono text-amber-400">{activeUserSession.username}</strong></span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Débit descendant :</span>
                      <span className="font-mono font-bold text-emerald-400 tabular-nums">
                        {(activeUserSession.currentRateDownKbps / 1024).toFixed(2)} Mbps
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Débit montant :</span>
                      <span className="font-mono font-bold text-cyan-400 tabular-nums">
                        {(activeUserSession.currentRateUpKbps / 1024).toFixed(2)} Mbps
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Adresse MAC : <code className="text-slate-400 font-mono">{activeUserSession.macAddress}</code></span>
                    <span>Signal : <span className="text-emerald-400 font-medium">{activeUserSession.signalDbm} dBm</span></span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setActiveTab('buy')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Prolonger / Changer forfait</span>
                  </button>

                  <button
                    onClick={() => {
                      alert('Déconnexion effectuée depuis le routeur MikroTik.');
                    }}
                    className="py-2.5 px-4 rounded-xl border border-red-800/80 hover:bg-red-950/40 text-red-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/60 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Aucune session active détectée</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Vous n'êtes pas encore connecté à internet. Achetez un forfait par Mobile Money ou saisissez votre code ticket.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setActiveTab('buy')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                  >
                    Acheter un Forfait
                  </button>
                  <button
                    onClick={() => setActiveTab('voucher')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
                  >
                    Entrer un Ticket
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: MOBILE MONEY PAYMENT SIMULATION & VOUCHER DELIVERY */}
      {paymentState.isSimulating && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* STEP 1: PUSH USSD SENT / WAITING FOR SECRET PIN */}
            {paymentState.step === 'push_sent' && (
              <>
                <div className="text-center space-y-2">
                  <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center shadow-lg ${
                    paymentState.currentTransaction?.operator === 'orange_money'
                      ? 'bg-orange-600 text-white shadow-orange-600/30'
                      : 'bg-yellow-400 text-slate-950 shadow-yellow-400/30'
                  }`}>
                    <Smartphone className="w-7 h-7" />
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    Validation sur votre téléphone
                  </h3>
                  <p className="text-xs text-slate-300">
                    Une demande de débit de <strong className="text-amber-400">{paymentState.currentTransaction?.amount} FCFA</strong> a été envoyée au <span className="font-mono text-white font-bold">{paymentState.currentTransaction?.phoneNumber}</span>.
                  </p>
                </div>

                {/* USSD Instruction Banner */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                    <Send className="w-4 h-4" />
                    <span>Instructions de validation :</span>
                  </div>
                  {paymentState.currentTransaction?.operator === 'orange_money' ? (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      1. Regardez l'écran de votre téléphone : une invite s'affiche directement.<br />
                      2. Saisissez votre <strong>code secret Orange Money</strong> pour confirmer.<br />
                      3. Si rien n'apparaît, composez <strong>#150#</strong> option 5 (Paiements).
                    </p>
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      1. Un message flash MTN MoMo s'affiche sur votre mobile.<br />
                      2. Tapez votre <strong>code secret MoMo</strong> pour approuver le paiement.<br />
                      3. En cas de retard, composez le <strong>*126#</strong> pour valider.
                    </p>
                  )}
                </div>

                {/* Countdown display */}
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Délai d'attente opérateur :</span>
                  <span className="font-mono font-bold text-amber-400 tabular-nums text-sm">
                    {paymentState.countdown}s
                  </span>
                </div>

                {/* Action Buttons: Confirm now button for demo simulation + cancel */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={confirmPaymentManually}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simuler confirmation immédiate du client</span>
                  </button>

                  <button
                    onClick={cancelPayment}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white font-medium text-xs transition-colors"
                  >
                    Annuler la transaction
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: PAYMENT SUCCESS & VOUCHER TICKET READY */}
            {paymentState.step === 'success' && paymentState.generatedVoucher && (
              <>
                <div className="text-center space-y-1">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-2">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl font-black text-white">Paiement Confirmé !</h3>
                  <p className="text-xs text-emerald-400 font-medium">
                    Transaction {paymentState.currentTransaction?.operatorRef} validée avec succès.
                  </p>
                </div>

                {/* Ticket Card Component */}
                <div className="p-5 rounded-2xl bg-slate-950 border-2 border-dashed border-amber-500/60 relative overflow-hidden text-center space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    {config.general.hotspotName} · Ticket Wi-Fi
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Code Ticket (Identifiant) :</span>
                    <div className="text-2xl font-black font-mono tracking-widest text-white tabular-nums bg-slate-900 py-2 px-4 rounded-xl border border-slate-800 inline-block">
                      {paymentState.generatedVoucher.code}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Code PIN :</span>
                      <strong className="font-mono text-amber-400">{paymentState.generatedVoucher.pin}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Durée :</span>
                      <strong className="text-white">{paymentState.generatedVoucher.durationLabel}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Débit :</span>
                      <strong className="font-mono text-cyan-400">{paymentState.generatedVoucher.speedLimit}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => copyVoucherCode(paymentState.generatedVoucher!.code)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Code copié !' : 'Copier le code ticket'}</span>
                  </button>
                </div>

                {/* 1-Click Connect Button */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleAutoConnectAfterPayment}
                    className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-transform active:scale-95"
                  >
                    <Wifi className="w-5 h-5" />
                    <span>Me Connecter Directement au Wi-Fi</span>
                  </button>

                  <button
                    onClick={() => resetPaymentState()}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white font-medium text-xs transition-colors"
                  >
                    Fermer et conserver le ticket
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: PAYMENT FAILED */}
            {paymentState.step === 'failed' && (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Échec de Paiement</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {paymentState.errorMessage || 'Le paiement n\'a pas pu aboutir. Veuillez réessayer.'}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => resetPaymentState()}
                    className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
                  >
                    Réessayer un autre moyen de paiement
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} {config.general.hotspotName} · Tous droits réservés</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Support WhatsApp : <strong className="text-emerald-400">{config.general.supportWhatsapp}</strong></span>
            <span>·</span>
            <span>Passerelle Orange & MTN</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
