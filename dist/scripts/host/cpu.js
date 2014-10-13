///<reference path="../globals.ts" />
/* ------------
CPU.ts
Requires global.ts.
Routines for the host CPU simulation, NOT for the OS itself.
In this manner, it's A LITTLE BIT like a hypervisor,
in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
TypeScript/JavaScript in both the host and client environments.
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (typeof PC === "undefined") { PC = 0; }
            if (typeof Acc === "undefined") { Acc = 0; }
            if (typeof Xreg === "undefined") { Xreg = 0; }
            if (typeof Yreg === "undefined") { Yreg = 0; }
            if (typeof Zflag === "undefined") { Zflag = 0; }
            if (typeof isExecuting === "undefined") { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };

        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
        };

        Cpu.prototype.executeProgram = function (memDivision, id) {
            _ProcState = "ready";
            TSOS.Control.displayPCB(id, "0", 1);
            var instruction = _Memory[memDivision][0][0];
            var row = 0;
            var col = 0;
            var nextRow = 0;
            var nextCol = 1;
            _ProcState = "running";
            while (instruction !== "00") {
                // Determine Instruction
                if (instruction === "A9") {
                    // Retrieves constant.
                    col++;
                    if (col >= 16) {
                        row++;
                        col = 0;
                    }
                    var con = _Memory[memDivision][row][col];

                    // Put constant in ACC. Updates PC.
                    _CPU.Acc = con;
                    _CPU.PC = col + 1;
                } else if (instruction === "AD") {
                    // Retrieves memory address
                    col++;
                    if (col >= 16) {
                        row++;
                        col = 0;
                    }
                    var addr = _Memory[memDivision][row][col];
                    col++; // increment col to bypass most significant bits.

                    // they are made irrelevant by 3d array and memDivision.
                    if (col >= 16) {
                        row++;
                        col = 0;
                    }

                    // Convert memory address to decimal for array use
                    var tempRow = this.hexToDec(addr.charAt(0));
                    var tempCol = this.hexToDec(addr.charAt(1));

                    // Put value in ACC. Updates PC.
                    this.Acc = _Memory[memDivision][tempRow][tempCol];
                    this.PC = col + 1;
                } else if (instruction === "8D") {
                    // Retrieves memory address
                    col++;
                    if (col >= 16) {
                        row++;
                        col = 0;
                    }
                    var addr = _Memory[memDivision][row][col];
                    col++; // increment col to bypass most significant bits.

                    // they are made irrelevant by 3d array and memDivision.
                    if (col >= 16) {
                        row++;
                        col = 0;
                    }

                    // Convert memory address to decimal for array use
                    var tempRow = this.hexToDec(addr.charAt(0));
                    var tempCol = this.hexToDec(addr.charAt(1));

                    // Put ACC in memory. Updates PC.
                    _Memory[memDivision][tempRow][tempCol] = this.Acc;
                    this.PC = col + 1;

                    // Update UI.
                    tempRow = tempRow * 2;
                    if (tempCol > 7) {
                        tempCol = tempCol - 8;
                        tempRow++;
                    }
                    memory[tempRow][tempCol] = this.Acc;
                    TSOS.Control.fillMemory();
                } else if (instruction === "6D") {
                } else if (instruction === "A2") {
                    // Retrieves constant.
                    col++;
                    if (col >= 16) {
                        row++;
                        col = 0;
                    }
                    var con = _Memory[memDivision][row][col];

                    // Put constant in X register. Updates PC.
                    this.Xreg = con;
                    this.PC = col + 1;
                } else if (instruction === "AE") {
                    // Retrieves memory address
                    col++;
                    if (col >= 16) {
                        row++;
                        col = 0;
                    }
                    var addr = _Memory[memDivision][row][col];
                    col++; // increment col to bypass most significant bits.

                    // they are made irrelevant by 3d array and memDivision.
                    if (col >= 16) {
                        row++;
                        col = 0;
                    }

                    // Convert memory address to decimal for array use
                    var tempRow = this.hexToDec(addr.charAt(0));
                    var tempCol = this.hexToDec(addr.charAt(1));

                    // Put value in X register. Updates PC.
                    this.Xreg = _Memory[memDivision][tempRow][tempCol];
                    this.PC = col + 1;
                } else if (instruction === "A0") {
                    // Retrieves constant.
                    col++;
                    if (col >= 16) {
                        row++;
                        col = 0;
                    }
                    var con = _Memory[memDivision][row][col];

                    // Put constant in Y register. Updates PC.
                    this.Yreg = con;
                    this.PC = col + 1;
                } else if (instruction === "AC") {
                    // Retrieves memory address
                    col++;
                    if (col >= 16) {
                        row++;
                        col = 0;
                    }
                    var addr = _Memory[memDivision][row][col];
                    col++; // increment col to bypass most significant bits.

                    // they are made irrelevant by 3d array and memDivision.
                    if (col >= 16) {
                        row++;
                        col = 0;
                    }

                    // Convert memory address to decimal for array use
                    var tempRow = this.hexToDec(addr.charAt(0));
                    var tempCol = this.hexToDec(addr.charAt(1));

                    // Put value in Y register. Updates PC.
                    this.Yreg = _Memory[memDivision][tempRow][tempCol];
                    this.PC = col + 1;
                } else if (instruction === "EA") {
                    // Updates PC.
                    this.PC = col + 1;
                } else if (instruction === "00") {
                } else if (instruction === "EC") {
                    // Retrieves memory address
                    col++;
                    if (col >= 16) {
                        row++;
                        col = 0;
                    }
                    var addr = _Memory[memDivision][row][col];
                    col++; // increment col to bypass most significant bits.

                    // they are made irrelevant by 3d array and memDivision.
                    if (col >= 16) {
                        row++;
                        col = 0;
                    }

                    // Convert memory address to decimal for array use
                    var tempRow = this.hexToDec(addr.charAt(0));
                    var tempCol = this.hexToDec(addr.charAt(1));

                    // Compare byte in memory to value in X register
                    if (this.Xreg === _Memory[memDivision][tempRow][tempCol]) {
                        this.Zflag = 1;
                    } else {
                        this.Zflag = 0;
                    }

                    // Updates PC.
                    this.PC = col + 1;
                } else if (instruction === "D0") {
                    col++;

                    if (this.Zflag = 0) {
                        // Branch X bytes
                    }

                    // Updates PC.
                    this.PC = col + 1;
                } else if (instruction === "EE") {
                } else if (instruction === "FF") {
                } else {
                }

                // increment col and row
                col++;
                nextCol++;
                if (col >= 16) {
                    row++;
                    col = 0;
                } else if (nextCol === 16) {
                    nextRow++;
                    nextCol = 0;
                }

                // Updates PCB
                TSOS.Control.displayPCB(id, instruction, 1);

                instruction = _Memory[memDivision][row][col]; // Next instruction
            }
        };

        // function used by executeProgram() to convert hex digits to decimal
        Cpu.prototype.hexToDec = function (num) {
            if (num === "A") {
                return 10;
            } else if (num === "B") {
                return 11;
            } else if (num === "C") {
                return 12;
            } else if (num === "D") {
                return 13;
            } else if (num === "E") {
                return 14;
            } else if (num === "F") {
                return 15;
            } else {
                return +num;
            }
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
