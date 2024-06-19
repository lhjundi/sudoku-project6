import React, { useState, useEffect } from 'react';
import SudokuCell from './SudokuCell';
import './SudokuGrid.css';

const SudokuGrid = () => {
  const [grid, setGrid] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:3000/sudoku')
      .then(response => response.json())
      .then(data => setGrid(data));
  }, []);

  const handleChange = async (rowIndex, cellIndex, value) => {
    const colLetter = String.fromCharCode(65 + cellIndex); // Converte índice para letra da coluna
    const rowNumber = rowIndex + 1; // Adiciona 1 ao índice da linha para obter o número da linha

    const response = await fetch('http://localhost:3000/sudoku', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ colLetter, rowNumber, value })
    });

    if (response.ok) {
      const newGrid = await response.json();
      setGrid(newGrid);
    } else {
      alert(await response.text());
    }
  };

  return (
    <div className="sudoku-grid">
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
  );
};

export default SudokuGrid;
