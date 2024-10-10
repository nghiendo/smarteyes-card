import { CreatePluginType, LoosePluginType } from 'embla-carousel/components/Plugins';
import {
  CSSResultGroup,
  LitElement,
  PropertyValues,
  TemplateResult,
  html,
  unsafeCSS,
} from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import { TransitionEffect } from '../config/types';
import carouselStyle from '../scss/carousel.scss';
import {
  CarouselController,
  CarouselDirection,
} from '../utils/embla/carousel-controller';

export type EmblaCarouselPlugins = CreatePluginType<
  LoosePluginType,
  Record<string, unknown>
>[];

@customElement('frigate-card-carousel')
export class FrigateCardCarousel extends LitElement {
  @property({ attribute: true, reflect: true })
  public direction: CarouselDirection = 'horizontal';

  @property({ attribute: true })
  public transitionEffect?: TransitionEffect;

  @property({ attribute: false })
  public loop?: boolean;

  @property({ attribute: false })
  public dragFree?: boolean;

  @property({ attribute: false })
  public dragEnabled = true;

  @property({ attribute: false })
  public plugins?: EmblaCarouselPlugins;

  @property({ attribute: false })
  public selected = 0;

  protected _refParent: Ref<HTMLSlotElement> = createRef();
  protected _refRoot: Ref<HTMLElement> = createRef();
  protected _carousel: CarouselController | null = null;

  connectedCallback(): void {
    super.connectedCallback();

    // Guarantee recreation of carousel if the component is reconnected.
    this.requestUpdate();
  }

  disconnectedCallback(): void {
    // Destroy the carousel when the component is disconnected, which forces the
    // plugins (which may have registered event handlers) to also be destroyed.
    // The carousel will automatically reconstruct if the component is re-rendered.
    this._carousel?.destroy();
    this._carousel = null;
    super.disconnectedCallback();
  }

  protected willUpdate(changedProps: PropertyValues): void {
    if (changedProps.has('direction')) {
      this.setAttribute('direction', this.direction);
    }

    const destroyProperties = [
      'direction',
      'dragEnabled',
      'dragFree',
      'loop',
      'plugins',
      'transitionEffect',
    ] as const;
    if (destroyProperties.some((prop) => changedProps.has(prop))) {
      this._carousel?.destroy();
      this._carousel = null;
    }
  }

  protected render(): TemplateResult | void {
    return html` <div class="embla">
      <slot name="previous"></slot>
      <div ${ref(this._refRoot)} class="embla__viewport">
        <div class="embla__container">
          <slot ${ref(this._refParent)}></slot>
        </div>
      </div>
      <slot name="next"></slot>
    </div>`;
  }

  protected updated(changedProps: PropertyValues): void {
    if (!this._carousel && this._refRoot.value && this._refParent.value) {
      this._carousel = new CarouselController(
        this._refRoot.value,
        this._refParent.value,
        {
          direction: this.direction,
          dragEnabled: this.dragEnabled,
          dragFree: this.dragFree,
          startIndex: this.selected,
          transitionEffect: this.transitionEffect,
          loop: this.loop,
          plugins: this.plugins,
        },
      );
    } else if (changedProps.has('selected')) {
      this._carousel?.selectSlide(this.selected);
    }
  }

  static get styles(): CSSResultGroup {
    return unsafeCSS(carouselStyle);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'frigate-card-carousel': FrigateCardCarousel;
  }
}
