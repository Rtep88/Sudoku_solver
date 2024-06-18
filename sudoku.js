const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const sudokuElementArray = [];
const sudokuArray = [];
const sudokuValidOptions = [];

function validateInput(sender) {
    if (!numbers.includes(sender.value))
        sender.value = "";
}

function generateMap() {
    const sudokuGrid = document.getElementById('sudokuGrid');

    //Declaring sudoku arrays
    for (let i = 0; i < 9; i++) {
        sudokuElementArray[i] = [];
        sudokuArray[i] = [];
    }

    //Generating map
    for (let y1 = 0; y1 < 3; y1++) {
        for (let x1 = 0; x1 < 3; x1++) {
            const sudokuSubGrid = document.createElement('div');
            sudokuSubGrid.classList.add('sudokuSubGrid');
            for (let y2 = 0; y2 < 3; y2++) {
                for (let x2 = 0; x2 < 3; x2++) {
                    const sudokuInput = document.createElement('input');
                    sudokuInput.id = 'input' + '-x' + (x1 * 3 + x2) + '-y' + (y1 * 3 + y2);
                    sudokuInput.classList.add('sudokuInput');
                    sudokuInput.autocomplete = 'false';
                    sudokuInput.maxLength = '1';
                    sudokuInput.setAttribute("oninput", "validateInput(this)");
                    sudokuSubGrid.append(sudokuInput);
                    sudokuElementArray[x1 * 3 + x2][y1 * 3 + y2] = sudokuInput;
                }
            }
            sudokuGrid.append(sudokuSubGrid);
        }
    }
}

function shuffle(array) {
    let currentIndex = array.length;

    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

function addOptions(sudokuValidOptions) {
    for (let x = 0; x < 9; x++) {
        sudokuValidOptions[x] = [];
        for (let y = 0; y < 9; y++) {
            sudokuValidOptions[x][y] = [];
            for (let i = 1; i <= 9; i++)
                sudokuValidOptions[x][y].push(i);
            shuffle(sudokuValidOptions[x][y]);
        }
    }
}

function removeInvalidOptions(sudokuArray, sudokuValidOptions) {
    //Rows
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            if (sudokuArray[x][y] !== 0) {
                for (let i = 0; i < 9; i++) {
                    if (i === x)
                        continue;
                    sudokuValidOptions[i][y] = sudokuValidOptions[i][y].filter(item => item != sudokuArray[x][y]);
                }
            }
        }
    }

    //Columns
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            if (sudokuArray[x][y] !== 0) {
                for (let i = 0; i < 9; i++) {
                    if (i === y)
                        continue;
                    sudokuValidOptions[x][i] = sudokuValidOptions[x][i].filter(item => item != sudokuArray[x][y]);
                }
            }
        }
    }

    //Cubes
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            if (sudokuArray[x][y] !== 0) {
                for (let x2 = 0; x2 < 3; x2++) {
                    for (let y2 = 0; y2 < 3; y2++) {
                        if (Math.floor(x / 3) * 3 + x2 === x && Math.floor(y / 3) * 3 + y2 === y)
                            continue;
                        sudokuValidOptions[Math.floor(x / 3) * 3 + x2][Math.floor(y / 3) * 3 + y2] =
                            sudokuValidOptions[Math.floor(x / 3) * 3 + x2][Math.floor(y / 3) * 3 + y2].filter(item => item != sudokuArray[x][y]);
                    }
                }
            }
        }
    }
}

function tryToInsertNumber(sudokuArray, sudokuValidOptions) {
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            if (sudokuValidOptions[x][y].length === 1 && sudokuArray[x][y] === 0) {
                sudokuArray[x][y] = sudokuValidOptions[x][y][0];
                return true;
            }
        }
    }
    return false;
}

function checkIfSolved(sudokuArray) {
    return sudokuArray.every(column => column.every(cell => cell !== 0));
}

function checkSudokuIntegrity(sudokuArray, sudokuValidOptions) {
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            if ((sudokuArray[x][y] !== 0 && !sudokuValidOptions[x][y].includes(sudokuArray[x][y])) ||
                (sudokuArray[x][y] === 0 && sudokuValidOptions[x][y].length === 0))
                return false;
        }
    }
    return true;
}

function solveSudoku() {
    var startTime = performance.now()

    //Disabling solve button
    document.getElementById('solveButton').disabled = true;

    //Loading numbers into the memory
    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
            if (sudokuElementArray[x][y].value !== "") {
                sudokuElementArray[x][y].classList.remove('sudokuSolvedCell');
                sudokuArray[x][y] = parseInt(sudokuElementArray[x][y].value);
            }
            else
            {
                sudokuElementArray[x][y].classList.add('sudokuSolvedCell');
                sudokuArray[x][y] = 0;
            }
        }
    }
    addOptions(sudokuValidOptions);

    //Check sudoku integrity
    removeInvalidOptions(sudokuArray, sudokuValidOptions);
    if (!checkSudokuIntegrity(sudokuArray, sudokuValidOptions)) {
        alert("Sudoku is not valid!");
    }
    else {

        //Solving
        let result = recursivelySolveSudoku(sudokuArray, sudokuValidOptions);

        //Printing result
        if (result) {
            for (let y = 0; y < 9; y++) {
                for (let x = 0; x < 9; x++) {
                    sudokuElementArray[x][y].value = result[x][y] === 0 ? "" : result[x][y].toString();
                }
            }
        }
        else
            alert("Can't be solved");
    }

    //Enabling solve button
    document.getElementById('solveButton').disabled = false;

    var endTime = performance.now()

    document.getElementById('time').innerText = 'Solved in ' + (endTime - startTime) + 'ms';
}

function recursivelySolveSudoku(sudokuArray, sudokuValidOptions) {
    //Solve all that can be solved
    do {
        removeInvalidOptions(sudokuArray, sudokuValidOptions);
        if (!checkSudokuIntegrity(sudokuArray, sudokuValidOptions))
            return null;
    } while (tryToInsertNumber(sudokuArray, sudokuValidOptions));

    //Check if already solved
    if (checkIfSolved(sudokuArray))
        return sudokuArray;

    //Try all combinations
    let x, y;
    let found = false;
    for (y = 0; y < 9 && !found; y++) {
        for (x = 0; x < 9 && !found; x++) {
            if (sudokuValidOptions[x][y].length === 0 && sudokuArray[x][y] === 0)
                return null;
            else if (sudokuValidOptions[x][y].length !== 0 && sudokuArray[x][y] === 0) {
                found = true;
                break;
            }
        }
        if (found)
            break;
    }
    if (found) {
        for (let i = 0; i < sudokuValidOptions[x][y].length; i++) {
            let sudokuArrayCopy = sudokuArray.map(column => column.slice());
            let sudokuValidOptionsCopy = sudokuValidOptions.map(column => column.map(cell => cell.slice()));
            sudokuArrayCopy[x][y] = sudokuValidOptions[x][y][i];
            let result = recursivelySolveSudoku(sudokuArrayCopy, sudokuValidOptionsCopy);
            if (result)
                return result;
        }
    }

    //If solution was not found returns null
    return null;
}

generateMap();