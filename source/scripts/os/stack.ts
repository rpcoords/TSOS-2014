/* ------------
   Stack.ts

   A simple Stack, which is really just a dressed-up JavaScript Array.
   See the Javascript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and pop methods, as they are the least obvious here.

   ------------ */

module TSOS {
	export class Stack {
        constructor(public s = new Array()) {

        }

        public getSize() {
            return this.s.length;
        }

        public isEmpty(){
            return (this.s.length == 0);
        }

        public push(element) {
            this.s.push(element);
        }

        public pop() {
            var retVal = null;
            if (this.s.length > 0) {
                retVal = this.s.pop();
            }
            return retVal;
        }

        public toString() {
            var retVal = "";
            for (var i in this.s) {
                retVal += "[" + this.s[i] + "] ";
            }
            return retVal;
        }
    }
}