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
exports.runAction = void 0;
const github_1 = __importDefault(require("@actions/github"));
const issue_comment_1 = require("./handler/issue-comment");
const runAction = () => __awaiter(void 0, void 0, void 0, function* () {
    if (github_1.default.context.eventName === 'issue_comment') {
        yield (0, issue_comment_1.handleIssueComment)();
    }
    // TODO: potentially support other event types (like commit)
});
exports.runAction = runAction;
