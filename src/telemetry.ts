import * as appInsights from 'applicationinsights';
import * as os from 'os';
import * as vscode from 'vscode';
import { configuration } from './configuration';
import { APPINSIGHTS_KEY } from './constants';
import { Logger } from './logger';
import { getExtension } from './util/getExtension';

class TelemetryReporter extends vscode.Disposable {
    private client?: appInsights.TelemetryClient;
    private userOptIn: boolean = false;
    private disposables: vscode.Disposable[] = [];

    constructor(
        public extensionId: string,
        public extensionVersion: string,
        private aiKey: string
    ) {
        super(() => this.disposables.map(d => d.dispose()));

        if (!aiKey || aiKey === '') {
            return;
        }

        this.updateUserOptIn();
    }

    get enabled(): boolean {
        return this.userOptIn;
    }

    trackEvent(
        eventName: string,
        properties?: { [key: string]: string },
        measurements?: { [key: string]: number }
    ) {
        if (!this.userOptIn || !this.client || !eventName) {
            Logger.debug(`Not sending metric ${eventName}`);

            if (properties) {
                Object.keys(properties).forEach(p =>
                    Logger.debug(`    ${p}: ${properties[p]}`)
                );
            }

            if (measurements) {
                Object.keys(measurements).forEach(p =>
                    Logger.debug(`    ${p}: ${measurements[p]}`)
                );
            }

            return;
        }

        console.log({
            name: `${eventName}`,
            properties: properties,
            measurements: measurements
        });

        this.client.trackEvent({
            name: `${eventName}`,
            properties: properties,
            measurements: measurements
        });
    }

    trackException(
        exception: Error,
        eventName?: string,
        properties?: { [key: string]: string },
        measurements?: { [key: string]: number }
    ) {
        if (!this.userOptIn || !this.client || !exception || !eventName) {
            Logger.debug(
                `workspace-manager.telemetry: Not sending exception metric ${eventName}/${exception}`
            );

            return;
        }

        if (!properties) {
            properties = {};
        }

        properties.name = `${eventName}`;

        this.client.trackException({
            exception: exception,
            properties: properties,
            measurements: measurements
        });
    }

    dispose(): Promise<any> {
        return new Promise<any>(resolve => {
            if (this.client) {
                this.client.flush({
                    callback: () => {
                        // all data flushed
                        this.client = undefined;
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    private updateUserOptIn() {
        const globalConfig = vscode.workspace.getConfiguration('telemetry');
        const globalOptIn = globalConfig.get<boolean>('enableTelemetry', true);
        const extensionOptIn = configuration.get<boolean>(
            configuration.name('advanced')('telemetry')('enabled').value
        );

        const optIn = globalOptIn && extensionOptIn;

        if (this.userOptIn !== optIn) {
            this.userOptIn = optIn;

            if (this.userOptIn) {
                this.createClient();
            } else {
                this.dispose();
            }
        }
    }

    private createClient() {
        // check if another instance exists
        if (appInsights.defaultClient) {
            this.client = new appInsights.TelemetryClient(this.aiKey);
            this.client.channel.setUseDiskRetryCaching(true);
        } else {
            appInsights
                .setup(this.aiKey)
                .setAutoCollectConsole(false)
                .setAutoCollectDependencies(false)
                .setAutoCollectExceptions(false)
                .setAutoCollectPerformance(false)
                .setAutoCollectRequests(false)
                .setAutoDependencyCorrelation(false)
                .setUseDiskRetryCaching(true)
                .start();
            this.client = appInsights.defaultClient;
        }

        this.setCommonProperties();
        this.client.context.tags[this.client.context.keys.sessionId] =
            vscode.env.sessionId;
        this.client.context.tags[this.client.context.keys.userId] =
            vscode.env.machineId;
    }

    private setCommonProperties() {
        if (this.client) {
            this.client.commonProperties = {
                'common.os': os.platform(),
                'common.platformversion': (os.release() || '').replace(
                    /^(\d+)(\.\d+)?(\.\d+)?(.*)/,
                    '$1$2$3'
                ),
                'common.extname': this.extensionId,
                'common.extversion': this.extensionVersion,
                'common.vscodemachineid': vscode.env.machineId,
                'common.vscodesessionid': vscode.env.sessionId,
                'common.vscodeversion': vscode.version
            };
        }
    }
}

export let Reporter: TelemetryReporter;

export function activate(ctx: vscode.ExtensionContext) {
    const extension = getExtension()!;

    const packageJson = extension.packageJSON;

    Reporter = new TelemetryReporter(
        `${packageJson.publisher}.${packageJson.name}`,
        packageJson.version,
        APPINSIGHTS_KEY
    );
}

export function deactivate(): Promise<any> {
    return Reporter.dispose();
}
