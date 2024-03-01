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
exports.handleCommand = void 0;
const types_1 = require("../types");
const registry_1 = __importDefault(require("./registry"));
const core_1 = __importDefault(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
const fs_1 = __importDefault(require("fs"));
const constants_1 = require("../constants");
const reply_template_1 = require("../util/reply-template");
const handleCommand = (commandText) => __awaiter(void 0, void 0, void 0, function* () {
    const commandName = commandText.trim().split(/\s+/)[0].replace('/', '').toLowerCase();
    const githubToken = core_1.default.getInput('github-token', { required: true });
    const octokit = github_1.default.getOctokit(githubToken);
    try {
        for (const registeredCommand of registry_1.default) {
            if (registeredCommand.name === commandName) {
                let userPermissionLevel = types_1.PermissionLevel.GUEST;
                // handle user permissions for issue comment
                if (github_1.default.context.eventName === 'issue_comment') {
                    const payload = github_1.default.context.payload;
                    if (payload.comment.author_association === 'OWNER') {
                        userPermissionLevel = types_1.PermissionLevel.OWNER;
                    }
                    else if (payload.comment.author_association === 'COLLABORATOR') {
                        userPermissionLevel = types_1.PermissionLevel.MAINTAINER;
                    }
                    else {
                        const authorId = payload.comment.user.id;
                        const allowedUsers = fs_1.default.readFileSync('./.allowed-users', 'utf-8').split('\n');
                        if (allowedUsers.includes(authorId.toString())) {
                            userPermissionLevel = types_1.PermissionLevel.ALLOWED_USER;
                        }
                    }
                }
                // check if the user has sufficient permissions
                if (registeredCommand.requiredPermissionLevel < userPermissionLevel) {
                    const replyTemplate = (registeredCommand.requiredPermissionLevel === types_1.PermissionLevel.ALLOWED_USER ?
                        constants_1.ISSUE_REPLY_TEMPLATES.ALLOWED_USER_REQUIRED :
                        constants_1.ISSUE_REPLY_TEMPLATES.PERMISSION_REQUIRED);
                    const replyBody = (0, reply_template_1.renderReplyTemplate)(replyTemplate, {});
                    yield octokit.rest.issues.createComment({
                        owner: github_1.default.context.repo.owner,
                        repo: github_1.default.context.repo.repo,
                        issue_number: github_1.default.context.issue.number,
                        body: replyBody
                    });
                    return;
                }
                // run the command
                yield registeredCommand.run(commandText, userPermissionLevel);
                break;
            }
        }
    }
    catch (exception) {
        // reply with internal server error
        const replyBody = (0, reply_template_1.renderReplyTemplate)(constants_1.ISSUE_REPLY_TEMPLATES.INTERNAL_SERVER_ERROR, {});
        yield octokit.rest.issues.createComment({
            owner: github_1.default.context.repo.owner,
            repo: github_1.default.context.repo.repo,
            issue_number: github_1.default.context.issue.number,
            body: replyBody
        });
        // rethrow the exception so it is visible in logs
        throw exception;
    }
});
exports.handleCommand = handleCommand;
