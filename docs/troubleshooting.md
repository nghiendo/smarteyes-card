# Troubleshooting

### 2-way audio doesn't work

There are many requirements for 2-way audio to work. See [Using 2-way
audio](usage/2-way-audio.md) for more information about these. If your
microphone still does not work and you believe you meet all the requirements try
eliminating the card from the picture by going directly to the `go2rtc` UI,
navigating to `links` for your given stream, then to `webrtc.html` with a
microphone. If this does not work correctly with 2-way audio then your issue is
with `go2rtc` not with the card. In this case, you could file an issue in [that
repo](https://github.com/AlexxIT/go2rtc/issues) with debugging information as
appropriate.

### Android will not render &gt;4 JSMPEG live views

Android Webview (as used by Android Chrome / Android Home Assistant Companion)
appears to severely limit the number of simultaneous OpenGL contexts that can be
opened. The JSMPEG player (that this card uses), consumes 1 OpenGL context per
rendering.

This limitation may be worked around (at a performance penalty) by disabling
OpenGL for JSMPEG live views:

```yaml
live:
  jsmpeg:
    options:
      disableGl: true
```

[This bug](https://github.com/dermotduffy/frigate-hass-card/issues/191) has some
more discussion on this topic. New ideas to address this underlying limitation
most welcome!

### Autoplay in Chrome when a tab becomes visible again

Even if `live.auto_play` or `media_viewer.auto_play` is set to `[]`, Chrome
itself will still auto play a video that was previously playing prior to the tab
being hidden, once that tab is visible again. This behavior cannot be influenced
by the card. Other browsers (e.g. Firefox, Safari) do not exhibit this behavior.

### Blank white image on `live` view

For some slowly loading cameras, for which [Home Assistant stream
preloading](https://www.home-assistant.io/integrations/camera/) is not enabled,
Home Assistant may return a blank white image when asked for a still. These
stills are used during initial Frigate card load of the `live` view if the
`live.show_image_during_load` option is enabled. Disabling this option should
show the default media loading controls (e.g. a spinner or empty video player)
instead of the blank white image.

### Casting to Chromecast broken

This could be for any number of reasons. Chromecast devices can be quite picky
on network, DNS and certificate issues, as well as audio and video codecs. Check
your Home Assistant log as there may be more information in there.

!> In particular, for Frigate to support casting of clips, the default ffmpeg
settings for Frigate must be modified, i.e. Frigate does not encode clips in a
Chromecast compatible format out of the box (specifically: audio must be enabled
in the AAC codec, whether your camera supports audio or not). See the [Frigate
Home Assistant
documentation](https://docs.frigate.video/integrations/home-assistant) or [this
issue](https://github.com/blakeblackshear/frigate/issues/3175) for more.

### Custom element does not exist

This is usually a sign that the card is not correctly installed (i.e. the
browser cannot find the Javascript). In cases where it works in some browsers /
devices but not in others it may simply be an old browser / webview that does
not support modern Javascript (this is occasionally seen on old Android
hardware). In this latter case, you are out of luck.

### `double_tap` does not work in Android

The Android video player swallows `double_tap` interactions in order to
rewind or fast-forward. Workarounds:

- Use `hold` instead of `double_tap` for your card-wide action.
- Use a [Frigate Card Element](configuration/elements/README.md) or menu icon to
  trigger the action instead.

### Dragging in carousels broken in Firefox

The Firefox video player swallows mouse interactions, so dragging is not
possible in carousels that use the Firefox video player (e.g. `clips` carousel,
or live views that use the `frigate` or `webrtc-card` provider). The next and
previous buttons may be used to navigate in these instances.

Dragging works as expected for snapshots, or for the `jsmpeg` provider.

### Dragging video control doesn't work in Safari

Dragging the Safari video controls "progress bar" conflicts with carousel
"dragging", meaning the video controls progress bar cannot be moved left or
right. Turning off carousel dragging (and using next/previous controls) will
return full video controls in Safari:

```yaml
live:
  draggable: false
media_viewer:
  draggable: false
```

### Downloads don't work

Downloads are assembled by the Frigate backend out of ~10s segment files. You
must have enough cache space in your Frigate instance to allow this assembly to
happen -- if large downloads don't work, especially for recordings, check your
Frigate backend logs to see if it's running out of space. You can increase your
cache size with the `tmpfs` `size` argument, see [Frigate
documentation](https://docs.frigate.video/frigate/installation#docker).

Large downloads may take a few seconds to assemble, so there may be a delay
between clicking the download button and the download starting.

### `Forbidden media source identifier`

- If you are using a custom `client_id` setting in your `frigate.yml` file (the
  configuration file for the Frigate backend itself), you must tell the card
  about it. See [Frigate engine
  configuration](configuration/cameras/engine.md?id=frigate).
- You must have the `Enable the media browser` option enabled for the Frigate
  integration, in order for media fetches to work for the card. Media fetches
  are used to fetch events / clips / snapshots, etc. If you just wish to use
  live streams without media fetches, you can use the following configuration:

```yaml
live:
  controls:
    thumbnails:
      mode: none
```

### Fullscreen doesn't work on iPhone

Unfortunately, [iOS does not support the Javascript fullscreen
API](https://caniuse.com/fullscreen). As a result, card-level fullscreen support
for the iPhone is not currently possible.

### iOS App not updating after card version change

Try resetting the app frontend cache:

- `Configuration -> Companion App -> Debugging -> Reset frontend cache`

### Javascript console errors

#### `[Violation] Added non-passive event listener to a scroll-blocking [...] event`

This card uses [visjs](https://github.com/visjs/vis-timeline) -- a timeline
library -- to show camera timelines. This library currently uses non-passive
event-listeners. These warnings can be safely ignored in this instance and
cannot easily be fixed in the underlying library.

### Microphone menu button not shown

The microphone menu button will only appear if both enabled (see [Menu Button
configuration](configuration/menu.md?id=available-buttons)) and if the media
that is currently loaded supports 2-way audio. See [Using 2-way
audio](usage/2-way-audio.md) for more information about the requirements that
must be followed.

### New version not working in Chrome

When upgrading the card it's recommended to reset the frontend cache. Sometimes
clearing site data in Chrome settings isn't enough.

- Press F12 to display `Dev Console` in Chrome then right click on the refresh
  icon and select `Empty Cache and Hard Reload`

### Static image URL with credentials doesn't load

Your browser will not allow a page/script (like this card) to pass credentials
to a cross-origin (different host) image URL for security reasons. There is no
way around this unless you could also control the webserver that is serving the
image to specifically allow `crossorigin` requests (which is typically not the
case for an image served from a camera, for example). The stock Home Assistant
Picture Glance card has the same limitation, for the same reasons.

### Status "popup" continually popping up

Status popup can be disabled with this configuration:

```yaml
status_bar:
  style: none
```

### Watermark shown on livestream

If the `live.show_image_during_load` option is enabled (the default), a
temporary image from Home Assistant is rendered and refreshed every `1s` while
the full stream is loading. When this temporary image is being shown, a small
circular icon is rendered on the top-right of the livestream to indicate to the
user that this is not the true stream. If the icon persists, it means your
underlying stream is not actually loading and may be misconfigured / broken.

### `webrtc_card` unloads in the background

[AlexxIT's WebRTC Card](https://github.com/AlexxIT/WebRTC) which is embedded by
the `webrtc_card` live provider internally disconnects the stream when the
browser tab is changed (regardless of any Frigate card configuration settings,
e.g. `lazy_unload`). To allow the stream to continue running in the background,
pass the `background` argument to the `webrtc_card` live provider as shown
below. This effectively allows the Frigate card to decide whether or not to
unload the stream.

```yaml
live:
  webrtc_card:
    background: true
```
