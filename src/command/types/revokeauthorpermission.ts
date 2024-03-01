import { Command, PermissionLevel } from "../../types";
import { renderReplyTemplate } from "../../util/reply-template";
import { ISSUE_REPLY_TEMPLATES } from "../../constants";
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as github from '@actions/github';
import { IssueCommentEvent } from "@octokit/webhooks-definitions/schema";
import * as fs from 'fs';

const revokeAuthorPermissionCommand: Command = {
  name: 'revokeauthorpermission',
  requiredPermissionLevel: PermissionLevel.MAINTAINER,
  run: async (command: string, userPermissionLevel: PermissionLevel) => {
    const githubToken = core.getInput('github-token', { required: true });
    const octokit = github.getOctokit(githubToken);

    // read allowed users and add the issue author to it
    let allowedUsers = fs.readFileSync('./.allowed-users', 'utf-8');

    if (github.context.eventName !== 'issue_comment') {
      return;
    }
    
    const payload = github.context.payload as IssueCommentEvent;
    const removedUserId = payload.comment.user.id.toString();

    let allowedUserIds = allowedUsers.split('\n');
    
    if (!allowedUserIds.includes(removedUserId)) {
      await octokit.rest.issues.createComment({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: github.context.issue.number,
        body: renderReplyTemplate(ISSUE_REPLY_TEMPLATES.USER_NOT_APPROVED, {})
      });
      return;
    }

    allowedUserIds = allowedUserIds.filter(x => x != removedUserId);
    
    fs.writeFileSync('./.allowed-users', allowedUserIds.join('\n'), 'utf-8');
    await exec.exec('git', ['config', 'user.name', 'fbtm-bot']);
    await exec.exec('git', ['config', 'user.email', '<>']);
    await exec.exec('git', ['add', '.']);
    await exec.exec('git', ['commit', '-m', 'remove allowed user']);
    await exec.exec('git', ['push', 'origin', 'main']);
    await octokit.rest.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number,
      body: renderReplyTemplate(ISSUE_REPLY_TEMPLATES.APPROVED_USER_REMOVED, {
        'removed_user': payload.comment.user.login
      })
    });
  }
};

export default revokeAuthorPermissionCommand;