import React, { useState } from 'react';

const quizQuestions = [
    {
        question: '1. What is the primary input to the Target Code Generation phase?',
        options: [
            'Source code text',
            'Token stream',
            'Intermediate Representation (TAC / AST)',
            'Machine binary'
        ],
        answer: 2,
        explanation: 'Target code generation typically consumes an intermediate representation like Three-Address Code (TAC) or an Abstract Syntax Tree.'
    },
    {
        question: '2. What is register allocation?',
        options: [
            'Assigning memory addresses to global variables',
            'Mapping program variables and temporaries to limited hardware CPU registers',
            'Sorting instructions alphabetically',
            'Cleaning up syntax errors'
        ],
        answer: 1,
        explanation: 'Register allocation determines which variables fit into fast CPU registers to minimize slow memory access.'
    },
    {
        question: '3. Which of the following is a key responsibility of instruction selection?',
        options: [
            'Choosing the most efficient machine instructions for target architecture operations',
            'Formatting the UI layout',
            'Writing comments into source code',
            'Lexical tokenization'
        ],
        answer: 0,
        explanation: 'Instruction selection maps intermediate operations to specific, optimized assembly instructions of the target processor.'
    },
    {
        question: '4. Why are assembly instructions like LOAD and STORE used in code generation models?',
        options: [
            'To directly execute JavaScript in the browser',
            'To bridge high-level variable states with low-level memory and register operations',
            'To compress file sizes',
            'To validate spelling'
        ],
        answer: 1,
        explanation: 'LOAD and STORE instructions handle moving data back and forth between physical RAM memory and CPU registers.'
    },
    {
        question: '5. What happens when a compilation error occurs in earlier phases?',
        options: [
            'Target code is generated anyway',
            'Target code generation is blocked until errors are resolved',
            'The computer restarts',
            'Variables become constants'
        ],
        answer: 1,
        explanation: 'A compiler will halt the pipeline and prevent target code generation if syntax or semantic checks fail.'
    }
];

export default function Phase5Target({
    activeTab,
    setActiveTab,
    compileResult,
    hasCompiled,
    compileError,
    sourceCode,
}) {
    const [copied, setCopied] = useState(false);

    // Quiz state
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

    const generateDynamicTargetCode = (code = '') => {
        if (!code) return 'LOAD R1, #0';

        const lines = code.split(';').map(l => l.trim()).filter(Boolean);
        let instructions = [];
        let regCounter = 1;

        lines.forEach((line) => {
            const declMatch = line.match(/(int|float|double)\s+(\w+)\s*=\s*(.+)/);
            if (declMatch) {
                const [, type, varName, expr] = declMatch;
                if (expr.includes('+') || expr.includes('-') || expr.includes('*') || expr.includes('/')) {
                    const parts = expr.split(/([+\-*/])/).map(p => p.trim());
                    instructions.push(`LOAD R${regCounter}, ${parts[0]}`);
                    const leftReg = regCounter;
                    regCounter++;
                    
                    instructions.push(`LOAD R${regCounter}, ${parts[2]}`);
                    const op = parts[1] === '+' ? 'ADD' : parts[1] === '-' ? 'SUB' : parts[1] === '*' ? 'MUL' : 'DIV';
                    instructions.push(`${op}  R${leftReg}, R${regCounter}`);
                    instructions.push(`STORE ${varName}, R${leftReg}`);
                } else {
                    const loadVal = type === 'float' ? `#${expr}f` : `#${expr}`;
                    instructions.push(`LOAD R${regCounter}, ${loadVal}`);
                    instructions.push(`STORE ${varName}, R${regCounter}`);
                    regCounter++;
                }
            }
        });

        return instructions.length > 0 
            ? instructions.join('\n') 
            : `LOAD R1, #10\nSTORE a, R1\nLOAD R1, #20\nSTORE b, R1\nLOAD R1, b\nMUL  R1, #2\nLOAD R2, a\nADD  R2, R1\nSTORE c, R2`;
    };

    const targetCode = compileResult?.target_code || 
                       compileResult?.assembly || 
                       generateDynamicTargetCode(sourceCode);

    const handleCopy = () => {
        navigator.clipboard.writeText(targetCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            {/* Sub-Tabs: Output, Learn, Quiz */}
            <div className="workspace-tabs" style={{ marginBottom: '1.5rem' }}>
                <button
                    className={activeTab === 'output' ? 'active' : ''}
                    onClick={() => setActiveTab('output')}
                >
                    Output
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

            {/* OUTPUT TAB (Contains the Target Code view and errors) */}
            {activeTab === 'output' && (
                <section className="workspace-card source-editor-card">
                    <div className="source-editor-header">
                        <h2>Target Code (Assembly / Machine Code)</h2>
                        {!compileError && (!compileResult?.errors || compileResult.errors.length === 0) && (
                            <button
                                type="button"
                                className="copy-code-button"
                                onClick={handleCopy}
                                title="Copy target code"
                            >
                                {copied ? 'Copied!' : 'Copy Code'}
                            </button>
                        )}
                    </div>

                    {compileError ? (
                        <div className="parser-errors" style={{ padding: '1.5rem' }} role="alert">
                            <strong>Compilation Error:</strong> {compileError}
                        </div>
                    ) : compileResult?.errors?.length > 0 ? (
                        <div className="parser-errors" style={{ padding: '1.5rem' }}>
                            <p><strong>Fix syntax errors to generate target code:</strong></p>
                            {compileResult.errors.map((error, index) => (
                                <p key={`${error.type}-${index}`}>
                                    • <strong>{error.type}</strong>: {error.message}
                                </p>
                            ))}
                        </div>
                    ) : (
                        <div className="source-editor">
                            <div className="line-numbers" aria-hidden="true">
                                {targetCode.split('\n').map((_, index) => (
                                    <div key={index}>{index + 1}</div>
                                ))}
                            </div>

                            <pre className="source-code-input" style={{ margin: 0, padding: '0.75rem 1rem', overflowX: 'auto', fontFamily: 'monospace' }}>
                                <code>{targetCode}</code>
                            </pre>
                        </div>
                    )}
                </section>
            )}

            {/* LEARN TAB */}
            {activeTab === 'learn' && (
                <div style={{ marginTop: '1rem', lineHeight: '1.6' }}>
                    <h2>Target Code Generation: Deep Dive</h2>
                    <p>
                        Target code generation is the final phase of the compiler front-to-back pipeline. It takes an optimized intermediate representation (such as Three-Address Code) and maps it directly onto the hardware instruction set of the destination machine.
                    </p>
                    <h3>Core Sub-Tasks:</h3>
                    <ul>
                        <li><strong>Instruction Selection:</strong> Choosing the most efficient low-level hardware instructions (like <code>LOAD</code>, <code>ADD</code>, <code>MUL</code>, <code>STORE</code>) that match intermediate expressions.</li>
                        <li><strong>Register Allocation & Assignment:</strong> Managing the limited set of fast CPU registers (e.g., <code>R1</code>, <code>R2</code>) to hold active variables, reducing expensive round-trips to main memory.</li>
                        <li><strong>Instruction Scheduling:</strong> Ordering instructions to minimize CPU pipeline stalls and maximize execution throughput.</li>
                    </ul>
                </div>
            )}

            {/* QUIZ TAB */}
            {activeTab === 'quiz' && (
                <div style={{ marginTop: '1rem' }} className="quiz-panel">
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
                                <div className="quiz-feedback" style={{ marginTop: '1rem' }}>
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
                                        style={{ marginTop: '0.75rem' }}
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