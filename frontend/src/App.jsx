import { useState } from 'react';
import PlaygroundPage from './PlaygroundPage.jsx';
import './App.css';
import compilerLearning from './assets/compilerLearning.png';

function App() {
   const [currentPage, setCurrentPage] = useState('home');

  if (currentPage === 'playground') {
    return (
      <PlaygroundPage
        onHome={() => setCurrentPage('home')}
      />
    );
  }
  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#">
          <span className="brand-icon">&lt;/&gt;</span>
          <span>Compiler <span className="brand-green">Visualizer</span></span>
        </a>

        <nav className="nav-links">
          <a className="active" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}>
            Home
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('playground'); }}>
            Playground
          </a>
          <a href="#about">About</a>
        </nav>

        <a
  className="nav-button"
  href="#playground"
  onClick={(e) => {
    e.preventDefault();
    setCurrentPage('playground');
    window.scrollTo(0, 0);
  }}
>Get Started
</a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">Learn <span>•</span> Visualize <span>•</span> Practice</p>

            <h1>
              Turn Code into
              <span className="gradient-text"> Understanding.</span>
            </h1>

            <p className="hero-description">
              Explore how source code transforms through a compiler
              with interactive visualizations, simple explanations
              and hands-on practice.
            </p>

            <a
  className="primary-button"
  href="#playground"
  onClick={(e) => {
    e.preventDefault();
    setCurrentPage('playground');
    window.scrollTo(0, 0);
  }}
>
  Start Exploring 
</a>
          </div>

         
<div className="hero-visual">
  <img
    src={compilerLearning}
    alt="A student learning compiler concepts through a friendly visual guide"
    className="compiler-learning-image"
  />
</div>

        </section>

        <section className="features" id="about">
          <article className="feature-card">
            <div className="feature-icon blue-icon">▤</div>
            <div>
              <h2>Learn</h2>
              <p>Understand key compiler concepts with simple explanations.</p>
              <a href="#playground">Learn more →</a>
            </div>
          </article>

          <article className="feature-card">
            <div className="feature-icon green-icon">◎</div>
            <div>
              <h2>Visualize</h2>
              <p>See how your code is transformed at each stage.</p>
              <a href="#playground">Explore →</a>
            </div>
          </article>

          <article className="feature-card">
            <div className="feature-icon blue-icon">▥</div>
            <div>
              <h2>Practice</h2>
              <p>Reinforce your knowledge with examples and quizzes.</p>
              <a href="#quiz">Start practicing →</a>
            </div>
          </article>
        </section>

        <section className="closing-banner" id="quiz">
          <div className="quote">
            <span className="quote-mark">“</span>
            <h2>Code is not just written.<br />
              <span>It is transformed.</span>
            </h2>
            <p>Learn the process. Visualize the flow. Practice with confidence.</p>
          </div>

          <div className="quiz-callout">
            <div className="trophy">🏆</div>
            <div>
              <h3>Ready to test yourself?</h3>
              <p>Challenge your understanding with interactive quizzes.</p>
              <a className="secondary-button" href="#playground">
                Take a Quiz →
              </a>
            </div>
          </div>
        </section>

      </main>

      <footer className="footer">
        <span> &lt;/&gt; Compiler Visualizer</span>
        <span>Learn · Visualize · Practice</span>
      </footer>
    </div>
  );
}

export default App;
