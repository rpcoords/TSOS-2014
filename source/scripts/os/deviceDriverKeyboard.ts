///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.
            super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that they are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) {  // a..z {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if ((keyCode == 38) || (keyCode == 40)) {   // up/ down arrow keys
				if (keyCode == 38) {
					_DrawingContext.fillRect(0, _Console.currentYPosition - 10, _Canvas.width, 100); // Clears line
					var str = _BuffStack.pop();
					_Console.currentXPosition = 0;
					_OsShell.putPrompt();
					_Console.currentXPosition = 12.48;
					_InverseStack.enqueue(str);
					_Console.buffer = str;
					_Console.putText(str);
				} else {
					_DrawingContext.fillRect(0, _Console.currentYPosition - 10, _Canvas.width, 100); // Clears line
					var str = _InverseStack.pop();
					_Console.currentXPosition = 0;
					_OsShell.putPrompt();
					_Console.currentXPosition = 12.48;
					_BuffStack.enqueue(str);
					_Console.buffer = str;
					_Console.putText(str);
				} 
			} else if ((keyCode >= 48) && (keyCode <= 57)) {   // digits
				// Check if shifted for special characters
				if (isShifted) { 
					if (keyCode == 48) {
						keyCode = 41;
					} else if (keyCode == 49) {
						keyCode = 33;
					} else if (keyCode == 50) {
						keyCode = 64;
					} else if (keyCode == 54) {
						keyCode = 94;
					} else if (keyCode == 55) {
						keyCode = 38;
					} else if (keyCode == 56) {
						keyCode = 42;
					} else if (keyCode == 57) {
						keyCode = 40;
					} else {
						keyCode = keyCode - 16;
					}
				}
				chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
			} else if (keyCode == 222) {
				keyCode = 39;
				// Check if shifted
				if (isShifted) {
					keyCode = 34;
				}
				chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
			} else if ((keyCode == 191) || (keyCode == 190)) {
				if (keyCode == 191) {
					keyCode = 47;
				} else {
					keyCode = 46;
				}
				// Check if shifted
				if (isShifted) {
					keyCode = keyCode + 16;
				}
				chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
			} else if (keyCode == 188) {
				keyCode = 44;
				// Check if shifted
				if (isShifted) {
					keyCode = 60;
				}
				chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
			} else if ((keyCode >= 219) && (keyCode <= 221)) {
				keyCode = keyCode - 128;
				// Check if shifted
				if (isShifted) {
					keyCode = keyCode + 32;
				}
				chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
			} else if (keyCode == 173) {
				keyCode = 45;
				// Check if shifted
				if (isShifted) {
					keyCode = 95;
				}
				chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
			} else if (keyCode == 59) {
				// Check if shifted
				if (isShifted) {
					keyCode = 58;
				}
				chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
			} else if   ((keyCode == 32)                    ||   // space
						(keyCode == 8)						||	 // backspace
						(keyCode == 9)						||   // horizontal tab
                        (keyCode == 13)) {                       // enter
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
        }
    }
}
