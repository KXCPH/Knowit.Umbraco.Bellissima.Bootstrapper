import { UmbElementMixin as f } from "@umbraco-cms/backoffice/element-api";
import { h as l, k as p, t as v } from "./custom-element-xE0l4O92.js";
var m = Object.defineProperty, a = Object.getOwnPropertyDescriptor, u = (c, r, o, t) => {
  for (var e = t > 1 ? void 0 : t ? a(r, o) : r, n = c.length - 1, s; n >= 0; n--)
    (s = c[n]) && (e = (t ? s(r, o, e) : s(e)) || e);
  return t && e && m(r, o, e), e;
};
let i = class extends f(l) {
  constructor() {
    super();
  }
  render() {
    return p`<div>Hello from a tree</div>`;
  }
};
i = u([
  v("knowit-section-tree")
], i);
const P = i;
export {
  i as SectionTree,
  P as default
};
//# sourceMappingURL=section-tree-CbVc3a05.js.map
