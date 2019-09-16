import { commands, Uri } from 'vscode';
import { Commands } from '../commands/common';
import { BuiltInCommands } from '../constants';
import { WorkspaceNode } from './nodes';

export class ViewCommands {
    constructor() {
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
    }

    private openWorkspaceSettings(node: WorkspaceNode) {
        if (!(node instanceof WorkspaceNode)) return undefined;

        return commands.executeCommand(
            BuiltInCommands.OpenFile,
            Uri.file(node.workspace.path)
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
}
