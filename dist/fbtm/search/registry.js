"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsRouteBuilder_1 = __importDefault(require("./types/jsRouteBuilder"));
const relayOperation_1 = __importDefault(require("./types/relayOperation"));
const xcontroller_1 = __importDefault(require("./types/xcontroller"));
const searchRegistry = [
    jsRouteBuilder_1.default,
    relayOperation_1.default,
    xcontroller_1.default
];
exports.default = searchRegistry;
