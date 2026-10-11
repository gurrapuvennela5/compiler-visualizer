import re


class LexerError(Exception):
    """A lexical error with its source location."""

    def __init__(self, error_type, message, line, column):
        self.error_type = error_type
        self.message = message
        self.line = line
        self.column = column
        super().__init__(message)


class Lexer:
    KEYWORDS = {
        "int", "float", "double", "char", "bool", "boolean",
        "short", "long", "String", "void",
        "if", "else", "while", "for", "return",
        "true", "false", "class", "public", "static",
        "new", "break", "continue"
    }

    TOKEN_PATTERNS = [
        ("WHITESPACE", r"[ \t\r]+"),
        ("NEWLINE", r"\n"),
        ("COMMENT", r"//[^\n]*|/\*[\s\S]*?\*/"),
        ("FLOAT_LITERAL", r"(?:\d+\.\d*|\.\d+)(?:[eE][+-]?\d+)?"),
        ("INTEGER_LITERAL", r"\d+"),
        ("IDENTIFIER", r"[A-Za-z_][A-Za-z0-9_]*"),
        ("COMPARISON_OPERATOR", r"==|!=|<=|>="),
        ("ASSIGNMENT_OPERATOR", r"="),
        ("RELATIONAL_OPERATOR", r"[<>]"),
        ("ARITHMETIC_OPERATOR", r"[+\-*/%]"),
        ("LOGICAL_OPERATOR", r"&&|\|\||!"),
        ("INCREMENT_OPERATOR", r"\+\+|--"),
        ("LEFT_PAREN", r"\("),
        ("RIGHT_PAREN", r"\)"),
        ("LEFT_BRACE", r"\{"),
        ("RIGHT_BRACE", r"\}"),
        ("LEFT_BRACKET", r"\["),
        ("RIGHT_BRACKET", r"\]"),
        ("SEMICOLON", r";"),
        ("COMMA", r","),
        ("DOT", r"\."),
    ]

    def __init__(self, source_code):
        self.source_code = source_code
        self.tokens = []
        self.line = 1
        self.column = 1

    def tokenize(self):
        patterns = [
            (name, re.compile(pattern))
            for name, pattern in self.TOKEN_PATTERNS
        ]

        position = 0
        source_length = len(self.source_code)

        while position < source_length:
            matched = False

            for token_type, pattern in patterns:
                match = pattern.match(self.source_code, position)

                if not match:
                    continue

                lexeme = match.group(0)
                start_line = self.line
                start_column = self.column

                if token_type not in {"WHITESPACE", "NEWLINE", "COMMENT"}:
                    if token_type == "IDENTIFIER" and lexeme in self.KEYWORDS:
                        token_type = "KEYWORD"

                    self.tokens.append({
                        "lexeme": lexeme,
                        "token_type": token_type,
                        "line": start_line,
                        "column": start_column,
                    })

                newline_count = lexeme.count("\n")
                if newline_count:
                    self.line += newline_count
                    self.column = len(lexeme.rsplit("\n", 1)[-1]) + 1
                else:
                    self.column += len(lexeme)

                position = match.end()
                matched = True
                break

            if not matched:
                character = self.source_code[position]
                raise LexerError(
                    "invalid_character",
                    f"Invalid character: {character!r}",
                    self.line,
                    self.column,
                )

        return self.tokens
