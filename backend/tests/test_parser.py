
from app.compiler.parser import parse_tokens


def token(token_type, lexeme, column, line=1):
    return {
        "token_type": token_type,
        "lexeme": lexeme,
        "line": line,
        "column": column
    }


def test_variable_declaration():
    data = {
        "tokens": [
            token("KEYWORD", "int", 1),
            token("IDENTIFIER", "a", 5),
            token("ASSIGNMENT_OPERATOR", "=", 7),
            token("INTEGER_LITERAL", "10", 9),
            token("SEMICOLON", ";", 11)
        ],
        "errors": []
    }

    result = parse_tokens(data)

    assert result["errors"] == []
    declaration = result["ast"]["statements"][0]
    assert declaration["type"] == "VariableDeclaration"
    assert declaration["var_type"] == "int"
    assert declaration["variable"] == "a"
    assert declaration["initializer"]["type"] == "IntegerLiteral"
    assert declaration["initializer"]["value"] == 10


def test_operator_precedence():
    data = {
        "tokens": [
            token("KEYWORD", "int", 1),
            token("IDENTIFIER", "c", 5),
            token("ASSIGNMENT_OPERATOR", "=", 7),
            token("IDENTIFIER", "a", 9),
            token("ARITHMETIC_OPERATOR", "+", 11),
            token("IDENTIFIER", "b", 13),
            token("ARITHMETIC_OPERATOR", "*", 15),
            token("INTEGER_LITERAL", "2", 17),
            token("SEMICOLON", ";", 18)
        ],
        "errors": []
    }

    result = parse_tokens(data)
    expression = result["ast"]["statements"][0]["initializer"]

    assert result["errors"] == []
    assert expression["type"] == "BinaryExpression"
    assert expression["operator"] == "+"
    assert expression["right"]["operator"] == "*"


def test_parentheses_override_precedence():
    data = {
        "tokens": [
            token("KEYWORD", "int", 1),
            token("IDENTIFIER", "x", 5),
            token("ASSIGNMENT_OPERATOR", "=", 7),
            token("LEFT_PARENTHESIS", "(", 9),
            token("IDENTIFIER", "a", 10),
            token("ARITHMETIC_OPERATOR", "+", 12),
            token("IDENTIFIER", "b", 14),
            token("RIGHT_PARENTHESIS", ")", 15),
            token("ARITHMETIC_OPERATOR", "*", 17),
            token("INTEGER_LITERAL", "2", 19),
            token("SEMICOLON", ";", 20)
        ],
        "errors": []
    }

    result = parse_tokens(data)
    expression = result["ast"]["statements"][0]["initializer"]

    assert result["errors"] == []
    assert expression["operator"] == "*"
    assert expression["left"]["operator"] == "+"


def test_missing_semicolon():
    data = {
        "tokens": [
            token("KEYWORD", "int", 1),
            token("IDENTIFIER", "a", 5),
            token("ASSIGNMENT_OPERATOR", "=", 7),
            token("INTEGER_LITERAL", "10", 9)
        ],
        "errors": []
    }

    result = parse_tokens(data)

    assert result["ast"] is None
    error = result["errors"][0]
    assert error["phase"] == "parser"
    assert error["type"] == "missing_semicolon"
    assert error["line"] == 1


def test_assignment():
    data = {
        "tokens": [
            token("IDENTIFIER", "a", 1),
            token("ASSIGNMENT_OPERATOR", "=", 3),
            token("INTEGER_LITERAL", "20", 5),
            token("SEMICOLON", ";", 7)
        ],
        "errors": []
    }

    result = parse_tokens(data)

    assert result["errors"] == []
    statement = result["ast"]["statements"][0]
    assert statement["type"] == "Assignment"
    assert statement["variable"] == "a"
    assert statement["value"]["value"] == 20
