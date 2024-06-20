const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { User, syncDatabase } = require('./models');

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.json());

// Sincroniza o banco de dados
syncDatabase();

// Chaves RSA
const privateKey = fs.readFileSync('./chaves/private.key', 'utf8');
const publicKey = fs.readFileSync('./chaves/public.key', 'utf8');

// Cadastro de usuários
app.post('/register', async (req, res) => {
    const { name, password } = req.body;
    try {
        const user = await User.create({ name, password });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

// Endpoint para login de usuários
app.post("/login", async (req, res) => {
    const { name, password } = req.body;
    try {
        const user = await User.findOne({ where: { name } });
        if (user && user.password === password) {
            const token = jwt.sign({ id: user.id, name: user.name }, privateKey, {
                algorithm: "RS256",
                expiresIn: "1h"
            });
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Usuário ou senha incorretos' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

function verificaJWT(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json({ autenticado: false, mensagem: "Token não fornecido" });
    }

    jwt.verify(token.split(' ')[1], publicKey, { algorithms: ["RS256"] }, (err, decoded) => {
        if (err) {
            return res.status(401).json({ autenticado: false, mensagem: "Token inválido" });
        }
        req.user = decoded;
        next();
    });
}
//Sudoku

let sudoku = [];
let errorCounter = 0;

setPredefined();

// Endpoint de Sudoku protegido
app.get('/sudoku', verificaJWT, (req, res) => {
    //console.log('GET /sudoku endpoint');
    //console.log('Sudoku data: ', sudoku);
    res.json({ sudoku, errorCounter });
});

app.post('/sudoku', verificaJWT, (req, res) => {
    //console.log('POST /sudoku endpoint')
    if (errorCounter >= 7) {
        return res.status(400).send('Game over! You have reached the maximum number of errors.');
    }

    const { colLetter, rowNumber, value } = req.body;

    const cellArray = getCell(`${colLetter}${rowNumber}`);
    const quadrant = getQuadrant(cellArray);

    if (quadrant === 0 || cellArray === false) {
        errorCounter++;
        return res.status(400).send('Célula ou quadrante inválido!');
    }

    const index = searchCell(colLetter, rowNumber);

    if (index !== false) {
        const removed = destroyCell(index);
        if (!removed) {
            errorCounter++;
            return res.status(400).send('Esta célula já foi atribuída e é pré-definida.');
        }
    }

    if (!verifyRules(colLetter, rowNumber, quadrant, value)) {
        errorCounter++;
        return res.status(400).send('Valor inválido ou regras não respeitadas!');
    }

    pushCellValue(colLetter, rowNumber, quadrant, value);
    res.json({ sudoku, errorCounter }); // Retorna o estado atualizado do tabuleiro e do contador
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

//Retorna um array onde a primeira posição é a letra e a segunda o número
function getCell(input) {
    let arrayInput = input.split("");
    if (arrayInput.length != 2) {
        return false;
    }
    arrayInput[1] = parseInt(arrayInput[1]);
    return arrayInput;
}

//indexOf() retorna -1 quando não encontra ou o índice no array
//quando encontra retorna o quadrante ao qual pertence esta célula
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

    //conditions
    let first = indexOfLetter;
    let second = indexOfRow;

    if (first >= 0 && first <= 2) {
        if (second >= 0 && second <= 2) {
            return 1;
        } else if (second >= 3 && second <= 5) {
            return 2;
        } else if (second >= 6 && second <= 8) {
            return 3;
        } else return 0;//não encontrou
    } else if (first >= 3 && first <= 5) {
        if (second >= 0 && second <= 2) {
            return 4;
        } else if (second >= 3 && second <= 5) {
            return 5;
        } else if (second >= 6 && second <= 8) {
            return 6;
        } else return 0;
    } else if (first >= 6 && first <= 8) {
        if (second >= 0 && second <= 2) {
            return 7;
        } else if (second >= 3 && second <= 5) {
            return 8;
        } else if (second >= 6 && second <= 8) {
            return 9;
        } else return 0;
    } else return 0; //não encontrou
}

//preenche o vetor de objetos sudoku com a entrada;
function pushCellValue(colLetter, rowNumber, quadNumber, inputValue) {
    sudoku.push({ letter: colLetter, number: rowNumber, quadrant: quadNumber, value: inputValue });
}

//Recebe como parâmetro a letra da coluna, o número da linha, número do quadrante
//e o valor candidato
//Retorna True todas as regras foram aceitas ou falso caso uma das regras forem violadas
function verifyRules(letter, number, quadrant, value) {
    let validRow = verifyRow(number, value);
    let validCol = verifyCol(letter, value);
    let validQuad = verifyQuad(quadrant, value);
    return validRow && validCol && validQuad;
}

//Recebe como argumentos o número da linha e o valor candidato a ser inserido
//Retorna "false" se o valor candidato já está na linha
//Retorna "true" se ainda não estiver na linha
function verifyRow(num, value) {
    let arrayOfInt = []; //guarda os valores encontrados na linha
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

//Recebe como argumentos o número da linha e o valor candidato a ser inserido
//Retorna "false" se o valor candidato já está na coluna
//Retorna "true" se ainda não estiver na coluna
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

//Recebe como argumentos o número do quadrante e o valor candidato a ser inserido
//Retorna "false" se o valor candidato já está no quadrante
//Retorna "true" se ainda não estiver no quadrante
function verifyQuad(quad, value) {
    let arrayOfInt = [];//guarda os valores encontrados na quadrante
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

//Busca pelo índice do array que apresenta a  um objeto com esta letra e o número
//retorna o índice, se não encontrar retorna false
function searchCell(colLetter, rowNumber) {
    for (let i = 0; i < sudoku.length; i++) {
        if (sudoku[i].letter === colLetter && sudoku[i].number === rowNumber) {
            return i;
        }
    }
    return false;
}

//Função que destrói uma célula, usada quando um novo valor é atribuído a uma célula já existente
//ou  quando uma célula válida é selecionada e um valor nulo é atribuído (deleção de valor no sudoku)
function destroyCell(index) {
    if (sudoku[index].predefined === 1) {
        //valor pré-definido, impossivel destruir
        return false;
    } else {
        sudoku.splice(index, 1);
        return true;
    }
}
