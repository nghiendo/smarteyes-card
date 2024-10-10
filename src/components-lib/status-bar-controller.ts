import { HASSDomEvent } from '@dermotduffy/custom-card-helpers';
import { LitElement } from 'lit';
import isEqual from 'lodash-es/isEqual';
import orderBy from 'lodash-es/orderBy';
import { dispatchActionExecutionRequest } from '../card-controller/actions/utils/execution-request';
import {
  ActionsConfig,
  FRIGATE_STATUS_BAR_PRIORITY_DEFAULT,
  StatusBarConfig,
  StatusBarItem,
} from '../config/types';
import { getActionConfigGivenAction } from '../utils/action';
import { arrayify, setOrRemoveAttribute } from '../utils/basic';
import { Timer } from '../utils/timer';

export class StatusBarController {
  protected _host: LitElement;
  protected _config: StatusBarConfig | null = null;

  protected _popupTimer = new Timer();
  protected _items: StatusBarItem[] = [];

  constructor(host: LitElement) {
    this._host = host;
  }

  public getRenderItems(): StatusBarItem[] {
    return this._items;
  }

  public setItems(items: StatusBarItem[]): void {
    const exclusiveItems = items.filter((item) => !!item.exclusive);

    const newItems = orderBy(
      exclusiveItems.length ? exclusiveItems : items,
      (item) => item.priority ?? FRIGATE_STATUS_BAR_PRIORITY_DEFAULT,
      'desc',
    );

    const sufficientBefore = this._getSufficientValues(this._items);
    const sufficientAfter = this._getSufficientValues(newItems);

    this._items = newItems;

    if (this._config?.style === 'popup' && !isEqual(sufficientBefore, sufficientAfter)) {
      this._show();
      this._popupTimer.start(this._config.popup_seconds, () => this._hide());
    }

    this._host.requestUpdate();
  }

  public setConfig(config: StatusBarConfig): void {
    this._config = config;
    this._host.style.setProperty(
      '--frigate-card-status-bar-height',
      `${config.height}px`,
    );

    this._host.setAttribute('data-style', config.style);
    this._host.setAttribute('data-position', config.position);

    if (this._config?.style !== 'popup') {
      this._show();
    }

    this._host.requestUpdate();
  }

  public shouldRender(): boolean {
    return this._items.some((item) => item.enabled !== false && item.sufficient);
  }

  public actionHandler(
    ev: HASSDomEvent<{ action: string; config?: ActionsConfig }>,
    config?: ActionsConfig,
  ): void {
    // These interactions should only be handled by the status bar, as nothing
    // upstream has the user-provided configuration.
    ev.stopPropagation();

    const interaction: string = ev.detail.action;
    const action = getActionConfigGivenAction(interaction, config);
    if (!action) {
      return;
    }

    dispatchActionExecutionRequest(this._host, {
      action: arrayify(action),
      config: config,
    });
  }

  protected _getSufficientValue(item: StatusBarItem): string | null {
    /* istanbul ignore else: cannot happen -- @preserve */
    if (item.type === 'custom:frigate-card-status-bar-icon') {
      return item.icon;
    } else if (item.type === 'custom:frigate-card-status-bar-string') {
      return item.string;
    } else if (item.type === 'custom:frigate-card-status-bar-image') {
      return item.image;
    } else {
      return null;
    }
  }

  protected _getSufficientValues(items: StatusBarItem[]): (string | null)[] {
    return items
      .filter((item) => item.enabled !== false && item.sufficient)
      .map((item) => this._getSufficientValue(item));
  }

  protected _show(): void {
    setOrRemoveAttribute(this._host, false, 'hide');
  }

  protected _hide(): void {
    setOrRemoveAttribute(this._host, true, 'hide');
  }
}
