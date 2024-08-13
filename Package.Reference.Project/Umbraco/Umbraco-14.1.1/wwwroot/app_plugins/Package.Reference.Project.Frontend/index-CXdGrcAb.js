import { UMB_AUTH_CONTEXT as r } from "@umbraco-cms/backoffice/auth";
class c {
  constructor() {
    this._fns = [];
  }
  eject(e) {
    const t = this._fns.indexOf(e);
    t !== -1 && (this._fns = [...this._fns.slice(0, t), ...this._fns.slice(t + 1)]);
  }
  use(e) {
    this._fns = [...this._fns, e];
  }
}
const n = {
  BASE: "",
  CREDENTIALS: "include",
  ENCODE_PATH: void 0,
  HEADERS: void 0,
  PASSWORD: void 0,
  TOKEN: void 0,
  USERNAME: void 0,
  VERSION: "1.0",
  WITH_CREDENTIALS: !1,
  interceptors: {
    request: new c(),
    response: new c()
  }
}, l = async (o, e) => {
  o.consumeContext(r, async (s) => {
    if (!s) return;
    const i = s.getOpenApiConfiguration();
    n.BASE = i.base, n.TOKEN = i.token, n.WITH_CREDENTIALS = i.withCredentials, n.CREDENTIALS = i.credentials;
  });
  const t = {
    alias: "myCustomSection",
    name: "My Custom Section",
    type: "section",
    meta: {
      label: "Knowit",
      pathname: "knowit"
    }
  }, a = {
    alias: "myCustomSectionView",
    name: "My Custom Section View",
    type: "sectionView",
    elementName: "knowit-section-view",
    js: () => import("./section-view-BuCHtd9l.js"),
    meta: {
      label: "Knowit",
      pathname: "knowit",
      icon: "icon-umb-contour"
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "myCustomSection"
      }
    ]
  }, m = {
    alias: "myCustomSectionTree",
    name: "My Custom Section Tree",
    type: "sectionSidebarApp",
    elementName: "knowit-section-tree",
    js: () => import("./section-tree-CbVc3a05.js"),
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "myCustomSection"
      }
    ]
  };
  e.register(t), e.register(a), e.register(m);
};
export {
  n as O,
  l as o
};
//# sourceMappingURL=index-CXdGrcAb.js.map
