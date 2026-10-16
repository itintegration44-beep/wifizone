export type PaymentOperator = 'orange_money' | 'mtn_momo' | 'cash';

export interface Plan {
  id: string;
  name: string;
  price: number; // in FCFA
  durationMinutes: number;
  durationLabel: string;
  dataLimitMb: number | null; // null for unlimited
  dataLimitLabel: string;
  speedRateLimit: string; // e.g., "5M/2M" (download/upload)
  mikrotikProfile: string;
  description: string;
  popular?: boolean;
  isActive: boolean;
  simultaneousUsers: number;
}

export interface Transaction {
  id: string;
  reference: string;
  operatorRef: string;
  operator: PaymentOperator;
  phoneNumber: string;
  countryCode: string;
  amount: number; // in FCFA
  planId: string;
  planName: string;
  voucherCode: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  routerId: string;
  clientIp?: string;
  clientMac?: string;
  failureReason?: string;
}

export interface Voucher {
  id: string;
  code: string;
  pin: string;
  planId: string;
  planName: string;
  price: number;
  durationLabel: string;
  speedLimit: string;
  status: 'available' | 'active' | 'expired' | 'revoked';
  issuedType: 'online_payment' | 'manual_batch';
  createdAt: string;
  activatedAt?: string;
  expiresAt?: string;
  usedByPhone?: string;
  usedByMac?: string;
  routerId: string;
  dataUsedMb: number;
  dataTotalMb: number | null;
}

export interface ClientSession {
  id: string;
  macAddress: string;
  ipAddress: string;
  username: string; // voucher code
  phoneNumber?: string;
  planName: string;
  connectedAt: string;
  remainingSeconds: number;
  uptimeSeconds: number;
  bytesIn: number; // upload bytes
  bytesOut: number; // download bytes
  currentRateDownKbps: number;
  currentRateUpKbps: number;
  signalDbm: number;
  routerId: string;
  status: 'active' | 'idle' | 'disconnected';
}

export interface MikroTikRouter {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  apiPort: number;
  apiUser?: string;
  apiPassword?: string;
  rosVersion: string;
  model: string;
  status: 'online' | 'offline' | 'syncing';
  hotspotServer: string;
  hotspotInterface?: string;
  hotspotPool?: string;
  dnsName: string;
  portalUrl?: string;
  portalType?: 'external_redirect' | 'local_html_pack' | 'api_sync';
  pingLatencyMs?: number;
  lastPingStatus?: 'success' | 'timeout' | 'auth_failed';
  activeClientsCount: number;
  uptime: string;
  lastSync: string;
  cpuLoadPercent: number;
  memoryUsedPercent: number;
  walledGardenCount?: number;
}

export interface GatewayConfig {
  orangeMoney: {
    merchantId: string;
    apiKey: string;
    secretKey: string;
    tokenUrl: string;
    ussdCode: string; // e.g. "#150#" or "#144#"
    country: string;
    enabled: boolean;
  };
  mtnMomo: {
    subscriptionKey: string;
    apiUser: string;
    apiKey: string;
    targetEnv: 'sandbox' | 'live';
    ussdCode: string; // e.g. "*126#"
    country: string;
    enabled: boolean;
  };
  aggregator: {
    provider: 'direct' | 'cinetpay' | 'notchpay' | 'touchpay';
    siteId: string;
    apiKey: string;
    secretKey: string;
    enabled: boolean;
  };
  general: {
    hotspotName: string;
    supportPhone: string;
    supportWhatsapp: string;
    welcomeMessage: string;
    currency: string;
    defaultDns: string;
    walledGardenDomains: string[];
  };
}
