
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.compiler.lexer import Lexer, LexerError
from app.compiler.parser import parse_tokens
from app.compiler.semantic import analyze_semantics
from app.compiler.intermediate import (
    IntermediateCodeGenerator,
    CodeGenerationError,
)
from app.compiler.optimizer import Optimizer


app = FastAPI(title="Compiler Visualizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CompileRequest(BaseModel):
    source_code: str
    language: str = "c"


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/compile")
def compile_code(request: CompileRequest):
    if request.language not in {"c", "cpp", "java"}:
        return {
            "tokens": [],
            "ast": None,
            "semantic": None,
            "tac": [],
            "optimized_tac": [],
            "optimizations": [],
            "errors": [{
                "phase": "request",
                "type": "unsupported_language",
                "message": "Language must be c, cpp, or java.",
                "line": None,
                "column": None,
            }],
        }

    # Phase 1: Lexical analysis
    try:
        tokens = Lexer(request.source_code).tokenize()
    except LexerError as exc:
        return {
            "tokens": [],
            "ast": None,
            "semantic": None,
            "tac": [],
            "optimized_tac": [],
            "optimizations": [],
            "errors": [{
                "phase": "lexer",
                "type": exc.error_type,
                "message": exc.message,
                "line": exc.line,
                "column": exc.column,
            }],
        }

    # Phase 2: Syntax analysis
    parsed = parse_tokens({"tokens": tokens, "errors": []})
    ast = parsed["ast"]

    if parsed["errors"]:
        return {
            "tokens": tokens,
            "ast": None,
            "semantic": None,
            "tac": [],
            "optimized_tac": [],
            "optimizations": [],
            "errors": parsed["errors"],
        }

    # Phase 3: Semantic analysis
    semantic = analyze_semantics(ast)

    if semantic["errors"]:
        return {
            "tokens": tokens,
            "ast": ast,
            "semantic": semantic,
            "tac": [],
            "optimized_tac": [],
            "optimizations": [],
            "errors": semantic["errors"],
        }

    # Phase 4: Intermediate code generation
    try:
        tac = IntermediateCodeGenerator().generate(ast)
    except CodeGenerationError as exc:
        return {
            "tokens": tokens,
            "ast": ast,
            "semantic": semantic,
            "tac": [],
            "optimized_tac": [],
            "optimizations": [],
            "errors": [{
                "phase": "intermediate",
                "type": "code_generation_error",
                "message": str(exc),
                "line": exc.line,
                "column": exc.column,
            }],
        }

    # Phase 5: Optimization
    optimized_tac, optimizations = Optimizer().optimize(tac)

    return {
        "tokens": tokens,
        "ast": ast,
        "semantic": semantic,
        "tac": tac,
        "optimized_tac": optimized_tac,
        "optimizations": optimizations,
        "errors": [],
    }
