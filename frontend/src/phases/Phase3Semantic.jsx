import { useState } from 'react';
import './Phase3Semantic.css';

function Phase3Semantic({ result = null }) {
    const [activeTab, setActiveTab] = useState('output');

    const symbolTable = result?.symbol_table ?? [];
    const errors = result?.errors ?? [];
    const hasResult = result !== null;
    const hasErrors = errors.length > 0;

    return (
        <section className="semantic-panel">
            <div className="semantic-header">
                <div>
                    <span className="semantic-eyebrow">
                        PHASE 03 / SEMANTIC ANALYSIS
                    </span>
                    <h2>Semantic Analyzer</h2>
                    <p>
                        Check variable declarations, type compatibility,
                        and identifier usage.
                    </p>
                </div>

                <span
                    className={`semantic-status ${
                        !hasResult
                            ? 'status-idle'
                            : hasErrors
                              ? 'status-error'
                              : 'status-success'
                    }`}
                >
                    {!hasResult
                        ? 'Awaiting results'
                        : hasErrors
                          ? 'Errors detected'
                          : 'Analysis passed'}
                </span>
            </div>

            <div className="semantic-tabs">
                <button
                    className={activeTab === 'output' ? 'active' : ''}
                    onClick={() => setActiveTab('output')}
                >
                    Symbol Table
                </button>

                <button
                    className={activeTab === 'errors' ? 'active' : ''}
                    onClick={() => setActiveTab('errors')}
                >
                    Errors
                    <span className="semantic-count">{errors.length}</span>
                </button>

                <button
                    className={activeTab === 'learn' ? 'active' : ''}
                    onClick={() => setActiveTab('learn')}
                >
                    Learn
                </button>
            </div>

            <div className="semantic-content">
                {activeTab === 'output' && (
                    <>
                        <div className="semantic-summary">
                            <div className="semantic-stat">
                                <span>Declared variables</span>
                                <strong>{symbolTable.length}</strong>
                            </div>

                            <div className="semantic-stat">
                                <span>Initialized</span>
                                <strong>
                                    {
                                        symbolTable.filter(
                                            (symbol) => symbol.initialized
                                        ).length
                                    }
                                </strong>
                            </div>

                            <div className="semantic-stat">
                                <span>Semantic errors</span>
                                <strong>{errors.length}</strong>
                            </div>
                        </div>

                        {!hasResult ? (
                            <div className="semantic-empty">
                                <span className="semantic-empty-icon">▦</span>
                                <h3>Your symbol table will appear here</h3>
                                <p>
                                    Select Semantic Analysis and compile your
                                    program once backend integration is ready.
                                </p>
                            </div>
                        ) : symbolTable.length === 0 ? (
                            <div className="semantic-empty">
                                <h3>No variables declared</h3>
                                <p>
                                    The analyzer did not produce any symbol
                                    table entries for this program.
                                </p>
                            </div>
                        ) : (
                            <div className="semantic-table-wrapper">
                                <table className="semantic-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Type</th>
                                            <th>Scope</th>
                                            <th>Line</th>
                                            <th>Initialized</th>
                                            <th>Value</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {symbolTable.map((symbol, index) => (
                                            <tr
                                                key={`${symbol.name}-${index}`}
                                            >
                                                <td>
                                                    <code>{symbol.name}</code>
                                                </td>
                                                <td>
                                                    <span className="semantic-type">
                                                        {symbol.type}
                                                    </span>
                                                </td>
                                                <td>{symbol.scope ?? 'global'}</td>
                                                <td>
                                                    {symbol.line_declared ?? '—'}
                                                </td>
                                                <td>
                                                    <span
                                                        className={
                                                            symbol.initialized
                                                                ? 'semantic-bool yes'
                                                                : 'semantic-bool no'
                                                        }
                                                    >
                                                        {symbol.initialized
                                                            ? 'Yes'
                                                            : 'No'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {symbol.value == null
                                                        ? '—'
                                                        : String(symbol.value)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'errors' && (
                    <div className="semantic-errors">
                        {!hasResult ? (
                            <div className="semantic-empty">
                                <h3>Errors will appear here</h3>
                                <p>
                                    Compile a program to see semantic
                                    diagnostics from the analyzer.
                                </p>
                            </div>
                        ) : errors.length === 0 ? (
                            <div className="semantic-empty">
                                <span className="semantic-empty-icon">✓</span>
                                <h3>No semantic errors</h3>
                                <p>
                                    The analyzer returned no semantic errors.
                                </p>
                            </div>
                        ) : (
                            errors.map((error, index) => (
                                <article
                                    className="semantic-error-card"
                                    key={`${error.type}-${index}`}
                                >
                                    <div className="semantic-error-top">
                                        <strong>{error.type}</strong>
                                        <span>
                                            {error.line == null
                                                ? 'Location unavailable'
                                                : `Line ${error.line}${
                                                      error.column == null
                                                          ? ''
                                                          : `, Column ${error.column}`
                                                  }`}
                                        </span>
                                    </div>

                                    <p>{error.message}</p>
                                    <small>
                                        Phase: {error.phase ?? 'semantic'}
                                    </small>
                                </article>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'learn' && (
                    <div className="semantic-learning">
                        <article>
                            <span>01</span>
                            <div>
                                <h3>Symbol table</h3>
                                <p>
                                    Stores information about declared
                                    variables, including their names, types,
                                    scope, initialization status, and known
                                    values.
                                </p>
                            </div>
                        </article>

                        <article>
                            <span>02</span>
                            <div>
                                <h3>Undeclared variables</h3>
                                <p>
                                    A variable must be declared before it can
                                    be referenced in an expression.
                                </p>
                            </div>
                        </article>

                        <article>
                            <span>03</span>
                            <div>
                                <h3>Type compatibility</h3>
                                <p>
                                    The analyzer checks whether expressions
                                    are compatible with the declared variable
                                    type.
                                </p>
                            </div>
                        </article>

                        <article>
                            <span>04</span>
                            <div>
                                <h3>Initialization</h3>
                                <p>
                                    The symbol table tracks whether a variable
                                    has been initialized. This is separate
                                    from whether its value is known at compile
                                    time.
                                </p>
                            </div>
                        </article>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Phase3Semantic;
