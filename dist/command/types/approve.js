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
const io_1 = __importDefault(require("@actions/io"));
const fs_1 = __importDefault(require("fs"));
const fetcher_1 = __importDefault(require("../../fbtm/fetcher"));
const searcher_1 = __importDefault(require("../../fbtm/searcher"));
const diff_1 = __importDefault(require("../../fbtm/diff"));
const approveCommand = {
    name: 'approve',
    requiredPermissionLevel: types_1.PermissionLevel.ALLOWED_USER,
    run: (command, userPermissionLevel) => __awaiter(void 0, void 0, void 0, function* () {
        const githubToken = core_1.default.getInput('github-token', { required: true });
        const octokit = github_1.default.getOctokit(githubToken);
        const replyWithTemplate = (template, variables) => __awaiter(void 0, void 0, void 0, function* () {
            const body = (0, reply_template_1.renderReplyTemplate)(template, variables);
            yield octokit.rest.issues.createComment({
                owner: github_1.default.context.repo.owner,
                repo: github_1.default.context.repo.repo,
                issue_number: github_1.default.context.issue.number,
                body
            });
        });
        // we will just check flags with flags.include(flag), not registering them
        // in some other weird convoluted way because i don't feel like it.
        // only downside is we don't get to list flags
        let flags = command.split(/\s+/).map(x => x.trim()).map(x => x.toLowerCase());
        // check to see if there are any maintainer flags
        if (userPermissionLevel > types_1.PermissionLevel.MAINTAINER) {
            for (const maintainerOnlyFlag of constants_1.MAINTAINER_ONLY_FLAGS) {
                if (flags.includes(maintainerOnlyFlag)) {
                    yield replyWithTemplate(constants_1.ISSUE_REPLY_TEMPLATES.FLAG_REQUIRES_MAINTAINER, {
                        flag: maintainerOnlyFlag
                    });
                    return;
                }
            }
        }
        // find the rev in issue
        const payload = github_1.default.context.payload;
        // find if fb-rev: in title
        const titleParts = payload.issue.title.split(' ');
        let rev = '';
        for (const partIndex in titleParts) {
            if (titleParts[partIndex] === 'fb-rev:' && parseInt(partIndex) + 1 !== titleParts.length) {
                if (rev !== '') {
                    // throw duplicate error
                    yield replyWithTemplate(constants_1.ISSUE_REPLY_TEMPLATES.MULTIPLE_REVS, {});
                    return;
                }
                rev = titleParts[parseInt(partIndex) + 1];
            }
        }
        // find if there is an fb-rev: in body
        const bodyParts = payload.issue.body.split('\n').map(x => x.trim())
            .map(x => x.split(': '))
            .filter(x => x.length === 2 && x[0] === 'fb-rev');
        if (bodyParts.length > 0) {
            if (rev === '' || bodyParts.length <= 2) {
                yield replyWithTemplate(constants_1.ISSUE_REPLY_TEMPLATES.MULTIPLE_REVS, {});
                return;
            }
            rev = bodyParts[0][1];
        }
        // make sure we have a rev and that it looks like a rev
        if (rev === '' || (!flags.includes('unsupported-skipvalidrevcheck') || !rev.match(/^[0-9]+$/))) {
            yield replyWithTemplate(constants_1.ISSUE_REPLY_TEMPLATES.REV_NOT_FOUND, {});
            return;
        }
        // look at current rev and make sure this is newer
        let currentRev = flags.includes('initialrev') ? 0 : parseInt(fs_1.default.readFileSync('./.current-rev', 'utf-8'));
        if (parseInt(rev) <= currentRev && !flags.includes('dangerously-process-old-rev') && !flags.includes('compare-to-current')) {
            yield replyWithTemplate(constants_1.ISSUE_REPLY_TEMPLATES.REV_TOO_OLD, {
                rev,
                current_rev: currentRev.toString()
            });
            return;
        }
        // create processing message
        const processingMessage = yield octokit.rest.issues.createComment({
            owner: github_1.default.context.repo.owner,
            repo: github_1.default.context.repo.repo,
            issue_number: github_1.default.context.issue.number,
            body: (0, reply_template_1.renderReplyTemplate)(constants_1.ISSUE_REPLY_TEMPLATES.PROCESSING_REV, {})
        });
        const updateProcessing = (template, variables) => __awaiter(void 0, void 0, void 0, function* () {
            const body = (0, reply_template_1.renderReplyTemplate)(template, variables);
            yield octokit.rest.issues.updateComment({
                owner: github_1.default.context.repo.owner,
                repo: github_1.default.context.repo.repo,
                comment_id: processingMessage.data.id,
                body
            });
        });
        const revDirectory = flags.includes('compare-to-current') ? './working/js/' : './current/';
        // clear out current if not comparing
        if (!flags.includes('compare-to-current')) {
            yield io_1.default.rmRF('./current/');
            yield io_1.default.mkdirP('./current/');
        }
        // fetch the archive of the rev from facebook
        const fetchResult = yield (0, fetcher_1.default)(rev, revDirectory);
        if (!fetchResult) {
            yield updateProcessing(constants_1.ISSUE_REPLY_TEMPLATES.FAILED_TO_FETCH_REV, {});
            return;
        }
        // perform search for new archives
        if (!flags.includes('skip-search')) {
            const searchResult = yield (0, searcher_1.default)(rev, revDirectory);
            if (!searchResult && !flags.includes('ignore-search-error')) {
                yield updateProcessing(constants_1.ISSUE_REPLY_TEMPLATES.FAILED_TO_SEARCH_REV, {});
                return;
            }
        }
        // perform the diff
        if (!flags.includes('initialrev') && !flags.includes('skip-diff')) {
            const diffResult = yield (0, diff_1.default)(currentRev.toString(), rev);
            if (!diffResult && !flags.includes('ignore-failed-diff')) {
                yield updateProcessing(constants_1.ISSUE_REPLY_TEMPLATES.FAILED_TO_DIFF_REV, {});
                return;
            }
        }
        // update the current rev file
        fs_1.default.writeFileSync(`./.current-rev`, rev, 'utf-8');
        yield exec_1.default.exec('git', ['config', 'user.name', 'fbtm-bot']);
        yield exec_1.default.exec('git', ['config', 'user.email', '<>']);
        yield exec_1.default.exec('git', ['add', '.']);
        yield exec_1.default.exec('git', ['commit', '-m', `process rev ${rev} (#${github_1.default.context.issue.number})`]);
        yield exec_1.default.exec('git', ['push', 'origin', 'main']);
        // fetch the ref
        const updatedRepo = yield octokit.rest.repos.getBranch({
            owner: github_1.default.context.repo.owner,
            repo: github_1.default.context.repo.repo,
            branch: 'main'
        });
        const updatedRef = updatedRepo.data.commit.sha;
        // finally, update our message.
        yield updateProcessing(constants_1.ISSUE_REPLY_TEMPLATES.REV_PROCESSED, {
            ref: updatedRef
        });
    })
};
exports.default = approveCommand;
