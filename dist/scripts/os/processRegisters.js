var TSOS;
(function (TSOS) {
    var ProcessRegisters = (function () {
        function ProcessRegisters(pid, ir, pc, acc, x, y, z, priority, state) {
            if (typeof pid === "undefined") { pid = new Array(); }
            if (typeof ir === "undefined") { ir = new Array(); }
            if (typeof pc === "undefined") { pc = new Array(); }
            if (typeof acc === "undefined") { acc = new Array(); }
            if (typeof x === "undefined") { x = new Array(); }
            if (typeof y === "undefined") { y = new Array(); }
            if (typeof z === "undefined") { z = new Array(); }
            if (typeof priority === "undefined") { priority = new Array(); }
            if (typeof state === "undefined") { state = new Array(); }
            this.pid = pid;
            this.ir = ir;
            this.pc = pc;
            this.acc = acc;
            this.x = x;
            this.y = y;
            this.z = z;
            this.priority = priority;
            this.state = state;
            /*
            var pid = id;
            var ir = instruction;
            var pc;
            var
            //var cpuRegisters = cpu;
            var priority = prior;
            var state = s;
            */
        }
        ProcessRegisters.prototype.setRegisters = function (id, prior) {
            this.pid.push(id);
            this.ir.push("0");
            this.pc.push(0);
            this.acc.push("0");
            this.x.push(0);
            this.y.push(0);
            this.z.push(0);
            this.priority.push(prior);
            this.state.push("ready");
        };

        ProcessRegisters.prototype.updateForId = function (id, instruction, counter, a, xReg, yReg, zFlag, s) {
            //var index = this.pid.indexOf(id);
            var index = -1;
            for (var b = 0; b < this.pid.length; b++) {
                if (+this.pid[b] === +id) {
                    index = b;
                }
            }

            //console.log(s)
            /*	if(s === "terminated"){
            this.state[index] = s
            //console.log("update terminated")
            }else{ */
            //console.log("update id: " + instruction)
            this.ir[index] = instruction;
            this.pc[index] = counter;
            this.acc[index] = a;
            this.x[index] = xReg;
            this.y[index] = yReg;
            this.z[index] = zFlag;
            this.state[index] = s;
            //console.log("updated: " + this.ir[index])
            //console.log("id = " + id)
            //console.log("--------------")
            //	}
        };
        return ProcessRegisters;
    })();
    TSOS.ProcessRegisters = ProcessRegisters;
})(TSOS || (TSOS = {}));
