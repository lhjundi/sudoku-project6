const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let sudoku = [];

setPredefined();

app.get('/sudoku', (req, res) => {
    res.json(sudoku);
});

app.post('/sudoku', (req, res) => {
    const { colLetter, rowNumber, value } = req.body;

    const cellArray = getCell(`${colLetter}${rowNumber}`);
    const quadrant = getQuadrant(cellArray);

    if (quadrant === 0 || cellArray === false) {
        return res.status(400).send('Célula ou quadrante inválido!');
    }

    const index = searchCell(colLetter, rowNumber);

    if (index !== false) {
        const removed = destroyCell(index);
        if (!removed) {
            return res.status(400).send('Esta célula já foi atribuída e é pré-definida.');
        }
    }

    if (!verifyRules(colLetter, rowNumber, quadrant, value)) {
        return res.status(400).send('Valor inválido ou regras não respeitadas!');
    }

    pushCellValue(colLetter, rowNumber, quadrant, value);
    res.send('Valor adicionado com sucesso!');
});

app.listen(port, () => {
    console.log(`Sudoku server listening at http://localhost:${port}`);
});

function setPredefined() {
    sudoku.push(
        { letter: "A", number: 1, quadrant: 1, value: 7, predefined: 1 },
        { letter: "A", number: 4, quadrant: 2, value: 4, predefined: 1 },
        { letter: "A", number: 5, quadrant: 2, value: 2, predefined: 1 },
        { letter: "A", number: 6, quadrant: 2, value: 8, predefined: 1 },
        { letter: "B", number: 1, quadrant: 1, value: 4, predefined: 1 },
        { letter: "B", number: 2, quadrant: 1, value: 9, predefined: 1 },
        { letter: "B", number: 5, quadrant: 2, value: 1, predefined: 1 },
        { letter: "B", number: 8, quadrant: 2, value: 7, predefined: 1 },
    );
}

function getCell(input) {
    let arrayInput = input.split("");
    if (arrayInput.length != 2) {
        return false;
    }
    arrayInput[1] = parseInt(arrayInput[1]);
    return arrayInput;
}

function getQuadrant(cellArray) {
    const lettersOfCol = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
    const numbersOfRow = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    let letra = cellArray[0];
    let numero = cellArray[1];

    let indexOfLetter = lettersOfCol.indexOf(letra);
    let indexOfRow = numbersOfRow.indexOf(numero);

    if (indexOfLetter == -1 || indexOfRow == -1) {
        return 0;
    }

    if (indexOfLetter <= 2) {
        if (indexOfRow <= 2) return 1;
        if (indexOfRow <= 5) return 2;
        return 3;
    } else if (indexOfLetter <= 5) {
        if (indexOfRow <= 2) return 4;
        if (indexOfRow <= 5) return 5;
        return 6;
    } else {
        if (indexOfRow <= 2) return 7;
        if (indexOfRow <= 5) return 8;
        return 9;
    }
}

function pushCellValue(colLetter, rowNumber, quadNumber, inputValue) {
    sudoku.push({ letter: colLetter, number: rowNumber, quadrant: quadNumber, value: inputValue });
}

function verifyRules(letter, number, quadrant, value) {
    let validRow = verifyRow(number, value);
    let validCol = verifyCol(letter, value);
    let validQuad = verifyQuad(quadrant, value);
    return validRow && validCol && validQuad;
}

function verifyRow(num, value) {
    let arrayOfInt = [];
    for (let i = 0; i < sudoku.length; i++) {
        if (sudoku[i].number === num) {
            arrayOfInt.push(sudoku[i].value);
            if (arrayOfInt.includes(value)) {
                return false;
            }
        }
    }
    return true;
}

function verifyCol(char, value) {
    let arrayOfInt = [];
    for (let i = 0; i < sudoku.length; i++) {
        if (sudoku[i].letter === char) {
            arrayOfInt.push(sudoku[i].value);
            if (arrayOfInt.includes(value)) {
                return false;
            }
        }
    }
    return true;
}

function verifyQuad(quad, value) {
    let arrayOfInt = [];
    for (let i = 0; i < sudoku.length; i++) {
        if (sudoku[i].quadrant === quad) {
            arrayOfInt.push(sudoku[i].value);
            if (arrayOfInt.includes(value)) {
                return false;
            }
        }
    }
    return true;
}

function searchCell(colLetter, rowNumber) {
    for (let i = 0; i < sudoku.length; i++) {
        if (sudoku[i].letter === colLetter && sudoku[i].number === rowNumber) {
            return i;
        }
    }
    return false;
}

function destroyCell(index) {
    if (sudoku[index].predefined === 1) {
        return false;
    } else {
        sudoku.splice(index, 1);
        return true;
    }
}
