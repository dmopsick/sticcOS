// Based on deviceDriverKeyboard.ts
module TSOS {
    export class DeviceDriverFileSystem extends DeviceDriver {
        constructor() { 
            super();
            this.driverEntry = this.krnFileSystemDriverEntry;
        }

        public krnFileSystemDriverEntry() {
            this.status = "loaded";
        }

        // Issue #47 create the directory file
        public createFile(filename: string): number {            
            // Check if there is already a file with the specified name
            if (this.getDirectoryFileByFilename(filename)) {
                // Return -1 to indicate that the file already exists
                return -1;
            }

            // Check if there is any open directory blocks
            const directoryTSB = this.findOpenDirectoryBlock();

            // tsbToSave will === false if there is no open directory blocks
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

            console.log("Create file called with filename of  " + filename);

            // Create the directory file
            
            // Create first data file associated with directory file to prepare for writing

            
            // Return 1 if the file was created successfully with no error
            return 1;
        }

        // Issue #47 | Retrieve a directory file by filename
        public getDirectoryFileByFilename(filename: string): any {
            // Need to get file from directory

            // Loop through the sectors and blocks of the first track to inf
            for(let j = 0; j < _Disk.sections; j++) {
                for (let k = 0; k < _Disk.blocks; k++) {
                    // Check that the TSB is in use
                    const inUse = true; 
                    // Need to actually implement the in use check

                    if (inUse) {
                        // Need to compare the data to the file name
                        // Either convert the filename to ascii... or the ascii to a string

                        // If the filename is equal to the data in the TSB, return the TSB 
                        if (true) {
                            return new TSB(0, j, k);
                        }
                    }

                }
            }

            // Return false if the file does not exist
            return false;
        }

        // Issue #47 | Find an open directory block. 
        // Returns TSB if there is an open directory block
        // Return false if there is no open directory block
        public findOpenDirectoryBlock(): any {
            
            // If there is an open directory block return the TSB of it

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
    }
}
