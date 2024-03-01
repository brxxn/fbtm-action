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
const constants_1 = require("../constants");
const registry_1 = __importDefault(require("./search/registry"));
const io_1 = __importDefault(require("@actions/io"));
const performSearchForProduct = (rev, path, product) => __awaiter(void 0, void 0, void 0, function* () {
    yield io_1.default.mkdirP(`./searches/${product}/${rev}/`);
    let promises = [];
    for (const searchType of registry_1.default) {
        if (!searchType.supportedPlatforms.includes(product)) {
            continue;
        }
        const outputFile = `./searches/${product}/${rev}/${searchType.filename}`;
        promises.push(searchType.performSearch(`${path}/${product}/`, outputFile));
    }
    return (yield Promise.all(promises)).every(x => x);
});
const performSearch = (rev, path) => __awaiter(void 0, void 0, void 0, function* () {
    let promises = [];
    for (const product of constants_1.SUPPORTED_PRODUCTS) {
        promises.push(performSearchForProduct(rev, path, product));
    }
    return (yield Promise.all(promises)).every(x => x);
});
exports.default = performSearch;
