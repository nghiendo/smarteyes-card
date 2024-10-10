# `view`

The `view` configuration options control how the default view of the card behaves.

```yaml
view:
  # [...]
```

| Option                    | Default                                                   | Description                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `actions`                 |                                                           | [Actions](actions/README.md) to use for all views, individual actions may be overriden by view-specific actions.                                                                                                                                                                                                                                                                             |
| `camera_select`           | `current`                                                 | The [view](view.md?id=supported-views) to show when a new camera is selected (e.g. in the camera menu). If `current` the view is unchanged when a new camera is selected.                                                                                                                                                                                                                    |
| `dark_mode`               | `off`                                                     | Whether or not to turn dark mode `on`, `off` or `auto` to automatically turn on if the card `interaction_seconds` has expired (i.e. card has been left unattended for that period of time) or if dark mode is enabled in the HA profile theme setting. Dark mode dims the brightness by `25%`.                                                                                               |
| `default`                 | `live`                                                    | The view to show in the card by default. The default camera is the first one listed. See [Supported Views](view.md?id=supported-views) below.                                                                                                                                                                                                                                                |
| `default_reset`           |                                                           | The circumstances and behavior that cause the card to reset to the default view. See below.                                                                                                                                                                                                                                                                                                  |
| `interaction_seconds`     | `300`                                                     | After a mouse/touch interaction with the card, it will be considered "interacted with" until this number of seconds elapses without further interaction. May be used as part of an [interaction condition](conditions.md?id=interaction) or with `reset_after_interaction` to reset the view after the interaction is complete. `0` means no interactions are reported / acted upon.         |
| `keyboard_shortcuts`      | See [usage](../usage/keyboard-shortcuts.md) for defaults. | Configure keyboard shortcuts. See below.                                                                                                                                                                                                                                                                                                                                                     |
| `render_entities`         |                                                           | **YAML only**: A list of entity ids that should cause the card to re-render 'in-place'. The view/camera is not changed. This should **very** rarely be needed, but could be useful if the card is both setting and changing HA state of the same object as could be the case for some complex `card_mod` scenarios ([example](https://github.com/dermotduffy/frigate-hass-card/issues/343)). |
| `reset_after_interaction` | `true`                                                    | If `true` the card will reset to the default configured view (i.e. 'screensaver' functionality) after `interaction_seconds` has elapsed after user interaction.                                                                                                                                                                                                                              |
| `triggers`                |                                                           | How to react when a camera is [triggered](cameras/README.md?id=triggers).                                                                                                                                                                                                                                                                                                                    |
| `default_cycle_camera`    | `false`                                                   | When set to `true` the selected camera is cycled on each default view change.                                                                                                                                                                                                                                                                                                                |

## `default_reset`

Configure the circumstances and behavior that cause the card to reset to the default view. All configuration is under:

```yaml
view:
  default_reset: [...]
```

| Option              | Default    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `after_interaction` | `true`     | If `true` the card will reset to the default configured view (i.e. 'screensaver' functionality) after `interaction_seconds` has elapsed after user interaction.                                                                                                                                                                                                                                                                                                                                                       |
| `entities`          |            | A list of entities that should cause the view to reset to the default (if the entity only pertains to a particular camera use [`triggers`](cameras/README.md?id=triggers) for the selected camera instead).                                                                                                                                                                                                                                                                                                           |
| `interaction_mode`  | `inactive` | Whether the default reset should happen when the card is being interacted with. If `all`, the reset will always happen regardless. If `inactive` the reset will only be taken if the card has _not_ had human interaction recently (as defined by `view.interaction_seconds`). If `active` the reset will only be happen if the card _has_ had human interaction recently. This controls resets triggered by `entities` and `every_seconds`, but not `after_interaction` which by definition requires no interaction. |
| `every_seconds`     | `0`        | A number of seconds after which to automatically reset to the default view. `0` disables this functionality.                                                                                                                                                                                                                                                                                                                                                                                                          |

## `keyboard_shortcuts`

All configuration is under:

```yaml
view:
  keyboard_shortcuts: [...]
```

Configure the key-bindings for the builtin keyboard shortcuts. See [usage](../usage/keyboard-shortcuts.md) information for defaults on keyboard shortcuts.

| Option                                                                                   | Default                                                   | Description                                                                             |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `enabled`                                                                                | `true`                                                    | If `true`, keyboard shortcuts are enabled. If `false`, they are disabled.               |
| `ptz_left`, `ptz_right`, `ptz_up`, `ptz_down`, `ptz_zoom_in`, `ptz_zoom_out`, `ptz_home` | See [usage](../usage/keyboard-shortcuts.md) for defaults. | An object that configures the key binding for a given pre-configured action. See below. |

### Keyboard Shortcut Configuration

| Option | Default | Description                                                                                                                      |
| ------ | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| key    |         | Any [keyboard key value](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values), e.g. `ArrowLeft` |
| ctrl   | `false` | If `true` requires the `ctrl` key to be held.                                                                                    |
| shift  | `false` | If `true` requires the `shift` key to be held.                                                                                   |
| alt    | `false` | If `true` requires the `alt` key to be held.                                                                                     |
| meta   | `false` | If `true` requires the `meta` key to be held.                                                                                    |

## `triggers`

The `triggers` block controls how the card reacts when a camera is triggered (note that _what_ triggers the camera is controlled by the [`triggers`](cameras/README.md?id=triggers) block within the config for a given camera). This can be used for a variety of purposes, such as allowing the card to automatically change to `live` for a camera that triggers.

All configuration is under:

```yaml
view:
  triggers:
    # [...]
```

When a camera untriggers (e.g. an entity state returning to something other than
`on` or `open`), an action can also be taken with an optional number of seconds
to wait prior to the acting (see `untrigger_seconds`). By default, triggering is
only allowed when there is no ongoing human interaction with the card. This
behavior can be controlled by the `interaction_mode` parameter.

Triggers based on Home Assistant entities require state _changes_ -- when the
card is first started, it takes an active change in state to trigger (i.e. an
already occupied room will not trigger, but a newly occupied room will).

| Option                   | Default | Description                                                                                                                        |
| ------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `actions`                |         | The actions to take when a camera is triggered. See below.                                                                         |
| `filter_selected_camera` | `false` | If set to `true` will only trigger on the currently selected camera.                                                               |
| `show_trigger_status`    | `false` | Whether or not the `live` view should show a visual indication that it is triggered (a pulsing border around the camera edge).     |
| `untrigger_seconds`      | `0`     | The number of seconds to wait after a camera untriggers before considering the card untriggered and taking the `untrigger` action. |

### Trigger action configuration

| Option             | Default    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `interaction_mode` | `inactive` | Whether actions should be taken when the card is being interacted with. If `all`, actions will always left be taken regardless. If `inactive` actions will only be taken if the card has _not_ had human interaction recently (as defined by `view.interaction_seconds`). If `active` actions will only be taken if the card _has_ had human interaction recently. This does not stop triggering itself (i.e. border will still pulse if `show_trigger_status` is true) but rather just prevents the actions being performed. |
| `trigger`          | `update`   | If set to `update` the current view is updated in place. If set to `default` the default view of the card will be reloaded. If set to `live` the triggered camera will be selected in `live` view. If set to `media` the appropriate media view (e.g. `clip` or `snapshot`) will be chosen to match a newly available media item (please note that only some [camera engines](cameras/engine.md) support new media detection, e.g. `frigate`). If set to `none` no action is taken.                                           |
| `untrigger`        | `none`     | If set to `default` the the default view of the card will be reloaded. If set to `none` no action will be taken.                                                                                                                                                                                                                                                                                                                                                                                                              |

## Supported views

This card supports several different views.

| Key          | Description                                                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clip`       | Shows a viewer for the most recent clip for this camera. Can also be accessed by holding down the `clips` menu icon.                               |
| `clips`      | Shows a gallery of clips for this camera.                                                                                                          |
| `image`      | Shows a static image specified by the `image` parameter, can be used as a discrete default view or a screensaver (via `view.interaction_seconds`). |
| `live`       | Shows the live camera view with the configured [live provider]().                                                                                  |
| `recording`  | Shows a viewer for the most recent recording for this camera. Can also be accessed by holding down the `recordings` menu icon.                     |
| `recordings` | Shows a gallery of recent (last day) recordings for this camera and its dependents.                                                                |
| `snapshot`   | Shows a viewer for the most recent snapshot for this camera. Can also be accessed by holding down the `snapshots` menu icon.                       |
| `snapshots`  | Shows a gallery of snapshots for this camera.                                                                                                      |
| `timeline`   | Shows an event timeline.                                                                                                                           |

The default view is `live`, but can be configured by the `view.default` parameter.

## Fully expanded reference

[](common/expanded-warning.md ':include')

```yaml
view:
  default: live
  camera_select: current
  interaction_seconds: 300
  default_cycle_camera: false
  default_reset:
    after_interaction: false
    entities:
      - binary_sensor.my_motion_sensor
    every_seconds: 0
    interaction_mode: inactive
  render_entities:
    - switch.render_card
  dark_mode: 'off'
  triggers:
    show_trigger_status: false
    filter_selected_camera: true
    untrigger_seconds: 0
    actions:
      interaction_mode: inactive
      trigger: update
      untrigger: none
  keyboard_shortcuts:
    enabled: true
    ptz_left:
      key: 'ArrowLeft'
    ptz_right:
      key: 'ArrowRight'
    ptz_up:
      key: 'ArrowUp'
    ptz_down:
      key: 'ArrowDown'
    ptz_zoom_in:
      key: '+'
    ptz_zoom_out:
      key: '-'
    ptz_home:
      key: 'h'
  actions:
    entity: light.office_main_lights
    tap_action:
      action: none
    hold_action:
      action: none
    double_tap_action:
      action: none
    start_tap_action:
      action: none
    end_tap_action:
      action: none
```
