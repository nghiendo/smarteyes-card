import { CapabilitySearchOptions, MediaQuery } from '../../camera-manager/types';
import { MEDIA_CHUNK_SIZE_DEFAULT } from '../../const';
import { ClipsOrSnapshotsOrAll } from '../../types';
import { findBestMediaIndex } from '../../utils/find-best-media-index';
import {
  EventMediaQueries,
  MediaQueries,
  RecordingMediaQueries,
} from '../../view/media-queries';
import { MediaQueriesResults } from '../../view/media-queries-results';
import { CardViewAPI } from '../types';
import { QueryExecutorOptions, QueryWithResults } from './types';

export class QueryExecutor {
  protected _api: CardViewAPI;

  constructor(api: CardViewAPI) {
    this._api = api;
  }

  public async executeDefaultEventQuery(options?: {
    cameraID?: string;
    eventsMediaType?: ClipsOrSnapshotsOrAll;
    executorOptions?: QueryExecutorOptions;
  }): Promise<QueryWithResults | null> {
    const capabilitySearch: CapabilitySearchOptions =
      !options?.eventsMediaType || options?.eventsMediaType === 'all'
        ? {
            anyCapabilities: ['clips', 'snapshots'],
          }
        : options.eventsMediaType;

    const cameraManager = this._api.getCameraManager();
    const cameraIDs = options?.cameraID
      ? cameraManager
          .getStore()
          .getAllDependentCameras(options.cameraID, capabilitySearch)
      : cameraManager.getStore().getCameraIDsWithCapability(capabilitySearch);
    if (!cameraIDs.size) {
      return null;
    }

    const rawQueries = cameraManager.generateDefaultEventQueries(cameraIDs, {
      limit: this._getChunkLimit(),
      ...(options?.eventsMediaType === 'clips' && { hasClip: true }),
      ...(options?.eventsMediaType === 'snapshots' && { hasSnapshot: true }),
    });
    if (!rawQueries) {
      return null;
    }
    const queries = new EventMediaQueries(rawQueries);
    const results = await this.execute(queries, options?.executorOptions);
    return results
      ? {
          query: queries,
          queryResults: results,
        }
      : null;
  }

  public async executeDefaultRecordingQuery(options?: {
    cameraID?: string;
    executorOptions?: QueryExecutorOptions;
  }): Promise<QueryWithResults | null> {
    const cameraManager = this._api.getCameraManager();
    const cameraIDs = options?.cameraID
      ? cameraManager.getStore().getAllDependentCameras(options.cameraID, 'recordings')
      : cameraManager.getStore().getCameraIDsWithCapability('recordings');
    if (!cameraIDs.size) {
      return null;
    }

    const rawQueries = cameraManager.generateDefaultRecordingQueries(cameraIDs, {
      limit: this._getChunkLimit(),
    });
    if (!rawQueries) {
      return null;
    }
    const queries = new RecordingMediaQueries(rawQueries);
    const results = await this.execute(queries, options?.executorOptions);
    return results ? { query: queries, queryResults: results } : null;
  }

  public async execute(
    query: MediaQueries,
    executorOptions?: QueryExecutorOptions,
  ): Promise<MediaQueriesResults | null> {
    const queries = query.getQueries();
    if (!queries) {
      return null;
    }

    const mediaArray = await this._api
      .getCameraManager()
      .executeMediaQueries<MediaQuery>(queries, {
        useCache: executorOptions?.useCache,
      });
    if (!mediaArray) {
      return null;
    }

    const queryResults = new MediaQueriesResults({ results: mediaArray });
    if (executorOptions?.rejectResults?.(queryResults)) {
      return null;
    }

    if (executorOptions?.selectResult?.id) {
      queryResults.selectBestResult((media) =>
        media.findIndex((m) => m.getID() === executorOptions.selectResult?.id),
      );
    } else if (executorOptions?.selectResult?.func) {
      queryResults.selectResultIfFound(executorOptions.selectResult.func);
    } else if (executorOptions?.selectResult?.time) {
      queryResults.selectBestResult((media) =>
        findBestMediaIndex(
          media,
          executorOptions.selectResult?.time?.time as Date,
          executorOptions.selectResult?.time?.favorCameraID,
        ),
      );
    }
    return queryResults;
  }

  protected _getChunkLimit(): number {
    const cardWideConfig = this._api.getConfigManager().getCardWideConfig();
    return (
      cardWideConfig?.performance?.features.media_chunk_size ?? MEDIA_CHUNK_SIZE_DEFAULT
    );
  }
}
