import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement('knowit-section-tree')
export class SectionTree extends UmbElementMixin(LitElement) {

    constructor() {
        super();
    }

    render() {
        return html`<div>Hello from a tree</div>`;
      }
}

export default SectionTree;

declare global {
  interface HTMLElementTagNameMap {
    'knowit-section-tree': SectionTree;
  }
}