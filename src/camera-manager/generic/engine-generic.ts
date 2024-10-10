/* eslint-disable @typescript-eslint/no-unused-vars */

import { HomeAssistant } from '@dermotduffy/custom-card-helpers';
import { StateWatcherSubscriptionInterface } from '../../card-controller/hass/state-watcher';
import { PTZAction } from '../../config/ptz';
import { ActionPhase, CameraConfig } from '../../config/types';
import { ExtendedHomeAssistant } from '../../types';
import { getEntityIcon, getEntityTitle } from '../../utils/ha';
import { ViewMedia } from '../../view/media';
import { Camera } from '../camera';
import { Capabilities } from '../capabilities';
import { CameraManagerEngine } from '../engine';
import { CameraManagerReadOnlyConfigStore } from '../store';
import {
  CameraEndpoint,
  CameraEndpoints,
  CameraEndpointsContext,
  CameraEventCallback,
  CameraManagerCameraMetadata,
  CameraManagerMediaCapabilities,
  DataQuery,
  Engine,
  EngineOptions,
  EventQuery,
  EventQueryResultsMap,
  MediaMetadataQuery,
  MediaMetadataQueryResultsMap,
  PartialEventQuery,
  PartialRecordingQuery,
  PartialRecordingSegmentsQuery,
  QueryReturnType,
  RecordingQuery,
  RecordingQueryResultsMap,
  RecordingSegmentsQuery,
  RecordingSegmentsQueryResultsMap,
} from '../types';
import { getCameraEntityFromConfig } from '../utils/camera-entity-from-config';
import { getDefaultGo2RTCEndpoint } from '../utils/go2rtc-endpoint';
import { getPTZCapabilitiesFromCameraConfig } from '../utils/ptz';

export class GenericCameraManagerEngine implements CameraManagerEngine {
  protected _eventCallback?: CameraEventCallback;
  protected _stateWatcher: StateWatcherSubscriptionInterface;

  constructor(
    stateWatcher: StateWatcherSubscriptionInterface,
    eventCallback?: CameraEventCallback,
  ) {
    this._stateWatcher = stateWatcher;
    this._eventCallback = eventCallback;
  }

  public getEngineType(): Engine {
    return Engine.Generic;
  }

  public async createCamera(
    _hass: HomeAssistant,
    cameraConfig: CameraConfig,
  ): Promise<Camera> {
    return await new Camera(cameraConfig, this, {
      capabilities: new Capabilities(
        {
          'favorite-events': false,
          'favorite-recordings': false,
          clips: false,
          live: true,
          menu: true,
          recordings: false,
          seek: false,
          snapshots: false,
          substream: true,
          ptz: getPTZCapabilitiesFromCameraConfig(cameraConfig) ?? undefined,
        },
        {
          disable: cameraConfig.capabilities?.disable,
          disableExcept: cameraConfig.capabilities?.disable_except,
        },
      ),
      eventCallback: this._eventCallback,
    }).initialize({ stateWatcher: this._stateWatcher });
  }

  public generateDefaultEventQuery(
    _store: CameraManagerReadOnlyConfigStore,
    _cameraIDs: Set<string>,
    _query: PartialEventQuery,
  ): EventQuery[] | null {
    return null;
  }

  public generateDefaultRecordingQuery(
    _store: CameraManagerReadOnlyConfigStore,
    _cameraIDs: Set<string>,
    _query: PartialRecordingQuery,
  ): RecordingQuery[] | null {
    return null;
  }

  public generateDefaultRecordingSegmentsQuery(
    _store: CameraManagerReadOnlyConfigStore,
    _cameraIDs: Set<string>,
    _query: PartialRecordingSegmentsQuery,
  ): RecordingSegmentsQuery[] | null {
    return null;
  }

  public async getEvents(
    _hass: HomeAssistant,
    _store: CameraManagerReadOnlyConfigStore,
    _query: EventQuery,
    _engineOptions?: EngineOptions,
  ): Promise<EventQueryResultsMap | null> {
    return null;
  }

  public async getRecordings(
    _hass: HomeAssistant,
    _store: CameraManagerReadOnlyConfigStore,
    _query: RecordingQuery,
    _engineOptions?: EngineOptions,
  ): Promise<RecordingQueryResultsMap | null> {
    return null;
  }

  public async getRecordingSegments(
    _hass: HomeAssistant,
    _store: CameraManagerReadOnlyConfigStore,
    _query: RecordingSegmentsQuery,
    _engineOptions?: EngineOptions,
  ): Promise<RecordingSegmentsQueryResultsMap | null> {
    return null;
  }

  public generateMediaFromEvents(
    _hass: HomeAssistant,
    _store: CameraManagerReadOnlyConfigStore,
    _query: EventQuery,
    _results: QueryReturnType<EventQuery>,
  ): ViewMedia[] | null {
    return null;
  }

  public generateMediaFromRecordings(
    _hass: HomeAssistant,
    _store: CameraManagerReadOnlyConfigStore,
    _query: RecordingQuery,
    _results: QueryReturnType<RecordingQuery>,
  ): ViewMedia[] | null {
    return null;
  }

  public async getMediaDownloadPath(
    _hass: ExtendedHomeAssistant,
    _cameraConfig: CameraConfig,
    _media: ViewMedia,
  ): Promise<CameraEndpoint | null> {
    return null;
  }

  public async favoriteMedia(
    _hass: HomeAssistant,
    _cameraConfig: CameraConfig,
    _media: ViewMedia,
    _favorite: boolean,
  ): Promise<void> {
    return;
  }

  public getQueryResultMaxAge(_query: DataQuery): number | null {
    return null;
  }

  public async getMediaSeekTime(
    _hass: HomeAssistant,
    _store: CameraManagerReadOnlyConfigStore,
    _media: ViewMedia,
    _target: Date,
    _engineOptions?: EngineOptions,
  ): Promise<number | null> {
    return null;
  }

  public async getMediaMetadata(
    _hass: HomeAssistant,
    _store: CameraManagerReadOnlyConfigStore,
    _query: MediaMetadataQuery,
    _engineOptions?: EngineOptions,
  ): Promise<MediaMetadataQueryResultsMap | null> {
    return null;
  }

  public getCameraMetadata(
    hass: HomeAssistant,
    cameraConfig: CameraConfig,
  ): CameraManagerCameraMetadata {
    const cameraEntity = getCameraEntityFromConfig(cameraConfig);
    return {
      title:
        cameraConfig.title ??
        getEntityTitle(hass, cameraConfig.camera_entity) ??
        getEntityTitle(hass, cameraConfig.webrtc_card?.entity) ??
        cameraConfig.id ??
        '',
      icon:
        cameraConfig?.icon ??
        (cameraEntity ? getEntityIcon(hass, cameraEntity, 'mdi:video') : 'mdi:video'),
    };
  }

  public getMediaCapabilities(_media: ViewMedia): CameraManagerMediaCapabilities | null {
    return null;
  }

  public getCameraEndpoints(
    cameraConfig: CameraConfig,
    _context?: CameraEndpointsContext,
  ): CameraEndpoints | null {
    const go2rtc = getDefaultGo2RTCEndpoint(cameraConfig);
    return go2rtc
      ? {
          go2rtc: go2rtc,
        }
      : null;
  }

  public async executePTZAction(
    _hass: HomeAssistant,
    _cameraConfig: CameraConfig,
    _action: PTZAction,
    _options?: {
      phase?: ActionPhase;
      preset?: string;
    },
  ): Promise<void> {
    // Pass.
  }
}
