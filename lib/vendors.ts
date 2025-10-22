import { Cloud, Zap, CloudCog, Gauge, LucideIcon } from "lucide-react";

export type VendorKey = "cloudflare" | "akamai" | "aws_cloudfront" | "fastly";

export type IntegrationOptionKey =
  | "worker_to_our_worker"
  | "dns_change"
  | "rules_page"
  | "tunnel"
  | "other_options";

export interface VendorOptionField {
  key: string;
  label: string;
  type: "text" | "select" | "checkbox" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  help?: string;
}

export interface TemplateContext {
  clientName: string;
  env: string;
  vendor: VendorKey;
  inputs: Record<string, any>;
}

export interface VendorOptionTemplate {
  option: IntegrationOptionKey;
  title: string;
  description: string;
  guideTemplate: (ctx: TemplateContext) => string;
  artifacts: Array<
    | { type: "file"; path: string; contents: (ctx: TemplateContext) => string }
    | { type: "command"; label: string; cmd: (ctx: TemplateContext) => string }
  >;
  fields: VendorOptionField[];
}

export interface VendorSpec {
  key: VendorKey;
  name: string;
  summary: string;
  prerequisites: string[];
  introTemplate: (ctx: TemplateContext) => string;
  options: VendorOptionTemplate[];
}

// ==================== CLOUDFLARE ====================

const cloudflareOptions: VendorOptionTemplate[] = [
  {
    option: "worker_to_our_worker",
    title: "Worker → BioCatch Edge",
    description: "Deploy a Cloudflare Worker that forwards requests to BioCatch edge worker",
    fields: [
      {
        key: "ourWorkerUrl",
        label: "BioCatch Edge Worker URL",
        type: "text",
        placeholder: "https://biocatch-edge.example.com",
        required: true,
        help: "The URL of the BioCatch edge worker endpoint",
      },
      {
        key: "routePattern",
        label: "Route Pattern",
        type: "text",
        placeholder: "example.com/*",
        required: true,
        help: "The route pattern to match (e.g., example.com/* or *.example.com/*)",
      },
      {
        key: "accountId",
        label: "Cloudflare Account ID",
        type: "text",
        placeholder: "abc123...",
        required: true,
        help: "Your Cloudflare account ID",
      },
    ],
    guideTemplate: (ctx) => `
## Worker Forwarder Setup

### Overview
Deploy a Cloudflare Worker that acts as a reverse proxy, forwarding all matching requests to BioCatch edge worker at \`${ctx.inputs.worker_to_our_worker?.ourWorkerUrl || "[BIOCATCH_EDGE_URL]"}\`.

### Steps

**1. Create Worker in Cloudflare Dashboard (UI)**

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** in the left sidebar
3. Click **Create Application**
4. Select **Create Worker**
5. Name your worker: \`${ctx.clientName}-edge-forwarder\`
6. Click **Deploy** to create the basic worker

**2. Configure Worker Code (UI)**

1. After deployment, click **Quick Edit** to open the editor
2. Replace the default code with the worker code from the artifacts section below
3. Click **Save and Deploy**

**3. Add Environment Variables (UI)**

1. In your worker overview, go to **Settings** tab
2. Scroll to **Variables** section
3. Click **Add Variable**
4. Add: 
   - Variable name: \`BIOCATCH_EDGE_URL\`
   - Value: \`${ctx.inputs.worker_to_our_worker?.ourWorkerUrl || "https://biocatch-edge.example.com"}\`
5. Click **Save**

**4. Configure Routes (UI)**

1. In your worker overview, go to **Triggers** tab
2. Under **Routes**, click **Add Route**
3. Enter route: \`${ctx.inputs.worker_to_our_worker?.routePattern || "example.com/*"}\`
4. Select your zone from dropdown
5. Click **Add Route**

**5. Alternative: Deploy via CLI**

If you prefer command line:

\`\`\`bash
mkdir ${ctx.clientName}-edge-forwarder
cd ${ctx.clientName}-edge-forwarder
npm init -y
npm install -D wrangler
# Create wrangler.toml and src/forwarder.ts from artifacts below
npx wrangler deploy
\`\`\`

**6. Verify Integration (UI)**

1. Go to your worker **Logs** tab in Cloudflare dashboard
2. Click **Begin log stream**
3. Test with: \`curl -I https://${ctx.inputs.worker_to_our_worker?.routePattern?.replace("/*", "") || "your-domain.com"}/test\`
4. Watch logs to see requests being forwarded
5. Verify BioCatch receives the requests

### Troubleshooting

- **Worker not receiving requests**: Check that the route pattern matches your domain and is properly configured in the Cloudflare dashboard.
- **CORS errors**: Ensure BioCatch edge worker is configured to accept requests from your origin.
- **SSL errors**: Verify SSL/TLS settings in Cloudflare are set to "Full" or "Full (strict)".
`,
    artifacts: [
      {
        type: "file",
        path: "wrangler.toml",
        contents: (ctx) => `name = "${ctx.clientName}-edge-forwarder"
main = "src/forwarder.ts"
compatibility_date = "2025-10-01"
account_id = "${ctx.inputs.worker_to_our_worker?.accountId || "YOUR_ACCOUNT_ID"}"
routes = ["${ctx.inputs.worker_to_our_worker?.routePattern || "example.com/*"}"]

[vars]
BIOCATCH_EDGE_URL = "${ctx.inputs.worker_to_our_worker?.ourWorkerUrl || "https://biocatch-edge.example.com"}"
`,
      },
      {
        type: "file",
        path: "src/forwarder.ts",
        contents: (ctx) => `export interface Env {
  BIOCATCH_EDGE_URL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const upstream = new URL(env.BIOCATCH_EDGE_URL);
      upstream.pathname = url.pathname;
      upstream.search = url.search;

      // Forward the request to BioCatch edge worker
      const upstreamRequest = new Request(upstream.toString(), {
        method: request.method,
        headers: request.headers,
        body: ["GET", "HEAD"].includes(request.method)
          ? undefined
          : await request.arrayBuffer(),
      });

      const response = await fetch(upstreamRequest);
      return response;
    } catch (error) {
      return new Response("Error forwarding request: " + (error as Error).message, {
        status: 500,
      });
    }
  },
};
`,
      },
      {
        type: "command",
        label: "Deploy Worker",
        cmd: () => `npx wrangler deploy`,
      },
      {
        type: "command",
        label: "View Logs",
        cmd: () => `npx wrangler tail`,
      },
    ],
  },
  {
    option: "dns_change",
    title: "DNS Change",
    description: "Configure DNS settings to route traffic through Cloudflare",
    fields: [
      {
        key: "apexDomain",
        label: "Apex Domain",
        type: "text",
        placeholder: "example.com",
        required: true,
      },
      {
        key: "subdomain",
        label: "Subdomain (optional)",
        type: "text",
        placeholder: "www or leave empty",
      },
      {
        key: "targetCNAME",
        label: "Target CNAME",
        type: "text",
        placeholder: "target.cloudflare.net",
        help: "The CNAME target (leave empty if using Cloudflare directly)",
      },
    ],
    guideTemplate: (ctx) => {
      const fullDomain = ctx.inputs.dns_change?.subdomain
        ? `${ctx.inputs.dns_change.subdomain}.${ctx.inputs.dns_change?.apexDomain}`
        : ctx.inputs.dns_change?.apexDomain;
      return `
## DNS Configuration

### Overview
Configure DNS to route traffic for \`${fullDomain || "your-domain.com"}\` through Cloudflare.

### Steps

**1. Add Domain to Cloudflare (UI)**

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Add a Site** button (top right)
3. Enter domain: \`${ctx.inputs.dns_change?.apexDomain || "example.com"}\`
4. Select plan tier (Free is fine for most use cases)
5. Click **Continue**
6. Cloudflare will scan existing DNS records

**2. Review and Import DNS Records (UI)**

1. Review the auto-detected DNS records
2. Ensure all important records are included
3. Click **Continue** to proceed

**3. Update Nameservers at Registrar**

1. Cloudflare will show you 2 nameservers (e.g., \`ns1.cloudflare.com\`, \`ns2.cloudflare.com\`)
2. Copy these nameserver addresses
3. Log in to your domain registrar (GoDaddy, Namecheap, etc.)
4. Find **DNS Settings** or **Nameserver Settings**
5. Replace existing nameservers with Cloudflare's nameservers
6. Save changes at registrar
7. Return to Cloudflare and click **Done, check nameservers**

**4. Configure DNS Record (UI)**

${
  ctx.inputs.dns_change?.targetCNAME
    ? `1. In Cloudflare dashboard, click **DNS** in left sidebar
2. Click **Add Record**
3. Configure:
   - **Type**: CNAME
   - **Name**: \`${ctx.inputs.dns_change?.subdomain || "@"}\`
   - **Target**: \`${ctx.inputs.dns_change.targetCNAME}\`
   - **Proxy status**: Click orange cloud to enable (Proxied)
   - **TTL**: Auto
4. Click **Save**`
    : `1. In Cloudflare dashboard, click **DNS** in left sidebar
2. Configure A/AAAA records as needed
3. Enable Proxy (orange cloud) for records that should go through Cloudflare`
}

**5. Configure SSL/TLS (UI)**

1. In Cloudflare dashboard, click **SSL/TLS** in left sidebar
2. Under **Overview**, set mode to **Full** or **Full (strict)**
3. Click **Edge Certificates** tab
4. Enable **Always Use HTTPS**
5. Enable **Automatic HTTPS Rewrites**

**6. Verify DNS Propagation (UI)**

1. In Cloudflare dashboard, go to **DNS** tab
2. You'll see a warning if nameservers aren't updated
3. Once verified, you'll see "Active" status
4. Test with: \`dig ${fullDomain || "your-domain.com"}\`
5. Test HTTPS: \`curl -I https://${fullDomain || "your-domain.com"}\`

### Notes

- DNS propagation can take up to 24-48 hours globally
- Enable DNSSEC if your registrar supports it
- Consider enabling Universal SSL for automatic certificate management
`;
    },
    artifacts: [],
  },
  {
    option: "rules_page",
    title: "Rules Page",
    description: "Configure Page Rules, Transform Rules, or Cache Rules",
    fields: [
      {
        key: "pathPattern",
        label: "URL Match Pattern",
        type: "text",
        placeholder: "example.com/api/*",
        required: true,
      },
      {
        key: "cacheBypass",
        label: "Bypass Cache",
        type: "checkbox",
        help: "Bypass cache for matched requests",
      },
      {
        key: "securityLevel",
        label: "Security Level",
        type: "select",
        options: [
          { label: "Off", value: "off" },
          { label: "Essentially Off", value: "essentially_off" },
          { label: "Low", value: "low" },
          { label: "Medium", value: "medium" },
          { label: "High", value: "high" },
          { label: "Under Attack", value: "under_attack" },
        ],
      },
    ],
    guideTemplate: (ctx) => `
## Page Rules / Transform Rules

### Overview
Configure rules to control caching, security, and request handling for \`${ctx.inputs.rules_page?.pathPattern || "your-pattern"}\`.

### Steps

**1. Navigate to Rules (UI)**

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your zone/domain
3. In the left sidebar, click **Rules**
4. Choose **Page Rules** (or **Transform Rules** for more advanced options)

**2. Create New Page Rule (UI)**

1. Click **Create Page Rule** button
2. Configure the rule:
   - **If the URL matches**: Enter \`${ctx.inputs.rules_page?.pathPattern || "example.com/api/*"}\`
   - **Then the settings are**:
${
  ctx.inputs.rules_page?.cacheBypass
    ? `     - Click **Add a Setting**
     - Select **Cache Level**
     - Choose **Bypass**`
    : `     - Click **Add a Setting**
     - Select **Cache Level**
     - Choose your preferred caching option`
}
${
  ctx.inputs.rules_page?.securityLevel
    ? `     - Click **Add a Setting**
     - Select **Security Level**
     - Choose **${ctx.inputs.rules_page.securityLevel}**`
    : ""
}
3. Click **Save and Deploy**

**3. Additional Settings (Optional)**

Consider these additional settings:
- **Browser Cache TTL**: Control client-side caching
- **Edge Cache TTL**: Control Cloudflare cache duration
- **Always Online**: Enable offline page caching
- **Origin Cache Control**: Respect origin cache headers

**4. Save and Deploy**

Click **Save and Deploy**. Changes take effect within seconds.

**5. Verify**

\`\`\`bash
curl -I https://${ctx.inputs.rules_page?.pathPattern?.split("/")[0] || "example.com"}/test
# Check cache headers (CF-Cache-Status, etc.)
\`\`\`

### Examples

**Bypass cache for API endpoints:**
- URL: \`*.example.com/api/*\`
- Cache Level: Bypass

**Force HTTPS:**
- URL: \`*.example.com/*\`
- Always Use HTTPS: On

**Increase security for admin:**
- URL: \`example.com/admin/*\`
- Security Level: High
`,
    artifacts: [
      {
        type: "command",
        label: "Test Cache Status",
        cmd: (ctx) =>
          `curl -I https://${ctx.inputs.rules_page?.pathPattern?.split("/")[0] || "example.com"}/test | grep -i cf-cache`,
      },
    ],
  },
  {
    option: "tunnel",
    title: "Cloudflare Tunnel",
    description: "Set up Cloudflare Tunnel for secure origin connectivity without exposing public IPs",
    fields: [
      {
        key: "tunnelName",
        label: "Tunnel Name",
        type: "text",
        placeholder: "biocatch-tunnel",
        required: true,
        help: "A unique name for your Cloudflare Tunnel",
      },
      {
        key: "originUrl",
        label: "Origin URL",
        type: "text",
        placeholder: "http://localhost:8080",
        required: true,
        help: "Your internal origin server URL",
      },
      {
        key: "hostname",
        label: "Public Hostname",
        type: "text",
        placeholder: "app.example.com",
        required: true,
        help: "The public hostname for accessing your service",
      },
    ],
    guideTemplate: (ctx) => `
## Cloudflare Tunnel Setup

### Overview
Create a secure tunnel from Cloudflare to your origin server at \`${ctx.inputs.tunnel?.originUrl || "http://localhost:8080"}\` without exposing a public IP address.

### Steps

**1. Install Cloudflared (UI)**

1. Download cloudflared from [Cloudflare Downloads](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)
2. Or install via package manager:

\`\`\`bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# Linux
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Windows - Download from GitHub releases
\`\`\`

**2. Authenticate Cloudflared**

\`\`\`bash
cloudflared tunnel login
\`\`\`

This opens your browser to authenticate with Cloudflare.

**3. Create Tunnel (UI)**

1. Log in to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com)
2. Navigate to **Access** → **Tunnels**
3. Click **Create a tunnel**
4. Select **Cloudflared**
5. Name your tunnel: \`${ctx.inputs.tunnel?.tunnelName || "biocatch-tunnel"}\`
6. Click **Save tunnel**

Or via CLI:

\`\`\`bash
cloudflared tunnel create ${ctx.inputs.tunnel?.tunnelName || "biocatch-tunnel"}
\`\`\`

**4. Configure Tunnel Route (UI)**

1. In the tunnel overview, go to **Public Hostname** tab
2. Click **Add a public hostname**
3. Configure:
   - **Subdomain**: Enter subdomain from \`${ctx.inputs.tunnel?.hostname || "app.example.com"}\`
   - **Domain**: Select your domain
   - **Path**: Leave empty (or specify if needed)
   - **Service**:
     - **Type**: HTTP
     - **URL**: \`${ctx.inputs.tunnel?.originUrl || "http://localhost:8080"}\`
4. Click **Save hostname**

**5. Run Tunnel**

Get tunnel ID from dashboard or use:

\`\`\`bash
cloudflared tunnel list
\`\`\`

Run the tunnel:

\`\`\`bash
cloudflared tunnel run ${ctx.inputs.tunnel?.tunnelName || "biocatch-tunnel"}
\`\`\`

Or create a config file (\`~/.cloudflared/config.yml\`):

\`\`\`yaml
tunnel: ${ctx.inputs.tunnel?.tunnelName || "biocatch-tunnel"}
credentials-file: /path/to/credentials.json

ingress:
  - hostname: ${ctx.inputs.tunnel?.hostname || "app.example.com"}
    service: ${ctx.inputs.tunnel?.originUrl || "http://localhost:8080"}
  - service: http_status:404
\`\`\`

Then run:

\`\`\`bash
cloudflared tunnel run
\`\`\`

**6. Install as Service (Optional)**

To run tunnel as a background service:

\`\`\`bash
# Install service
sudo cloudflared service install

# Start service
sudo systemctl start cloudflared

# Enable on boot
sudo systemctl enable cloudflared
\`\`\`

**7. Verify Tunnel (UI)**

1. In Cloudflare Zero Trust dashboard, go to **Access** → **Tunnels**
2. Your tunnel should show as **Healthy** with green status
3. Test access: \`https://${ctx.inputs.tunnel?.hostname || "app.example.com"}\`
4. Check **Traffic** tab to see requests flowing through

### Troubleshooting

- **Tunnel offline**: Check cloudflared is running and credentials are correct
- **404 errors**: Verify origin URL is correct and service is running
- **DNS not resolving**: Wait a few minutes for DNS propagation
- **SSL errors**: Cloudflare automatically provisions SSL certificates
`,
    artifacts: [
      {
        type: "file",
        path: "config.yml",
        contents: (ctx) => `# Cloudflare Tunnel Configuration
tunnel: ${ctx.inputs.tunnel?.tunnelName || "biocatch-tunnel"}
credentials-file: /root/.cloudflared/${ctx.inputs.tunnel?.tunnelName || "biocatch-tunnel"}.json

ingress:
  # Route for ${ctx.inputs.tunnel?.hostname || "app.example.com"}
  - hostname: ${ctx.inputs.tunnel?.hostname || "app.example.com"}
    service: ${ctx.inputs.tunnel?.originUrl || "http://localhost:8080"}
    originRequest:
      noTLSVerify: false
      connectTimeout: 30s
  
  # Catch-all rule (required)
  - service: http_status:404
`,
      },
      {
        type: "command",
        label: "Create Tunnel",
        cmd: (ctx) => `cloudflared tunnel create ${ctx.inputs.tunnel?.tunnelName || "biocatch-tunnel"}`,
      },
      {
        type: "command",
        label: "Run Tunnel",
        cmd: (ctx) => `cloudflared tunnel run ${ctx.inputs.tunnel?.tunnelName || "biocatch-tunnel"}`,
      },
      {
        type: "command",
        label: "Install as Service",
        cmd: () => `sudo cloudflared service install`,
      },
    ],
  },
  {
    option: "other_options",
    title: "Other Options",
    description: "Additional Cloudflare configuration options",
    fields: [
      {
        key: "ipAllowlist",
        label: "IP Allowlist",
        type: "textarea",
        placeholder: "192.168.1.0/24\n10.0.0.0/8",
        help: "Enter IP ranges or addresses (one per line)",
      },
      {
        key: "customHeaders",
        label: "Custom Headers",
        type: "textarea",
        placeholder: "X-Custom-Header: value\nX-Another-Header: value",
        help: "Enter custom headers (one per line, format: Header: Value)",
      },
    ],
    guideTemplate: (ctx) => `
## Additional Configuration

### Overview
Additional Cloudflare settings for enhanced security and customization.

${
  ctx.inputs.other_options?.ipAllowlist
    ? `
### IP Allowlist

Configure WAF Custom Rules to restrict access:

**1. Navigate to Security → WAF → Custom Rules**

**2. Create Rule**

- **Rule name**: IP Allowlist for ${ctx.clientName}
- **Expression**:
  \`\`\`
  (not ip.src in {${ctx.inputs.other_options.ipAllowlist.split("\n").join(" ")}})
  \`\`\`
- **Action**: Block

**3. Deploy**

Click **Deploy**. Traffic from unlisted IPs will be blocked.
`
    : ""
}

${
  ctx.inputs.other_options?.customHeaders
    ? `
### Custom Headers

Use Transform Rules to add custom headers:

**1. Navigate to Rules → Transform Rules → Modify Response Header**

**2. Create Rule**

- **Rule name**: Custom Headers for ${ctx.clientName}
- **When incoming requests match**: \`*${ctx.inputs.dns_change?.apexDomain || "example.com"}/*\`
- **Then**: Add headers:
${ctx.inputs.other_options.customHeaders
  .split("\n")
  .map((h: string) => `  - ${h}`)
  .join("\n")}

**3. Deploy**
`
    : ""
}

### Verify

\`\`\`bash
curl -I https://${ctx.inputs.dns_change?.apexDomain || "example.com"}/
\`\`\`
`,
    artifacts: [],
  },
];

const cloudflareVendor: VendorSpec = {
  key: "cloudflare",
  name: "Cloudflare",
  summary:
    "Deploy Workers, configure DNS, and set up Page Rules for edge integration",
  prerequisites: [
    "Active Cloudflare account",
    "Domain added to Cloudflare (or ready to add)",
    "Node.js 18+ installed",
    "Wrangler CLI (will be installed via npm)",
    "Access to domain DNS settings",
  ],
  introTemplate: (ctx) => `
# BioCatch CDN Integration Guide

## Client: ${ctx.clientName}
## Environment: ${ctx.env}
## Vendor: Cloudflare

---

## Prerequisites

Before beginning, ensure you have:

${cloudflareVendor.prerequisites.map((p) => `- ${p}`).join("\n")}

## High-Level Architecture

\`\`\`
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Client    │────────▶│  Cloudflare CDN  │────────▶│  Our Edge       │
│  Browser    │         │  + Worker        │         │  Worker         │
└─────────────┘         └──────────────────┘         └─────────────────┘
                                 │
                                 │ (DNS, Rules, 
                                 │  Caching)
                                 ▼
                        ┌──────────────────┐
                        │  Origin Server   │
                        │  (Optional)      │
                        └──────────────────┘
\`\`\`

## Overview

This guide will walk you through integrating your edge infrastructure with Cloudflare. You will:

1. Deploy a Worker that forwards requests to our edge worker
2. Configure DNS settings
3. Set up page rules for caching and security
4. Test and verify the integration

---
`,
  options: cloudflareOptions,
};

// ==================== AKAMAI ====================

const akamaiOptions: VendorOptionTemplate[] = [
  {
    option: "worker_to_our_worker",
    title: "EdgeWorkers → BioCatch Edge",
    description: "Deploy an Akamai EdgeWorker that forwards requests to BioCatch edge worker",
    fields: [
      {
        key: "edgeWorkerId",
        label: "EdgeWorker ID",
        type: "text",
        placeholder: "12345",
        required: true,
      },
      {
        key: "ourWorkerUrl",
        label: "Our Worker URL",
        type: "text",
        placeholder: "https://our-edge-worker.example.com",
        required: true,
      },
      {
        key: "matchPath",
        label: "Match Path",
        type: "text",
        placeholder: "/api/*",
        required: true,
      },
    ],
    guideTemplate: (ctx) => `
## EdgeWorker Forwarder Setup

### Overview
Deploy an Akamai EdgeWorker that forwards matching requests to BioCatch edge worker.

### Steps

**1. Create EdgeWorker Bundle**

Create \`main.js\` with the forwarding logic (see artifacts).

**2. Upload EdgeWorker**

\`\`\`bash
akamai edgeworkers upload --bundle edgeworker.tgz --edgeworker-id ${ctx.inputs.worker_to_our_worker?.edgeWorkerId || "12345"}
\`\`\`

**3. Configure Property Manager**

Add a behavior in Property Manager to trigger the EdgeWorker on path \`${ctx.inputs.worker_to_our_worker?.matchPath || "/api/*"}\`.

Example PAPI JSON snippet provided in artifacts.

**4. Activate**

\`\`\`bash
akamai edgeworkers activate ${ctx.inputs.worker_to_our_worker?.edgeWorkerId || "12345"} PRODUCTION
\`\`\`

**5. Verify**

\`\`\`bash
curl -I https://your-domain.com${ctx.inputs.worker_to_our_worker?.matchPath?.replace("*", "test") || "/api/test"}
\`\`\`
`,
    artifacts: [
      {
        type: "file",
        path: "main.js",
        contents: (ctx) => `import { httpRequest } from 'http-request';

export function onClientRequest(request) {
  const biocatchEdgeUrl = '${ctx.inputs.worker_to_our_worker?.ourWorkerUrl || "https://biocatch-edge.example.com"}';
  const path = request.path;
  
  // Forward request to BioCatch edge worker
  httpRequest(biocatchEdgeUrl + path, {
    method: request.method,
    headers: request.getHeaders(),
    body: request.body
  }).then(response => {
    request.respondWith(
      response.status,
      response.getHeaders(),
      response.body
    );
  }).catch(error => {
    request.respondWith(500, {}, 'EdgeWorker forwarding error');
  });
}
`,
      },
      {
        type: "file",
        path: "bundle.json",
        contents: () => `{
  "edgeworker-version": "1.0",
  "description": "Request forwarder to edge worker"
}
`,
      },
      {
        type: "file",
        path: "papi-behavior.json",
        contents: (ctx) => `{
  "name": "edgeWorker",
  "options": {
    "edgeWorkerId": "${ctx.inputs.worker_to_our_worker?.edgeWorkerId || "12345"}",
    "createEdgeWorker": false
  },
  "criteria": [{
    "name": "path",
    "options": {
      "matchOperator": "MATCHES_ONE_OF",
      "values": ["${ctx.inputs.worker_to_our_worker?.matchPath || "/api/*"}"],
      "matchCaseSensitive": false
    }
  }]
}
`,
      },
      {
        type: "command",
        label: "Upload EdgeWorker",
        cmd: (ctx) =>
          `akamai edgeworkers upload --bundle edgeworker.tgz --edgeworker-id ${ctx.inputs.worker_to_our_worker?.edgeWorkerId || "12345"}`,
      },
    ],
  },
  {
    option: "dns_change",
    title: "DNS Change",
    description: "Configure DNS to route traffic through Akamai",
    fields: [
      {
        key: "host",
        label: "Hostname",
        type: "text",
        placeholder: "www.example.com",
        required: true,
      },
      {
        key: "targetCNAME",
        label: "Akamai Edge Hostname",
        type: "text",
        placeholder: "example.com.edgekey.net",
        required: true,
      },
    ],
    guideTemplate: (ctx) => `
## DNS Configuration

### Overview
Point \`${ctx.inputs.dns_change?.host || "your-hostname"}\` to Akamai's edge network.

### Steps

**1. Create Edge Hostname in Property Manager**

- Navigate to Property Manager
- Add Edge Hostname: \`${ctx.inputs.dns_change?.targetCNAME || "example.com.edgekey.net"}\`

**2. Update DNS**

Create CNAME record at your DNS provider:

- **Type**: CNAME
- **Name**: \`${ctx.inputs.dns_change?.host || "www"}\`
- **Target**: \`${ctx.inputs.dns_change?.targetCNAME || "example.com.edgekey.net"}\`
- **TTL**: 300

**3. Verify**

\`\`\`bash
dig ${ctx.inputs.dns_change?.host || "www.example.com"} CNAME
\`\`\`

Allow 5-15 minutes for propagation.
`,
    artifacts: [],
  },
  {
    option: "rules_page",
    title: "Property Manager Rules",
    description: "Configure behaviors and match criteria in Property Manager",
    fields: [
      {
        key: "matchCriteria",
        label: "Match Criteria",
        type: "text",
        placeholder: "/api/*",
        required: true,
      },
      {
        key: "cachingBehavior",
        label: "Caching Behavior",
        type: "select",
        options: [
          { label: "No Store", value: "NO_STORE" },
          { label: "Bypass Cache", value: "BYPASS_CACHE" },
          { label: "Cache", value: "CACHE" },
        ],
      },
      {
        key: "headerRewrite",
        label: "Header Modifications",
        type: "textarea",
        placeholder: "X-Custom-Header: value",
      },
    ],
    guideTemplate: (ctx) => `
## Property Manager Configuration

### Overview
Configure behaviors for path \`${ctx.inputs.rules_page?.matchCriteria || "/api/*"}\`.

### Steps

**1. Edit Property**

Navigate to your property in Property Manager.

**2. Add Match Rule**

Create a new rule with criteria:
- **Path matches**: \`${ctx.inputs.rules_page?.matchCriteria || "/api/*"}\`

**3. Add Behaviors**

${
  ctx.inputs.rules_page?.cachingBehavior
    ? `- **Caching**: \`${ctx.inputs.rules_page.cachingBehavior}\``
    : ""
}
${
  ctx.inputs.rules_page?.headerRewrite
    ? `- **Modify Outgoing Response Header**: 
${ctx.inputs.rules_page.headerRewrite
  .split("\n")
  .map((h: string) => `  - ${h}`)
  .join("\n")}`
    : ""
}

**4. Activate**

Save and activate the configuration to staging, then production.

**5. Verify**

\`\`\`bash
curl -I https://your-domain.com${ctx.inputs.rules_page?.matchCriteria?.replace("*", "test") || "/api/test"}
\`\`\`
`,
    artifacts: [],
  },
  {
    option: "tunnel",
    title: "Akamai SureRoute / NetSession",
    description: "Configure Akamai's edge connectivity and tunneling features",
    fields: [
      {
        key: "connectionType",
        label: "Connection Type",
        type: "select",
        options: [
          { label: "SureRoute", value: "sureroute" },
          { label: "NetSession", value: "netsession" },
          { label: "Custom Origin", value: "custom" },
        ],
        required: true,
      },
      {
        key: "originHostname",
        label: "Origin Hostname",
        type: "text",
        placeholder: "origin.example.com",
        required: true,
        help: "Your internal origin server hostname",
      },
    ],
    guideTemplate: (ctx) => `
## Akamai Origin Connectivity

### Overview
Configure secure connectivity to your origin server at \`${ctx.inputs.tunnel?.originHostname || "origin.example.com"}\` using Akamai's ${ctx.inputs.tunnel?.connectionType || "origin"} features.

### Steps

**1. Configure Origin in Property Manager (UI)**

1. Log in to [Akamai Control Center](https://control.akamai.com)
2. Navigate to **Properties** → Select your property
3. Go to **Property Configuration**
4. Click **Edit New Version**

**2. Add Origin Server (UI)**

1. In the property configuration, scroll to **Origin Server** section
2. Click **Edit**
3. Configure:
   - **Origin Type**: \`${ctx.inputs.tunnel?.connectionType === "custom" ? "Custom" : "Your Origin"}\`
   - **Origin Server Hostname**: \`${ctx.inputs.tunnel?.originHostname || "origin.example.com"}\`
   - **Forward Host Header**: \`${ctx.inputs.tunnel?.originHostname || "origin.example.com"}\`
   - **Cache Key Hostname**: Origin Hostname
   - **Supports Gzip Compression**: Yes (if applicable)
   - **Send True Client IP Header**: Yes
4. Click **Save**

**3. Configure SureRoute (UI)**

If using SureRoute for optimal routing:

1. In Property Manager, find **Performance** section
2. Click **Add Behavior**
3. Select **SureRoute**
4. Configure:
   - **Enable SureRoute**: On
   - **Test Object**: \`/akamai-sureroute-test.html\`
   - **Force SSL Forward**: Yes (if using HTTPS)
   - **SR Race Type**: Performance
5. Click **Save**

**4. Set Up Origin SSL (UI)**

For secure origin communication:

1. In Property Manager, go to **Origin Server** behavior
2. Enable **Use SSL**
3. Configure:
   - **HTTPS Port**: 443
   - **Certificate Verification**: Choose based on your cert
   - **SNI**: Yes (recommended)
4. Upload origin certificate if using custom cert verification

**5. Configure Firewall Rules**

Add Akamai IPs to your origin firewall allowlist. Get IP list from:

1. Go to **Support** → **Network Access**
2. Download current Akamai IP ranges
3. Add to your firewall/security group

Or via API:

\`\`\`bash
curl https://api.akamai.com/site-shield/v1/maps | jq '.maps[].cidr'
\`\`\`

**6. Activate Configuration (UI)**

1. Click **Save** on all changes
2. Go to **Activations** tab
3. Click **Activate Version**
4. Select **Staging** first
5. Add notification emails
6. Click **Activate**
7. Test on staging
8. Repeat for **Production**

**7. Verify Connectivity (UI)**

1. Check activation status in **Activations** tab
2. Test your domain: \`curl -I https://your-domain.com\`
3. Check **Adaptive Acceleration** → **Real-Time Reporting** for origin metrics
4. Monitor **SureRoute** tests in reporting

### Troubleshooting

- **Origin unreachable**: Verify firewall rules allow Akamai IPs
- **SSL errors**: Check origin certificate and hostname match
- **503 errors**: Origin may be down or overloaded
- **SureRoute not working**: Verify test object exists at origin
`,
    artifacts: [
      {
        type: "command",
        label: "Get Akamai IP Ranges",
        cmd: () => `curl -s https://control.akamai.com/portal/content/ip-ranges | grep -E "\\b([0-9]{1,3}\\.){3}[0-9]{1,3}\\b"`,
      },
    ],
  },
  {
    option: "other_options",
    title: "Other Options",
    description: "Additional Akamai configuration",
    fields: [
      {
        key: "allowedIPs",
        label: "IP Allowlist",
        type: "textarea",
        placeholder: "192.168.1.0/24",
      },
    ],
    guideTemplate: (ctx) => `
## Additional Configuration

${
  ctx.inputs.other_options?.allowedIPs
    ? `
### IP Allowlist

Configure IP allowlisting in Property Manager:

**1. Add IP Match Criteria**

- Navigate to your property
- Add criteria: **Client IP** in list
- Enter IPs: \`${ctx.inputs.other_options.allowedIPs.split("\n").join(", ")}\`

**2. Deny Other IPs**

For non-matching requests, add behavior to return 403.
`
    : ""
}
`,
    artifacts: [],
  },
];

const akamaiVendor: VendorSpec = {
  key: "akamai",
  name: "Akamai",
  summary: "Deploy EdgeWorkers and configure Property Manager",
  prerequisites: [
    "Active Akamai account with EdgeWorkers enabled",
    "Akamai CLI installed",
    "Property Manager access",
    "EdgeWorker ID provisioned",
  ],
  introTemplate: (ctx) => `
# BioCatch CDN Integration Guide

## Client: ${ctx.clientName}
## Environment: ${ctx.env}
## Vendor: Akamai

---

## Prerequisites

${akamaiVendor.prerequisites.map((p) => `- ${p}`).join("\n")}

## High-Level Architecture

\`\`\`
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Client    │────────▶│  Akamai CDN      │────────▶│  Our Edge       │
│  Browser    │         │  + EdgeWorker    │         │  Worker         │
└─────────────┘         └──────────────────┘         └─────────────────┘
\`\`\`

---
`,
  options: akamaiOptions,
};

// ==================== AWS CLOUDFRONT ====================

const awsOptions: VendorOptionTemplate[] = [
  {
    option: "worker_to_our_worker",
    title: "CloudFront Function / Lambda@Edge → BioCatch Edge",
    description: "Deploy a CloudFront Function or Lambda@Edge to forward requests to BioCatch",
    fields: [
      {
        key: "distributionId",
        label: "CloudFront Distribution ID",
        type: "text",
        placeholder: "E1234EXAMPLE",
        required: true,
      },
      {
        key: "functionType",
        label: "Function Type",
        type: "select",
        options: [
          { label: "CloudFront Function", value: "cloudfront_function" },
          { label: "Lambda@Edge", value: "lambda_edge" },
        ],
        required: true,
      },
      {
        key: "ourWorkerUrl",
        label: "Our Worker URL",
        type: "text",
        placeholder: "https://our-edge-worker.example.com",
        required: true,
      },
      {
        key: "stage",
        label: "Event Type",
        type: "select",
        options: [
          { label: "Viewer Request", value: "viewer-request" },
          { label: "Origin Request", value: "origin-request" },
        ],
      },
    ],
    guideTemplate: (ctx) => {
      const isCFFunction =
        ctx.inputs.worker_to_our_worker?.functionType === "cloudfront_function";
      return `
## ${isCFFunction ? "CloudFront Function" : "Lambda@Edge"} Setup

### Overview
Deploy a ${isCFFunction ? "CloudFront Function" : "Lambda@Edge function"} to forward requests to BioCatch edge worker.

### Steps

${
  isCFFunction
    ? `
**1. Create Function**

\`\`\`bash
aws cloudfront create-function \\
  --name ${ctx.clientName}-edge-forwarder \\
  --function-code fileb://function.js \\
  --function-config Comment="Forward to edge worker",Runtime=cloudfront-js-1.0 \\
  --region us-east-1
\`\`\`

**2. Publish Function**

\`\`\`bash
aws cloudfront publish-function \\
  --name ${ctx.clientName}-edge-forwarder \\
  --if-match ETAG_FROM_CREATE
\`\`\`

**3. Associate with Distribution**

\`\`\`bash
aws cloudfront update-distribution \\
  --id ${ctx.inputs.worker_to_our_worker?.distributionId || "E1234EXAMPLE"} \\
  --distribution-config file://distribution-config.json
\`\`\`
`
    : `
**1. Create Lambda Function**

\`\`\`bash
# Package function
zip function.zip index.js

# Create function
aws lambda create-function \\
  --function-name ${ctx.clientName}-edge-forwarder \\
  --runtime nodejs18.x \\
  --role arn:aws:iam::ACCOUNT:role/lambda-edge-role \\
  --handler index.handler \\
  --zip-file fileb://function.zip \\
  --region us-east-1
\`\`\`

**2. Publish Version**

\`\`\`bash
aws lambda publish-version \\
  --function-name ${ctx.clientName}-edge-forwarder
\`\`\`

**3. Associate with CloudFront**

Update your CloudFront distribution to trigger the Lambda function on ${ctx.inputs.worker_to_our_worker?.stage || "viewer-request"}.
`
}

**4. Verify**

\`\`\`bash
curl -I https://your-distribution.cloudfront.net/test
\`\`\`

### Notes

- ${isCFFunction ? "CloudFront Functions are lightweight and run on every edge location" : "Lambda@Edge has more capabilities but slightly higher latency"}
- All functions must be created in **us-east-1** region
- Changes can take 5-15 minutes to propagate
`;
    },
    artifacts: [
      {
        type: "file",
        path: "index.js",
        contents: (ctx) => {
          const isCFFunction =
            ctx.inputs.worker_to_our_worker?.functionType ===
            "cloudfront_function";
          return isCFFunction
            ? `function handler(event) {
  var request = event.request;
  var biocatchEdgeUrl = '${ctx.inputs.worker_to_our_worker?.ourWorkerUrl || "https://biocatch-edge.example.com"}';
  
  // Modify request to point to BioCatch edge worker
  var url = new URL(request.uri, biocatchEdgeUrl);
  request.origin = {
    custom: {
      domainName: url.hostname,
      port: 443,
      protocol: 'https',
      path: '',
      sslProtocols: ['TLSv1.2'],
      readTimeout: 30,
      keepaliveTimeout: 5
    }
  };
  
  return request;
}
`
            : `exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const biocatchEdgeUrl = '${ctx.inputs.worker_to_our_worker?.ourWorkerUrl || "https://biocatch-edge.example.com"}';
  
  // Forward to BioCatch edge worker
  const url = new URL(biocatchEdgeUrl);
  request.origin = {
    custom: {
      domainName: url.hostname,
      port: 443,
      protocol: 'https',
      path: request.uri,
      sslProtocols: ['TLSv1.2'],
      readTimeout: 30,
      keepaliveTimeout: 5,
      customHeaders: {}
    }
  };
  
  request.headers.host = [{ key: 'host', value: url.hostname }];
  
  return request;
};
`;
        },
      },
      {
        type: "command",
        label: "Create Function",
        cmd: (ctx) =>
          ctx.inputs.worker_to_our_worker?.functionType === "cloudfront_function"
            ? `aws cloudfront create-function --name ${ctx.clientName}-edge-forwarder --function-code fileb://function.js --function-config Comment="Forward",Runtime=cloudfront-js-1.0`
            : `aws lambda create-function --function-name ${ctx.clientName}-edge-forwarder --runtime nodejs18.x --role arn:aws:iam::ACCOUNT:role/lambda-edge-role --handler index.handler --zip-file fileb://function.zip --region us-east-1`,
      },
    ],
  },
  {
    option: "dns_change",
    title: "Route53 DNS Configuration",
    description: "Configure Route53 DNS to point to CloudFront",
    fields: [
      {
        key: "hostedZoneId",
        label: "Route53 Hosted Zone ID",
        type: "text",
        placeholder: "Z1234EXAMPLE",
        required: true,
      },
      {
        key: "recordName",
        label: "Record Name",
        type: "text",
        placeholder: "www.example.com",
        required: true,
      },
      {
        key: "cloudfrontDomain",
        label: "CloudFront Distribution Domain",
        type: "text",
        placeholder: "d123.cloudfront.net",
        required: true,
      },
    ],
    guideTemplate: (ctx) => `
## Route53 DNS Configuration

### Overview
Point \`${ctx.inputs.dns_change?.recordName || "www.example.com"}\` to CloudFront distribution.

### Steps

**1. Create A Record (Alias)**

\`\`\`bash
aws route53 change-resource-record-sets \\
  --hosted-zone-id ${ctx.inputs.dns_change?.hostedZoneId || "Z1234EXAMPLE"} \\
  --change-batch file://change-batch.json
\`\`\`

See \`change-batch.json\` in artifacts.

**2. Verify**

\`\`\`bash
dig ${ctx.inputs.dns_change?.recordName || "www.example.com"}
\`\`\`

**3. Test HTTPS**

\`\`\`bash
curl -I https://${ctx.inputs.dns_change?.recordName || "www.example.com"}/
\`\`\`

### Notes

- Alias records are free and recommended for CloudFront
- Ensure SSL certificate is configured in CloudFront for the custom domain
- Propagation is typically instant but can take up to 60 seconds
`,
    artifacts: [
      {
        type: "file",
        path: "change-batch.json",
        contents: (ctx) => `{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "${ctx.inputs.dns_change?.recordName || "www.example.com"}",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "Z2FDTNDATAQYW2",
        "DNSName": "${ctx.inputs.dns_change?.cloudfrontDomain || "d123.cloudfront.net"}",
        "EvaluateTargetHealth": false
      }
    }
  }]
}
`,
      },
      {
        type: "command",
        label: "Update DNS",
        cmd: (ctx) =>
          `aws route53 change-resource-record-sets --hosted-zone-id ${ctx.inputs.dns_change?.hostedZoneId || "Z1234EXAMPLE"} --change-batch file://change-batch.json`,
      },
    ],
  },
  {
    option: "rules_page",
    title: "CloudFront Behaviors",
    description: "Configure cache behaviors and origin settings",
    fields: [
      {
        key: "pathPattern",
        label: "Path Pattern",
        type: "text",
        placeholder: "/api/*",
        required: true,
      },
      {
        key: "cachePolicyId",
        label: "Cache Policy",
        type: "select",
        options: [
          {
            label: "CachingOptimized",
            value: "658327ea-f89d-4fab-a63d-7e88639e58f6",
          },
          { label: "CachingDisabled", value: "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" },
        ],
      },
    ],
    guideTemplate: (ctx) => `
## CloudFront Behavior Configuration

### Overview
Configure cache behavior for path pattern \`${ctx.inputs.rules_page?.pathPattern || "/api/*"}\`.

### Steps

**1. Add Cache Behavior**

In CloudFront console:
- Navigate to your distribution
- Go to **Behaviors** tab
- Click **Create Behavior**

**2. Configure Behavior**

- **Path Pattern**: \`${ctx.inputs.rules_page?.pathPattern || "/api/*"}\`
- **Origin**: Select your origin
${
  ctx.inputs.rules_page?.cachePolicyId
    ? `- **Cache Policy**: \`${ctx.inputs.rules_page.cachePolicyId}\``
    : ""
}
- **Viewer Protocol Policy**: Redirect HTTP to HTTPS

**3. Save and Deploy**

Click **Save Changes**. Wait 5-15 minutes for deployment.

**4. Verify**

\`\`\`bash
curl -I https://your-distribution.cloudfront.net${ctx.inputs.rules_page?.pathPattern?.replace("*", "test") || "/api/test"}
# Check X-Cache header
\`\`\`
`,
    artifacts: [],
  },
  {
    option: "tunnel",
    title: "VPC / Private Origin",
    description: "Connect CloudFront to private origins via VPC or AWS PrivateLink",
    fields: [
      {
        key: "connectionType",
        label: "Connection Type",
        type: "select",
        options: [
          { label: "VPC Origin", value: "vpc" },
          { label: "AWS PrivateLink", value: "privatelink" },
          { label: "VPN Connection", value: "vpn" },
        ],
        required: true,
      },
      {
        key: "originDomain",
        label: "Origin Domain/IP",
        type: "text",
        placeholder: "internal-lb.vpc.example.com",
        required: true,
        help: "Your private origin hostname or IP",
      },
      {
        key: "vpcId",
        label: "VPC ID (Optional)",
        type: "text",
        placeholder: "vpc-1234567890abcdef0",
        help: "Your VPC ID if using VPC origin",
      },
    ],
    guideTemplate: (ctx) => {
      const connType = ctx.inputs.tunnel?.connectionType || "vpc";
      return `
## AWS Private Origin Connectivity

### Overview
Connect CloudFront to your private origin at \`${ctx.inputs.tunnel?.originDomain || "internal-origin.vpc.example.com"}\` using ${connType === "vpc" ? "VPC" : connType === "privatelink" ? "AWS PrivateLink" : "VPN"}.

### Steps

${connType === "vpc" ? `
**1. Set Up VPC Origin (UI)**

1. Log in to [AWS Console](https://console.aws.amazon.com)
2. Navigate to **VPC** service
3. Note your VPC ID: \`${ctx.inputs.tunnel?.vpcId || "vpc-xxxxx"}\`

**2. Configure Security Groups**

1. Go to **EC2** → **Security Groups**
2. Select your origin's security group
3. Click **Edit inbound rules**
4. Add rule:
   - **Type**: HTTPS (or HTTP)
   - **Source**: CloudFront prefix list (\`com.amazonaws.global.cloudfront.origin-facing\`)
   - Click **Save rules**

**3. Create CloudFront Origin (UI)**

1. Navigate to **CloudFront** service
2. Select your distribution
3. Go to **Origins** tab
4. Click **Create origin**
5. Configure:
   - **Origin domain**: \`${ctx.inputs.tunnel?.originDomain || "internal-lb.vpc.example.com"}\`
   - **Protocol**: HTTPS (recommended)
   - **Origin SSL protocols**: TLSv1.2
   - **Custom headers**: Add any required headers
6. Click **Create origin**
` : connType === "privatelink" ? `
**1. Create VPC Endpoint Service**

1. Log in to [AWS Console](https://console.aws.amazon.com)
2. Navigate to **VPC** → **Endpoint Services**
3. Click **Create endpoint service**
4. Select your Network Load Balancer
5. Configure acceptance (auto-accept or manual)
6. Note the service name

**2. Create CloudFront VPC Origin**

1. Navigate to **CloudFront** service
2. Contact AWS Support to enable VPC origins
3. Once enabled, go to distribution **Origins**
4. Click **Create origin**
5. Configure:
   - **Origin domain**: Your VPC endpoint service name
   - **Protocol**: HTTPS
   - **VPC origin**: Enabled
6. Click **Create origin**
` : `
**1. Set Up VPN Connection**

1. Log in to [AWS Console](https://console.aws.amazon.com)
2. Navigate to **VPC** → **VPN Connections**
3. Set up Customer Gateway and Virtual Private Gateway
4. Establish VPN tunnel to your network

**2. Configure Origin**

1. Navigate to **CloudFront** service
2. Select distribution
3. Go to **Origins** tab
4. Add origin pointing to your VPN-connected network:
   - **Origin domain**: \`${ctx.inputs.tunnel?.originDomain || "internal-origin.example.com"}\`
`}

**4. Update CloudFront Behavior (UI)**

1. In your distribution, go to **Behaviors** tab
2. Click **Create behavior** or edit default
3. Configure:
   - **Path pattern**: \`/*\` (or specific path)
   - **Origin**: Select the private origin you created
   - **Viewer protocol policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - **Cache policy**: Choose appropriate policy
4. Click **Save changes**

**5. Deploy Distribution (UI)**

1. Click **Save** on all changes
2. Distribution status will change to **Deploying**
3. Wait 5-15 minutes for deployment
4. Status will change to **Deployed**

**6. Verify Connection**

Test the connection:

\`\`\`bash
curl -I https://your-distribution.cloudfront.net/
# Should return response from private origin
\`\`\`

Check CloudFront monitoring:

1. Go to **Monitoring** tab
2. View **Requests** metrics
3. Check **Origin status** for error rates

### Troubleshooting

- **502/503 errors**: Check origin security group allows CloudFront
- **Connection timeout**: Verify origin is reachable from CloudFront
- **SSL errors**: Ensure origin has valid SSL certificate
- **VPC routing**: Check route tables and NACLs allow traffic
`;
    },
    artifacts: [
      {
        type: "command",
        label: "Get CloudFront IP Ranges",
        cmd: () => `curl -s https://ip-ranges.amazonaws.com/ip-ranges.json | jq -r '.prefixes[] | select(.service=="CLOUDFRONT") | .ip_prefix'`,
      },
    ],
  },
  {
    option: "other_options",
    title: "Other Options",
    description: "Additional CloudFront configuration",
    fields: [
      {
        key: "wafWebAclId",
        label: "AWS WAF Web ACL ID",
        type: "text",
        placeholder: "arn:aws:wafv2:...",
      },
    ],
    guideTemplate: (ctx) => `
## Additional Configuration

${
  ctx.inputs.other_options?.wafWebAclId
    ? `
### AWS WAF Integration

**1. Associate WAF with Distribution**

\`\`\`bash
aws cloudfront update-distribution \\
  --id ${ctx.inputs.worker_to_our_worker?.distributionId || "E1234EXAMPLE"} \\
  --web-acl-id ${ctx.inputs.other_options.wafWebAclId}
\`\`\`

**2. Configure WAF Rules**

Navigate to AWS WAF console and configure rules for your Web ACL.
`
    : ""
}
`,
    artifacts: [],
  },
];

const awsVendor: VendorSpec = {
  key: "aws_cloudfront",
  name: "AWS CloudFront",
  summary: "Deploy CloudFront Functions or Lambda@Edge with Route53 DNS",
  prerequisites: [
    "AWS account with CloudFront access",
    "AWS CLI installed and configured",
    "CloudFront distribution (or ready to create)",
    "Route53 hosted zone (for DNS)",
    "IAM permissions for Lambda and CloudFront",
  ],
  introTemplate: (ctx) => `
# BioCatch CDN Integration Guide

## Client: ${ctx.clientName}
## Environment: ${ctx.env}
## Vendor: AWS CloudFront

---

## Prerequisites

${awsVendor.prerequisites.map((p) => `- ${p}`).join("\n")}

## High-Level Architecture

\`\`\`
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Client    │────────▶│  CloudFront CDN  │────────▶│  Our Edge       │
│  Browser    │         │  + Function      │         │  Worker         │
└─────────────┘         └──────────────────┘         └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │   Route53 DNS   │
                        └─────────────────┘
\`\`\`

---
`,
  options: awsOptions,
};

// ==================== FASTLY ====================

const fastlyOptions: VendorOptionTemplate[] = [
  {
    option: "worker_to_our_worker",
    title: "Compute@Edge / VCL → BioCatch Edge",
    description: "Deploy Fastly Compute@Edge or VCL to forward requests to BioCatch",
    fields: [
      {
        key: "serviceId",
        label: "Fastly Service ID",
        type: "text",
        placeholder: "abc123...",
        required: true,
      },
      {
        key: "implementationType",
        label: "Implementation Type",
        type: "select",
        options: [
          { label: "Compute@Edge", value: "compute" },
          { label: "VCL", value: "vcl" },
        ],
        required: true,
      },
      {
        key: "ourWorkerUrl",
        label: "Our Worker URL",
        type: "text",
        placeholder: "https://our-edge-worker.example.com",
        required: true,
      },
      {
        key: "backendName",
        label: "Backend Name",
        type: "text",
        placeholder: "edge_worker_backend",
        required: true,
      },
    ],
    guideTemplate: (ctx) => {
      const isCompute =
        ctx.inputs.worker_to_our_worker?.implementationType === "compute";
      return `
## ${isCompute ? "Compute@Edge" : "VCL"} Setup

### Overview
Deploy a ${isCompute ? "Compute@Edge" : "VCL"} service to forward requests to BioCatch edge worker.

### Steps

${
  isCompute
    ? `
**1. Initialize Project**

\`\`\`bash
fastly compute init
cd ${ctx.clientName}-edge-forwarder
\`\`\`

**2. Create Forwarder Code**

See \`src/main.rs\` in artifacts (Rust example).

**3. Configure Backend**

\`\`\`bash
fastly backend create \\
  --version=latest \\
  --name=${ctx.inputs.worker_to_our_worker?.backendName || "edge_worker_backend"} \\
  --address=${new URL(ctx.inputs.worker_to_our_worker?.ourWorkerUrl || "https://our-edge-worker.example.com").hostname}
\`\`\`

**4. Deploy**

\`\`\`bash
fastly compute publish
\`\`\`
`
    : `
**1. Add Backend**

\`\`\`bash
fastly backend create \\
  --service-id=${ctx.inputs.worker_to_our_worker?.serviceId || "SERVICE_ID"} \\
  --version=latest \\
  --name=${ctx.inputs.worker_to_our_worker?.backendName || "edge_worker_backend"} \\
  --address=${new URL(ctx.inputs.worker_to_our_worker?.ourWorkerUrl || "https://our-edge-worker.example.com").hostname}
\`\`\`

**2. Update VCL**

Add VCL snippet (see artifacts) to forward requests.

**3. Activate**

\`\`\`bash
fastly service-version activate \\
  --service-id=${ctx.inputs.worker_to_our_worker?.serviceId || "SERVICE_ID"} \\
  --version=latest
\`\`\`
`
}

**5. Verify**

\`\`\`bash
curl -I https://your-service.global.ssl.fastly.net/test
\`\`\`
`;
    },
    artifacts: [
      {
        type: "file",
        path: "main.rs",
        contents: (ctx) => {
          const isCompute =
            ctx.inputs.worker_to_our_worker?.implementationType === "compute";
          return isCompute
            ? `use fastly::{Error, Request, Response};

#[fastly::main]
fn main(req: Request) -> Result<Response, Error> {
    let backend_name = "${ctx.inputs.worker_to_our_worker?.backendName || "biocatch_edge_backend"}";
    
    // Forward request to BioCatch edge worker
    let beresp = req.send(backend_name)?;
    
    Ok(beresp)
}
`
            : `sub vcl_recv {
  #FASTLY recv
  
  # Forward to BioCatch edge worker
  set req.backend = F_${ctx.inputs.worker_to_our_worker?.backendName || "biocatch_edge_backend"};
  set req.http.Host = "${new URL(ctx.inputs.worker_to_our_worker?.ourWorkerUrl || "https://biocatch-edge.example.com").hostname}";
  
  return(lookup);
}
`;
        },
      },
      {
        type: "command",
        label: "Create Backend",
        cmd: (ctx) =>
          `fastly backend create --service-id=${ctx.inputs.worker_to_our_worker?.serviceId || "SERVICE_ID"} --version=latest --name=${ctx.inputs.worker_to_our_worker?.backendName || "biocatch_edge_backend"} --address=${new URL(ctx.inputs.worker_to_our_worker?.ourWorkerUrl || "https://biocatch-edge.example.com").hostname}`,
      },
      {
        type: "command",
        label: "Deploy",
        cmd: (ctx) =>
          ctx.inputs.worker_to_our_worker?.implementationType === "compute"
            ? `fastly compute publish`
            : `fastly service-version activate --service-id=${ctx.inputs.worker_to_our_worker?.serviceId || "SERVICE_ID"} --version=latest`,
      },
    ],
  },
  {
    option: "dns_change",
    title: "DNS Configuration",
    description: "Point DNS to Fastly",
    fields: [
      {
        key: "host",
        label: "Hostname",
        type: "text",
        placeholder: "www.example.com",
        required: true,
      },
      {
        key: "cnameTarget",
        label: "Fastly CNAME Target",
        type: "text",
        placeholder: "example.com.global.prod.fastly.net",
        required: true,
      },
    ],
    guideTemplate: (ctx) => `
## DNS Configuration

### Overview
Point \`${ctx.inputs.dns_change?.host || "www.example.com"}\` to Fastly.

### Steps

**1. Add Domain to Fastly**

\`\`\`bash
fastly domain create \\
  --service-id=${ctx.inputs.worker_to_our_worker?.serviceId || "SERVICE_ID"} \\
  --version=latest \\
  --name=${ctx.inputs.dns_change?.host || "www.example.com"}
\`\`\`

**2. Update DNS**

Create CNAME record:
- **Type**: CNAME
- **Name**: \`${ctx.inputs.dns_change?.host || "www"}\`
- **Target**: \`${ctx.inputs.dns_change?.cnameTarget || "example.com.global.prod.fastly.net"}\`

**3. Enable TLS**

\`\`\`bash
fastly tls-subscription create \\
  --domain=${ctx.inputs.dns_change?.host || "www.example.com"}
\`\`\`

**4. Verify**

\`\`\`bash
dig ${ctx.inputs.dns_change?.host || "www.example.com"} CNAME
curl -I https://${ctx.inputs.dns_change?.host || "www.example.com"}/
\`\`\`
`,
    artifacts: [
      {
        type: "command",
        label: "Add Domain",
        cmd: (ctx) =>
          `fastly domain create --service-id=${ctx.inputs.worker_to_our_worker?.serviceId || "SERVICE_ID"} --version=latest --name=${ctx.inputs.dns_change?.host || "www.example.com"}`,
      },
    ],
  },
  {
    option: "rules_page",
    title: "VCL Rules",
    description: "Configure caching and request handling with VCL",
    fields: [
      {
        key: "condition",
        label: "Condition",
        type: "text",
        placeholder: 'req.url ~ "^/api/"',
        required: true,
      },
      {
        key: "cacheOverride",
        label: "Cache Override",
        type: "select",
        options: [
          { label: "Pass (no cache)", value: "pass" },
          { label: "Cache", value: "cache" },
        ],
      },
    ],
    guideTemplate: (ctx) => `
## VCL Rules Configuration

### Overview
Configure VCL rules for requests matching \`${ctx.inputs.rules_page?.condition || 'req.url ~ "^/api/"'}\`.

### Steps

**1. Create Condition**

\`\`\`bash
fastly condition create \\
  --service-id=${ctx.inputs.worker_to_our_worker?.serviceId || "SERVICE_ID"} \\
  --version=latest \\
  --name=api_condition \\
  --statement='${ctx.inputs.rules_page?.condition || 'req.url ~ "^/api/"'}' \\
  --type=REQUEST
\`\`\`

**2. Apply Cache Settings**

${
  ctx.inputs.rules_page?.cacheOverride === "pass"
    ? `
\`\`\`bash
fastly cache-setting create \\
  --service-id=${ctx.inputs.worker_to_our_worker?.serviceId || "SERVICE_ID"} \\
  --version=latest \\
  --name=no_cache_api \\
  --action=pass \\
  --request-condition=api_condition
\`\`\`
`
    : "Configure cache TTL and behaviors as needed."
}

**3. Activate Version**

\`\`\`bash
fastly service-version activate \\
  --service-id=${ctx.inputs.worker_to_our_worker?.serviceId || "SERVICE_ID"} \\
  --version=latest
\`\`\`

**4. Verify**

\`\`\`bash
curl -I https://your-service.global.ssl.fastly.net/api/test
# Check X-Cache header
\`\`\`
`,
    artifacts: [],
  },
  {
    option: "tunnel",
    title: "Private Network / Shield",
    description: "Configure Fastly to connect to private origins via Shield or private networking",
    fields: [
      {
        key: "shieldPop",
        label: "Shield POP Location",
        type: "select",
        options: [
          { label: "Ashburn (IAD)", value: "iad" },
          { label: "San Jose (SJC)", value: "sjc" },
          { label: "London (LHR)", value: "lhr" },
          { label: "Tokyo (TYO)", value: "tyo" },
          { label: "Frankfurt (FRA)", value: "fra" },
        ],
        help: "Primary Shield POP closest to your origin",
      },
      {
        key: "originIp",
        label: "Private Origin IP",
        type: "text",
        placeholder: "10.0.1.100",
        required: true,
        help: "Internal IP address of your origin",
      },
      {
        key: "originPort",
        label: "Origin Port",
        type: "text",
        placeholder: "443",
        required: true,
      },
    ],
    guideTemplate: (ctx) => `
## Fastly Private Origin Setup

### Overview
Configure Fastly to connect to your private origin at \`${ctx.inputs.tunnel?.originIp || "10.0.1.100"}:${ctx.inputs.tunnel?.originPort || "443"}\` using ${ctx.inputs.tunnel?.shieldPop ? `Shield POP (${ctx.inputs.tunnel.shieldPop.toUpperCase()})` : "Shield"}.

### Steps

**1. Configure Backend in Fastly UI**

1. Log in to [Fastly Dashboard](https://manage.fastly.com)
2. Select your service
3. Click **Edit configuration**
4. Go to **Origins** section
5. Click **Create a host**

**2. Add Private Origin (UI)**

Configure the backend:

- **Name**: \`private_origin\`
- **Address**: \`${ctx.inputs.tunnel?.originIp || "10.0.1.100"}\`
- **Port**: \`${ctx.inputs.tunnel?.originPort || "443"}\`
- **Override host**: Your origin hostname
${ctx.inputs.tunnel?.shieldPop ? `- **Shielding**: Enable
- **Shield POP**: \`${ctx.inputs.tunnel.shieldPop.toUpperCase()}\`` : ""}
- **Auto load balance**: Off
- **Weight**: 100
- **Use SSL**: Yes (if applicable)
- **Certificate hostname**: Your origin hostname
- **SNI hostname**: Your origin hostname
- **Minimum TLS version**: 1.2
- **Maximum TLS version**: 1.3

Click **Create**

**3. Configure Shield (UI)**

${ctx.inputs.tunnel?.shieldPop ? `
1. In the backend configuration, enable **Use shielding**
2. Select Shield POP: \`${ctx.inputs.tunnel.shieldPop.toUpperCase()}\`
3. This routes all traffic through a single POP to your origin
` : `
1. In backend settings, enable **Use shielding**
2. Choose POP closest to your origin
3. Benefits: Reduced origin load, better cache hit ratio
`}

**4. Set Up VCL for Private Network**

If using custom VCL:

\`\`\`vcl
sub vcl_recv {
  #FASTLY recv
  
  # Route to private origin
  set req.backend = F_private_origin;
  set req.http.Host = "${ctx.inputs.tunnel?.originIp || "10.0.1.100"}";
  
  # Add shield POP
  ${ctx.inputs.tunnel?.shieldPop ? `set req.backend.shield = "${ctx.inputs.tunnel.shieldPop.toUpperCase()}";` : ""}
  
  return(lookup);
}

sub vcl_miss {
  #FASTLY miss
  
  # Allow connection to private IPs
  set bereq.http.Fastly-Force-Shield = "1";
  
  return(fetch);
}
\`\`\`

**5. Configure Firewall Rules**

Add Fastly IPs to your origin firewall:

1. Get Fastly IP ranges: [Public IP List](https://api.fastly.com/public-ip-list)
2. Add to security group/firewall
3. Or use Shield IPs only for tighter security

\`\`\`bash
curl -s https://api.fastly.com/public-ip-list | jq '.addresses[]'
\`\`\`

**6. Activate Configuration (UI)**

1. Click **Activate** button in top right
2. Add comment: "Private origin setup"
3. Click **Activate**
4. Configuration deploys in seconds

**7. Test Connection (UI)**

1. Go to **Stats** → **Origins**
2. Check origin health status
3. Monitor requests and errors
4. Test: \`curl -I https://your-service.global.ssl.fastly.net\`

**8. Monitor Shield Performance (UI)**

1. Navigate to **Stats** → **Shielding**
2. View:
   - Shield hit ratio
   - Origin requests reduced
   - Response times
3. Adjust Shield POP if needed for better performance

### Troubleshooting

- **503 Backend error**: Origin unreachable, check firewall/network
- **SSL errors**: Verify origin certificate matches hostname
- **Shield issues**: Try different Shield POP location
- **Connection timeout**: Check origin is listening on correct port
- **Network errors**: Verify private network connectivity from Shield POP
`,
    artifacts: [
      {
        type: "command",
        label: "Get Fastly IP Ranges",
        cmd: () => `curl -s https://api.fastly.com/public-ip-list | jq '.addresses[]'`,
      },
      {
        type: "command",
        label: "Create Backend",
        cmd: (ctx) => `fastly backend create --service-id=SERVICE_ID --version=latest --name=private_origin --address=${ctx.inputs.tunnel?.originIp || "10.0.1.100"} --port=${ctx.inputs.tunnel?.originPort || "443"}`,
      },
    ],
  },
  {
    option: "other_options",
    title: "Other Options",
    description: "Additional Fastly configuration",
    fields: [
      {
        key: "customHeaders",
        label: "Custom Response Headers",
        type: "textarea",
        placeholder: "X-Custom-Header: value",
      },
    ],
    guideTemplate: (ctx) => `
## Additional Configuration

${
  ctx.inputs.other_options?.customHeaders
    ? `
### Custom Headers

Add custom headers to responses:

\`\`\`bash
fastly header create \\
  --service-id=${ctx.inputs.worker_to_our_worker?.serviceId || "SERVICE_ID"} \\
  --version=latest \\
  --name=custom_headers \\
  --action=set \\
  --type=response \\
  --dst=http.X-Custom-Header \\
  --src='"${ctx.inputs.other_options.customHeaders.split("\n")[0].split(":")[1]?.trim() || "value"}"'
\`\`\`
`
    : ""
}
`,
    artifacts: [],
  },
];

const fastlyVendor: VendorSpec = {
  key: "fastly",
  name: "Fastly",
  summary: "Deploy Compute@Edge or VCL with custom backends",
  prerequisites: [
    "Active Fastly account",
    "Fastly CLI installed",
    "Service ID (or ready to create service)",
    "Rust toolchain (for Compute@Edge) or VCL knowledge",
  ],
  introTemplate: (ctx) => `
# BioCatch CDN Integration Guide

## Client: ${ctx.clientName}
## Environment: ${ctx.env}
## Vendor: Fastly

---

## Prerequisites

${fastlyVendor.prerequisites.map((p) => `- ${p}`).join("\n")}

## High-Level Architecture

\`\`\`
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Client    │────────▶│  Fastly CDN      │────────▶│  Our Edge       │
│  Browser    │         │  + Compute/VCL   │         │  Worker         │
└─────────────┘         └──────────────────┘         └─────────────────┘
\`\`\`

---
`,
  options: fastlyOptions,
};

// ==================== EXPORT ====================

export const vendors: Record<VendorKey, VendorSpec> = {
  cloudflare: cloudflareVendor,
  akamai: akamaiVendor,
  aws_cloudfront: awsVendor,
  fastly: fastlyVendor,
};

export function getVendor(key: VendorKey): VendorSpec | undefined {
  return vendors[key];
}

export function getVendorOption(
  vendor: VendorSpec,
  optionKey: IntegrationOptionKey
): VendorOptionTemplate | undefined {
  return vendor.options.find((opt) => opt.option === optionKey);
}

export function getVendorIcon(key: VendorKey): LucideIcon {
  const icons: Record<VendorKey, LucideIcon> = {
    cloudflare: Cloud,
    akamai: Zap,
    aws_cloudfront: CloudCog,
    fastly: Gauge,
  };
  return icons[key] || Cloud;
}

