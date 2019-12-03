module TSOS {
    export class TSB {
        constructor(public track: number,
                    public section: number,
                    public block: number
        ) {

        }

        // Issue #46 return the TSB formatted as key
        // returns T:S:B ex 0:0:1
        public getTSBKey(): string {
            return this.track + ":" + this.section + ":" + this.block;
        }

        // returns TSB ex 001
        public getRawTSB(): string {
            return this.track.toString() + this.section.toString() + this.block.toString();
        } 
    }
}
