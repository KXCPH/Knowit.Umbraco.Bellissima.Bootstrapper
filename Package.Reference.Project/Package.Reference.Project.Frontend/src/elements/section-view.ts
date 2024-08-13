import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { V1Service } from "../api";


@customElement('knowit-section-view')
export class SectionView extends UmbElementMixin(LitElement) {

  #apiresult = '';

    constructor() {
        super();
        
        V1Service.getApiV1PackageReferenceProjectExample().then((response) => {
          this.#apiresult = response;
          this.requestUpdate();
        });
    }

    render() {
        return html`
        <div>
          hello from a view <hr />
          <p>API: ${this.#apiresult}</p>
        </div>
        `;
      }
}

export default SectionView;

declare global {
  interface HTMLElementTagNameMap {
    'knowit-section-view': SectionView;
  }
}