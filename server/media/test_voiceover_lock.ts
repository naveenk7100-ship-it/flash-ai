import { fastReelEngine } from './fastReelEngine.js';
import { MediaValidator } from './mediaValidator.js';
import fs from 'node:fs';

async function runVoiceoverLockTests() {
  console.log('================================================================');
  console.log('FLASH.Ai FINAL VOICEOVER SOURCE-OF-TRUTH VERIFICATION TEST SUITE');
  console.log('================================================================\n');

  // TEST 1: USER SCRIPT TEST
  console.log('--- RUNNING TEST 1: USER SCRIPT TEST ---');
  const userTopic = 'Claude Artifacts Workflow';
  const userScript = 'Claude Artifacts lets you turn a natural-language request into an interactive workspace. You can generate code, preview the result, and iterate without leaving the conversation.';

  const userResult = await fastReelEngine.generateFastReel({
    mode: 'USER_SCRIPT',
    topic: userTopic,
    script: userScript,
    formatId: 'product-demo'
  });

  if (!userResult.success || !userResult.manifest) {
    throw new Error(`Test 1 Failed: ${userResult.errorMessage || 'No manifest generated'}`);
  }

  const m1 = userResult.manifest;
  console.log('TEST 1 MANIFEST:', {
    sourceType: m1.sourceType,
    finalScript: m1.finalScript,
    scriptHash: m1.scriptHash,
    voiceText: m1.voiceText,
    voiceHash: m1.voiceHash,
    audioPath: m1.audioPath,
    scenesCount: m1.scenes.length
  });

  if (m1.sourceType !== 'USER_SCRIPT') throw new Error('Test 1 Failed: sourceType is not USER_SCRIPT');
  if (m1.finalScript !== userScript) throw new Error('Test 1 Failed: finalScript was altered');
  if (m1.voiceText !== userScript) throw new Error('Test 1 Failed: voiceText does not match finalScript');
  if (!m1.voiceHash) throw new Error('Test 1 Failed: missing voiceHash');
  if (!fs.existsSync(m1.audioPath)) throw new Error('Test 1 Failed: audio file does not exist');

  console.log('>>> TEST 1 PASS: User script strictly preserved & synthesized without alterations.\n');

  // TEST 2: GENERATED TOPIC SCRIPT TEST
  console.log('--- RUNNING TEST 2: GENERATED TOPIC SCRIPT TEST ---');
  const genTopic = 'How Claude Artifacts turns prompts into interactive apps in real time';

  const genResult = await fastReelEngine.generateFastReel({
    mode: 'DAILY_DISCOVERY',
    topic: genTopic,
    formatId: 'product-demo'
  });

  if (!genResult.success || !genResult.manifest) {
    throw new Error(`Test 2 Failed: ${genResult.errorMessage || 'No manifest generated'}`);
  }

  const m2 = genResult.manifest;
  console.log('TEST 2 MANIFEST:', {
    sourceType: m2.sourceType,
    finalScript: m2.finalScript,
    scriptHash: m2.scriptHash,
    voiceText: m2.voiceText,
    voiceHash: m2.voiceHash,
    audioPath: m2.audioPath,
    scenesCount: m2.scenes.length
  });

  if (m2.sourceType !== 'GENERATED_TOPIC_SCRIPT') throw new Error('Test 2 Failed: sourceType is not GENERATED_TOPIC_SCRIPT');
  if (!m2.finalScript.includes('Claude Artifacts')) throw new Error('Test 2 Failed: finalScript does not contain topic entities');
  if (m2.voiceText !== m2.finalScript) throw new Error('Test 2 Failed: voiceText does not match finalScript');
  if (!m2.voiceHash) throw new Error('Test 2 Failed: missing voiceHash');
  if (!fs.existsSync(m2.audioPath)) throw new Error('Test 2 Failed: audio file does not exist');

  console.log('>>> TEST 2 PASS: Topic-specific generated script synthesized with 100% voice matching.\n');

  // TEST 3: SAME TEMPLATE, DIFFERENT SCRIPT TEST (HASH SEPARATION)
  console.log('--- RUNNING TEST 3: SAME TEMPLATE, DIFFERENT SCRIPT TEST ---');
  console.log(`Template 1: ${m1.templateId} | Script Hash: ${m1.scriptHash} | Audio: ${m1.audioPath}`);
  console.log(`Template 2: ${m2.templateId} | Script Hash: ${m2.scriptHash} | Audio: ${m2.audioPath}`);

  if (m1.scriptHash === m2.scriptHash) {
    throw new Error('Test 3 Failed: Script hashes are identical!');
  }
  if (m1.audioPath === m2.audioPath) {
    throw new Error('Test 3 Failed: Audio file paths are identical!');
  }

  console.log('>>> TEST 3 PASS: Same template with different scripts produced distinct hashes and distinct audio files.\n');

  // Validate Final MP4 for Test 1
  if (userResult.videoPath) {
    const insp = MediaValidator.inspectMp4File(userResult.videoPath);
    console.log('FINAL MP4 INSPECTION (Test 1):', {
      isValidMp4: insp.isValidMp4,
      hasVideoStream: insp.hasVideoStream,
      hasAudioStream: insp.hasAudioStream,
      resolution: `${insp.videoWidth}x${insp.videoHeight}`,
      isVertical9x16: insp.isVertical9x16,
      videoDuration: insp.videoDurationSeconds,
      audioDuration: insp.audioDurationSeconds,
      totalSizeBytes: insp.totalSizeBytes
    });
  }

  console.log('================================================================');
  console.log('ALL VOICEOVER SOURCE-OF-TRUTH TESTS PASSED (3/3)');
  console.log('================================================================');
}

runVoiceoverLockTests().catch((err) => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
