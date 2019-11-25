// Issue #46 | Disk Implementation in HTML 5 Session Storage
var TSOS;
(function (TSOS) {
    var Disk = /** @class */ (function () {
        function Disk(tracks, sections, blocks, blockSize) {
            if (tracks === void 0) { tracks = 4; }
            if (sections === void 0) { sections = 8; }
            if (blocks === void 0) { blocks = 8; }
            if (blockSize === void 0) { blockSize = 64; }
            this.tracks = tracks;
            this.sections = sections;
            this.blocks = blocks;
            this.blockSize = blockSize;
        }
        // Issue #46 | Format the disk 
        // Initalize the values
        Disk.prototype.init = function () {
            // Initialize the data blocks to all "00"
            sessionStorage.disk = "HELLO WORLD";
            console.log(sessionStorage.disk);
        };
        return Disk;
    }());
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
