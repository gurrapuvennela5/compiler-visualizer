import Phase2Parser from './phases/Phase2Parser';
import Phase3Semantic from './phases/Phase3Semantic';
import { useState } from 'react';
import ASTTree from './components/ASTTree.jsx';
import './PlaygroundPage.css';
import Phase4Intermediate from './phases/Phase4Intermediate';
import './phases/Phase4Intermediate.css';
import Phase5Target from './phases/Phase5Target';

const phases = [
    { id: 'lexer', number: '01', label: 'Lexical Analysis', short: 'Tokens', icon: '▤' },
    { id: 'parser', number: '02', label: 'Syntax Analysis / AST', short: 'AST', icon: '⑂' },
    { id: 'semantic', number: '03', label: 'Semantic Analysis', short: 'Symbol Table', icon: '▦' },
    { id: 'intermediate', number: '04', label: 'Intermediate Code & Optimization', short: 'TAC', icon: '</>' },
    { id: 'target', number: '05', label: 'Target Code Generation', short: 'Assembly', icon: '⚙' },
];

const initialCode = `int a = 10;
int b = 20;
int c = a + b * 2;`;

const lexerQuizQuestions = [
    {
        question: 'What is the main purpose of lexical analysis?',
        options: [
            'Convert source characters into tokens',
            'Build the final machine code',
            'Check variable types',
            'Optimize arithmetic expressions'
        ],
        answer: 0,
        explanation:
            'The lexer groups source characters into tokens that later compiler phases can process.'
    },
    {
        question: 'Which token type is used for a reserved word such as int?',
        options: ['IDENTIFIER', 'KEYWORD', 'INTEGER_LITERAL', 'OPERATOR'],
        answer: 1,
        explanation:
            'Reserved language words such as int are classified as keywords.'
    },
    {
        question: 'How is a programmer-defined name such as total classified?',
        options: ['KEYWORD', 'IDENTIFIER', 'PUNCTUATION', 'LITERAL'],
        answer: 1,
        explanation:
            'Names chosen for variables are identifiers.'
    },
    {
        question: 'In `count = 7;`, what token type is 7?',
        options: ['IDENTIFIER', 'ASSIGNMENT_OPERATOR', 'INTEGER_LITERAL', 'KEYWORD'],
        answer: 2,
        explanation:
            'The digits 7 represent an integer literal value in the source program.'
    },
    {
        question: 'How is the plus sign in `a + b` classified?',
        options: ['ARITHMETIC_OPERATOR', 'KEYWORD', 'IDENTIFIER', 'INTEGER_LITERAL'],
        answer: 0,
        explanation:
            'The plus sign is an arithmetic operator token.'
    },
    {
        question: 'What does a token line number identify?',
        options: [
            'The source line where the token appears',
            'The token’s position in the symbol table',
            'The number of compiler phases',
            'The token’s character count'
        ],
        answer: 0,
        explanation:
            'The lexer records source positions so diagnostics can point back to the input line.'
    }
];

    
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
    const [lexerQuestion, setLexerQuestion] = useState(0);
    const [lexerAnswer, setLexerAnswer] = useState(null);
    const [lexerScore, setLexerScore] = useState(0);
    const [lexerQuizFinished, setLexerQuizFinished] = useState(false);

    const phase = phases.find((item) => item.id === activePhase);

    function startLexerQuiz() {
        setLexerQuestion(0);
        setLexerAnswer(null);
        setLexerScore(0);
        setLexerQuizFinished(false);
        setActiveTab('quiz');
    }

    function nextLexerQuestion() {
        if (lexerQuestion === lexerQuizQuestions.length - 1) {
            setLexerQuizFinished(true);
        } else {
            setLexerQuestion((question) => question + 1);
            setLexerAnswer(null);
        }
    }


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
                    {!showQuiz &&
                        ['parser', 'lexer', 'semantic', 'intermediate', 'target'].includes(
                            activePhase
                        ) && (
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
            <>
                <div className="workspace-tabs">
                    <button
                        type="button"
                        className={activeTab === 'output' ? 'active' : ''}
                        onClick={() => setActiveTab('output')}
                    >
                        Output
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'learn' ? 'active' : ''}
                        onClick={() => setActiveTab('learn')}
                    >
                        Learn
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'quiz' ? 'active' : ''}
                        onClick={startLexerQuiz}
                    >
                        Quiz
                    </button>
                </div>

                {activeTab === 'output' && (
                    <div className="phase-content">
                        <h2>Lexical Analysis Output</h2>
                        <p>
                            The lexer converts source characters into tokens and
                            records each token's type and source position.
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
                                    <span>
                                        {(compileResult?.tokens ?? []).length} tokens
                                    </span>
                                </div>

                                <div className="lexer-table-wrapper">
                                    <table className="lexer-table">
                                        <thead>
                                            <tr>
                                                <th>Lexeme</th>
                                                <th>Token Type</th>
                                                <th>Line</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(compileResult?.tokens ?? []).map(
                                                (token, index) => (
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
                                                    </tr>
                                                )
                                            )}

                                            {!(compileResult?.tokens ?? []).length && (
                                                <tr>
                                                    <td
                                                        colSpan={3}
                                                        className="lexer-empty"
                                                    >
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
                )}

                {activeTab === 'learn' && (
                    <div className="workspace-tab-content">
                        <h2>Lexical Analysis</h2>
                        <p>
                            The lexer scans source code and groups characters into
                            tokens for the parser.
                        </p>
                        <p>
                            Keywords are reserved words such as <code>int</code>;
                            identifiers are programmer-chosen names such as{' '}
                            <code>total</code>. Literals represent values, and
                            operators represent actions such as arithmetic or
                            assignment.
                        </p>
                        <p>
                            Each token retains its source line and column so later
                            diagnostics can identify where a token came from.
                        </p>
                    </div>
                )}

                {activeTab === 'quiz' && (
                    <div className="quiz-panel">
                        {lexerQuizFinished ? (
                            <div className="quiz-result">
                                <h2>Quiz Completed!</h2>
                                <p>
                                    Your score:{' '}
                                    <strong>
                                        {lexerScore} / {lexerQuizQuestions.length}
                                    </strong>
                                </p>
                                <button
                                    type="button"
                                    className="compile-button"
                                    onClick={startLexerQuiz}
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <div className="quiz-content">
                                <p className="quiz-progress">
                                    Question {lexerQuestion + 1} of{' '}
                                    {lexerQuizQuestions.length}
                                </p>
                                <h2>{lexerQuizQuestions[lexerQuestion].question}</h2>
                                <div className="quiz-options">
                                    {lexerQuizQuestions[lexerQuestion].options.map(
                                        (option, index) => (
                                            <button
                                                type="button"
                                                key={option}
                                                className={`quiz-option ${
                                                    lexerAnswer === index ? 'selected' : ''
                                                }`}
                                                disabled={lexerAnswer !== null}
                                                onClick={() => {
                                                    setLexerAnswer(index);
                                                    if (
                                                        index ===
                                                        lexerQuizQuestions[lexerQuestion]
                                                            .answer
                                                    ) {
                                                        setLexerScore(
                                                            (score) => score + 1
                                                        );
                                                    }
                                                }}
                                            >
                                                {String.fromCharCode(65 + index)}. {option}
                                            </button>
                                        )
                                    )}
                                </div>
                                {lexerAnswer !== null && (
                                    <div className="quiz-feedback">
                                        <p>
                                            <strong>
                                                {lexerAnswer ===
                                                lexerQuizQuestions[lexerQuestion].answer
                                                    ? 'Correct!'
                                                    : 'Not quite!'}
                                            </strong>
                                        </p>
                                        <p>
                                            {lexerQuizQuestions[lexerQuestion].explanation}
                                        </p>
                                        <button
                                            type="button"
                                            className="compile-button"
                                            onClick={nextLexerQuestion}
                                        >
                                            {lexerQuestion ===
                                            lexerQuizQuestions.length - 1
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
        ) : activePhase === 'parser' ? (
           <Phase2Parser
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasCompiled={hasCompiled}
        compileResult={compileResult}
        compileError={compileError}
        sampleAST={sampleAST}
    />
        ) : activePhase === 'semantic' ? (
    <Phase3Semantic
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        result={hasCompiled ? compileResult : null}
        compileError={compileError}
    />
) : activePhase === 'intermediate' ? (
    <Phase4Intermediate
        compileResult={hasCompiled ? compileResult : null}
    />
) : activePhase === 'target' ? (
    <Phase5Target
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        compileResult={compileResult}
        hasCompiled={hasCompiled}
        compileError={compileError}
        sourceCode={sourceCode}
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
