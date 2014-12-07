///<reference path="deviceDriver.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/* ----------------------------------
DeviceDriverFileSystem.ts
Requires deviceDriver.ts
The File System Device Driver.
---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverFileSystem = (function (_super) {
        __extends(DeviceDriverFileSystem, _super);
        function DeviceDriverFileSystem() {
            // Overrides the base method pointers.
            _super.call(this, this.krnFileSysDriverEntry, this.krnFileSysISR);
        }
        DeviceDriverFileSystem.prototype.krnFileSysDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };

        DeviceDriverFileSystem.prototype.krnFileSysISR = function (funcNum, filename, data) {
            if (+funcNum === 1) {
                this.format();
            } else if (+funcNum === 2) {
                this.create(filename);
            } else if (+funcNum === 3) {
                this.write(filename, data);
            } else if (+funcNum === 4) {
                this.read(filename);
            } else if (+funcNum === 5) {
                this.remove(filename);
            } else if (+funcNum === 6) {
                this.list();
            }
        };

        DeviceDriverFileSystem.prototype.format = function () {
            // Clears local storage.
            localStorage.clear();

            for (var a = 0; a < 4; a++) {
                for (var b = 0; b < 8; b++) {
                    for (var c = 0; c < 8; c++) {
                        var key = a + "" + b + "" + c;
                        localStorage.setItem(key, "0---|------------------------------------------------------------");
                    }
                }
            }

            // Store initial division data (keys for directory and data input locations) at key "000".
            localStorage.setItem("000", "----|001*100-----------------------------------------------------");
        };

        DeviceDriverFileSystem.prototype.create = function (filename) {
            var newDir = "";
            var newData = "";
            var full = localStorage.getItem("000").split("|")[1];
            var mbr = full.split("*");
            var directory = mbr[0];
            var data = mbr[1].split("-")[0];

            var codes = "";
            for (var a = 0; a < filename.length; a++) {
                codes = codes + filename.charCodeAt(a).toString(16);
            }

            // Places filename in directory
            var header = 1 + data + "|" + codes;
            for (var a = codes.length; a < 60; a++) {
                header = header + "-";
            }
            localStorage.setItem(directory, header);
            _StdOut.putText("File " + filename + " created.");

            for (var x = 0; x < 8; x++) {
                for (var y = 0; y < 8; y++) {
                    var open = localStorage.getItem("0" + x + "" + y).charAt(0);
                    if (+open === 0) {
                        newDir = "0" + x + "" + y;
                        break;
                    }
                }
                if (newDir !== "") {
                    break;
                }
            }

            // Reserves space in data division.
            var dataLine = localStorage.getItem(data).substr(1, 64);
            dataLine = "1" + dataLine;
            localStorage.setItem(data, dataLine);

            for (var x = 1; x < 4; x++) {
                for (var y = 0; y < 8; y++) {
                    for (var z = 0; z < 8; z++) {
                        var open = localStorage.getItem(x + "" + y + "" + z).charAt(0);
                        if (+open === 0) {
                            newData = x + "" + y + "" + z;
                            break;
                        }
                    }
                    if (newData !== "") {
                        break;
                    }
                }
                if (newData !== "") {
                    break;
                }
            }

            // Updates initial keys.
            localStorage.setItem("000", "----|" + newDir + "*" + newData + "-----------------------------------------------------");
        };

        DeviceDriverFileSystem.prototype.write = function (filename, data) {
            var fileCodes = "";
            for (var a = 0; a < filename.length; a++) {
                fileCodes = fileCodes + filename.charCodeAt(a).toString(16);
            }

            // Find filename and where to write to.
            var dataKey = "";
            for (var y = 0; y < 8; y++) {
                for (var z = 0; z < 8; z++) {
                    var line = localStorage.getItem("0" + y + "" + z).split("|")[1];
                    var file = "";
                    if (line.charAt(59) === "-") {
                        file = line.split("-")[0];
                    } else {
                        file = line;
                    }
                    console.log("file: " + file);

                    if (file === fileCodes) {
                        dataKey = localStorage.getItem("0" + y + "" + z).split("|")[0].substr(1, 3);
                        break;
                    }
                }
                if (dataKey !== "") {
                    break;
                }
            }

            if (dataKey !== "") {
                // Encodes data
                var dataCodes = "";
                for (var a = 0; a < data.length; a++) {
                    dataCodes = dataCodes + data.charCodeAt(a).toString(16);
                }

                // Place data in data line.
                var len = dataCodes.length;
                var start = 0;
                var codes = "";
                var updateNeeded = false;
                while (len > 0) {
                    var l = 60;
                    if (+len < 61) {
                        l = len;
                        codes = "1---|" + dataCodes.substr(start, l);
                        for (var a = l; a < 60; a++) {
                            codes = codes + "-";
                        }
                    } else {
                        // Finds next open data line.
                        var newData = "";
                        for (var x = 1; x < 4; x++) {
                            for (var y = 0; y < 8; y++) {
                                for (var z = 0; z < 8; z++) {
                                    var open = localStorage.getItem(x + "" + y + "" + z).charAt(0);
                                    if (+open === 0) {
                                        newData = x + "" + y + "" + z;
                                        break;
                                    }
                                }
                                if (newData !== "") {
                                    break;
                                }
                            }
                            if (newData !== "") {
                                break;
                            }
                        }

                        codes = "1" + newData + "|" + dataCodes.substr(start, l);
                        updateNeeded = true;
                    }

                    localStorage.setItem(dataKey, codes);

                    len = len - 60;
                    start = start + 60;
                }

                _StdOut.putText("Successfully wrote to file " + filename);

                // Update initial keys
                if (updateNeeded === false) {
                    var newDir = localStorage.getItem("000").split("|")[1].split("*")[0];

                    // Finds next open data line.
                    var newData = "";
                    for (var x = 1; x < 4; x++) {
                        for (var y = 0; y < 8; y++) {
                            for (var z = 0; z < 8; z++) {
                                var open = localStorage.getItem(x + "" + y + "" + z).charAt(0);
                                if (+open === 0) {
                                    newData = x + "" + y + "" + z;
                                    break;
                                }
                            }
                            if (newData !== "") {
                                break;
                            }
                        }
                        if (newData !== "") {
                            break;
                        }
                    }

                    // Updates initial keys.
                    localStorage.setItem("000", "----|" + newDir + "*" + newData + "-----------------------------------------------------");
                }
            } else {
                _StdOut.putText("Filename " + filename + " not in directory.");
            }
        };

        DeviceDriverFileSystem.prototype.read = function (filename) {
            var fileCodes = "";
            for (var a = 0; a < filename.length; a++) {
                fileCodes = fileCodes + filename.charCodeAt(a).toString(16);
            }

            // Find filename and where to read from.
            var dataKey = "";
            for (var y = 0; y < 8; y++) {
                for (var z = 0; z < 8; z++) {
                    var line = localStorage.getItem("0" + y + "" + z).split("|")[1];
                    var file = "";
                    if (line.charAt(59) === "-") {
                        file = line.split("-")[0];
                    } else {
                        file = line;
                    }
                    console.log("file: " + file);

                    if (file === fileCodes) {
                        dataKey = localStorage.getItem("0" + y + "" + z).split("|")[0].substr(1, 3);
                        break;
                    }
                }
                if (dataKey !== "") {
                    break;
                }
            }

            if (dataKey !== "") {
                //var line = "";
                var num = "";
                var fileData = "";
                while (dataKey !== "---") {
                    var line = localStorage.getItem(dataKey).split("|")[1];
                    var loc = 0;
                    for (var a = 0; a < 30; a++) {
                        loc = a * 2;
                        num = line.substr(loc, 2);
                        fileData = fileData + String.fromCharCode(parseInt(num, 16));
                    }
                    dataKey = localStorage.getItem(dataKey).split("|")[0].substr(1, 3);
                }

                // Displays data written to file.
                _StdOut.putText("Filename: " + filename);
                _StdOut.advanceLine();
                _StdOut.putText("Data: " + fileData);
            } else {
                _StdOut.putText("Filename " + filename + " not in directory.");
            }
        };

        // Remove: deletes file from storage.
        DeviceDriverFileSystem.prototype.remove = function (filename) {
            var fileCodes = "";
            for (var a = 0; a < filename.length; a++) {
                fileCodes = fileCodes + filename.charCodeAt(a).toString(16);
            }

            // Find filename and where to read from.
            var dataKey = "";
            var fileKey = "";
            for (var y = 0; y < 8; y++) {
                for (var z = 0; z < 8; z++) {
                    var line = localStorage.getItem("0" + y + "" + z).split("|")[1];
                    var file = "";
                    if (line.charAt(59) === "-") {
                        file = line.split("-")[0];
                    } else {
                        file = line;
                    }
                    console.log("file: " + file);

                    if (file === fileCodes) {
                        dataKey = localStorage.getItem("0" + y + "" + z).split("|")[0].substr(1, 3);
                        fileKey = "0" + y + "" + z;
                        break;
                    }
                }
                if (dataKey !== "") {
                    break;
                }
            }

            if (dataKey !== "") {
                // Remove directory entry.
                localStorage.setItem(fileKey, "0---|------------------------------------------------------------");

                console.log("dk: " + dataKey);

                while (dataKey !== "---") {
                    console.log("entered");
                    var temp = localStorage.getItem(dataKey).split("|")[0].substr(1, 3);
                    localStorage.setItem(dataKey, "0---|------------------------------------------------------------");
                    dataKey = temp;
                }

                // TODO: Update initial keys.
                var newDir = "";
                var newData = "";

                for (var x = 0; x < 8; x++) {
                    for (var y = 0; y < 8; y++) {
                        var open = localStorage.getItem("0" + x + "" + y).charAt(0);
                        if (+open === 0) {
                            newDir = "0" + x + "" + y;
                            break;
                        }
                    }
                    if (newDir !== "") {
                        break;
                    }
                }

                for (var x = 1; x < 4; x++) {
                    for (var y = 0; y < 8; y++) {
                        for (var z = 0; z < 8; z++) {
                            var open = localStorage.getItem(x + "" + y + "" + z).charAt(0);
                            if (+open === 0) {
                                newData = x + "" + y + "" + z;
                                break;
                            }
                        }
                        if (newData !== "") {
                            break;
                        }
                    }
                    if (newData !== "") {
                        break;
                    }
                }

                localStorage.setItem("000", "----|" + newDir + "*" + newData + "-----------------------------------------------------");

                _StdOut.putText("File " + filename + " successfully removed from storage.");
            } else {
                _StdOut.putText("Filename " + filename + " not in directory.");
            }
        };

        DeviceDriverFileSystem.prototype.list = function () {
        };
        return DeviceDriverFileSystem;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
