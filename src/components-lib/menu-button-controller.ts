import { HomeAssistant } from '@dermotduffy/custom-card-helpers';
import { StyleInfo } from 'lit/directives/style-map';
import { CameraManager } from '../camera-manager/manager';
import { MediaPlayerManager } from '../card-controller/media-player-manager';
import { MicrophoneManager } from '../card-controller/microphone-manager';
import { ViewManager } from '../card-controller/view/view-manager';
import {
  FRIGATE_CARD_VIEWS_USER_SPECIFIED,
  FrigateCardConfig,
  FrigateCardCustomAction,
  MenuItem,
} from '../config/types';
import { FRIGATE_BUTTON_MENU_ICON } from '../const';
import { localize } from '../localize/localize.js';
import { MediaLoadedInfo } from '../types';
import {
  createCameraAction,
  createPTZMultiAction,
  createDisplayModeAction,
  createMediaPlayerAction,
  createPTZControlsAction,
  createGeneralAction,
} from '../utils/action';
import { isTruthy } from '../utils/basic';
import { getEntityIcon, getEntityTitle } from '../utils/ha';
import { getPTZTarget } from '../utils/ptz';
import { getStreamCameraID, hasSubstream } from '../utils/substream';
import { View } from '../view/view';
import { getCameraIDsForViewName } from '../view/view-to-cameras';

export interface MenuButtonControllerOptions {
  currentMediaLoadedInfo?: MediaLoadedInfo | null;
  showCameraUIButton?: boolean;
  inFullscreenMode?: boolean;
  inExpandedMode?: boolean;
  microphoneManager?: MicrophoneManager | null;
  mediaPlayerController?: MediaPlayerManager | null;
  viewManager?: ViewManager | null;
  view?: View | null;
}

export class MenuButtonController {
  // Array of dynamic menu buttons to be added to menu.
  protected _dynamicMenuButtons: MenuItem[] = [];

  public addDynamicMenuButton(button: MenuItem): void {
    if (!this._dynamicMenuButtons.includes(button)) {
      this._dynamicMenuButtons.push(button);
    }
  }

  public removeDynamicMenuButton(button: MenuItem): void {
    this._dynamicMenuButtons = this._dynamicMenuButtons.filter(
      (existingButton) => existingButton != button,
    );
  }

  /**
   * Get the menu buttons to display.
   * @returns An array of menu buttons.
   */
  public calculateButtons(
    hass: HomeAssistant,
    config: FrigateCardConfig,
    cameraManager: CameraManager,
    options?: MenuButtonControllerOptions,
  ): MenuItem[] {
    return [
      this._getFrigateButton(config),
      this._getCamerasButton(config, cameraManager, options?.view),
      this._getSubstreamsButton(config, cameraManager, options?.view),
      this._getLiveButton(config, options?.view, options?.viewManager),
      this._getClipsButton(config, options?.view, options?.viewManager),
      this._getSnapshotsButton(config, options?.view, options?.viewManager),
      this._getRecordingsButton(config, options?.view, options?.viewManager),
      this._getImageButton(config, options?.view, options?.viewManager),
      this._getTimelineButton(config, options?.view, options?.viewManager),
      this._getDownloadButton(config, cameraManager, options?.view),
      this._getCameraUIButton(config, options?.showCameraUIButton),
      this._getMicrophoneButton(
        config,
        options?.microphoneManager,
        options?.currentMediaLoadedInfo,
      ),
      this._getExpandButton(config, options?.inExpandedMode),
      this._getFullscreenButton(config, options?.inFullscreenMode),
      this._getCastButton(
        hass,
        config,
        cameraManager,
        options?.view,
        options?.mediaPlayerController,
      ),
      this._getPlayPauseButton(config, options?.currentMediaLoadedInfo),
      this._getMuteUnmuteButton(config, options?.currentMediaLoadedInfo),
      this._getScreenshotButton(config, options?.currentMediaLoadedInfo),
      this._getDisplayModeButton(config, cameraManager, options?.view),
      this._getPTZControlsButton(config, cameraManager, options?.view),
      this._getPTZHomeButton(config, cameraManager, options?.view),

      ...this._dynamicMenuButtons.map((button) => ({
        style: this._getStyleFromActions(config, button, options),
        ...button,
      })),
    ].filter(isTruthy);
  }

  protected _getFrigateButton(config: FrigateCardConfig): MenuItem {
    return {
      // Use a magic icon value that the menu will use to render the custom
      // Frigate icon.
      icon: FRIGATE_BUTTON_MENU_ICON,
      ...config.menu.buttons.frigate,
      type: 'custom:frigate-card-menu-icon',
      title: localize('config.menu.buttons.frigate'),
      tap_action:
        config.menu?.style === 'hidden'
          ? (createGeneralAction('menu_toggle') as FrigateCardCustomAction)
          : (createGeneralAction('default') as FrigateCardCustomAction),
      hold_action: createGeneralAction('diagnostics') as FrigateCardCustomAction,
    };
  }

  protected _getCamerasButton(
    config: FrigateCardConfig,
    cameraManager: CameraManager,
    view?: View | null,
  ): MenuItem | null {
    // Show all cameras in the menu rather than just cameras that support the
    // current view for a less surprising UX.
    const menuCameraIDs = cameraManager.getStore().getCameraIDsWithCapability('menu');
    if (menuCameraIDs.size > 1) {
      const menuItems = Array.from(
        cameraManager.getStore().getCameraConfigEntries(menuCameraIDs),
        ([cameraID, config]) => {
          const action = createCameraAction('camera_select', cameraID);
          const metadata = cameraManager.getCameraMetadata(cameraID);

          return {
            enabled: true,
            icon: metadata?.icon,
            entity: config.camera_entity,
            state_color: true,
            title: metadata?.title,
            selected: view?.camera === cameraID,
            ...(action && { tap_action: action }),
          };
        },
      );

      return {
        icon: 'mdi:video-switch',
        ...config.menu.buttons.cameras,
        type: 'custom:frigate-card-menu-submenu',
        title: localize('config.menu.buttons.cameras'),
        items: menuItems,
      };
    }
    return null;
  }

  protected _getSubstreamsButton(
    config: FrigateCardConfig,
    cameraManager: CameraManager,
    view?: View | null,
  ): MenuItem | null {
    if (!view) {
      return null;
    }

    const substreamCameraIDs = cameraManager
      .getStore()
      .getAllDependentCameras(view.camera, 'substream');

    if (substreamCameraIDs.size && view.is('live')) {
      const substreams = [...substreamCameraIDs].filter(
        (cameraID) => cameraID !== view.camera,
      );
      const streams = [view.camera, ...substreams];
      const substreamAwareCameraID = getStreamCameraID(view);

      if (streams.length === 2) {
        // If there are only two dependencies (the main camera, and 1 other)
        // then use a button not a menu to toggle.
        return {
          icon: 'mdi:video-input-component',
          style:
            substreamAwareCameraID !== view.camera ? this._getEmphasizedStyle() : {},
          title: localize('config.menu.buttons.substreams'),
          ...config.menu.buttons.substreams,
          type: 'custom:frigate-card-menu-icon',
          tap_action: createGeneralAction(
            hasSubstream(view) ? 'live_substream_off' : 'live_substream_on',
          ) as FrigateCardCustomAction,
        };
      } else if (streams.length > 2) {
        const menuItems = Array.from(streams, (streamID) => {
          const action = createCameraAction('live_substream_select', streamID);
          const metadata = cameraManager.getCameraMetadata(streamID) ?? undefined;
          const cameraConfig = cameraManager.getStore().getCameraConfig(streamID);
          return {
            enabled: true,
            icon: metadata?.icon,
            entity: cameraConfig?.camera_entity,
            state_color: true,
            title: metadata?.title,
            selected: substreamAwareCameraID === streamID,
            ...(action && { tap_action: action }),
          };
        });

        return {
          icon: 'mdi:video-input-component',
          title: localize('config.menu.buttons.substreams'),
          style:
            substreamAwareCameraID !== view.camera ? this._getEmphasizedStyle() : {},
          ...config.menu.buttons.substreams,
          type: 'custom:frigate-card-menu-submenu',
          items: menuItems,
        };
      }
    }
    return null;
  }

  protected _getLiveButton(
    config: FrigateCardConfig,
    view?: View | null,
    viewManager?: ViewManager | null,
  ): MenuItem | null {
    return view && viewManager?.isViewSupportedByCamera(view.camera, 'live')
      ? {
          icon: 'mdi:cctv',
          ...config.menu.buttons.live,
          type: 'custom:frigate-card-menu-icon',
          title: localize('config.view.views.live'),
          style: view.is('live') ? this._getEmphasizedStyle() : {},
          tap_action: createGeneralAction('live') as FrigateCardCustomAction,
        }
      : null;
  }

  protected _getClipsButton(
    config: FrigateCardConfig,
    view?: View | null,
    viewManager?: ViewManager | null,
  ): MenuItem | null {
    return view && viewManager?.isViewSupportedByCamera(view.camera, 'clips')
      ? {
          icon: 'mdi:filmstrip',
          ...config.menu.buttons.clips,
          type: 'custom:frigate-card-menu-icon',
          title: localize('config.view.views.clips'),
          style: view?.is('clips') ? this._getEmphasizedStyle() : {},
          tap_action: createGeneralAction('clips') as FrigateCardCustomAction,
          hold_action: createGeneralAction('clip') as FrigateCardCustomAction,
        }
      : null;
  }

  protected _getSnapshotsButton(
    config: FrigateCardConfig,
    view?: View | null,
    viewManager?: ViewManager | null,
  ): MenuItem | null {
    return view && viewManager?.isViewSupportedByCamera(view.camera, 'snapshots')
      ? {
          icon: 'mdi:camera',
          ...config.menu.buttons.snapshots,
          type: 'custom:frigate-card-menu-icon',
          title: localize('config.view.views.snapshots'),
          style: view?.is('snapshots') ? this._getEmphasizedStyle() : {},
          tap_action: createGeneralAction('snapshots') as FrigateCardCustomAction,
          hold_action: createGeneralAction('snapshot') as FrigateCardCustomAction,
        }
      : null;
  }

  protected _getRecordingsButton(
    config: FrigateCardConfig,
    view?: View | null,
    viewManager?: ViewManager | null,
  ): MenuItem | null {
    return view && viewManager?.isViewSupportedByCamera(view.camera, 'recordings')
      ? {
          icon: 'mdi:album',
          ...config.menu.buttons.recordings,
          type: 'custom:frigate-card-menu-icon',
          title: localize('config.view.views.recordings'),
          style: view.is('recordings') ? this._getEmphasizedStyle() : {},
          tap_action: createGeneralAction('recordings') as FrigateCardCustomAction,
          hold_action: createGeneralAction('recording') as FrigateCardCustomAction,
        }
      : null;
  }

  protected _getImageButton(
    config: FrigateCardConfig,
    view?: View | null,
    viewManager?: ViewManager | null,
  ): MenuItem | null {
    return view && viewManager?.isViewSupportedByCamera(view.camera, 'image')
      ? {
          icon: 'mdi:image',
          ...config.menu.buttons.image,
          type: 'custom:frigate-card-menu-icon',
          title: localize('config.view.views.image'),
          style: view?.is('image') ? this._getEmphasizedStyle() : {},
          tap_action: createGeneralAction('image') as FrigateCardCustomAction,
        }
      : null;
  }

  protected _getTimelineButton(
    config: FrigateCardConfig,
    view?: View | null,
    viewManager?: ViewManager | null,
  ): MenuItem | null {
    return view && viewManager?.isViewSupportedByCamera(view.camera, 'timeline')
      ? {
          icon: 'mdi:chart-gantt',
          ...config.menu.buttons.timeline,
          type: 'custom:frigate-card-menu-icon',
          title: localize('config.view.views.timeline'),
          style: view.is('timeline') ? this._getEmphasizedStyle() : {},
          tap_action: createGeneralAction('timeline') as FrigateCardCustomAction,
        }
      : null;
  }

  protected _getDownloadButton(
    config: FrigateCardConfig,
    cameraManager: CameraManager,
    view?: View | null,
  ): MenuItem | null {
    const selectedMedia = view?.queryResults?.getSelectedResult();
    const mediaCapabilities = selectedMedia
      ? cameraManager?.getMediaCapabilities(selectedMedia)
      : null;
    if (
      view?.isViewerView() &&
      mediaCapabilities?.canDownload &&
      !this._isBeingCasted()
    ) {
      return {
        icon: 'mdi:download',
        ...config.menu.buttons.download,
        type: 'custom:frigate-card-menu-icon',
        title: localize('config.menu.buttons.download'),
        tap_action: createGeneralAction('download') as FrigateCardCustomAction,
      };
    }
    return null;
  }

  protected _getCameraUIButton(
    config: FrigateCardConfig,
    showCameraUIButton?: boolean,
  ): MenuItem | null {
    return showCameraUIButton
      ? {
          icon: 'mdi:web',
          ...config.menu.buttons.camera_ui,
          type: 'custom:frigate-card-menu-icon',
          title: localize('config.menu.buttons.camera_ui'),
          tap_action: createGeneralAction('camera_ui') as FrigateCardCustomAction,
        }
      : null;
  }

  protected _getMicrophoneButton(
    config: FrigateCardConfig,
    microphoneManager?: MicrophoneManager | null,
    currentMediaLoadedInfo?: MediaLoadedInfo | null,
  ): MenuItem | null {
    if (microphoneManager && currentMediaLoadedInfo?.capabilities?.supports2WayAudio) {
      const unavailable =
        microphoneManager.isForbidden() || !microphoneManager.isSupported();
      const muted = microphoneManager.isMuted();
      const buttonType = config.menu.buttons.microphone.type;
      return {
        icon: unavailable
          ? 'mdi:microphone-message-off'
          : muted
            ? 'mdi:microphone-off'
            : 'mdi:microphone',
        ...config.menu.buttons.microphone,
        type: 'custom:frigate-card-menu-icon',
        title: localize('config.menu.buttons.microphone'),
        style: unavailable || muted ? {} : this._getEmphasizedStyle(true),
        ...(!unavailable &&
          buttonType === 'momentary' && {
            start_tap_action: createGeneralAction(
              'microphone_unmute',
            ) as FrigateCardCustomAction,
            end_tap_action: createGeneralAction(
              'microphone_mute',
            ) as FrigateCardCustomAction,
          }),
        ...(!unavailable &&
          buttonType === 'toggle' && {
            tap_action: createGeneralAction(
              muted ? 'microphone_unmute' : 'microphone_mute',
            ) as FrigateCardCustomAction,
          }),
      };
    }
    return null;
  }

  protected _getExpandButton(
    config: FrigateCardConfig,
    inExpandedMode?: boolean,
  ): MenuItem {
    return {
      icon: inExpandedMode ? 'mdi:arrow-collapse-all' : 'mdi:arrow-expand-all',
      ...config.menu.buttons.expand,
      type: 'custom:frigate-card-menu-icon',
      title: localize('config.menu.buttons.expand'),
      tap_action: createGeneralAction('expand') as FrigateCardCustomAction,
      style: inExpandedMode ? this._getEmphasizedStyle() : {},
    };
  }

  protected _getFullscreenButton(
    config: FrigateCardConfig,
    inFullscreenMode?: boolean,
  ): MenuItem | null {
    return !this._isBeingCasted()
      ? {
          icon: inFullscreenMode ? 'mdi:fullscreen-exit' : 'mdi:fullscreen',
          ...config.menu.buttons.fullscreen,
          type: 'custom:frigate-card-menu-icon',
          title: localize('config.menu.buttons.fullscreen'),
          tap_action: createGeneralAction('fullscreen') as FrigateCardCustomAction,
          style: inFullscreenMode ? this._getEmphasizedStyle() : {},
        }
      : null;
  }

  protected _getCastButton(
    hass: HomeAssistant,
    config: FrigateCardConfig,
    cameraManager: CameraManager,
    view?: View | null,
    mediaPlayerController?: MediaPlayerManager | null,
  ): MenuItem | null {
    if (!view) {
      return null;
    }
    const selectedCameraConfig = cameraManager.getStore().getCameraConfig(view.camera);
    if (
      mediaPlayerController?.hasMediaPlayers() &&
      (view.isViewerView() || (view.is('live') && selectedCameraConfig?.camera_entity))
    ) {
      const mediaPlayerItems = mediaPlayerController
        .getMediaPlayers()
        .map((playerEntityID) => {
          const title = getEntityTitle(hass, playerEntityID) || playerEntityID;
          const state = hass.states[playerEntityID];
          const playAction = createMediaPlayerAction(playerEntityID, 'play');
          const stopAction = createMediaPlayerAction(playerEntityID, 'stop');
          const disabled = !state || state.state === 'unavailable';

          return {
            enabled: true,
            selected: false,
            icon: getEntityIcon(hass, playerEntityID),
            entity: playerEntityID,
            state_color: false,
            title: title,
            disabled: disabled,
            ...(!disabled && playAction && { tap_action: playAction }),
            ...(!disabled && stopAction && { hold_action: stopAction }),
          };
        });

      return {
        icon: 'mdi:cast',
        ...config.menu.buttons.media_player,
        type: 'custom:frigate-card-menu-submenu',
        title: localize('config.menu.buttons.media_player'),
        items: mediaPlayerItems,
      };
    }
    return null;
  }

  protected _getPlayPauseButton(
    config: FrigateCardConfig,
    currentMediaLoadedInfo?: MediaLoadedInfo | null,
  ): MenuItem | null {
    if (
      currentMediaLoadedInfo &&
      currentMediaLoadedInfo.player &&
      currentMediaLoadedInfo.capabilities?.supportsPause
    ) {
      const paused = currentMediaLoadedInfo.player.isPaused();
      return {
        icon: paused ? 'mdi:play' : 'mdi:pause',
        ...config.menu.buttons.play,
        type: 'custom:frigate-card-menu-icon',
        title: localize('config.menu.buttons.play'),
        tap_action: createGeneralAction(
          paused ? 'play' : 'pause',
        ) as FrigateCardCustomAction,
      };
    }
    return null;
  }

  protected _getMuteUnmuteButton(
    config: FrigateCardConfig,
    currentMediaLoadedInfo?: MediaLoadedInfo | null,
  ): MenuItem | null {
    if (
      currentMediaLoadedInfo &&
      currentMediaLoadedInfo.player &&
      currentMediaLoadedInfo?.capabilities?.hasAudio
    ) {
      const muted = currentMediaLoadedInfo.player.isMuted();
      return {
        icon: muted ? 'mdi:volume-off' : 'mdi:volume-high',
        ...config.menu.buttons.mute,
        type: 'custom:frigate-card-menu-icon',
        title: localize('config.menu.buttons.mute'),
        tap_action: createGeneralAction(
          muted ? 'unmute' : 'mute',
        ) as FrigateCardCustomAction,
      };
    }
    return null;
  }

  protected _getScreenshotButton(
    config: FrigateCardConfig,
    currentMediaLoadedInfo?: MediaLoadedInfo | null,
  ): MenuItem | null {
    if (currentMediaLoadedInfo && currentMediaLoadedInfo.player) {
      return {
        icon: 'mdi:monitor-screenshot',
        ...config.menu.buttons.screenshot,
        type: 'custom:frigate-card-menu-icon',
        title: localize('config.menu.buttons.screenshot'),
        tap_action: createGeneralAction('screenshot') as FrigateCardCustomAction,
      };
    }
    return null;
  }

  protected _getDisplayModeButton(
    config: FrigateCardConfig,
    cameraManager: CameraManager,
    view?: View | null,
  ): MenuItem | null {
    const viewCameraIDs = view
      ? getCameraIDsForViewName(cameraManager, view.view)
      : null;
    if (
      view?.supportsMultipleDisplayModes() &&
      viewCameraIDs &&
      viewCameraIDs.size > 1
    ) {
      const isGrid = view.isGrid();
      return {
        icon: isGrid ? 'mdi:grid-off' : 'mdi:grid',
        ...config.menu.buttons.display_mode,
        style: isGrid ? this._getEmphasizedStyle() : {},
        type: 'custom:frigate-card-menu-icon',
        title: isGrid
          ? localize('display_modes.single')
          : localize('display_modes.grid'),
        tap_action: createDisplayModeAction(isGrid ? 'single' : 'grid'),
      };
    }
    return null;
  }

  protected _getPTZControlsButton(
    config: FrigateCardConfig,
    cameraManager: CameraManager,
    view?: View | null,
  ): MenuItem | null {
    const ptzConfig = view?.is('live')
      ? config.live.controls.ptz
      : view?.isViewerView()
        ? config.media_viewer.controls.ptz
        : null;

    if (!view || !ptzConfig || ptzConfig.mode === 'off') {
      return null;
    }

    const ptzTarget = getPTZTarget(view, {
      cameraManager: cameraManager,
      ...(ptzConfig.mode === 'auto' && { type: 'ptz' }),
    });

    if (ptzTarget) {
      const isOn =
        view.context?.ptzControls?.enabled !== false &&
        (ptzConfig.mode === 'on' ||
          (ptzConfig.mode === 'auto' && ptzTarget.type === 'ptz'));
      return {
        icon: 'mdi:pan',
        ...config.menu.buttons.ptz_controls,
        style: isOn ? this._getEmphasizedStyle() : {},
        type: 'custom:frigate-card-menu-icon',
        title: localize('config.menu.buttons.ptz_controls'),
        tap_action: createPTZControlsAction(!isOn),
      };
    }
    return null;
  }

  protected _getPTZHomeButton(
    config: FrigateCardConfig,
    cameraManager: CameraManager,
    view?: View | null,
  ): MenuItem | null {
    const target = view
      ? getPTZTarget(view, {
          cameraManager: cameraManager,
        })
      : null;

    if (
      !target ||
      ((target.type === 'digital' &&
        view?.context?.zoom?.[target.targetID]?.observed?.isDefault) ??
        true)
    ) {
      return null;
    }

    return {
      icon: 'mdi:home',
      ...config.menu.buttons.ptz_home,
      type: 'custom:frigate-card-menu-icon',
      title: localize('config.menu.buttons.ptz_home'),
      tap_action: createPTZMultiAction({
        targetID: target.targetID,
      }) as FrigateCardCustomAction,
    };
  }

  /**
   * Get the style of emphasized menu items.
   * @returns A StyleInfo.
   */
  protected _getEmphasizedStyle(critical?: boolean): StyleInfo {
    if (critical) {
      return {
        animation: 'pulse 3s infinite',
        color: 'var(--error-color, white)',
      };
    }
    return {
      color: 'var(--primary-color, white)',
    };
  }

  /**
   * Given a button determine if the style should be emphasized by examining all
   * of the actions sequentially.
   * @param button The button to examine.
   * @returns A StyleInfo object.
   */
  protected _getStyleFromActions(
    config: FrigateCardConfig,
    button: MenuItem,
    options?: MenuButtonControllerOptions,
  ): StyleInfo {
    for (const actionSet of [
      button.tap_action,
      button.double_tap_action,
      button.hold_action,
      button.start_tap_action,
      button.end_tap_action,
    ]) {
      const actions = Array.isArray(actionSet) ? actionSet : [actionSet];
      for (const action of actions) {
        // All frigate card actions will have action of 'fire-dom-event' and
        // styling only applies to those.
        if (
          !action ||
          action.action !== 'fire-dom-event' ||
          !('frigate_card_action' in action)
        ) {
          continue;
        }
        const frigateCardAction = action as FrigateCardCustomAction;
        if (
          FRIGATE_CARD_VIEWS_USER_SPECIFIED.some(
            (viewName) =>
              viewName === frigateCardAction.frigate_card_action &&
              options?.view?.is(frigateCardAction.frigate_card_action),
          ) ||
          (frigateCardAction.frigate_card_action === 'default' &&
            options?.view?.is(config.view.default)) ||
          (frigateCardAction.frigate_card_action === 'fullscreen' &&
            !!options?.inFullscreenMode) ||
          (frigateCardAction.frigate_card_action === 'camera_select' &&
            options?.view?.camera === frigateCardAction.camera)
        ) {
          return this._getEmphasizedStyle();
        }
      }
    }
    return {};
  }

  /**
   * Determine if the card is currently being casted.
   * @returns
   */
  protected _isBeingCasted(): boolean {
    return !!navigator.userAgent.match(/CrKey\//);
  }
}
