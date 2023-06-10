import { DataMessage, MessageEnvelope } from '../models/ReceiveV1';
import { KVStore, sleep } from '../util';
import { SendMessageV2Request } from '.././models/SendMessageV2';
import { ExpressionType, LibFuncArgs, Identifier, Value, AssignmentExpression, LibFunction } from './Parser';
import { Context, enterScope, evalAssignment, evalSequence, leaveScope } from './Interpreter';
import { FetchResult, fetchResultFromSignal } from './fetchUtil';
import { config } from '../config';
import { FetchJournal, OutputJournal } from './models/journal';
import { HEARTBEAT_PREFIX, resetElectionRequests } from './heartbeat';
import { ELECTION_REQUEST_PREFIX, handleElectionRequest } from './election';
import { MessageQueueFile } from './models/messageQueueFile';
import { crashMe } from './crashMe';

// The built in set of functions, variables and utilities usable from CapekScript.

export const SYSTEM_MESSAGE_PREFIX = 'SystemMessage:';
export const SYSTEM_FETCH_MESSAGE_PREFIX = () => `${SYSTEM_MESSAGE_PREFIX}FetchResult:`;

export const messageQueue = [] as Array<MessageEnvelope>;

async function output(args: LibFuncArgs): Promise<void> {
  const outputJournal = OutputJournal.instance();
  const outputCounter = args.context.outputCounter++;
  const journalLength = outputJournal.length();

  if (outputCounter < journalLength) {
    return;
  }

  const message = args.args[0];
  if (typeof message !== 'string') {
    throw new Error('output() expects a string as its argument.');
  }
  crashMe();
  const req = new SendMessageV2Request([], message, config.userNumber, [config.groupId]);
  await config.api.send(req);
  console.log(message);

  outputJournal.increment();
  crashMe();
}

let syncMessageLock = false;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function syncMessageQueue(context: Context): Promise<void> {
  async function sync() {
    const res = await config.api.receive(config.userNumber);
    const newEnvelopes = res
      .filter((elem) => MessageEnvelope.assertType(elem.envelope))
      .map((elem) => elem.envelope as MessageEnvelope);

    const newMessages = newEnvelopes.map((envelope) => {
      return envelope.dataMessage;
    });

    if (!config.noPersist) {
      const newMessageQueue = [...messageQueue, ...newEnvelopes];
      MessageQueueFile.save(newMessageQueue);
    }

    crashMe();

    await processNewMessages(newMessages, context);
    messageQueue.push(...newEnvelopes);
  }

  while (syncMessageLock) {
    await sleep(100);
  }

  syncMessageLock = true;
  crashMe();
  await sync();
  syncMessageLock = false;
}

async function processNewMessages(newMessages: DataMessage[], context: Context) {
  const messages = newMessages.filter((dm) => dm !== undefined).map((dm) => dm.message);

  const newHeartbeatReceived =
    messages.filter((msg) => {
      return msg.startsWith(HEARTBEAT_PREFIX());
    }).length > 0;

  if (newHeartbeatReceived) {
    resetElectionRequests(context);
    crashMe();
    return;
  }

  messages
    .filter((msg) => {
      return msg.startsWith(ELECTION_REQUEST_PREFIX());
    })
    .forEach((msg) => handleElectionRequest(msg, context));
}

export async function getMessage(context: Context): Promise<MessageEnvelope | undefined> {
  if (messageQueue.length === 0) {
    await syncMessageQueue(context);
  }
  crashMe();

  const message = messageQueue[0];

  return message;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getTime(args: LibFuncArgs): Promise<number> {
  return Date.now();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getDay(args: LibFuncArgs): Promise<number> {
  return new Date().getDay();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getMonth(args: LibFuncArgs): Promise<number> {
  return new Date().getMonth();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function getYear(args: LibFuncArgs): Promise<number> {
  return new Date().getFullYear();
}

async function getCharAtIndex(args: LibFuncArgs): Promise<string> {
  const index = args.args[0];
  if (typeof index !== 'number') {
    throw new Error('getCharAtIndex() expects a number as its argument.');
  }
  index as number;
  const input = args.args[1];
  if (typeof input !== 'string') {
    throw new Error('getCharAtIndex() expects a string as its argument.');
  }
  input as string;
  return input.charAt(index);
}

// Always gets the first instance of an occurance from a string and returns it
async function getFirstComponentFromString(args: LibFuncArgs): Promise<string> {
  const input = args.args[0];
  if (typeof input !== 'string') {
    throw new Error('getComponentFromString() expects a string as its argument.');
  }
  input as string;
  const component = args.args[1];
  if (typeof component !== 'string') {
    throw new Error('getComponentFromString() expects a string as its argument.');
  }
  component as string;
  const regexp = new RegExp(component);
  const res: string = input.match(regexp)?.at(0) ?? '';
  return res;
}

async function atoi(args: LibFuncArgs): Promise<number> {
  const input = args.args[0];
  if (typeof input !== 'string') {
    throw new Error('atoi() expects a string as its argument.');
  }
  return parseInt(input, 10);
}

// Splits a string into anything before a RegEx and anything after it
async function splitStr(args: LibFuncArgs): Promise<string> {
  const input = args.args[0];
  if (typeof input !== 'string') {
    throw new Error('splitStr() expects a string as its argument.');
  }
  const component = args.args[1];
  if (typeof component !== 'string') {
    throw new Error('splitStr() expects a string as its argument.');
  }
  const regexp = new RegExp(component + '(.*)');
  let splitArray = input.split(regexp);
  const result = splitArray[0];
  // Flatten the remainder of the array after index 0
  splitArray = splitArray.slice(1);
  const rest = splitArray.join('');
  // Construct Identifier with name as arg[2]
  const name = args.args[2];
  if (typeof name !== 'string') {
    throw new Error('splitStr() expects a string as its argument.');
  }
  const Identifier: Identifier = { type: ExpressionType.Identifier, value: name as string };
  // Make an assignment expression
  const assignexp: AssignmentExpression = { type: ExpressionType.Assignment, id: Identifier, value: rest };
  crashMe();

  await evalAssignment(assignexp, args.context);

  crashMe();

  return result;
}

async function splitWhiteSpace(args: LibFuncArgs): Promise<string[]> {
  const str = args.args[0] as Value;
  if (typeof str !== 'string') {
    throw new Error('splitWhiteSpace() expects a string as its argument.');
  }

  return str.split(' ');
}

async function fetchData(args: LibFuncArgs): Promise<Value> {
  const url = args.args[0];
  if (typeof url !== 'string') {
    throw new Error('fetchData() expects a string as its argument.');
  }
  let text: string | null = null;

  const fetchCounter = args.context.fetchCounter++;

  while (text === null) {
    if (!config.isLeader) {
      crashMe();
      text = await fetchResultFromSignal(fetchCounter, messageQueue);
      crashMe();
      if (text === null) {
        await syncMessageQueue(args.context);
      }
      continue;
    }

    const fetchJournal = FetchJournal.instance();
    if (fetchCounter < fetchJournal.length()) {
      crashMe();
      return fetchJournal.getEntry(fetchCounter);
    }
    const res = await fetch(url);
    text = await res.text();

    const fetchRes = new FetchResult(text, fetchCounter);
    const fetchResJson = JSON.stringify(fetchRes);
    const message = `${SYSTEM_FETCH_MESSAGE_PREFIX()}${fetchResJson}`;

    const req = new SendMessageV2Request([], message, config.userNumber, [config.groupId]);
    crashMe();
    await config.api.send(req);
    fetchJournal.addEntry(text);
    crashMe();
  }

  return text;
}

async function capekSleep(args: LibFuncArgs): Promise<void> {
  await sleep(args.args[0] as number);
}

async function print(args: LibFuncArgs): Promise<void> {
  console.log(args.args[0]);
}

async function getIndexOfSubstring(args: LibFuncArgs): Promise<number> {
  const input = args.args[0];
  if (typeof input !== 'string') {
    throw new Error('getIndexOfSubstring() expects a string as its argument.');
  }
  input as string;
  const component = args.args[1];
  if (typeof component !== 'string') {
    throw new Error('getIndexOfSubstring() expects a string as its argument.');
  }
  component as string;
  const result = input.indexOf(component);
  return result;
}

async function numberToStr(args: LibFuncArgs): Promise<string> {
  const input = args.args[0];
  if (typeof input !== 'number') {
    throw new Error('numberToStr() expects a number as its argument.');
  }
  input as number;
  return input.toString();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function newSet(args: LibFuncArgs): Promise<Value> {
  return [];
}

async function setAdd(args: LibFuncArgs): Promise<void> {
  const set = args.args[0] as Array<Value>;
  const val = args.args[1] as Value;

  if (set.includes(val)) {
    return;
  }

  set.push(val);
}

async function setRemove(args: LibFuncArgs): Promise<void> {
  const set = args.args[0] as Array<Value>;
  const val = args.args[1] as Value;

  const index = set.indexOf(val);
  if (index === -1) {
    return;
  }

  set.splice(index, 1);
}

async function setHas(args: LibFuncArgs): Promise<boolean> {
  const set = args.args[0] as Array<Value>;
  const val = args.args[1] as Value;

  return set.includes(val);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function newArray(args: LibFuncArgs): Promise<Value> {
  return [];
}

async function getNth(args: LibFuncArgs): Promise<Value> {
  const arr = args.args[0] as Array<Value>;
  const index = args.args[1] as number;

  return arr[index];
}

async function getLength(args: LibFuncArgs): Promise<number> {
  const arr = args.args[0] as Array<Value>;
  return arr.length;
}

async function isUndefined(args: LibFuncArgs): Promise<boolean> {
  const input = args.args[0];
  return input === undefined;
}

async function pop(args: LibFuncArgs): Promise<Value> {
  const arr = args.args[0] as Array<Value>;
  return arr.pop();
}

async function push(args: LibFuncArgs): Promise<void> {
  const arr = args.args[0] as Array<Value>;
  const val = args.args[1];
  arr.push(val);
}

async function setNth(args: LibFuncArgs): Promise<void> {
  const arr = args.args[0] as Array<Value>;
  const index = args.args[1] as number;
  const val = args.args[2];
  arr[index] = val;
}

async function rmNth(args: LibFuncArgs): Promise<void> {
  const arr = args.args[0] as Array<Value>;
  const index = args.args[1] as number;
  arr.splice(index, 1);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function newObj(args: LibFuncArgs): Promise<any> {
  return {};
}

async function posixTimeToDDMM(args: LibFuncArgs): Promise<string> {
  const timeParam = args.args[0];
  if (typeof timeParam !== 'number' && typeof timeParam !== 'string') {
    throw new Error('PosixTimeToDDMM() expects a number or string as its argument.');
  }

  let time: number = timeParam as number;

  if (typeof timeParam === 'string') {
    time = parseInt(timeParam, 10);
  }

  const date = new Date(time);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}/${month}`;
}

async function objGetKey(args: LibFuncArgs): Promise<any> {
  const obj = args.args[0] as any;
  const key = args.args[1];

  if (typeof key !== 'string') {
    throw new Error('objGetKey expects a string as its second argument.');
  }

  return obj[key];
}

async function objSetKey(args: LibFuncArgs): Promise<void> {
  const obj = args.args[0] as any;
  const key = args.args[1];
  const val = args.args[2];

  if (typeof key !== 'string') {
    throw new Error('objSetKey expects a string as its second argument.');
  }

  obj[key] = val;
}

async function objDelKey(args: LibFuncArgs): Promise<void> {
  const obj = args.args[0] as any;
  const key = args.args[1];

  if (typeof key !== 'string') {
    throw new Error('objDelKey expects a string as its second argument.');
  }

  delete obj[key];
}

async function strToObj(args: LibFuncArgs): Promise<any> {
  const str = args.args[0];
  if (typeof str !== 'string') {
    throw new Error('strToObj expects a string as its argument.');
  }

  return JSON.parse(str);
}

async function objToStr(args: LibFuncArgs): Promise<string> {
  const obj = args.args[0];
  if (typeof obj !== 'object') {
    throw new Error('objToStr expects an object as its argument.');
  }

  return JSON.stringify(obj);
}

async function client(args: LibFuncArgs): Promise<void> {
  const clientSequence = args.context.clientSequence;
  if (clientSequence === null) {
    throw new Error('clientSequence not present in context');
  }

  const arg = args.args[0];
  const argClone = JSON.parse(JSON.stringify(arg)) as Value;

  const context = args.context.clientContext;

  if (context === null) {
    throw new Error('clientContext not present in context');
  }

  enterScope(context);
  const topStack = context.stack[context.stack.length - 1];
  KVStore.set(topStack, 'arg', argClone);
  crashMe();
  await evalSequence(clientSequence, context);
  crashMe();
  leaveScope(context);
}

export function InitialLibFunctions(isGlobal = true): KVStore<string, LibFunction> {
  return new KVStore([...common().entries, ...(isGlobal ? globalFunctions().entries : clientFunctions().entries)]);
}

function common(): KVStore<string, LibFunction> {
  return new KVStore([
    { key: 'print', value: new LibFunction(1, 'print') },
    { key: 'capekSleep', value: new LibFunction(1, 'capekSleep') },
    { key: 'split', value: new LibFunction(3, 'split') },
    { key: 'atoi', value: new LibFunction(1, 'atoi') },
    { key: 'getFirstComponentFromString', value: new LibFunction(2, 'getFirstComponentFromString') },
    { key: 'getYear', value: new LibFunction(0, 'getYear') },
    { key: 'getMonth', value: new LibFunction(0, 'getMonth') },
    { key: 'getDay', value: new LibFunction(0, 'getDay') },
    { key: 'getUnixTime', value: new LibFunction(0, 'getTime') },
    { key: 'getCharAtIndex', value: new LibFunction(2, 'getCharAtIndex') },
    { key: 'getIndexOfSubstringStart', value: new LibFunction(2, 'getIndexOfSubstringStart') },
    { key: 'numToStr', value: new LibFunction(1, 'numToStr') },
    { key: 'newArray', value: new LibFunction(0, 'newArray') },
    { key: 'getNth', value: new LibFunction(2, 'getNth') },
    { key: 'isUndefined', value: new LibFunction(1, 'isUndefined') },
    { key: 'pop', value: new LibFunction(1, 'pop') },
    { key: 'push', value: new LibFunction(2, 'push') },
    { key: 'setNth', value: new LibFunction(3, 'setNth') },
    { key: 'rmNth', value: new LibFunction(2, 'rmNth') },
    { key: 'objGetKey', value: new LibFunction(2, 'objGetKey') },
    { key: 'strToObj', value: new LibFunction(1, 'strToObj') },
    { key: 'newSet', value: new LibFunction(0, 'newSet') },
    { key: 'setAdd', value: new LibFunction(2, 'setAdd') },
    { key: 'setHas', value: new LibFunction(2, 'setHas') },
    { key: 'setRemove', value: new LibFunction(2, 'setRemove') },
    { key: 'newObj', value: new LibFunction(0, 'newObj') },
    { key: 'objSetKey', value: new LibFunction(3, 'objSetKey') },
    { key: 'objDelKey', value: new LibFunction(2, 'objDelKey') },
    { key: 'objToStr', value: new LibFunction(1, 'objToStr') },
    { key: 'posixTimeToDDMM', value: new LibFunction(1, 'posixTimeToDDMM') },
    { key: 'splitWhiteSpace', value: new LibFunction(1, 'splitWhiteSpace') },
    { key: 'getLength', value: new LibFunction(1, 'getLength') },
  ]);
}

function clientFunctions(): KVStore<string, LibFunction> {
  return new KVStore([{ key: 'out', value: new LibFunction(1, 'out') }]);
}

function globalFunctions(): KVStore<string, LibFunction> {
  return new KVStore([
    { key: 'client', value: new LibFunction(1, 'client') },
    { key: 'fetch', value: new LibFunction(1, 'fetchData') },
  ]);
}

export const StdLibFunctions: KVStore<string, (args: LibFuncArgs) => Promise<Value>> = new KVStore([
  { key: 'out', value: output },
  { key: 'print', value: print },
  { key: 'capekSleep', value: capekSleep },
  { key: 'fetchData', value: fetchData },
  { key: 'split', value: splitStr },
  { key: 'atoi', value: atoi },
  { key: 'getFirstComponentFromString', value: getFirstComponentFromString },
  { key: 'getYear', value: getYear },
  { key: 'getMonth', value: getMonth },
  { key: 'getDay', value: getDay },
  { key: 'getUnixTime', value: getTime },
  { key: 'getCharAtIndex', value: getCharAtIndex },
  { key: 'getIndexOfSubstringStart', value: getIndexOfSubstring },
  { key: 'numToStr', value: numberToStr },
  { key: 'newArray', value: newArray },
  { key: 'getNth', value: getNth },
  { key: 'isUndefined', value: isUndefined },
  { key: 'pop', value: pop },
  { key: 'push', value: push },
  { key: 'setNth', value: setNth },
  { key: 'rmNth', value: rmNth },
  { key: 'objGetKey', value: objGetKey },
  { key: 'strToObj', value: strToObj },
  { key: 'newSet', value: newSet },
  { key: 'setAdd', value: setAdd },
  { key: 'setHas', value: setHas },
  { key: 'setRemove', value: setRemove },
  { key: 'newObj', value: newObj },
  { key: 'objSetKey', value: objSetKey },
  { key: 'objDelKey', value: objDelKey },
  { key: 'objToStr', value: objToStr },
  { key: 'posixTimeToDDMM', value: posixTimeToDDMM },
  { key: 'splitWhiteSpace', value: splitWhiteSpace },
  { key: 'getLength', value: getLength },
  { key: 'client', value: client },
]);
