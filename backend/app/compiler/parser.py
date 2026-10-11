
class ParserError(Exception):
    """A syntax error with its source location and machine-readable type."""

    def __init__(self, error_type, message, line=None, column=None):
        self.error_type = error_type
        self.message = message
        self.line = line
        self.column = column
        super().__init__(message)


class Parser:
    TYPES = {
        "int", "float", "double", "char", "bool", "boolean",
        "short", "long", "String"
    }

    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0

    def current(self):
        if self.pos < len(self.tokens):
            return self.tokens[self.pos]
        return None

    def advance(self):
        token = self.current()
        if token is not None:
            self.pos += 1
        return token

    @staticmethod
    def lexeme(token):
        return token.get("lexeme", "")

    @staticmethod
    def token_type(token):
        return token.get("token_type", "")

    def error(self, error_type, message):
        token = self.current()

        if token is not None:
            line = token.get("line")
            column = token.get("column")
        elif self.tokens:
            last = self.tokens[-1]
            line = last.get("line")
            last_column = last.get("column")
            last_lexeme = self.lexeme(last)
            column = (
                last_column + len(last_lexeme)
                if last_column is not None else None
            )
        else:
            line, column = 1, 1

        raise ParserError(error_type, message, line, column)

    def expect_value(self, value, error_type="unexpected_token"):
        token = self.current()

        if token is None or self.lexeme(token) != value:
            self.error(error_type, f"Expected '{value}'")

        return self.advance()

    def parse(self):
        statements = []

        while self.current() is not None:
            statements.append(self.parse_statement())

        return {
            "type": "Program",
            "statements": statements
        }

    def parse_statement(self):
        token = self.current()

        if self.token_type(token) == "KEYWORD":
            if self.lexeme(token) in self.TYPES:
                return self.parse_declaration()

        if self.token_type(token) == "IDENTIFIER":
            return self.parse_assignment()

        self.error(
            "unexpected_token",
            "Expected a variable declaration or assignment"
        )

    def parse_declaration(self):
        type_token = self.advance()
        name_token = self.current()

        if (
            name_token is None
            or self.token_type(name_token) != "IDENTIFIER"
        ):
            self.error("expected_identifier", "Expected a variable name")

        self.advance()
        initializer = None

        if (
            self.current() is not None
            and self.lexeme(self.current()) == "="
        ):
            self.advance()
            initializer = self.parse_expression()

        self.expect_value(";", "missing_semicolon")

        return {
            "type": "VariableDeclaration",
            "var_type": self.lexeme(type_token),
            "variable": self.lexeme(name_token),
            **({"initializer": initializer} if initializer is not None else {}),
            "line": type_token.get("line"),
            "column": type_token.get("column")
        }

    def parse_assignment(self):
        name_token = self.advance()
        self.expect_value("=")
        value = self.parse_expression()
        self.expect_value(";", "missing_semicolon")

        return {
            "type": "Assignment",
            "variable": self.lexeme(name_token),
            "value": value,
            "line": name_token.get("line"),
            "column": name_token.get("column")
        }

    def parse_expression(self):
        return self.parse_addition()

    def parse_addition(self):
        node = self.parse_multiplication()

        while (
            self.current() is not None
            and self.lexeme(self.current()) in ("+", "-")
        ):
            operator_token = self.advance()
            right = self.parse_multiplication()

            node = {
                "type": "BinaryExpression",
                "operator": self.lexeme(operator_token),
                "left": node,
                "right": right,
                "line": operator_token.get("line"),
                "column": operator_token.get("column")
            }

        return node

    def parse_multiplication(self):
        node = self.parse_primary()

        while (
            self.current() is not None
            and self.lexeme(self.current()) in ("*", "/", "%")
        ):
            operator_token = self.advance()
            right = self.parse_primary()

            node = {
                "type": "BinaryExpression",
                "operator": self.lexeme(operator_token),
                "left": node,
                "right": right,
                "line": operator_token.get("line"),
                "column": operator_token.get("column")
            }

        return node

    def parse_primary(self):
        token = self.current()

        if token is None:
            self.error("expected_expression", "Expected an expression")

        kind = self.token_type(token)
        value = self.lexeme(token)

        if kind == "IDENTIFIER":
            self.advance()
            return {
                "type": "Identifier",
                "value": value,
                "line": token.get("line"),
                "column": token.get("column")
            }

        if kind == "INTEGER_LITERAL":
            self.advance()
            try:
                number = int(value)
            except ValueError:
                self.error("invalid_literal", f"Invalid integer literal '{value}'")

            return {
                "type": "IntegerLiteral",
                "value": number,
                "line": token.get("line"),
                "column": token.get("column")
            }

        if kind == "FLOAT_LITERAL":
            self.advance()
            try:
                number = float(value)
            except ValueError:
                self.error("invalid_literal", f"Invalid float literal '{value}'")

            return {
                "type": "FloatLiteral",
                "value": number,
                "line": token.get("line"),
                "column": token.get("column")
            }

        if value == "(":
            self.advance()
            node = self.parse_expression()
            self.expect_value(")")
            return node

        self.error(
            "expected_expression",
            "Expected an identifier, literal, or parenthesized expression"
        )


def parse_tokens(data):
    """Convert P1's token response into the agreed P2 AST response."""

    if data.get("errors"):
        return {"ast": None, "errors": data["errors"]}

    try:
        ast = Parser(data.get("tokens", [])).parse()
        return {"ast": ast, "errors": []}
    except ParserError as exc:
        return {
            "ast": None,
            "errors": [{
                "phase": "parser",
                "type": exc.error_type,
                "message": exc.message,
                "line": exc.line,
                "column": exc.column
            }]
        }

