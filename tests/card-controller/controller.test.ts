import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CameraManager } from '../../src/camera-manager/manager';
import { ActionsManager } from '../../src/card-controller/actions/actions-manager';
import { AutomationsManager } from '../../src/card-controller/automations-manager';
import { CameraURLManager } from '../../src/card-controller/camera-url-manager';
import {
  CardElementManager,
  CardHTMLElement,
} from '../../src/card-controller/card-element-manager';
import { ConditionsManager } from '../../src/card-controller/conditions-manager';
import { ConfigManager } from '../../src/card-controller/config/config-manager';
import { CardController } from '../../src/card-controller/controller';
import { DefaultManager } from '../../src/card-controller/default-manager';
import { DownloadManager } from '../../src/card-controller/download-manager';
import { ExpandManager } from '../../src/card-controller/expand-manager';
import { FullscreenManager } from '../../src/card-controller/fullscreen-manager';
import { HASSManager } from '../../src/card-controller/hass/hass-manager';
import { InitializationManager } from '../../src/card-controller/initialization-manager';
import { InteractionManager } from '../../src/card-controller/interaction-manager';
import { KeyboardStateManager } from '../../src/card-controller/keyboard-state-manager';
import { MediaLoadedInfoManager } from '../../src/card-controller/media-info-manager';
import { MediaPlayerManager } from '../../src/card-controller/media-player-manager';
import { MessageManager } from '../../src/card-controller/message-manager';
import { MicrophoneManager } from '../../src/card-controller/microphone-manager';
import { QueryStringManager } from '../../src/card-controller/query-string-manager';
import { StatusBarItemManager } from '../../src/card-controller/status-bar-item-manager';
import { StyleManager } from '../../src/card-controller/style-manager';
import { TriggersManager } from '../../src/card-controller/triggers-manager';
import { ViewManager } from '../../src/card-controller/view/view-manager';
import { FrigateCardEditor } from '../../src/editor';
import { DeviceRegistryManager } from '../../src/utils/ha/registry/device';
import { EntityRegistryManager } from '../../src/utils/ha/registry/entity';
import { ResolvedMediaCache } from '../../src/utils/ha/resolved-media';

vi.mock('../../src/camera-manager/manager');
vi.mock('../../src/card-controller/actions/actions-manager');
vi.mock('../../src/card-controller/automations-manager');
vi.mock('../../src/card-controller/camera-url-manager');
vi.mock('../../src/card-controller/card-element-manager');
vi.mock('../../src/card-controller/conditions-manager');
vi.mock('../../src/card-controller/config/config-manager');
vi.mock('../../src/card-controller/default-manager');
vi.mock('../../src/card-controller/download-manager');
vi.mock('../../src/card-controller/expand-manager');
vi.mock('../../src/card-controller/fullscreen-manager');
vi.mock('../../src/card-controller/hass/hass-manager');
vi.mock('../../src/card-controller/initialization-manager');
vi.mock('../../src/card-controller/interaction-manager');
vi.mock('../../src/card-controller/keyboard-state-manager');
vi.mock('../../src/card-controller/media-info-manager');
vi.mock('../../src/card-controller/media-player-manager');
vi.mock('../../src/card-controller/message-manager');
vi.mock('../../src/card-controller/microphone-manager');
vi.mock('../../src/card-controller/query-string-manager');
vi.mock('../../src/card-controller/status-bar-item-manager');
vi.mock('../../src/card-controller/style-manager');
vi.mock('../../src/card-controller/triggers-manager');
vi.mock('../../src/card-controller/view/view-manager');
vi.mock('../../src/utils/ha/registry/device');
vi.mock('../../src/utils/ha/registry/entity');
vi.mock('../../src/utils/ha/resolved-media');

const createCardElement = (): CardHTMLElement => {
  const element = document.createElement('div') as unknown as CardHTMLElement;
  element.addController = vi.fn();
  return element;
};

const createController = (): CardController => {
  return new CardController(createCardElement(), vi.fn(), vi.fn(), vi.fn());
};

// @vitest-environment jsdom
describe('CardController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should construct correctly', () => {
    const element = createCardElement();
    const scrollCallback = vi.fn();
    const menuToggleCallback = vi.fn();
    const conditionListener = vi.fn();

    const manager = new CardController(
      element,
      scrollCallback,
      menuToggleCallback,
      conditionListener,
    );

    expect(ConditionsManager).toBeCalledWith(manager, conditionListener);
    expect(CardElementManager).toBeCalledWith(
      manager,
      element,
      scrollCallback,
      menuToggleCallback,
    );
  });

  describe('accessors', () => {
    it('getActionsManager', () => {
      expect(createController().getActionsManager()).toBe(
        vi.mocked(ActionsManager).mock.instances[0],
      );
    });

    it('getAutomationsManager', () => {
      expect(createController().getAutomationsManager()).toBe(
        vi.mocked(AutomationsManager).mock.instances[0],
      );
    });

    it('getDefaultManager', () => {
      expect(createController().getDefaultManager()).toBe(
        vi.mocked(DefaultManager).mock.instances[0],
      );
    });

    it('getCameraManager', () => {
      expect(createController().getCameraManager()).toBe(
        vi.mocked(CameraManager).mock.instances[0],
      );
    });

    it('getCameraURLManager', () => {
      expect(createController().getCameraURLManager()).toBe(
        vi.mocked(CameraURLManager).mock.instances[0],
      );
    });

    it('getCardElementManager', () => {
      expect(createController().getCardElementManager()).toBe(
        vi.mocked(CardElementManager).mock.instances[0],
      );
    });

    it('getConditionsManager', () => {
      expect(createController().getConditionsManager()).toBe(
        vi.mocked(ConditionsManager).mock.instances[0],
      );
    });

    it('getConfigElement', async () => {
      expect((await CardController.getConfigElement()) instanceof FrigateCardEditor);
    });

    it('getConfigManager', () => {
      expect(createController().getConfigManager()).toBe(
        vi.mocked(ConfigManager).mock.instances[0],
      );
    });

    it('getDeviceRegistryManager', () => {
      expect(createController().getDeviceRegistryManager()).toBe(
        vi.mocked(DeviceRegistryManager).mock.instances[0],
      );
    });

    it('getDownloadManager', () => {
      expect(createController().getDownloadManager()).toBe(
        vi.mocked(DownloadManager).mock.instances[0],
      );
    });

    it('getEntityRegistryManager', () => {
      expect(createController().getEntityRegistryManager()).toBe(
        vi.mocked(EntityRegistryManager).mock.instances[0],
      );
    });

    it('getExpandManager', () => {
      expect(createController().getExpandManager()).toBe(
        vi.mocked(ExpandManager).mock.instances[0],
      );
    });

    it('getFullscreenManager', () => {
      expect(createController().getFullscreenManager()).toBe(
        vi.mocked(FullscreenManager).mock.instances[0],
      );
    });

    it('getHASSManager', () => {
      expect(createController().getHASSManager()).toBe(
        vi.mocked(HASSManager).mock.instances[0],
      );
    });

    it('getInitializationManager', () => {
      expect(createController().getInitializationManager()).toBe(
        vi.mocked(InitializationManager).mock.instances[0],
      );
    });

    it('getInteractionManager', () => {
      expect(createController().getInteractionManager()).toBe(
        vi.mocked(InteractionManager).mock.instances[0],
      );
    });

    it('getKeyboardStateManager', () => {
      expect(createController().getKeyboardStateManager()).toBe(
        vi.mocked(KeyboardStateManager).mock.instances[0],
      );
    });

    it('getMediaLoadedInfoManager', () => {
      expect(createController().getMediaLoadedInfoManager()).toBe(
        vi.mocked(MediaLoadedInfoManager).mock.instances[0],
      );
    });

    it('getMediaPlayerManager', () => {
      expect(createController().getMediaPlayerManager()).toBe(
        vi.mocked(MediaPlayerManager).mock.instances[0],
      );
    });

    it('getMessageManager', () => {
      expect(createController().getMessageManager()).toBe(
        vi.mocked(MessageManager).mock.instances[0],
      );
    });

    it('getMicrophoneManager', () => {
      expect(createController().getMicrophoneManager()).toBe(
        vi.mocked(MicrophoneManager).mock.instances[0],
      );
    });

    it('getResolvedMediaCache', () => {
      expect(createController().getResolvedMediaCache()).toBe(
        vi.mocked(ResolvedMediaCache).mock.instances[0],
      );
    });

    describe('getStubConfig', () => {
      it('with camera entities', () => {
        expect(
          CardController.getStubConfig(['camera.office', 'binary_sensor.motion']),
        ).toEqual({
          cameras: [{ camera_entity: 'camera.office' }],
        });
      });

      it('without camera entities', () => {
        expect(CardController.getStubConfig(['binary_sensor.motion'])).toEqual({
          cameras: [{ camera_entity: 'camera.demo' }],
        });
      });
    });

    it('getQueryStringManager', () => {
      expect(createController().getQueryStringManager()).toBe(
        vi.mocked(QueryStringManager).mock.instances[0],
      );
    });

    it('getStatusBarItemManager', () => {
      expect(createController().getStatusBarItemManager()).toBe(
        vi.mocked(StatusBarItemManager).mock.instances[0],
      );
    });

    it('getStyleManager', () => {
      expect(createController().getStyleManager()).toBe(
        vi.mocked(StyleManager).mock.instances[0],
      );
    });

    it('getTriggersManager', () => {
      expect(createController().getTriggersManager()).toBe(
        vi.mocked(TriggersManager).mock.instances[0],
      );
    });

    it('getViewManager', () => {
      expect(createController().getViewManager()).toBe(
        vi.mocked(ViewManager).mock.instances[0],
      );
    });
  });

  describe('handlers', () => {
    it('hostConnected', () => {
      createController().hostConnected();
      expect(
        vi.mocked(CardElementManager).mock.instances[0].elementConnected,
      ).toBeCalled();
    });

    it('hostDisconnected', () => {
      createController().hostDisconnected();
      expect(
        vi.mocked(CardElementManager).mock.instances[0].elementDisconnected,
      ).toBeCalled();
    });
  });
});
