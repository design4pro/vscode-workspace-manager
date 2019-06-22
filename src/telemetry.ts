import * as ai from 'applicationinsights';
import * as os from 'os';
import { Logger } from './logger';
import { Disposable, workspace, env, version, ExtensionContext } from 'vscode';
import { configuration } from './configuration';

class TelemetryReporter extends Disposable {
    private client: ai.TelemetryClient;
    private userOptIn: boolean = false;
    private disposables: Disposable[] = [];
    private logger = new Logger('telemetry');

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
            this.logger.debug(`Not sending metric ${eventName}`);
            if (properties) {
                Object.keys(properties).forEach(p =>
                    this.logger.debug(`    ${p}: ${properties[p]}`)
                );
            }
            if (measurements) {
                Object.keys(measurements).forEach(p =>
                    this.logger.debug(`    ${p}: ${measurements[p]}`)
                );
            }

            return;
        }

        this.client.trackEvent({
            name: `${eventName}`,
            properties: properties,
            measurements: measurements
        });
    }

    trackException(
        eventName: string,
        exception: Error,
        properties?: { [key: string]: string },
        measurements?: { [key: string]: number }
    ) {
        if (!this.userOptIn || !this.client || !exception || !eventName) {
            this.logger.debug(
                `terraform.telemetry: Not sending exception metric ${eventName}/${exception}`
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
        const globalConfig = workspace.getConfiguration('telemetry');
        const globalOptIn = globalConfig.get<boolean>('enableTelemetry', true);
        const extensionOptIn = configuration.get<boolean>('enableTelemetry');

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
        if (ai.defaultClient) {
            this.client = new ai.TelemetryClient(this.aiKey);
            this.client.channel.setUseDiskRetryCaching(true);
        } else {
            ai.setup(this.aiKey)
                .setAutoCollectConsole(false)
                .setAutoCollectDependencies(false)
                .setAutoCollectExceptions(false)
                .setAutoCollectPerformance(false)
                .setAutoCollectRequests(false)
                .setAutoDependencyCorrelation(false)
                .setUseDiskRetryCaching(true)
                .start();
            this.client = ai.defaultClient;
        }

        this.setCommonProperties();
        this.client.context.tags[this.client.context.keys.sessionId] =
            env.sessionId;
        this.client.context.tags[this.client.context.keys.userId] =
            env.machineId;
    }

    private setCommonProperties() {
        this.client.commonProperties = {
            'common.os': os.platform(),
            'common.platformversion': (os.release() || '').replace(
                /^(\d+)(\.\d+)?(\.\d+)?(.*)/,
                '$1$2$3'
            ),
            'common.extname': this.extensionId,
            'common.extversion': this.extensionVersion,
            'common.vscodemachineid': env.machineId,
            'common.vscodesessionid': env.sessionId,
            'common.vscodeversion': version
        };
    }
}

export let Reporter: TelemetryReporter;

export function activate(ctx: ExtensionContext) {
    const packageJson = require(ctx.asAbsolutePath('./package.json'));

    const aiKey = require('./constants.json').APPINSIGHTS_KEY;

    Reporter = new TelemetryReporter(
        `${packageJson.publisher}.${packageJson.name}`,
        packageJson.version,
        aiKey
    );
}

export function deactivate(): Promise<any> {
    return Reporter.dispose();
}
