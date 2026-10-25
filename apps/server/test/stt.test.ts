import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { encodeSpeechWav, MAX_SPEECH_BYTES } from '@polski-go/shared';
import { disposeEnv, getEnv, login } from './helpers';
import { sttStatus, transcribeSpeech, readSpeechBody } from '../src/services/stt';
afterAll(disposeEnv);
afterEach(async () => { vi.restoreAllMocks(); const { env } = await getEnv(); delete env.AZURE_STT_ENABLED; delete env.AZURE_SPEECH_KEY; delete env.AZURE_SPEECH_REGION; });
const clip = () => encodeSpeechWav([new Float32Array(3200).fill(0.1)], 16000);
async function enable() { const { env } = await getEnv(); env.AZURE_STT_ENABLED = 'true'; env.AZURE_SPEECH_KEY = 'test'; env.AZURE_SPEECH_REGION = 'westeurope'; return env; }
describe('Server speech transcription (provider simulated)', () => {
  it('is disabled by default and TTS credentials alone do not enable it', async () => {
    const { env } = await getEnv(); env.AZURE_SPEECH_KEY = 'test'; env.AZURE_SPEECH_REGION = 'westeurope';
    expect(sttStatus().configured).toBe(false);
    await expect(transcribeSpeech(clip())).rejects.toMatchObject({ code: 'stt_not_configured' });
  });
  it('sends validated audio, Polish language and private credentials only to the fixed provider', async () => {
    await enable(); const bytes = clip();
    const mock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ RecognitionStatus: 'Success', DisplayText: 'Dzień dobry.' })));
    await expect(transcribeSpeech(bytes)).resolves.toEqual({ transcript: 'Dzień dobry.', language: 'pl-PL' });
    const [url, init] = mock.mock.calls[0];
    expect(String(url)).toContain('westeurope.stt.speech.microsoft.com');
    expect(String(url)).toContain('language=pl-PL');
    expect(init?.headers).toMatchObject({ 'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000' });
    expect(new Uint8Array(await (init!.body as Blob).arrayBuffer())).toEqual(bytes);
  });
  it('rejects unsupported audio and no-match responses without inventing a transcript', async () => {
    await enable(); const mock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ RecognitionStatus: 'NoMatch' })));
    await expect(transcribeSpeech(new Uint8Array(100))).rejects.toMatchObject({ code: 'stt_bad_audio' });
    expect(mock).not.toHaveBeenCalled();
    await expect(transcribeSpeech(clip())).rejects.toMatchObject({ code: 'stt_no_speech' });
  });
  it('does not expose provider response bodies on an upstream failure', async () => {
    await enable(); vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('private provider details', { status: 401 }));
    await expect(transcribeSpeech(clip())).rejects.toMatchObject({ code: 'stt_unavailable' });
  });
  it('requires authentication and bounds the upload before forwarding', async () => {
    const { app, env } = await getEnv();
    const noAuth = await app.request('/api/speech/transcribe', { method: 'POST', body: new Blob([new Uint8Array(clip())]) }, env);
    expect(noAuth.status).toBe(401);
    const { token } = await login();
    const tooBig = await app.request('/api/speech/transcribe', { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: new Uint8Array(MAX_SPEECH_BYTES + 1) }, env);
    expect(tooBig.status).toBe(413);
  });
  it('bounds the actual stream even with a forged short length', async () => {
    const req = new Request('https://local.test/speech', { method: 'POST', headers: { 'content-length': '1' }, body: new Blob([new Uint8Array(MAX_SPEECH_BYTES + 1)]) });
    await expect(readSpeechBody(req)).rejects.toMatchObject({ code: 'stt_too_large' });
  });

});
