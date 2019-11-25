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
            // Initialize the data blocks to all "00"
            sessionStorage.disk = "HELLO WORLD";
            console.log(sessionStorage.disk);
        }
    }
}
