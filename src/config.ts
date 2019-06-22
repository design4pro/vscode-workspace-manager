import { TraceLevel } from './logger';

export interface Config {
    outputLevel: TraceLevel;
}

export interface AdvancedConfig {
    enableTelemetry: boolean;
}
