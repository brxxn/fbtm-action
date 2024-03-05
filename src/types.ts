
export interface IssueReplyTemplate {
  emoji: string;
  title: string;
  body: string;
};

export enum PermissionLevel {
  OWNER = 0,
  MAINTAINER = 1,
  ALLOWED_USER = 2,
  GUEST = 3
};

export interface Command {
  name: string;
  requiredPermissionLevel: PermissionLevel;
  run: (command: string, userPermissionLevel: PermissionLevel) => Promise<void>;
};

export interface SearchType {
  filename: string;
  shouldDiff: boolean;
  supportedPlatforms: string[];
  performSearch: (targetDirectory: string, outputFile: string) => Promise<boolean>;
  performDiff?: (oldFile: string, newFile: string, outputFile: string) => Promise<boolean>;
};