export const STAGING_CONFIG: string;
export const STAGING_DB: string;
export function parseJsonc(text: string): any;
export function checkStagingConfig(stagingText: string, productionText: string): string[];
export const LEGACY_PROD_DBS: string[];
export function checkStagingScripts(pkg: { scripts?: Record<string, string> }, prodDbs?: string[]): string[];
export function checkRepo(root: string): string[];
