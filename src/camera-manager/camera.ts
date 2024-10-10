import { StateWatcherSubscriptionInterface } from '../card-controller/hass/state-watcher';
import { CameraConfig } from '../config/types';
import { localize } from '../localize/localize';
import { HassStateDifference, isTriggeredState } from '../utils/ha';
import { Capabilities } from './capabilities';
import { CameraManagerEngine } from './engine';
import { CameraNoIDError } from './error';
import { CameraEventCallback } from './types';

export interface CameraInitializationOptions {
  stateWatcher: StateWatcherSubscriptionInterface;
}
type DestroyCallback = () => void | Promise<void>;

export class Camera {
  protected _config: CameraConfig;
  protected _engine: CameraManagerEngine;
  protected _capabilities?: Capabilities;
  protected _eventCallback?: CameraEventCallback;
  protected _destroyCallbacks: DestroyCallback[] = [];

  constructor(
    config: CameraConfig,
    engine: CameraManagerEngine,
    options?: {
      capabilities?: Capabilities;
      eventCallback?: CameraEventCallback;
    },
  ) {
    this._config = config;
    this._engine = engine;
    this._capabilities = options?.capabilities;
    this._eventCallback = options?.eventCallback;
  }

  async initialize(options: CameraInitializationOptions): Promise<Camera> {
    options.stateWatcher.subscribe(
      this._stateChangeHandler,
      this._config.triggers.entities,
    );
    this._onDestroy(() => options.stateWatcher.unsubscribe(this._stateChangeHandler));
    return this;
  }

  public async destroy(): Promise<void> {
    this._destroyCallbacks.forEach((callback) => callback());
  }

  public getConfig(): CameraConfig {
    return this._config;
  }

  public setID(cameraID: string): void {
    this._config.id = cameraID;
  }

  public getID(): string {
    if (this._config.id) {
      return this._config.id;
    }
    throw new CameraNoIDError(localize('error.no_camera_id'));
  }

  public getEngine(): CameraManagerEngine {
    return this._engine;
  }

  public getCapabilities(): Capabilities | null {
    return this._capabilities ?? null;
  }

  protected _stateChangeHandler = (difference: HassStateDifference): void => {
    this._eventCallback?.({
      cameraID: this.getID(),
      type: isTriggeredState(difference.newState.state) ? 'new' : 'end',
    });
  };

  protected _onDestroy(callback: DestroyCallback): void {
    this._destroyCallbacks.push(callback);
  }
}
