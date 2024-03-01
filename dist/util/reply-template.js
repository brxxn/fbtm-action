"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderReplyTemplate = void 0;
const constants_1 = require("../constants");
const github_1 = __importDefault(require("@actions/github"));
const renderReplyTemplate = (template, variables) => {
    // prefilling common variables
    variables['action_log_url'] = `https://github.com/${github_1.default.context.repo.owner}/${github_1.default.context.repo.repo}/actions/runs/${github_1.default.context.runNumber}`;
    variables['run_id'] = github_1.default.context.runId.toString();
    variables['run_number'] = github_1.default.context.runNumber.toString();
    // TODO: handle other types
    if (github_1.default.context.eventName === 'issue_comment') {
        const payload = github_1.default.context.payload;
        variables['user_id'] = payload.comment.user.id.toString();
        variables['username'] = payload.comment.user.login;
    }
    // render actual template
    let response = `${template.emoji} ${template.title}\n\n${template.body}\n\n${constants_1.TEMPLATE_FOOTER}`;
    for (const variable in variables) {
        response = response.replaceAll(`{{ ${variable} }}`, variables[variable]);
    }
    return response;
};
exports.renderReplyTemplate = renderReplyTemplate;
