# Compiler Visualizer

An interactive educational platform that visualizes how selected C, C++, and Java programs move through the major phases of compilation.

## Core Journey

Source Code
→ Lexical Analysis
→ Syntax Analysis
→ Semantic Analysis
→ Intermediate Code
→ Code Optimization
→ Final Representation

## Key Features

- C / C++ / Java language selection
- Interactive Compiler Journey
- Lexical token visualization
- FIRST / FOLLOW and predictive parsing visualization
- Parse Tree / AST visualization
- Semantic analysis and Symbol Table
- Three Address Code (TAC) and Quadruples
- Code optimization with before/after comparison
- Phase descriptions: What, Input, Output, Why
- Step-by-step compilation
- Source-to-phase tracing
- "Why did the compiler do this?" explanations
- Error visualization
- Quiz / Challenge Mode with 4–5 questions per phase

## Tech Stack

### Frontend
- React
- Vite

### Backend
- Python
- FastAPI

## Project Structure

```text
compiler-visualizer/
├── frontend/
├── backend/
├── docs/
├── samples/
├── .gitignore
└── README.md
```

## Team Modules

| Person | Main Responsibility |
|---|---|
| P1 | Lexical Analysis |
| P2 | Syntax Analysis + AST |
| P3 | Semantic Analysis + Symbol Table |
| P4 | Intermediate Representation + Optimization |

All members contribute to UI, integration, testing, documentation, and review.

## Git Workflow

Do not push directly to `main`.

1. Pull the latest `main`.
2. Create/use your feature branch.
3. Make small commits.
4. Push your branch.
5. Open a Pull Request to `main`.
6. Get a teammate review.
7. Merge after approval.

Initial branches:

- `feature/lexical-analysis`
- `feature/syntax-ast`
- `feature/semantic-symbol-table`
- `feature/ir-optimization`

## Scope

This project supports a defined subset of C, C++, and Java suitable for educational compiler visualization. It is not intended to implement the complete C, C++, or Java language specifications.
