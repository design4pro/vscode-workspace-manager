import { commands, Uri, window } from 'vscode';
import { Commands } from '../commands/common';
import { BuiltInCommands } from '../constants';
import { WorkspaceNode } from './nodes';

export class ViewCommands {
    constructor() {
        console.log('ViewCommands', Commands.SwitchWorkspace);

        commands.registerCommand(
            Commands.SwitchWorkspace,
            this.switchWorkspace,
            this
        );

        commands.registerCommand(
            Commands.SwitchWorkspaceInNewWindow,
            this.switchWorkspaceInNewWindow,
            this
        );

        commands.registerCommand(
            Commands.OpenWorkspaceSettings,
            this.openWorkspaceSettings,
            this
        );

        commands.registerCommand(
            Commands.AddToFavorites,
            this.addToFavorites,
            this
        );

        commands.registerCommand(
            Commands.RemoveFromFavorites,
            this.removeFromFavorites,
            this
        );

        commands.registerCommand(Commands.AddToGroup, this.addToGroup, this);

        commands.registerCommand(Commands.MoveToGroup, this.moveToGroup, this);

        commands.registerCommand(
            Commands.DeleteWorkspace,
            this.deleteWorkspace,
            this
        );
    }

    private switchWorkspace(node: WorkspaceNode) {
        if (node instanceof WorkspaceNode) return node.switchWorkspace();

        return commands.executeCommand(Commands.SwitchWorkspaceQuickPick);
    }

    private switchWorkspaceInNewWindow(node: WorkspaceNode) {
        if (node instanceof WorkspaceNode)
            return node.switchWorkspaceInNewWindow();

        return commands.executeCommand(
            Commands.SwitchWorkspaceInNewWindowQuickPick,
            {
                inNewWindow: true
            }
        );
    }

    private openWorkspaceSettings(node: WorkspaceNode) {
        if (!(node instanceof WorkspaceNode)) return undefined;

        const uri = Uri.file(node.workspace.path);

        commands.executeCommand(BuiltInCommands.OpenFile, uri).then(
            value => ({}), // done
            value =>
                window.showErrorMessage(
                    'Could not open the workspace settings!'
                )
        );
    }

    private addToFavorites(node: WorkspaceNode) {
        if (node instanceof WorkspaceNode) return node.addToFavorites();
        return undefined;
    }

    private removeFromFavorites(node: WorkspaceNode) {
        if (node instanceof WorkspaceNode) return node.removeFromFavorites();
        return undefined;
    }

    private addToGroup(node: WorkspaceNode) {
        if (node instanceof WorkspaceNode) return node.addToGroup();
        return undefined;
    }

    private moveToGroup(node: WorkspaceNode) {
        if (node instanceof WorkspaceNode) return node.moveToGroup();
        return undefined;
    }

    private deleteWorkspace(node: WorkspaceNode) {
        if (node instanceof WorkspaceNode) return node.deleteWorkspace();

        return commands.executeCommand(Commands.DeleteWorkspaceQuickPick);
    }
}
