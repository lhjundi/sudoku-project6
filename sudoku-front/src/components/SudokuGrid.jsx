import React, { useState, useEffect } from 'react';
import SudokuCell from './SudokuCell';
import './SudokuGrid.css';

const SudokuGrid = () => {
  const [grid, setGrid] = useState([]);
  const [errorCounter, setErrorCounter] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/sudoku')
      .then(response => response.json())
      .then(data => {
        setGrid(data.sudoku);
        setErrorCounter(data.errorCounter);
      });
  }, []);

  const handleChange = async (rowIndex, cellIndex, value) => {
    if (gameOver) {
      alert("Game over! You can't play anymore.");
      return;
    }

    const colLetter = String.fromCharCode(65 + cellIndex); // Converte índice para letra da coluna
    const rowNumber = rowIndex + 1; // Adiciona 1 ao índice da linha para obter o número da linha

    const response = await fetch('http://localhost:3000/sudoku', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ colLetter, rowNumber, value })
    });

    if (response.ok) {
      const data = await response.json();
      setGrid(data.sudoku);
      setErrorCounter(data.errorCounter);
    } else {
      alert(await response.text());
      setErrorCounter(prev => prev + 1);
      if (errorCounter + 1 >= 7) {
        setGameOver(true);
      }
    }
  };

  return (
    <div className="sudoku-container">
      <div className="error-counter">Errors: {errorCounter}/7</div>
      <div className={`sudoku-grid ${gameOver ? 'game-over' : ''}`}>
        {Array.from({ length: 9 }).map((_, rowIndex) => (
          <div key={rowIndex} className="sudoku-row">
            {Array.from({ length: 9 }).map((_, cellIndex) => {
              const cell = grid.find(c => c.letter === String.fromCharCode(65 + cellIndex) && c.number === rowIndex + 1);
              return (
                <SudokuCell
                  key={cellIndex}
                  value={cell ? cell.value : ''}
                  onChange={(value) => handleChange(rowIndex, cellIndex, value)}
                />
              );
            })}
          </div>
        ))}
      </div>
      {gameOver && <div className="game-over-message">Game Over!</div>}
    </div>
  );
};

export default SudokuGrid;
