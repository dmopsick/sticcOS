// Issue #46 | Disk Implementation in HTML 5 Session Storage
module TSOS {

    export class Disk {

        public tracks: number;
        public sections: number;
        public blocks: number;
        public blockSize: number;

        constructor(tracks = 4, sections = 8, blocks = 8,  blockSize = 64) {
            this.tracks = tracks;
            this.sections = sections;
            this.blocks = blocks;
            this.blockSize = blockSize;
        }

        // Issue #46 | Format the disk 
        // Initalize the values
        public init(): void {
            // Initialize every single data block to "00"
            for(let i = 0; i < this.tracks; i++) {
                for (let j = 0; j < this.sections; j++) {
                    for(let k = 0; k < this.blocks; k++) {
                        // Need to write to the disk here 00
                    }
                }
            }
        }

        // Issue #46 | Write 
        public writeToDisk(tsb: TSB, data): void {
            // Set the data using the tsb as the key
            sessionStorage.setItem(tsb.getTSBKey(), data);

            // Update the HTML display
            // The HTML display must be implemented to update it 
        }
    } 
}
