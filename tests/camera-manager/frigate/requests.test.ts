import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getEvents,
  getEventSummary,
  getPTZInfo,
  getRecordingSegments,
  getRecordingsSummary,
  retainEvent,
} from '../../../src/camera-manager/frigate/requests';
import {
  EventSummary,
  eventSummarySchema,
  FrigateEvent,
  frigateEventsSchema,
  ptzInfoSchema,
  recordingSegmentsSchema,
  recordingSummarySchema,
  retainResultSchema,
} from '../../../src/camera-manager/frigate/types';
import { RecordingSegment } from '../../../src/camera-manager/types';
import { homeAssistantWSRequest } from '../../../src/utils/ha';
import { createFrigateEvent, createHASS } from '../../test-utils';

vi.mock('../../../src/utils/ha');

describe('frigate requests', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });
  it('should get recordings summary', async () => {
    const recordingSummary = {
      events: 0,
      hours: [],
      day: new Date(),
    };
    const hass = createHASS();
    hass.config.time_zone = 'Europe/Dublin';

    vi.mocked(homeAssistantWSRequest).mockResolvedValue(recordingSummary);
    expect(await getRecordingsSummary(hass, 'clientID', 'camera.office')).toBe(
      recordingSummary,
    );
    expect(homeAssistantWSRequest).toBeCalledWith(
      hass,
      recordingSummarySchema,
      expect.objectContaining({
        type: 'frigate/recordings/summary',
        instance_id: 'clientID',
        camera: 'camera.office',
        timezone: 'Europe/Dublin',
      }),
      true,
    );
  });

  it('should get recordings segments', async () => {
    const recordingSegments: RecordingSegment[] = [
      {
        start_time: 0,
        end_time: 1,
        id: 'foo',
      },
    ];
    const hass = createHASS();
    vi.mocked(homeAssistantWSRequest).mockResolvedValue(recordingSegments);
    expect(
      await getRecordingSegments(hass, {
        instance_id: 'clientID',
        camera: 'camera.office',
        after: 1,
        before: 0,
      }),
    ).toBe(recordingSegments);
    expect(homeAssistantWSRequest).toBeCalledWith(
      hass,
      recordingSegmentsSchema,
      expect.objectContaining({
        type: 'frigate/recordings/get',
        instance_id: 'clientID',
        camera: 'camera.office',
        after: 1,
        before: 0,
      }),
      true,
    );
  });

  describe('should retain event', async () => {
    it('successfully', async () => {
      vi.mocked(homeAssistantWSRequest).mockResolvedValue({
        success: true,
        message: 'success',
      });

      const hass = createHASS();
      retainEvent(hass, 'clientID', 'eventID', true);

      expect(homeAssistantWSRequest).toBeCalledWith(
        hass,
        retainResultSchema,
        expect.objectContaining({
          type: 'frigate/event/retain',
          instance_id: 'clientID',
          event_id: 'eventID',
          retain: true,
        }),
        true,
      );
    });

    it('unsuccessfully', async () => {
      vi.mocked(homeAssistantWSRequest).mockResolvedValue({
        success: false,
        message: 'failed',
      });

      const hass = createHASS();
      await expect(retainEvent(hass, 'clientID', 'eventID', true)).rejects.toThrowError(
        /Could not retain event/,
      );
      expect(homeAssistantWSRequest).toBeCalledWith(
        hass,
        retainResultSchema,
        expect.objectContaining({
          type: 'frigate/event/retain',
          instance_id: 'clientID',
          event_id: 'eventID',
          retain: true,
        }),
        true,
      );
    });
  });

  it('should get events', async () => {
    const events: FrigateEvent[] = [createFrigateEvent()];
    const hass = createHASS();
    vi.mocked(homeAssistantWSRequest).mockResolvedValue(events);
    expect(
      await getEvents(hass, {
        instance_id: 'clientID',
        cameras: ['camera.office'],
        labels: ['person'],
        zones: ['zone'],
        after: 0,
        before: 1,
        limit: 10,
        has_clip: true,
        has_snapshot: true,
        favorites: true,
      }),
    ).toBe(events);
    expect(homeAssistantWSRequest).toBeCalledWith(
      hass,
      frigateEventsSchema,
      expect.objectContaining({
        type: 'frigate/events/get',
        instance_id: 'clientID',
        cameras: ['camera.office'],
        labels: ['person'],
        zones: ['zone'],
        after: 0,
        before: 1,
        limit: 10,
        has_clip: true,
        has_snapshot: true,
        favorites: true,
      }),
      true,
    );
  });

  it('should get event summary', async () => {
    const eventSummary: EventSummary = [
      {
        camera: 'camera.office',
        day: '2023-10-29',
        label: 'person',
        sub_label: null,
        zones: ['door'],
      },
    ];
    const hass = createHASS();
    hass.config.time_zone = 'Europe/Dublin';

    vi.mocked(homeAssistantWSRequest).mockResolvedValue(eventSummary);
    expect(await getEventSummary(hass, 'clientID')).toBe(eventSummary);
    expect(homeAssistantWSRequest).toBeCalledWith(
      hass,
      eventSummarySchema,
      expect.objectContaining({
        type: 'frigate/events/summary',
        instance_id: 'clientID',
        timezone: 'Europe/Dublin',
      }),
      true,
    );
  });

  it('should get PTZ info', async () => {
    const ptzInfo = [
      {
        name: 'camera.office',
        features: ['zoom', 'zoom-r'],
        presets: ['preset01', 'preset02'],
      },
    ];
    const hass = createHASS();
    vi.mocked(homeAssistantWSRequest).mockResolvedValue(ptzInfo);
    expect(await getPTZInfo(hass, 'clientID', 'camera.office')).toBe(ptzInfo);
    expect(homeAssistantWSRequest).toBeCalledWith(
      hass,
      ptzInfoSchema,
      expect.objectContaining({
        type: 'frigate/ptz/info',
        instance_id: 'clientID',
        camera: 'camera.office',
      }),
      true,
    );
  });
});
