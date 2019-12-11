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
        // Issue #47 | Create the directory entry for a file
        // Retruns a number that indicates the status of the create in order to be R E S P O N S I V E
        DeviceDriverFileSystem.prototype.createFile = function (filename) {
            // Check if there is already a file with the specified name | Will return false if the file does not exist
            if (this.getDirectoryBlockTSBByFilename(filename) !== null) {
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
        // Issue #47 | Write the data contents of a file
        // Destructive write, overwrites any existing data, can not append contents of file
        // Returns an int that indicates the status to the shell in order to be responsive
        DeviceDriverFileSystem.prototype.writeFile = function (filename, data) {
            // Get TSB for specified file
            var directoryTSB = this.getDirectoryBlockTSBByFilename(filename);
            // console.log(directoryTSB);
            if (directoryTSB === null) {
                // Return -1 represents that there is no directory file for specified filename
                return -1;
            }
            // Since it is a destructive write I believe will have to overwrite some data, or make old data blocks not in use
            // Read the data in the directory to find the value of the first TSB for data block
            var dataTSB = this.getNextTSBByTSB(directoryTSB); // Need to get the next TSB from the directory data and use it as location of first data block to save
            console.log("First data TSB");
            console.log(dataTSB);
            // console.log(data);
            // console.log(data.length);
            // There is open blocks and the file exists... convert the data to hex
            var hexData = TSOS.Utils.convertStringToHex(data);
            // console.log(hexData);
            // console.log(hexData.length);
            // Loop through the data as many times as it takes and save the data to data block(s)
            // Write the file 60 bytes at a time
            while (hexData.length > 0) {
                if (dataTSB === null) {
                    // Returning -2 means that there are no open data blocks in the system
                    return -2;
                }
                // Get the first block size (60) bytes to save to this data block | Times two because each byte is two characters
                var hexDataHead = hexData.substring(0, (_Disk.blockSize * 2));
                // Remove the hexDataHead that has been saved from the hexData to leave remaining data
                hexData = hexData.slice(_Disk.blockSize * 2);
                // Create a variable to hold the data to save... with the inuse block and the proper nextTSB data
                var dataToSave = this._IsActiveDataByte;
                // Variable for next TSB if needed
                var nextTSB = null;
                // There will be another block after this
                if (hexData.length > 0) {
                    nextTSB = this.findOpenDataBlock();
                    // Add in the next value of the TSB then the hexDataHead
                    dataToSave += nextTSB.getTSBByte() + hexDataHead;
                }
                // This will be the last block required for saving the file
                else {
                    // Add in the placeholder next value then the hexDataHead
                    dataToSave += this._NextBlockPlaceholder + hexDataHead;
                }
                // Write the first 60 bytes to the disk
                _Disk.writeToDisk(dataTSB, dataToSave);
                if (nextTSB !== null) {
                    // Assign a new TSB to be the dataTSB for the next iteration
                    dataTSB = nextTSB;
                    console.log("Next TSB");
                    console.log(dataTSB);
                }
                console.log("FLAG 15: " + hexData.length);
                console.log(TSOS.Utils.convertHexToString(hexDataHead));
                // Need to sure I can read the file to verify that I did this correctly.
            }
            console.log("The while loop is not infinite yay");
            // Return 1 if file was written to succesfully
            return 1;
        };
        // Issue #47 | Retrieve a directory file by filename
        DeviceDriverFileSystem.prototype.getDirectoryBlockTSBByFilename = function (filename) {
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
                throw Error("Invalid byte for inUse: " + inUseByte);
            }
        };
        // Issue #47 | Returns the data from a TSB
        // Ignores the inUse and next TSB byetes, just returns the data
        DeviceDriverFileSystem.prototype.getDataStringByTSB = function (tsb) {
            // Get the raw hex data from the disk
            var rawHexData = _Disk.readFromDisk(tsb);
            // Trim the hex data to remove next TSB and inUse
            var trimmedHexData = rawHexData.slice(8);
            // Conver the hex data to a normal string
            var convertedData = TSOS.Utils.convertHexToString(trimmedHexData);
            return convertedData;
        };
        // Issue #47 | Returns the next TSB pointed to by a TSB
        // Used to get the next TSB from a directory block to find the first data block
        // Or when there are multiple data blocks to move from block to block
        DeviceDriverFileSystem.prototype.getNextTSBByTSB = function (tsb) {
            var rawHexData = _Disk.readFromDisk(tsb);
            // Extract the track, sector, and block byte to be used to create a TSB
            // Track is element 3, Section 5, Block 7 ... because it goes in use then TSB... ex: 01 01 00 01
            var track = parseInt(rawHexData[3], 16);
            var section = parseInt(rawHexData[5], 16);
            var block = parseInt(rawHexData[7], 16);
            var nextTSB = new TSOS.TSB(track, section, block);
            return nextTSB;
        };
        return DeviceDriverFileSystem;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
