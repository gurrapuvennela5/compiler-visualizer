
class CodeGenerationError(Exception):
    def __init__(self, message, line=None, column=None):
        super().__init__(message)
        self.line = line
        self.column = column


class IntermediateCodeGenerator:
    def __init__(self):
        self.tac = []
        self.temp_count = 0

    def new_temp(self):
        self.temp_count += 1
        return f"t{self.temp_count}"

    def emit(self, operator, arg1=None, arg2=None, result=None):
        if operator == "=":
            instruction = f"{result} = {arg1}"
        elif operator in {"u+", "u-", "!"}:
            symbol = {"u+": "+", "u-": "-", "!": "!"}[operator]
            instruction = f"{result} = {symbol}{arg1}"
        else:
            instruction = f"{result} = {arg1} {operator} {arg2}"

        self.tac.append({
            "instruction": instruction,
            "operator": operator,
            "arg1": arg1,
            "arg2": arg2,
            "result": result
        })

    def generate(self, ast):
        self.tac = []
        self.temp_count = 0

        if not isinstance(ast, dict):
            raise CodeGenerationError("AST must be a dictionary.")

        self.visit(ast)
        return self.tac

    def get_kind(self, node):
        return str(
            node.get("type")
            or node.get("kind")
            or node.get("node_type")
            or ""
        ).lower().replace("_", "").replace(" ", "")

    def get_children(self, node):
        for key in ("children", "statements", "body"):
            value = node.get(key)
            if isinstance(value, list):
                return value
        return []

    def get_operator(self, node):
        return (
            node.get("operator")
            or node.get("op")
            or node.get("value")
        )

    def visit(self, node):
        if node is None:
            return None

        if isinstance(node, list):
            for item in node:
                self.visit(item)
            return None

        if not isinstance(node, dict):
            return node

        kind = self.get_kind(node)

        # Program, block, and statement containers
        if kind in {
            "program", "translationunit", "compoundstatement",
            "block", "statementlist", "function"
        }:
            for child in self.get_children(node):
                self.visit(child)

            # Some ASTs store a single statement in body.
            body = node.get("body")
            if isinstance(body, dict):
                self.visit(body)
            return None

        if kind in {"number", "integerliteral", "floatliteral",
                    "literal", "constant"}:
            return str(node.get("value"))

        if kind in {"identifier", "id", "variable", "variableexpression"}:
            return str(node.get("name", node.get("value", "")))

        # Declaration: int x = 10
        if kind in {"declaration", "vardecl", "variabledeclaration"}:
            name = node.get("name", node.get("variable"))
            initializer = (
                node.get("initializer")
                or node.get("init")
                or node.get("value_node")
            )

            # Support common declarator wrappers.
            if name is None and isinstance(node.get("declarator"), dict):
                declarator = node["declarator"]
                name = declarator.get("name", declarator.get("value"))
                initializer = (
                    initializer
                    or declarator.get("initializer")
                    or declarator.get("init")
                )

            if name is not None and initializer is not None:
                value = self.visit(initializer)
                self.emit("=", value, result=str(name))

            # Support declarations represented by a children list.
            if name is None:
                for child in self.get_children(node):
                    self.visit(child)
            return None

        # Assignment: x = expression
        if kind in {"assignment", "assignmentexpression", "assign"}:
            left = node.get("left", node.get("target"))
            right = node.get("right", node.get("value_node"))
            operator = self.get_operator(node) or "="

            if isinstance(left, dict):
                name = left.get("name", left.get("value"))
            else:
                name = left

            if name is None or right is None:
                raise CodeGenerationError(
                    "Invalid assignment node.",
                    node.get("line"),
                    node.get("column")
                )

            value = self.visit(right)

            if operator == "=":
                self.emit("=", value, result=str(name))
            else:
                binary_operator = operator[:-1]
                temp = self.new_temp()
                self.emit(binary_operator, str(name), value, temp)
                self.emit("=", temp, result=str(name))

            return str(name)

        # Binary expression: x + y, 2 * 3
        if kind in {
            "binaryexpression", "binaryop", "binaryoperation"
        }:
            left = node.get("left")
            right = node.get("right")
            operator = self.get_operator(node)

            if left is None or right is None or not operator:
                children = self.get_children(node)
                if len(children) >= 2:
                    left, right = children[0], children[1]

            if not operator:
                raise CodeGenerationError(
                    "Binary expression is missing its operator.",
                    node.get("line"),
                    node.get("column")
                )

            left_value = self.visit(left)
            right_value = self.visit(right)

            temp = self.new_temp()
            self.emit(
                str(operator),
                left_value,
                right_value,
                temp
            )
            return temp

        # Unary expression: -x, +x, !x
        if kind in {"unaryexpression", "unaryop", "unaryoperation"}:
            operand = node.get("operand", node.get("expression"))
            if operand is None:
                children = self.get_children(node)
                operand = children[0] if children else None

            operator = self.get_operator(node)
            if operand is None or operator not in {"-", "+", "!"}:
                raise CodeGenerationError(
                    "Unsupported or invalid unary expression.",
                    node.get("line"),
                    node.get("column")
                )

            value = self.visit(operand)
            temp = self.new_temp()
            self.emit("u" + operator, value, result=temp)
            return temp

        # Expression statement
        if kind in {"expressionstatement", "exprstmt"}:
            expression = node.get("expression")
            if expression is not None:
                self.visit(expression)
            else:
                for child in self.get_children(node):
                    self.visit(child)
            return None

        # Return statement
        if kind == "returnstatement":
            value_node = node.get("value", node.get("expression"))
            if value_node is not None:
                value = self.visit(value_node)
                self.tac.append({
                    "instruction": f"return {value}",
                    "operator": "return",
                    "arg1": value,
                    "arg2": None,
                    "result": None
                })
            return None

        # Handle a direct statement container.
        children = self.get_children(node)
        if children:
            for child in children:
                self.visit(child)
            return None

        raise CodeGenerationError(
            f"Unsupported AST node: {kind or 'unknown'}",
            node.get("line"),
            node.get("column")
        )
