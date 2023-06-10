import * as peggy from 'peggy';
import * as fs from 'fs';
import { Context, Program } from './Interpreter';

export const OUTPUT_JOURNAL_PATH = '/output_journal.json';
export const FETCH_JOURNAL_PATH = '/fetch_journal.json';

export class Sequence implements Expression {
  public readonly type: ExpressionType.Sequence = ExpressionType.Sequence;
  public seq: Array<SExp> = [];
}

export interface Expression {
  readonly type: ExpressionType;
}
// README:- TypeScript yelled at me when I just called it Function - Saying it will then accept "Any function-like input"
export class CapekFunction implements FunctionContext {
  public readonly type = FunctionType.Capek;
  constructor(public params: Array<Identifier>, public body: SExp) {}
}

export interface IfExpression extends Expression {
  type: ExpressionType.IfExp;
  cond: Value;
  iftrue: Value;
}

export interface IfElseExpression extends Expression {
  type: ExpressionType.IfElseExp;
  cond: Value;
  iftrue: Value;
  iffalse: Value;
}

export interface WhileExpression extends Expression {
  type: ExpressionType.WhileExp;
  cond: Value;
  body: Value;
}

export class LibFuncArgs {
  constructor(public args: Array<Value>, public context: Context) {}
}

export class LibFunction implements FunctionContext {
  public readonly type = FunctionType.Lib;
  constructor(public argCount: number, public funName: string) {}
}

export interface FunctionContext {
  readonly type: FunctionType;
}

export enum FunctionType {
  Capek = 'CapekFunction',
  Lib = 'LibFunction',
}

export interface VarDeclExpression extends Expression {
  type: ExpressionType.VarDecl;
  id: Identifier;
}

export interface AssignmentExpression extends Expression {
  type: ExpressionType.Assignment;
  id: Identifier;
  value: Value;
}

export interface Identifier extends Expression {
  type: ExpressionType.Identifier;
  value: string;
}

export interface FunctionCall extends Expression {
  type: ExpressionType.FunCallExp;
  id: Identifier;
  args: Array<Value>;
}

// I made FunctionContext a Value type - It does not get emitted from the parser, but is a value that can come from evaluating lookup
export type Value = number | string | boolean | Expression | Identifier | FunctionContext | Sequence | Array<Value> | void;

export enum BinaryOperator {
  Add = '+',
  Sub = '-',
  Mul = '*',
  Div = '/',
  Eq = '==',
  Neq = '!=',
  Lt = '<',
  Leq = 'leq',
  Gt = '>',
  Geq = 'geq',
  And = '&&',
  Or = '||',
  Mod = '%',
}

export enum UnaryOperator {
  Sub = '-',
  Negation = '!',
}

export interface BinaryExpression extends Expression {
  type: ExpressionType.BinaryExp;
  op: BinaryOperator;
  left: Value;
  right: Value;
}

export interface UnaryExpression extends Expression {
  type: ExpressionType.UnaryExp;
  op: UnaryOperator;
  value: Value;
}

export interface SExp extends Expression {
  readonly type: ExpressionType.SExpression;
  exp: Expression;
}

export interface FunctionDeclaration {
  type: ExpressionType.FunDecl;
  id: Identifier;
  params: Array<Identifier>;
  body: SExp;
}

export enum ExpressionType {
  FunDecl = 'fundecl',
  FunCallExp = 'funcall',
  IfElseExp = 'ifelse',
  IfExp = 'if',
  WhileExp = 'while',
  Identifier = 'id',
  BinaryExp = 'binexp',
  UnaryExp = 'unexp',
  Assignment = 'assignexp',
  SExpression = 'sexp',
  Sequence = 'seq',
  VarDecl = 'vardecl',
}

export function getParser(): peggy.Parser {
  // Read file node
  const file = fs.readFileSync('./src/CapekScript/parser.peggy', 'utf8');
  return peggy.generate(file);
}

export function createProgramFromSources(path: string): Program {
  const parser = getParser();
  const programBuilder = Program.builder();
  const context = new Context();
  const clientContext = new Context(false);

  context.clientContext = clientContext;

  try {
    console.log('Extracting Init');
    const init = fs.readFileSync(path + '/init.capek', 'utf8');
    programBuilder.init(parser.parse(init));
  } catch (e) {
    console.log('No Init');
  }
  try {
    console.log('Extracting Message');
    const message = fs.readFileSync(path + '/message.capek', 'utf8');
    programBuilder.message(parser.parse(message));
  } catch (e) {
    console.log('No Message');
  }
  try {
    console.log('Extracting Time Update');
    const timeEvent = fs.readFileSync(path + '/time.capek', 'utf8');
    programBuilder.timeEvent(parser.parse(timeEvent));
  } catch (e) {
    console.log('No Time Update');
  }
  try {
    console.log('Extracting Client');
    const client = fs.readFileSync(path + '/client.capek', 'utf8');
    const clientSequence = parser.parse(client);
    context.clientSequence = clientSequence;
  } catch (e) {
    console.log('No Client');
  }
  try {
    console.log('Extracting Client Init');
    const clientInit = fs.readFileSync(path + '/clientInit.capek', 'utf8');
    const clientInitSequence = parser.parse(clientInit);
    programBuilder.clientInit(clientInitSequence);
  } catch (e) {
    console.log('No Client Init');
  }

  programBuilder.context(context);
  return programBuilder.build();
}
