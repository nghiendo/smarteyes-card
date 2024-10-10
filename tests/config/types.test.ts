import { describe, expect, it } from 'vitest';
import {
  cameraConfigSchema,
  conditionalSchema,
  customSchema,
  dimensionsConfigSchema,
  frigateCardCustomActionsBaseSchema,
  frigateCardCustomActionSchema,
} from '../../src/config/types';
import { createConfig } from '../test-utils';

// @vitest-environment jsdom
describe('config defaults', () => {
  it('should be as expected', () => {
    expect(createConfig()).toEqual({
      cameras: [{}],
      cameras_global: {
        dependencies: {
          all_cameras: false,
          cameras: [],
        },
        engine: 'auto',
        frigate: {
          client_id: 'frigate',
        },
        image: {
          mode: 'auto',
          refresh_seconds: 1,
        },
        live_provider: 'auto',
        motioneye: {
          images: {
            directory_pattern: '%Y-%m-%d',
            file_pattern: '%H-%M-%S',
          },
          movies: {
            directory_pattern: '%Y-%m-%d',
            file_pattern: '%H-%M-%S',
          },
        },
        ptz: {
          c2r_delay_between_calls_seconds: 0.2,
          r2c_delay_between_calls_seconds: 0.5,
        },
        triggers: {
          events: ['events', 'clips', 'snapshots'],
          entities: [],
          motion: false,
          occupancy: false,
        },
      },
      debug: {
        logging: false,
      },
      dimensions: {
        aspect_ratio: [16, 9],
        aspect_ratio_mode: 'dynamic',
        height: 'auto',
      },
      image: {
        mode: 'auto',
        refresh_seconds: 1,
      },
      live: {
        auto_mute: ['unselected', 'hidden', 'microphone'],
        auto_pause: [],
        auto_play: ['selected', 'visible'],
        auto_unmute: ['microphone'],
        controls: {
          builtin: true,
          next_previous: {
            size: 48,
            style: 'chevrons',
          },
          ptz: {
            hide_home: false,
            hide_pan_tilt: false,
            hide_zoom: false,
            mode: 'auto',
            orientation: 'horizontal',
            position: 'bottom-right',
          },
          thumbnails: {
            media_type: 'events',
            events_media_type: 'all',
            mode: 'right',
            show_details: true,
            show_download_control: true,
            show_favorite_control: true,
            show_timeline_control: true,
            size: 100,
          },
          timeline: {
            clustering_threshold: 3,
            events_media_type: 'all',
            mode: 'none',
            pan_mode: 'pan',
            show_recordings: true,
            style: 'ribbon',
            window_seconds: 3600,
          },
        },
        draggable: true,
        lazy_load: true,
        lazy_unload: [],
        microphone: {
          always_connected: false,
          disconnect_seconds: 90,
          mute_after_microphone_mute_seconds: 60,
        },
        preload: false,
        show_image_during_load: true,
        transition_effect: 'slide',
        zoomable: true,
      },
      media_gallery: {
        controls: {
          filter: {
            mode: 'right',
          },
          thumbnails: {
            mode: 'right',
            show_details: false,
            show_download_control: true,
            show_favorite_control: true,
            show_timeline_control: true,
            size: 100,
          },
        },
      },
      media_viewer: {
        auto_mute: ['unselected', 'hidden'],
        auto_pause: ['unselected', 'hidden'],
        auto_play: ['selected', 'visible'],
        auto_unmute: [],
        controls: {
          builtin: true,
          next_previous: {
            size: 48,
            style: 'thumbnails',
          },
          ptz: {
            hide_home: false,
            hide_pan_tilt: false,
            hide_zoom: false,
            mode: 'off',
            orientation: 'horizontal',
            position: 'bottom-right',
          },
          thumbnails: {
            mode: 'right',
            show_details: true,
            show_download_control: true,
            show_favorite_control: true,
            show_timeline_control: true,
            size: 100,
          },
          timeline: {
            clustering_threshold: 3,
            events_media_type: 'all',
            mode: 'none',
            pan_mode: 'pan',
            show_recordings: true,
            style: 'ribbon',
            window_seconds: 3600,
          },
        },
        draggable: true,
        lazy_load: true,
        snapshot_click_plays_clip: true,
        transition_effect: 'slide',
        zoomable: true,
      },
      menu: {
        alignment: 'left',
        button_size: 40,
        buttons: {
          camera_ui: {
            enabled: true,
            priority: 50,
          },
          cameras: {
            enabled: true,
            priority: 50,
          },
          clips: {
            enabled: true,
            priority: 50,
          },
          display_mode: {
            enabled: true,
            priority: 50,
          },
          download: {
            enabled: true,
            priority: 50,
          },
          expand: {
            enabled: false,
            priority: 50,
          },
          frigate: {
            enabled: true,
            priority: 50,
          },
          fullscreen: {
            enabled: true,
            priority: 50,
          },
          image: {
            enabled: false,
            priority: 50,
          },
          live: {
            enabled: true,
            priority: 50,
          },
          media_player: {
            enabled: true,
            priority: 50,
          },
          microphone: {
            enabled: false,
            priority: 50,
            type: 'momentary',
          },
          mute: {
            enabled: false,
            priority: 50,
          },
          play: {
            enabled: false,
            priority: 50,
          },
          ptz_controls: {
            enabled: false,
            priority: 50,
          },
          ptz_home: {
            enabled: false,
            priority: 50,
          },
          recordings: {
            enabled: false,
            priority: 50,
          },
          screenshot: {
            enabled: false,
            priority: 50,
          },
          snapshots: {
            enabled: true,
            priority: 50,
          },
          substreams: {
            enabled: true,
            priority: 50,
          },
          timeline: {
            enabled: true,
            priority: 50,
          },
        },
        position: 'top',
        style: 'hidden',
      },
      performance: {
        features: {
          animated_progress_indicator: true,
          media_chunk_size: 50,
        },
        style: {
          border_radius: true,
          box_shadow: true,
        },
      },
      status_bar: {
        height: 46,
        items: {
          engine: {
            enabled: true,
            priority: 50,
          },
          resolution: {
            enabled: true,
            priority: 50,
          },
          technology: {
            enabled: true,
            priority: 50,
          },
          title: {
            enabled: true,
            priority: 50,
          },
        },
        popup_seconds: 3,
        position: 'bottom',
        style: 'popup',
      },
      timeline: {
        clustering_threshold: 3,
        controls: {
          thumbnails: {
            mode: 'right',
            show_details: true,
            show_download_control: true,
            show_favorite_control: true,
            show_timeline_control: true,
            size: 100,
          },
        },
        events_media_type: 'all',
        pan_mode: 'pan',
        show_recordings: true,
        style: 'stack',
        window_seconds: 3600,
      },
      type: 'frigate-hass-card',
      view: {
        camera_select: 'current',
        dark_mode: 'off',
        default: 'live',
        keyboard_shortcuts: {
          enabled: true,
          ptz_down: {
            key: 'ArrowDown',
          },
          ptz_home: {
            key: 'h',
          },
          ptz_left: {
            key: 'ArrowLeft',
          },
          ptz_right: {
            key: 'ArrowRight',
          },
          ptz_up: {
            key: 'ArrowUp',
          },
          ptz_zoom_in: {
            key: '+',
          },
          ptz_zoom_out: {
            key: '-',
          },
        },
        triggers: {
          show_trigger_status: false,
          untrigger_seconds: 0,
          actions: {
            trigger: 'update',
            untrigger: 'none',
            interaction_mode: 'inactive',
          },
          filter_selected_camera: true,
        },
        interaction_seconds: 300,
        default_cycle_camera: false,
        default_reset: {
          after_interaction: false,
          every_seconds: 0,
          entities: [],
          interaction_mode: 'inactive',
        },
      },
    });
  });
});

it('should transform dimensions.aspect_ratio', () => {
  expect(
    dimensionsConfigSchema.parse({
      aspect_ratio: '16 / 9',
    }),
  ).toEqual(expect.objectContaining({ aspect_ratio: [16, 9] }));

  expect(
    dimensionsConfigSchema.parse({
      aspect_ratio: '16 : 9',
    }),
  ).toEqual(expect.objectContaining({ aspect_ratio: [16, 9] }));

  expect(
    dimensionsConfigSchema.parse({
      aspect_ratio: [16, 9],
    }),
  ).toEqual(expect.objectContaining({ aspect_ratio: [16, 9] }));
});

it('should transform action', () => {
  expect(
    frigateCardCustomActionsBaseSchema.parse({
      action: 'custom:frigate-card-action',
    }),
  ).toEqual({
    action: 'fire-dom-event',
  });
});

describe('should convert webrtc card PTZ to Frigate card PTZ', () => {
  describe('relative actions', () => {
    it.each([
      ['left' as const],
      ['right' as const],
      ['up' as const],
      ['down' as const],
      ['zoom_in' as const],
      ['zoom_out' as const],
    ])('%s', (action: string) => {
      expect(
        cameraConfigSchema.parse({
          ptz: {
            service: 'foo',
            [`data_${action}`]: {
              device: '048123',
              cmd: action,
            },
          },
        }),
      ).toEqual(
        expect.objectContaining({
          ptz: expect.objectContaining({
            [`actions_${action}`]: {
              action: 'perform-action',
              perform_action: 'foo',
              data: {
                device: '048123',
                cmd: action,
              },
            },
          }),
        }),
      );
    });
  });

  describe('continuous actions', () => {
    it.each([
      ['left' as const],
      ['right' as const],
      ['up' as const],
      ['down' as const],
      ['zoom_in' as const],
      ['zoom_out' as const],
    ])('%s', (action: string) => {
      expect(
        cameraConfigSchema.parse({
          ptz: {
            service: 'foo',
            [`data_${action}_start`]: {
              device: '048123',
              cmd: action,
              phase: 'start',
            },
            [`data_${action}_stop`]: {
              device: '048123',
              cmd: action,
              phase: 'stop',
            },
          },
        }),
      ).toEqual(
        expect.objectContaining({
          ptz: expect.objectContaining({
            [`actions_${action}_start`]: {
              action: 'perform-action',
              perform_action: 'foo',
              data: {
                device: '048123',
                cmd: action,
                phase: 'start',
              },
            },
            [`actions_${action}_stop`]: {
              action: 'perform-action',
              perform_action: 'foo',
              data: {
                device: '048123',
                cmd: action,
                phase: 'stop',
              },
            },
          }),
        }),
      );
    });
  });

  it('presets', () => {
    expect(
      cameraConfigSchema.parse({
        ptz: {
          service: 'service_outer',
          presets: {
            service: 'service_inner',
            data_home: {
              device: '048123',
              cmd: 'home',
            },
            data_another: {
              device: '048123',
              cmd: 'another',
            },
          },
        },
      }),
    ).toEqual(
      expect.objectContaining({
        ptz: expect.objectContaining({
          presets: {
            home: {
              action: 'perform-action',
              perform_action: 'service_inner',
              data: {
                device: '048123',
                cmd: 'home',
              },
            },
            another: {
              action: 'perform-action',
              perform_action: 'service_inner',
              data: {
                device: '048123',
                cmd: 'another',
              },
            },
          },
        }),
      }),
    );
  });
});

describe('should lazy evaluate schemas', () => {
  it('conditional picture element', () => {
    expect(
      conditionalSchema.parse({
        type: 'conditional',
        conditions: [
          {
            condition: 'state',
            entity: 'light.office_main_lights',
            state: 'on',
            state_not: 'off',
          },
        ],
        elements: [
          {
            type: 'icon',
            icon: 'mdi:dog',
            title: 'Woof',
            style: {
              left: '100px',
              top: '400px',
            },
          },
        ],
      }),
    ).toEqual({
      conditions: [
        {
          condition: 'state',
          entity: 'light.office_main_lights',
          state: 'on',
          state_not: 'off',
        },
      ],
      elements: [
        {
          icon: 'mdi:dog',
          style: {
            left: '100px',
            top: '400px',
          },
          title: 'Woof',
          type: 'icon',
        },
      ],
      type: 'conditional',
    });
  });

  it('status bar actions', () => {
    const input = {
      action: 'fire-dom-event',
      frigate_card_action: 'status_bar',
      status_bar_action: 'reset',
      items: [
        {
          type: 'custom:frigate-card-status-bar-string',
          string: 'Item',
        },
      ],
    };
    expect(frigateCardCustomActionSchema.parse(input)).toEqual(input);
  });
});

describe('should handle custom frigate elements', () => {
  it('should add custom error on frigate entry', () => {
    const result = customSchema.safeParse({
      type: 'custom:frigate-card-foo',
    });
    expect(result.success).toBeFalsy();
    if (!result.success) {
      expect(result.error.errors[0]).toEqual({
        code: 'custom',
        message: 'Frigate-card custom elements must match specific schemas',
        fatal: true,
        path: ['type'],
      });
    }
  });

  it('should not add custom error on valid entry', () => {
    const result = customSchema.safeParse({
      type: 'custom:foo',
    });
    expect(result.success).toBeTruthy();
  });
});

// https://github.com/dermotduffy/frigate-hass-card/issues/1280
it('should not require title controls to specify all options', () => {
  expect(
    createConfig({
      cameras: [{}],
      live: {
        controls: {
          title: {
            mode: 'popup-top-left',
          },
        },
      },
    }),
  ).toBeTruthy();
});

it('should strip trailing slashes from go2rtc url', () => {
  const config = createConfig({
    cameras: [
      {
        go2rtc: {
          url: 'https://my-custom-go2rtc//',
        },
      },
    ],
  });
  expect(config).toBeTruthy();
  expect(config.cameras[0].go2rtc.url).toBe('https://my-custom-go2rtc');
});

it('media viewer should not support microphone based conditions', () => {
  expect(() =>
    createConfig({
      cameras: [],
      media_viewer: {
        auto_unmute: 'microphone' as const,
      },
    }),
  ).toThrowError();
});

describe('automations should require at least one action', () => {
  it('no action', () => {
    expect(() =>
      createConfig({
        cameras: [{}],
        automations: [{ conditions: [] }],
      }),
    ).toThrowError(/Automations must include at least one action/);
  });

  it('empty actions', () => {
    expect(() =>
      createConfig({
        cameras: [{}],
        automations: [{ conditions: [], actions: [], actions_not: [] }],
      }),
    ).toThrowError(/Automations must include at least one action/);
  });

  it('at least one action', () => {
    expect(() =>
      createConfig({
        cameras: [{}],
        automations: [
          {
            conditions: [],
            actions: [
              {
                action: 'fire-dom-event',
              },
            ],
          },
        ],
      }),
    ).not.toThrowError();
  });
});
