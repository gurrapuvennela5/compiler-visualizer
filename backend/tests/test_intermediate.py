import unittest

from app.compiler.intermediate import IntermediateCodeGenerator, CodeGenerationError
from app.compiler.optimizer import Optimizer


class TestIntermediate(unittest.TestCase):
    def setUp(self):
        self.generator = IntermediateCodeGenerator()
        self.optimizer = Optimizer()

    def test_binary_expression_generates_temporary(self):
        ast = {"type": "Program", "children": [{
            "type": "Declaration", "name": "z",
            "initializer": {"type": "BinaryExpression", "operator": "-",
                            "left": {"type": "Identifier", "name": "x"},
                            "right": {"type": "Identifier", "name": "y"}}
        }]}
        tac = self.generator.generate(ast)
        self.assertEqual([x["instruction"] for x in tac], ["t1 = x - y", "z = t1"])

    def test_constant_folding(self):
        tac = [{"instruction": "t1 = 2 * 3", "operator": "*", "arg1": "2",
                "arg2": "3", "result": "t1"}]
        optimized, records = self.optimizer.optimize(tac)
        self.assertEqual(optimized[0]["instruction"], "t1 = 6")
        self.assertEqual(records[0]["type"], "constant_folding")

    def test_propagation_then_folding(self):
        tac = [
            {"instruction": "x = 10", "operator": "=", "arg1": "10", "arg2": None, "result": "x"},
            {"instruction": "t1 = x + 5", "operator": "+", "arg1": "x", "arg2": "5", "result": "t1"},
        ]
        optimized, records = self.optimizer.optimize(tac)
        self.assertEqual(optimized[1]["instruction"], "t1 = 15")
        self.assertTrue(any(r["type"] == "constant_propagation" for r in records))
        self.assertTrue(any(r["type"] == "constant_folding" for r in records))

    def test_no_optimization(self):
        tac = [{"instruction": "t1 = x - y", "operator": "-", "arg1": "x", "arg2": "y", "result": "t1"}]
        optimized, records = self.optimizer.optimize(tac)
        self.assertEqual(optimized[0]["instruction"], "t1 = x - y")
        self.assertEqual(records, [])

    def test_division_by_zero_is_not_folded(self):
        tac = [{"instruction": "t1 = 10 / 0", "operator": "/", "arg1": "10", "arg2": "0", "result": "t1"}]
        optimized, records = self.optimizer.optimize(tac)
        self.assertEqual(optimized[0]["instruction"], "t1 = 10 / 0")
        self.assertEqual(records, [])

    def test_invalid_ast_returns_structured_error(self):
        with self.assertRaises(CodeGenerationError):
            self.generator.generate(None)


if __name__ == "__main__":
    unittest.main()
