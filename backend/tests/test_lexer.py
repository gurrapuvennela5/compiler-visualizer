import pytest

from app.compiler.lexer import Lexer, LexerError


def test_basic_tokens():
    tokens = Lexer("int x = 5;").tokenize()

    assert [token["lexeme"] for token in tokens] == [
        "int", "x", "=", "5", ";"
    ]
    assert [token["token_type"] for token in tokens] == [
        "KEYWORD",
        "IDENTIFIER",
        "ASSIGNMENT_OPERATOR",
        "INTEGER_LITERAL",
        "SEMICOLON",
    ]


def test_token_positions():
    tokens = Lexer("int x = 5;").tokenize()

    assert tokens[0]["line"] == 1
    assert tokens[0]["column"] == 1
    assert tokens[1]["column"] == 5
    assert tokens[3]["column"] == 9


def test_float_literal():
    tokens = Lexer("float price = 12.5;").tokenize()

    assert any(
        token["lexeme"] == "12.5"
        and token["token_type"] == "FLOAT_LITERAL"
        for token in tokens
    )


def test_comments_are_ignored():
    tokens = Lexer("int x = 5; // a comment").tokenize()

    assert [token["lexeme"] for token in tokens] == [
        "int", "x", "=", "5", ";"
    ]


def test_line_numbers():
    tokens = Lexer("int x = 1;\nint y = 2;").tokenize()

    second_declaration = next(
        token for token in tokens if token["lexeme"] == "y"
    )
    assert second_declaration["line"] == 2
    assert second_declaration["column"] == 5


def test_invalid_character():
    with pytest.raises(LexerError) as error:
        Lexer("int x = @;").tokenize()

    assert error.value.error_type == "invalid_character"
    assert error.value.line == 1
    assert error.value.column == 9
