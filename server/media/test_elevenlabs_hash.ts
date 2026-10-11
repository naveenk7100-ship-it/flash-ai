import { elevenLabsProvider } from './providers/elevenLabsProvider.js';
import fs from 'node:fs';

async function testProvider() {
  const script1 = "Claude Artifacts lets you turn a natural-language request into an interactive workspace. You can generate code, preview the result, and iterate without leaving the conversation.";
  const script2 = "How Claude Artifacts turns prompts into interactive apps in real time. First, you type a request. Next, Claude writes and runs code live in the sidebar.";

  console.log("Generating Audio 1...");
  const res1 = await elevenLabsProvider.generateSpeech(script1);
  console.log("Audio 1 Result:", {
    audioUrl: res1.audioUrl,
    duration: res1.durationSeconds,
    fileSize: res1.fileSizeBytes,
    hash: res1.scriptHash?.slice(0, 16)
  });

  console.log("Generating Audio 2...");
  const res2 = await elevenLabsProvider.generateSpeech(script2);
  console.log("Audio 2 Result:", {
    audioUrl: res2.audioUrl,
    duration: res2.durationSeconds,
    fileSize: res2.fileSizeBytes,
    hash: res2.scriptHash?.slice(0, 16)
  });

  if (res1.audioUrl === res2.audioUrl) {
    throw new Error("FAIL: Both scripts generated the same audio URL!");
  }
  console.log("PASS: Different scripts generated completely distinct hash audio files!");
}

testProvider().catch(console.error);
