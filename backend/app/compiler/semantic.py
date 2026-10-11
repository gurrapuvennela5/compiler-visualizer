from typing import Any
SUPPORTED_TYPES = {"int", "float", "char"}


class SemanticAnalyzer:
    def __init__(self):
        self.symbol_table: list[dict[str, Any]] = []
        self.symbols: dict[str, dict[str, Any]] = {}
        self.errors: list[dict[str, Any]] = []

    def _error(
        self,
        error_type: str,
        message: str,
        node: dict[str, Any] | None = None,
    ) -> None:
        node = node or {}

        self.errors.append({
            "phase": "semantic",
            "type": error_type,
            "message": message,
            "line": node.get("line"),
            "column": node.get("column"),
        })

    def _add_symbol(
        self,
        name: str,
        var_type: str,
        node: dict[str, Any],
        initialized: bool,
        value: Any = None,
    ) -> None:
        if name in self.symbols:
            self._error(
                "duplicate_declaration",
                f"Variable '{name}' is already declared.",
                node,
            )
            return

        symbol = {
            "name": name,
            "type": var_type,
            "scope": "global",
            "line_declared": node.get("line"),
            "initialized": initialized,
            "value": value,
        }

        self.symbols[name] = symbol
        self.symbol_table.append(symbol)

    def _expression_type(self, node: Any) -> str | None:
        if not isinstance(node, dict):
            self._error(
                "invalid_expression",
                "Expected an expression object.",
            )
            return None

        node_type = node.get("type")

        # Integer literal
        if node_type == "IntegerLiteral":
            return "int"

        # Floating-point literal
        if node_type == "FloatLiteral":
            return "float"

        # Generic literal
        if node_type == "Literal":
            value = node.get("value")

            # bool must be checked before int because bool is a subclass of int.
            if isinstance(value, bool):
                return "bool"

            if isinstance(value, int):
                return "int"

            if isinstance(value, float):
                return "float"

            if isinstance(value, str):
                return "char" if len(value) == 1 else "string"

            return None

        # Identifier
        if node_type == "Identifier":
            name = node.get("value", node.get("name"))

            if not isinstance(name, str) or not name:
                self._error(
                    "invalid_identifier",
                    "Identifier expression has no valid name.",
                    node,
                )
                return None

            symbol = self.symbols.get(name)

            if symbol is None:
                self._error(
                    "undeclared_variable",
                    f"Variable '{name}' is not declared.",
                    node,
                )
                return None

            return symbol["type"]

        # Binary expression
        if node_type == "BinaryExpression":
            operator = node.get("operator")

            left_type = self._expression_type(node.get("left"))
            right_type = self._expression_type(node.get("right"))

            if left_type is None or right_type is None:
                return None

            # Arithmetic operators
            if operator in {"+", "-", "*", "/"}:
                numeric_types = {"int", "float"}

                if (
                    left_type not in numeric_types
                    or right_type not in numeric_types
                ):
                    self._error(
                        "type_mismatch",
                        f"Operator '{operator}' requires numeric operands.",
                        node,
                    )
                    return None

                # The result is float if either operand is float.
                if "float" in {left_type, right_type}:
                    return "float"

                return "int"

            # Relational and equality operators
            if operator in {"<", ">", "<=", ">=", "==", "!="}:
                numeric_types = {"int", "float"}

                if (
                    left_type != right_type
                    and not {left_type, right_type}.issubset(numeric_types)
                ):
                    self._error(
                        "type_mismatch",
                        f"Incompatible operand types '{left_type}' and "
                        f"'{right_type}' for '{operator}'.",
                        node,
                    )
                    return None

                return "bool"

            self._error(
                "unsupported_operator",
                f"Operator '{operator}' is not supported.",
                node,
            )
            return None

        self._error(
            "unsupported_expression",
            f"Unsupported expression node '{node_type}'.",
            node,
        )
        return None

    def _known_value(self, node: Any) -> Any:
        if not isinstance(node, dict):
            return None

        node_type = node.get("type")

        # Direct literal values
        if node_type in {"IntegerLiteral", "FloatLiteral", "Literal"}:
            return node.get("value")

        # Value of an already initialized identifier
        if node_type == "Identifier":
            name = node.get("value", node.get("name"))
            symbol = self.symbols.get(name)

            if symbol and symbol["initialized"]:
                return symbol["value"]

        # Binary expressions are type-checked but not evaluated here.
        return None

    def _visit_statement(self, node: Any) -> None:
        if not isinstance(node, dict):
            self._error(
                "invalid_ast",
                "Expected an AST statement object.",
            )
            return

        node_type = node.get("type")

        # Variable declaration
        if node_type == "VariableDeclaration":
            name = node.get("variable")
            var_type = node.get("var_type")
            initializer = node.get("initializer")

            if not isinstance(name, str) or not name:
                self._error(
                    "invalid_declaration",
                    "Variable declaration has no valid name.",
                    node,
                )
                return

            if var_type not in SUPPORTED_TYPES:
                self._error(
                    "unsupported_type",
                    f"Type '{var_type}' is not supported.",
                    node,
                )
                return

            if name in self.symbols:
                self._error(
                    "duplicate_declaration",
                    f"Variable '{name}' is already declared.",
                    node,
                )
                return

            initialized = initializer is not None
            value = None

            if initialized:
                expression_type = self._expression_type(initializer)

                # An invalid expression must not initialize the variable.
                if expression_type is None:
                    initialized = False

                # Check whether the initializer type is compatible.
                elif not self._compatible(var_type, expression_type):
                    self._error(
                        "type_mismatch",
                        f"Cannot initialize {var_type} variable '{name}' "
                        f"with a {expression_type} expression.",
                        node,
                    )
                    initialized = False

                else:
                    value = self._known_value(initializer)

            self._add_symbol(
                name,
                var_type,
                node,
                initialized=initialized,
                value=value,
            )
            return

        # Assignment
        if node_type == "Assignment":
            name = node.get("variable")
            symbol = self.symbols.get(name)

            if symbol is None:
                self._error(
                    "undeclared_variable",
                    f"Variable '{name}' is not declared.",
                    node,
                )

                # Also inspect the right-hand expression for errors.
                self._expression_type(node.get("value"))
                return

            expression = node.get("value")
            expression_type = self._expression_type(expression)

            # Do not modify the symbol if the expression is invalid.
            if expression_type is None:
                return

            if not self._compatible(symbol["type"], expression_type):
                self._error(
                    "type_mismatch",
                    f"Cannot assign {expression_type} to "
                    f"{symbol['type']} variable '{name}'.",
                    node,
                )
                return

            # Update only after all checks pass.
            symbol["initialized"] = True
            symbol["value"] = self._known_value(expression)
            return

        # Unsupported statement
        self._error(
            "unsupported_statement",
            f"Unsupported statement node '{node_type}'.",
            node,
        )

    @staticmethod
    def _compatible(target: str, source: str) -> bool:
        # Exact type matches are allowed.
        # Implicit int-to-float conversion is allowed.
        return (
            target == source
            or (target == "float" and source == "int")
        )

    def analyze(self, ast: dict[str, Any]) -> dict[str, Any]:
        # Reset state so the analyzer can safely be reused.
        self.symbol_table = []
        self.symbols = {}
        self.errors = []

        if not isinstance(ast, dict) or ast.get("type") != "Program":
            self._error(
                "invalid_ast",
                "Expected a Program node as the AST root.",
            )

        else:
            statements = ast.get("statements", [])

            if not isinstance(statements, list):
                self._error(
                    "invalid_ast",
                    "Program statements must be a list.",
                    ast,
                )

            else:
                for statement in statements:
                    self._visit_statement(statement)

        return {
            "status": "error" if self.errors else "success",
            "symbol_table": self.symbol_table,
            "errors": self.errors,
        }


def analyze_semantics(ast: dict[str, Any]) -> dict[str, Any]:
    """Analyze an AST and return the semantic result."""
    return SemanticAnalyzer().analyze(ast)
