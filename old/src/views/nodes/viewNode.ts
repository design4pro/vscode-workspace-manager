import {
    Command,
    Disposable,
    Event,
    TreeItem,
    TreeItemCollapsibleState,
    TreeViewVisibilityChangeEvent
} from 'vscode';
import { Logger } from '../../logger';
import { Functions, LogName } from '../../system';
import { TreeViewNodeStateChangeEvent, View } from '../viewBase';

export enum ResourceType {
    Favorite = 'workspaceManager:favorite',
    Favorites = 'workspaceManager:favorites',
    Group = 'workspaceManager:group',
    Groups = 'workspaceManager:groups',
    Message = 'workspaceManager:message',
    Workspace = 'workspaceManager:workspace',
    Workspaces = 'workspaceManager:workspaces'
}

export interface ViewNode {
    readonly id?: string;
}

@LogName<ViewNode>(
    (c: any, name: any) => `${name}${c.id != null ? `(${c.id})` : ''}`
)
export abstract class ViewNode<TView extends View = View> {
    constructor(
        public readonly view: TView,
        protected readonly parent?: ViewNode
    ) {}

    toString() {
        return `${Logger.toLoggableName(this)}${
            this.id != null ? `(${this.id})` : ''
        }`;
    }

    abstract getChildren(): ViewNode[] | Promise<ViewNode[]>;

    getParent(): ViewNode | undefined {
        return this.parent;
    }

    abstract getTreeItem(): TreeItem | Promise<TreeItem>;

    getCommand(): Command | undefined {
        return undefined;
    }

    refresh?(
        reset?: boolean
    ): void | boolean | Promise<void> | Promise<boolean>;

    triggerChange(reset: boolean = false): Promise<void> {
        return this.view.refreshNode(this, reset);
    }
}

export function nodeSupportsConditionalDismissal(
    node: ViewNode
): node is ViewNode & { canDismiss(): boolean } {
    return (
        typeof (node as ViewNode & { canDismiss(): boolean }).canDismiss ===
        'function'
    );
}

export interface PageableViewNode {
    readonly id?: string;
    readonly supportsPaging: boolean;
    readonly rememberLastMaxCount?: boolean;
    maxCount: number | undefined;
}
export function nodeSupportsPaging(
    node: ViewNode
): node is ViewNode & PageableViewNode {
    return Functions.is<ViewNode & PageableViewNode>(
        node,
        'supportsPaging',
        true
    );
}

export abstract class SubscribeableViewNode<
    TView extends View = View
> extends ViewNode<TView> {
    protected _disposable: Disposable;
    protected _subscription: Promise<Disposable | undefined> | undefined;

    constructor(view: TView, parent?: ViewNode) {
        super(view, parent);

        const disposables = [
            this.view.onDidChangeVisibility(this.onVisibilityChanged, this),
            this.view.onDidChangeNodeState(this.onNodeStateChanged, this)
        ];

        if (viewSupportsAutoRefresh(this.view)) {
            disposables.push(
                this.view.onDidChangeAutoRefresh(
                    this.onAutoRefreshChanged,
                    this
                )
            );
        }

        this._disposable = Disposable.from(...disposables);
    }

    dispose() {
        void this.unsubscribe();

        if (this._disposable !== undefined) {
            this._disposable.dispose();
        }
    }

    private _canSubscribe: boolean = true;
    protected get canSubscribe(): boolean {
        return this._canSubscribe;
    }
    protected set canSubscribe(value: boolean) {
        if (this._canSubscribe === value) return;

        this._canSubscribe = value;

        void this.ensureSubscription();

        if (value) {
            void this.triggerChange();
        }
    }

    protected abstract subscribe():
        | Disposable
        | undefined
        | Promise<Disposable | undefined>;

    protected async unsubscribe(): Promise<void> {
        if (this._subscription !== undefined) {
            const subscriptionPromise = this._subscription;
            this._subscription = undefined;

            const subscription = await subscriptionPromise;
            if (subscription !== undefined) {
                subscription.dispose();
            }
        }
    }

    protected onAutoRefreshChanged() {
        this.onVisibilityChanged({ visible: this.view.visible });
    }

    protected onParentStateChanged?(state: TreeItemCollapsibleState): void;
    protected onStateChanged?(state: TreeItemCollapsibleState): void;

    protected _state: TreeItemCollapsibleState | undefined;
    protected onNodeStateChanged(e: TreeViewNodeStateChangeEvent<ViewNode>) {
        if (e.element === this) {
            this._state = e.state;
            if (this.onStateChanged !== undefined) {
                this.onStateChanged(e.state);
            }
        } else if (e.element === this.parent) {
            if (this.onParentStateChanged !== undefined) {
                this.onParentStateChanged(e.state);
            }
        }
    }

    protected onVisibilityChanged(e: TreeViewVisibilityChangeEvent) {
        void this.ensureSubscription();

        if (e.visible) {
            void this.triggerChange();
        }
    }

    async ensureSubscription() {
        // We only need to subscribe if we are visible and if auto-refresh enabled (when supported)
        if (
            !this.canSubscribe ||
            !this.view.visible ||
            (viewSupportsAutoRefresh(this.view) && !this.view.autoRefresh)
        ) {
            await this.unsubscribe();

            return;
        }

        // If we already have a subscription, just kick out
        if (this._subscription !== undefined) return;

        this._subscription = Promise.resolve(this.subscribe());
        await this._subscription;
    }
}

interface AutoRefreshableView {
    autoRefresh: boolean;
    onDidChangeAutoRefresh: Event<void>;
}
export function viewSupportsAutoRefresh(
    view: View
): view is View & AutoRefreshableView {
    return Functions.is<View & AutoRefreshableView>(
        view,
        'onDidChangeAutoRefresh'
    );
}

export function viewSupportsNodeDismissal(
    view: View
): view is View & { dismissNode(node: ViewNode): void } {
    return (
        typeof (view as View & { dismissNode(node: ViewNode): void })
            .dismissNode === 'function'
    );
}
