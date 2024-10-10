import { CSSResultGroup, LitElement, TemplateResult, html, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import overlayStyle from '../scss/overlay.scss';

@customElement('frigate-card-overlay')
export class FrigateCardOverlay extends LitElement {
  protected render(): TemplateResult | void {
    return html`
      <slot name="top"></slot>
      <slot name="left"></slot>
      <slot name="right"></slot>
      <slot name="bottom"></slot>
    `;
  }

  static get styles(): CSSResultGroup {
    return unsafeCSS(overlayStyle);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'frigate-card-overlay': FrigateCardOverlay;
  }
}
