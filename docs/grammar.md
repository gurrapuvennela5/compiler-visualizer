
# P2 — Syntax Analysis Grammar

## 1. Overview

The parser receives tokens from P1 and validates their grammatical structure.
If the input is valid, it constructs an Abstract Syntax Tree (AST).
If the input is invalid, it returns a structured syntax error with its source location.

## 2. Supported statements

### Variable declaration

```text
TYPE IDENTIFIER ;
TYPE IDENTIFIER = EXPRESSION ;
```

Examples:

```c
int a;
int b = 10;
float price = 12.5;
```

### Assignment

```text
IDENTIFIER = EXPRESSION ;
```

Example:

```c
a = b + 2;
```

## 3. Expression grammar

```text
expression      → addition
addition        → multiplication (("+" | "-") multiplication)*
multiplication  → primary (("*" | "/" | "%") primary)*
primary         → IDENTIFIER
                | INTEGER_LITERAL
                | FLOAT_LITERAL
                | "(" expression ")"
```

## 4. Operator precedence

Operators are evaluated structurally according to this precedence:

1. Parenthesized expressions
2. Multiplication, division, and remainder
3. Addition and subtraction

For example:

```c
int result = a + b * 2;
```

The AST represents the expression as:

```text
        +
       / \
      a   *
         / \
        b   2
```

## 5. AST node types

| Node type | Purpose |
|---|---|
| Program | Root node containing statements |
| VariableDeclaration | Declares a variable and optional initializer |
| Assignment | Assigns an expression to a variable |
| BinaryExpression | Represents a binary arithmetic operation |
| Identifier | Represents a variable reference |
| IntegerLiteral | Represents an integer value |
| FloatLiteral | Represents a floating-point value |

AST nodes include source locations where applicable.

## 6. Error handling

Parser errors use this structure:

```json
{
  "phase": "parser",
  "type": "missing_semicolon",
  "message": "Expected ';'",
  "line": 1,
  "column": 10
}
```

The parser returns `ast: null` when parsing fails.

## 7. Current limitations

The current implementation does not yet support:

- Function declarations and calls
- Control-flow statements such as if, else, and while
- Comparison and logical expressions
- Unary operators
- Full C, C++, or Java grammar

These features can be added incrementally with corresponding tests.
