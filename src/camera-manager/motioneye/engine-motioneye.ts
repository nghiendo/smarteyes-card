import { HomeAssistant } from '@dermotduffy/custom-card-helpers';
import { add, endOfDay, parse, startOfDay } from 'date-fns';
import orderBy from 'lodash-es/orderBy';
import { CameraConfig } from '../../config/types';
import { allPromises, formatDate, isValidDate } from '../../utils/basic';
import {
  BrowseMediaStep,
  BrowseMediaTarget,
} from '../../utils/ha/browse-media/browse-media-manager';
import {
  BrowseMedia,
  BROWSE_MEDIA_CACHE_SECONDS,
  MEDIA_CLASS_IMAGE,
  MEDIA_CLASS_VIDEO,
  RichBrowseMedia,
} from '../../utils/ha/browse-media/types';
import { ViewMedia } from '../../view/media';
import { BrowseMediaCamera } from '../browse-media/camera';
import {
  BrowseMediaCameraManagerEngine,
  getViewMediaFromBrowseMediaArray,
  isMediaWithinDates,
} from '../browse-media/engine-browse-media';
import { BrowseMediaMetadata } from '../browse-media/types';
import { CAMERA_MANAGER_ENGINE_EVENT_LIMIT_DEFAULT } from '../engine';
import { CameraManagerReadOnlyConfigStore } from '../store';
import {
  CameraEndpoint,
  CameraEndpoints,
  CameraEndpointsContext,
  CameraManagerCameraMetadata,
  Engine,
  EngineOptions,
  EventQuery,
  EventQueryResults,
  EventQueryResultsMap,
  MediaMetadataQuery,
  MediaMetadataQueryResults,
  MediaMetadataQueryResultsMap,
  QueryResults,
  QueryResultsType,
  QueryReturnType,
} from '../types';
import motioneyeLogo from './assets/motioneye-logo.svg';
import { MotionEyeEventQueryResults } from './types';

class MotionEyeQueryResultsClassifier {
  public static isMotionEyeEventQueryResults(
    results: QueryResults,
  ): results is MotionEyeEventQueryResults {
    return (
      results.engine === Engine.MotionEye && results.type === QueryResultsType.Event
    );
  }
}

const MOTIONEYE_REPL_SUBSTITUTIONS: Record<string, string> = {
  '%Y': 'yyyy',
  '%m': 'MM',
  '%d': 'dd',
  '%H': 'HH',
  '%M': 'mm',
  '%S': 'ss',
};
const MOTIONEYE_REPL_REGEXP = new RegExp(/(%Y|%m|%d|%H|%M|%S)/g);

export class MotionEyeCameraManagerEngine extends BrowseMediaCameraManagerEngine {
  public getEngineType(): Engine {
    return Engine.MotionEye;
  }

  protected _convertMotionEyeTimeFormatToDateFNS(part: string): string {
    return part.replace(
      MOTIONEYE_REPL_REGEXP,
      (_, key) => MOTIONEYE_REPL_SUBSTITUTIONS[key],
    );
  }

  // Get metadata for a MotionEye media file.
  protected _motionEyeMetadataGeneratorFile(
    cameraID: string,
    dateFormat: string | null,
    media: BrowseMedia,
    parent?: RichBrowseMedia<BrowseMediaMetadata>,
  ): BrowseMediaMetadata | null {
    let startDate = parent?._metadata?.startDate ?? new Date();
    if (dateFormat) {
      const extensionlessTitle = media.title.replace(/\.[^/.]+$/, '');
      startDate = parse(extensionlessTitle, dateFormat, startDate);
      if (!isValidDate(startDate)) {
        return null;
      }
    }
    return {
      cameraID: cameraID,
      startDate: startDate,
      // MotionEye only has start times, the event is effectively a 'point'
      endDate: startDate,
    };
  }

  // Get metadata for a MotionEye media directory.
  protected _motionEyeMetadataGeneratorDirectory(
    cameraID: string,
    dateFormat: string | null,
    media: BrowseMedia,
    parent?: RichBrowseMedia<BrowseMediaMetadata>,
  ): BrowseMediaMetadata | null {
    let startDate = parent?._metadata?.startDate ?? new Date();
    if (dateFormat) {
      const parsedDate = parse(media.title, dateFormat, startDate);
      if (!isValidDate(parsedDate)) {
        return null;
      }
      startDate = startOfDay(parsedDate);
    }
    return {
      cameraID: cameraID,
      startDate: startDate,
      endDate: parent?._metadata?.endDate ?? endOfDay(startDate),
    };
  }

  // Get media directories that match a given criteria.
  protected async _getMatchingDirectories(
    hass: HomeAssistant,
    store: CameraManagerReadOnlyConfigStore,
    cameraID: string,
    matchOptions?: {
      start?: Date;
      end?: Date;
      hasClip?: boolean;
      hasSnapshot?: boolean;
    } | null,
    engineOptions?: EngineOptions,
  ): Promise<RichBrowseMedia<BrowseMediaMetadata>[] | null> {
    const camera = store.getCamera(cameraID);
    const cameraConfig = camera?.getConfig();

    if (!(camera instanceof BrowseMediaCamera) || !cameraConfig) {
      return null;
    }

    const entity = camera.getEntity();
    const configID = entity?.config_entry_id;
    const deviceID = entity?.device_id;

    if (!configID || !deviceID) {
      return null;
    }

    const generateNextStep = (
      parts: string[],
      media: BrowseMediaTarget<BrowseMediaMetadata>[],
    ): BrowseMediaStep<BrowseMediaMetadata>[] => {
      const next = parts.shift();
      if (!next) {
        return [];
      }

      const dateFormat = next.includes('%')
        ? this._convertMotionEyeTimeFormatToDateFNS(next)
        : null;

      return [
        {
          targets: media,
          metadataGenerator: (
            media: BrowseMedia,
            parent?: RichBrowseMedia<BrowseMediaMetadata>,
          ) =>
            this._motionEyeMetadataGeneratorDirectory(
              cameraID,
              dateFormat,
              media,
              parent,
            ),
          matcher: (media: RichBrowseMedia<BrowseMediaMetadata>) =>
            media.can_expand &&
            (!!dateFormat || media.title === next) &&
            isMediaWithinDates(media, matchOptions?.start, matchOptions?.end),
          advance: (media) => generateNextStep(parts, media),
        },
      ];
    };

    // For motionEye snapshots and clips are mutually exclusive.
    return await this._browseMediaManager.walkBrowseMedias(
      hass,
      [
        ...(matchOptions?.hasClip !== false && !matchOptions?.hasSnapshot
          ? generateNextStep(
              cameraConfig.motioneye.movies.directory_pattern.split('/'),
              [`media-source://motioneye/${configID}#${deviceID}#movies`],
            )
          : []),
        ...(matchOptions?.hasSnapshot !== false && !matchOptions?.hasClip
          ? generateNextStep(
              cameraConfig.motioneye.images.directory_pattern.split('/'),
              [`media-source://motioneye/${configID}#${deviceID}#images`],
            )
          : []),
      ],
      {
        useCache: engineOptions?.useCache,
      },
    );
  }

  public async getEvents(
    hass: HomeAssistant,
    store: CameraManagerReadOnlyConfigStore,
    query: EventQuery,
    engineOptions?: EngineOptions,
  ): Promise<EventQueryResultsMap | null> {
    // MotionEye does not support these query types and they will never match.
    if (query.favorite || query.tags?.size || query.what?.size || query.where?.size) {
      return null;
    }

    const output: EventQueryResultsMap = new Map();
    const getEventsForCamera = async (cameraID: string): Promise<void> => {
      const perCameraQuery = { ...query, cameraIDs: new Set([cameraID]) };
      const cachedResult =
        engineOptions?.useCache ?? true ? this._requestCache.get(perCameraQuery) : null;
      if (cachedResult) {
        output.set(perCameraQuery, cachedResult as EventQueryResults);
        return;
      }

      const cameraConfig = store.getCameraConfig(cameraID);
      if (!cameraConfig) {
        return;
      }

      const directories = await this._getMatchingDirectories(
        hass,
        store,
        cameraID,
        perCameraQuery,
        engineOptions,
      );
      if (!directories || !directories.length) {
        return;
      }

      const moviesDateFormat = this._convertMotionEyeTimeFormatToDateFNS(
        cameraConfig.motioneye.movies.file_pattern,
      );
      const imagesDateFormat = this._convertMotionEyeTimeFormatToDateFNS(
        cameraConfig.motioneye.images.file_pattern,
      );

      const media = await this._browseMediaManager.walkBrowseMedias(
        hass,
        [
          {
            targets: directories,
            metadataGenerator: (
              media: BrowseMedia,
              parent?: RichBrowseMedia<BrowseMediaMetadata>,
            ) => {
              if (
                media.media_class === MEDIA_CLASS_IMAGE ||
                media.media_class === MEDIA_CLASS_VIDEO
              ) {
                return this._motionEyeMetadataGeneratorFile(
                  cameraID,
                  media.media_class === MEDIA_CLASS_IMAGE
                    ? imagesDateFormat
                    : moviesDateFormat,
                  media,
                  parent,
                );
              }
              return null;
            },
            matcher: (media: RichBrowseMedia<BrowseMediaMetadata>) =>
              !media.can_expand &&
              isMediaWithinDates(media, perCameraQuery.start, perCameraQuery.end),
          },
        ],
        { useCache: engineOptions?.useCache },
      );

      // Sort by most recent then slice at the query limit.
      const sortedMedia = orderBy(
        media,
        (media: RichBrowseMedia<BrowseMediaMetadata>) => media._metadata?.startDate,
        'desc',
      ).slice(0, perCameraQuery.limit ?? CAMERA_MANAGER_ENGINE_EVENT_LIMIT_DEFAULT);

      const result: MotionEyeEventQueryResults = {
        type: QueryResultsType.Event,
        engine: Engine.MotionEye,
        browseMedia: sortedMedia,
      };

      if (engineOptions?.useCache ?? true) {
        this._requestCache.set(
          perCameraQuery,
          { ...result, cached: true },
          result.expiry,
        );
      }
      output.set(perCameraQuery, result);
    };

    await allPromises(query.cameraIDs, (cameraID) => getEventsForCamera(cameraID));
    return output.size ? output : null;
  }

  public generateMediaFromEvents(
    _hass: HomeAssistant,
    _store: CameraManagerReadOnlyConfigStore,
    _query: EventQuery,
    results: QueryReturnType<EventQuery>,
  ): ViewMedia[] | null {
    if (!MotionEyeQueryResultsClassifier.isMotionEyeEventQueryResults(results)) {
      return null;
    }
    return getViewMediaFromBrowseMediaArray(results.browseMedia);
  }

  public async getMediaMetadata(
    hass: HomeAssistant,
    store: CameraManagerReadOnlyConfigStore,
    query: MediaMetadataQuery,
    engineOptions?: EngineOptions,
  ): Promise<MediaMetadataQueryResultsMap | null> {
    const output: MediaMetadataQueryResultsMap = new Map();
    if ((engineOptions?.useCache ?? true) && this._requestCache.has(query)) {
      const cachedResult = <MediaMetadataQueryResults | null>(
        this._requestCache.get(query)
      );
      if (cachedResult) {
        output.set(query, cachedResult as MediaMetadataQueryResults);
        return output;
      }
    }

    const days: Set<string> = new Set();
    const getDaysForCamera = async (cameraID: string): Promise<void> => {
      const directories = await this._getMatchingDirectories(
        hass,
        store,
        cameraID,
        null,
        engineOptions,
      );
      for (const dayDirectory of directories ?? []) {
        if (dayDirectory._metadata) {
          days.add(formatDate(dayDirectory._metadata?.startDate));
        }
      }
    };

    await allPromises(query.cameraIDs, (cameraID) => getDaysForCamera(cameraID));

    const result: MediaMetadataQueryResults = {
      type: QueryResultsType.MediaMetadata,
      engine: Engine.MotionEye,
      metadata: {
        ...(days.size && { days: days }),
      },
      expiry: add(new Date(), { seconds: BROWSE_MEDIA_CACHE_SECONDS }),
      cached: false,
    };

    if (engineOptions?.useCache ?? true) {
      this._requestCache.set(query, { ...result, cached: true }, result.expiry);
    }
    output.set(query, result);
    return output;
  }

  public getCameraMetadata(
    hass: HomeAssistant,
    cameraConfig: CameraConfig,
  ): CameraManagerCameraMetadata {
    const metadata = super.getCameraMetadata(hass, cameraConfig);
    return {
      ...metadata,
      engineLogo: motioneyeLogo,
    };
  }

  public getCameraEndpoints(
    cameraConfig: CameraConfig,
    context?: CameraEndpointsContext,
  ): CameraEndpoints | null {
    const getUIEndpoint = (): CameraEndpoint | null => {
      return cameraConfig.motioneye?.url
        ? {
            endpoint: cameraConfig.motioneye.url,
          }
        : null;
    };
    const ui = getUIEndpoint();
    return {
      ...super.getCameraEndpoints(cameraConfig, context),
      ...(ui && { ui: ui }),
    };
  }
}
