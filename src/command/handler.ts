import { PermissionLevel } from "../types";
import CommandRegistry from "./registry";

import * as core from '@actions/core';
import * as github from '@actions/github';
import { IssueCommentCreatedEvent, AuthorAssociation } from '@octokit/webhooks-definitions/schema';
import * as fs from 'fs';
import { ISSUE_REPLY_TEMPLATES } from "../constants";
import { renderReplyTemplate } from "../util/reply-template";


export const handleCommand = async (commandText: string) => {
  const commandName = commandText.trim().split(/\s+/)[0].replace('/', '').toLowerCase();
  const githubToken = core.getInput('github-token', { required: true });
  const octokit = github.getOctokit(githubToken);

  try {
    for (const registeredCommand of CommandRegistry) {
      if (registeredCommand.name === commandName) {
        let userPermissionLevel = PermissionLevel.GUEST;

        // handle user permissions for issue comment
        if (github.context.eventName === 'issue_comment') {
          const payload = github.context.payload as IssueCommentCreatedEvent;
          if (payload.comment.author_association === 'OWNER') {
            userPermissionLevel = PermissionLevel.OWNER;
          } else if (payload.comment.author_association === 'COLLABORATOR') {
            userPermissionLevel = PermissionLevel.MAINTAINER;
          } else {
            const authorId = payload.comment.user.id;
            const allowedUsers = fs.readFileSync('./.allowed-users', 'utf-8').split('\n');
            if (allowedUsers.includes(authorId.toString())) {
              userPermissionLevel = PermissionLevel.ALLOWED_USER;
            }
          }
        }
        
        // check if the user has sufficient permissions
        if (registeredCommand.requiredPermissionLevel < userPermissionLevel) {
          const replyTemplate = (registeredCommand.requiredPermissionLevel === PermissionLevel.ALLOWED_USER ? 
            ISSUE_REPLY_TEMPLATES.ALLOWED_USER_REQUIRED :
            ISSUE_REPLY_TEMPLATES.PERMISSION_REQUIRED);
          const replyBody = renderReplyTemplate(replyTemplate, {});
          await octokit.rest.issues.createComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.issue.number,
            body: replyBody
          });
          return;
        }
        
        // run the command
        await registeredCommand.run(commandText, userPermissionLevel);
        break;
      }
    }
  } catch (exception) {
    // reply with internal server error
    const replyBody = renderReplyTemplate(ISSUE_REPLY_TEMPLATES.INTERNAL_SERVER_ERROR, {});
    await octokit.rest.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: github.context.issue.number,
      body: replyBody
    });
    // rethrow the exception so it is visible in logs
    throw exception;
  }
  
}