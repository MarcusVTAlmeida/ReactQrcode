import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './home';
import Login from './login';
import  from './login';

function App() {
  return (
    <Router>
      <div>
        <h1>React Navigation</h1>
        {/* Links de navegação */}
        <nav>
          <a href="/Home">Home</a> 
        </nav>
        {/* Configuração de Rotas */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Home" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
