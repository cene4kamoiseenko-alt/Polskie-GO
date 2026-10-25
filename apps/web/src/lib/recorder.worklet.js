// Runs on the audio thread. Never plays microphone input through the speakers.
class SpeechCapture extends AudioWorkletProcessor {
  process(inputs, outputs) {
    const channels = inputs[0];
    if (channels?.length && channels[0].length) {
      const mono = new Float32Array(channels[0].length);
      for (const channel of channels) for (let i = 0; i < mono.length; i++) mono[i] += channel[i] / channels.length;
      this.port.postMessage(mono, [mono.buffer]);
    }
    for (const channel of outputs[0] ?? []) channel.fill(0);
    return true;
  }
}
registerProcessor('speech-capture', SpeechCapture);
