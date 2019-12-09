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
// Based on deviceDriverKeyboard.ts
var TSOS;
(function (TSOS) {
    var DeviceDriverFileSystem = /** @class */ (function (_super) {
        __extends(DeviceDriverFileSystem, _super);
        function DeviceDriverFileSystem() {
            var _this = _super.call(this) || this;
            _this.driverEntry = _this.krnFileSystemDriverEntry;
            return _this;
        }
        DeviceDriverFileSystem.prototype.krnFileSystemDriverEntry = function () {
            this.status = "loaded";
        };
        // Issue #47 create the directory file
        DeviceDriverFileSystem.prototype.createFile = function (filename) {
            // Check if there is already a file with the specified name
            if (this.getDirectoryFileByFilename(filename)) {
                // Return -1 to indicate that the file already exists
                return -1;
            }
            // Check if there is any open space in the directory 
            var tsbToSave = this.findOpenDirectoryBlock();
            // tsbToSave will === false if there is no open directory blocks
            if (tsbToSave === false) {
                // Return -2 to indicate that there is no room to create files
                return -2;
            }
            // Check if there is any open space for data
            console.log("Create file called with filename of  " + filename);
            // Return 1 if the file was created successfully with no error
            return 1;
        };
        // Issue #47 | Retrieve a directory file by filename
        DeviceDriverFileSystem.prototype.getDirectoryFileByFilename = function (filename) {
            // Need to get file from directory
            // Return TSB if found
            // Return false if the file does not exist
            return false;
        };
        // Issue #47 | 
        DeviceDriverFileSystem.prototype.findOpenDirectoryBlock = function () {
            // If there is an open directory block return the TSB of it
            // Return false if there is no open directory block
            return false;
        };
        return DeviceDriverFileSystem;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
