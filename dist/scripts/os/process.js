var TSOS;
(function (TSOS) {
    var Process = (function () {
        function Process(id, instruction, cpu, prior, s) {
            if (typeof id === "undefined") { id = 0; }
            if (typeof instruction === "undefined") { instruction = ""; }
            if (typeof cpu === "undefined") { cpu = new TSOS.Cpu(0, 0, 0, 0, 0, false); }
            if (typeof prior === "undefined") { prior = 0; }
            if (typeof s === "undefined") { s = ""; }
            var pid = id;
            var ir = instruction;
            var cpuRegisters = cpu;
            var priority = prior;
            var state = s;
        }
        return Process;
    })();
    TSOS.Process = Process;
})(TSOS || (TSOS = {}));
