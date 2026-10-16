import React from 'react';
import { WiFiProvider, useWiFi } from './context/WiFiContext';
import { ClientPortal } from './components/ClientPortal';
import { AdminHeader } from './components/admin/AdminHeader';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminPlans } from './components/admin/AdminPlans';
import { AdminVouchers } from './components/admin/AdminVouchers';
import { AdminClients } from './components/admin/AdminClients';
import { AdminTransactions } from './components/admin/AdminTransactions';
import { AdminRouterBinding } from './components/admin/AdminRouterBinding';
import { AdminMikrotikConfig } from './components/admin/AdminMikrotikConfig';
import { AdminGateways } from './components/admin/AdminGateways';

const MainView: React.FC = () => {
  const { viewMode, adminTab } = useWiFi();

  if (viewMode === 'portal') {
    return <ClientPortal />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <AdminHeader />

        <main className="flex-1 pb-16">
          {adminTab === 'dashboard' && <AdminDashboard />}
          {adminTab === 'plans' && <AdminPlans />}
          {adminTab === 'vouchers' && <AdminVouchers />}
          {adminTab === 'clients' && <AdminClients />}
          {adminTab === 'transactions' && <AdminTransactions />}
          {adminTab === 'binding' && <AdminRouterBinding />}
          {adminTab === 'mikrotik' && <AdminMikrotikConfig />}
          {adminTab === 'gateways' && <AdminGateways />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <WiFiProvider>
      <MainView />
    </WiFiProvider>
  );
}
