/* --------
   Utils.ts

   Utility functions.
   -------- */

module TSOS {

    export class Utils {

        public static trim(str): string {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            Huh? WTF? Okay... take a breath. Here we go:
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
        }

        public static rot13(str: string): string {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal: string = "";
            for (var i in <any>str) {    // We need to cast the string to any for use in the for...in construct.
                var ch: string = str[i];
                var code: number = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) - 13;  // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                } else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }

        // Issue #27 Helper class to format values into hex for displaying on the HTML dashboard
        // Moved this class to Utils rather than Control because accessed it from CPU as well
        public static displayHex(numToDisplay: number): string {
            return numToDisplay.toString(16).toUpperCase();
        }

        // Issue #47 | Convert ascii to string
        // Used in getting string of filename from the disk
        // THIS MAY NEED TO BE CHANGED SINCE SAVING IN HEX IDK KNOW MAYBE NEED TO CONVERT HEX TO ASCII IDK
        public static convertHexToString(asciiString: string): string {
            // Make variable to hold the string being built from asci
            let convertedString = "";

            // ASCII is two characters at a time for one character so need to read the string two characters at a time
            for (let i = 0; i < asciiString.length; i+=2) {
                const hexCodeString = asciiString[i] + asciiString[i + 1];
                // console.log("FLAG 6 " + hexCodeString);
                // If the double zero filled data has been reached, exit the loop. String is complete
                if (hexCodeString == "00") {
                    break;
                }

                // console.log("Hex code string: " + hexCodeString);

                const asciiCode = parseInt(hexCodeString, 16);

                // console.log("Converted hex code: " + asciiCode);

                const convertedChar = String.fromCharCode(asciiCode);

                convertedString += convertedChar;
            }
            return convertedString;
        }

        // Issue #47 | Converts a string to hex
        // Converts the string to hex in order to be saved on the disk
        public static convertStringToHex(stringToConvert: string): string {
            // Create variable to hold the built hex value
            let hexString = "";

            for (let i = 0; i < stringToConvert.length; i++) {
                // Convert each character in the string to its hex value
                const hexChar = stringToConvert.charCodeAt(i).toString(16);

                // Build the hex string char (brick) by char (brick) !!
                hexString += hexChar;
            }

            return hexString;
        }
    }
}
