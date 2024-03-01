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
exports.handleIssueComment = void 0;
const github_1 = __importDefault(require("@actions/github"));
const handler_1 = require("../command/handler");
const handleIssueComment = () => __awaiter(void 0, void 0, void 0, function* () {
    const payload = github_1.default.context.payload;
    // TODO: maybe custom prefix?
    if (!payload.comment.body.trim().startsWith('/')) {
        return;
    }
    // todo: surround with error check that creates an issue
    yield (0, handler_1.handleCommand)(payload.comment.body);
});
exports.handleIssueComment = handleIssueComment;
