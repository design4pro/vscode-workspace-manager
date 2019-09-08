import { ThemeIcon, TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';
import { View } from '../viewBase';
import { ResourceType, ViewNode } from './viewNode';

export class MessageNode extends ViewNode {
    constructor(
        view: View,
        parent: ViewNode,
        private readonly _message: string,
        private readonly _description?: string,
        private readonly _tooltip?: string,
        private readonly _iconPath?:
            | string
            | Uri
            | {
                  light: string | Uri;
                  dark: string | Uri;
              }
            | ThemeIcon
    ) {
        super('', view, parent);
    }

    getChildren(): ViewNode[] | Promise<ViewNode[]> {
        return [];
    }

    getTreeItem(): TreeItem | Promise<TreeItem> {
        const item = new TreeItem(this._message, TreeItemCollapsibleState.None);
        item.contextValue = ResourceType.Message;
        item.description = this._description;
        item.tooltip = this._tooltip;
        item.iconPath = this._iconPath;
        return item;
    }
}
