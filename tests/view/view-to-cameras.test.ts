import { describe, expect, it, vi } from 'vitest';
import { FrigateCardView } from '../../src/config/types';
import { CapabilityKey } from '../../src/types';
import { getCameraIDsForViewName } from '../../src/view/view-to-cameras';
import {
  createCameraConfig,
  createCameraManager,
  createCapabilities,
  createStore,
} from '../test-utils';

describe('getCameraIDsForViewName', () => {
  describe('views that are always supported', () => {
    it.each([['image' as const], ['diagnostics' as const]])(
      '%s',
      (viewName: FrigateCardView) => {
        const cameraManager = createCameraManager();
        vi.mocked(cameraManager.getStore).mockReturnValue(
          createStore([
            {
              cameraID: 'camera-1',
              config: createCameraConfig({ dependencies: { cameras: ['camera-2'] } }),
            },
            { cameraID: 'camera-2' },
          ]),
        );

        expect(getCameraIDsForViewName(cameraManager, viewName)).toEqual(
          new Set(['camera-1', 'camera-2']),
        );
        expect(getCameraIDsForViewName(cameraManager, viewName, 'camera-1')).toEqual(
          new Set(['camera-1', 'camera-2']),
        );
        expect(getCameraIDsForViewName(cameraManager, viewName, 'camera-2')).toEqual(
          new Set(['camera-1', 'camera-2']),
        );
      },
    );
  });

  describe('views that respect dependencies and need a capability', () => {
    it.each([
      ['live' as const, 'live' as const],
      ['clip' as const, 'clips' as const],
      ['clips' as const, 'clips' as const],
      ['snapshot' as const, 'snapshots' as const],
      ['snapshots' as const, 'snapshots' as const],
      ['recording' as const, 'recordings' as const],
      ['recordings' as const, 'recordings' as const],
      ['media' as const, 'clips' as const],
      ['media' as const, 'snapshots' as const],
      ['media' as const, 'recordings' as const],
      ['timeline' as const, 'clips' as const],
      ['timeline' as const, 'snapshots' as const],
      ['timeline' as const, 'recordings' as const],
    ])('%s', (viewName: FrigateCardView, capabilityKey: CapabilityKey) => {
      const cameraManager = createCameraManager();
      vi.mocked(cameraManager.getStore).mockReturnValue(
        createStore([
          {
            cameraID: 'camera-1',
            config: createCameraConfig({ dependencies: { cameras: ['camera-2'] } }),
          },
          {
            cameraID: 'camera-2',
            capabilities: createCapabilities({ [capabilityKey]: true }),
          },
        ]),
      );

      expect(getCameraIDsForViewName(cameraManager, viewName)).toEqual(
        new Set(['camera-2']),
      );
      expect(getCameraIDsForViewName(cameraManager, viewName, 'camera-1')).toEqual(
        new Set(['camera-2']),
      );
      expect(getCameraIDsForViewName(cameraManager, viewName, 'camera-2')).toEqual(
        new Set(['camera-2']),
      );
    });
  });
});
