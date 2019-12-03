module TSOS {
    export class TSB {
        constructor(public track: number,
                    public section: number,
                    public block: number
        ) {

        }

        // Issue #46 return the TSB formatted as key
        // T:S:B
        public getTSBKey(): string {
            return this.track + ":" + this.section + ":" + this.block;
        }
    }
}
