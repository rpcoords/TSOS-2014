///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "") { 

        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
			// Get a global reference to the canvas.  TODO: Move this stuff into a Display Device Driver, maybe?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext('2d');
			
			_DrawingContext.fillStyle = "rgb(200,200,200)";
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if ((chr === String.fromCharCode(13)) || (chr === String.fromCharCode(9))) { //     Enter key or Tab
                    // The enter key or tab marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
					_BuffStack.enqueue(this.buffer);
					_ScrollQueue.enqueue(this.buffer);
                    this.buffer = "";
                } else if (chr === String.fromCharCode(8)) { // Backspace Key
					var removed = _StringStack.pop();
					this.buffer = _StringStack.pop();
					_StringStack.enqueue(this.buffer);
					var x = this.currentXPosition
					_DrawingContext.fillRect(0, this.currentYPosition - 10, _Canvas.width, 100); // Clears line
					this.currentXPosition = 0;
					_OsShell.putPrompt();
					this.currentXPosition = 12.48;
					this.putText(this.buffer);
				} else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
					_StringStack.enqueue(this.buffer)
                }
                // TODO: Write a case for Ctrl-C.
            }
        }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //this.putText(this.currentXPosition);
			if (text !== "") {
				var x = this.currentXPosition
				if (this.currentXPosition > 500) {
					this.advanceLine();
					x = 0;
				}
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, x, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = x + offset;
            }
         }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize + 
                                     _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                     _FontHeightMargin;

            // TODO: Handle scrolling. (Project 1)
			/*
			if (this.currentYPosition > 500) {
				var c = document.getElementById('display');
				
				//c.translate(0,100);
				c.save();
			}
			*/
        }
    }
 }
