var TSOS;
(function (TSOS) {
    var TSB = /** @class */ (function () {
        function TSB(track, section, block) {
            this.track = track;
            this.section = section;
            this.block = block;
        }
        // Issue #46 return the TSB formatted as key
        // T:S:B
        TSB.prototype.getTSBKey = function () {
            return this.track + ":" + this.section + ":" + this.block;
        };
        return TSB;
    }());
    TSOS.TSB = TSB;
})(TSOS || (TSOS = {}));
