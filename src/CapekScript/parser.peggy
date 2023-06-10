Start
    = _ seq:Sequence _ {return seq}

Sequence
    = '(' Comment* _ sexp:SExpression _ sexps:(Comment* _ sexp_:SExpression _ {return sexp_})* _ Comment*')' {return {type: 'seq', seq: [sexp, ...sexps]}}

SExpression
    = '(' _ sexp:Expression _ ')' {return {type: 'sexp', exp: sexp}}

Expression
    = FunctionDeclarationExpression
    / FunctionCallExpression
    / VariableDeclarationExpression
    / IfElseExpression
    / IfExpression
    / WhileExpression
    / Value
    / Identifier
    / BinaryExpression
    / UnaryExpression
    / AssignmentExpression

VariableDeclarationExpression
    = "var" _ id:Identifier {return {type: 'vardecl', id: id}}

Comment
    = _ ";" [^\n]* _ {return null}

IfElseExpression
    = "ifelse" _ cond:Value _ iftrue:Value _ iffalse:Value {return {type: 'ifelse', cond: cond, iftrue: iftrue, iffalse: iffalse}}

IfExpression
    = "if" _ cond:Value _ iftrue:Value {return {type: 'if', cond: cond, iftrue: iftrue}}

WhileExpression
    = "while" _ cond:Value _ body:Value {return {type: 'while', cond: cond, body: body}}

FunctionDeclarationExpression
    = "fundecl" _ id:Identifier _ '(' _ params:Parameters _ ')' _ body:Value {return {type: 'fundecl', id: id, params: params, body: body}}

FunctionCallExpression
    = "call" _ id:Identifier _ args:Arguments {return {type: 'funcall', id: id, args: args}}

Arguments
    = arg:Value _ args:Arguments {return [arg, ...args]}
    / arg:Value {return [arg]}
    / _ {return []}

Parameters
    = param:Identifier _ params:Parameters {return [param, ...params]}
    / param:Identifier {return [param]}
    / _ {return []}

AssignmentExpression
    = '=' _ id:Identifier _ val:Value {return {type: 'assignexp', id: id, value: val}}

Value
    = Boolean
    / Number
    / String
    / Identifier
    / SExpression
    / Sequence

Boolean
    = 'true' {return true}
    / 'false' {return false}

Number
    = [0-9]+ {return parseInt(text(), 10)}

String
    = '"' [^"]* '"' {return text().slice(1, -1)}

Identifier
    = [a-zA-Z_][a-zA-Z0-9_]* {return {type: 'id', value: text()}}

UnaryExpression
    = op:UNOP _ val:Value  {return {type: 'unexp', op: op, value: val}}

BinaryExpression
    = op: BINOP _ left:Value _ right:Value {return {type: 'binexp', op: op, left: left, right: right}}

UNOP
    = '!'
    / '-'

BINOP
    = '+'
    / '-'
    / '*'
    / '%'
    / '=='
    / '!='
    / '<'
    / 'leq'
    / '>'
    / 'geq'
    / '&&'
    / '||'

_ "whitespace"
  = [ \t\n\r]*