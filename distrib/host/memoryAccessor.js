// Issue #26 Creating Memory Accessor model
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function () {
        function MemoryAccessor() {
        }
        MemoryAccessor.prototype.init = function () {
        };
        // Issue #26 Need to be able to write program code into memory
        // Parameters: memAddr, data
        MemoryAccessor.prototype.writeToMemory = function (memAddr, data) {
        };
        // Issue #26 need to be able to read program code from memory
        MemoryAccessor.prototype.readFromMemory = function (memAddr) {
        };
        return MemoryAccessor;
    }());
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
