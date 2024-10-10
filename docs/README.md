# Getting Started

## Installation

- [HACS](https://hacs.xyz/) is **highly** recommended to install the card -- it works for all Home Assistant variants. If you don't have [HACS](https://hacs.xyz/) installed, start there -- then come back to these instructions.

- Find the card in HACS:

```
Home Assistant > HACS > Frontend > "Explore & Add Integrations" > Frigate Card
```

- Click `Download this repository with HACS`.

See [Advanced Installation](advanced-installation.md) for other installation resources, or [Rolling Back](./rolling-back.md) to rollback to prior versions.

## Adding your card

- On a Home Assistant dashboard, choose:

```
[Three dots menu] > Edit dashboard
```

- Click `+ Add Card` shown on the bottom of the screen
- Choose `Custom: Frigate card` from the list

## Initial configuration

### Minimal configuration

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
```

### Video scrubbing configuration

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
profiles:
  - scrubbing
```

### Multi-camera grid configuration

```yaml
type: custom:frigate-card
cameras:
  - camera_entity: camera.office
  - camera_entity: camera.kitchen
live:
  display:
    mode: grid
```

See [Configuration](configuration/README.md) for full details on supported configuration options.
