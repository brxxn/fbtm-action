"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const exec_1 = __importDefault(require("@actions/exec"));
const fs_1 = __importDefault(require("fs"));
const jsRoutePathSearch = {
    filename: 'js-route-builder.js',
    supportedPlatforms: [
        'facebook',
        'instagram',
        'messenger',
        'whatsapp' // i don't know if whatsapp uses this but might as well
    ],
    shouldDiff: true,
    performSearch: (targetDirectory, outputFile) => __awaiter(void 0, void 0, void 0, function* () {
        const outputStream = fs_1.default.createWriteStream(outputFile, { flags: 'a' });
        const result = yield exec_1.default.exec('grep', ['-Rh', 'jsRouteBuilder")("', targetDirectory], {
            outStream: outputStream
        });
        return result === 0;
    })
};
exports.default = jsRoutePathSearch;
