
import ast as python_ast
import operator
import re


BINARY_OPERATORS = {
    "+": operator.add,
    "-": operator.sub,
    "*": operator.mul,
    "/": operator.truediv,
    "%": operator.mod,
    "<": operator.lt,
    ">": operator.gt,
    "<=": operator.le,
    ">=": operator.ge,
    "==": operator.eq,
    "!=": operator.ne,
    "&&": lambda a, b: bool(a) and bool(b),
    "||": lambda a, b: bool(a) or bool(b),
}

UNARY_OPERATORS = {
    "u+": operator.pos,
    "u-": operator.neg,
    "!": lambda value: not bool(value),
}


def parse_constant(value):
    """Parse only numeric and boolean constants, never arbitrary code."""
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value
    if not isinstance(value, str):
        return None

    value = value.strip()

    if value in {"true", "True"}:
        return True
    if value in {"false", "False"}:
        return False

    try:
        parsed = python_ast.literal_eval(value)
        if isinstance(parsed, (int, float)) and not isinstance(parsed, bool):
            return parsed
        if isinstance(parsed, bool):
            return parsed
    except (ValueError, SyntaxError):
        pass

    return None


def is_constant(value):
    return parse_constant(value) is not None


def format_constant(value):
    if isinstance(value, bool):
        return "1" if value else "0"
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value)


class Optimizer:
    def __init__(self):
        self.optimizations = []

    def record(self, optimization_type, before, after, explanation):
        self.optimizations.append({
            "type": optimization_type,
            "before": before,
            "after": after,
            "explanation": explanation
        })

    def optimize(self, tac):
        self.optimizations = []
        optimized = []
        constants = {}

        for original in tac:
            instruction = dict(original)
            before = instruction["instruction"]
            op = instruction.get("operator")
            a = instruction.get("arg1")
            b = instruction.get("arg2")
            result = instruction.get("result")

            # Substitute known constants into operands.
            propagated = False

            if isinstance(a, str) and a in constants:
                a = constants[a]
                propagated = True

            if isinstance(b, str) and b in constants:
                b = constants[b]
                propagated = True

            if propagated and op not in {"=", "return"}:
                self.record(
                    "constant_propagation",
                    before,
                    self._render(op, a, b, result),
                    "A previously assigned constant replaces a variable."
                )

            instruction["arg1"] = a
            instruction["arg2"] = b

            # Fold binary expressions only when both operands are constants.
            if op in BINARY_OPERATORS and is_constant(a) and is_constant(b):
                left = parse_constant(a)
                right = parse_constant(b)

                try:
                    # Avoid invalid arithmetic and division by zero.
                    if op in {"/", "%"} and right == 0:
                        raise ArithmeticError("Division by zero")

                    value = BINARY_OPERATORS[op](left, right)

                    # Keep the result safe and predictable.
                    if isinstance(value, float) and not value.is_integer():
                        folded = repr(value)
                    else:
                        folded = format_constant(value)

                    instruction.update({
                        "operator": "=",
                        "arg1": folded,
                        "arg2": None,
                        "result": result,
                        "instruction": f"{result} = {folded}"
                    })

                    self.record(
                        "constant_folding",
                        before,
                        instruction["instruction"],
                        "Both operands are constants, so the expression "
                        "is evaluated at compile time."
                    )
                except (ArithmeticError, OverflowError, TypeError, ValueError):
                    pass

            # Fold unary constant expressions.
            elif op in UNARY_OPERATORS and is_constant(a):
                try:
                    value = UNARY_OPERATORS[op](parse_constant(a))
                    folded = format_constant(value)

                    instruction.update({
                        "operator": "=",
                        "arg1": folded,
                        "arg2": None,
                        "result": result,
                        "instruction": f"{result} = {folded}"
                    })

                    self.record(
                        "constant_folding",
                        before,
                        instruction["instruction"],
                        "The unary expression is evaluated at compile time."
                    )
                except (ArithmeticError, OverflowError, TypeError, ValueError):
                    pass

            # Track constants assigned to variables and temporaries.
            if op == "=" and result is not None:
                if is_constant(instruction.get("arg1")):
                    constants[result] = instruction["arg1"]
                else:
                    constants.pop(result, None)
            elif result is not None:
                # A computed value is not necessarily a compile-time constant.
                constants.pop(result, None)

            # An assignment to a variable invalidates its old value.
            if op == "=" and result is not None:
                for name in list(constants):
                    if name == result:
                        continue

            instruction["instruction"] = self._render(
                instruction["operator"],
                instruction.get("arg1"),
                instruction.get("arg2"),
                instruction.get("result")
            )

            # Preserve the conventional return format.
            if instruction["operator"] == "return":
                instruction["instruction"] = (
                    f"return {instruction['arg1']}"
                    if instruction["arg1"] is not None
                    else "return"
                )

            optimized.append(instruction)

        return optimized, self.optimizations

    @staticmethod
    def _render(op, a, b, result):
        if op == "=":
            return f"{result} = {a}"
        if op in UNARY_OPERATORS:
            symbol = {"u+": "+", "u-": "-", "!": "!"}[op]
            return f"{result} = {symbol}{a}"
        if op == "return":
            return f"return {a}" if a is not None else "return"
        return f"{result} = {a} {op} {b}"
