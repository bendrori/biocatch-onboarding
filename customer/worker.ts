export interface Env {
    BIOCATCH_ENDPOINT: string;
    CUSTOMER_ID: string;
    BRAND: string;
    ASYNC_KEYWORDS: string;  // Fire-and-forget
    SYNC_KEYWORDS: string;   // Wait & decide
    BLOCK_THRESHOLD: string; // Default: 700
}

class SDKInjector {
    constructor(private script: string) {
    }

    element(el: Element) {
        el.append(`<script>${this.script}</script>`, {html: true});
    }
}

export default {
    async fetch(req: Request, env: Env): Promise<Response> {
        try {
            const reqForTelemetry = req.method === "POST" ? req.clone() : null;
            const res = await fetch(req);
            const path = new URL(req.url).pathname.toLowerCase();
            const match = (kw) => {
                if (!kw) {
                    // console.log("[match] kw is empty:", kw);
                    return false;
                }

                let list = [];

                // normalize to array
                if (Array.isArray(kw)) {
                    list = kw;
                    // console.log("[match] kw is array:", list);
                } else if (typeof kw === "string") {
                    const trimmed = kw.trim();
                    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                        try {
                            const parsed = JSON.parse(trimmed);
                            list = Array.isArray(parsed) ? parsed : [trimmed];
                            // console.log("[match] kw parsed from JSON string:", list);
                        } catch {
                            list = trimmed.split(/\s*,\s*/);
                            // console.log("[match] kw parsed from CSV string:", list);
                        }
                    } else {
                        list = trimmed.split(/\s*,\s*/);
                        // console.log("[match] kw split by comma:", list);
                    }
                } else {
                    // console.log("[match] kw unexpected type:", typeof kw, kw);
                    return false;
                }

                const normalized = list.map(x => String(x).trim().toLowerCase()).filter(Boolean);
                const result = normalized.some(k => path.toLowerCase().includes(k));
                // console.log("[match] path:", path, "| normalized keywords:", normalized, "| result:", result);

                return result;
            };

            // Inject SDK
            if (res.headers.get("content-type")?.includes("text/html")) {
                const sdk = await fetch(`${env.BIOCATCH_ENDPOINT}/sdk`, {signal: AbortSignal.timeout(3000)}).then(r => r.text()).catch(() => null);
                return sdk ? new HTMLRewriter().on("head", new SDKInjector(sdk)).transform(res) : res;
            }

            // Async: Fire-and-forget
            if (match(env.ASYNC_KEYWORDS) && res.ok && reqForTelemetry) {
                const data = await buildTelemetry(reqForTelemetry, env, path);
                console.log(`[BIO_FOR_CUSTOMER] Async: Fire-and-forget call to data`, data);
                fetch(`${env.BIOCATCH_ENDPOINT}/action`, {
                    method: 'POST',
                    body: JSON.stringify({path, ts: Date.now()})
                }).catch(() => {
                });
            }

            // Sync: Wait & decide
            if (match(env.SYNC_KEYWORDS) && reqForTelemetry) {
                const data = await buildTelemetry(reqForTelemetry, env, path);
                console.log(`[BIO_FOR_CUSTOMER] Sync: Wait & decide call to data`, data);
                const {score = 0} = await fetch(`${env.BIOCATCH_ENDPOINT}/action`, {
                    method: 'POST',
                    body: JSON.stringify({path, ts: Date.now()}),
                    signal: AbortSignal.timeout(5000)
                }).then(r => r.json()).catch(() => ({}));

                if (score > (parseInt(env.BLOCK_THRESHOLD) || 700)) {
                    console.log(`Blocked: ${score}`);
                    return new Response(JSON.stringify({error: 'Blocked', score}),
                        {status: 403, headers: {'Content-Type': 'application/json'}});
                }
                console.log(`Allowed: ${score}`);
            }

            return res;
        } catch (e) {
            console.log("Error:", e);
            return fetch(req);
        }
    }
};

async function buildTelemetry(req: Request, env: Env, path: string, dbg = true) {
    const u = new URL(req.url), h = req.headers, ct = (h.get("content-type") || "").toLowerCase();
    const clone = req.clone();
    const log = (...a: any[]) => dbg && console.log("[telemetry]", ...a);
    const redact = (s?: string, n = 64) => (s ? (s.length > n ? s.slice(0, n) + "…(" + s.length + ")" : s) : s);

    log("start path:", path, "| method:", req.method, "| ct:", ct);

    // read body (best-effort)
    let body: any, rawText: string | undefined, kind: "json" | "form" | "text" | "none" = "none";
    try {
        if (ct.includes("json")) {
            body = await clone.json();
            kind = "json";
        } else if (ct.includes("form")) {
            const fd = await clone.formData();
            const o: any = {};
            fd.forEach((v, k) => o[k] = typeof v === "string" ? v : "");
            body = o;
            kind = "form";
        } else {
            rawText = await clone.text();
            body = rawText || undefined;
            kind = rawText ? "text" : "none";
        }
    } catch {
        body = undefined;
        kind = "none";
    }

    if (kind === "json" || kind === "form") {
        const keys = Object.keys(body || {});
        log("parsed", kind, "keys:", keys.slice(0, 12), keys.length > 12 ? `(+${keys.length - 12} more)` : "");
    } else if (kind === "text") {
        log("raw text:", redact(rawText));
    } else {
        log("no body to parse (OPTIONS/preflight or GET without body)");
    }

    // helpers
    const pick = (o: any, ks: string[]) => {
        for (const k of ks) {
            const v = o?.[k];
            if (v != null && v !== "") return String(v);
        }
    };
    const norm = (v: any) => {
        if (v == null) return null;
        let s = String(v).trim().replace(/[^\d,.\-]/g, "");
        if (s.includes(",") && s.includes(".")) s = s.lastIndexOf(".") > s.lastIndexOf(",") ? s.replace(/,/g, "") : s.replace(/\./g, "").replace(",", "."); else s = s.includes(",") && /,\d{2}$/.test(s) ? s.replace(",", ".") : s.replace(/,/g, "");
        const n = +s;
        return Number.isFinite(n) ? n : null;
    };
    const mask = (v?: string) => v ? (/\d{6,}/.test(v.replace(/\s+/g, "")) ? `****${v.replace(/\s+/g, "").slice(-4)}` : v) : v;
    const sha = async (s: string) => {
        const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
        return Array.from(new Uint8Array(d), b => b.toString(16).padStart(2, "0")).join("");
    };

    // inference
    let type: "login" | "transaction" | "generic" = "generic",
        payload: any = (kind === "json" || kind === "form") ? body : {};
    const qUser = u.searchParams.get("username") || u.searchParams.get("user") || u.searchParams.get("email");
    const bUser = (kind === "json" || kind === "form") ? pick(body, ["username", "user", "email", "login", "uid"]) : undefined;
    const uuid = (kind === "json" || kind === "form") ? pick(body, ["uuid", "userId", "id"]) : undefined;
    const amtV = (kind === "json" || kind === "form") ? norm(pick(body, ["amount", "sum", "value", "amt"])) : null;
    const txHit = (kind === "json" || kind === "form") ? (amtV !== null || pick(body, ["toAccount", "beneficiary", "payeeValue", "iban", "accountTo"])) : false;
    const lgHit = !!(bUser || qUser || uuid);

    log("picks:", {username: bUser || qUser || null, uuid: uuid || null, amount: amtV, txHit, lgHit});

    if (lgHit && !txHit) {
        type = "login";
        payload = {userId: (bUser || qUser) ? await sha(bUser || qUser) : undefined, uuid};
    } else if (txHit) {
        type = "transaction";
        payload = {
            amount: amtV,
            payeeValue: mask((kind === "json" || kind === "form") ? pick(body, ["payeeValue", "toAccount", "beneficiary", "dest", "iban", "accountTo"]) : undefined),
            payerValue: mask((kind === "json" || kind === "form") ? pick(body, ["payerValue", "fromAccount", "source", "accountFrom"]) : undefined),
            payeeName: (kind === "json" || kind === "form") ? pick(body, ["payeeName", "beneficiaryName", "toName", "recipient"]) : undefined,
            payeeBankCode: (kind === "json" || kind === "form") ? pick(body, ["payeeBankCode", "bankCode", "swift", "bic", "branchCode"]) : undefined
        };
    }

    const data = {
        type,
        customerId: env.CUSTOMER_ID,
        brand: env.BRAND,
        path,
        method: req.method,
        ts: Date.now(),
        csid: h.get("cookie")?.match(/(?:^|;\s*)csid=([^;]+)/)?.[1],
        ip: h.get("cf-connecting-ip") || undefined,
        ua: h.get("user-agent") || undefined,
        referer: h.get("referer") || undefined,
        query: Object.fromEntries(u.searchParams.entries()),
        payload
    };

    log("data:", data);
    return data;
}