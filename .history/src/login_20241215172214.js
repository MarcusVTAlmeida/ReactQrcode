import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Alterado de useHistory para useNavigate
import { auth } from './firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Substituindo history por navigate

  useEffect(() => {
    // Verifica o estado de autenticação ao carregar o componente
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Redireciona para a página 'Home' se o usuário estiver logado
        navigate('/home');
      }
    });

    return unsubscribe; // Desinscreve a verificação ao desmontar o componente
  }, [navigate]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Login realizado com sucesso!');
      navigate('/home'); // Navegar para a página 'Home' após login bem-sucedido
    } catch (error) {
      alert('Erro no Login: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Login</h2>
      <div style={{ marginBottom: '10px' }}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite seu email"
          style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Digite sua senha"
          style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
        />
      </div>
      <button onClick={handleLogin} style={{ padding: '10px', width: '100%' }}>
        Login
      </button>
      <div style={{ marginTop: '10px' }}>
        <button
          onClick={() => navigate('/register')}
          style={{ padding: '10px', width: '100%' }}
        >
          Não tem uma conta? Cadastre-se
        </button>
      </div>
    </div>
  );
}
