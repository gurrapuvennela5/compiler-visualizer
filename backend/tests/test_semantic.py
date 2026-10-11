import unittest
from unittest import result
from app.compiler.semantic import analyze_semantics


class TestSemanticAnalyzer(unittest.TestCase):

    def test_valid_declarations(self):
        ast = {
            "type": "Program",
            "statements": [
                {
                    "type": "VariableDeclaration",
                    "var_type": "int",
                    "variable": "a",
                    "initializer": {
                        "type": "IntegerLiteral",
                        "value": 10,
                        "line": 1,
                        "column": 9,
                    },
                    "line": 1,
                    "column": 1,
                },
                {
                    "type": "VariableDeclaration",
                    "var_type": "int",
                    "variable": "b",
                    "initializer": {
                        "type": "IntegerLiteral",
                        "value": 20,
                        "line": 2,
                        "column": 9,
                    },
                    "line": 2,
                    "column": 1,
                },
            ],
        }

        result = analyze_semantics(ast)

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["errors"], [])
        self.assertEqual(len(result["symbol_table"]), 2)
        self.assertEqual(result["symbol_table"][0]["name"], "a")
        self.assertEqual(result["symbol_table"][0]["value"], 10)

    def test_undeclared_variable(self):
        ast = {
            "type": "Program",
            "statements": [
                {
                    "type": "VariableDeclaration",
                    "var_type": "int",
                    "variable": "b",
                    "initializer": {
                        "type": "Identifier",
                        "value": "missing",
                        "line": 1,
                        "column": 9,
                    },
                    "line": 1,
                    "column": 1,
                }
            ],
        }

        result = analyze_semantics(ast)

        self.assertEqual(result["status"], "error")
        self.assertTrue(
            any(
                error["type"] == "undeclared_variable"
                for error in result["errors"]
            )
        )

    def test_duplicate_declaration(self):
        ast = {
            "type": "Program",
            "statements": [
                {
                    "type": "VariableDeclaration",
                    "var_type": "int",
                    "variable": "a",
                    "initializer": {
                        "type": "IntegerLiteral",
                        "value": 1,
                    },
                    "line": 1,
                },
                {
                    "type": "VariableDeclaration",
                    "var_type": "int",
                    "variable": "a",
                    "initializer": {
                        "type": "IntegerLiteral",
                        "value": 2,
                    },
                    "line": 2,
                },
            ],
        }

        result = analyze_semantics(ast)

        self.assertEqual(result["status"], "error")
        self.assertTrue(
            any(
                error["type"] == "duplicate_declaration"
                for error in result["errors"]
            )
        )
        self.assertEqual(len(result["symbol_table"]), 1)

    def test_type_mismatch(self):
        ast = {
            "type": "Program",
            "statements": [
                {
                    "type": "VariableDeclaration",
                    "var_type": "int",
                    "variable": "a",
                    "initializer": {
                        "type": "FloatLiteral",
                        "value": 3.5,
                        "line": 1,
                        "column": 9,
                    },
                    "line": 1,
                    "column": 1,
                }
            ],
        }

        result = analyze_semantics(ast)

        self.assertEqual(result["status"], "error")
        self.assertTrue(
            any(
                error["type"] == "type_mismatch"
                for error in result["errors"]
            )
        )
    
    def test_uninitialized_declaration(self):
        ast = {
            "type": "Program",
            "statements": [
                {
                    "type": "VariableDeclaration",
                    "var_type": "int",
                    "variable": "count",
                    "initializer": None,
                    "line": 1,
                    "column": 1,
                }
            ],
        }

        result = analyze_semantics(ast)

        self.assertEqual(result["status"], "success")
        self.assertEqual(len(result["symbol_table"]), 1)
        self.assertEqual(result["symbol_table"][0]["name"], "count")
        self.assertFalse(result["symbol_table"][0]["initialized"])
        self.assertIsNone(result["symbol_table"][0]["value"])

    def test_semantic_error_preserves_location(self):
        ast = {
            "type": "Program",
            "statements": [
                {
                    "type": "Assignment",
                    "variable": "missing",
                    "value": {
                        "type": "IntegerLiteral",
                        "value": 10,
                        "line": 3,
                        "column": 15,
                    },
                    "line": 3,
                    "column": 5,
                }
            ],
        }

        result = analyze_semantics(ast)

        self.assertEqual(result["status"], "error")
        self.assertEqual(len(result["errors"]), 1)

        error = result["errors"][0]
        self.assertEqual(error["type"], "undeclared_variable")
        self.assertEqual(error["line"], 3)
        self.assertEqual(error["column"], 5)
 
    def test_int_to_float_is_allowed(self):
        ast = {
            "type": "Program",
            "statements": [
                {
                    "type": "VariableDeclaration",
                    "var_type": "float",
                    "variable": "value",
                    "initializer": {
                        "type": "IntegerLiteral",
                        "value": 5,
                    },
                    "line": 1,
                }
            ],
        }

        result = analyze_semantics(ast)

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["symbol_table"][0]["type"], "float")

    def test_invalid_ast_root(self):
        result = analyze_semantics({"type": "NotAProgram"})

        self.assertEqual(result["status"], "error")
        self.assertEqual(result["errors"][0]["type"], "invalid_ast")
          
    def test_arithmetic_expression(self):
        ast = {
            "type": "Program",
            "statements": [
                {
                    "type": "VariableDeclaration",
                    "var_type": "int",
                    "variable": "a",
                    "initializer": {"type": "IntegerLiteral", "value": 10},
                    "line": 1,
                },
                {
                    "type": "VariableDeclaration",
                    "var_type": "int",
                    "variable": "b",
                    "initializer": {"type": "IntegerLiteral", "value": 20},
                    "line": 2,
                },
                {
                    "type": "VariableDeclaration",
                    "var_type": "int",
                    "variable": "c",
                    "initializer": {
                        "type": "BinaryExpression",
                        "operator": "+",
                        "left": {"type": "Identifier", "value": "a"},
                        "right": {"type": "Identifier", "value": "b"},
                    },
                    "line": 3,
                },
            ],
        }

        result = analyze_semantics(ast)

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["errors"], [])
        self.assertEqual(result["symbol_table"][2]["type"], "int")
        self.assertIsNone(result["symbol_table"][2]["value"])

    def test_float_arithmetic_expression(self):
        ast = {
            "type": "Program",
            "statements": [
                {
                    "type": "VariableDeclaration",
                    "var_type": "int",
                    "variable": "a",
                    "initializer": {"type": "IntegerLiteral", "value": 10},
                    "line": 1,
                },
                {
                    "type": "VariableDeclaration",
                    "var_type": "float",
                    "variable": "b",
                    "initializer": {
                        "type": "BinaryExpression",
                        "operator": "+",
                        "left": {"type": "Identifier", "value": "a"},
                        "right": {"type": "FloatLiteral", "value": 2.5},
                    },
                    "line": 2,
                },
            ],
        }

        result = analyze_semantics(ast)

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["errors"], [])
        self.assertEqual(result["symbol_table"][1]["type"], "float")
        self.assertIsNone(result["symbol_table"][1]["value"])

    def test_assignment_updates_symbol(self):
        ast = {
            "type": "Program",
            "statements": [
                {
                    "type": "VariableDeclaration",
                    "var_type": "int",
                    "variable": "a",
                    "initializer": {"type": "IntegerLiteral", "value": 5},
                    "line": 1,
                },
                {
                    "type": "Assignment",
                    "variable": "a",
                    "value": {"type": "IntegerLiteral", "value": 15},
                    "line": 2,
                },
            ],
        }

        result = analyze_semantics(ast)

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["errors"], [])
        self.assertTrue(result["symbol_table"][0]["initialized"])
        self.assertEqual(result["symbol_table"][0]["value"], 15)

    def test_assignment_type_mismatch(self):
        ast = {
            "type": "Program",
            "statements": [
                {
                    "type": "VariableDeclaration",
                    "var_type": "int",
                    "variable": "a",
                    "initializer": {"type": "IntegerLiteral", "value": 5},
                    "line": 1,
                },
                {
                    "type": "Assignment",
                    "variable": "a",
                    "value": {"type": "FloatLiteral", "value": 3.5},
                    "line": 2,
                    "column": 5,
                },
            ],
        }

        result = analyze_semantics(ast)

        self.assertEqual(result["status"], "error")
        self.assertTrue(
            any(
                error["type"] == "type_mismatch"
                for error in result["errors"]
            )
        )
        

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
            return None

        node_type = node.get("type")

        if node_type == "IntegerLiteral":
            return "int"

        if node_type == "FloatLiteral":
            return "float"

        if node_type == "Literal":
            value = node.get("value")
            if isinstance(value, bool):
                return "bool"
            if isinstance(value, int):
                return "int"
            if isinstance(value, float):
                return "float"
            if isinstance(value, str):
                return "char" if len(value) == 1 else "string"
            return None

        if node_type == "Identifier":
            name = node.get("value", node.get("name"))
            symbol = self.symbols.get(name)

            if symbol is None:
                self._error(
                    "undeclared_variable",
                    f"Variable '{name}' is not declared.",
                    node,
                )
                return None

            return symbol["type"]

        if node_type == "BinaryExpression":
            left_type = self._expression_type(node.get("left"))
            right_type = self._expression_type(node.get("right"))
            operator = node.get("operator")

            if left_type is None or right_type is None:
                return None

            if operator in {"+", "-", "*", "/"}:
                if left_type not in {"int", "float"} or right_type not in {
                    "int", "float"
                }:
                    self._error(
                        "type_mismatch",
                        f"Operator '{operator}' requires numeric operands.",
                        node,
                    )
                    return None

                # Numeric expressions produce float if either operand is float.
                return (
                    "float"
                    if "float" in {left_type, right_type}
                    else "int"
                )

            if operator in {"<", ">", "<=", ">=", "==", "!="}:
                if left_type != right_type and not {
                    left_type, right_type
                }.issubset({"int", "float"}):
                    self._error(
                        "type_mismatch",
                        f"Incompatible operand types '{left_type}' and "
                        f"'{right_type}' for '{operator}'.",
                        node,
                    )
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

        if node_type in {"IntegerLiteral", "FloatLiteral", "Literal"}:
            return node.get("value")

        if node_type == "Identifier":
            name = node.get("value", node.get("name"))
            symbol = self.symbols.get(name)
            if symbol and symbol["initialized"]:
                return symbol["value"]
        return None

    def _visit_statement(self, node: Any) -> None:
        if not isinstance(node, dict):
            self._error(
                "invalid_ast",
                "Expected an AST statement object.",
            )
            return

        node_type = node.get("type")

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

                if expression_type is not None and not self._compatible(
                    var_type, expression_type
                ):
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

        if node_type == "Assignment":
            name = node.get("variable")
            symbol = self.symbols.get(name)

            if symbol is None:
                self._error(
                    "undeclared_variable",
                    f"Variable '{name}' is not declared.",
                    node,
                )
                self._expression_type(node.get("value"))
                return

            expression = node.get("value")
            expression_type = self._expression_type(expression)

            if expression_type is not None and not self._compatible(
                symbol["type"], expression_type
            ):
                self._error(
                    "type_mismatch",
                    f"Cannot assign {expression_type} to "
                    f"{symbol['type']} variable '{name}'.",
                    node,
                )
                return

            symbol["initialized"] = expression is not None
            symbol["value"] = (
                self._known_value(expression)
                if expression is not None
                else None
            )
            return

        self._error(
            "unsupported_statement",
            f"Unsupported statement node '{node_type}'.",
            node,
        )

    @staticmethod
    def _compatible(target: str, source: str) -> bool:
        # Initial policy: exact matches and int-to-float are allowed.
        return target == source or (target == "float" and source == "int")

    def analyze(self, ast: dict[str, Any]) -> dict[str, Any]:
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
        
    def test_uninitialized_declaration(self):
        ast = {
            "type": "Program",
            "statements": [
                {
                    "type": "VariableDeclaration",
                    "var_type": "int",
                    "variable": "count",
                    "initializer": None,
                    "line": 1,
                    "column": 1,
                }
            ],
        }

        result = analyze_semantics(ast)

        self.assertEqual(result["status"], "success")
        self.assertEqual(len(result["symbol_table"]), 1)
        self.assertEqual(result["symbol_table"][0]["name"], "count")
        self.assertFalse(result["symbol_table"][0]["initialized"])
        self.assertIsNone(result["symbol_table"][0]["value"])

    def test_semantic_error_preserves_location(self):
        ast = {
            "type": "Program",
            "statements": [
                {
                    "type": "Assignment",
                    "variable": "missing",
                    "value": {
                        "type": "IntegerLiteral",
                        "value": 10,
                        "line": 3,
                        "column": 15,
                    },
                    "line": 3,
                    "column": 5,
                }
            ],
        }

        result = analyze_semantics(ast)

        self.assertEqual(result["status"], "error")
        self.assertEqual(len(result["errors"]), 1)

        error = result["errors"][0]
        self.assertEqual(error["type"], "undeclared_variable")
        self.assertEqual(error["line"], 3)
        self.assertEqual(error["column"], 5)



def analyze_semantics(ast: dict[str, Any]) -> dict[str, Any]:
    """Analyze an AST and return the agreed semantic result structure."""
    return SemanticAnalyzer().analyze(ast)



if __name__ == "__main__":
    unittest.main()
