// Based on deviceDriverKeyboard.ts
module TSOS {
    export class DeviceDriverFileSystem extends DeviceDriver {
        private _DirectoryTrack: number = 0;

        constructor() {
            super();
            this.driverEntry = this.krnFileSystemDriverEntry;
        }

        public krnFileSystemDriverEntry() {
            this.status = "loaded";
        }

        // Issue #47 create the directory file
        public createFile(filename: string): number {

            console.log("CREATING: " + filename);
            
            // Check if there is already a file with the specified name | Will return false if the file does not exist
            if (this.getDirectoryFileTSBByFilename(filename)) {
                // Return -1 to indicate that the file already exists
                return -1;
            }

            // Check if there is any open directory blocks
            const directoryTSB = this.findOpenDirectoryBlock();

            console.log(directoryTSB);

            // directoryTSB will === false if there is no open directory blocks
            if (directoryTSB === false) {
                // Return -2 to indicate that there is no room to create files
                return -2;
            }

            // Check if there is any open data blocks for the file
            const dataTSB = this.findOpenDataBlock();

            if (dataTSB === false) {
                // Return -3 to indicate there is no open data blocks for the file
                return -3;
            }


            // Create the directory file

            // Create first data file associated with directory file to prepare for writing


            // Return 1 if the file was created successfully with no error
            return 1;
        }

        // Issue #47 | Retrieve a directory file by filename
        public getDirectoryFileTSBByFilename(filename: string): any {
            // Loop through the sectors and blocks of the first track to find directory file with given file name
            for (let j = 0; j < _Disk.sections; j++) {
                for (let k = 0; k < _Disk.blocks; k++) {
                    // Create TSB object of the current TSB to check
                    const tsb = new TSB(this._DirectoryTrack, j, k);

                    // Get the data stored in the specified Directory TSB
                    // Need to read from the disk
                    const data = _Disk.readFromDisk(tsb);

                    console.log("FLAG 11");
                    console.log(data);

                    // The block is in use | It's in use block will be zero if it is indeed in use
                    if (this.blockIsInUse(data)) {
                        // Need to compare the data to the file name
                        // Either convert the filename to ascii... or the ascii to a string
                        const filenameData = data.substring(8);

                        const dataFilename = Utils.convertAsciiToString(filenameData);

                        console.log(dataFilename);

                        // Need to convert the last 60 bytes of data loaded from the TSB from "ascii" --> "string" then compare

                        // If the filename is equal to the data in the TSB, return the TSB 
                        if (filename == dataFilename) {
                            return tsb;
                        }
                    }
                    // If the block is in use we do not need to check if it is the block we are looking for
                }
            }

            // Return false if the file does not exist
            return false;
        }

        // Issue #47 | Find an open directory block. 
        // Returns TSB if there is an open directory block
        // Return false if there is no open directory block
        public findOpenDirectoryBlock(): any {
            // I suppose loop through the directory blocks and find one that is not in use then return the TSB for it

            // Loop through each directory block to find one thtat has a zero for in use
            for (let j = 0; j < _Disk.sections; j++) {
                for (let k = 0; k < _Disk.blockSize; k++) {
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
            return false;
        }

        // Issue #49 | Finds an open data block
        // Returns TSB if there is an open Data block
        // Returns false if there is no open data block
        public findOpenDataBlock(): any {

            // An open data block has not been found
            return false;
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
