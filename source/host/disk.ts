// Issue #46 | Disk Implementation in HTML 5 Session Storage
module TSOS {

    export class Disk {

        public tracks: number;
        public sections: number;
        public blocks: number;
        public blockSize: number;
        public isFormatted: boolean;

        constructor(tracks = 4, sections = 8, blocks = 8, blockSize = 64) {
            this.tracks = tracks;
            this.sections = sections;
            this.blocks = blocks;
            this.blockSize = blockSize;
            this.isFormatted = false; // When the OS is started up the disk is not formatted
        }

        // Issue #46 | Format the disk 
        // Initalize the values
        public init(): void {
            // Initialize every single data block to "00"
            for (let i = 0; i < this.tracks; i++) {
                for (let j = 0; j < this.sections; j++) {
                    for (let k = 0; k < this.blocks; k++) {
                        let data = "";

                        // Handle MBR as special case 
                        if (i == 0 && j == 0 && k == 0) {
                            // Set the first available directory and file entry 
                            // 0 For in use | 0 for next | 001 for next dir | 100 for next file
                            // What do I want to put in the MBR? May change this
                            data += "01000000000001010000";
                        }
                        else {
                            // Fill in basic data with 00 for in use and place holder for the nextTSB
                            data += "000-0-0-";
                        }

                        // Create TSB to write to the disk with
                        const tsb = new TSB(i, j, k);
                        // Write a blank block to the disk, the zero fill write will fill in the 00s.
                        this.writeToDisk(tsb, data);
                    }
                }
            }
            // The Disk has been formatted | Limit disk actions if the disk is not formatted
            this.isFormatted = true;
        }

        // Issue #46 | Write to the disk with zero fill to fit block size
        public writeToDisk(tsb: TSB, data: string): void {
            // Create variable to hold the value of the data with the zero fill
            let zeroFilledData = data;

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
        }

        // Issue #46 #47 | Read data from the disk with a given TSB
        public readFromDisk(tsb: TSB): string {
            // Return the data associated with the given TSB key
            return sessionStorage.getItem(tsb.getTSBKey());
        }
    }
}
