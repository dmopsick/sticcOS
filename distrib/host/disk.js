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
            // Initialize every single data block to "00"
            for (var i = 0; i < this.tracks; i++) {
                for (var j = 0; j < this.sections; j++) {
                    for (var k = 0; k < this.blocks; k++) {
                        // Need to write to the disk here 00
                    }
                }
            }
        };
        // Issue #46 | Write to the disk
        Disk.prototype.writeToDisk = function (tsb, data) {
            // Set the data using the tsb as the key
            sessionStorage.setItem(tsb.getTSBKey(), data);
            // Update the HTML display
            // The HTML display must be implemented to update it 
        };
        return Disk;
    }());
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
