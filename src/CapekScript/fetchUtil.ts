import { MessageEnvelope } from '../models/ReceiveV1';
import { SYSTEM_FETCH_MESSAGE_PREFIX } from './StdLib';

export class FetchResult {
  constructor(public res: string, public id: number) {}
}

export async function fetchResultFromSignal(id: number, messageQueue: Array<MessageEnvelope>): Promise<string | null> {
  const findFirstFetchResult = (messageQueue: Array<MessageEnvelope>): FetchResult | undefined => {
    return messageQueue
      .filter((envelope) => envelope.dataMessage.message.startsWith(SYSTEM_FETCH_MESSAGE_PREFIX()))
      .map((envelope) => {
        const fetchResJson = envelope.dataMessage.message.substring(SYSTEM_FETCH_MESSAGE_PREFIX().length);
        const fetchRes = JSON.parse(fetchResJson) as FetchResult;
        return fetchRes;
      })
      .find((fetchRes) => fetchRes?.id === id);
  };

  const fetchRes = findFirstFetchResult(messageQueue);
  if (fetchRes === undefined) {
    return null;
  }

  const firstFetchResult = findFirstFetchResult(messageQueue) as FetchResult; // Safe to cast because we already checked for null

  return firstFetchResult.res;
}
