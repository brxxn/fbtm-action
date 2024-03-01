import { Command } from "../types";
import approveCommand from "./types/approve";
import grantAuthorPermissionCommand from "./types/grantauthorpermission";
import revokeAuthorPermissionCommand from "./types/revokeauthorpermission";

const CommandRegistry: Command[] = [
  approveCommand,
  grantAuthorPermissionCommand,
  revokeAuthorPermissionCommand
];

export default CommandRegistry;