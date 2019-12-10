// Based on deviceDriverKeyboard.ts
module TSOS {
    export class DeviceDriverFileSystem extends DeviceDriver {
        private _DirectoryTrack: number = 0;
        private _FirstDataTrack: number = 1;
        private _IsActiveDataByte: string = "01";

        constructor() {
            super();
            this.driverEntry = this.krnFileSystemDriverEntry;
        }

        public krnFileSystemDriverEntry() {
            this.status = "loaded";
        }

        // Issue #47 create the directory file
        public createFile(filename: string): number {
            // Check if there is already a file with the specified name | Will return false if the file does not exist
            if (this.getDirectoryFileTSBByFilename(filename) !== null) {
                // Return -1 to indicate that the file already exists
                return -1;
            }

            // Check if there is any open directory blocks
            const directoryTSB: TSB = this.findOpenDirectoryBlock();

            console.log("Directory TSB");
            console.log(directoryTSB);

            // directoryTSB will === false if there is no open directory blocks
            if (directoryTSB ===  null) {
                // Return -2 to indicate that there is no room to create files
                return -2;
            }

            // Check if there is any open data blocks for the file
            const dataTSB: TSB = this.findOpenDataBlock();

            console.log("Data TSB");
            console.log(dataTSB);

            if (dataTSB === null) {
                // Return -3 to indicate there is no open data blocks for the file
                return -3;
            }

            console.log("Okay time to create");

            // Convert filename to Hex
            const hexFilename = Utils.convertStringToHex(filename);

            // Generate data to save to directory TSB .. ex: 01 for isactive, TSB of data, and filename
            const directoryData = this._IsActiveDataByte + dataTSB.getTSBByte() + hexFilename;

            console.log(this._IsActiveDataByte);
            console.log(dataTSB.getTSBByte());
            console.log(hexFilename);

            console.log(directoryData);

            // Create the directory file
            _Disk.writeToDisk(directoryTSB, directoryData);

            // Create first data file associated with directory file to prepare for writing


            // Return 1 if the file was created successfully with no error
            return 1;
        }

        // Issue #47 | Retrieve a directory file by filename
        public getDirectoryFileTSBByFilename(filename: string): TSB {
            // Loop through the sectors and blocks of the first track to find directory file with given file name
            for (let j = 0; j < _Disk.sections; j++) {
                for (let k = 0; k < _Disk.blocks; k++) {
                    // Create TSB object of the current TSB to check
                    const tsb = new TSB(this._DirectoryTrack, j, k);

                    // Get the data stored in the specified Directory TSB
                    // Need to read from the disk
                    const data = _Disk.readFromDisk(tsb);

                    // console.log("FLAG 11");
                    // console.log(data);

                    // The block is in use | It's in use block will be zero if it is indeed in use
                    if (this.blockIsInUse(data)) {
                        // Need to compare the data to the file name
                        // Either convert the filename to ascii... or the ascii to a string
                        const filenameData = data.substring(8);

                        // Created util function to convert the ascii data to a string... maybe it works we will see
                        const dataFilename = Utils.convertHexToString(filenameData);

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
        }

        // Issue #47 | Find an open directory block. 
        // Returns TSB if there is an open directory block
        // Return false if there is no open directory block
        public findOpenDirectoryBlock(): TSB {
            // I suppose loop through the directory blocks and find one that is not in use then return the TSB for it

            // Loop through each directory block to find one thtat has a zero for in use
            for (let j = 0; j < _Disk.sections; j++) {
                for (let k = 0; k < _Disk.blocks; k++) {
                    // Generate a TSB for each directory block
                    const tsb = new TSB(this._DirectoryTrack, j, k);

                    // Get the data associated with the TSB in the disk
                    const data = _Disk.readFromDisk(tsb);

                    if (!this.blockIsInUse(data)) {
                        // If the block is not in use, return it! It is an open directory block!
                        return tsb;
                    }
                }
            }

            // Return false if there is no open directory block
            return null;
        }

        // Issue #49 | Finds an open data block
        // Returns TSB if there is an open Data block
        // Returns false if there is no open data block
        public findOpenDataBlock(): TSB {
            // Loop through each TSB to find a open block
            for (let i = this._FirstDataTrack; i < _Disk.tracks; i++) {
                for (let j = 0; j < _Disk.sections; j++) {
                    for (let k = 0; k < _Disk.blocks; k++) { 
                        // Generate TSB object for each block
                        const tsb = new TSB(i, j, k);

                        // Get the data associated with the TSB in the disk
                        const data = _Disk.readFromDisk(tsb);

                        if(!this.blockIsInUse(data)) {
                            // This tsb links to an open block, return it!
                            return tsb;
                        }
                    }
                }
            }

            // An open data block has not been found
            return null;
        }

        private blockIsInUse(data: string): boolean {
            // The first character of the in use byte will always be 0. In use is either 0 or 1
            const inUseByte = data[1];
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
        }
    }
}
