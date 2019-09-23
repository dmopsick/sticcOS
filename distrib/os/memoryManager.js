// Issue #25 created Memory Manager file
// For project 2: Need to check whether there is already a program loaded
// Program gets loaded, ran, then after running can load new
// Need to add a clear shell command in project 3 but might in 2 
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager() {
        }
        MemoryManager.prototype.init = function () {
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
