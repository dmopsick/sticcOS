// Issue #46 | Disk Implementation in HTML 5 Session Storage
module TSOS {
    export class Disk {

        private tracks: number;
        private sections: number;
        private blocks: number;

        constructor(tracks = 4, sections = 8, blocks = 8) {
            this.tracks = tracks;
            this.sections = sections;
            this.blocks = blocks;
        }

        // Issue #46 | Format the disk 
        // Initalize the values
        public init(): void {
            // Initialize the data blocks to all "00"
        }
    }
}