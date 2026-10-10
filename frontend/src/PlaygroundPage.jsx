
import { useState } from 'react';
import './PlaygroundPage.css';

const phases = [
    { id: 'lexer', number: '01', label: 'Lexical Analysis', short: 'Tokens', icon: '▤' },
    { id: 'parser', number: '02', label: 'Syntax Analysis / AST', short: 'AST', icon: '⑂' },
    { id: 'semantic', number: '03', label: 'Semantic Analysis', short: 'Symbol Table', icon: '▦' },
    { id: 'intermediate', number: '04', label: 'Intermediate Code & Optimization', short: 'TAC', icon: '</>' },
];

const initialCode = `int a = 10;
int b = 20;
int c = a + b * 2;`;

function PlaygroundPage({ onHome }) {
    const [activePhase, setActivePhase] = useState('lexer');
    const [activeTab, setActiveTab] = useState('output');
    const [language, setLanguage] = useState('c');
    const [sourceCode, setSourceCode] = useState(initialCode);
    const [showQuiz, setShowQuiz] = useState(false);


    const phase = phases.find((item) => item.id === activePhase);

    function handleCompile() {
        // Backend integration will replace this placeholder.
        setHasCompiled(true);
        setShowQuiz(false);
        setActiveTab('output');
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
                        onClick={() => setShowQuiz(true)}
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

                                <button className="compile-button" onClick={handleCompile}>
                                    ▶ Compile
                                </button>
                            </div>
                        )}
                    </section>

                    {!showQuiz && (
                        <section className="phase-workspace-empty" />
                    )}


                </main>
            </div>
        </div>
    );
}

export default PlaygroundPage;
