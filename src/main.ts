import * as github from '@actions/github';
import { handleIssueComment } from './handler/issue-comment';

export const runAction = async () => {
  
  if (github.context.eventName === 'issue_comment') {
    await handleIssueComment();
  }

  // TODO: potentially support other event types (like commit)
}