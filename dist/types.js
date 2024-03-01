"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionLevel = void 0;
;
var PermissionLevel;
(function (PermissionLevel) {
    PermissionLevel[PermissionLevel["OWNER"] = 0] = "OWNER";
    PermissionLevel[PermissionLevel["MAINTAINER"] = 1] = "MAINTAINER";
    PermissionLevel[PermissionLevel["ALLOWED_USER"] = 2] = "ALLOWED_USER";
    PermissionLevel[PermissionLevel["GUEST"] = 3] = "GUEST";
})(PermissionLevel || (exports.PermissionLevel = PermissionLevel = {}));
;
;
;
