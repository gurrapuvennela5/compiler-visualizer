import React, { useState } from "react";
import "./Phase4Intermediate.css";

const QUESTIONS = [
  { id: "intermediate-q1", question: "What does constant folding do?",
    options: ["Evaluates constant expressions at compile time", "Removes all variables", "Generates tokens", "Builds the AST"],
    answer: "Evaluates constant expressions at compile time", explanation: "It evaluates expressions whose operands are constants." },
  { id: "intermediate-q2", question: "What does TAC stand for?",
    options: ["Three-Address Code", "Token Analysis Code", "Type Assignment Compiler", "Temporary Array Collection"],
    answer: "Three-Address Code", explanation: "TAC breaks complex expressions into simple instructions." },
  { id: "intermediate-q3", question: "Why are temporary variables such as t1 used?",
    options: ["To store intermediate results", "To declare functions", "To store files", "To detect syntax errors"],
    answer: "To store intermediate results", explanation: "Temporaries hold intermediate expression results." },
  { id: "intermediate-q4", question: "What is constant propagation?",
    options: ["Replacing a variable with its known constant value", "Removing all operators", "Building an AST", "Generating tokens"],
    answer: "Replacing a variable with its known constant value", explanation: "Known values can replace variable uses when safe." },
  { id: "intermediate-q5", question: "What is returned when no optimization applies?",
    options: ["An empty optimizations array", "A random optimization", "A parser error", "No TAC"],
    answer: "An empty optimizations array", explanation: "Only actual transformations should be recorded." },
];

function CodePanel({ title, instructions, optimized }) {
  return <section className="p4-card">
    <h3>{title}</h3>
    {!instructions?.length ? <p className="p4-muted">No TAC available.</p> :
      <div className="p4-code">{instructions.map((item, i) => <div className="p4-code-line" key={`${i}-${item.instruction}`}>
        <span>{i + 1}</span><code className={optimized ? "p4-green-code" : ""}>{item.instruction}</code>
      </div>)}</div>}
  </section>;
}

export default function Phase4Intermediate({ compileResult }) {
  const [tab, setTab] = useState("Output");
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const result = compileResult || {};
  const errors = Array.isArray(result.errors) ? result.errors : [];
  const original = Array.isArray(result.tac) ? result.tac : [];
  const optimized = Array.isArray(result.optimized_tac) ? result.optimized_tac : [];
  const records = Array.isArray(result.optimizations) ? result.optimizations : [];
  const failed = result.status === "error" || errors.length > 0;
  const score = QUESTIONS.filter((q) => answers[q.id] === q.answer).length;

  return <main className="p4-page">
    <header className="p4-header">
      <div><span className="p4-eyebrow">PHASE 4</span>
        <h2>Intermediate Code &amp; Optimization</h2>
        <p>Generate Three-Address Code and optimize expressions where possible.</p></div>
      <span className={`p4-status ${failed ? "p4-error-status" : "p4-success-status"}`}>
        {failed ? "Compilation error" : result.status === "success" ? "Compilation successful" : "Waiting for compiler"}
      </span>
    </header>

    {failed && <div className="p4-error-box" role="alert">
      <strong>{errors[0]?.type || "compilation_error"}</strong>
      <p>{errors[0]?.message || "An earlier compilation phase failed."}</p>
      {errors[0]?.line != null && <small>Line {errors[0].line}{errors[0].column != null ? `, Column ${errors[0].column}` : ""}</small>}
    </div>}

    <nav className="p4-tabs">{["Output", "Visualization", "Learn", "Quiz"].map((name) =>
      <button type="button" key={name} className={tab === name ? "active" : ""} onClick={() => setTab(name)}>{name}</button>)}</nav>

    {tab === "Output" && <>
      <div className="p4-grid">
        <CodePanel title="Three-Address Code (TAC)" instructions={original} />
        <CodePanel title="Optimized TAC" instructions={optimized} optimized />
      </div>
      <section className="p4-card"><h3>Optimizations Applied</h3>
        {!records.length ? <p className="p4-muted">No optimizations were applied to this program.</p> :
          records.map((r, i) => <article className="p4-record" key={`${r.type}-${i}`}>
            <span className="p4-record-type">{r.type}</span>
            <p><b>Before:</b> <code>{r.before}</code></p>
            <p><b>After:</b> <code>{r.after}</code></p><p>{r.explanation}</p>
          </article>)}
      </section>
    </>}

    {tab === "Visualization" && <section className="p4-card">
      <h3>Before vs. After</h3><div className="p4-flow">
        <div className="p4-flow-node"><b>Original TAC</b><code>{original[0]?.instruction || "Waiting for TAC"}</code></div>
        <span>↓</span><div className="p4-flow-node p4-flow-optimized"><b>Optimized TAC</b><code>{optimized[0]?.instruction || "Waiting for optimized TAC"}</code></div>
      </div><p className="p4-muted">This view uses the instructions returned by the backend.</p>
    </section>}

    {tab === "Learn" && <section className="p4-card"><h3>How Phase 4 works</h3><ol className="p4-learn">
      <li><b>AST traversal</b><p>Visit expressions and statements from the parser.</p></li>
      <li><b>TAC generation</b><p>Break expressions into simple instructions with temporary variables.</p></li>
      <li><b>Optimization</b><p>Fold constants and propagate known values when safe.</p></li>
      <li><b>Comparison</b><p>Compare original TAC, optimized TAC, and transformation explanations.</p></li>
    </ol></section>}

    {tab === "Quiz" && <section className="p4-card"><h3>Phase 4 Quiz</h3>
      <p className="p4-muted">Answer all five questions.</p>
      {QUESTIONS.map((q, i) => <fieldset className="p4-question" key={q.id}><legend>{i + 1}. {q.question}</legend>
        {q.options.map((option) => <label className="p4-option" key={option}>
          <input type="radio" name={q.id} checked={answers[q.id] === option} disabled={submitted}
            onChange={() => setAnswers((old) => ({ ...old, [q.id]: option }))} />{option}
        </label>)}
        {submitted && <div className="p4-answer"><b>{answers[q.id] === q.answer ? "Correct" : `Correct answer: ${q.answer}`}</b><p>{q.explanation}</p></div>}
      </fieldset>)}
      {!submitted ? <button className="p4-primary" disabled={Object.keys(answers).length !== QUESTIONS.length} onClick={() => setSubmitted(true)}>Submit Quiz</button> :
        <div className="p4-score">Score: {score} / {QUESTIONS.length} <button className="p4-primary" onClick={() => { setAnswers({}); setSubmitted(false); }}>Retry Quiz</button></div>}
    </section>}

    <footer className="p4-footer">Compiler Visualizer · Phase 4</footer>
  </main>;
}
