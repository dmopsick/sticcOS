var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// Based on deviceDriverKeyboard.ts
var TSOS;
(function (TSOS) {
    var DeviceDriverFileSystem = /** @class */ (function (_super) {
        __extends(DeviceDriverFileSystem, _super);
        function DeviceDriverFileSystem() {
            var _this = _super.call(this) || this;
            // Constants that will be used in one or more file functions
            _this._DirectoryTrack = 0;
            _this._FirstDataTrack = 1;
            _this._IsActiveDataByte = "01";
            _this._NextBlockPlaceholder = "0-0-0-";
            _this.driverEntry = _this.krnFileSystemDriverEntry;
            return _this;
        }
        DeviceDriverFileSystem.prototype.krnFileSystemDriverEntry = function () {
            this.status = "loaded";
        };
        // Issue #47 create the directory file
        // Retruns a number that indicates the status of the create in order to be R E S P O N S I V E
        DeviceDriverFileSystem.prototype.createFile = function (filename) {
            // Check if there is already a file with the specified name | Will return false if the file does not exist
            if (this.getDirectoryFileTSBByFilename(filename) !== null) {
                // Return -1 to indicate that the file already exists
                return -1;
            }
            // Check if there is any open directory blocks
            var directoryTSB = this.findOpenDirectoryBlock();
            // console.log("Directory TSB");
            // console.log(directoryTSB);
            // directoryTSB will === false if there is no open directory blocks
            if (directoryTSB === null) {
                // Return -2 to indicate that there is no room to create files
                return -2;
            }
            // Check if there is any open data blocks for the file
            var dataTSB = this.findOpenDataBlock();
            // console.log("Data TSB");
            // console.log(dataTSB);
            if (dataTSB === null) {
                // Return -3 to indicate there is no open data blocks for the file
                return -3;
            }
            // Convert filename to Hex
            var hexFilename = TSOS.Utils.convertStringToHex(filename);
            // Generate data to save to directory TSB .. ex: 01 for isactive, TSB of data, and filename
            var directoryBlockData = this._IsActiveDataByte + dataTSB.getTSBByte() + hexFilename;
            // Create the directory file
            _Disk.writeToDisk(directoryTSB, directoryBlockData);
            // Generate data to initialize data block
            var dataBlockData = this._IsActiveDataByte + this._NextBlockPlaceholder;
            // Create data file
            _Disk.writeToDisk(dataTSB, dataBlockData);
            // Return 1 if the file was created successfully with no error
            return 1;
        };
        // Issue #47 | Retrieve a directory file by filename
        DeviceDriverFileSystem.prototype.getDirectoryFileTSBByFilename = function (filename) {
            // Loop through the sectors and blocks of the first track to find directory file with given file name
            for (var j = 0; j < _Disk.sections; j++) {
                for (var k = 0; k < _Disk.blocks; k++) {
                    // Create TSB object of the current TSB to check
                    var tsb = new TSOS.TSB(this._DirectoryTrack, j, k);
                    // Get the data stored in the specified Directory TSB
                    // Need to read from the disk
                    var data = _Disk.readFromDisk(tsb);
                    // console.log("FLAG 11");
                    // console.log(data);
                    // The block is in use | It's in use block will be zero if it is indeed in use
                    if (this.blockIsInUse(data)) {
                        // Need to compare the data to the file name
                        // Either convert the filename to ascii... or the ascii to a string
                        var filenameData = data.substring(8);
                        // Created util function to convert the ascii data to a string... maybe it works we will see
                        var dataFilename = TSOS.Utils.convertHexToString(filenameData);
                        /* console.log('FILENAME vs DATAFILENAME');
                        console.log("_" + filename + "_");
                        console.log("_" + dataFilename + "_"); */
                        // If the filename is equal to the data in the TSB, return the TSB 
                        if (filename == dataFilename) {
                            return tsb;
                        }
                    }
                    // If the block is in use we do not need to check if it is the block we are looking for
                }
            }
            // Return false if the file does not exist
            return null;
        };
        // Issue #47 | Find an open directory block. 
        // Returns TSB if there is an open directory block
        // Return false if there is no open directory block
        DeviceDriverFileSystem.prototype.findOpenDirectoryBlock = function () {
            // I suppose loop through the directory blocks and find one that is not in use then return the TSB for it
            // Loop through each directory block to find one thtat has a zero for in use
            for (var j = 0; j < _Disk.sections; j++) {
                for (var k = 0; k < _Disk.blocks; k++) {
                    // Generate a TSB for each directory block
                    var tsb = new TSOS.TSB(this._DirectoryTrack, j, k);
                    // Get the data associated with the TSB in the disk
                    var data = _Disk.readFromDisk(tsb);
                    if (!this.blockIsInUse(data)) {
                        // If the block is not in use, return it! It is an open directory block!
                        return tsb;
                    }
                }
            }
            // Return false if there is no open directory block
            return null;
        };
        // Issue #49 | Finds an open data block
        // Returns TSB if there is an open Data block
        // Returns false if there is no open data block
        DeviceDriverFileSystem.prototype.findOpenDataBlock = function () {
            // Loop through each TSB to find a open block
            for (var i = this._FirstDataTrack; i < _Disk.tracks; i++) {
                for (var j = 0; j < _Disk.sections; j++) {
                    for (var k = 0; k < _Disk.blocks; k++) {
                        // Generate TSB object for each block
                        var tsb = new TSOS.TSB(i, j, k);
                        // Get the data associated with the TSB in the disk
                        var data = _Disk.readFromDisk(tsb);
                        if (!this.blockIsInUse(data)) {
                            // This tsb links to an open block, return it!
                            return tsb;
                        }
                    }
                }
            }
            // An open data block has not been found
            return null;
        };
        DeviceDriverFileSystem.prototype.blockIsInUse = function (data) {
            // The first character of the in use byte will always be 0. In use is either 0 or 1
            var inUseByte = data[1];
            if (inUseByte === "1") {
                return true;
            }
            else if (inUseByte === "0") {
                return false;
            }
            else {
                // Uh if the in use is not 0 or 1 we got a problem
                throw Error;
            }
        };
        return DeviceDriverFileSystem;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
