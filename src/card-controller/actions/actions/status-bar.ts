import { StatusBarActionConfig } from '../../../config/types';
import { CardActionsAPI } from '../../types';
import { FrigateCardAction } from './base';

export class StatusBarAction extends FrigateCardAction<StatusBarActionConfig> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(api: CardActionsAPI): Promise<void> {
    switch (this._action.status_bar_action) {
      case 'reset':
        api.getStatusBarItemManager().removeAllDynamicStatusBarItems();
        break;
      case 'add':
        this._action.items?.forEach((item) =>
          api.getStatusBarItemManager().addDynamicStatusBarItem(item),
        );
        break;
      case 'remove':
        this._action.items?.forEach((item) =>
          api.getStatusBarItemManager().removeDynamicStatusBarItem(item),
        );
        break;
    }
  }
}
