import * as vscode from 'vscode';

export const extensionId = 'workspace-manager';
export const extensionOutputChannelName = 'Workspace Manager';
export const extensionQualifiedId = `design4pro.${extensionId}`;
export const GlobalStateVersionKey = 'workspaceManagerVersion';
export const APPINSIGHTS_KEY = '842bc896-71b0-47ba-936e-c9f4c07e0c15';

export enum BuiltInCommands {
    SetContext = 'setContext',
    OpenFile = 'vscode.open',
    CloseFolder = 'workbench.action.closeFolder'
}

export enum CommandContext {
    Enabled = 'workspace-manager:enabled',
    Empty = 'workspace-manager:empty',
    ViewsWorkspacesInActivityBar = 'workspace-manager:viewsWorkspacesInActivityBar',
    ViewInExplorerShow = 'workspace-manager:viewInExplorerShow'
}

export function setCommandContext(key: CommandContext | string, value: any) {
    return vscode.commands.executeCommand(
        BuiltInCommands.SetContext,
        key,
        value
    );
}

export enum GlyphChars {
    AngleBracketLeftHeavy = '\u2770',
    AngleBracketRightHeavy = '\u2771',
    ArrowBack = '\u21a9',
    ArrowDown = '\u2193',
    ArrowDropRight = '\u2937',
    ArrowHeadRight = '\u27A4',
    ArrowLeft = '\u2190',
    ArrowLeftDouble = '\u21d0',
    ArrowLeftRight = '\u2194',
    ArrowLeftRightDouble = '\u21d4',
    ArrowLeftRightDoubleStrike = '\u21ce',
    ArrowLeftRightLong = '\u27f7',
    ArrowRight = '\u2192',
    ArrowRightDouble = '\u21d2',
    ArrowRightHollow = '\u21e8',
    ArrowUp = '\u2191',
    ArrowUpRight = '\u2197',
    ArrowsHalfLeftRight = '\u21cb',
    ArrowsHalfRightLeft = '\u21cc',
    ArrowsLeftRight = '\u21c6',
    ArrowsRightLeft = '\u21c4',
    Asterisk = '\u2217',
    Check = '\u2713',
    Dash = '\u2014',
    Dot = '\u2022',
    Ellipsis = '\u2026',
    EnDash = '\u2013',
    Envelope = '\u2709',
    EqualsTriple = '\u2261',
    Flag = '\u2691',
    FlagHollow = '\u2690',
    MiddleEllipsis = '\u22EF',
    MuchLessThan = '\u226A',
    MuchGreaterThan = '\u226B',
    Pencil = '\u270E',
    Space = '\u00a0',
    SpaceThin = '\u2009',
    SpaceThinnest = '\u200A',
    SquareWithBottomShadow = '\u274F',
    SquareWithTopShadow = '\u2750',
    ZeroWidthSpace = '\u200b'
}

export interface FavoriteWorkspaces {
    [id: string]: boolean;
}

export enum WorkspaceState {
    FavoriteWorkspaces = 'workspace-manager:favorite:workspaces'
}
