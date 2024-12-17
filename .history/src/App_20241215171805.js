import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './home';
import Login from './login';

function App() {
  return (
    <Router>
      <div>
        <h1>React Navigation</h1>
        {/* Links de navegação */}
        <nav>
          <a href="/">Home</a> 
        </nav>
        {/* Configuração de Rotas */}
        <Routes>
          <Route path="/" element={<Home />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
