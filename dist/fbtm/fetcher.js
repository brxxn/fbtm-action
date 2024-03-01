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
const io_1 = __importDefault(require("@actions/io"));
const constants_1 = require("../constants");
const fetchRevProduct = (rev, dir, product) => __awaiter(void 0, void 0, void 0, function* () {
    const fbUrl = `https://www.facebook.com/btarchive/${encodeURIComponent(rev)}/${product}`;
    yield io_1.default.mkdirP('./working/archives/');
    let exit = yield exec_1.default.exec('curl', [fbUrl, '-o', `./working/archive/${product}.zip`]);
    if (exit !== 0) {
        return false;
    }
    yield io_1.default.mkdirP(`${dir}/${product}/`);
    exit = yield exec_1.default.exec('tar', ['-xzf', `./working/archive/${product}.zip`, `${dir}/${product}/`]);
    return exit === 0;
});
const fetchRev = (rev, dir) => __awaiter(void 0, void 0, void 0, function* () {
    let promises = [];
    for (const product of constants_1.SUPPORTED_PRODUCTS) {
        promises.push(fetchRevProduct(rev, dir, product));
    }
    return (yield Promise.all(promises)).every(x => x);
});
exports.default = fetchRev;
