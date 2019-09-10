/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = /** @class */ (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            _super.call(this) || this;
            _this.driverEntry = _this.krnKbdDriverEntry;
            _this.isr = _this.krnKbdDispatchKeyPress;
            return _this;
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if ((keyCode >= 65) && (keyCode <= 90)) { // letter
                if (isShifted === true) {
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                }
                else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode == 32) || // space
                (keyCode == 13) || // enter
                (keyCode == 9) || // tab
                (keyCode == 8) || // backspace
                (keyCode == 38) || // up key       
                (keyCode == 40)) { // down key
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            // Issue #5 Handle digits and shifted digits
            else if ((keyCode >= 48) && (keyCode <= 57)) {
                if (isShifted) {
                    switch (keyCode) {
                        case 48:
                            chr = String.fromCharCode(41); // )
                            break;
                        case 49:
                            chr = String.fromCharCode(33); // !
                            break;
                        case 50:
                            chr = String.fromCharCode(64); // @
                            break;
                        case 51:
                            chr = String.fromCharCode(35); // #
                            break;
                        case 52:
                            chr = String.fromCharCode(36); // $
                            break;
                        case 53:
                            chr = String.fromCharCode(37); // %
                            break;
                        case 54:
                            chr = String.fromCharCode(94); // ^
                            break;
                        case 55:
                            chr = String.fromCharCode(38); // &
                            break;
                        case 56:
                            chr = String.fromCharCode(42); // *
                            break;
                        case 57:
                            chr = String.fromCharCode(40); // (
                            break;
                    }
                }
                else {
                    chr = String.fromCharCode(keyCode); // Digits 0-9
                }
                _KernelInputQueue.enqueue(chr);
            }
            // Issue #5 Handle punctuations and shifted punctuations 
            // This is the same logic as above and could be all together in one giant switch and if statement
            // But I wanted to make it more readable
            else if ((keyCode >= 186) && (keyCode <= 192) ||
                ((keyCode >= 219) && (keyCode <= 222))) {
                if (isShifted) {
                    switch (keyCode) {
                        case 186:
                            chr = String.fromCharCode(58); // :
                            break;
                        case 187:
                            chr = String.fromCharCode(43); // +
                            break;
                        case 188:
                            chr = String.fromCharCode(60); // <
                            break;
                        case 189:
                            chr = String.fromCharCode(95); // _
                            break;
                        case 190:
                            chr = String.fromCharCode(62); // >
                            break;
                        case 191:
                            chr = String.fromCharCode(63); // ?
                            break;
                        case 192:
                            chr = String.fromCharCode(126); // ~
                            break;
                        case 219:
                            chr = String.fromCharCode(123); // {
                            break;
                        case 220:
                            chr = String.fromCharCode(124); // |
                            break;
                        case 221:
                            chr = String.fromCharCode(125); // }
                            break;
                        case 222:
                            chr = String.fromCharCode(34); // "
                            break;
                    }
                }
                else {
                    switch (keyCode) {
                        case 186:
                            chr = String.fromCharCode(59); // ;
                            break;
                        case 187:
                            chr = String.fromCharCode(61); // =
                            break;
                        case 188:
                            chr = String.fromCharCode(44); // ,
                            break;
                        case 189:
                            chr = String.fromCharCode(45); // -
                            break;
                        case 190:
                            chr = String.fromCharCode(46); // .
                            break;
                        case 191:
                            chr = String.fromCharCode(47); // /
                            break;
                        case 192:
                            chr = String.fromCharCode(96); // `
                            break;
                        case 219:
                            chr = String.fromCharCode(91); // [
                            break;
                        case 220:
                            chr = String.fromCharCode(92); // \
                            break;
                        case 221:
                            chr = String.fromCharCode(93); // ]
                            break;
                        case 222:
                            chr = String.fromCharCode(39); // '
                            break;
                    }
                    // chr = String.fromCharCode(keyCode); // Unshifted punctuation keys
                }
                _KernelInputQueue.enqueue(chr);
            }
        };
        return DeviceDriverKeyboard;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
