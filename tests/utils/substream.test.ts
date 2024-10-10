import { describe, expect, it } from 'vitest';
import {
  getStreamCameraID,
  hasSubstream,
  removeSubstream,
} from '../../src/utils/substream';
import { View } from '../../src/view/view';
import { createView } from '../test-utils';

describe('hasSubstream/getStreamCameraID', () => {
  it('should detect substream', () => {
    const view = createView({
      camera: 'camera',
      context: {
        live: {
          overrides: new Map([['camera', 'camera2']]),
        },
      },
    });
    expect(hasSubstream(view)).toBeTruthy();
    expect(getStreamCameraID(view)).toBe('camera2');
  });
  it('should not detect substream when absent', () => {
    const view = createView({
      camera: 'camera',
    });
    expect(hasSubstream(view)).toBeFalsy();
    expect(getStreamCameraID(view)).toBe('camera');
  });
  it('should not detect substream when main stream', () => {
    const view = createView({
      camera: 'camera',
      context: {
        live: {
          overrides: new Map([['camera', 'camera']]),
        },
      },
    });
    expect(hasSubstream(view)).toBeFalsy();
    expect(getStreamCameraID(view)).toBe('camera');
  });
  describe('should respect cameraID override', () => {
    it('should respect cameraID override when present in overrides', () => {
      const view = createView({
        camera: 'camera',
        context: {
          live: {
            overrides: new Map([
              ['camera', 'camera2'],
              ['camera3', 'camera4'],
            ]),
          },
        },
      });
      expect(hasSubstream(view)).toBeTruthy();
      expect(getStreamCameraID(view, 'camera3')).toBe('camera4');
    });

    it('should respect cameraID override when not present in overrides', () => {
      const view = createView();
      expect(hasSubstream(view)).toBeFalsy();
      expect(getStreamCameraID(view, 'camera3')).toBe('camera3');
    });
  });
});

describe('removeSubstream', () => {
  it('should remove substream that exists', () => {
    const view = new View({
      view: 'live',
      camera: 'camera',
      context: {
        live: {
          overrides: new Map([['camera', 'camera2']]),
        },
      },
    });
    removeSubstream(view);
    expect(view.context).toEqual({
      live: {
        overrides: new Map(),
      },
    });
  });

  it('should not remove substream that does not exists', () => {
    const view = new View({
      view: 'live',
      camera: 'camera-has-no-overrides',
      context: {
        live: {
          overrides: new Map([['camera', 'camera2']]),
        },
      },
    });
    removeSubstream(view);
    expect(view.context).toEqual({
      live: {
        overrides: new Map([['camera', 'camera2']]),
      },
    });
  });
});
