
class ParserError(Exception):
    """Represents a syntax error with its source location."""

    def __init__(self, message, line, column):
        self.message = message
        self.line = line
        self.column = column
        super().__init__(message)


class Parser:
    TYPES = {"int", "float", "double", "char", "bool", "boolean"}

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

    def error(self, message):
        token = self.current()

        if token is not None:
            line = token.get("line", 1)
            column = token.get("column", 1)
        elif self.tokens:
            last = self.tokens[-1]
            line = last.get("line", 1)
            column = last.get("column", 1) + len(last.get("value", ""))
        else:
            line, column = 1, 1

        raise ParserError(message, line, column)

    def expect_value(self, value):
        token = self.current()

        if token is None or token.get("value") != value:
            self.error(f"Expected '{value}'")

        return self.advance()

    def parse(self):
        children = []

        while self.current() is not None:
            children.append(self.parse_statement())

        return {
            "node_type": "Program",
            "children": children
        }

    def parse_statement(self):
        token = self.current()

        if token["type"] == "KEYWORD" and token["value"] in self.TYPES:
            return self.parse_declaration()

        if token["type"] == "IDENTIFIER":
            return self.parse_assignment()

        self.error("Expected a variable declaration or assignment")

    def parse_declaration(self):
        type_token = self.advance()
        name_token = self.current()

        if name_token is None or name_token["type"] != "IDENTIFIER":
            self.error("Expected a variable name")

        self.advance()
        initializer = None

        if self.current() is not None and self.current()["value"] == "=":
            self.advance()
            initializer = self.parse_expression()

        self.expect_value(";")

        return {
            "node_type": "VarDecl",
            "var_type": type_token["value"],
            "name": name_token["value"],
            "init": initializer,
            "line": type_token.get("line", 1),
            "column": type_token.get("column", 1)
        }

    def parse_assignment(self):
        name_token = self.advance()
        self.expect_value("=")
        expression = self.parse_expression()
        self.expect_value(";")

        return {
            "node_type": "Assignment",
            "name": name_token["value"],
            "value": expression,
            "line": name_token.get("line", 1),
            "column": name_token.get("column", 1)
        }

    # Lower-precedence operators are parsed at higher levels.
    # This makes multiplication bind more tightly than addition.

    def parse_expression(self):
        return self.parse_addition()

    def parse_addition(self):
        node = self.parse_multiplication()

        while self.current() is not None and self.current()["value"] in ("+", "-"):
            operator = self.advance()["value"]
            right = self.parse_multiplication()

            node = {
                "node_type": "BinaryOp",
                "op": operator,
                "left": node,
                "right": right
            }

        return node

    def parse_multiplication(self):
        node = self.parse_primary()

        while self.current() is not None and self.current()["value"] in ("*", "/"):
            operator = self.advance()["value"]
            right = self.parse_primary()

            node = {
                "node_type": "BinaryOp",
                "op": operator,
                "left": node,
                "right": right
            }

        return node

    def parse_primary(self):
        token = self.current()

        if token is None:
            self.error("Expected an expression")

        if token["type"] == "IDENTIFIER":
            self.advance()
            return {
                "node_type": "Identifier",
                "name": token["value"],
                "line": token.get("line", 1),
                "column": token.get("column", 1)
            }

        if token["type"] in ("INT_LITERAL", "FLOAT_LITERAL"):
            self.advance()

            if token["type"] == "INT_LITERAL":
                value = int(token["value"])
                raw_type = "int"
            else:
                value = float(token["value"])
                raw_type = "float"

            return {
                "node_type": "Literal",
                "value": value,
                "raw_type": raw_type,
                "line": token.get("line", 1),
                "column": token.get("column", 1)
            }

        if token["value"] == "(":
            self.advance()
            node = self.parse_expression()
            self.expect_value(")")
            return node

        self.error("Expected an identifier, literal, or parenthesized expression")


def parse_tokens(data):
    """Parse P1's JSON output and return the P2 response format."""

    if data.get("errors"):
        return {
            "ast": None,
            "errors": data["errors"]
        }

    parser = Parser(data.get("tokens", []))

    try:
        ast = parser.parse()
        return {"ast": ast, "errors": []}

    except ParserError as exc:
        return {
            "ast": None,
            "errors": [{
                "phase": "syntax",
                "message": exc.message,
                "line": exc.line,
                "column": exc.column
            }]
        }
