import { exec } from 'child_process';
import { WorkspaceEntry } from '../../model/workspaceEntry';
import { getApp } from '../../util/getApp';
import { onCommandRun } from '../../util/onCommandRun';

export function switchToWorkspaceCommand(
    workspaceEntry: WorkspaceEntry,
    inNewWindow: boolean = false
) {
    const app = getApp();
    const command = `${app} ${inNewWindow ? '-n' : '-r'} "${
        workspaceEntry.path
    }"`;
    exec(command, onCommandRun);
}
