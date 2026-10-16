import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Plan,
  MikroTikRouter,
  Transaction,
  Voucher,
  ClientSession,
  GatewayConfig,
  PaymentOperator
} from '../types';
import {
  INITIAL_PLANS,
  INITIAL_ROUTERS,
  INITIAL_GATEWAY_CONFIG,
  INITIAL_TRANSACTIONS,
  INITIAL_VOUCHERS,
  INITIAL_CLIENT_SESSIONS
} from '../mockData/initialData';

interface PaymentSimulationState {
  isSimulating: boolean;
  step: 'idle' | 'push_sent' | 'processing' | 'success' | 'failed';
  countdown: number;
  currentTransaction: Transaction | null;
  generatedVoucher: Voucher | null;
  errorMessage?: string;
}

interface WiFiContextType {
  // App views
  viewMode: 'portal' | 'admin';
  setViewMode: (mode: 'portal' | 'admin') => void;
  adminTab: 'dashboard' | 'plans' | 'vouchers' | 'clients' | 'transactions' | 'binding' | 'mikrotik' | 'gateways';
  setAdminTab: (tab: 'dashboard' | 'plans' | 'vouchers' | 'clients' | 'transactions' | 'binding' | 'mikrotik' | 'gateways') => void;

  // Selected Router & Routers Management
  selectedRouterId: string;
  setSelectedRouterId: (id: string) => void;
  selectedRouter: MikroTikRouter;
  routers: MikroTikRouter[];
  addRouter: (router: Omit<MikroTikRouter, 'id'>) => void;
  updateRouter: (id: string, updates: Partial<MikroTikRouter>) => void;
  deleteRouter: (id: string) => void;
  testRouterConnection: (id: string) => Promise<{ success: boolean; latencyMs: number; message: string }>;
  syncRouterWithPortal: (id: string) => Promise<{ success: boolean; message: string; activeCount: number }>;

  // Data
  plans: Plan[];
  transactions: Transaction[];
  vouchers: Voucher[];
  clients: ClientSession[];
  config: GatewayConfig;

  // Plans Actions
  addPlan: (plan: Omit<Plan, 'id'>) => void;
  updatePlan: (id: string, updates: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  togglePlanActive: (id: string) => void;

  // Vouchers Actions
  generateBatchVouchers: (options: {
    planId: string;
    quantity: number;
    prefix: string;
    pinLength: number;
  }) => Voucher[];
  deleteVoucher: (id: string) => void;

  // Clients Actions
  disconnectClient: (sessionId: string) => void;
  addClientTime: (sessionId: string, additionalMinutes: number) => void;
  connectClientWithVoucher: (voucherCode: string, pin?: string) => { success: boolean; message: string; session?: ClientSession };

  // Payment Flow
  paymentState: PaymentSimulationState;
  initiatePayment: (params: {
    planId: string;
    operator: PaymentOperator;
    phoneNumber: string;
    countryCode?: string;
  }) => Promise<void>;
  confirmPaymentManually: () => void;
  cancelPayment: () => void;
  resetPaymentState: () => void;

  // Webhook Simulator
  simulateIncomingWebhook: (payload: {
    operator: PaymentOperator;
    phoneNumber: string;
    amount: number;
    planId: string;
    operatorRef: string;
    status: 'completed' | 'failed';
  }) => void;

  // Config Actions
  updateConfig: (updates: Partial<GatewayConfig>) => void;
}

const WiFiContext = createContext<WiFiContextType | undefined>(undefined);

export const WiFiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewMode] = useState<'portal' | 'admin'>('portal');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'plans' | 'vouchers' | 'clients' | 'transactions' | 'binding' | 'mikrotik' | 'gateways'>('dashboard');
  const [selectedRouterId, setSelectedRouterId] = useState<string>(INITIAL_ROUTERS[0].id);

  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [routers, setRouters] = useState<MikroTikRouter[]>(INITIAL_ROUTERS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [clients, setClients] = useState<ClientSession[]>(INITIAL_CLIENT_SESSIONS);
  const [config, setConfig] = useState<GatewayConfig>(INITIAL_GATEWAY_CONFIG);

  const [paymentState, setPaymentState] = useState<PaymentSimulationState>({
    isSimulating: false,
    step: 'idle',
    countdown: 90,
    currentTransaction: null,
    generatedVoucher: null,
  });

  const selectedRouter = routers.find(r => r.id === selectedRouterId) || routers[0];

  // Tick active sessions uptime and remaining time
  useEffect(() => {
    const interval = setInterval(() => {
      setClients(prev =>
        prev.map(c => {
          if (c.status !== 'active') return c;
          const remaining = Math.max(0, c.remainingSeconds - 1);
          return {
            ...c,
            remainingSeconds: remaining,
            uptimeSeconds: c.uptimeSeconds + 1,
            // slight dynamic variance in network rates
            currentRateDownKbps: Math.max(120, Math.floor(c.currentRateDownKbps + (Math.random() * 400 - 200))),
            status: remaining === 0 ? 'disconnected' : 'active'
          };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer countdown for USSD push during payment
  useEffect(() => {
    let timer: any;
    if (paymentState.isSimulating && paymentState.step === 'push_sent' && paymentState.countdown > 0) {
      timer = setTimeout(() => {
        setPaymentState(prev => ({
          ...prev,
          countdown: prev.countdown - 1
        }));
      }, 1000);
    } else if (paymentState.isSimulating && paymentState.step === 'push_sent' && paymentState.countdown === 0) {
      setPaymentState(prev => ({
        ...prev,
        step: 'failed',
        errorMessage: 'Délai d\'attente USSD expiré. Le client n\'a pas validé à temps.'
      }));
    }
    return () => clearTimeout(timer);
  }, [paymentState.isSimulating, paymentState.step, paymentState.countdown]);

  const addPlan = (newPlanData: Omit<Plan, 'id'>) => {
    const newPlan: Plan = {
      ...newPlanData,
      id: `plan_${Date.now()}`
    };
    setPlans(prev => [...prev, newPlan]);
  };

  const updatePlan = (id: string, updates: Partial<Plan>) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  const togglePlanActive = (id: string) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const generateBatchVouchers = (options: {
    planId: string;
    quantity: number;
    prefix: string;
    pinLength: number;
  }): Voucher[] => {
    const plan = plans.find(p => p.id === options.planId);
    if (!plan) return [];

    const newVouchers: Voucher[] = [];
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    for (let i = 0; i < options.quantity; i++) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const code = options.prefix ? `${options.prefix}-${randomNum}` : `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const pin = Math.floor(1000 + Math.random() * 9000).toString().substring(0, options.pinLength);

      newVouchers.push({
        id: `vch_${Date.now()}_${i}`,
        code,
        pin,
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        durationLabel: plan.durationLabel,
        speedLimit: plan.speedRateLimit,
        status: 'available',
        issuedType: 'manual_batch',
        createdAt: timestamp,
        routerId: selectedRouterId,
        dataUsedMb: 0,
        dataTotalMb: plan.dataLimitMb
      });
    }

    setVouchers(prev => [...newVouchers, ...prev]);
    return newVouchers;
  };

  const deleteVoucher = (id: string) => {
    setVouchers(prev => prev.filter(v => v.id !== id));
  };

  const disconnectClient = (sessionId: string) => {
    setClients(prev => prev.filter(c => c.id !== sessionId));
  };

  const addClientTime = (sessionId: string, additionalMinutes: number) => {
    setClients(prev =>
      prev.map(c =>
        c.id === sessionId
          ? { ...c, remainingSeconds: c.remainingSeconds + additionalMinutes * 60 }
          : c
      )
    );
  };

  const connectClientWithVoucher = (voucherCode: string, _pin?: string): { success: boolean; message: string; session?: ClientSession } => {
    const trimmedCode = voucherCode.trim();
    const voucher = vouchers.find(v => v.code.toLowerCase() === trimmedCode.toLowerCase());

    if (!voucher) {
      return { success: false, message: 'Code ticket invalide ou inexistant. Veuillez vérifier la saisie.' };
    }

    if (voucher.status === 'expired') {
      return { success: false, message: 'Ce ticket a déjà expiré.' };
    }

    if (voucher.status === 'revoked') {
      return { success: false, message: 'Ce ticket a été révoqué par l\'administrateur.' };
    }

    // Activate voucher if was available
    const plan = plans.find(p => p.id === voucher.planId);
    const durationSeconds = (plan?.durationMinutes || 60) * 60;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setVouchers(prev =>
      prev.map(v =>
        v.id === voucher.id
          ? {
              ...v,
              status: 'active',
              activatedAt: v.activatedAt || nowStr,
              expiresAt: new Date(Date.now() + durationSeconds * 1000).toISOString().replace('T', ' ').substring(0, 19)
            }
          : v
      )
    );

    // Create active session in MikroTik
    const randomIp = `10.5.50.${Math.floor(20 + Math.random() * 200)}`;
    const randomMac = `E8:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:2B:1A`;

    const newSession: ClientSession = {
      id: `sess_${Date.now()}`,
      macAddress: randomMac,
      ipAddress: randomIp,
      username: voucher.code,
      phoneNumber: voucher.usedByPhone,
      planName: voucher.planName,
      connectedAt: nowStr,
      remainingSeconds: durationSeconds,
      uptimeSeconds: 0,
      bytesIn: 10240,
      bytesOut: 45020,
      currentRateDownKbps: 2400,
      currentRateUpKbps: 520,
      signalDbm: -56,
      routerId: selectedRouterId,
      status: 'active'
    };

    setClients(prev => [newSession, ...prev]);

    return {
      success: true,
      message: `Connexion réussie au réseau Wi-Fi ! Bienvenue sur ${config.general.hotspotName}.`,
      session: newSession
    };
  };

  const initiatePayment = async (params: {
    planId: string;
    operator: PaymentOperator;
    phoneNumber: string;
    countryCode?: string;
  }) => {
    const plan = plans.find(p => p.id === params.planId);
    if (!plan) return;

    const opPrefix = params.operator === 'orange_money' ? 'OM' : params.operator === 'mtn_momo' ? 'MOMO' : 'CSH';
    const randomRef = `${opPrefix}-${params.countryCode || 'CM'}-${Math.floor(100000 + Math.random() * 900000)}`;
    const voucherCode = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newTxn: Transaction = {
      id: `TXN-${Date.now().toString().slice(-6)}`,
      reference: `REF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      operatorRef: randomRef,
      operator: params.operator,
      phoneNumber: params.phoneNumber,
      countryCode: params.countryCode || 'CM',
      amount: plan.price,
      planId: plan.id,
      planName: plan.name,
      voucherCode,
      status: 'processing',
      createdAt: now,
      routerId: selectedRouterId,
      clientIp: '10.5.50.77',
      clientMac: 'F0:99:B6:33:12:00'
    };

    const newVoucher: Voucher = {
      id: `vch_${Date.now()}`,
      code: voucherCode,
      pin,
      planId: plan.id,
      planName: plan.name,
      price: plan.price,
      durationLabel: plan.durationLabel,
      speedLimit: plan.speedRateLimit,
      status: 'available',
      issuedType: 'online_payment',
      createdAt: now,
      usedByPhone: params.phoneNumber,
      routerId: selectedRouterId,
      dataUsedMb: 0,
      dataTotalMb: plan.dataLimitMb
    };

    setPaymentState({
      isSimulating: true,
      step: 'push_sent',
      countdown: 90,
      currentTransaction: newTxn,
      generatedVoucher: newVoucher
    });

    // Add pending transaction to the list
    setTransactions(prev => [newTxn, ...prev]);
  };

  const confirmPaymentManually = () => {
    if (!paymentState.currentTransaction || !paymentState.generatedVoucher) return;

    const completedTxn: Transaction = {
      ...paymentState.currentTransaction,
      status: 'completed'
    };

    const readyVoucher: Voucher = {
      ...paymentState.generatedVoucher,
      status: 'available'
    };

    setTransactions(prev =>
      prev.map(t => t.id === completedTxn.id ? completedTxn : t)
    );

    setVouchers(prev => [readyVoucher, ...prev]);

    setPaymentState(prev => ({
      ...prev,
      step: 'success',
      currentTransaction: completedTxn,
      generatedVoucher: readyVoucher
    }));
  };

  const cancelPayment = () => {
    if (paymentState.currentTransaction) {
      const failedTxn: Transaction = {
        ...paymentState.currentTransaction,
        status: 'failed',
        failureReason: 'Paiement annulé par l\'utilisateur'
      };
      setTransactions(prev =>
        prev.map(t => t.id === failedTxn.id ? failedTxn : t)
      );
    }
    setPaymentState({
      isSimulating: false,
      step: 'idle',
      countdown: 90,
      currentTransaction: null,
      generatedVoucher: null
    });
  };

  const resetPaymentState = () => {
    setPaymentState({
      isSimulating: false,
      step: 'idle',
      countdown: 90,
      currentTransaction: null,
      generatedVoucher: null
    });
  };

  const simulateIncomingWebhook = (payload: {
    operator: PaymentOperator;
    phoneNumber: string;
    amount: number;
    planId: string;
    operatorRef: string;
    status: 'completed' | 'failed';
  }) => {
    const plan = plans.find(p => p.id === payload.planId);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const voucherCode = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTxn: Transaction = {
      id: `TXN-WH-${Date.now().toString().slice(-6)}`,
      reference: `REF-WEBHOOK-${Math.floor(1000 + Math.random() * 9000)}`,
      operatorRef: payload.operatorRef,
      operator: payload.operator,
      phoneNumber: payload.phoneNumber,
      countryCode: 'CM',
      amount: payload.amount,
      planId: payload.planId,
      planName: plan ? plan.name : 'Forfait Internet',
      voucherCode,
      status: payload.status,
      createdAt: now,
      routerId: selectedRouterId,
      failureReason: payload.status === 'failed' ? 'Solde insuffisant chez l\'opérateur' : undefined
    };

    setTransactions(prev => [newTxn, ...prev]);

    if (payload.status === 'completed' && plan) {
      const newVch: Voucher = {
        id: `vch_wh_${Date.now()}`,
        code: voucherCode,
        pin: Math.floor(1000 + Math.random() * 9000).toString(),
        planId: plan.id,
        planName: plan.name,
        price: payload.amount,
        durationLabel: plan.durationLabel,
        speedLimit: plan.speedRateLimit,
        status: 'available',
        issuedType: 'online_payment',
        createdAt: now,
        usedByPhone: payload.phoneNumber,
        routerId: selectedRouterId,
        dataUsedMb: 0,
        dataTotalMb: plan.dataLimitMb
      };
      setVouchers(prev => [newVch, ...prev]);
    }
  };

  const addRouter = (newRouterData: Omit<MikroTikRouter, 'id'>) => {
    const newRouter: MikroTikRouter = {
      ...newRouterData,
      id: `rb_${Date.now()}`
    };
    setRouters(prev => [...prev, newRouter]);
    setSelectedRouterId(newRouter.id);
  };

  const updateRouter = (id: string, updates: Partial<MikroTikRouter>) => {
    setRouters(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRouter = (id: string) => {
    setRouters(prev => {
      const remaining = prev.filter(r => r.id !== id);
      if (selectedRouterId === id && remaining.length > 0) {
        setSelectedRouterId(remaining[0].id);
      }
      return remaining;
    });
  };

  const testRouterConnection = async (id: string): Promise<{ success: boolean; latencyMs: number; message: string }> => {
    const targetRouter = routers.find(r => r.id === id);
    if (!targetRouter) {
      return { success: false, latencyMs: 0, message: 'Routeur introuvable.' };
    }

    await new Promise(res => setTimeout(res, 750));
    const simulatedLatency = Math.floor(9 + Math.random() * 12);

    setRouters(prev => prev.map(r => r.id === id ? {
      ...r,
      status: 'online',
      pingLatencyMs: simulatedLatency,
      lastPingStatus: 'success',
      lastSync: 'À l\'instant'
    } : r));

    return {
      success: true,
      latencyMs: simulatedLatency,
      message: `Connexion active ! Handshake API RouterOS (${targetRouter.rosVersion}) réussi sur port ${targetRouter.apiPort}.`
    };
  };

  const syncRouterWithPortal = async (id: string): Promise<{ success: boolean; message: string; activeCount: number }> => {
    await new Promise(res => setTimeout(res, 900));
    const activeCount = clients.filter(c => c.routerId === id && c.status === 'active').length;

    setRouters(prev => prev.map(r => r.id === id ? {
      ...r,
      lastSync: 'À l\'instant',
      status: 'online'
    } : r));

    return {
      success: true,
      message: `Synchronisation du portail réussie avec ${id}. ${activeCount} sessions actives et ${vouchers.length} tickets vérifiés.`,
      activeCount
    };
  };

  const updateConfig = (updates: Partial<GatewayConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...updates,
      general: { ...prev.general, ...(updates.general || {}) },
      orangeMoney: { ...prev.orangeMoney, ...(updates.orangeMoney || {}) },
      mtnMomo: { ...prev.mtnMomo, ...(updates.mtnMomo || {}) },
      aggregator: { ...prev.aggregator, ...(updates.aggregator || {}) }
    }));
  };

  return (
    <WiFiContext.Provider
      value={{
        viewMode,
        setViewMode,
        adminTab,
        setAdminTab,
        selectedRouterId,
        setSelectedRouterId,
        selectedRouter,
        plans,
        routers,
        transactions,
        vouchers,
        clients,
        config,
        addPlan,
        updatePlan,
        deletePlan,
        togglePlanActive,
        generateBatchVouchers,
        deleteVoucher,
        disconnectClient,
        addClientTime,
        connectClientWithVoucher,
        addRouter,
        updateRouter,
        deleteRouter,
        testRouterConnection,
        syncRouterWithPortal,
        paymentState,
        initiatePayment,
        confirmPaymentManually,
        cancelPayment,
        resetPaymentState,
        simulateIncomingWebhook,
        updateConfig
      }}
    >
      {children}
    </WiFiContext.Provider>
  );
};

export const useWiFi = () => {
  const context = useContext(WiFiContext);
  if (!context) {
    throw new Error('useWiFi must be used within a WiFiProvider');
  }
  return context;
};
