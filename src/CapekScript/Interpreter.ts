import { config } from '../config';
import { assert } from 'console';
import { KVStore, sleep } from '../util';
import { heartbeatLeader, heartbeat as heartbeat, HEARTBEAT_PREFIX } from './heartbeat';
import { FetchJournal, OutputJournal } from './models/journal';
import { Tombstone } from './models/tombstone';
import {
  BinaryExpression,
  UnaryExpression,
  ExpressionType,
  Sequence,
  SExp,
  Value,
  BinaryOperator,
  UnaryOperator,
  AssignmentExpression,
  Identifier,
  FunctionCall,
  CapekFunction,
  FunctionDeclaration,
  FunctionContext,
  FunctionType,
  LibFunction,
  IfExpression,
  WhileExpression,
  IfElseExpression,
  LibFuncArgs,
  VarDeclExpression,
} from './Parser';
import { getMessage, InitialLibFunctions, messageQueue, StdLibFunctions } from './StdLib';
import { ELECTION_REQUEST_PREFIX, electionHandler } from './election';
import { MessageQueueFile } from './models/messageQueueFile';
import { crashMe } from './crashMe';
import { appendCounterFile, appendTimeTo100File } from '../benchmark/benchmark';
import { exit } from 'process';

export type Stack = Array<KVStore<string, Value>>;

const TOMBSTONE_PATH = () => {
  return config.path + '/tombstone.json';
};

export class Context {
  public stack: Stack = [];
  public fetchCounter = 0;
  public outputCounter = 0;
  public electionRequestSent = false;
  public electionRequests = [] as string[];
  public clientSequence: Sequence | null = null;
  public clientContext: Context | null = null;

  constructor(includeNonClientFunctions = true) {
    this.stack.push(new KVStore(KVStore.entries(InitialLibFunctions(includeNonClientFunctions))));
  }
}

function evalFunctionDeclaration(funDecl: FunctionDeclaration, context: Context) {
  const name = funDecl.id.value;
  const fun = new CapekFunction(funDecl.params, funDecl.body);
  KVStore.set(context.stack[context.stack.length - 1], name, fun);
  crashMe();
}

async function evalBinExp(binexp: BinaryExpression, context: Context): Promise<Value> {
  const left = (await evalValue(binexp.left, context)) as any;
  const right = (await evalValue(binexp.right, context)) as any;
  switch (binexp.op) {
    case BinaryOperator.Add: {
      return left + right;
    }
    case BinaryOperator.Sub: {
      return left - right;
    }
    case BinaryOperator.Mul: {
      return left * right;
    }
    case BinaryOperator.Div: {
      return left / right;
    }
    case BinaryOperator.Eq: {
      return left == right;
    }
    case BinaryOperator.Neq: {
      return left != right;
    }
    case BinaryOperator.Lt: {
      return left < right;
    }
    case BinaryOperator.Leq: {
      return left <= right;
    }
    case BinaryOperator.Gt: {
      return left > right;
    }
    case BinaryOperator.Geq: {
      return left >= right;
    }
    case BinaryOperator.And: {
      return left && right;
    }
    case BinaryOperator.Or: {
      return left || right;
    }
    case BinaryOperator.Mod: {
      return left % right;
    }
  }
}

async function evalUnExp(unexp: UnaryExpression, context: Context): Promise<Value> {
  const val = await evalValue(unexp.value, context);
  switch (unexp.op) {
    case UnaryOperator.Sub: {
      return -val;
    }
    case UnaryOperator.Negation: {
      return !val;
    }
  }
}

function evalVarDecl(declexp: VarDeclExpression, context: Context): void {
  const name = declexp.id.value;
  KVStore.set(context.stack[context.stack.length - 1], name, undefined);
}

// Exported for use in StdLib to allow library functions putting things into the context
export async function evalAssignment(assignexp: AssignmentExpression, context: Context): Promise<void> {
  const name = assignexp.id.value;
  for (let i = context.stack.length - 1; i >= 0; i--) {
    const table = context.stack[i];
    if (KVStore.has(table, name)) {
      const val = await evalValue(assignexp.value, context);
      KVStore.set(table, name, val);
      crashMe();
      return;
    }
  }
  throw new Error(`Identifier ${name} not found`);
}

function evalLookup(id: Identifier, context: Context): Value {
  const name = id.value;
  // TODO!:- HACK FOR BENCHMARKING
  if (id.value === 'noOfBots') {
    return config.noOfBots;
  }
  for (let i = context.stack.length - 1; i >= 0; i--) {
    const table = context.stack[i];
    if (KVStore.has(table, name)) {
      return KVStore.get(table, name) as Value;
    }
  }
  throw new Error(`Identifier ${name} not found`);
}

async function evalValue(val: Value, context: Context): Promise<Value> {
  crashMe();
  switch (typeof val) {
    case 'number':
    case 'string':
    case 'boolean': {
      return val;
    }
  }
  if (val instanceof Array) {
    return val;
  }

  switch (val?.type) {
    case ExpressionType.Identifier: {
      return evalLookup(val as Identifier, context);
    }
    case ExpressionType.BinaryExp: {
      const binexp = val as BinaryExpression;
      return evalBinExp(binexp, context);
    }
    case ExpressionType.UnaryExp: {
      const unexp = val as UnaryExpression;
      return evalUnExp(unexp, context);
    }
    case ExpressionType.Assignment: {
      const assignexp = val as AssignmentExpression;
      return evalAssignment(assignexp, context);
    }
    case ExpressionType.FunCallExp: {
      const funCall = val as FunctionCall;
      return await evalFunctionCall(funCall, context);
    }
    case ExpressionType.FunDecl: {
      const funDecl = val as FunctionDeclaration;
      return evalFunctionDeclaration(funDecl, context);
    }
    case ExpressionType.IfExp: {
      const ifexp = val as IfExpression;
      return await evalIfExp(ifexp, context);
    }
    case ExpressionType.IfElseExp: {
      const ifelseexp = val as IfElseExpression;
      return await evalIfElseExp(ifelseexp, context);
    }
    case ExpressionType.WhileExp: {
      const whileexp = val as WhileExpression;
      return await evalWhileExp(whileexp, context);
    }
    case ExpressionType.SExpression: {
      const sexp_ = val as SExp;
      return await evalSExp(sexp_, context);
    }
    case ExpressionType.Sequence: {
      const seq = val as Sequence;
      return await evalSequence(seq, context);
    }
    case ExpressionType.VarDecl: {
      const declexp = val as VarDeclExpression;
      return evalVarDecl(declexp, context);
    }
    default: {
      throw new Error(`Invalid SExpression: ${JSON.stringify(val, null, 2)}`);
    }
  }
}

export function enterScope(context: Context): void {
  crashMe();
  context.stack.push(new KVStore());
}

export function leaveScope(context: Context): void {
  context.stack.pop();
}

async function evalFunctionCall(funCall: FunctionCall, context: Context): Promise<Value> {
  const name = funCall.id.value;
  const args = await Promise.all(funCall.args.map((arg) => evalValue(arg, context)));
  const fun = evalLookup(funCall.id, context) as FunctionContext;

  switch (fun?.type) {
    case FunctionType.Lib: {
      const libfun = fun as LibFunction;
      if (libfun.argCount !== args.length) {
        throw new Error(`Function ${name} expects ${libfun.argCount} arguments, but got ${args.length}`);
      }

      const libArgs = new LibFuncArgs(args, context);
      const funName = KVStore.get(StdLibFunctions, libfun.funName);
      if (funName === undefined) {
        throw new Error(`Function ${name} not found`);
      }

      return await funName(libArgs);
    }
    case FunctionType.Capek: {
      const capekfun = fun as CapekFunction;

      if (args.length !== capekfun.params.length) {
        throw new Error(`Function ${name} expects ${capekfun.params.length} arguments, but got ${args.length}`);
      }
      enterScope(context);
      for (const param of capekfun.params) {
        KVStore.set(context.stack[context.stack.length - 1], param.value, args.shift());
      }
      const res = await evalValue(capekfun.body, context);
      leaveScope(context);
      return res;
    }
    default: {
      throw new Error(`Identifier ${name} is not a function`);
    }
  }
}

async function evalIfExp(ifexp: IfExpression, context: Context): Promise<Value> {
  const cond = await evalValue(ifexp.cond, context);
  if (!cond) {
    return;
  }
  enterScope(context);
  const res = await evalValue(ifexp.iftrue, context);
  leaveScope(context);
  return res;
}
async function evalIfElseExp(ifelseexp: IfElseExpression, context: Context): Promise<Value> {
  const cond = await evalValue(ifelseexp.cond, context);
  let res;
  enterScope(context);
  if (!cond) {
    res = await evalValue(ifelseexp.iffalse, context);
  } else {
    res = await evalValue(ifelseexp.iftrue, context);
  }
  leaveScope(context);
  return res;
}
async function evalWhileExp(whileexp: WhileExpression, context: Context): Promise<void> {
  while (await evalValue(whileexp.cond, context)) {
    enterScope(context);
    await evalValue(whileexp.body, context);
    leaveScope(context);
  }
}

async function evalSExp(sexp: SExp, context: Context): Promise<Value> {
  crashMe();
  return await evalValue(sexp.exp, context);
}

export class Program {
  public init: Sequence = new Sequence();
  public message: Sequence = new Sequence();
  public timeEvent: Sequence = new Sequence();
  public context: Context = new Context();
  public clientInit: Sequence = new Sequence();

  static builder = () => {
    return new ProgramBuilder();
  };
}

export class ProgramBuilder {
  program: Program = new Program();

  public init(seq: Sequence): ProgramBuilder {
    this.program.init = seq;
    return this;
  }

  public clientInit(seq: Sequence): ProgramBuilder {
    this.program.clientInit = seq;
    return this;
  }

  public message(seq: Sequence): ProgramBuilder {
    this.program.message = seq;
    return this;
  }

  public timeEvent(seq: Sequence): ProgramBuilder {
    this.program.timeEvent = seq;
    return this;
  }

  public context(context: Context): ProgramBuilder {
    this.program.context = context;
    return this;
  }

  public build(): Program {
    return this.program;
  }
}

async function mainHandler(program: Program) {
  const envelope = await getMessage(program.context);
  if (envelope === undefined) {
    return;
  }

  const msg = envelope.dataMessage.message;
  const account = envelope.sourceNumber;

  (() => {
    if (!config.benchmark) {
      return;
    }

    const msgArr = msg.split(' ');

    if (msgArr[0] !== 'Counter:') {
      return;
    }

    const counter = parseInt(msgArr[1]);

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

  enterScope(program.context);
  const topStack = program.context.stack[program.context.stack.length - 1];
  if (msg.startsWith(HEARTBEAT_PREFIX())) {
    const time = heartbeat(msg);
    KVStore.set(topStack, 'time', time);
    await evalSequence(program.timeEvent, program.context);
    leaveScope(program.context);
    return;
  }

  KVStore.set(topStack, 'msg', msg);
  KVStore.set(topStack, 'account', account);
  await evalSequence(program.message, program.context);
  leaveScope(program.context);
}

export async function evalProgram(program: Program): Promise<Value> {
  assert(messageQueue.length === 0);

  try {
    console.log(`Extracting message queue file`);
    const messageQueueFile = MessageQueueFile.load();
    messageQueue.push(...messageQueueFile);
  } catch (e) {
    console.log(`Message queue file not loaded`);
  }

  try {
    console.log(`Extracting tombstone file`);
    const tombstone = Tombstone.load(TOMBSTONE_PATH());
    program.context = tombstone.context;
  } catch (e) {
    console.log(`Failed to extract tombstone file, running init instead...`);
    await evalSequence(program.init, program.context);

    const clientContext = program.context.clientContext;
    if (clientContext === null) {
      throw new Error('Client context is null');
    }
    KVStore.set(clientContext.stack[0], 'account', config.userNumber);
    await evalSequence(program.clientInit, clientContext);
  }

  messageQueue.filter((envelope) => !envelope.dataMessage.message.startsWith(ELECTION_REQUEST_PREFIX()));

  heartbeatLeader();

  if (!config.noElect) {
    electionHandler(program.context);
  }

  while (true) {
    crashMe();
    await mainHandler(program);

    // ! Highway to the DANGER ZONE!
    messageQueue.shift();

    if (!config.noPersist) {
      MessageQueueFile.save(messageQueue);
      OutputJournal.instance().reset();
      FetchJournal.instance().reset();
      const tombstone = new Tombstone(program.context, messageQueue);
      Tombstone.save(tombstone, TOMBSTONE_PATH());
    }

    await sleep(100);
  }
}

export async function evalSequence(seq: Sequence, context: Context): Promise<Value> {
  let result;
  for (const sexp of seq.seq) {
    result = await evalSExp(sexp, context);
  }

  return result;
}
