import { SendMessageV2Request } from '../models/SendMessageV2';
import { config } from '../config';
import { Context } from './Interpreter';
import { SYSTEM_MESSAGE_PREFIX } from './StdLib';
import { lastHeartbeat, resetElectionRequests, resetLeaderHeartBeatsSinceElection } from './heartbeat';
import { amountOnline } from './online';
import { nop } from '../util';
import { crashMe } from './crashMe';

export const ELECTION_REQUEST_PREFIX = () => `${SYSTEM_MESSAGE_PREFIX}ElectionRequest:`;

export async function electionHandler(context: Context): Promise<void> {
  while (true) {
    await nop();
    // Time between current time and last heartbeat
    const timeSinceLastHeartbeat = Date.now() - lastHeartbeat;
    if (timeSinceLastHeartbeat < config.electionInterval) {
      continue;
    }

    await sendElectionRequest(context);
  }
}

export async function sendElectionRequest(context: Context): Promise<void> {
  if (context.electionRequestSent) {
    return;
  }
  context.electionRequestSent = true;
  console.log('Election request sent');

  // Send election request to all nodes

  const message = `${ELECTION_REQUEST_PREFIX()}${config.userNumber}`;
  const req = new SendMessageV2Request([], message, config.userNumber, [config.groupId]);
  await config.api.send(req);
}

export function handleElectionRequest(message: string, context: Context): void {
  console.log(`election being handled: ${message}`);

  const userNumber = message.substring(ELECTION_REQUEST_PREFIX().length);

  if (!context.electionRequests.includes(userNumber)) {
    context.electionRequests.push(userNumber);
  }

  const numberOfElectionRequests = context.electionRequests.length;
  const threshold = Math.ceil(amountOnline() * (2 / 3));

  if (numberOfElectionRequests >= threshold) {
    election(context);
  }
}

function election(context: Context): void {
  config.isLeader = false;
  const lastRequester = context.electionRequests.pop();
  resetElectionRequests(context);

  console.log(`Electing new leader: ${lastRequester}`);
  if (lastRequester !== config.userNumber) {
    return;
  }

  config.isLeader = true;
  crashMe();
  resetLeaderHeartBeatsSinceElection();
}
