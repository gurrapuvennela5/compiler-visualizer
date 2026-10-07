# System Architecture

## High-Level Flow

```text
User
  |
  v
React + Vite Frontend
  |
  v
FastAPI Backend
  |
  v
Compiler Pipeline
  |
  +--> Lexical Analysis
  |
  +--> Syntax Analysis
  |
  +--> Semantic Analysis
  |
  +--> Intermediate Code
  |
  +--> Optimization
  |
  v
Visualization Data
  |
  v
Frontend
```

## Compiler Journey

The UI should make the complete journey visible:

```text
Source
  ↓
Lexer
  ↓
Tokens
  ↓
Parser
  ↓
Parse Tree / AST
  ↓
Semantic Analysis
  ↓
Symbol Table
  ↓
TAC / IR
  ↓
Optimization
  ↓
Final Representation
```

Each phase should expose:
- What is this phase?
- Why is it needed?
- Input
- Output
- Visualization
- Errors, if any

## Language Handling

The user selects C, C++, or Java and enters a simple supported program.

Language-specific processing can happen in the lexer/parser layer. Later phases should use common internal representations wherever practical.
