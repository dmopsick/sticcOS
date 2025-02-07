// Based on deviceDriverKeyboard.ts
module TSOS {
    export class DeviceDriverFileSystem extends DeviceDriver {
        // Constants that will be used in one or more file functions
        private _DirectoryTrack: number = 0;
        private _FirstDataTrack: number = 1;
        private _InUseDataByte: string = "01";
        private _NotInUseDataByte: string = "00";
        private _NextBlockPlaceholder: string = "0-0-0-";

        constructor() {
            super();
            this.driverEntry = this.krnFileSystemDriverEntry;
        }

        public krnFileSystemDriverEntry() {
            this.status = "loaded";
        }

        // Issue #47 | Create the directory entry for a file
        // Retruns a number that indicates the status of the create in order to be R E S P O N S I V E
        public createFile(filename: string): number {
            // Check if there is already a file with the specified name | Will return false if the file does not exist
            if (this.getDirectoryBlockTSBByFilename(filename) !== null) {
                // Return -1 to indicate that the file already exists
                return -1;
            }

            // Check if there is any open directory blocks
            const directoryTSB: TSB = this.findOpenDirectoryBlock();

            // console.log("Directory TSB");
            // console.log(directoryTSB);

            // directoryTSB will === false if there is no open directory blocks
            if (directoryTSB === null) {
                // Return -2 to indicate that there is no room to create files
                return -2;
            }

            // Check if there is any open data blocks for the file
            const dataTSB: TSB = this.findOpenDataBlock();

            // console.log("Data TSB");
            // console.log(dataTSB);

            if (dataTSB === null) {
                // Return -3 to indicate there is no open data blocks for the file
                return -3;
            }

            // Convert filename to Hex
            const hexFilename = Utils.convertStringToHex(filename);

            // Generate data to save to directory TSB .. ex: 01 for isactive, TSB of data, and filename
            const directoryBlockData = this._InUseDataByte + dataTSB.getTSBByte() + hexFilename;

            // Create the directory file
            _Disk.writeToDisk(directoryTSB, directoryBlockData);

            // Generate data to initialize data block
            const dataBlockData = this._InUseDataByte + this._NextBlockPlaceholder;

            // Create data file
            _Disk.writeToDisk(dataTSB, dataBlockData);

            // Return 1 if the file was created successfully with no error
            return 1;
        }

        // Issue #47 | Write the data contents of a file
        // Destructive write, overwrites any existing data, can not append contents of file
        // Returns an int that indicates the status to the shell in order to be responsive
        public writeFile(filename: string, data: string): number {
            // Get TSB for specified file
            const directoryTSB = this.getDirectoryBlockTSBByFilename(filename);

            if (directoryTSB === null) {
                // Return -1 represents that there is no directory file for specified filename
                return -1;
            }

            // To make it a destructive write, delete the current data associated with this file | True to signifiy overwrite
            this.deleteDataBlocksByDirectoryTSB(directoryTSB, true);

            // Read the data in the directory to find the value of the first TSB for data block
            let dataTSB = this.getNextTSBByTSB(directoryTSB); // Need to get the next TSB from the directory data and use it as location of first data block to save

            // There is open blocks and the file exists... convert the data to hex
            let hexData = Utils.convertStringToHex(data);

            // Loop through the data as many times as it takes and save the data to data block(s)
            // Write the file 60 bytes at a time
            while (hexData.length > 0) {
                if (dataTSB === null) {
                    // Returning -2 means that there are no open data blocks in the system
                    return -2;
                }

                // Get the first block size (60) bytes to save to this data block | Times two because each byte is two characters
                const hexDataHead = hexData.substring(0, (_Disk.blockSize * 2));

                // Remove the hexDataHead that has been saved from the hexData to leave remaining data
                hexData = hexData.slice(_Disk.blockSize * 2);

                // Create a variable to hold the data to save... with the inuse block and the proper nextTSB data
                let dataToSave = this._InUseDataByte;

                // Mark this TSB as inuse real quick so finding an open data block does not choose this one! We already using it!
                _Disk.writeToDisk(dataTSB, dataToSave);

                // Variable for next TSB if needed
                let nextTSB = null;

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
                }

                // console.log("FLAG 15: " + hexData.length);
                // console.log(Utils.convertHexToString(hexDataHead));
                // Need to sure I can read the file to verify that I did this correctly.
            }
            // Return 1 if file was written to succesfully
            return 1;
        }


        // Issue #47 | Reads and returns the contents of a file by specified filename
        // Will need to go through each data TSB and build a big ol string to return
        public readFile(filename: string): string {
            const directoryTSB = this.getDirectoryBlockTSBByFilename(filename);

            if (directoryTSB === null) {
                return "Error: File not found.";
            }

            // Create a variable to hold the string we are building
            let fileContents = "";

            // Get the first data TSB
            let dataTSB = this.getNextTSBByTSB(directoryTSB);

            // Read the file data block by data block
            while (dataTSB !== null) {
                // Get the hex file data from disk
                const data = this.getDataStringByTSB(dataTSB);

                // Add it to the fileContents string
                fileContents += data;

                // Move onto the next TSB (if it exists)
                dataTSB = this.getNextTSBByTSB(dataTSB);
            }

            // Return a message if the file is empty
            if (fileContents === "") {
                return "File " + filename + " is empty.";
            }

            // Need to handle what I want to return for an empty file
            return fileContents;
        }

        // Issue #47 | Deletes a file 
        // Delete the Directory TSB and the associated data TSBs
        public deleteFile(filename: string): number {
            // Get the directory TSB of the file we want to delete
            const directoryTSB = this.getDirectoryBlockTSBByFilename(filename);

            if (directoryTSB === null) {
                // The file the user wants to delete does not exist
                return -1;
            }

            // Delete the associated data blocks
            this.deleteDataBlocksByDirectoryTSB(directoryTSB, false);

            // Delete the directory entry
            this.deleteSingleTSB(directoryTSB);

            // Returning 1 means deletion went as planned
            return 1;
        }

        // Issue #47 | Display a list of in use files
        public listActiveFiles(includeSecret: boolean = false): string[] {
            // Create variable to hold list of the file names
            const fileList = [];

            // Loop through the directory blocks and add the name of all active files to the list
            for (let j = 0; j < _Disk.sections; j++) {
                for (let k = 1; k < _Disk.blocks; k++) {
                    // Get TSB of each directory Block
                    const tsb = new TSB(this._DirectoryTrack, j, k);

                    // Get the data stored stored in specified directory TSB
                    const data = _Disk.readFromDisk(tsb);

                    // Check if the block is in use
                    if (this.blockIsInUse(data)) {
                        // Strip out the in use and next TSB bytes
                        const hexFilenameData = data.substring(8);

                        // Convert filename from hex to ENGLISH
                        const convertedFilename = Utils.convertHexToString(hexFilenameData);

                        // If including the secret files, let it rip
                        if (includeSecret) {
                            fileList.push(convertedFilename);
                        }
                        else {
                            if (convertedFilename[0] != '.') {
                                fileList.push(convertedFilename);
                            }
                        }
                    }
                }
            }

            return fileList;
        }

        /*  Util Functions */

        // Issue #47 | Retrieve a directory file by filename
        public getDirectoryBlockTSBByFilename(filename: string): TSB {
            // Loop through the sectors and blocks of the first track to find directory file with given file name
            for (let j = 0; j < _Disk.sections; j++) {
                for (let k = 0; k < _Disk.blocks; k++) {
                    // Create TSB object of the current TSB to check
                    const tsb = new TSB(this._DirectoryTrack, j, k);

                    // Get the data stored in the specified directory TSB
                    const data = _Disk.readFromDisk(tsb);

                    // The block is in use | It's in use block will be zero if it is indeed in use
                    if (this.blockIsInUse(data)) {
                        // Strip out the in use and next TSB bytes
                        const filenameData = data.substring(8);

                        // Convert filename from hex to ENGLISH
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

                        if (!this.blockIsInUse(data)) {
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
                throw Error("Invalid byte for inUse: " + inUseByte);
            }
        }

        // Issue #47 | Returns the data from a TSB
        // Ignores the inUse and next TSB byetes, just returns the data
        public getDataStringByTSB(tsb: TSB): string {
            // Get the raw hex data from the disk
            const rawHexData = _Disk.readFromDisk(tsb);

            // Trim the hex data to remove next TSB and inUse
            const trimmedHexData = rawHexData.slice(8);

            // Conver the hex data to a normal string
            const convertedData = Utils.convertHexToString(trimmedHexData);

            return convertedData;
        }

        // Issue #47 | Returns the next TSB pointed to by a TSB
        // Used to get the next TSB from a directory block to find the first data block
        // Or when there are multiple data blocks to move from block to block
        private getNextTSBByTSB(tsb: TSB): TSB {
            const rawHexData = _Disk.readFromDisk(tsb);

            // Extract the track, sector, and block byte to be used to create a TSB
            // Track is element 3, Section 5, Block 7 ... because it goes in use then TSB... ex: 01 01 00 01
            const trackString = rawHexData[3];
            const sectionString = rawHexData[5];
            const blockString = rawHexData[7];

            // If the next TSB is equal to the placeholder value of  - - - then there is no next TSB! 
            if ((trackString === sectionString && trackString === blockString) && trackString === "-") {
                return null;
            }

            // Parse the Track, Section, Block values as ints
            const track = parseInt(trackString, 16)
            const section = parseInt(sectionString, 16);
            const block = parseInt(blockString, 16);

            // Create TSB object to return of the next TSB
            const nextTSB = new TSB(track, section, block);

            return nextTSB;
        }

        // Issue #47 | Makes all data files associated with TSB no longer inUse
        // Will be used for overwriting files and deleting files
        // Deleting in this conext means to make the block inactive and zero filled
        // If overwrite is true then it keeps the first data block as being active
        public deleteDataBlocksByDirectoryTSB(directoryTSB: TSB, overwrite: boolean = false): void {
            // Keep track of the first data block TSB to keep it active
            const firstDataTSB = this.getNextTSBByTSB(directoryTSB);

            // Get the first data TSB to delete
            let dataTSB = firstDataTSB

            // While loop to keep checking if there is a next tsb and then selecting that 
            while (dataTSB !== null) {
                // Check if there is a next TSB after this 
                const nextTSB = this.getNextTSBByTSB(dataTSB);

                let resetData = "";

                // Keep the first data block active
                if ((dataTSB.getRawTSB() == firstDataTSB.getRawTSB()) && overwrite) {
                    resetData = this._InUseDataByte + this._NextBlockPlaceholder;
                }
                else {
                    resetData = this._NotInUseDataByte + this._NextBlockPlaceholder;
                }

                // Overwrite the dataTSB and make it inactive
                _Disk.writeToDisk(dataTSB, resetData);

                // Set the nextTSB as the next TSB to work with
                dataTSB = nextTSB;
            }
        }

        // Issue #47 | Delete a Directory TSB
        public deleteSingleTSB(tsb: TSB): void {
            const resetData = this._NotInUseDataByte + this._NextBlockPlaceholder;

            _Disk.writeToDisk(tsb, resetData);
        }
    }
}
