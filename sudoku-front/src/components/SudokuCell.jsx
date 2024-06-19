import React from 'react';
import './SudokuCell.css';

const SudokuCell = ({ value, onChange }) => {
  const handleChange = (e) => {
    const newValue = e.target.value;
    // Permitir apenas números de 1 a 9 e valores vazios
    if (newValue === '' || (newValue >= 1 && newValue <= 9)) {
      onChange(newValue === '' ? null : parseInt(newValue, 10));
    }
  };

  return (
    <input
      type="text"
      className="sudoku-cell"
      value={value !== null ? value : ''}
      onChange={handleChange}
    />
  );
};

export default SudokuCell;
