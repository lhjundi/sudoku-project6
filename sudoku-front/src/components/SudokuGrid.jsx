import React, { useState } from 'react';
import SudokuCell from './SudokuCell';
import './SudokuGrid.css';

const SudokuGrid = ({ sudoku, setSudoku, errors, setErrors }) => {
  const [gameOver, setGameOver] = useState(false);

  const handleChange = async (rowIndex, cellIndex, value) => {
    if (gameOver) {
      alert("Game over! You can't play anymore.");
      return;
    }

    const colLetter = String.fromCharCode(65 + cellIndex);
    const rowNumber = rowIndex + 1;

    const response = await fetch('http://localhost:8000/sudoku', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ colLetter, rowNumber, value })
    });

    if (response.ok) {
      const data = await response.json();
      setSudoku(data.sudoku);
      setErrors(data.errorCounter);
    } else {
      alert(await response.text());
      setErrors(prev => prev + 1);
      if (errors + 1 >= 7) {
        setGameOver(true);
      }
    }
  };

  return (
    <div className="sudoku-container">
      <div className="error-counter">Errors: {errors}/7</div>
      <div className={`sudoku-grid ${gameOver ? 'game-over' : ''}`}>
        {Array.from({ length: 9 }).map((_, rowIndex) => (
          <div key={rowIndex} className="sudoku-row">
            {Array.from({ length: 9 }).map((_, cellIndex) => {
              const cell = sudoku.find(c => c.letter === String.fromCharCode(65 + cellIndex) && c.number === rowIndex + 1);
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
