import React, { useState } from 'react';
import ASTTree from '../components/ASTTree.jsx';

const quizQuestions = [
    {
        question: '1. What is the main purpose of syntax analysis?',
        options: [
            'To execute the program',
            'To check whether tokens follow grammar rules',
            'To optimize machine code',
            'To allocate memory'
        ],
        answer: 1,
        explanation:
            'Syntax analysis checks whether the token sequence follows the grammar of the programming language.'
    },
    {
        question: '2. What does AST stand for?',
        options: [
            'Advanced Syntax Token',
            'Abstract Syntax Tree',
            'Automated Source Translation',
            'Abstract Semantic Table'
        ],
        answer: 1,
        explanation:
            'An Abstract Syntax Tree represents the grammatical structure of source code as a tree.'
    },
    {
        question: '3. Which operator has higher precedence?',
        options: ['+', '-', '*', 'All have equal precedence'],
        answer: 2,
        explanation:
            'Multiplication has higher precedence than addition and subtraction.'
    },
    {
        question: '4. What is the root node of our parser’s AST?',
        options: ['BinaryExpression', 'Identifier', 'Program', 'IntegerLiteral'],
        answer: 2,
        explanation:
            'The Program node is the root and contains the list of parsed statements.'
    },
    {
        question: '5. What should the parser do when a required semicolon is missing?',
        options: [
            'Silently add it',
            'Ignore the statement',
            'Report a syntax error',
            'Execute the statement anyway'
        ],
        answer: 2,
        explanation:
            'Our parser reports a structured syntax error when a required semicolon is missing.'
    },
    {
        question: '6. For a + b * 2, which operation is grouped first?',
        options: [
            'Addition',
            'Multiplication',
            'Both simultaneously',
            'Neither operation'
        ],
        answer: 1,
        explanation:
            'Multiplication has higher precedence, so b * 2 forms a subtree beneath the addition node.'
    }
];

export default function Phase2Parser({
    activeTab,
    setActiveTab,
    hasCompiled,
    compileResult,
    compileError,
    sampleAST,
}) {
    // Quiz state localized to Phase 2 Parser
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [quizScore, setQuizScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);

    function startQuiz() {
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setQuizScore(0);
        setQuizFinished(false);
    }

    function nextQuestion() {
        if (currentQuestion === quizQuestions.length - 1) {
            setQuizFinished(true);
        } else {
            setCurrentQuestion((q) => q + 1);
            setSelectedAnswer(null);
        }
    }

    return (
        <>
            {/* Tabs including Output, Visualization, Learn, and Quiz */}
            <div className="workspace-tabs">
                <button
                    className={activeTab === 'output' ? 'active' : ''}
                    onClick={() => setActiveTab('output')}
                >
                    Output
                </button>

                <button
                    className={activeTab === 'visualization' ? 'active' : ''}
                    onClick={() => setActiveTab('visualization')}
                >
                    Visualization
                </button>

                <button
                    className={activeTab === 'learn' ? 'active' : ''}
                    onClick={() => setActiveTab('learn')}
                >
                    Learn
                </button>

                <button
                    className={activeTab === 'quiz' ? 'active' : ''}
                    onClick={() => {
                        setActiveTab('quiz');
                        startQuiz();
                    }}
                >
                    Quiz
                </button>
            </div>

            {/* OUTPUT TAB */}
            {activeTab === 'output' && (
                <div>
                    <h2>Syntax Analysis Output</h2>

                    {compileError && (
                        <div className="parser-errors" role="alert">
                            {compileError}
                        </div>
                    )}

                    {!hasCompiled ? (
                        <p>
                            Enter your source code and click Compile to
                            inspect the parser output.
                        </p>
                    ) : compileResult?.errors?.length > 0 ? (
                        <div className="parser-errors">
                            {compileResult.errors.map((error, index) => (
                                <p key={`${error.type}-${index}`}>
                                    <strong>{error.type}</strong>:{' '}
                                    {error.message}
                                    {error.line != null &&
                                        ` (Line ${error.line}, Column ${
                                            error.column ?? '?'
                                        })`}
                                </p>
                            ))}
                        </div>
                    ) : (
                        <p>
                            Compilation response received. No errors found. Open
                            Visualization to inspect the AST.
                        </p>
                    )}
                </div>
            )}

            {/* VISUALIZATION TAB */}
            {activeTab === 'visualization' && (
                <div>
                    <h2>Abstract Syntax Tree (AST)</h2>
                    {compileError ? (
                        <div className="parser-errors">
                            Fix the compilation error to view the AST.
                        </div>
                    ) : compileResult?.errors?.length > 0 ? (
                        <div className="parser-errors">
                            Fix the syntax errors to view the AST.
                        </div>
                    ) : (
                        <ASTTree ast={compileResult?.ast || (!hasCompiled ? sampleAST : null)} />
                    )}
                </div>
            )}

            {/* LEARN TAB */}
            {activeTab === 'learn' && (
                <div>
                    <h2>Syntax Analysis / AST</h2>

                    <p>
                        Syntax analysis checks whether the tokens follow
                        the grammar rules of a programming language.
                    </p>

                    <p>
                        An Abstract Syntax Tree (AST) represents the
                        structure of a program as a tree. Operators and
                        their operands become connected nodes.
                    </p>

                    <p>
                        For example, in <code>a + b * 2</code>,
                        multiplication is grouped before addition because
                        it has higher precedence.
                    </p>
                </div>
            )}

            {/* QUIZ TAB */}
            {activeTab === 'quiz' && (
                <div className="quiz-panel">
                    {quizFinished ? (
                        <div className="quiz-result">
                            <h2>Quiz Completed!</h2>
                            <p>
                                Your score:{' '}
                                <strong>
                                    {quizScore} / {quizQuestions.length}
                                </strong>
                            </p>
                            <button className="compile-button" onClick={startQuiz}>
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="quiz-content">
                            <p className="quiz-progress">
                                Question {currentQuestion + 1} of {quizQuestions.length}
                            </p>
                            <h2>{quizQuestions[currentQuestion].question}</h2>
                            <div className="quiz-options">
                                {quizQuestions[currentQuestion].options.map(
                                    (option, index) => (
                                        <button
                                            key={option}
                                            className={`quiz-option ${
                                                selectedAnswer === index ? 'selected' : ''
                                            }`}
                                            disabled={selectedAnswer !== null}
                                            onClick={() => {
                                                setSelectedAnswer(index);
                                                if (
                                                    index ===
                                                    quizQuestions[currentQuestion].answer
                                                ) {
                                                    setQuizScore((score) => score + 1);
                                                }
                                            }}
                                        >
                                            {String.fromCharCode(65 + index)}. {option}
                                        </button>
                                    )
                                )}
                            </div>
                            {selectedAnswer !== null && (
                                <div className="quiz-feedback">
                                    <p>
                                        <strong>
                                            {selectedAnswer ===
                                            quizQuestions[currentQuestion].answer
                                                ? 'Correct!'
                                                : 'Not quite!'}
                                        </strong>
                                    </p>
                                    <p>
                                        {quizQuestions[currentQuestion].explanation}
                                    </p>
                                    <button
                                        className="compile-button"
                                        onClick={nextQuestion}
                                    >
                                        {currentQuestion === quizQuestions.length - 1
                                            ? 'View Score'
                                            : 'Next Question'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}