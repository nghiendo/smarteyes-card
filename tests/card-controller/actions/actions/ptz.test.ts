import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { PTZAction } from '../../../../src/card-controller/actions/actions/ptz';
import {
  createCameraConfig,
  createCameraManager,
  createCardAPI,
  createStore,
  createView,
} from '../../../test-utils';
import { Capabilities } from '../../../../src/camera-manager/capabilities';

describe('should handle ptz action', () => {
  it('should execute simple action', async () => {
    const api = createCardAPI();
    vi.mocked(api.getViewManager().getView).mockReturnValue(
      createView({
        camera: 'camera.office',
      }),
    );
    const store = createStore([
      {
        cameraID: 'camera.office',
        capabilities: new Capabilities({ ptz: { left: ['relative'] } }),
      },
    ]);
    vi.mocked(api.getCameraManager).mockReturnValue(createCameraManager(store));

    const action = new PTZAction(
      {},
      {
        action: 'fire-dom-event',
        frigate_card_action: 'ptz',
        ptz_action: 'left',
        camera: 'camera.office',
      },
    );

    await action.execute(api);

    expect(api.getCameraManager().executePTZAction).toBeCalledWith(
      'camera.office',
      'left',
      {
        phase: undefined,
        preset: undefined,
      },
    );
  });

  describe('without explicit camera', () => {
    it('when current camera supports PTZ', async () => {
      const api = createCardAPI();
      const store = createStore([
        {
          cameraID: 'camera.office',
          capabilities: new Capabilities({ ptz: { left: ['relative'] } }),
        },
      ]);
      vi.mocked(api.getCameraManager).mockReturnValue(createCameraManager(store));
      vi.mocked(api.getViewManager().getView).mockReturnValue(
        createView({ camera: 'camera.office' }),
      );

      const action = new PTZAction(
        {},
        {
          action: 'fire-dom-event',
          frigate_card_action: 'ptz',
          ptz_action: 'left',
        },
      );

      await action.execute(api);

      expect(api.getCameraManager().executePTZAction).toBeCalledWith(
        'camera.office',
        'left',
        {
          phase: undefined,
          preset: undefined,
        },
      );
    });

    it('when substream supports PTZ', async () => {
      const api = createCardAPI();
      const store = createStore([
        {
          cameraID: 'camera.office',
          config: createCameraConfig({
            dependencies: { cameras: ['camera.office_hd'] },
          }),
        },
        {
          cameraID: 'camera.office_hd',
          capabilities: new Capabilities({ ptz: { left: ['relative'] } }),
        },
      ]);
      vi.mocked(api.getCameraManager).mockReturnValue(createCameraManager(store));
      vi.mocked(api.getViewManager().getView).mockReturnValue(
        createView({
          camera: 'camera.office',
          context: {
            live: {
              overrides: new Map([['camera.office', 'camera.office_hd']]),
            },
          },
        }),
      );

      const action = new PTZAction(
        {},
        {
          action: 'fire-dom-event',
          frigate_card_action: 'ptz',
          ptz_action: 'left',
        },
      );

      await action.execute(api);

      expect(api.getCameraManager().executePTZAction).toBeCalledWith(
        'camera.office_hd',
        'left',
        {
          phase: undefined,
          preset: undefined,
        },
      );
    });

    it('when no camera supports PTZ', async () => {
      const api = createCardAPI();
      vi.mocked(api.getCameraManager).mockReturnValue(createCameraManager());
      vi.mocked(api.getViewManager().getView).mockReturnValue(
        createView({ camera: 'camera.office' }),
      );

      const action = new PTZAction(
        {},
        {
          action: 'fire-dom-event',
          frigate_card_action: 'ptz',
          ptz_action: 'left',
        },
      );

      await action.execute(api);

      expect(api.getCameraManager().executePTZAction).not.toBeCalled();
    });
  });

  it('when there is no view', async () => {
    const api = createCardAPI();
    vi.mocked(api.getCameraManager).mockReturnValue(createCameraManager());

    const action = new PTZAction(
      {},
      {
        action: 'fire-dom-event',
        frigate_card_action: 'ptz',
        ptz_action: 'left',
      },
    );

    await action.execute(api);

    expect(api.getCameraManager().executePTZAction).not.toBeCalled();
  });

  describe('when there is no action', () => {
    it('should call first preset', async () => {
      const api = createCardAPI();
      const store = createStore([
        {
          cameraID: 'camera.office',
          capabilities: new Capabilities({ ptz: { presets: ['home'] } }),
        },
      ]);
      vi.mocked(api.getCameraManager).mockReturnValue(createCameraManager(store));
      vi.mocked(api.getViewManager().getView).mockReturnValue(
        createView({ camera: 'camera.office' }),
      );

      const action = new PTZAction(
        {},
        {
          action: 'fire-dom-event',
          frigate_card_action: 'ptz',
        },
      );

      await action.execute(api);

      expect(api.getCameraManager().executePTZAction).toBeCalledWith(
        'camera.office',
        'preset',
        {
          phase: undefined,
          preset: 'home',
        },
      );
    });

    it('should not call preset when there are no presets', async () => {
      const api = createCardAPI();
      const store = createStore([
        {
          cameraID: 'camera.office',
          capabilities: new Capabilities({
            ptz: {
              left: ['relative'],
              presets: [],
            },
          }),
        },
      ]);
      vi.mocked(api.getCameraManager).mockReturnValue(createCameraManager(store));
      vi.mocked(api.getViewManager().getView).mockReturnValue(
        createView({ camera: 'camera.office' }),
      );

      const action = new PTZAction(
        {},
        {
          action: 'fire-dom-event',
          frigate_card_action: 'ptz',
        },
      );

      await action.execute(api);

      expect(api.getCameraManager().executePTZAction).not.toBeCalled();
    });
  });

  it('should execute preset', async () => {
    const api = createCardAPI();
    const store = createStore([
      {
        cameraID: 'camera.office',
        capabilities: new Capabilities({
          ptz: {
            presets: ['window'],
          },
        }),
      },
    ]);
    vi.mocked(api.getCameraManager).mockReturnValue(createCameraManager(store));
    vi.mocked(api.getViewManager().getView).mockReturnValue(
      createView({ camera: 'camera.office' }),
    );

    const action = new PTZAction(
      {},
      {
        action: 'fire-dom-event',
        frigate_card_action: 'ptz',
        ptz_action: 'preset',
        ptz_preset: 'window',
      },
    );

    await action.execute(api);

    expect(api.getCameraManager().executePTZAction).toBeCalledWith(
      'camera.office',
      'preset',
      {
        phase: undefined,
        preset: 'window',
      },
    );
  });

  it('should execute action with phase', async () => {
    const api = createCardAPI();
    const store = createStore([
      {
        cameraID: 'camera.office',
        capabilities: new Capabilities({
          ptz: {
            left: ['continuous'],
          },
        }),
      },
    ]);
    vi.mocked(api.getCameraManager).mockReturnValue(createCameraManager(store));
    vi.mocked(api.getViewManager().getView).mockReturnValue(
      createView({ camera: 'camera.office' }),
    );

    const action = new PTZAction(
      {},
      {
        action: 'fire-dom-event',
        frigate_card_action: 'ptz',
        ptz_action: 'left',
        ptz_phase: 'start',
      },
    );

    await action.execute(api);

    expect(api.getCameraManager().executePTZAction).toBeCalledWith(
      'camera.office',
      'left',
      {
        phase: 'start',
      },
    );
  });

  // @vitest-environment jsdom
  describe('when relative is requested but unsupported', () => {
    beforeAll(() => {
      vi.useFakeTimers();
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    it('should emulate relative', async () => {
      const api = createCardAPI();
      const store = createStore([
        {
          cameraID: 'camera.office',
          capabilities: new Capabilities({
            ptz: {
              left: ['continuous'],
            },
          }),
        },
      ]);
      vi.mocked(api.getCameraManager).mockReturnValue(createCameraManager(store));
      vi.mocked(api.getViewManager().getView).mockReturnValue(
        createView({ camera: 'camera.office' }),
      );

      const action = new PTZAction(
        {},
        {
          action: 'fire-dom-event',
          frigate_card_action: 'ptz',
          ptz_action: 'left',
        },
      );

      await action.execute(api);

      expect(api.getCameraManager().executePTZAction).toBeCalledWith(
        'camera.office',
        'left',
        {
          phase: 'start',
        },
      );

      vi.runOnlyPendingTimers();
      expect(api.getCameraManager().executePTZAction).toBeCalledWith(
        'camera.office',
        'left',
        {
          phase: 'stop',
        },
      );
    });

    it('should honor stop', async () => {
      const api = createCardAPI();
      const store = createStore([
        {
          cameraID: 'camera.office',
          capabilities: new Capabilities({
            ptz: {
              left: ['continuous'],
            },
          }),
        },
      ]);
      vi.mocked(api.getCameraManager).mockReturnValue(createCameraManager(store));
      vi.mocked(api.getViewManager().getView).mockReturnValue(
        createView({ camera: 'camera.office' }),
      );

      const context = {};
      const action = new PTZAction(context, {
        action: 'fire-dom-event',
        frigate_card_action: 'ptz',
        ptz_action: 'left',
      });

      await action.execute(api);

      expect(api.getCameraManager().executePTZAction).toBeCalledTimes(1);

      action.stop();
      vi.runOnlyPendingTimers();

      expect(api.getCameraManager().executePTZAction).toBeCalledTimes(1);
    });
  });

  describe('when continuous is requested but unsupported', () => {
    beforeAll(() => {
      vi.useFakeTimers();
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    it('should emulate continuous', async () => {
      const api = createCardAPI();
      const store = createStore([
        {
          cameraID: 'camera.office',
          capabilities: new Capabilities({
            ptz: {
              left: ['relative'],
            },
          }),
        },
      ]);
      vi.mocked(api.getCameraManager).mockReturnValue(createCameraManager(store));
      vi.mocked(api.getViewManager().getView).mockReturnValue(
        createView({ camera: 'camera.office' }),
      );

      const context = {};
      const startAction = new PTZAction(context, {
        action: 'fire-dom-event',
        frigate_card_action: 'ptz',
        ptz_action: 'left',
        ptz_phase: 'start',
      });
      await startAction.execute(api);

      expect(api.getCameraManager().executePTZAction).toBeCalledWith(
        'camera.office',
        'left',
        {
          phase: undefined,
        },
      );
      expect(api.getCameraManager().executePTZAction).toBeCalledTimes(1);

      await vi.runOnlyPendingTimersAsync();
      expect(api.getCameraManager().executePTZAction).toBeCalledTimes(2);

      await vi.runOnlyPendingTimersAsync();
      expect(api.getCameraManager().executePTZAction).toBeCalledTimes(3);

      const stopAction = new PTZAction(context, {
        action: 'fire-dom-event',
        frigate_card_action: 'ptz',
        ptz_action: 'left',
        ptz_phase: 'stop',
      });
      await stopAction.execute(api);

      // There should be no additional calls.
      await vi.runOnlyPendingTimersAsync();
      expect(api.getCameraManager().executePTZAction).toBeCalledTimes(3);
    });

    it('should honor stop', async () => {
      const api = createCardAPI();
      const store = createStore([
        {
          cameraID: 'camera.office',
          capabilities: new Capabilities({
            ptz: {
              left: ['relative'],
            },
          }),
        },
      ]);
      vi.mocked(api.getCameraManager).mockReturnValue(createCameraManager(store));
      vi.mocked(api.getViewManager().getView).mockReturnValue(
        createView({ camera: 'camera.office' }),
      );

      const context = {};
      const action = new PTZAction(context, {
        action: 'fire-dom-event',
        frigate_card_action: 'ptz',
        ptz_action: 'left',
        ptz_phase: 'start',
      });

      await action.execute(api);
      expect(api.getCameraManager().executePTZAction).toBeCalledTimes(1);

      await vi.runOnlyPendingTimersAsync();
      expect(api.getCameraManager().executePTZAction).toBeCalledTimes(2);

      action.stop();
      await vi.runOnlyPendingTimersAsync();

      // There should be no additional calls.
      expect(api.getCameraManager().executePTZAction).toBeCalledTimes(2);
    });
  });
});
