import { TEMPLATE_FOOTER } from "../constants";
import { IssueReplyTemplate } from "../types";
import github from '@actions/github';
import { IssueCommentCreatedEvent } from "@octokit/webhooks-definitions/schema";


export const renderReplyTemplate = (template: IssueReplyTemplate, variables: {[key: string]: string}) => {
  // prefilling common variables
  variables['action_log_url'] = `https://github.com/${github.context.repo.owner}/${github.context.repo.repo}/actions/runs/${github.context.runNumber}`;
  variables['run_id'] = github.context.runId.toString();
  variables['run_number'] = github.context.runNumber.toString();

  // TODO: handle other types
  if (github.context.eventName === 'issue_comment') {
    const payload = github.context.payload as IssueCommentCreatedEvent;
    variables['user_id'] = payload.comment.user.id.toString();
    variables['username'] = payload.comment.user.login;     
  }

  // render actual template
  let response = `${template.emoji} ${template.title}\n\n${template.body}\n\n${TEMPLATE_FOOTER}`;

  for (const variable in variables) {
    response = response.replaceAll(`{{ ${variable} }}`, variables[variable]);
  }

  return response;
}