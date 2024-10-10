export type ViewMediaType = 'clip' | 'snapshot' | 'recording';

export enum VideoContentType {
  MP4 = 'mp4',
  HLS = 'hls',
}

export class ViewMedia {
  protected _mediaType: ViewMediaType;
  protected _cameraID: string;

  constructor(mediaType: ViewMediaType, cameraID: string) {
    this._mediaType = mediaType;
    this._cameraID = cameraID;
  }
  public getCameraID(): string {
    return this._cameraID;
  }
  public getMediaType(): ViewMediaType {
    return this._mediaType;
  }
  public getVideoContentType(): VideoContentType | null {
    return null;
  }
  public getID(): string | null {
    return null;
  }
  public getStartTime(): Date | null {
    return null;
  }
  public getEndTime(): Date | null {
    return null;
  }
  public getUsableEndTime(): Date | null {
    return this.getEndTime() ?? (this.inProgress() ? new Date() : this.getStartTime());
  }
  public inProgress(): boolean | null {
    return null;
  }
  public getContentID(): string | null {
    return null;
  }
  public getTitle(): string | null {
    return null;
  }
  public getThumbnail(): string | null {
    return null;
  }
  public isFavorite(): boolean | null {
    return null;
  }
  public includesTime(seek: Date): boolean {
    const startTime = this.getStartTime();
    const endTime = this.getUsableEndTime();
    return !!startTime && !!endTime && seek >= startTime && seek <= endTime;
  }

  // Sets the favorite attribute (if any). This purely sets the media item as a
  // favorite in JS.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setFavorite(_favorite: boolean): void {
    return;
  }
  public getWhere(): string[] | null {
    return null;
  }
}

export interface EventViewMedia extends ViewMedia {
  getScore(): number | null;
  getWhat(): string[] | null;
  getTags(): string[] | null;
  isGroupableWith(that: EventViewMedia): boolean;
}

export interface RecordingViewMedia extends ViewMedia {
  getEventCount(): number | null;
}
