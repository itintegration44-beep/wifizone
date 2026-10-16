import { Plan, GatewayConfig, MikroTikRouter } from '../types';

export function generateProfilesScript(plans: Plan[]): string {
  let script = `# ========================================================\n`;
  script += `# PROCURATION PROFILS UTILISATEURS MIKROTIK (HOTSPOT)\n`;
  script += `# Généré pour MikroTik RouterOS v6.x / v7.x\n`;
  script += `# ========================================================\n\n`;

  plans.forEach(plan => {
    const rateLimit = plan.speedRateLimit; // e.g. "5M/2M"
    const sessionTimeout = formatSecondsForRouterOs(plan.durationMinutes * 60);
    const sharedUsers = plan.simultaneousUsers || 1;

    script += `# Profil: ${plan.name} (${plan.price} FCFA)\n`;
    script += `/ip hotspot user profile add name="${plan.mikrotikProfile}" \\\n`;
    script += `    rate-limit="${rateLimit}" \\\n`;
    script += `    shared-users=${sharedUsers} \\\n`;
    script += `    session-timeout=${sessionTimeout} \\\n`;
    script += `    keepalive-timeout=2m \\\n`;
    script += `    status-autorefresh=1m\n\n`;
  });

  return script;
}

export function generateWalledGardenScript(config: GatewayConfig): string {
  let script = `# ========================================================\n`;
  script += `# REGLES WALLED-GARDEN POUR ORANGE MONEY & MTN MOMO\n`;
  script += `# Permet aux clients non connectés d'accéder aux passerelles de paiement\n`;
  script += `# sans être bloqués par le portail captif MikroTik\n`;
  script += `# ========================================================\n\n`;

  const domains = [
    // Orange Money
    '*.orange.com',
    '*.orange.cm',
    '*.orange.ci',
    '*.orange-money.com',
    'api.orange.com',
    'webpay.orange-money.com',
    // MTN Mobile Money
    '*.mtn.com',
    '*.mtn.cm',
    '*.mtn.ci',
    'sandbox.momodeveloper.mtn.com',
    'proxy.momoapi.mtn.com',
    // Agrégateurs courants
    '*.cinetpay.com',
    'api-checkout.cinetpay.com',
    '*.notchpay.co',
    'api.notchpay.co',
    '*.touchpay.ci',
    // Domaines personnalisés configurés
    ...config.general.walledGardenDomains
  ];

  const uniqueDomains = Array.from(new Set(domains.filter(Boolean)));

  uniqueDomains.forEach(domain => {
    script += `/ip hotspot walled-garden add dst-host="${domain}" action=allow comment="Mobile Money & Payment API"\n`;
  });

  script += `\n# Autoriser également les requêtes HTTPS de résolution DNS nécessaires\n`;
  script += `/ip hotspot walled-garden ip add dst-port=443 protocol=tcp action=accept comment="Allow HTTPS SSL Handshakes"\n`;

  return script;
}

export function generateHotspotSetupScript(router: MikroTikRouter, config: GatewayConfig): string {
  return `# ========================================================
# SCRIPT DE CONFIGURATION COMPLETE HOTSPOT MIKROTIK
# Routeur: ${router.name} (${router.model})
# DNS Hotspot: ${router.dnsName}
# ========================================================

# 1. Configuration du Pool IP Hotspot
/ip pool add name=hs-pool-wifi ranges=10.5.50.10-10.5.50.250

# 2. Configuration DHCP Server pour les clients WiFi
/ip dhcp-server add name=dhcp-hotspot address-pool=hs-pool-wifi interface=bridge-hotspot disabled=no lease-time=1h
/ip dhcp-server network add address=10.5.50.0/24 gateway=10.5.50.1 dns-server=10.5.50.1,8.8.8.8,1.1.1.1

# 3. Profil du Serveur Hotspot avec redirection DNS
/ip hotspot profile add name=hsprof-wifizone \\
    hotspot-address=10.5.50.1 \\
    dns-name="${router.dnsName}" \\
    html-directory=hotspot \\
    login-by=http-pap,http-chap,cookie \\
    http-cookie-lifetime=1d

# 4. Activation de l'instance Hotspot
/ip hotspot add name=${router.hotspotServer} \\
    interface=bridge-hotspot \\
    address-pool=hs-pool-wifi \\
    profile=hsprof-wifizone \\
    disabled=no

# 5. Utilisateur administrateur local de secours
/ip hotspot user add name=admin-zone password="WIFI_${Math.floor(1000 + Math.random() * 9000)}" profile=default comment="Admin WiFiZone"

# 6. Activation de l'API RouterOS pour synchronisation automatique
/ip service set api port=${router.apiPort} disabled=no address=0.0.0.0/0
/ip service set api-ssl port=8729 disabled=yes

:put "Configuration WiFiZone MikroTik installée avec succès !"
`;
}

export function generateCaptivePortalHtml(config: GatewayConfig, router: MikroTikRouter): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${config.general.hotspotName} - Connexion Internet</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background: #090d16; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }
        .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; max-width: 420px; width: 100%; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
        .header { text-align: center; margin-bottom: 24px; }
        .wifi-icon { width: 48px; height: 48px; background: #2563eb; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px; }
        h1 { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        p.sub { font-size: 13px; color: #94a3b8; }
        .btn-momo { display: block; width: 100%; padding: 14px; background: linear-gradient(135deg, #f97316 0%, #eab308 100%); color: #000; font-weight: 700; font-size: 14px; text-align: center; text-decoration: none; border-radius: 10px; margin-bottom: 20px; }
        .divider { display: flex; align-items: center; text-align: center; margin: 18px 0; color: #64748b; font-size: 12px; }
        .divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1px solid #1e293b; }
        .divider span { padding: 0 10px; }
        .input-group { margin-bottom: 14px; text-align: left; }
        label { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 6px; }
        input[type="text"], input[type="password"] { width: 100%; padding: 12px; background: #090d16; border: 1px solid #334155; border-radius: 8px; color: #fff; font-size: 15px; outline: none; }
        input:focus { border-color: #3b82f6; }
        .btn-submit { width: 100%; padding: 12px; background: #2563eb; border: none; border-radius: 8px; color: #fff; font-weight: 600; font-size: 14px; cursor: pointer; }
        .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #64748b; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div class="wifi-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
            </div>
            <h1>${config.general.hotspotName}</h1>
            <p class="sub">Accès Internet Haut Débit & Stable</p>
        </div>

        <!-- Bouton Achat Forfait Mobile Money -->
        <a href="https://${router.dnsName}/buy" class="btn-momo">
            ⚡ Acheter un Forfait (Orange / MTN Money)
        </a>

        <div class="divider">
            <span>OU CONNECTEZ VOTRE TICKET</span>
        </div>

        <!-- Formulaire Standard MikroTik Hotspot Login -->
        <form name="sendin" action="$(link-login-only)" method="post">
            <input type="hidden" name="dst" value="$(link-orig)" />
            <input type="hidden" name="popup" value="true" />

            <div class="input-group">
                <label for="username">Code Ticket / Identifiant</label>
                <input type="text" id="username" name="username" placeholder="Ex: 849201" value="$(username)" required autocomplete="off" autocorrect="off" autocapitalize="none">
            </div>

            <div class="input-group">
                <label for="password">Code PIN (si demandé)</label>
                <input type="password" id="password" name="password" placeholder="PIN ou vide">
            </div>

            <button type="submit" class="btn-submit">Se Connecter à Internet</button>
        </form>

        <div class="footer">
            Service Client WhatsApp : ${config.general.supportWhatsapp}<br>
            Zone gérée par MikroTik RouterOS
        </div>
    </div>
</body>
</html>`;
}

export function generateExternalPortalRedirectHtml(portalUrl: string, config: GatewayConfig, router: MikroTikRouter): string {
  const cleanPortalUrl = portalUrl.endsWith('/') ? portalUrl.slice(0, -1) : portalUrl;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="pragma" content="no-cache">
    <meta http-equiv="expires" content="-1">
    <title>Redirection vers ${config.general.hotspotName}...</title>
    <!-- Redirection automatique instantanée vers le portail captif cloud -->
    <meta http-equiv="refresh" content="0; url=${cleanPortalUrl}?res=notyet&mac=$(mac)&ip=$(ip)&username=$(username)&link-login=$(link-login)&link-orig=$(link-orig)&error=$(error)&router=${encodeURIComponent(router.name)}">
    <script type="text/javascript">
        var portalEndpoint = "${cleanPortalUrl}";
        var targetParams = "?res=notyet" +
            "&mac=" + encodeURIComponent("$(mac)") +
            "&ip=" + encodeURIComponent("$(ip)") +
            "&username=" + encodeURIComponent("$(username)") +
            "&link-login=" + encodeURIComponent("$(link-login)") +
            "&link-orig=" + encodeURIComponent("$(link-orig)") +
            "&error=" + encodeURIComponent("$(error)") +
            "&router=" + encodeURIComponent("${router.name}");
        window.location.replace(portalEndpoint + targetParams);
    </script>
    <style>
        body { background: #090d16; color: #f1f5f9; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
        .box { background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 24px; max-width: 400px; }
        .spinner { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #f59e0b; border-radius: 50%; width: 36px; height: 36px; animation: spin 1s linear infinite; margin: 0 auto 16px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        a { color: #f59e0b; font-weight: bold; text-decoration: none; }
    </style>
</head>
<body>
    <div class="box">
        <div class="spinner"></div>
        <h2 style="font-size: 18px; margin-bottom: 8px;">${config.general.hotspotName}</h2>
        <p style="font-size: 13px; color: #94a3b8; margin-bottom: 16px;">
            Redirection automatique vers le portail de paiement Mobile Money et de connexion Wi-Fi...
        </p>
        <p style="font-size: 11px; color: #64748b;">
            Si la page ne charge pas automatiquement, <a href="${cleanPortalUrl}">cliquez ici</a>.
        </p>
    </div>
</body>
</html>`;
}

export function generateDirectPortalBindingScript(router: MikroTikRouter, portalUrl: string, config: GatewayConfig): string {
  let portalDomain = 'run.app';
  try {
    const urlObj = new URL(portalUrl);
    portalDomain = urlObj.hostname;
  } catch (e) {
    portalDomain = portalUrl.replace(/https?:\/\//, '').split('/')[0];
  }

  const apiUser = router.apiUser || 'api-wifizone';
  const apiPass = router.apiPassword || 'MikroTik@Akwa2026!';

  return `# ========================================================
# SCRIPT DE LIAISON ROUTEUR MIKROTIK <-> PORTAIL CAPTIF
# Routeur Cible : ${router.name} (${router.model})
# Adresse IP Routeur : ${router.ipAddress}
# URL Portail Captif : ${portalUrl}
# Domaine Portail : ${portalDomain}
# ========================================================

:put "--- 1. CONFIGURATION DU WALLED-GARDEN POUR LE PORTAIL ---"
# Autoriser le domaine de la plateforme captif sans blocage
/ip hotspot walled-garden add dst-host="${portalDomain}" action=allow comment="Domaine Portail Captif Cloud"
/ip hotspot walled-garden add dst-host="*.${portalDomain}" action=allow comment="Sous-domaines Portail Captif"
/ip hotspot walled-garden add dst-host="*.run.app" action=allow comment="Domaine Cloud Run Google"
/ip hotspot walled-garden add dst-host="fonts.googleapis.com" action=allow comment="Polices Web"
/ip hotspot walled-garden add dst-host="fonts.gstatic.com" action=allow comment="Polices Web Assets"

:put "--- 2. AUTORISATION DES PASSERELLES MOBILE MONEY ---"
/ip hotspot walled-garden add dst-host="*.orange.com" action=allow comment="Orange Money API"
/ip hotspot walled-garden add dst-host="*.orange-money.com" action=allow comment="Orange WebPay"
/ip hotspot walled-garden add dst-host="*.mtn.com" action=allow comment="MTN MoMo API"
/ip hotspot walled-garden add dst-host="proxy.momoapi.mtn.com" action=allow comment="MTN MoMo Proxy"
/ip hotspot walled-garden add dst-host="*.cinetpay.com" action=allow comment="CinetPay Checkout"
/ip hotspot walled-garden add dst-host="*.notchpay.co" action=allow comment="NotchPay API"

:put "--- 3. CONFIGURATION DU PROFIL SERVEUR HOTSPOT ---"
# Configuration des méthodes d'authentification HTTP PAP/CHAP et redirection
/ip hotspot profile set [find name=hsprof-wifizone] \\
    hotspot-address=${router.ipAddress} \\
    dns-name="${router.dnsName}" \\
    html-directory=hotspot \\
    login-by=http-pap,http-chap,cookie \\
    http-cookie-lifetime=1d

# Définition du nom DNS local pour résolution transparente
/ip dns static add name="${router.dnsName}" address=${router.ipAddress} comment="DNS Hotspot Local"

:put "--- 4. CONFIGURATION DU COMPTE API ROUTEROS ---"
# Création du groupe de sécurité avec droits adaptés
/user group add name=wifizone-api policy=read,write,test,api comment="Groupe API Gestionnaire WiFiZone"
# Création de l'utilisateur API utilisé par la plateforme
/user add name="${apiUser}" password="${apiPass}" group=wifizone-api comment="Compte API Portail Captif"

# Activation du service API RouterOS standard sur le port ${router.apiPort}
/ip service set api port=${router.apiPort} disabled=no address=0.0.0.0/0 comment="API RouterOS WiFiZone"

:put "--- 5. STATUT ET VERIFICATION ---"
:put "Liaison au portail ${config.general.hotspotName} terminee avec succes !"
:put "Testez la redirection en vous connectant au WiFi avec un smartphone."
`;
}

function formatSecondsForRouterOs(seconds: number): string {
  if (seconds >= 86400) {
    const days = Math.floor(seconds / 86400);
    return `${days}d`;
  }
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h`;
  }
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m`;
}

