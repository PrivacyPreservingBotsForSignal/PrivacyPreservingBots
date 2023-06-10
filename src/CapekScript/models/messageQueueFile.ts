import { config } from '../../config';
import { MessageEnvelope } from '../../models/ReceiveV1';
import * as fs from 'fs';

const MESSAGE_QUEUE_PATH = () => config.path + '/messageQueue.json';

export class MessageQueueFile {
  static save(messageQueue: MessageEnvelope[]): void {
    const data = JSON.stringify(messageQueue, null, 2);

    fs.writeFileSync(MESSAGE_QUEUE_PATH(), data);
  }

  static load(): MessageEnvelope[] {
    const messageQueueJson = fs.readFileSync(MESSAGE_QUEUE_PATH(), 'utf8');
    const messageQueue = JSON.parse(messageQueueJson) as MessageEnvelope[];

    return messageQueue;
  }
}
