
from app.modules.parser import parse_tokens


def make_token(token_type, value, column):
    return {
        "type": token_type,
        "value": value,
        "line": 1,
        "column": column,
    }


def test_variable_declaration():
    data = {
        "tokens": [
            make_token("KEYWORD", "int", 1),
            make_token("IDENTIFIER", "a", 5),
            make_token("ASSIGN", "=", 7),
            make_token("INT_LITERAL", "10", 9),
            make_token("SEMICOLON", ";", 11),
        ],
        "errors": [],
    }

    result = parse_tokens(data)

    assert result["errors"] == []
    declaration = result["ast"]["children"][0]
    assert declaration["node_type"] == "VarDecl"
    assert declaration["name"] == "a"
    assert declaration["init"]["value"] == 10


def test_operator_precedence():
    data = {
        "tokens": [
            make_token("KEYWORD", "int", 1),
            make_token("IDENTIFIER", "c", 5),
            make_token("ASSIGN", "=", 7),
            make_token("IDENTIFIER", "a", 9),
            make_token("PLUS", "+", 11),
            make_token("IDENTIFIER", "b", 13),
            make_token("MULTIPLY", "*", 15),
            make_token("INT_LITERAL", "2", 17),
            make_token("SEMICOLON", ";", 18),
        ],
        "errors": [],
    }

    result = parse_tokens(data)

    assert result["errors"] == []
    expression = result["ast"]["children"][0]["init"]
    assert expression["node_type"] == "BinaryOp"
    assert expression["op"] == "+"
    assert expression["right"]["op"] == "*"


def test_missing_semicolon():
    data = {
        "tokens": [
            make_token("KEYWORD", "int", 1),
            make_token("IDENTIFIER", "a", 5),
            make_token("ASSIGN", "=", 7),
            make_token("INT_LITERAL", "10", 9),
        ],
        "errors": [],
    }

    result = parse_tokens(data)

    assert result["ast"] is None
    assert result["errors"][0]["phase"] == "syntax"
    assert "Expected ';'" in result["errors"][0]["message"]

    
def test_parentheses_override_precedence():
    # Input: int x = (a + b) * 2;
    tokens = [
        make_token("KEYWORD", "int", 1),
        make_token("IDENTIFIER", "x", 5),
        make_token("ASSIGN", "=", 7),
        make_token("(", "(", 9),
        make_token("IDENTIFIER", "a", 10),
        make_token("PLUS", "+", 12),
        make_token("IDENTIFIER", "b", 14),
        make_token(")", ")", 15),
        make_token("MULTIPLY", "*", 17),
        make_token("INT_LITERAL", "2", 19),
        make_token("SEMICOLON", ";", 20),
    ]

    result = parse_tokens({"tokens": tokens, "errors": []})
    expression = result["ast"]["children"][0]["init"]

    assert result["errors"] == []
    assert expression["op"] == "*"
    assert expression["left"]["op"] == "+"


def test_assignment():
    # Input: a = 20;
    tokens = [
        make_token("IDENTIFIER", "a", 1),
        make_token("ASSIGN", "=", 3),
        make_token("INT_LITERAL", "20", 5),
        make_token("SEMICOLON", ";", 7),
    ]

    result = parse_tokens({"tokens": tokens, "errors": []})

    assert result["errors"] == []
    statement = result["ast"]["children"][0]
    assert statement["node_type"] == "Assignment"
    assert statement["name"] == "a"
    assert statement["value"]["value"] == 20


def test_invalid_expression():
    # Input: int a = +;
    tokens = [
        make_token("KEYWORD", "int", 1),
        make_token("IDENTIFIER", "a", 5),
        make_token("ASSIGN", "=", 7),
        make_token("PLUS", "+", 9),
        make_token("SEMICOLON", ";", 10),
    ]

    result = parse_tokens({"tokens": tokens, "errors": []})

    assert result["ast"] is None
    assert result["errors"][0]["phase"] == "syntax"
    assert result["errors"][0]["line"] == 1
    assert result["errors"][0]["column"] == 9


def test_missing_closing_parenthesis():
    # Input: int a = (2 + 3;
    tokens = [
        make_token("KEYWORD", "int", 1),
        make_token("IDENTIFIER", "a", 5),
        make_token("ASSIGN", "=", 7),
        make_token("(", "(", 9),
        make_token("INT_LITERAL", "2", 10),
        make_token("PLUS", "+", 12),
        make_token("INT_LITERAL", "3", 14),
        make_token("SEMICOLON", ";", 15),
    ]

    result = parse_tokens({"tokens": tokens, "errors": []})

    assert result["ast"] is None
    assert result["errors"][0]["phase"] == "syntax"
    assert "Expected ')'" in result["errors"][0]["message"]

