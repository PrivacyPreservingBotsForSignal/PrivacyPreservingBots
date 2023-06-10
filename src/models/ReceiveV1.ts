export type ReceiveV1Response = Array<ReceiveV1ResponseElement>;

export interface Envelope {
  source: string;
  sourceNumber: string;
  sourceUuid: string;
  sourceName: string;
  sourceDevice: number;
  timestamp: number;
}

export class SyncMessageEnvelope implements Envelope {
  source: string;
  sourceNumber: string;
  sourceUuid: string;
  sourceName: string;
  sourceDevice: number;
  timestamp: number;
  syncMessage: SyncMessage;

  constructor(
    source: string,
    sourceNumber: string,
    sourceUuid: string,
    sourceName: string,
    sourceDevice: number,
    timestamp: number,
    syncMessage: SyncMessage,
  ) {
    this.source = source;
    this.sourceNumber = sourceNumber;
    this.sourceUuid = sourceUuid;
    this.sourceName = sourceName;
    this.sourceDevice = sourceDevice;
    this.timestamp = timestamp;
    this.syncMessage = syncMessage;
  }

  static assertType(envelope: Envelope): envelope is SyncMessageEnvelope {
    return (envelope as SyncMessageEnvelope).syncMessage !== undefined;
  }
}

export interface SyncMessage {
  sentMessage: SentMessage;
}

export interface SentMessage {
  destination: null;
  destinationNumber: null;
  destinationUuid: null;
  timestamp: number;
  message: string;
  expiresInSeconds: number;
  viewOnce: boolean;
  groupInfo: string;
}

export class MessageEnvelope implements Envelope {
  source: string;
  sourceNumber: string;
  sourceUuid: string;
  sourceName: string;
  sourceDevice: number;
  timestamp: number;
  dataMessage: DataMessage;

  constructor(
    source: string,
    sourceNumber: string,
    sourceUuid: string,
    sourceName: string,
    sourceDevice: number,
    timestamp: number,
    dataMessage: DataMessage,
  ) {
    this.source = source;
    this.sourceNumber = sourceNumber;
    this.sourceUuid = sourceUuid;
    this.sourceName = sourceName;
    this.sourceDevice = sourceDevice;
    this.timestamp = timestamp;
    this.dataMessage = dataMessage;
  }

  static fromSyncMessageEnvelope(syncMessageEnvelope: SyncMessageEnvelope): MessageEnvelope {
    const syncMessage = syncMessageEnvelope.syncMessage;
    const sentMessage = syncMessage.sentMessage;
    const dataMessage = new DataMessage(
      sentMessage.timestamp,
      sentMessage.message,
      sentMessage.expiresInSeconds,
      sentMessage.viewOnce,
      sentMessage.groupInfo,
    );
    return new MessageEnvelope(
      syncMessageEnvelope.source,
      syncMessageEnvelope.sourceNumber,
      syncMessageEnvelope.sourceUuid,
      syncMessageEnvelope.sourceName,
      syncMessageEnvelope.sourceDevice,
      syncMessageEnvelope.timestamp,
      dataMessage,
    );
  }

  static assertType(envelope: Envelope): envelope is MessageEnvelope {
    return (envelope as MessageEnvelope).dataMessage !== undefined;
  }
}

export class DataMessage {
  constructor(
    public timestamp: number,
    public message: string,
    public expiresInSeconds: number,
    public viewOnce: boolean,
    public groupInfo: string,
  ) {}
}

export interface ReceiveV1ResponseElement {
  envelope: Envelope;
  account: string;
}
