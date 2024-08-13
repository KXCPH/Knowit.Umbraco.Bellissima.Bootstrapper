import { UmbElementMixin as C } from "@umbraco-cms/backoffice/element-api";
import { h as E, k as j, t as P } from "./custom-element-xE0l4O92.js";
import { O as A } from "./index-CXdGrcAb.js";
class b extends Error {
  constructor(e, r, n) {
    super(n), this.name = "ApiError", this.url = r.url, this.status = r.status, this.statusText = r.statusText, this.body = r.body, this.request = e;
  }
}
class q extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
class O {
  constructor(e) {
    this._isResolved = !1, this._isRejected = !1, this._isCancelled = !1, this.cancelHandlers = [], this.promise = new Promise((r, n) => {
      this._resolve = r, this._reject = n;
      const s = (o) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isResolved = !0, this._resolve && this._resolve(o));
      }, a = (o) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isRejected = !0, this._reject && this._reject(o));
      }, i = (o) => {
        this._isResolved || this._isRejected || this._isCancelled || this.cancelHandlers.push(o);
      };
      return Object.defineProperty(i, "isResolved", {
        get: () => this._isResolved
      }), Object.defineProperty(i, "isRejected", {
        get: () => this._isRejected
      }), Object.defineProperty(i, "isCancelled", {
        get: () => this._isCancelled
      }), e(s, a, i);
    });
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(e, r) {
    return this.promise.then(e, r);
  }
  catch(e) {
    return this.promise.catch(e);
  }
  finally(e) {
    return this.promise.finally(e);
  }
  cancel() {
    if (!(this._isResolved || this._isRejected || this._isCancelled)) {
      if (this._isCancelled = !0, this.cancelHandlers.length)
        try {
          for (const e of this.cancelHandlers)
            e();
        } catch (e) {
          console.warn("Cancellation threw an error", e);
          return;
        }
      this.cancelHandlers.length = 0, this._reject && this._reject(new q("Request aborted"));
    }
  }
  get isCancelled() {
    return this._isCancelled;
  }
}
const l = (t) => typeof t == "string", f = (t) => l(t) && t !== "", y = (t) => t instanceof Blob, w = (t) => t instanceof FormData, x = (t) => {
  try {
    return btoa(t);
  } catch {
    return Buffer.from(t).toString("base64");
  }
}, D = (t) => {
  const e = [], r = (s, a) => {
    e.push(`${encodeURIComponent(s)}=${encodeURIComponent(String(a))}`);
  }, n = (s, a) => {
    a != null && (a instanceof Date ? r(s, a.toISOString()) : Array.isArray(a) ? a.forEach((i) => n(s, i)) : typeof a == "object" ? Object.entries(a).forEach(([i, o]) => n(`${s}[${i}]`, o)) : r(s, a));
  };
  return Object.entries(t).forEach(([s, a]) => n(s, a)), e.length ? `?${e.join("&")}` : "";
}, N = (t, e) => {
  const r = encodeURI, n = e.url.replace("{api-version}", t.VERSION).replace(/{(.*?)}/g, (a, i) => {
    var o;
    return (o = e.path) != null && o.hasOwnProperty(i) ? r(String(e.path[i])) : a;
  }), s = t.BASE + n;
  return e.query ? s + D(e.query) : s;
}, H = (t) => {
  if (t.formData) {
    const e = new FormData(), r = (n, s) => {
      l(s) || y(s) ? e.append(n, s) : e.append(n, JSON.stringify(s));
    };
    return Object.entries(t.formData).filter(([, n]) => n != null).forEach(([n, s]) => {
      Array.isArray(s) ? s.forEach((a) => r(n, a)) : r(n, s);
    }), e;
  }
}, u = async (t, e) => typeof e == "function" ? e(t) : e, I = async (t, e) => {
  const [r, n, s, a] = await Promise.all([
    // @ts-ignore
    u(e, t.TOKEN),
    // @ts-ignore
    u(e, t.USERNAME),
    // @ts-ignore
    u(e, t.PASSWORD),
    // @ts-ignore
    u(e, t.HEADERS)
  ]), i = Object.entries({
    Accept: "application/json",
    ...a,
    ...e.headers
  }).filter(([, o]) => o != null).reduce((o, [d, c]) => ({
    ...o,
    [d]: String(c)
  }), {});
  if (f(r) && (i.Authorization = `Bearer ${r}`), f(n) && f(s)) {
    const o = x(`${n}:${s}`);
    i.Authorization = `Basic ${o}`;
  }
  return e.body !== void 0 && (e.mediaType ? i["Content-Type"] = e.mediaType : y(e.body) ? i["Content-Type"] = e.body.type || "application/octet-stream" : l(e.body) ? i["Content-Type"] = "text/plain" : w(e.body) || (i["Content-Type"] = "application/json")), new Headers(i);
}, U = (t) => {
  var e, r;
  if (t.body !== void 0)
    return (e = t.mediaType) != null && e.includes("application/json") || (r = t.mediaType) != null && r.includes("+json") ? JSON.stringify(t.body) : l(t.body) || y(t.body) || w(t.body) ? t.body : JSON.stringify(t.body);
}, $ = async (t, e, r, n, s, a, i) => {
  const o = new AbortController();
  let d = {
    headers: a,
    body: n ?? s,
    method: e.method,
    signal: o.signal
  };
  t.WITH_CREDENTIALS && (d.credentials = t.CREDENTIALS);
  for (const c of t.interceptors.request._fns)
    d = await c(d);
  return i(() => o.abort()), await fetch(r, d);
}, B = (t, e) => {
  if (e) {
    const r = t.headers.get(e);
    if (l(r))
      return r;
  }
}, F = async (t) => {
  if (t.status !== 204)
    try {
      const e = t.headers.get("Content-Type");
      if (e) {
        const r = ["application/octet-stream", "application/pdf", "application/zip", "audio/", "image/", "video/"];
        if (e.includes("application/json") || e.includes("+json"))
          return await t.json();
        if (r.some((n) => e.includes(n)))
          return await t.blob();
        if (e.includes("multipart/form-data"))
          return await t.formData();
        if (e.includes("text/"))
          return await t.text();
      }
    } catch (e) {
      console.error(e);
    }
}, k = (t, e) => {
  const n = {
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "Im a teapot",
    421: "Misdirected Request",
    422: "Unprocessable Content",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required",
    ...t.errors
  }[e.status];
  if (n)
    throw new b(t, e, n);
  if (!e.ok) {
    const s = e.status ?? "unknown", a = e.statusText ?? "unknown", i = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new b(
      t,
      e,
      `Generic Error: status: ${s}; status text: ${a}; body: ${i}`
    );
  }
}, L = (t, e) => new O(async (r, n, s) => {
  try {
    const a = N(t, e), i = H(e), o = U(e), d = await I(t, e);
    if (!s.isCancelled) {
      let c = await $(t, e, a, o, i, d, s);
      for (const v of t.interceptors.response._fns)
        c = await v(c);
      const m = await F(c), S = B(c, e.responseHeader);
      let _ = m;
      e.responseTransformer && c.ok && (_ = await e.responseTransformer(m));
      const R = {
        url: a,
        ok: c.ok,
        status: c.status,
        statusText: c.statusText,
        body: S ?? _
      };
      k(e, R), r(R.body);
    }
  } catch (a) {
    n(a);
  }
});
class V {
  /**
   * @returns string OK
   * @throws ApiError
   */
  static getApiV1PackageReferenceProjectExample() {
    return L(A, {
      method: "GET",
      url: "/api/v1/Package.Reference.Project/example",
      errors: {
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
}
var M = Object.defineProperty, G = Object.getOwnPropertyDescriptor, g = (t) => {
  throw TypeError(t);
}, W = (t, e, r, n) => {
  for (var s = n > 1 ? void 0 : n ? G(e, r) : e, a = t.length - 1, i; a >= 0; a--)
    (i = t[a]) && (s = (n ? i(e, r, s) : i(s)) || s);
  return n && s && M(e, r, s), s;
}, T = (t, e, r) => e.has(t) || g("Cannot " + r), z = (t, e, r) => (T(t, e, "read from private field"), r ? r.call(t) : e.get(t)), J = (t, e, r) => e.has(t) ? g("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, r), K = (t, e, r, n) => (T(t, e, "write to private field"), e.set(t, r), r), h;
let p = class extends C(E) {
  constructor() {
    super(), J(this, h, ""), V.getApiV1PackageReferenceProjectExample().then((t) => {
      K(this, h, t), this.requestUpdate();
    });
  }
  render() {
    return j`
        <div>
          hello from a view <hr />
          <p>API: ${z(this, h)}</p>
        </div>
        `;
  }
};
h = /* @__PURE__ */ new WeakMap();
p = W([
  P("knowit-section-view")
], p);
const Z = p;
export {
  p as SectionView,
  Z as default
};
//# sourceMappingURL=section-view-BuCHtd9l.js.map
