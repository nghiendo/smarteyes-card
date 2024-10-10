import { hasAction } from '@dermotduffy/custom-card-helpers';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { actionSchema } from '../../src/config/types';
import {
  convertActionToCardCustomAction,
  createCameraAction,
  createDisplayModeAction,
  createGeneralAction,
  createLogAction,
  createMediaPlayerAction,
  createPTZDigitalAction,
  createPTZMultiAction,
  createPTZControlsAction,
  frigateCardHasAction,
  getActionConfigGivenAction,
  stopEventFromActivatingCardWideActions,
  createPTZAction,
} from '../../src/utils/action';

vi.mock('@dermotduffy/custom-card-helpers');

describe('convertActionToFrigateCardCustomAction', () => {
  it('should skip null action', () => {
    expect(convertActionToCardCustomAction(null)).toBeFalsy();
  });

  it('should parse valid', () => {
    expect(
      convertActionToCardCustomAction({
        action: 'custom:frigate-card-action',
        frigate_card_action: 'download',
      }),
    ).toEqual({
      action: 'fire-dom-event',
      frigate_card_action: 'download',
    });
  });

  it('should not parse invalid', () => {
    expect(convertActionToCardCustomAction('this is garbage')).toBeNull();
  });
});

describe('createGeneralAction', () => {
  it('should create general action', () => {
    expect(
      createGeneralAction('clips', {
        cardID: 'card_id',
      }),
    ).toEqual({
      action: 'fire-dom-event',
      frigate_card_action: 'clips',
      card_id: 'card_id',
    });
  });
});

describe('createCameraAction', () => {
  it('should create camera_select', () => {
    expect(createCameraAction('camera_select', 'camera', { cardID: 'card_id' })).toEqual(
      {
        action: 'fire-dom-event',
        camera: 'camera',
        frigate_card_action: 'camera_select',
        card_id: 'card_id',
      },
    );
  });
});

describe('createMediaPlayerAction', () => {
  it('should create media_player', () => {
    expect(
      createMediaPlayerAction('device', 'play', {
        cardID: 'card_id',
      }),
    ).toEqual({
      action: 'fire-dom-event',
      frigate_card_action: 'media_player',
      media_player: 'device',
      media_player_action: 'play',
      card_id: 'card_id',
    });
  });
});

describe('createDisplayModeAction', () => {
  it('should create display mode action', () => {
    expect(
      createDisplayModeAction('grid', {
        cardID: 'card_id',
      }),
    ).toEqual({
      action: 'fire-dom-event',
      frigate_card_action: 'display_mode_select',
      display_mode: 'grid',
      card_id: 'card_id',
    });
  });
});

describe('createPTZControlsAction', () => {
  it('should create PTZ controls action', () => {
    expect(
      createPTZControlsAction(true, {
        cardID: 'card_id',
      }),
    ).toEqual({
      action: 'fire-dom-event',
      frigate_card_action: 'ptz_controls',
      enabled: true,
      card_id: 'card_id',
    });
  });
});

describe('createPTZAction', () => {
  it('should create ptz action without parameters', () => {
    expect(
      createPTZAction({
        cardID: 'card_id',
      }),
    ).toEqual({
      action: 'fire-dom-event',
      frigate_card_action: 'ptz',
      card_id: 'card_id',
    });
  });

  it('should create ptz action with parameters', () => {
    expect(
      createPTZAction({
        cardID: 'card_id',
        ptzAction: 'right',
        ptzPhase: 'start',
        ptzPreset: 'preset',
        cameraID: 'camera_id',
      }),
    ).toEqual({
      action: 'fire-dom-event',
      frigate_card_action: 'ptz',
      card_id: 'card_id',
      camera: 'camera_id',
      ptz_action: 'right',
      ptz_phase: 'start',
      ptz_preset: 'preset',
    });
  });
});

describe('createPTZDigitalAction', () => {
  it('should create ptz digital without parameters', () => {
    expect(
      createPTZDigitalAction({
        cardID: 'card_id',
      }),
    ).toEqual({
      action: 'fire-dom-event',
      frigate_card_action: 'ptz_digital',
      card_id: 'card_id',
    });
  });

  it('should create ptz digital with parameters', () => {
    expect(
      createPTZDigitalAction({
        cardID: 'card_id',
        targetID: 'target_id',
        absolute: {
          pan: { x: 1, y: 2 },
          zoom: 3,
        },
        ptzAction: 'right',
        ptzPhase: 'start',
      }),
    ).toEqual({
      action: 'fire-dom-event',
      frigate_card_action: 'ptz_digital',
      card_id: 'card_id',
      target_id: 'target_id',
      absolute: {
        pan: { x: 1, y: 2 },
        zoom: 3,
      },
      ptz_action: 'right',
      ptz_phase: 'start',
    });
  });
});

describe('createPTZMultiAction', () => {
  it('should create ptz multi with parameters', () => {
    expect(
      createPTZMultiAction({
        cardID: 'card_id',
        ptzAction: 'right',
        ptzPreset: 'preset',
      }),
    ).toEqual({
      action: 'fire-dom-event',
      frigate_card_action: 'ptz_multi',
      card_id: 'card_id',
      ptz_action: 'right',
      ptz_preset: 'preset',
    });
  });

  it('should create ptz multi without parameters', () => {
    expect(
      createPTZMultiAction({
        cardID: 'card_id',
        ptzAction: 'right',
        ptzPhase: 'start',
        targetID: 'target_id',
      }),
    ).toEqual({
      action: 'fire-dom-event',
      frigate_card_action: 'ptz_multi',
      card_id: 'card_id',
      ptz_action: 'right',
      ptz_phase: 'start',
      target_id: 'target_id',
    });
  });
});

describe('createLogAction', () => {
  it('should create log action', () => {
    expect(
      createLogAction('Hello, world!', {
        cardID: 'card_id',
      }),
    ).toEqual({
      action: 'fire-dom-event',
      frigate_card_action: 'log',
      message: 'Hello, world!',
      card_id: 'card_id',
      level: 'info',
    });
  });
});

describe('getActionConfigGivenAction', () => {
  const action = actionSchema.parse({
    action: 'fire-dom-event',
    frigate_card_action: 'clips',
  });

  it('should not handle undefined arguments', () => {
    expect(getActionConfigGivenAction()).toBeNull();
  });

  it('should not handle unknown interactions', () => {
    expect(
      getActionConfigGivenAction('triple_poke', { triple_poke_action: action }),
    ).toBeNull();
  });

  it('should handle tap actions', () => {
    expect(getActionConfigGivenAction('tap', { tap_action: action })).toBe(action);
  });

  it('should handle hold actions', () => {
    expect(getActionConfigGivenAction('hold', { hold_action: action })).toBe(action);
  });

  it('should handle double_tap actions', () => {
    expect(getActionConfigGivenAction('double_tap', { double_tap_action: action })).toBe(
      action,
    );
  });

  it('should handle end_tap actions', () => {
    expect(getActionConfigGivenAction('end_tap', { end_tap_action: action })).toBe(
      action,
    );
  });

  it('should handle start_tap actions', () => {
    expect(getActionConfigGivenAction('start_tap', { start_tap_action: action })).toBe(
      action,
    );
  });
});

describe('frigateCardHasAction', () => {
  const action = actionSchema.parse({
    action: 'toggle',
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle non-array case', () => {
    expect(frigateCardHasAction(action)).toBeFalsy();
    expect(hasAction).toBeCalledTimes(1);
  });
  it('should handle array case', () => {
    expect(frigateCardHasAction([action, action, action])).toBeFalsy();
    expect(hasAction).toBeCalledTimes(3);
  });
});

// @vitest-environment jsdom
describe('stopEventFromActivatingCardWideActions', () => {
  it('should stop event from propogating', () => {
    const event = mock<Event>();
    stopEventFromActivatingCardWideActions(event);
    expect(event.stopPropagation).toBeCalled();
  });
});
