import { sleep } from '../util';
import { SendMessageV2Request } from '../models/SendMessageV2';
import { config } from '../config';
import { SYSTEM_MESSAGE_PREFIX } from './StdLib';
import { Context } from './Interpreter';

export const HEARTBEAT_PREFIX = () => `${SYSTEM_MESSAGE_PREFIX}:<3:`;
const heartBeatRegex = () => new RegExp(`\^${HEARTBEAT_PREFIX()}(\\d+)\$`);

export let lastHeartbeat = Date.now();
let leaderHeartsBeatsSinceLastElection = 0;

export function resetElectionRequests(context: Context): void {
  lastHeartbeat = Date.now();
  context.electionRequestSent = false;
  context.electionRequests = [];
}

export function heartbeat(message: string): string | null {
  const matches = message.match(heartBeatRegex());

  if (matches === null) {
    return null;
  }

  const heartBeatTime = matches[1];

  return heartBeatTime;
}

export async function heartbeatLeader(): Promise<void> {
  while (true) {
    await sleep(1000);
    if (!config.isLeader) {
      continue;
    }
    const now = Date.now();
    if (now - lastHeartbeat > config.heartbeatInterval) {
      lastHeartbeat = now;
      const msg = HEARTBEAT_PREFIX() + now;
      const req = new SendMessageV2Request([], msg, config.userNumber, [config.groupId]);
      leaderHeartsBeatsSinceLastElection++;

      if (leaderHeartsBeatsSinceLastElection === config.numberOfHeartbeatsBeforeElection) {
        config.isLeader = false;
      }

      config.api.send(req);
    }
  }
}

export function resetLeaderHeartBeatsSinceElection(): void {
  leaderHeartsBeatsSinceLastElection = 0;
}
