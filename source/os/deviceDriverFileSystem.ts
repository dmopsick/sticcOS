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
        public createFile(filename: string) {            
            // Check if there is already a file with the specified name
            console.log("Create file called with filename of  " + filename);
        }

    }
}
