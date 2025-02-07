var TSOS;
(function (TSOS) {
    var TSB = /** @class */ (function () {
        function TSB(track, section, block) {
            this.track = track;
            this.section = section;
            this.block = block;
        }
        // Issue #46 return the TSB formatted as key
        // returns T:S:B ex 0:0:1
        TSB.prototype.getTSBKey = function () {
            return this.track + ":" + this.section + ":" + this.block;
        };
        // returns TSB ex 001
        TSB.prototype.getRawTSB = function () {
            return this.track.toString() + this.section.toString() + this.block.toString();
        };
        // Returns TSB formatted as one byte each ex 000001 for 0:0:1
        TSB.prototype.getTSBByte = function () {
            return "0" + this.track.toString() + "0" + this.section.toString() + "0" + this.block.toString();
        };
        return TSB;
    }());
    TSOS.TSB = TSB;
})(TSOS || (TSOS = {}));
