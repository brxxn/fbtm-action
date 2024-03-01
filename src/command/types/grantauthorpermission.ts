import { Command, PermissionLevel } from "../../types";
import { renderReplyTemplate } from "../../util/reply-template";
import { ISSUE_REPLY_TEMPLATES } from "../../constants";
import core from '@actions/core';
import exec from '@actions/exec';
import github from '@actions/github';
import { IssueCommentEvent } from "@octokit/webhooks-definitions/schema";
import fs from 'fs';

const grantAuthorPermissionCommand: Command = {
  name: 'grantauthorpermission',
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
    const addingUserId = payload.comment.user.id.toString();
    
    if (allowedUsers.split('\n').includes(addingUserId)) {
      await octokit.rest.issues.createComment({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: github.context.issue.number,
        body: renderReplyTemplate(ISSUE_REPLY_TEMPLATES.USER_ALREADY_APPROVED, {})
      });
      return;
    }

    allowedUsers += `\n${addingUserId}`;
    fs.writeFileSync('./.allowed-users', allowedUsers, 'utf-8');
    await exec.exec('git', ['config', 'user.name', 'fbtm-bot']);
    await exec.exec('git', ['config', 'user.email', '<>']);
    await exec.exec('git', ['add', '.']);
    await exec.exec('git', ['commit', '-m', 'add new allowed user via command']);
    await exec.exec('git', ['push', 'origin', 'main']);
    await octokit.rest.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number,
      body: renderReplyTemplate(ISSUE_REPLY_TEMPLATES.USER_APPROVED, {
        'approved_user': payload.comment.user.login
      })
    });
  }
};

export default grantAuthorPermissionCommand;