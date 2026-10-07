# Quiz Format

Each compiler phase should have at least 4–5 questions.

Recommended phases:

- Lexical Analysis
- Syntax Analysis
- Semantic Analysis
- Intermediate Code
- Optimization

Example:

```json
{
  "phase": "lexical",
  "questions": [
    {
      "id": "lex-01",
      "question": "What token type is represented by the keyword int?",
      "options": [
        "KEYWORD",
        "IDENTIFIER",
        "OPERATOR",
        "CONSTANT"
      ],
      "answer": "KEYWORD",
      "explanation": "int is a reserved keyword."
    }
  ]
}
```

The frontend should use the same question structure for every phase.
