import { Command, IssueReplyTemplate, PermissionLevel } from "../../types";
import { renderReplyTemplate } from "../../util/reply-template";
import { ISSUE_REPLY_TEMPLATES, MAINTAINER_ONLY_FLAGS } from "../../constants";
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as github from '@actions/github';
import * as io from '@actions/io';
import { IssueCommentEvent } from "@octokit/webhooks-definitions/schema";
import * as fs from 'fs';
import fetchRev from "../../fbtm/fetcher";
import performSearch from "../../fbtm/searcher";
import performDiff from "../../fbtm/diff";

const approveCommand: Command = {
  name: 'approve',
  requiredPermissionLevel: PermissionLevel.ALLOWED_USER,
  run: async (command: string, userPermissionLevel: PermissionLevel) => {
    const githubToken = core.getInput('github-token', { required: true });
    const octokit = github.getOctokit(githubToken);

    const replyWithTemplate = async (template: IssueReplyTemplate, variables: {[key: string]: string}) => {
      const body = renderReplyTemplate(template, variables);
      await octokit.rest.issues.createComment({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: github.context.issue.number,
        body
      });
    };

    // we will just check flags with flags.include(flag), not registering them
    // in some other weird convoluted way because i don't feel like it.
    // only downside is we don't get to list flags
    let flags = command.split(/\s+/).map(x => x.trim()).map(x => x.toLowerCase());

    // check to see if there are any maintainer flags
    if (userPermissionLevel > PermissionLevel.MAINTAINER) {
      for (const maintainerOnlyFlag of MAINTAINER_ONLY_FLAGS) {
        if (flags.includes(maintainerOnlyFlag)) {
          await replyWithTemplate(ISSUE_REPLY_TEMPLATES.FLAG_REQUIRES_MAINTAINER, {
            flag: maintainerOnlyFlag
          });
          return;
        }
      }
    }

    // find the rev in issue
    const payload = github.context.payload as IssueCommentEvent;

    // find if fb-rev: in title
    const titleParts = payload.issue.title.split(' ');
    let rev = '';
    for (const partIndex in titleParts) {
      if (titleParts[partIndex] === 'fb-rev:' && parseInt(partIndex) + 1 !== titleParts.length) {
        if (rev !== '') {
          // throw duplicate error
          await replyWithTemplate(ISSUE_REPLY_TEMPLATES.MULTIPLE_REVS, {});
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
        await replyWithTemplate(ISSUE_REPLY_TEMPLATES.MULTIPLE_REVS, {});
        return;
      }
      rev = bodyParts[0][1];
    }

    // make sure we have a rev and that it looks like a rev
    if (rev === '' || (!flags.includes('unsupported-skipvalidrevcheck') || !rev.match(/^[0-9]+$/))) {
      await replyWithTemplate(ISSUE_REPLY_TEMPLATES.REV_NOT_FOUND, {});
      return;
    }

    // look at current rev and make sure this is newer
    let currentRev = flags.includes('initialrev') ? 0 : parseInt(fs.readFileSync('./.current-rev', 'utf-8'));
    if (parseInt(rev) <= currentRev && !flags.includes('dangerously-process-old-rev') && !flags.includes('compare-to-current')) {
      await replyWithTemplate(ISSUE_REPLY_TEMPLATES.REV_TOO_OLD, {
        rev,
        current_rev: currentRev.toString()
      });
      return;
    }

    // create processing message
    const processingMessage = await octokit.rest.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number,
      body: renderReplyTemplate(ISSUE_REPLY_TEMPLATES.PROCESSING_REV, {})
    });

    const updateProcessing = async (template: IssueReplyTemplate, variables: {[key: string]: string}) => {
      const body = renderReplyTemplate(template, variables);
      await octokit.rest.issues.updateComment({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        comment_id: processingMessage.data.id,
        body
      });
    };
    
    const revDirectory = flags.includes('compare-to-current') ? './working/js/' : './current/';

    // clear out current if not comparing
    if (!flags.includes('compare-to-current')) {
      await io.rmRF('./current/');
      await io.mkdirP('./current/');
    }

    // fetch the archive of the rev from facebook
    const fetchResult = await fetchRev(rev, revDirectory);

    if (!fetchResult) {
      await updateProcessing(ISSUE_REPLY_TEMPLATES.FAILED_TO_FETCH_REV, {});
      return;
    }

    // perform search for new archives
    if (!flags.includes('skip-search')) {
      const searchResult = await performSearch(rev, revDirectory);
      if (!searchResult && !flags.includes('ignore-search-error')) {
        await updateProcessing(ISSUE_REPLY_TEMPLATES.FAILED_TO_SEARCH_REV, {});
        return;
      }
    }

    // perform the diff
    if (!flags.includes('initialrev') && !flags.includes('skip-diff')) {
      const diffResult = await performDiff(currentRev.toString(), rev);
      if (!diffResult && !flags.includes('ignore-failed-diff')) {
        await updateProcessing(ISSUE_REPLY_TEMPLATES.FAILED_TO_DIFF_REV, {});
        return;
      }
    }

    // update the current rev file
    fs.writeFileSync(`./.current-rev`, rev, 'utf-8');
    await exec.exec('git', ['config', 'user.name', 'fbtm-bot']);
    await exec.exec('git', ['config', 'user.email', '<>']);
    await exec.exec('git', ['add', '.']);
    await exec.exec('git', ['commit', '-m', `process rev ${rev} (#${github.context.issue.number})`]);
    await exec.exec('git', ['push', 'origin', 'main']);

    // fetch the ref
    const updatedRepo = await octokit.rest.repos.getBranch({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      branch: 'main'
    });
    const updatedRef = updatedRepo.data.commit.sha;

    // finally, update our message.
    await updateProcessing(ISSUE_REPLY_TEMPLATES.REV_PROCESSED, {
      ref: updatedRef
    });
  }
};

export default approveCommand;