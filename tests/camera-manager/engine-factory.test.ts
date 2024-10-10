import { describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { CameraManagerEngineFactory } from '../../src/camera-manager/engine-factory.js';
import { FrigateCameraManagerEngine } from '../../src/camera-manager/frigate/engine-frigate';
import { GenericCameraManagerEngine } from '../../src/camera-manager/generic/engine-generic';
import { MotionEyeCameraManagerEngine } from '../../src/camera-manager/motioneye/engine-motioneye';
import { Engine } from '../../src/camera-manager/types.js';
import { StateWatcherSubscriptionInterface } from '../../src/card-controller/hass/state-watcher.js';
import { CardWideConfig } from '../../src/config/types.js';
import {
  createEntityRegistryCache,
  EntityRegistryManager,
} from '../../src/utils/ha/registry/entity/index.js';
import { ResolvedMediaCache } from '../../src/utils/ha/resolved-media';
import {
  createCameraConfig,
  createHASS,
  createRegistryEntity,
  createStateEntity,
} from '../test-utils';

vi.mock('../../src/utils/ha/entity-registry');
vi.mock('../../src/utils/ha/entity-registry/cache');

const createFactory = (options?: {
  entityRegistryManager?: EntityRegistryManager;
  cardWideConfig?: CardWideConfig;
}): CameraManagerEngineFactory => {
  return new CameraManagerEngineFactory(
    options?.entityRegistryManager ??
      new EntityRegistryManager(createEntityRegistryCache()),
  );
};

describe('getEngineForCamera()', () => {
  describe('should get a frigate camera', () => {
    it('from manually set engine', async () => {
      const config = createCameraConfig({ engine: 'frigate' });
      expect(await createFactory().getEngineForCamera(createHASS(), config)).toBe(
        Engine.Frigate,
      );
    });

    it('from auto detection', async () => {
      const config = createCameraConfig({ engine: 'auto', camera_entity: 'camera.foo' });
      const entityRegistryManager = new EntityRegistryManager(
        createEntityRegistryCache(),
      );

      entityRegistryManager.getEntity = vi
        .fn()
        .mockResolvedValue(
          createRegistryEntity({ entity_id: 'camera.foo', platform: 'frigate' }),
        );

      expect(
        await createFactory({
          entityRegistryManager: entityRegistryManager,
        }).getEngineForCamera(createHASS(), config),
      ).toBe(Engine.Frigate);
    });

    it('from config with camera_name', async () => {
      const config = createCameraConfig({
        frigate: { client_id: 'bar', camera_name: 'foo' },
      });
      expect(await createFactory().getEngineForCamera(createHASS(), config)).toBe(
        Engine.Frigate,
      );
    });
  });

  describe('should get a motionEye camera', () => {
    it('from manually set engine', async () => {
      const config = createCameraConfig({ engine: 'motioneye' });
      expect(await createFactory().getEngineForCamera(createHASS(), config)).toBe(
        Engine.MotionEye,
      );
    });

    it('from auto detection', async () => {
      const config = createCameraConfig({ engine: 'auto', camera_entity: 'camera.foo' });
      const entityRegistryManager = new EntityRegistryManager(
        createEntityRegistryCache(),
      );

      entityRegistryManager.getEntity = vi
        .fn()
        .mockResolvedValue(
          createRegistryEntity({ entity_id: 'camera.foo', platform: 'motioneye' }),
        );

      expect(
        await createFactory({
          entityRegistryManager: entityRegistryManager,
        }).getEngineForCamera(createHASS(), config),
      ).toBe(Engine.MotionEye);
    });
  });

  describe('should get a generic camera', () => {
    it('from manually set engine', async () => {
      const config = createCameraConfig({ engine: 'generic' });
      expect(await createFactory().getEngineForCamera(createHASS(), config)).toBe(
        Engine.Generic,
      );
    });

    it('from auto detection', async () => {
      const config = createCameraConfig({ engine: 'auto', camera_entity: 'camera.foo' });
      const entityRegistryManager = new EntityRegistryManager(
        createEntityRegistryCache(),
      );

      entityRegistryManager.getEntity = vi
        .fn()
        .mockResolvedValue(
          createRegistryEntity({ entity_id: 'camera.foo', platform: 'generic' }),
        );

      expect(
        await createFactory({
          entityRegistryManager: entityRegistryManager,
        }).getEngineForCamera(createHASS(), config),
      ).toBe(Engine.Generic);
    });

    it('from entity not in registry but with state', async () => {
      const config = createCameraConfig({
        engine: 'auto',
        webrtc_card: { entity: 'camera.foo' },
      });
      const entityRegistryManager = new EntityRegistryManager(
        createEntityRegistryCache(),
      );

      entityRegistryManager.getEntity = vi.fn().mockResolvedValue(null);

      expect(
        await createFactory({
          entityRegistryManager: entityRegistryManager,
        }).getEngineForCamera(
          createHASS({
            'camera.foo': createStateEntity(),
          }),
          config,
        ),
      ).toBe(Engine.Generic);
    });

    it('from entity not in registry and not in state', async () => {
      const config = createCameraConfig({
        engine: 'auto',
        webrtc_card: { entity: 'camera.foo' },
      });
      const entityRegistryManager = new EntityRegistryManager(
        createEntityRegistryCache(),
      );
      entityRegistryManager.getEntity = vi.fn().mockResolvedValue(null);

      expect(
        async () =>
          await createFactory({
            entityRegistryManager: entityRegistryManager,
          }).getEngineForCamera(createHASS(), config),
      ).rejects.toThrow(/Could not find camera entity/);
    });

    it('from webrtc-card url', async () => {
      const config = createCameraConfig({
        engine: 'auto',
        webrtc_card: { url: 'camera.foo' },
      });

      expect(await createFactory().getEngineForCamera(createHASS(), config)).toBe(
        Engine.Generic,
      );
    });

    it('from go2rtc url and stream', async () => {
      const config = createCameraConfig({
        engine: 'auto',
        go2rtc: { url: 'https://my-go2rtc', stream: 'office' },
      });

      expect(await createFactory().getEngineForCamera(createHASS(), config)).toBe(
        Engine.Generic,
      );
    });
  });

  it('should get no engine from config with insufficient details', async () => {
    const config = createCameraConfig({});
    expect(await createFactory().getEngineForCamera(createHASS(), config)).toBeNull();
  });

  it('should throw error on invalid entity', async () => {
    const config = createCameraConfig({ engine: 'auto', camera_entity: 'camera.foo' });
    const entityRegistryManager = new EntityRegistryManager(createEntityRegistryCache());

    entityRegistryManager.getEntity = vi.fn().mockRejectedValue(new Error());

    await expect(
      createFactory({
        entityRegistryManager: entityRegistryManager,
      }).getEngineForCamera(createHASS(), config),
    ).rejects.toThrow();
  });
});

describe('createEngine()', () => {
  it('should create generic engine', async () => {
    expect(
      await createFactory().createEngine(Engine.Generic, {
        stateWatcher: mock<StateWatcherSubscriptionInterface>(),
        resolvedMediaCache: mock<ResolvedMediaCache>(),
      }),
    ).toBeInstanceOf(GenericCameraManagerEngine);
  });
  it('should create frigate engine', async () => {
    expect(
      await createFactory().createEngine(Engine.Frigate, {
        stateWatcher: mock<StateWatcherSubscriptionInterface>(),
        resolvedMediaCache: mock<ResolvedMediaCache>(),
      }),
    ).toBeInstanceOf(FrigateCameraManagerEngine);
  });
  it('should create motioneye engine', async () => {
    expect(
      await createFactory().createEngine(Engine.MotionEye, {
        stateWatcher: mock<StateWatcherSubscriptionInterface>(),
        resolvedMediaCache: mock<ResolvedMediaCache>(),
      }),
    ).toBeInstanceOf(MotionEyeCameraManagerEngine);
  });
});
