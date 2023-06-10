/*
    This is a simple expression evaluation bot. It is written raw in typescript instead of the language our bots will generally be written  in.
    This bot exists mainly for testing and a performance baseline, simulating a conversation without overhead of future layers.
*/

import { config } from '../config';
import { MessageEnvelope } from '../models/ReceiveV1';
import { SendMessageV2Request } from '../models/SendMessageV2';
import { sleep } from '../util';

const whatIs_bot_re = /!whatis (.+)/;

export async function runWhatIsBot() {
  await receiveLoop();
}

async function sendAnswerMessage(query: string, answer: string) {
  const message = 'Answer to ' + query + ': ' + answer;
  const req = new SendMessageV2Request([], message, config.userNumber, [config.groupId]);
  await config.api.send(req);
}

// TODO:- This version of receive loop assumes all messages are from the correct group that we are sending to
async function receiveLoop() {
  while (true) {
    const res = await config.api.receive(config.userNumber);

    for (const elem of res) {
      if (!MessageEnvelope.assertType(elem.envelope)) {
        continue;
      }

      const me = elem.envelope as MessageEnvelope;

      const matches = me.dataMessage.message.match(whatIs_bot_re);
      if (matches == null) {
        continue;
      }

      const query = matches[1];

      const answer = eval(query);

      sendAnswerMessage(query, answer);
    }
    await sleep(0); //every 5 seconds
  }
}
