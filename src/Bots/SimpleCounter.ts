/*
    This is a simple counter bot. It is written raw in typescript instead of the language our bots will generally be written  in.
    This bot exists mainly for testing and a performance baseline, simulating a conversation without overhead of future layers.
*/

import { appendCounterFile, appendTimeTo100File } from '../benchmark/benchmark';
import { config } from '../config';
import { MessageEnvelope } from '../models/ReceiveV1';
import { SendMessageV2Request } from '../models/SendMessageV2';
import { sleep } from '../util';
import { exit } from 'process';

const counter_bot_re = /Counter Bot: (\d+)/;

export async function runCounterBot() {
  // Just have bot 0 start
  if (config.signalBotId === '0') {
    await sendCounterBotMessage(1);
  }
  await receiveLoop();
}

async function sendCounterBotMessage(counter: number) {
  const message = 'Counter Bot: ' + counter.toString();
  const req = new SendMessageV2Request([], message, config.userNumber, [config.groupId]);
  await config.api.send(req);
}

// MARK:- This version of receive loop assumes all messages are from the correct group that we are sending to
async function receiveLoop() {
  while (true) {
    const res = await config.api.receive(config.userNumber);

    for (const elem of res) {
      if (!MessageEnvelope.assertType(elem.envelope)) {
        continue;
      }

      const me = elem.envelope as MessageEnvelope;

      const matches = me.dataMessage.message.match(counter_bot_re);
      if (matches == null) {
        continue;
      }

      const counter = parseInt(matches[1]);
      const bot_id = parseInt(config.signalBotId);
      console.log(
        'NO OF BOT = ' +
          config.noOfBots +
          ' (counter + 1) % config.noOfBots = ' +
          ((counter + 1) % config.noOfBots) +
          ' bot_id = ' +
          bot_id +
          ' isCurrentBot = ' +
          ((counter + 1) % config.noOfBots === bot_id),
      );
      const isCurrentBot = counter % config.noOfBots === bot_id;

      (() => {
        if (!config.benchmark) {
          return;
        }

        if (config.signalBotId !== config.benchmarkBot) {
          if (counter !== 100) {
            return;
          }
          exit(0);
        }

        appendCounterFile(counter);

        if (counter !== 100) {
          return;
        }

        appendTimeTo100File();
        exit(0);
      })();

      if (isCurrentBot) {
        sendCounterBotMessage(counter + 1);
      }
    }
    await sleep(0); //every 5 seconds
  }
}
