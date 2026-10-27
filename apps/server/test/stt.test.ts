import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { encodeSpeechWav, MAX_SPEECH_BYTES } from '@polski-go/shared';
import { disposeEnv, getEnv, login } from './helpers';
import { sttStatus, transcribeSpeech, readSpeechBody } from '../src/services/stt';
afterAll(disposeEnv);
afterEach(async () => {
  vi.restoreAllMocks(); const { env } = await getEnv();
  for (const k of ['AZURE_STT_ENABLED', 'AZURE_SPEECH_KEY', 'AZURE_SPEECH_REGION', 'GOOGLE_STT_ENABLED', 'GOOGLE_STT_API_KEY', 'GOOGLE_STT_MODEL', 'GOOGLE_TTS_API_KEY', 'STT_PROVIDER'] as const) delete env[k];
});
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

  it('Google: only an explicit flag enables it; a TTS key alone does not', async () => {
    const { env } = await getEnv(); env.GOOGLE_TTS_API_KEY = 'tts-key'; env.GOOGLE_STT_API_KEY = 'stt-key';
    expect(sttStatus()).toMatchObject({ configured: false, provider: null });
    env.GOOGLE_STT_ENABLED = 'true';
    expect(sttStatus()).toMatchObject({ configured: true, provider: 'google', language: 'pl-PL' });
  });

  it('Google: key in a header (never in the URL), pl-PL, base64 of the exact validated WAV', async () => {
    const { env } = await getEnv(); env.GOOGLE_STT_ENABLED = 'true'; env.GOOGLE_STT_API_KEY = 'stt-key'; const bytes = clip();
    const mock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ results: [{ alternatives: [{ transcript: 'dzień dobry', confidence: 0.9 }] }, { alternatives: [{ transcript: 'pani' }] }] })));
    await expect(transcribeSpeech(bytes)).resolves.toEqual({ transcript: 'dzień dobry pani', language: 'pl-PL' });
    const [url, init] = mock.mock.calls[0];
    expect(String(url)).toBe('https://speech.googleapis.com/v1/speech:recognize');
    expect(String(url)).not.toContain('key');
    expect(init?.headers).toMatchObject({ 'X-Goog-Api-Key': 'stt-key', 'Content-Type': 'application/json' });
    const body = JSON.parse(String(init!.body));
    expect(body.config).toMatchObject({ encoding: 'LINEAR16', sampleRateHertz: 16000, languageCode: 'pl-PL', maxAlternatives: 1 });
    expect(body.config.model).toBeUndefined();
    expect(new Uint8Array(Buffer.from(body.audio.content, 'base64'))).toEqual(bytes);
  });

  it('Google: falls back to the TTS key only after the flag; model only when set and well-formed', async () => {
    const { env } = await getEnv(); env.GOOGLE_STT_ENABLED = 'true'; env.GOOGLE_TTS_API_KEY = 'tts-key'; env.GOOGLE_STT_MODEL = 'latest_short';
    const mock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ results: [{ alternatives: [{ transcript: 'tak' }] }] })));
    await transcribeSpeech(clip());
    expect(mock.mock.calls[0][1]?.headers).toMatchObject({ 'X-Goog-Api-Key': 'tts-key' });
    expect(JSON.parse(String(mock.mock.calls[0][1]!.body)).config.model).toBe('latest_short');
    env.GOOGLE_STT_MODEL = 'bad model"}';
    await transcribeSpeech(clip());
    expect(JSON.parse(String(mock.mock.calls[1][1]!.body)).config.model).toBeUndefined();
  });

  it('Google: empty results are silence, upstream errors stay private', async () => {
    const { env } = await getEnv(); env.GOOGLE_STT_ENABLED = 'true'; env.GOOGLE_STT_API_KEY = 'stt-key';
    const mock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({})));
    await expect(transcribeSpeech(clip())).rejects.toMatchObject({ code: 'stt_no_speech' });
    mock.mockResolvedValueOnce(new Response(JSON.stringify({ results: [{ alternatives: [{ transcript: '  ' }] }] })));
    await expect(transcribeSpeech(clip())).rejects.toMatchObject({ code: 'stt_no_speech' });
    mock.mockResolvedValueOnce(new Response('{"error":{"message":"API key not valid stt-key"}}', { status: 400 }));
    const err = await transcribeSpeech(clip()).catch((e) => e);
    expect(err).toMatchObject({ code: 'stt_unavailable' });
    expect(JSON.stringify(err)).not.toContain('stt-key');
    mock.mockResolvedValueOnce(new Response('null'));
    await expect(transcribeSpeech(clip())).rejects.toMatchObject({ code: 'stt_unavailable' });
    mock.mockResolvedValueOnce(new Response(JSON.stringify({ results: 'odd' })));
    await expect(transcribeSpeech(clip())).rejects.toMatchObject({ code: 'stt_no_speech' });
    mock.mockRejectedValueOnce(new Error('network'));
    await expect(transcribeSpeech(clip())).rejects.toMatchObject({ code: 'stt_unavailable' });
  });

  it('provider choice: auto prefers Azure, STT_PROVIDER picks one, off is a kill switch, a missing choice is not replaced', async () => {
    const env = await enable(); env.GOOGLE_STT_ENABLED = 'true'; env.GOOGLE_STT_API_KEY = 'stt-key';
    expect(sttStatus().provider).toBe('azure');
    env.STT_PROVIDER = 'google'; expect(sttStatus().provider).toBe('google');
    env.STT_PROVIDER = 'off'; expect(sttStatus()).toMatchObject({ configured: false, provider: null });
    const mock = vi.spyOn(globalThis, 'fetch');
    await expect(transcribeSpeech(clip())).rejects.toMatchObject({ code: 'stt_not_configured' });
    expect(mock).not.toHaveBeenCalled();
    delete env.GOOGLE_STT_ENABLED; env.STT_PROVIDER = 'google';
    expect(sttStatus().provider).toBeNull();
  });

  it('the paid meter runs only for a real provider request', async () => {
    const { env } = await getEnv(); env.GOOGLE_STT_ENABLED = 'true'; env.GOOGLE_STT_API_KEY = 'stt-key';
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ results: [{ alternatives: [{ transcript: 'tak' }] }] })));
    const meter = vi.fn(async () => undefined);
    await expect(transcribeSpeech(new Uint8Array(100), { meter })).rejects.toMatchObject({ code: 'stt_bad_audio' });
    expect(meter).not.toHaveBeenCalled();
    await transcribeSpeech(clip(), { meter });
    expect(meter).toHaveBeenCalledTimes(1);
  });
});
