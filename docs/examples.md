# Examples

## Actions on `tap`

You can add actions to the card to be trigger on `tap`, `double_tap`, `hold`, `start_tap` or `end_tap`.

In this example double clicking the card in any view will cause the card to go
into fullscreen mode, **except** when the view is `live` in which case the
office lights are toggled.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
view:
  actions:
    double_tap_action:
      action: custom:frigate-card-action
      frigate_card_action: fullscreen
live:
  actions:
    entity: light.office_main_lights
    double_tap_action:
      action: toggle
```

## Aspect ratios

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
dimensions:
  aspect_ratio_mode: static
  aspect_ratio: '4:3'
```

## Automation

### Responding to fullscreen

This example will automatically turn on the first configured substream when the
card is put in fullscreen mode, and turn off the substream when exiting
fullscreen mode.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
    live_provider: image
    dependencies:
      cameras:
        - office_hd
  - camera_entity: camera.office
    title: Office HD
    live_provider: go2rtc
    id: office_hd
    capabilities:
      disable_except:
        - substream
automations:
  - conditions:
      - condition: fullscreen
        fullscreen: true
    actions:
      - action: custom:frigate-card-action
        frigate_card_action: live_substream_on
    actions_not:
      - action: custom:frigate-card-action
        frigate_card_action: live_substream_off
```

### Responding to key input

In addition to a handful of reconfigurable [built-in keyboard shortcuts](./usage/keyboard-shortcuts.md), `automations` can be used to take any action based on any keyboard input. These examples use [`key` conditions](./configuration/conditions.md?id=key) to assess keyboard state before taking action.

#### Change to `live` temporarily

In this example, the view will change to `live`, when `Alt+Z` is pressed, and change to the `clips` view `5` seconds later.

```yaml
automations:
  - conditions:
      - condition: key
        key: z
        alt: true
    actions:
      - action: custom:frigate-card-action
        frigate_card_action: live
      - action: custom:frigate-card-action
        frigate_card_action: sleep
        duration:
          s: 5
      - action: custom:frigate-card-action
        frigate_card_action: clips
```

#### Change to `live` while key _held_ down

In this example, the view will change to `live`, when `Alt+Z` is _held_ down, and immediately change to `clips` when _released_.

```yaml
automations:
  - conditions:
      - condition: key
        key: z
        alt: true
    actions:
      - action: custom:frigate-card-action
        frigate_card_action: live
    actions_not:
      - action: custom:frigate-card-action
        frigate_card_action: clips
```

## Cameras

### `frigate` camera without a `camera_entity`

In this example, there is no Home Assistant entity linked to the camera, just a `frigate` camera name:

```yaml
type: custom:frigate-card
cameras:
  - frigate:
      camera_name: office
    live_provider: go2rtc
```

### `go2rtc` stream without a `camera_entity`

In this example, there is no Home Assistant entity linked to the camera, just a `go2rtc` stream.

```yaml
type: custom:frigate-card
cameras:
  - live_provider: go2rtc
    go2rtc:
      stream: office
      url: https://my.go2rtc.url:1984/
```

!> Browsers will reject [mixed content](https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content): if you access Home Assistant over `https`, you must also put `go2rtc` behind `https` and use that in the `url` parameter.

## `card-mod`

This card allows the use of
[card-mod](https://github.com/thomasloven/lovelace-card-mod) to style arbitrary
card contents.

!> `card-mod` relies on the underlying internal DOM structure to style elements
-- as such, while its use is possible, it's not officially supported and zero
attempt is made to preserve backwards compatability of the internal DOM between
any versions. It may look good, but you're on your own!

This example changes the color and removes the padding around a [Picture
Elements state
label](https://www.home-assistant.io/lovelace/picture-elements/#state-label).

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
card_mod:
  style:
    frigate-card-elements $:
      hui-state-label-element $: |
        div {
          padding: 0px !important;
          color: blue;
        }
```

## Cast a `dashboard`

This example will configure a Frigate card that can cast a dashboard view to a media player, which has a second Frigate card in panel mode with a low-latency live provider.

### Source card

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
    live_provider: image
    cast:
      method: dashboard
      dashboard:
        dashboard_path: cast
        view_path: office
```

### Dashboard configuration

?> This dashboard is configured at the path `/cast/` (path referred to in `dashboard_path` above).

```yaml
title: Frigate Card Casting
views:
  - title: Casting
    # This path is referred to in `view_path` above.
    path: office
    # Ensure the video is "maximized" / dashboard in "panel" mode.
    type: panel
    cards:
      - type: custom:frigate-card
        cameras:
          - camera_entity: camera.office
            live_provider: go2rtc
```

## Conditional elements

You can restrict elements to only show for certain
[views](configuration/view.md?id=supported-views) using a
`custom:frigate-card-conditional` element. This example shows a car icon that
calls a service but only in the `live` view.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
elements:
  - type: custom:frigate-card-conditional
    conditions:
      - condition: view
        views:
          - live
    elements:
      - type: icon
        icon: mdi:car
        style:
          background: rgba(255, 255, 255, 0.25)
          border-radius: 5px
          right: 25px
          bottom: 50px
        tap_action:
          action: perform-action
          service: amcrest.ptz_control
          data:
            entity_id: camera.kitchen
            movement: up
```

## Conditional menu icons

You can have icons conditionally added to the menu based on entity state.

### Show a menu icon based on state

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
elements:
  - type: conditional
    conditions:
      - condition: state
        entity: light.office_main_lights
        state: on
    elements:
      - type: custom:frigate-card-menu-state-icon
        entity: light.office
        tap_action:
          action: toggle
```

### Show a menu icon based on camera triggering

This example adds a menu button to optionally activate a siren when the camera is triggered.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
elements:
  - type: custom:frigate-card-conditional
    elements:
      - type: custom:frigate-card-menu-icon
        icon: mdi:alarm-bell
        title: Activate alarm
        style:
          color: red
        tap_action:
          action: perform-action
          perform_action: homeassistant.toggle
          target:
            entity_id: siren.siren
    conditions:
      - condition: triggered
        triggered:
          - camera.office
```

## Events from other cameras

`dependencies.cameras` allows events/recordings for other cameras to be shown
along with the currently selected camera. For example, this can be used to show
events with the `birdseye` camera (since it will not have events of its own).

### Using dependent cameras with birdseye

This example shows events for two other cameras when `birdseye` is selected.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
  - camera_entity: camera.kitchen
  - frigate:
      camera_name: birdseye
    dependencies:
      cameras:
        - camera.office
        - camera.kitchen
```

### Using dependent cameras with birdseye for all cameras

This example shows events for _all_ other cameras when `birdseye` is selected.
This is just a shortcut for naming all other cameras.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.kitchen
  - camera_entity: camera.sitting_room
  - frigate:
      camera_name: birdseye
    dependencies:
      all_cameras: true
```

## Human interaction

This example will automatically use a HD live substream when
the mouse cursor interacts with the card.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
    live_provider: image
    dependencies:
      cameras:
        - camera.office_hd
  - camera_entity: camera.office_hd
    live_provider: go2rtc
    capabilities:
      disable_except:
        - substream
automations:
  - actions:
      - action: custom:frigate-card-action
        frigate_card_action: live_substream_on
    actions_not:
      - action: custom:frigate-card-action
        frigate_card_action: live_substream_off
    conditions:
      - condition: interaction
        interaction: true
```

## Media layout

These examples change how the media fits and is positioned within the card dimensions.

### Stretch a camera into a 4:4 square

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.landing
    dimensions:
      aspect_ratio: '4:4'
      layout:
        fit: fill
```

### Convert a landscape camera to a portrait live view

Take the left-hand side (position with x == `0`) and use that as the basis of a `9:16` (i.e. portrait) live view.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
    dimensions:
      aspect_ratio: '9:16'
      layout:
        fit: cover
        position:
          x: 0
```

## Menu alignment

This example moves the fullscreen button into its own group aligned to the
`left`, enables the `image` button and orders it furthest to the `right`.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
menu:
  alignment: right
  buttons:
    image:
      enabled: true
      priority: 100
    fullscreen:
      alignment: opposing
```

## Menu icons

You can add custom icons to the menu with arbitrary actions. This example adds
an icon that navigates the browser to the releases page for this card:

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
elements:
  - type: custom:frigate-card-menu-icon
    icon: mdi:book
    tap_action:
      action: url
      url_path: https://github.com/dermotduffy/frigate-hass-card/releases
```

## Menu state icons

You can add custom state icons to the menu to show the state of an entity and
complete arbitrary actions. This example adds an icon that represents the state
of the `light.office_main_lights` entity, that toggles the light on double
click.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
elements:
  - type: custom:frigate-card-menu-state-icon
    entity: light.office_main_lights
    tap_action:
      action: toggle
```

## Multiple actions

This example shows how to configure multiple actions for a single Frigate card user interaction, in this case both selecting a different camera and changing the view on `tap`. Note that multiple actions are not supported on stock Picture Elements, see [actions](configuration/actions/README.md) for more information.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
elements:
  - type: custom:frigate-card-menu-icon
    icon: mdi:chair-rolling
    tap_action:
      - action: custom:frigate-card-action
        frigate_card_action: camera_select
        camera: camera.office
      - action: custom:frigate-card-action
        frigate_card_action: live
```

## Multiple providers

Cameras can be repeated with different providers (note the required use of `id`
to provide a separate unambiguous way of referring to that camera, since the
`camera_entity` is shared between the two cameras).

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
    live_provider: jsmpeg
    title: Office (JSMPEG)
  - camera_entity: camera.office
    live_provider: webrtc-card
    title: Office (WebRTC)
    id: office-webrtc
```

## Overriding configuration

You can override card configuration when certain [conditions](configuration/conditions.md) are met.

### Change menu position based on HA state

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
overrides:
  - conditions:
      - condition: state
        entity: light.office_main_lights
        state: 'on'
    merge:
      menu:
        position: bottom
```

### Change default view based on HA state

This example changes the default card view from `live` to `image` depending on
the value of the `binary_sensor.alarm_armed` sensor. The override alone will
only change the _default_ when the card next is requested to change to the
default view. By also including the `view.default_reset.entities` parameter, we
ask the card to trigger a card update based on that entity -- which causes it to
use the new overriden default immediately.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
view:
  default: live
  default_reset:
    entities:
      - binary_sensor.alarm_armed
overrides:
  - conditions:
      - condition: state
        entity: binary_sensor.alarm_armed
        state: 'off'
    merge:
      view:
        default: image
```

### Change grid behavior in full screen

This example will always render 5 columns in fullscreen mode in both the live
and media viewer views, and will not enlarge the selected item. The [normal auto-layout behavior](configuration/grid-layout-algorithm.md) will be used outside of fullscreen mode.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
overrides:
  - conditions:
      - condition: fullscreen
        fullscreen: true
      - condition: display_mode
        display_mode: grid
    merge:
      live:
        display:
          grid_columns: 5
          grid_selected_width_factor: 1
      media_viewer:
        display:
          grid_columns: 5
          grid_selected_width_factor: 1
```

### Change menu style when expanded

This example changes the menu style to `overlay` in expanded mode in order to
take advantage of the extra horizontal space of the dialog/popup.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
menu:
  style: hidden
overrides:
  - conditions:
      - condition: expand
        expand: true
    merge:
      menu:
        style: overlay
```

### Hide menu in fullscreen

This example disables the menu unless the card is in fullscreen mode, and uses a
card-wide action to enable fullscreen mode on `double_tap`.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
view:
  actions:
    double_tap_action:
      action: custom:frigate-card-action
      frigate_card_action: fullscreen
overrides:
  - conditions:
      - condition: fullscreen
        fullscreen: true
    merge:
      menu:
        style: none
```

### Remove a camera when an entity state changes

This example removes a camera from the card when an entity is disabled (e.g. a switch controlling power to the camera).

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
  - camera_entity: camera.kitchen
overrides:
  - conditions:
      - condition: state
        entity: switch.kitchen_camera_power
        state: off
    delete:
      - 'cameras[1]'
```

## PTZ control

The card supports using PTZ controls to conveniently control pan, tilt and zoom for cameras. This example shows the PTZ controls on the `live` view. Note that if your camera engine supports it (e.g. `frigate`) this will just work out of the box with no configuration at all.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
live:
  ptz:
    orientation: horizontal
    service: sonoff.send_command
    data_left:
      device: '048123'
      cmd: left
    data_right:
      device: '048123'
      cmd: right
    data_up:
      device: '048123'
      cmd: up
    data_down:
      device: '048123'
      cmd: down
```

## `screen` conditions

These examples show altering the card configuration based on device or viewport properties.

### Change menu position when orientation changes

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
  - camera_entity: camera.kitchen
menu:
  style: overlay
overrides:
  - conditions:
      - condition: screen
        media_query: '(orientation: landscape)'
    merge:
      menu:
        position: left
```

### Hide menu & controls when viewport width &lt;= 300 (e.g. PIP mode)

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
  - camera_entity: camera.kitchen
overrides:
  - conditions:
      - condition: screen
        media_query: '(max-width: 300px)'
    merge:
      menu:
        style: none
      live:
        controls:
          next_previous:
            style: none
          thumbnails:
            mode: none
```

## State Badges

You can add a state badge to the card showing arbitrary entity states. This
example adds a state badge showing the temperature and hides the label text:

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
elements:
  - type: state-badge
    entity: sensor.office_temperature
    style:
      right: '-20px'
      top: 100px
      color: rgba(0,0,0,0)
      opacity: 0.5
```

![](images/picture-elements-temperature.png 'Picture elements temperature example :size=400')

## Static images

This example fetches a static image every 10 seconds (in this case the latest image saved on the Frigate server for a given camera).

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
view:
  default: image
image:
  src: https://my-friage-server/api/living_room/latest.jpg
  refresh_seconds: 10
```

## Status bar

### Disable status bar

This example disables the status bar.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
status_bar:
  style: none
```

### Dynamic status bar contents

This example shows an icon and a message on the status bar when a camera is triggered, replacing the existing contents of the status bar through the use of `exclusive`.

![](images/dynamic-status.gif 'Dynamic Status Messages :size=400')

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
automations:
  - conditions:
      - condition: triggered
        triggered:
          - camera.office
    actions:
      - action: custom:frigate-card-action
        frigate_card_action: status_bar
        status_bar_action: add
        items:
          - type: custom:frigate-card-status-bar-icon
            icon: mdi:alarm-light
            exclusive: true
          - type: custom:frigate-card-status-bar-string
            string: Intruder detected!
            expand: true
            exclusive: true
            sufficient: true
    actions_not:
      - action: custom:frigate-card-action
        frigate_card_action: status_bar
        status_bar_action: reset
```

## Submenus

You can add submenus to the menu -- buttons that when pressed reveal a dropdown submenu of configurable options.

### Basic submenu

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
elements:
  - type: custom:frigate-card-menu-submenu
    icon: mdi:menu
    items:
      - title: Lights
        icon: mdi:lightbulb
        entity: light.office_main_lights
        tap_action:
          action: toggle
      - title: Google
        icon: mdi:google
        tap_action:
          action: url
          url_path: https://www.google.com
      - title: Fullscreen
        icon: mdi:fullscreen
        tap_action:
          action: custom:frigate-card-action
          frigate_card_action: fullscreen
```

### Conditional submenu

This example shows submenus conditional on the camera selected.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
elements:
  - type: custom:frigate-card-conditional
    conditions:
      - condition: camera
        cameras:
          - camera.office
    elements:
      - type: custom:frigate-card-menu-submenu
        icon: mdi:door
        items:
          - title: Office Lights
            icon: mdi:lightbulb
            entity: light.office_main_lights
            tap_action:
              action: toggle
  - type: custom:frigate-card-conditional
    conditions:
      - condition: camera
        cameras:
          - camera.kitchen
    elements:
      - type: custom:frigate-card-menu-submenu
        icon: mdi:sofa
        items:
          - title: Kitchen Lights
            icon: mdi:lightbulb
            entity: light.kitchen_lights
            tap_action:
              action: toggle
          - title: Kitchen Lamp
            icon: mdi:lightbulb
            entity: light.kitchen_lamp
            tap_action:
              action: toggle
```

### `select` submenu

You can easily add a submenu to the menu based on a `select` or `input_select` entity. This example imagines the user has an `input_select` entity configured in their Home Assistant configuration like so:

```yaml
input_select:
  office_scene:
    name: Office Scene Select
    options:
      - scene.office_quiet_scene
      - scene.office_party_scene
    icon: mdi:lightbulb
```

The following will convert this entity into a submenu:

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
elements:
  - type: custom:frigate-card-menu-submenu-select
    entity: input_select.office_scene
```

To override 1 or more individual options (e.g. to set custom icons and titles)

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
elements:
  - type: custom:frigate-card-menu-submenu-select
    icon: mdi:lamps
    entity: input_select.office_scene
    options:
      scene.office_quiet_scene:
        icon: mdi:volume-off
        title: Ssssssh
      scene.office_party_scene:
        icon: mdi:party-popper
        title: Party!
```

## Substreams

The card supports configuring 'substreams' (alternative live views) a given
camera through the use of [camera dependencies](configuration/cameras/README.md?id=dependencies).

This example shows two substreams for a single live camera, and uses the 'HD' icon.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
    live_provider: image
    dependencies:
      cameras:
        - office_hd
  - camera_entity: camera.office
    title: Office HD
    live_provider: go2rtc
    id: office_hd
    # This camera serves only as a substream.
    capabilities:
      disable_except:
        - substream
menu:
  buttons:
    substreams:
      icon: mdi:high-definition
```

## Trigger actions

You can control the card itself with the `custom:frigate-card-action` action.
This example shows an icon that toggles the card fullscreen mode.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
elements:
  - type: icon
    icon: mdi:fullscreen
    style:
      left: 40px
      top: 40px
    tap_action:
      action: custom:frigate-card-action
      frigate_card_action: fullscreen
```

## Trigger fullscreen

The card cannot automatically natively trigger fullscreen mode without the user
clicking, since Javascript (understandbly) prevents random websites from
triggering fullscreen mode without the user having activated it.

This example uses
[hass-browser_mod](https://github.com/thomasloven/hass-browser_mod) with an
automation to trigger a popup. Thanks to
[conorlap@](https://github.com/conorlap) for the following example:

```yaml
alias: >-
  Doorbell Pressed OR Human Detected - Firefox browser full screen video feed
  for 15 seconds
description: ''
trigger:
  - platform: state
    from: 'off'
    to: 'on'
    entity_id:
      - binary_sensor.frontdoor_person_occupancy
  - platform: state
    entity_id:
      - binary_sensor.front_door_dahua_button_pressed
    to: 'on'
condition: []
action:
  - service: browser_mod.popup
    data:
      size: wide
      timeout: 15000
      content:
        type: custom:frigate-card
        aspect_ratio: 55%
        cameras:
          - camera_entity: camera.frontdoor
            live_provider: ha
        menu:
          style: none
        live:
          controls:
            title:
              mode: none
    target:
      device_id:
        - d0e93101edfg44y3yt35y5y45y54y
mode: single
```

## Trigger `live`

This example will change to `live` when a camera is triggered, using different
trigger conditions per camera. It will change back to the `default` view when
untriggered.

```yaml
type: custom:frigate-card
cameras:
  # This is a Frigate camera which will automatically
  # be triggered when events occur.
  - camera_entity: camera.office
  # This is a Frigate camera which will only be triggered
  # by motion entity changes or a door being opened.
  - camera_entity: camera.kitchen
    triggers:
      occupancy: false
      motion: true
      entities:
        - binary_sensor.kitchen_door_opened
      events: []
view:
  triggers:
    show_trigger_status: true
    filter_selected_camera: false
    actions:
      trigger: live
      untrigger: default
```

## Video control from menu

Disable the stock video controls and add menu button equivalents.

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
live:
  controls:
    builtin: false
media_viewer:
  controls:
    builtin: false
menu:
  buttons:
    play:
      enabled: true
    mute:
      enabled: true
```

## URL actions

The card can respond to actions in the query string. See [URL Actions](usage/url-actions.md).

?> These examples assume the dashboard URL is `https://ha.mydomain.org/lovelace-test/0` .

### Choosing `clips` view on a named card

This example assumes that one card (of potentially multiple Frigate Cards on the dashboard) is configured with a `card_id` parameter:

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
card_id: main
```

```
https://ha.mydomain.org/lovelace-test/0?frigate-card-action.main.clips

```

### Choosing the camera from a separate picture elements card

In this example, the card will select a given camera when the user navigates from a _separate_ Picture Elements card:

Frigate Card configuration:

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
  - camera_entity: camera.kitchen
```

Picture Elements configuration:

```yaml
type: picture-elements
image: https://demo.home-assistant.io/stub_config/floorplan.png
elements:
  - type: icon
    icon: mdi:cctv
    style:
      top: 22%
      left: 30%
    tap_action:
      action: navigate
      navigation_path: /lovelace-test/0?frigate-card-action.camera_select=camera.office
  - type: icon
    icon: mdi:cctv
    style:
      top: 71%
      left: 42%
    tap_action:
      action: navigate
      navigation_path: /lovelace-test/0?frigate-card-action.camera_select=camera.kitchen
```

![](images/navigate-picture-elements.gif 'Taking card actions via the URL :size=400')

### Selecting a camera in expanded mode via query string

```
https://ha.mydomain.org/lovelace-test/0?frigate-card-action.camera_select=kitchen&frigate-card-action.expand
```

## WebRTC Card configuration

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
    live_provider: webrtc-card
    webrtc_card:
      ui: true
```

## Zoom

### Pre-defining camera zoom and pan

This example changes the default [zoom/pan settings for a camera](./configuration/cameras/README.md?id=layout-configuration) to always zoom in on a given area:

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
    dimensions:
      layout:
        zoom: 3
        pan:
          x: 20
          y: 80
```

### Disable zooming in media views

This example prevents zooming on the media viewer but keeps it on in other views (e.g. `live` view):

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
    dimensions:
      layout:
        zoom: 3
        pan:
          x: 20
          y: 80
media_viewer:
  zoomable: false
```

### Different zoom settings in media viewer vs `live`

This example uses different settings for the media viewer and `live` view, by overriding the camera configuration:

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
    dimensions:
      layout:
        zoom: 2
overrides:
  - conditions:
      - condition: view
        views:
          - media
    set:
      'cameras[0].dimensions.layout':
        zoom: 3
        pan:
          x: 100
          y: 100
```

### Automatically zoom based on state

This example automatically zooms in and out based on the state of an entity:

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.living_room
    live_provider: go2rtc
debug:
  logging: true
automations:
  - conditions:
      - condition: state
        entity: binary_sensor.door_contact
        state: 'on'
    actions:
      - action: custom:frigate-card-action
        frigate_card_action: change_zoom
        target_id: camera.living_room
        zoom: 4
        pan:
          x: 38
          y: 20
    actions_not:
      - action: custom:frigate-card-action
        frigate_card_action: change_zoom
        target_id: camera.living_room
```

![](images/zoom-automation.gif 'Zoom automation example :size=400')
