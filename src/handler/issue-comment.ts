import * as github from '@actions/github';
import { IssueCommentCreatedEvent } from '@octokit/webhooks-definitions/schema';
import { handleCommand } from '../command/handler';

export const handleIssueComment = async () => {
  const payload = github.context.payload as IssueCommentCreatedEvent;

  // TODO: maybe custom prefix?
  if (!payload.comment.body.trim().startsWith('/')) {
    return;
  }

  // todo: surround with error check that creates an issue
  await handleCommand(payload.comment.body);
}