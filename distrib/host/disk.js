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
                        // Create TSB to write to the disk with
                        var tsb = new TSOS.TSB(i, j, k);
                        // Write a blank block to the disk, the zero fill write will fill in the 00s.
                        this.writeToDisk(tsb, "00");
                    }
                }
            }
        };
        // Issue #46 | Write to the disk with zero fill to fit block size
        Disk.prototype.writeToDisk = function (tsb, data) {
            // Create variable to hold the value of the data with the zero fill
            var zeroFilledData = data;
            // blockSize * 2 because 64 bytes and each byte is two characters
            // Loading each empty byte as 00 | Do not want to leave old data in the block
            // Makes the write a destructive write
            while (zeroFilledData.length < (this.blockSize * 2)) {
                zeroFilledData += "00";
            }
            // Set the data using the tsb as the key
            sessionStorage.setItem(tsb.getTSBKey(), zeroFilledData);
            // Update the HTML display
            TSOS.Control.updateDiskDisplay(tsb, zeroFilledData);
        };
        return Disk;
    }());
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
