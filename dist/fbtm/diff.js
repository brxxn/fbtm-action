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
const io_1 = __importDefault(require("@actions/io"));
const fs_1 = __importDefault(require("fs"));
const registry_1 = __importDefault(require("./search/registry"));
const constants_1 = require("../constants");
const diffFile = (oldFile, newFile, outputFile) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: rework this!!
    // I believe it is incredibly inefficient in terms of both memory and CPU
    // and something better can definitely be done here.
    const oldContent = fs_1.default.readFileSync(oldFile, 'utf-8').split('\n');
    const newContent = fs_1.default.readFileSync(newFile, 'utf-8').split('\n');
    const added = newContent.filter(x => !oldContent.includes(x));
    const removed = oldContent.filter(x => !newContent.includes(x));
    const content = `// new lines (count = ${added.length}):\n\n${added.join('\n')}\n\n// old lines (count = ${removed.length})\n\n${removed.join('\n')}`;
    fs_1.default.writeFileSync(outputFile, content, { encoding: 'utf-8', mode: 'a' });
});
const performDiffForProduct = (oldRev, newRev, product) => __awaiter(void 0, void 0, void 0, function* () {
    const oldSearchRoot = `./search/${product}/${oldRev}/`;
    const newSearchRoot = `./search/${product}/${newRev}/`;
    const outputRoot = `./diff/${product}/${oldRev}-${newRev}/`;
    yield io_1.default.mkdirP(outputRoot);
    let promises = [];
    for (const searchType of registry_1.default) {
        const oldSearchFile = oldSearchRoot + searchType.filename;
        if (!fs_1.default.existsSync(oldSearchFile)) {
            return false;
        }
        const newSearchFile = newSearchRoot + searchType.filename;
        promises.push(diffFile(oldSearchFile, newSearchFile, outputRoot + searchType.filename));
    }
    return true;
});
const performDiff = (oldRev, newRev) => __awaiter(void 0, void 0, void 0, function* () {
    let promises = [];
    for (const product of constants_1.SUPPORTED_PRODUCTS) {
        promises.push(performDiffForProduct(oldRev, newRev, product));
    }
    return (yield Promise.all(promises)).every(x => x);
});
exports.default = performDiff;
