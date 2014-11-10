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
            if (typeof Acc === "undefined") { Acc = "0"; }
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
            this.Acc = "0";
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };

        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');

            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            var instruction = _Memory[memDivision][_row][_col];

            // Determine Instruction
            if (instruction === "A9") {
                // Retrieves constant.
                _col++;
                if (_col >= 16) {
                    _row++;
                    _col = 0;
                }
                var con = _Memory[memDivision][_row][_col];

                // Put constant in ACC. Updates PC.
                _CPU.Acc = con;
                _CPU.PC = _col + 1;
            } else if (instruction === "AD") {
                // Retrieves memory address
                _col++;
                if (_col >= 16) {
                    _row++;
                    _col = 0;
                }
                var addr = _Memory[memDivision][_row][_col];
                _col++; // increment _col to bypass most significant bits.

                // they are made irrelevant by 3d array and memDivision.
                if (_col >= 16) {
                    _row++;
                    _col = 0;
                }

                // Convert memory address to decimal for array use
                var tempRow = this.hexToDec(addr.charAt(0));
                var tempCol = this.hexToDec(addr.charAt(1));

                // Put value in ACC. Updates PC.
                this.Acc = _Memory[memDivision][tempRow][tempCol];
                this.PC = _col + 1;
            } else if (instruction === "8D") {
                // Retrieves memory address
                _col++;
                if (_col >= 16) {
                    _row++;
                    _col = 0;
                }
                var addr = _Memory[memDivision][_row][_col];
                _col++; // increment col to bypass most significant bits.

                // they are made irrelevant by 3d array and memDivision.
                if (_col >= 16) {
                    _row++;
                    _col = 0;
                }

                // Convert memory address to decimal for array use
                var tempRow = this.hexToDec(addr.charAt(0));
                var tempCol = this.hexToDec(addr.charAt(1));

                // Put ACC in memory. Updates PC.
                _Memory[memDivision][tempRow][tempCol] = this.Acc;
                this.PC = _col + 1;

                // Update UI.
                tempRow = tempRow * 2;
                if (tempCol > 7) {
                    tempCol = tempCol - 8;
                    tempRow++;
                }
                memory[tempRow][tempCol] = this.Acc;
                TSOS.Control.fillMemory();
            } else if (instruction === "6D") {
                // Get address
                _col++;
                if (_col >= 16) {
                    _row++;
                    _col = 0;
                }
                var addr = _Memory[memDivision][_row][_col];
                _col++; // increment col to bypass most significant bits.

                // they are made irrelevant by 3d array and memDivision.
                if (_col >= 16) {
                    _row++;
                    _col = 0;
                }

                // Convert memory address to decimal for array use
                var tempRow = this.hexToDec(addr.charAt(0));
                var tempCol = this.hexToDec(addr.charAt(1));

                var a = _Memory[memDivision][tempRow][tempCol];

                // Retrieve constant from ACC and convert to deimal for addition.
                var b = this.hexToDec(this.Acc);

                // Add a and b.
                var sum = +a + b;

                // Convert to hex and store in ACC. Updates PC.
                var c = +(sum % 16);
                var r = Math.round(+(sum / 16));

                this.Acc = this.decToHex(r) + this.decToHex(c);
                this.PC = _col + 1;
            } else if (instruction === "A2") {
                // Retrieves constant.
                _col++;
                if (_col >= 16) {
                    _row++;
                    _col = 0;
                }
                var con = _Memory[memDivision][_row][_col];

                // Put constant in X register. Updates PC.
                this.Xreg = con;
                this.PC = _col + 1;
            } else if (instruction === "AE") {
                // Retrieves memory address
                _col++;
                if (_col >= 16) {
                    _row++;
                    _col = 0;
                }
                var addr = _Memory[memDivision][_row][_col];
                _col++; // increment col to bypass most significant bits.

                // they are made irrelevant by 3d array and memDivision.
                if (_col >= 16) {
                    _row++;
                    _col = 0;
                }

                // Convert memory address to decimal for array use
                var tempRow = this.hexToDec(addr.charAt(0));
                var tempCol = this.hexToDec(addr.charAt(1));

                // Put value in X register. Updates PC.
                this.Xreg = _Memory[memDivision][tempRow][tempCol];
                this.PC = _col + 1;
            } else if (instruction === "A0") {
                // Retrieves constant.
                _col++;
                if (_col >= 16) {
                    _row++;
                    _col = 0;
                }
                var con = _Memory[memDivision][_row][_col];

                // Put constant in Y register. Updates PC.
                this.Yreg = con;
                this.PC = _col + 1;
            } else if (instruction === "AC") {
                // Retrieves memory address
                _col++;
                if (_col >= 16) {
                    _row++;
                    _col = 0;
                }
                var addr = _Memory[memDivision][_row][_col];
                _col++; // increment col to bypass most significant bits.

                // they are made irrelevant by 3d array and memDivision.
                if (_col >= 16) {
                    _row++;
                    _col = 0;
                }

                // Convert memory address to decimal for array use
                var tempRow = this.hexToDec(addr.charAt(0));
                var tempCol = this.hexToDec(addr.charAt(1));

                // Put value in Y register. Updates PC.
                this.Yreg = _Memory[memDivision][tempRow][tempCol];
                this.PC = _col + 1;
            } else if (instruction === "EA") {
                // Updates PC.
                this.PC = _col + 1;
            } else if (instruction === "00") {
                // Breaks at "00"
                // Removes id from _Actives
                _Actives.splice(_Actives.indexOf(_id), 1);

                // Sets remainingUnits and currUnits to 0. Allows proper context switch.
                _Scheduler.remainingUnits = 1;
                _Scheduler.currUnits = 1;

                // Updates PCB
                _PCB.updateForId(_id, instruction, _CPU.PC, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag, _ProcState);
                TSOS.Control.displayPCB(_id, instruction, 1);
                _ProcState = "terminated";
                _PCB.updateForId(_id, instruction, _CPU.PC, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag, _ProcState);
                TSOS.Control.displayPCB(_id, instruction, 1);

                if (_Scheduler.readyQueue.getSize() > 0) {
                } else {
                    this.isExecuting = false;
                }
            } else if (instruction === "EC") {
                // Retrieves memory address
                _col++;
                if (_col >= 16) {
                    _row++;
                    _col = 0;
                }
                var addr = _Memory[memDivision][_row][_col];
                _col++; // increment col to bypass most significant bits.

                // they are made irrelevant by 3d array and memDivision.
                if (_col >= 16) {
                    _row++;
                    _col = 0;
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
                this.PC = _col + 1;
            } else if (instruction === "D0") {
                // Determine how many bytes to branch.
                _col++;
                if (_col >= 16) {
                    _row++;
                    _col = 0;
                }

                if (this.Zflag === 0) {
                    // Branch X bytes
                    var bran = _Memory[memDivision][_row][_col];
                    var branR = this.hexToDec(bran.charAt(0));
                    var branC = this.hexToDec(bran.charAt(1));
                    var b = (branR * 16) + branC;

                    for (var i = 1; i <= b; i++) {
                        _col++;
                        if (_col >= 16) {
                            _row++;
                            _col = 0;
                            if (_row >= 16) {
                                _row = 0;
                            }
                        }
                    }
                }

                // Updates PC.
                this.PC = _col + 1;
            } else if (instruction === "EE") {
                // Retrieves memory address
                _col++;
                if (_col >= 16) {
                    _row++;
                    _col = 0;
                }
                var addr = _Memory[memDivision][_row][_col];
                _col++; // increment col to bypass most significant bits.

                // they are made irrelevant by 3d array and memDivision.
                if (_col >= 16) {
                    _row++;
                    _col = 0;
                }

                // Convert memory address to decimal for array use
                var tempRow = this.hexToDec(addr.charAt(0));
                var tempCol = this.hexToDec(addr.charAt(1));

                // Increments value at address. Updates PC.
                var incrementedC = this.hexToDec(_Memory[memDivision][tempRow][tempCol].charAt(1)) + 1;
                var incrementedR = _Memory[memDivision][tempRow][tempCol].charAt(0);
                if (incrementedC === 16) {
                    incrementedR++;
                    incrementedC = 0;
                }
                _Memory[memDivision][tempRow][tempCol] = this.decToHex(incrementedR) + this.decToHex(incrementedC);
                var value = _Memory[memDivision][tempRow][tempCol];
                this.PC = _col + 1;

                // Update UI.
                tempRow = tempRow * 2;
                if (tempCol > 7) {
                    tempCol = tempCol - 8;
                    tempRow++;
                }
                memory[tempRow][tempCol] = value;
                TSOS.Control.fillMemory();
            } else if (instruction === "FF") {
                var y = this.Yreg + "";

                // Determine value in X register
                if (+this.Xreg === 1) {
                    _StdOut.putText(y);
                } else {
                    // Convert memory address to decimal for array use
                    var tempRow = this.hexToDec(y.charAt(0));
                    var tempCol = this.hexToDec(y.charAt(1));

                    while (_Memory[memDivision][tempRow][tempCol] !== "00") {
                        var letter = _Memory[memDivision][tempRow][tempCol];
                        var r = this.hexToDec(letter.charAt(0));
                        var c = this.hexToDec(letter.charAt(1));

                        var dec = (r * 15) + c + r;
                        var str = String.fromCharCode(dec);
                        _StdOut.putText(str);

                        tempCol++;
                        if (tempCol >= 16) {
                            tempRow++;
                            tempCol = 0;
                        }
                    }
                }

                this.PC = _col + 1;
            } else {
            }

            // increment col and _row
            //	if (instruction !== "00") {
            _col++;
            if (_col >= 16) {
                _row++;
                _col = 0;
            }

            //	}
            // Updates PCB
            _PCB.updateForId(_id, instruction, _CPU.PC, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag, _ProcState);
            TSOS.Control.displayPCB(_id, instruction, 1);

            instruction = _Memory[memDivision][_row][_col]; // Next instruction
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

        Cpu.prototype.decToHex = function (num) {
            if (num === 10) {
                return "A";
            } else if (num === 11) {
                return "B";
            } else if (num === 12) {
                return "C";
            } else if (num === 13) {
                return "D";
            } else if (num === 14) {
                return "E";
            } else if (num === 15) {
                return "F";
            } else {
                return num + "";
            }
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
