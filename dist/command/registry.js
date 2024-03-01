"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const approve_1 = __importDefault(require("./types/approve"));
const grantauthorpermission_1 = __importDefault(require("./types/grantauthorpermission"));
const revokeauthorpermission_1 = __importDefault(require("./types/revokeauthorpermission"));
const CommandRegistry = [
    approve_1.default,
    grantauthorpermission_1.default,
    revokeauthorpermission_1.default
];
exports.default = CommandRegistry;
