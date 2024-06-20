import React, { useState } from 'react';
import SudokuGrid from './components/SudokuGrid';

function App() {
  const [token, setToken] = useState('');
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState(0);
  const [sudoku, setSudoku] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function register() {
    const response = await fetch('http://localhost:8000/register', {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ name: nome, password: senha }),
    });

    if (response.ok) {
      alert('Usuário registrado com sucesso!');
    } else {
      alert('Erro ao registrar usuário');
    }
  }

  async function login() {
    const response = await fetch('http://localhost:8000/login', {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ name: nome, password: senha }),
    });

    if (response.ok) {
      const data = await response.json();
      setToken(data.token);
      localStorage.setItem('token', data.token);
      setIsAuthenticated(true);
    } else {
      alert('Usuário ou senha incorretos');
    }
  }

  async function carregarSudoku() {
    const response = await fetch('http://localhost:8000/sudoku', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });

    if (response.ok) {
      const data = await response.json();
      setSudoku(data.sudoku);
      setErrors(data.errorCounter);
    } else {
      alert(data.mensagem);
    }
  }

  return (
    <div className="App">
      {!isAuthenticated ? (
        <div>
          <h3>Cadastro e Login</h3>
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <br/>
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          /><br /><br />
          <button onClick={register}>Registrar</button>
          <br /><br />
          <button onClick={login}>Login</button>
        </div>
      ) : (
        <div>
          <h3>Sudoku</h3>
          <button onClick={carregarSudoku}>Carregar Sudoku</button>
          <SudokuGrid sudoku={sudoku} setSudoku={setSudoku} errors={errors} setErrors={setErrors} />
        </div>
      )}
    </div>
  );
}

export default App;
