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

        DeviceDriverFileSystem.prototype.krnFileSysISR = function (funcNum, filename) {
            if (+funcNum === 1) {
                this.format();
            } else if (+funcNum === 2) {
                this.create(filename);
                console.log("file created.");
            }
        };

        DeviceDriverFileSystem.prototype.format = function () {
            // Clears session storage.
            sessionStorage.clear();

            for (var a = 0; a < 4; a++) {
                for (var b = 0; b < 8; b++) {
                    for (var c = 0; c < 8; c++) {
                        var key = a + "" + b + "" + c;
                        sessionStorage.setItem(key, "0---|------------------------------------------------------------");
                    }
                }
            }
            // TODO: Store initial division data (keys for directory and data input locations) at key "000".
        };

        DeviceDriverFileSystem.prototype.create = function (filename) {
            // TODO: Create file in fsDD.
        };
        return DeviceDriverFileSystem;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
