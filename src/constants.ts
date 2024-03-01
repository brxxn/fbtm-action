import { IssueReplyTemplate } from "./types";

export const SUPPORTED_PRODUCTS = [
  'facebook',
  'instagram',
  'messenger',
  'whatsapp'
];

// These flags could break future uses, so they are limited to maintainers
// to prevent them from being misused.
export const MAINTAINER_ONLY_FLAGS = [
  'unsupported-skipvalidrevcheck',
  'initialrev',
  'skip-search',
  'dangerously-process-old-rev',
  'ignore-search-error'
];

export const EMOJIS = {
  INSUFFICIENT_PERMISSION: '⛔️',
  BAD_REQUEST: '🚫',
  ERROR: '❌',
  WAITING: '⏳',
  SUCCESS: '✅'
};

export const ISSUE_REPLY_TEMPLATES = {
  PERMISSION_REQUIRED: {
    emoji: EMOJIS.INSUFFICIENT_PERMISSION,
    title: 'no permission',
    body: 'to execute this command, you need additional permission on the repository.'
  },
  ALLOWED_USER_REQUIRED: {
    emoji: EMOJIS.INSUFFICIENT_PERMISSION,
    title: 'no permission',
    body: 'you do not have permission to execute this command. to obtain permission, ' +
      'you will need to open a new issue requesting access. alternatively, you can wait for ' +
      'someone with permission to run this command for you.\n\n' +
      '(maintainer note: to grant this user permission, use `/grantauthorpermission` or ' +
      'add their GitHub user ID `{{ user_id }}` to the `.allowed-users` file)'
  },
  FLAG_REQUIRES_MAINTAINER: {
    emoji: EMOJIS.INSUFFICIENT_PERMISSION,
    title: 'no permission to use flag',
    body: 'a flag you used (`{{ flag }}`) requires maintainer permissions to this repo to use. try the approve ' +
      'command without that flag to use it. flags that could potentially break the repo require maintainer permission ' + 
      'to use to avoid extra work having to be performed due to a mistake being accidentally made.\n\n' +
      'if you need to use one of these flags, explain to a maintainer why you need it and they can run the command ' + 
      'for you.'
  },
  INTERNAL_SERVER_ERROR: {
    emoji: EMOJIS.ERROR,
    title: 'internal server error',
    body: 'an unknown error occurred while executing this command! see the [action logs]({{ action_log_url }}) for more details.'
  },
  REV_NOT_FOUND: {
    emoji: EMOJIS.BAD_REQUEST,
    title: 'rev not found',
    body: 'a rev could not be found in the issue body! make sure you have a rev formatted ' +
      'in the format `fb-rev: 1234` (must have a space) on a single line in the original issue body.\n\n' +
      '(note: you can edit the original issue message to change this)'
  },
  MULTIPLE_REVS: {
    emoji: EMOJIS.BAD_REQUEST,
    title: 'multiple revs specified',
    body: 'this is awkward, but it looks like multiple `fb-rev`\'s were found. ' +
      'to use this command, edit the main issue to only contain one or make a new issue ' +
      'with only one `fb-rev`.'
  },
  REV_TOO_OLD: {
    emoji: EMOJIS.BAD_REQUEST,
    title: 'rev too old',
    body: 'this rev (`{{ rev }}`) is older than (or equal to) the current rev (`{{ current_rev }}`), so it ' +
      'has been removed from processing. if you are wanting to compare the current rev to this rev, add the ' +
      '`compare-to-current` flag. if you want to continue anyways (which may break things), add the ' +
      '`dangerously-process-old-rev` flag.'
  },
  FAILED_TO_FETCH_REV: {
    emoji: EMOJIS.ERROR,
    title: 'failed to fetch rev',
    body: 'the contents for this rev could not be fetched from Facebook! note that when revs get pushed, ' +
      'the binary transparency archive usually takes some time to prepare the archive for that rev. trying ' +
      'again later may help.'
  },
  FAILED_TO_SEARCH_REV: {
    emoji: EMOJIS.ERROR,
    title: 'failed to search rev',
    body: 'an error occurred while searching this rev! check the logs for more details. if you can\'t resolve it, ' +
      'you might be able to get around this by using the `ignore-search-error` flag (which may break things!)'
  },
  FAILED_TO_DIFF_REV: {
    emoji: EMOJIS.ERROR,
    title: 'failed to diff rev',
    body: 'an error occurred while diffing this rev! this could be if a new search type was added or if a search is ' +
      'incomplete (or if this is the first time you are adding a rev to this repo, in which case you should use the ' +
      '`initialrev` flag). if one of these is the case or you have resolved whatever is causing this, you can ignore ' +
      'this error using the `ignore-failed-diff` flag.'
  },
  PROCESSING_REV: {
    emoji: EMOJIS.WAITING,
    title: 'processing rev',
    body: 'this rev (`{{ rev }}`) is currently being processed. upon completion or error, this comment will be updated.\n\n' + 
      '(note: if this message does not update within 30 minutes, [check the action]({{ action_log_url }}) to see ' +
      'if an error has occurred)'
  },
  REV_PROCESSED: {
    emoji: EMOJIS.SUCCESS,
    title: 'proccessed rev!',
    body: 'this rev has been processed and is now on the main branch @ `{{ ref }}`! this issue is now being closed.'
  },
  USER_ALREADY_APPROVED: {
    emoji: EMOJIS.BAD_REQUEST,
    title: 'user already approved',
    body: 'this user is already approved!'
  },
  USER_APPROVED: {
    emoji: EMOJIS.SUCCESS,
    title: 'added!',
    body: 'successfully added @{{ approved_user }} as an approved user!'
  },
  USER_NOT_APPROVED: {
    emoji: EMOJIS.BAD_REQUEST,
    title: 'user not already approved',
    body: 'the user who made this issue is not already approved, so their permissions cannot be revoked!'
  },
  APPROVED_USER_REMOVED: {
    emoji: EMOJIS.SUCCESS,
    title: 'removed!',
    body: 'successfully removed @{{ removed_user }} as an approved user!'
  }
};

export const TEMPLATE_FOOTER = '<sup><sub>in response to @{{ username }} (github user ID: `{{ user_id }})` | ' +
  'run: [{{ run_id }} ({{ run_number }})]({{ action_log_url }}))</sub></sup>';