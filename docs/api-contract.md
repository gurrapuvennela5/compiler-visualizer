# API Contract

The goal of this document is to define stable data formats between modules before implementation.

## 1. Compilation Request

`POST /api/compile`

```json
{
  "language": "c",
  "source_code": "int a = 10;\nint b = 20;\nint c = a + b * 2;"
}
```

Allowed language values:

- `c`
- `cpp`
- `java`

## 2. Token Output

```json
{
  "language": "c",
  "tokens": [
    {
      "lexeme": "int",
      "token_type": "KEYWORD",
      "line": 1,
      "column": 1
    },
    {
      "lexeme": "a",
      "token_type": "IDENTIFIER",
      "line": 1,
      "column": 5
    },
    {
      "lexeme": "=",
      "token_type": "OPERATOR",
      "line": 1,
      "column": 7
    },
    {
      "lexeme": "10",
      "token_type": "NUMBER",
      "line": 1,
      "column": 9
    }
  ]
}
```

## 3. AST Output

Use a common tree representation.

Example:

```json
{
  "type": "Assignment",
  "variable": "c",
  "value": {
    "type": "BinaryExpression",
    "operator": "+",
    "left": {
      "type": "Identifier",
      "name": "a"
    },
    "right": {
      "type": "BinaryExpression",
      "operator": "*",
      "left": {
        "type": "Identifier",
        "name": "b"
      },
      "right": {
        "type": "Literal",
        "value": 2
      }
    }
  }
}
```

## 4. Semantic Output

```json
{
  "status": "success",
  "symbol_table": [
    {
      "name": "a",
      "type": "int",
      "scope": "global",
      "value": 10
    },
    {
      "name": "b",
      "type": "int",
      "scope": "global",
      "value": 20
    }
  ],
  "errors": []
}
```

## 5. Error Format

All modules should use the same basic error structure.

```json
{
  "status": "error",
  "errors": [
    {
      "phase": "semantic",
      "type": "TYPE_MISMATCH",
      "message": "Cannot assign float to int variable 'a'.",
      "line": 3,
      "column": 5
    }
  ]
}
```

## 6. IR / TAC Output

```json
{
  "tac": [
    {
      "instruction": "t1 = b * 2",
      "operator": "*",
      "arg1": "b",
      "arg2": "2",
      "result": "t1"
    },
    {
      "instruction": "t2 = a + t1",
      "operator": "+",
      "arg1": "a",
      "arg2": "t1",
      "result": "t2"
    },
    {
      "instruction": "c = t2",
      "operator": "=",
      "arg1": "t2",
      "arg2": null,
      "result": "c"
    }
  ]
}
```

## 7. Optimization Output

```json
{
  "before": [
    "t1 = 10 * 20",
    "x = t1"
  ],
  "after": [
    "x = 200"
  ],
  "optimizations": [
    {
      "type": "CONSTANT_FOLDING",
      "description": "Evaluated 10 * 20 at compile time."
    }
  ]
}
```

## Important Rule

Internal implementation can differ between modules. Only the agreed input/output contract must remain stable.
