///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverFileSystem.ts

   Requires deviceDriver.ts

   The File System Device Driver.
   ---------------------------------- */
   
module TSOS {

	// Extends DeviceDriver
	export class DeviceDriverFileSystem extends DeviceDriver {
		
		constructor() {
			// Overrides the base method pointers.
			super(this.krnFileSysDriverEntry, this.krnFileSysISR);
		}
		
		public krnFileSysDriverEntry() {
			// Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
		}
		
		public krnFileSysISR(funcNum, filename) {
			if (+funcNum === 1) { // format
				this.format();
			} else if (+funcNum === 2) {
				this.create(filename);
				console.log("file created.");
			}
		}
		
		public format() {
			// Clears session storage.
			sessionStorage.clear();
			
			// initializes fsDD.
			for (var a = 0; a < 4; a++) {
				for (var b = 0; b < 8; b++) {
					for (var c = 0; c < 8; c++) {
						var key: string = a + "" + b + "" + c;
						sessionStorage.setItem(key, "0---|------------------------------------------------------------");
					}
				}
			}
			
			// TODO: Store initial division data (keys for directory and data input locations) at key "000".
			
		}
		
		public create(filename) {
			// TODO: Create file in fsDD.
			
		}
	}
}