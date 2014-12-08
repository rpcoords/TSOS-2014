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
		
		public krnFileSysISR(funcNum, filename: string, data: string, fromShell: boolean = false) {
			if (+funcNum === 1) { // format
				this.format();
			} else if (+funcNum === 2) { // create
				this.create(filename, fromShell);
			} else if (+funcNum === 3) { // write
				this.write(filename, data, fromShell);
			} else if (+funcNum === 4) { // read
				this.read(filename);
			} else if (+funcNum === 5) { // delete
				this.remove(filename, fromShell);
			} else if (+funcNum === 6) { // ls
				this.list();
			}
		}
		
		public format() {
			// Clears local storage.
			localStorage.clear();
			
			// initializes fsDD.
			for (var a = 0; a < 4; a++) {
				for (var b = 0; b < 8; b++) {
					for (var c = 0; c < 8; c++) {
						var key: string = a + "" + b + "" + c;
						localStorage.setItem(key, "0---|------------------------------------------------------------------------------------------------------------------------");
					}
				}
			}
			
			// Store initial division data (keys for directory and data input locations) at key "000".
			localStorage.setItem("000", "----|001*100-----------------------------------------------------------------------------------------------------------------");
		}
		
		public create(filename: string, fromShell: boolean = false) {
			filename = filename + "";
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
			for (var a = codes.length; a < 120; a++) {
				header = header + "-";
			}
			localStorage.setItem(directory, header);
			if (fromShell === true) {
				_StdOut.putText("File " + filename + " created.");
			}
			_Files++;
			
			// Finds next open directory.
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
			var dataLine = localStorage.getItem(data).substr(1, 128);
			dataLine = "1" + dataLine;
			localStorage.setItem(data, dataLine);
			
			// Finds next open data line.
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
			localStorage.setItem("000", "----|" + newDir + "*" + newData + "-----------------------------------------------------------------------------------------------------------------");
		}
		
		public write(filename: string, data: string, fromShell: boolean = false) {
			filename = filename + "";
			data = data + "";
			console.log("data: " + data);
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
					if (line.charAt(119) === "-") {
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
			
			if (dataKey !== "") { // Checks that filename was found.
				// Encodes data
				var dataCodes = "";
				for (var a = 0; a < data.length; a++) {
					dataCodes = dataCodes + data.charCodeAt(a).toString(16);
				}
				
				// Place data in data line.
				var len = dataCodes.length;
				console.log(dataCodes + " " + len);
				var start = 0;
				var codes = "";
				var updateNeeded = false;
				while (len > 0) {
					var l = 120;
					var next = "---";
					console.log(len + " " + (+len < 121));
					if (+len < 121) {
						l = len;
						codes = "1---|" + dataCodes.substr(start, l);
						for (var a = l; a < 120; a++) {
							codes = codes + "-";
						}
					} else {
						// Mark line as not open.
						//localStorage.setItem(dataKey, "1");
						
						// Finds next open data line.
						var newData = "";
						for (var x = 1; x < 4; x++) {
							for (var y = 0; y < 8; y++) {
								for (var z = 0; z < 8; z++) {
									var open = localStorage.getItem(x + "" + y + "" + z).charAt(0);
									console.log((x + "" + y + "" + z) !== dataKey);
									if ((+open === 0) && ((x + "" + y + "" + z) !== dataKey)) {
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
						next = newData;
					}
					
					localStorage.setItem(dataKey, codes);
					dataKey = next;
					
					len = len - 120;
					start = start + 120;
				}
				
				if (fromShell === true) {
					_StdOut.putText("Successfully wrote to file " + filename);
				}
				
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
					localStorage.setItem("000", "----|" + newDir + "*" + newData + "-----------------------------------------------------------------------------------------------------------------");
				}
			} else {
				_StdOut.putText("Filename " + filename + " not in directory.");
			}
		}
		
		public read(filename: string) {
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
					if (line.charAt(119) === "-") {
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
					for (var a = 0; a < 60; a++) {
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
		}
		
		// Remove: deletes file from storage.
		public remove(filename: string, fromShell: boolean = false) {
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
					if (line.charAt(119) === "-") {
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
				localStorage.setItem(fileKey, "0---|------------------------------------------------------------------------------------------------------------------------");
				
				// Removes all file data entries.
				while (dataKey !== "---") {
					var temp = localStorage.getItem(dataKey).split("|")[0].substr(1, 3)
					localStorage.setItem(dataKey, "0---|------------------------------------------------------------------------------------------------------------------------");
					dataKey = temp;
				}
				
				// Update initial keys.
				var newDir = "";
				var newData = "";
				
				// Finds next open directory.
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
				
				// Finds next open data line.
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
				
				localStorage.setItem("000", "----|" + newDir + "*" + newData + "-----------------------------------------------------------------------------------------------------------------");
				_Files--;
				
				if (fromShell === true) {
					_StdOut.putText("File " + filename + " successfully removed from storage.");
				}
			} else {
				_StdOut.putText("Filename " + filename + " not in directory.");
			}
		}
		
		public list() {
			var num = _Files;
			
			_StdOut.putText("Files: ");
			for (var a = 0; a < 8; a++) {
				for (var b = 0; b < 8; b++) {
					var open = localStorage.getItem("0" + a + "" + b).charAt(0);
					if (+open === 1) {
						var line = localStorage.getItem("0" + a + "" + b).split("|")[1];
						var name = "";
						if (line.charAt(119) === "-") {
							name = line.split("-")[0];
						} else {
							name = line;
						}
						
						var fileData = "";
						var loc = 0;
						var numb = "";
						for (var x = 0; x < (name.length / 2); x++) {
							loc = x * 2;
							numb = name.substr(loc, 2);
							fileData = fileData + String.fromCharCode(parseInt(numb, 16));
						}
						
						_StdOut.putText(fileData);
						num--;
						
						if (num > 0) {
							_StdOut.putText("; ");
						}
					}
				}
			}
		}
		
		public output(filename: string) {
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
					if (line.charAt(119) === "-") {
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
			
			var num = "";
			var fileData = "";
			while (dataKey !== "---") {
				var line = localStorage.getItem(dataKey).split("|")[1];
				var loc = 0;
				for (var a = 0; a < 60; a++) {
					loc = a * 2;
					num = line.substr(loc, 2);
					fileData = fileData + String.fromCharCode(parseInt(num, 16));
				}
				dataKey = localStorage.getItem(dataKey).split("|")[0].substr(1, 3);
			}
			
			return fileData;
		}
	}
}