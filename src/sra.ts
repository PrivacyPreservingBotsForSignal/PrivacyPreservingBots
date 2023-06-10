import { MessageEnvelope, ReceiveV1Response, ReceiveV1ResponseElement, SyncMessageEnvelope } from './models/ReceiveV1';
import { SendMessageV2Request, SendMessageV2Response } from './models/SendMessageV2';
import * as endpoints from './endpoints';

// Signal Rest API (SRA)
export default class SRA {
  constructor(public backendUrlSend: string, public backendUrlReceive: string) {}

  public async send(request: SendMessageV2Request): Promise<SendMessageV2Response> {
    const res = await fetch(this.backendUrlSend + endpoints.send, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    const res_json = (await res.json()) as SendMessageV2Response;
    return res_json;
  }

  public async receive(number: string): Promise<ReceiveV1Response> {
    const res = await fetch(this.backendUrlReceive + endpoints.receive + '/' + number);
    const res_json: Array<ReceiveV1ResponseElement> = await res.json();

    const res_filtered = res_json.map((elem: ReceiveV1ResponseElement) => {
      const envelope = elem.envelope;

      if (SyncMessageEnvelope.assertType(envelope)) {
        elem.envelope = MessageEnvelope.fromSyncMessageEnvelope(envelope);
      }

      return elem;
    });
    return res_filtered;
  }
}
