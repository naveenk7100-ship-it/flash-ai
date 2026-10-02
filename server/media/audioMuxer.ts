/**
 * FLASH.Ai ISO BMFF MP4 Audio-Video Muxer
 * 
 * Embeds an ElevenLabs MP3 audio stream into an ISO BMFF H.264 vertical MP4 video file.
 * Creates a dual-track MP4 (Track 1 = H.264 Video, Track 2 = MPEG Audio / MP4A)
 * ensuring full compatibility with HTML5 browser video players, QuickTime, VLC, and Instagram.
 */

function writeUInt32BE(buf: Uint8Array, val: number, offset: number): void {
  buf[offset] = (val >>> 24) & 0xff;
  buf[offset + 1] = (val >>> 16) & 0xff;
  buf[offset + 2] = (val >>> 8) & 0xff;
  buf[offset + 3] = val & 0xff;
}

function writeUInt16BE(buf: Uint8Array, val: number, offset: number): void {
  buf[offset] = (val >>> 8) & 0xff;
  buf[offset + 1] = val & 0xff;
}

function asciiToBytes(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i) & 0xff;
  }
  return bytes;
}

function concatBuffers(buffers: Uint8Array[]): Uint8Array {
  const totalLen = buffers.reduce((sum, b) => sum + b.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const b of buffers) {
    result.set(b, offset);
    offset += b.length;
  }
  return result;
}

function box(type: string, ...payloads: (Uint8Array | string)[]): Uint8Array {
  const byteArrays = payloads.map((p) => (typeof p === 'string' ? asciiToBytes(p) : p));
  const payloadLen = byteArrays.reduce((sum, b) => sum + b.length, 0);
  const header = new Uint8Array(8);
  writeUInt32BE(header, payloadLen + 8, 0);
  const typeBytes = asciiToBytes(type);
  header.set(typeBytes.subarray(0, 4), 4);
  return concatBuffers([header, ...byteArrays]);
}

function fullBox(type: string, version: number, flags: number, ...payloads: (Uint8Array | string)[]): Uint8Array {
  const vFlags = new Uint8Array(4);
  vFlags[0] = version & 0xff;
  vFlags[1] = (flags >>> 16) & 0xff;
  vFlags[2] = (flags >>> 8) & 0xff;
  vFlags[3] = flags & 0xff;
  return box(type, vFlags, ...payloads);
}

export function parseMp3Frames(buffer: Buffer): {
  frames: Uint8Array[];
  sampleRate: number;
  channels: number;
  durationSeconds: number;
  bitrate: number;
} {
  const bitrateTableMpeg1L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
  const sampleRateTableMpeg1 = [44100, 48000, 32000, 0];
  const sampleRateTableMpeg2 = [22050, 24000, 16000, 0];

  const frames: Uint8Array[] = [];
  let offset = 0;

  // Skip ID3v2 tag if present
  if (buffer.length > 10 && buffer.toString('ascii', 0, 3) === 'ID3') {
    const tagSize =
      ((buffer[6] & 0x7f) << 21) |
      ((buffer[7] & 0x7f) << 14) |
      ((buffer[8] & 0x7f) << 7) |
      (buffer[9] & 0x7f);
    offset = 10 + tagSize;
  }

  let detectedSampleRate = 44100;
  let detectedChannels = 2;
  let detectedBitrate = 128;

  while (offset < buffer.length - 4) {
    // Look for sync word 0xFFE0
    if (buffer[offset] === 0xff && (buffer[offset + 1] & 0xe0) === 0xe0) {
      const b1 = buffer[offset + 1];
      const b2 = buffer[offset + 2];
      const b3 = buffer[offset + 3];

      const mpegVersion = (b1 >> 3) & 0x03; // 3 = MPEG-1, 2 = MPEG-2, 0 = MPEG-2.5
      const _layer = (b1 >> 1) & 0x03; // 1 = Layer 3
      void _layer;
      const bitrateIdx = (b2 >> 4) & 0x0f;
      const sampleRateIdx = (b2 >> 2) & 0x03;
      const padding = (b2 >> 1) & 0x01;
      const channelMode = (b3 >> 6) & 0x03;

      let sampleRate = 44100;
      if (mpegVersion === 3) sampleRate = sampleRateTableMpeg1[sampleRateIdx] || 44100;
      else if (mpegVersion === 2 || mpegVersion === 0) sampleRate = sampleRateTableMpeg2[sampleRateIdx] || 22050;

      let bitrateKbps = bitrateTableMpeg1L3[bitrateIdx] || 128;
      let frameLen = Math.floor((144 * bitrateKbps * 1000) / sampleRate) + padding;

      if (frameLen > 0 && offset + frameLen <= buffer.length) {
        detectedSampleRate = sampleRate;
        detectedChannels = channelMode === 3 ? 1 : 2;
        detectedBitrate = bitrateKbps;

        const frameData = new Uint8Array(buffer.subarray(offset, offset + frameLen));
        frames.push(frameData);
        offset += frameLen;
        continue;
      }
    }
    offset++;
  }

  const durationSeconds = (frames.length * 1152) / detectedSampleRate;

  return {
    frames,
    sampleRate: detectedSampleRate,
    channels: detectedChannels,
    durationSeconds,
    bitrate: detectedBitrate
  };
}

/**
 * Builds a complete dual-track vertical MP4 with H.264 video and real MP3/AAC audio.
 */
export function buildMuxedVerticalMp4(options: {
  width?: number;
  height?: number;
  durationSeconds?: number;
  fps?: number;
  mp3AudioBuffer?: Buffer;
}): Uint8Array {
  const width = options.width || 1080;
  const height = options.height || 1920;
  const fps = options.fps || 30;

  // 1. Process Audio Track if provided
  let audioFrames: Uint8Array[] = [];
  let audioSampleRate = 44100;
  let audioChannels = 2;
  let audioDurationSeconds = options.durationSeconds || 5;

  if (options.mp3AudioBuffer && options.mp3AudioBuffer.length > 0) {
    const parsed = parseMp3Frames(options.mp3AudioBuffer);
    if (parsed.frames.length > 0) {
      audioFrames = parsed.frames;
      audioSampleRate = parsed.sampleRate;
      audioChannels = parsed.channels;
      audioDurationSeconds = parsed.durationSeconds;
    }
  }

  // Duration is driven by options.durationSeconds or audio track duration
  const duration = options.durationSeconds || Math.max(audioDurationSeconds, 5);
  const totalVideoFrames = Math.ceil(duration * fps);
  const videoTimescale = 30000;
  const frameDuration = Math.round(videoTimescale / fps);

  // 2. Build Video Samples (H.264 Baseline 9:16)
  const sps = new Uint8Array([
    0x67, 0x42, 0xc0, 0x1f, 0xda, 0x01, 0x6e, 0x40, 0x00, 0x00, 0x03, 0x00, 0x40, 0x00, 0x00, 0x0f, 0x03, 0xc5, 0x8b, 0x67, 0x8d, 0x0d
  ]);
  const pps = new Uint8Array([0x68, 0xce, 0x38, 0x80]);
  const idrSlice = new Uint8Array([
    0x65, 0x88, 0x84, 0x00, 0x10, 0xff, 0x00, 0x00, 0x03, 0x00, 0x00, 0x03, 0x00, 0x80
  ]);

  function makeNal(data: Uint8Array): Uint8Array {
    const header = new Uint8Array(4);
    writeUInt32BE(header, data.length, 0);
    return concatBuffers([header, data]);
  }

  const videoSampleBuffers: Uint8Array[] = [];
  const videoSampleSizes: number[] = [];

  for (let i = 0; i < totalVideoFrames; i++) {
    let sampleData: Uint8Array;
    if (i % fps === 0) {
      const spsNal = makeNal(sps);
      const ppsNal = makeNal(pps);
      const idrNal = makeNal(idrSlice);
      sampleData = concatBuffers([spsNal, ppsNal, idrNal]);
    } else {
      sampleData = makeNal(idrSlice);
    }
    videoSampleBuffers.push(sampleData);
    videoSampleSizes.push(sampleData.length);
  }

  // 3. Prepare mdat payload (interleaved or sequential chunks)
  // Video chunk in mdat, followed by Audio chunk in mdat
  const videoDataPayload = concatBuffers(videoSampleBuffers);
  const audioDataPayload = audioFrames.length > 0 ? concatBuffers(audioFrames) : new Uint8Array(0);

  const mdatPayload = concatBuffers([videoDataPayload, audioDataPayload]);
  const mdat = box('mdat', mdatPayload);

  // 4. ftyp
  const ftyp = box(
    'ftyp',
    asciiToBytes('isom'),
    new Uint8Array([0, 0, 0x02, 0]),
    asciiToBytes('isomiso2avc1mp41mp42')
  );

  // 5. mvhd
  const mvhdTimescale = 1000;
  const mvhdDuration = Math.round(duration * mvhdTimescale);
  const mvhd = fullBox(
    'mvhd',
    0,
    0,
    new Uint8Array(4), // creation time
    new Uint8Array(4), // modification time
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, mvhdTimescale, 0); return b; })(),
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, mvhdDuration, 0); return b; })(),
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, 0x00010000, 0); return b; })(), // rate 1.0
    (() => { const b = new Uint8Array(2); writeUInt16BE(b, 0x0100, 0); return b; })(), // volume 1.0
    new Uint8Array(10), // reserved
    (() => {
      const b = new Uint8Array(36);
      writeUInt32BE(b, 0x00010000, 0);
      writeUInt32BE(b, 0x00010000, 16);
      writeUInt32BE(b, 0x40000000, 32);
      return b;
    })(),
    new Uint8Array(24), // pre_defined
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, audioFrames.length > 0 ? 3 : 2, 0); return b; })() // next_track_id
  );

  // 6. Track 1: Video Track
  const tkhdVideo = fullBox(
    'tkhd',
    0,
    0x000007,
    new Uint8Array(4),
    new Uint8Array(4),
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1, 0); return b; })(),
    new Uint8Array(4),
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, mvhdDuration, 0); return b; })(),
    new Uint8Array(8),
    new Uint8Array(2),
    new Uint8Array(2),
    new Uint8Array(2),
    new Uint8Array(2),
    (() => {
      const b = new Uint8Array(36);
      writeUInt32BE(b, 0x00010000, 0);
      writeUInt32BE(b, 0x00010000, 16);
      writeUInt32BE(b, 0x40000000, 32);
      return b;
    })(),
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, width << 16, 0); return b; })(),
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, height << 16, 0); return b; })()
  );

  const mdhdVideo = fullBox(
    'mdhd',
    0,
    0,
    new Uint8Array(4),
    new Uint8Array(4),
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, videoTimescale, 0); return b; })(),
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, Math.round(duration * videoTimescale), 0); return b; })(),
    new Uint8Array(2),
    new Uint8Array(2)
  );

  const hdlrVideo = fullBox(
    'hdlr',
    0,
    0,
    new Uint8Array(4),
    asciiToBytes('vide'),
    new Uint8Array(12),
    asciiToBytes('FLASH.Ai Video Track\0')
  );

  const vmhd = fullBox('vmhd', 0, 1, new Uint8Array(2), new Uint8Array(6));
  const urlBox = fullBox('url ', 0, 1);
  const dref = fullBox('dref', 0, 0, (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1, 0); return b; })(), urlBox);
  const dinf = box('dinf', dref);

  const avcC = box(
    'avcC',
    new Uint8Array([1, sps[1], sps[2], sps[3], 0xff, 0xe1]),
    (() => { const b = new Uint8Array(2); writeUInt16BE(b, sps.length, 0); return b; })(),
    sps,
    new Uint8Array([1]),
    (() => { const b = new Uint8Array(2); writeUInt16BE(b, pps.length, 0); return b; })(),
    pps
  );

  const avc1VisualSampleEntry = concatBuffers([
    new Uint8Array(6),
    (() => { const b = new Uint8Array(2); writeUInt16BE(b, 1, 0); return b; })(),
    new Uint8Array(16),
    (() => { const b = new Uint8Array(2); writeUInt16BE(b, width, 0); return b; })(),
    (() => { const b = new Uint8Array(2); writeUInt16BE(b, height, 0); return b; })(),
    new Uint8Array([0, 72, 0, 0]),
    new Uint8Array([0, 72, 0, 0]),
    new Uint8Array(4),
    (() => { const b = new Uint8Array(2); writeUInt16BE(b, 1, 0); return b; })(),
    asciiToBytes('\x0aFLASH.Ai H264\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0'),
    new Uint8Array([0, 24]),
    new Uint8Array([0xff, 0xff])
  ]);

  const avc1 = box('avc1', avc1VisualSampleEntry, avcC);
  const stsdVideo = fullBox('stsd', 0, 0, (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1, 0); return b; })(), avc1);

  const sttsVideo = fullBox(
    'stts',
    0,
    0,
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1, 0); return b; })(),
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, totalVideoFrames, 0); return b; })(),
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, frameDuration, 0); return b; })()
  );

  const keyframes: number[] = [];
  for (let i = 0; i < totalVideoFrames; i++) {
    if (i % fps === 0) keyframes.push(i + 1);
  }
  const stssVideo = fullBox(
    'stss',
    0,
    0,
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, keyframes.length, 0); return b; })(),
    ...keyframes.map((kf) => { const b = new Uint8Array(4); writeUInt32BE(b, kf, 0); return b; })
  );

  const stscVideo = fullBox(
    'stsc',
    0,
    0,
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1, 0); return b; })(),
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1, 0); return b; })(),
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, totalVideoFrames, 0); return b; })(),
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1, 0); return b; })()
  );

  const stszVideo = fullBox(
    'stsz',
    0,
    0,
    new Uint8Array(4),
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, totalVideoFrames, 0); return b; })(),
    ...videoSampleSizes.map((sz) => { const b = new Uint8Array(4); writeUInt32BE(b, sz, 0); return b; })
  );

  // 7. Track 2: Audio Track (MPEG-1 Layer 3 / MP4A)
  let trakAudio: Uint8Array | undefined;
  let audioSampleSizes: number[] = [];

  if (audioFrames.length > 0) {
    audioSampleSizes = audioFrames.map((f) => f.length);

    const tkhdAudio = fullBox(
      'tkhd',
      0,
      0x000007,
      new Uint8Array(4),
      new Uint8Array(4),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, 2, 0); return b; })(),
      new Uint8Array(4),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, mvhdDuration, 0); return b; })(),
      new Uint8Array(8),
      new Uint8Array(2),
      (() => { const b = new Uint8Array(2); writeUInt16BE(b, 0x0100, 0); return b; })(), // audio volume = 1.0
      new Uint8Array(2),
      new Uint8Array(2),
      (() => {
        const b = new Uint8Array(36);
        writeUInt32BE(b, 0x00010000, 0);
        writeUInt32BE(b, 0x00010000, 16);
        writeUInt32BE(b, 0x40000000, 32);
        return b;
      })(),
      new Uint8Array(4), // width = 0
      new Uint8Array(4)  // height = 0
    );

    const mdhdAudio = fullBox(
      'mdhd',
      0,
      0,
      new Uint8Array(4),
      new Uint8Array(4),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, audioSampleRate, 0); return b; })(),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, audioFrames.length * 1152, 0); return b; })(),
      new Uint8Array(2),
      new Uint8Array(2)
    );

    const hdlrAudio = fullBox(
      'hdlr',
      0,
      0,
      new Uint8Array(4),
      asciiToBytes('soun'),
      new Uint8Array(12),
      asciiToBytes('FLASH.Ai Audio Track\0')
    );

    const smhd = fullBox('smhd', 0, 0, new Uint8Array(2), new Uint8Array(2));

    // Audio Sample Description (mp4a with elementary stream descriptor for MPEG Audio)
    const esds = fullBox(
      'esds',
      0,
      0,
      new Uint8Array([
        0x03, 0x19, // ES_Descriptor tag + length
        0x00, 0x02, // ES_ID = 2
        0x00,       // flags
        0x04, 0x11, // DecoderConfigDescr tag + length
        0x6b,       // objectTypeIndication = 0x6B (MPEG-1 Audio / MP3)
        0x15,       // streamType = Audio (0x05 << 2 | 1)
        0x00, 0x06, 0x00, // bufferSizeDB (1536)
        0x00, 0x02, 0x00, 0x00, // maxBitrate (131072)
        0x00, 0x01, 0xf4, 0x00, // avgBitrate (128000)
        0x05, 0x02, // DecSpecificInfo tag + length
        0x12, 0x10, // AudioSpecificConfig
        0x06, 0x01, 0x02 // SLConfigDescr
      ])
    );

    const mp4aAudioSampleEntry = concatBuffers([
      new Uint8Array(6), // reserved
      (() => { const b = new Uint8Array(2); writeUInt16BE(b, 1, 0); return b; })(), // data_reference_index
      new Uint8Array(8), // reserved
      (() => { const b = new Uint8Array(2); writeUInt16BE(b, audioChannels, 0); return b; })(), // channel_count
      (() => { const b = new Uint8Array(2); writeUInt16BE(b, 16, 0); return b; })(), // sample_size = 16 bit
      new Uint8Array(4), // pre_defined, reserved
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, audioSampleRate << 16, 0); return b; })(), // sample_rate (16.16)
      esds
    ]);

    const mp4a = box('.mp3', mp4aAudioSampleEntry);
    const stsdAudio = fullBox('stsd', 0, 0, (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1, 0); return b; })(), mp4a);

    // stts: 1152 audio samples per MPEG frame
    const sttsAudio = fullBox(
      'stts',
      0,
      0,
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1, 0); return b; })(),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, audioFrames.length, 0); return b; })(),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1152, 0); return b; })()
    );

    const stscAudio = fullBox(
      'stsc',
      0,
      0,
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1, 0); return b; })(),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1, 0); return b; })(),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, audioFrames.length, 0); return b; })(),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1, 0); return b; })()
    );

    const stszAudio = fullBox(
      'stsz',
      0,
      0,
      new Uint8Array(4),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, audioFrames.length, 0); return b; })(),
      ...audioSampleSizes.map((sz) => { const b = new Uint8Array(4); writeUInt32BE(b, sz, 0); return b; })
    );

    // Stco placeholder for audio
    const stcoPlaceholderAudio = fullBox('stco', 0, 0, new Uint8Array(4), new Uint8Array(4));
    const stblAudio = box('stbl', stsdAudio, sttsAudio, stscAudio, stszAudio, stcoPlaceholderAudio);
    const minfAudio = box('minf', smhd, dinf, stblAudio);
    const mdiaAudio = box('mdia', mdhdAudio, hdlrAudio, minfAudio);
    trakAudio = box('trak', tkhdAudio, mdiaAudio);
  }

  // 8. Calculate exact chunk offsets (stco)
  const stcoPlaceholderVideo = fullBox('stco', 0, 0, new Uint8Array(4), new Uint8Array(4));
  const stblVideoPre = box('stbl', stsdVideo, sttsVideo, stssVideo, stscVideo, stszVideo, stcoPlaceholderVideo);
  const minfVideoPre = box('minf', vmhd, dinf, stblVideoPre);
  const mdiaVideoPre = box('mdia', mdhdVideo, hdlrVideo, minfVideoPre);
  const trakVideoPre = box('trak', tkhdVideo, mdiaVideoPre);

  const traks = trakAudio ? [trakVideoPre, trakAudio] : [trakVideoPre];
  const moovPre = box('moov', mvhd, ...traks);

  const mdatHeaderSize = 8;
  const videoDataOffset = ftyp.length + moovPre.length + mdatHeaderSize;
  const audioDataOffset = videoDataOffset + videoDataPayload.length;

  // Final Video STCO
  const stcoVideoFinal = fullBox(
    'stco',
    0,
    0,
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1, 0); return b; })(),
    (() => { const b = new Uint8Array(4); writeUInt32BE(b, videoDataOffset, 0); return b; })()
  );

  const stblVideoFinal = box('stbl', stsdVideo, sttsVideo, stssVideo, stscVideo, stszVideo, stcoVideoFinal);
  const minfVideoFinal = box('minf', vmhd, dinf, stblVideoFinal);
  const mdiaVideoFinal = box('mdia', mdhdVideo, hdlrVideo, minfVideoFinal);
  const trakVideoFinal = box('trak', tkhdVideo, mdiaVideoFinal);

  // Final Audio STCO
  let trakAudioFinal: Uint8Array | undefined;
  if (trakAudio && audioFrames.length > 0) {
    const stcoAudioFinal = fullBox(
      'stco',
      0,
      0,
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1, 0); return b; })(),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, audioDataOffset, 0); return b; })()
    );

    // Audio sample desc with standard .mp3 / mp4a
    const esds = fullBox(
      'esds',
      0,
      0,
      new Uint8Array([
        0x03, 0x19, 0x00, 0x02, 0x00, 0x04, 0x11, 0x6b,
        0x15, 0x00, 0x06, 0x00, 0x00, 0x02, 0x00, 0x00,
        0x00, 0x01, 0xf4, 0x00, 0x05, 0x02, 0x12, 0x10,
        0x06, 0x01, 0x02
      ])
    );

    const mp4aAudioSampleEntry = concatBuffers([
      new Uint8Array(6),
      (() => { const b = new Uint8Array(2); writeUInt16BE(b, 1, 0); return b; })(),
      new Uint8Array(8),
      (() => { const b = new Uint8Array(2); writeUInt16BE(b, audioChannels, 0); return b; })(),
      (() => { const b = new Uint8Array(2); writeUInt16BE(b, 16, 0); return b; })(),
      new Uint8Array(4),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, audioSampleRate << 16, 0); return b; })(),
      esds
    ]);

    const mp4a = box('.mp3', mp4aAudioSampleEntry);
    const stsdAudio = fullBox('stsd', 0, 0, (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1, 0); return b; })(), mp4a);

    const sttsAudio = fullBox(
      'stts',
      0,
      0,
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1, 0); return b; })(),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, audioFrames.length, 0); return b; })(),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1152, 0); return b; })()
    );

    const stscAudio = fullBox(
      'stsc',
      0,
      0,
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1, 0); return b; })(),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1, 0); return b; })(),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, audioFrames.length, 0); return b; })(),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, 1, 0); return b; })()
    );

    const stszAudio = fullBox(
      'stsz',
      0,
      0,
      new Uint8Array(4),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, audioFrames.length, 0); return b; })(),
      ...audioSampleSizes.map((sz) => { const b = new Uint8Array(4); writeUInt32BE(b, sz, 0); return b; })
    );

    const smhd = fullBox('smhd', 0, 0, new Uint8Array(2), new Uint8Array(2));
    const stblAudioFinal = box('stbl', stsdAudio, sttsAudio, stscAudio, stszAudio, stcoAudioFinal);
    const minfAudioFinal = box('minf', smhd, dinf, stblAudioFinal);
    const mdiaAudioFinal = box('mdia', (() => {
      return fullBox(
        'mdhd',
        0,
        0,
        new Uint8Array(4),
        new Uint8Array(4),
        (() => { const b = new Uint8Array(4); writeUInt32BE(b, audioSampleRate, 0); return b; })(),
        (() => { const b = new Uint8Array(4); writeUInt32BE(b, audioFrames.length * 1152, 0); return b; })(),
        new Uint8Array(2),
        new Uint8Array(2)
      );
    })(), fullBox('hdlr', 0, 0, new Uint8Array(4), asciiToBytes('soun'), new Uint8Array(12), asciiToBytes('FLASH.Ai Audio Track\0')), minfAudioFinal);

    const tkhdAudio = fullBox(
      'tkhd',
      0,
      0x000007,
      new Uint8Array(4),
      new Uint8Array(4),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, 2, 0); return b; })(),
      new Uint8Array(4),
      (() => { const b = new Uint8Array(4); writeUInt32BE(b, mvhdDuration, 0); return b; })(),
      new Uint8Array(8),
      new Uint8Array(2),
      (() => { const b = new Uint8Array(2); writeUInt16BE(b, 0x0100, 0); return b; })(),
      new Uint8Array(2),
      new Uint8Array(2),
      (() => {
        const b = new Uint8Array(36);
        writeUInt32BE(b, 0x00010000, 0);
        writeUInt32BE(b, 0x00010000, 16);
        writeUInt32BE(b, 0x40000000, 32);
        return b;
      })(),
      new Uint8Array(4),
      new Uint8Array(4)
    );

    trakAudioFinal = box('trak', tkhdAudio, mdiaAudioFinal);
  }

  const finalTraks = trakAudioFinal ? [trakVideoFinal, trakAudioFinal] : [trakVideoFinal];
  const moovFinal = box('moov', mvhd, ...finalTraks);

  return concatBuffers([ftyp, moovFinal, mdat]);
}
