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
const types_1 = require("../../types");
const reply_template_1 = require("../../util/reply-template");
const constants_1 = require("../../constants");
const core_1 = __importDefault(require("@actions/core"));
const exec_1 = __importDefault(require("@actions/exec"));
const github_1 = __importDefault(require("@actions/github"));
const fs_1 = __importDefault(require("fs"));
const revokeAuthorPermissionCommand = {
    name: 'revokeauthorpermission',
    requiredPermissionLevel: types_1.PermissionLevel.MAINTAINER,
    run: (command, userPermissionLevel) => __awaiter(void 0, void 0, void 0, function* () {
        const githubToken = core_1.default.getInput('github-token', { required: true });
        const octokit = github_1.default.getOctokit(githubToken);
        // read allowed users and add the issue author to it
        let allowedUsers = fs_1.default.readFileSync('./.allowed-users', 'utf-8');
        if (github_1.default.context.eventName !== 'issue_comment') {
            return;
        }
        const payload = github_1.default.context.payload;
        const removedUserId = payload.comment.user.id.toString();
        let allowedUserIds = allowedUsers.split('\n');
        if (!allowedUserIds.includes(removedUserId)) {
            yield octokit.rest.issues.createComment({
                owner: github_1.default.context.repo.owner,
                repo: github_1.default.context.repo.repo,
                issue_number: github_1.default.context.issue.number,
                body: (0, reply_template_1.renderReplyTemplate)(constants_1.ISSUE_REPLY_TEMPLATES.USER_NOT_APPROVED, {})
            });
            return;
        }
        allowedUserIds = allowedUserIds.filter(x => x != removedUserId);
        fs_1.default.writeFileSync('./.allowed-users', allowedUserIds.join('\n'), 'utf-8');
        yield exec_1.default.exec('git', ['config', 'user.name', 'fbtm-bot']);
        yield exec_1.default.exec('git', ['config', 'user.email', '<>']);
        yield exec_1.default.exec('git', ['add', '.']);
        yield exec_1.default.exec('git', ['commit', '-m', 'remove allowed user']);
        yield exec_1.default.exec('git', ['push', 'origin', 'main']);
        yield octokit.rest.issues.createComment({
            owner: github_1.default.context.repo.owner,
            repo: github_1.default.context.repo.repo,
            issue_number: github_1.default.context.issue.number,
            body: (0, reply_template_1.renderReplyTemplate)(constants_1.ISSUE_REPLY_TEMPLATES.APPROVED_USER_REMOVED, {
                'removed_user': payload.comment.user.login
            })
        });
    })
};
exports.default = revokeAuthorPermissionCommand;
