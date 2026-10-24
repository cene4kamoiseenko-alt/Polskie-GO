import { buildApp } from './app';
import { config } from './config';
import { startJobs } from './jobs';

const app = await buildApp();
await app.listen({ port: config.port, host: '0.0.0.0' });
if (config.jobsEnabled) startJobs(app.log);
