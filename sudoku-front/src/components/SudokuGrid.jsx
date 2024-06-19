import React, { useState } from 'react';
import SudokuCell from './SudokuCell';
import './SudokuGrid.css';

const initialGrid = [
  [5, 3, null, null, 7, null, null, null, null],
  [6, null, null, 1, 9, 5, null, null, null],
  [null, 9, 8, null, null, null, null, 6, null],
  [8, null, null, null, 6, null, null, null, 3],
  [4, null, null, 8, null, 3, null, null, 1],
  [7, null, null, null, 2, null, null, null, 6],
  [null, 6, null, null, null, null, 2, 8, null],
  [null, null, null, 4, 1, 9, null, null, 5],
  [null, null, null, null, 8, null, null, 7, 9],
];

const SudokuGrid = () => {
  const [grid, setGrid] = useState(initialGrid);

  const handleChange = (rowIndex, cellIndex, value) => {
    const newGrid = grid.map((row, rIdx) => 
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === cellIndex ? value : cell))
    );
    setGrid(newGrid);
  };

  return (
    <div className="sudoku-grid">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="sudoku-row">
          {row.map((cell, cellIndex) => (
            <SudokuCell
              key={cellIndex}
              value={cell}
              onChange={(value) => handleChange(rowIndex, cellIndex, value)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SudokuGrid;
