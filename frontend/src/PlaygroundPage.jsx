import Phase3Semantic from './phases/Phase3Semantic';
import { useState } from 'react';
import ASTTree from './components/ASTTree.jsx';
import './PlaygroundPage.css';
import Phase4Intermediate from './phases/Phase4Intermediate';
import './phases/Phase4Intermediate.css';

const phases = [
    { id: 'lexer', number: '01', label: 'Lexical Analysis', short: 'Tokens', icon: '▤' },
    { id: 'parser', number: '02', label: 'Syntax Analysis / AST', short: 'AST', icon: '⑂' },
    { id: 'semantic', number: '03', label: 'Semantic Analysis', short: 'Symbol Table', icon: '▦' },
    { id: 'intermediate', number: '04', label: 'Intermediate Code & Optimization', short: 'TAC', icon: '</>' },
];

const initialCode = `int a = 10;
int b = 20;
int c = a + b * 2;`;

    
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




function PlaygroundPage({ onHome }) {
    const [activePhase, setActivePhase] = useState('lexer');
    const [activeTab, setActiveTab] = useState('output');
    const [language, setLanguage] = useState('c');
    const [sourceCode, setSourceCode] = useState(initialCode);
    const [showQuiz, setShowQuiz] = useState(false);
    const [compileResult, setCompileResult] = useState(null);
    const [semanticResult, setSemanticResult] = useState(null);
    const [hasCompiled, setHasCompiled] = useState(false);
    const [isCompiling, setIsCompiling] = useState(false);
    const [compileError, setCompileError] = useState('');

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [quizScore, setQuizScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);

    const phase = phases.find((item) => item.id === activePhase);


// TEMPORARY: Sample AST for UI demonstration
const sampleAST = {
    type: 'Program',
    statements: [
        {
            type: 'VariableDeclaration',
            var_type: 'int',
            variable: 'a',
            initializer: {
                type: 'IntegerLiteral',
                value: 10
            }
        },
        {
            type: 'VariableDeclaration',
            var_type: 'int',
            variable: 'b',
            initializer: {
                type: 'IntegerLiteral',
                value: 20
            }
        },
        {
            type: 'VariableDeclaration',
            var_type: 'int',
            variable: 'c',
            initializer: {
                type: 'BinaryExpression',
                operator: '+',
                left: {
                    type: 'Identifier',
                    value: 'a'
                },
                right: {
                    type: 'BinaryExpression',
                    operator: '*',
                    left: {
                        type: 'Identifier',
                        value: 'b'
                    },
                    right: {
                        type: 'IntegerLiteral',
                        value: 2
                    }
                }
            }
        }
    ]
};


    
async function handleCompile() {
    setIsCompiling(true);
    setCompileError('');
    setCompileResult(null);
    setHasCompiled(false);
    setShowQuiz(false);
    setActiveTab('output');

    try {
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/compile`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source_code: sourceCode,
                    language,
                }),
            }
        );

        const responseText = await response.text();
let data = {};

try {
    data = responseText ? JSON.parse(responseText) : {};
} catch {
    throw new Error('The backend returned an invalid response. Please check the API endpoint.');
}

        if (!response.ok) {
            throw new Error(
                data.detail || data.message || 'Compilation request failed.'
            );
        }

        setCompileResult(data);
        setHasCompiled(true);
    } catch (error) {
        setCompileError(
            error.message || 'Could not connect to the compiler backend.'
        );
    } finally {
        setIsCompiling(false);
    }
}


    
function startQuiz() {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
    setShowQuiz(true);
}

function submitAnswer() {
    if (selectedAnswer === null) return;

    if (selectedAnswer === quizQuestions[currentQuestion].answer) {
        setQuizScore((score) => score + 1);
    }
}

function nextQuestion() {
    if (currentQuestion === quizQuestions.length - 1) {
        setQuizFinished(true);
    } else {
        setCurrentQuestion((question) => question + 1);
        setSelectedAnswer(null);
    }
}


    return (
        <div className="playground-page">
            <header className="navbar">
                <a className="brand" href="#home" onClick={onHome}>
                    <span className="brand-icon">&lt;/&gt;</span>
                    <span>
                        Compiler <span className="brand-green">Visualizer</span>
                    </span>
                </a>

                <nav className="nav-links">
                    <a href="#home" onClick={onHome}>Home</a>
                    <a className="active" href="#playground">Playground</a>
                    <a href="#about" onClick={onHome}>About</a>
                </nav>

                <span className="workspace-badge">Learning Workspace</span>
            </header>

            <div className="workspace-layout">
                <aside className="sidebar">
                    <button className="sidebar-home active" onClick={() => {
                        setShowQuiz(false);
                        setActiveTab('output');
                    }}>
                        <span>⌂</span> Playground
                    </button>

                    <p className="sidebar-heading">COMPILER PHASES</p>

                    {phases.map((item) => (
                        <button
                            key={item.id}
                            className={`phase-nav ${activePhase === item.id && !showQuiz ? 'selected' : ''}`}
                            onClick={() => {
                                setActivePhase(item.id);
                                setShowQuiz(false);
                                setActiveTab('output');
                            }}
                        >
                            <span className="phase-nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}

                    <div className="sidebar-divider" />

                    <button
                        className={`phase-nav utility-link ${showQuiz ? 'selected' : ''}`}
                        onClick={startQuiz}
                    >
                        <span className="utility-icon">♜</span>
                        <span>Quiz</span>
                        <span className="nav-chevron">›</span>
                    </button>

                    <button
                        className="phase-nav utility-link"
                        onClick={() => {
                            setShowQuiz(false);
                            setActiveTab('learn');
                        }}
                    >
                        <span className="utility-icon">▤</span>
                        <span>Learn</span>
                        <span className="nav-chevron">›</span>
                    </button>
                </aside>

                <main className="workspace-main">
                    <section className="phase-toolbar">
                        <div className="phase-heading">
                            <span className="phase-heading-icon">{phase.icon}</span>
                            <div>
                                <h1>{showQuiz ? 'Knowledge Check' : phase.label}</h1>
                                <p>
                                    {showQuiz
                                        ? 'Test your understanding of compiler concepts.'
                                        : `Explore ${phase.label.toLowerCase()} through your source code.`}
                                </p>
                            </div>
                        </div>

                        {!showQuiz && (
                            <div className="compile-controls">
                                <label className="language-select">
                                    <span>Language</span>
                                    <select
                                        value={language}
                                        onChange={(event) => setLanguage(event.target.value)}
                                    >
                                        <option value="c">C</option>
                                        <option value="cpp">C++</option>
                                        <option value="java">Java</option>
                                    </select>
                                </label>

                                <button
    className="compile-button"
    onClick={handleCompile}
    disabled={isCompiling}
>
    {isCompiling ? 'Compiling...' : '▶ Compile'}
</button>
                            </div>
                        )}
                    </section>
                    {!showQuiz && (activePhase === 'parser' || activePhase === 'lexer') && (
    <section className="workspace-card source-editor-card">
        <div className="source-editor-header">
            <h2>Source Code</h2>


            <button
                type="button"
                className="copy-code-button"
                onClick={() => {
                    navigator.clipboard.writeText(sourceCode);
                }}
                title="Copy source code"
            >
                Copy Code
            </button>
        </div>

        <div className="source-editor">
            <div className="line-numbers" aria-hidden="true">
                {sourceCode.split('\n').map((_, index) => (
                    <div key={index}>{index + 1}</div>
                ))}
            </div>

            <textarea
                className="source-code-input"
                value={sourceCode}
                onChange={(event) => setSourceCode(event.target.value)}
                spellCheck={false}
                aria-label="Source code editor"
            />
        </div>
    </section>
)}
                    


                  

{showQuiz ? (
    <section className="workspace-card phase-workspace quiz-panel">
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
    </section>
) : (



                
    <section className="workspace-card phase-workspace">
        {activePhase === 'lexer' ? (
    <div className="phase-content">
        <h2>Lexical Analysis Output</h2>
        <p>
            The lexer converts your source code into tokens and records
            each token's type and source position.
        </p>

        {compileError && (
            <div className="lexer-errors" role="alert">
                {compileError}
            </div>
        )}

        {!hasCompiled ? (
            <p>Enter source code and click Compile to view the tokens.</p>
        ) : (
            <>
                {(compileResult?.errors ?? [])
                    .filter((error) => error.phase === 'lexer')
                    .map((error, index) => (
                        <div
                            className="lexer-errors"
                            role="alert"
                            key={`${error.type}-${index}`}
                        >
                            <strong>{error.type}</strong>: {error.message}
                            {error.line != null &&
    ` (Line ${error.line}, Column ${error.column ?? '?'})`}
                        </div>
                    ))}

                <div className="lexer-result-heading">
                    <h3>Token Stream</h3>
                    <span>{(compileResult?.tokens ?? []).length} tokens</span>
                </div>

                <div className="lexer-table-wrapper">
                    <table className="lexer-table">
                        <thead>
                            <tr>
                                <th>Lexeme</th>
                                <th>Token Type</th>
                                <th>Line</th>
                                <th>Column</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(compileResult?.tokens ?? []).map((token, index) => (
                                <tr
                                    key={`${token.line}-${token.column}-${index}`}
                                >
                                    <td><code>{token.lexeme}</code></td>
                                    <td>
                                        <span className="lexer-token-type">
                                            {token.token_type}
                                        </span>
                                    </td>
                                    <td>{token.line}</td>
                                    <td>{token.column}</td>
                                </tr>
                            ))}

                            {!(compileResult?.tokens ?? []).length && (
                                <tr>
                                    <td colSpan={4} className="lexer-empty">
                                        No tokens to display.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        )}
    </div>
) : activePhase === 'parser' ? (
            <>
                {/* Tabs appear only in Syntax Analysis */}
                <div className="workspace-tabs">
                    <button
                        className={activeTab === 'output' ? 'active' : ''}
                        onClick={() => setActiveTab('output')}
                    >
                        Output
                    </button>

                    <button
                        className={
                            activeTab === 'visualization' ? 'active' : ''
                        }
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
                                Compilation response received. Open
                                Visualization to inspect the AST.
                            </p>
                        )}
                    </div>
                )}

                {/* VISUALIZATION TAB */}
                {activeTab === 'visualization' && (
                    <div>
                        <h2>Abstract Syntax Tree (AST)</h2>
                        {/* <ASTTree ast={compileResult?.ast} /> */}
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
            </>
        ) : activePhase === 'semantic' ? (
    <Phase3Semantic
        result={hasCompiled ? compileResult?.semantic ?? null : null}
    />
) : activePhase === 'intermediate' ? (
    <Phase4Intermediate
        compileResult={hasCompiled ? compileResult : null}
    />
) : (
    <div className="phase-content">
        <h2>{phase.label}</h2>
        <p>
            Explore {phase.label.toLowerCase()} here.
        </p>
    </div>
)
        }
    </section>
)}





                </main>
            </div>
        </div>
    );
}

export default PlaygroundPage;
