/**
 * FLASH.Ai Frame Animation & Visual Motion Engine (12-Template Production Architecture)
 * 
 * Provides continuous frame-by-frame procedural SVG generation for all 12 AI formats:
 * 1. PRODUCT_DEMO (Realistic app UI, cursor movements, clicks, typing, expanding panels, feature activation)
 * 2. TOOL_SHOWCASE (Product hero visual, capability cards, query test simulation, use-case matrix)
 * 3. NEWS_UPDATE (Breaking news banner, verified source badge, animated information ticker, industry impact)
 * 4. AI_UPDATE (Model version changelog, live capability canvas, parameter comparison meters)
 * 5. EXPLAINER (Concept breakdown diagrams, glowing nodes, relationship flow, visual metaphors)
 * 6. HOW_TO (Step 1 -> Step 2 -> Step 3 progression, action simulation, cursor interaction, verified result)
 * 7. LISTICLE (Big numbered badges 01-05 with completely different visual styles per item)
 * 8. COMPARISON (True side-by-side split-screen comparison with sliding neon divider & spec matrix)
 * 9. BEFORE_AFTER (State A manual friction -> laser scanline transition -> State B instant automated result)
 * 10. AUTOMATION_WORKFLOW (Trigger -> Input -> AI Reasoning -> Action -> Output node graph with energy pulses)
 * 11. DATA_INSIGHT (Dynamic rising bar charts, animated line graphs, percentage counters, verified benchmarks)
 * 12. CINEMATIC_EXPLAINER (Layered depth compositions, floating glassmorphic cards, parallax tilts, storytelling)
 * 
 * Plus:
 * - Real pixel-level camera motion (scale, pan, tilt, push-in, pull-back)
 * - Kinetic speech-synchronized captions with glassmorphism safe-zone rendering (71-75% Y)
 * - 30 FPS continuous dynamic frame delta verification
 */

function escapeXml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface FrameContext {
  sceneIndex: number;
  totalScenes: number;
  sceneProgress: number; // 0.0 -> 1.0 within current scene
  sceneDuration: number; // seconds
  sceneElapsed: number; // seconds within current scene
  globalTime: number; // seconds across entire video
  totalDuration: number; // seconds
  width: number;
  height: number;
  headline: string;
  subtitle: string;
  narration: string;
  templateId?: string;
  visualAssetType?: string;
}

export interface CaptionBeat {
  startTime: number;
  endTime: number;
  words: string[];
  highlightWordIndex: number;
}

export class FrameAnimationEngine {
  private captionBeats: CaptionBeat[] = [];

  constructor(scriptText?: string, totalDuration: number = 28.73) {
    this.buildCaptionTimeline(scriptText || '', totalDuration);
  }

  /**
   * Builds synchronized caption beats across the full video duration
   */
  public buildCaptionTimeline(scriptText: string, totalDuration: number) {
    const rawSentences = scriptText
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (rawSentences.length === 0) {
      this.captionBeats = [
        {
          startTime: 0,
          endTime: totalDuration,
          words: ['FLASH.Ai', 'AI', 'Productivity', 'Hub'],
          highlightWordIndex: 1
        }
      ];
      return;
    }

    // Audio-derived exact caption beats for Claude Artifacts script matching ElevenLabs Liam delivery
    if (scriptText.toLowerCase().includes('claude artifacts') || scriptText.toLowerCase().includes('natural-language request')) {
      this.captionBeats = [
        {
          startTime: 0.0,
          endTime: 1.80,
          words: ['Claude', 'Artifacts', 'lets', 'you'],
          highlightWordIndex: 1
        },
        {
          startTime: 1.80,
          endTime: 3.35,
          words: ['turn', 'a', 'natural-language', 'request'],
          highlightWordIndex: 2
        },
        {
          startTime: 3.35,
          endTime: 5.07,
          words: ['into', 'an', 'interactive', 'workspace.'],
          highlightWordIndex: 2
        },
        {
          startTime: 5.95,
          endTime: 7.10,
          words: ['You', 'can', 'generate', 'code,'],
          highlightWordIndex: 3
        },
        {
          startTime: 7.55,
          endTime: 8.80,
          words: ['preview', 'the', 'result,'],
          highlightWordIndex: 2
        },
        {
          startTime: 9.05,
          endTime: 11.20,
          words: ['and', 'iterate', 'without', 'leaving', 'the', 'conversation.'],
          highlightWordIndex: 5
        }
      ];
      return;
    }

    const beats: CaptionBeat[] = [];
    const avgSentenceDur = totalDuration / rawSentences.length;

    rawSentences.forEach((sentence, sIdx) => {
      const sentenceStart = sIdx * avgSentenceDur;
      const words = sentence.split(/\s+/).filter(Boolean);
      const chunkSize = 4;
      const numChunks = Math.max(1, Math.ceil(words.length / chunkSize));
      const chunkDur = avgSentenceDur / numChunks;

      for (let c = 0; c < numChunks; c++) {
        const chunkWords = words.slice(c * chunkSize, (c + 1) * chunkSize);
        const startTime = parseFloat((sentenceStart + c * chunkDur).toFixed(2));
        const endTime = parseFloat((sentenceStart + (c + 1) * chunkDur).toFixed(2));
        const highlightWordIndex = Math.min(chunkWords.length - 1, Math.floor((c % 2 === 0 ? 1 : 2)));

        beats.push({
          startTime,
          endTime,
          words: chunkWords,
          highlightWordIndex
        });
      }
    });

    this.captionBeats = beats;
  }

  /**
   * Easing functions for organic motion
   */
  public static easeOutQuad(t: number): number {
    return t * (2 - t);
  }

  public static easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  public static spring(t: number): number {
    return 1 - Math.exp(-6 * t) * Math.cos(10 * t);
  }

  public static clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
  }

  /**
   * Generates the complete SVG frame at any timestamp
   */
  public generateFrameSvg(ctx: FrameContext): string {
    const { width, height, sceneIndex, sceneProgress, globalTime } = ctx;

    // 1. Camera Transformation Matrix
    // 1. Calculate Multi-Scene Camera Animation (Strictly Clamped to Safe Zones)
    let cameraScale = 1.0;
    let cameraTranslateX = 0;
    let cameraTranslateY = 0;

    switch (sceneIndex % 4) {
      case 0:
        // Scene 1: Gentle push-in (1.00 -> 1.04), strictly preserving top header safe zone clearance
        cameraScale = 1.00 + 0.04 * FrameAnimationEngine.easeOutQuad(sceneProgress);
        cameraTranslateY = -4 * sceneProgress;
        break;
      case 1:
        // Scene 2: Subtle Pan right & gentle zoom (1.00 -> 1.03)
        cameraScale = 1.00 + 0.03 * sceneProgress;
        cameraTranslateX = -20 * FrameAnimationEngine.easeInOutCubic(sceneProgress);
        cameraTranslateY = 0;
        break;
      case 2:
        // Scene 3: Parallax tilt & zoom (1.00 -> 1.04)
        cameraScale = 1.00 + 0.04 * sceneProgress;
        cameraTranslateY = -6 * Math.sin(sceneProgress * Math.PI);
        break;
      case 3:
      default:
        // Scene 4: Cinematic push-in on completed app (1.00 -> 1.05)
        cameraScale = 1.00 + 0.05 * FrameAnimationEngine.easeOutQuad(sceneProgress);
        cameraTranslateY = -4 * sceneProgress;
        break;
    }

    // 2. Dispatch to Template-Specific Visual Layout
    const sceneInnerContent = this.renderSceneContent(ctx);

    // 3. Kinetic Caption Overlay (in Safe Zone 78% Y: 1510-1630)
    const captionOverlay = this.renderKineticCaption(globalTime, width, height);

    // 4. Snappy Cross-Scene Transition (Maintains continuous brightness for product-demo)
    const isProductDemo = (ctx.templateId || '').toLowerCase().includes('product-demo');
    const fadeDur = 0.10 / (ctx.sceneDuration || 7);
    let sceneAlpha = 1.0;
    if (isProductDemo) {
      sceneAlpha = 1.0; // Never dip brightness in continuous product demo
    } else if (ctx.sceneIndex === 0) {
      sceneAlpha = sceneProgress > (1 - fadeDur) ? Math.max(0.7, (1 - sceneProgress) / fadeDur) : 1.0;
    } else {
      if (sceneProgress < fadeDur) {
        sceneAlpha = Math.max(0.7, sceneProgress / fadeDur);
      } else if (sceneProgress > 1 - fadeDur) {
        sceneAlpha = Math.max(0.7, (1 - sceneProgress) / fadeDur);
      }
    }

    // Format badge text from templateId
    const templateLabel = (ctx.templateId || 'ai-productivity')
      .replace(/-/g, ' ')
      .toUpperCase();

    // 5. Automated Bounding-Box Safe Zone Clearance Verification
    const headerBottomY = 137;
    const effectiveSceneTopY = (255 - height / 2) * cameraScale + height / 2 + cameraTranslateY;
    if (effectiveSceneTopY <= headerBottomY + 20) {
      throw new Error(`Header collision detected: Scene title at ${effectiveSceneTopY.toFixed(1)}px collided with header safe zone (${headerBottomY}px)`);
    }

    return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background:#07090E; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#080B10"/>
      <stop offset="45%" stop-color="#0E131E"/>
      <stop offset="100%" stop-color="#05070A"/>
    </linearGradient>
    <linearGradient id="metallicGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="35%" stop-color="#E2E8F0"/>
      <stop offset="70%" stop-color="#94A3B8"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
    <linearGradient id="sageGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E6F4EA"/>
      <stop offset="50%" stop-color="#A7F3D0"/>
      <stop offset="100%" stop-color="#10B981"/>
    </linearGradient>
    <linearGradient id="limeGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#34D399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="cyanGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#34D399"/>
      <stop offset="100%" stop-color="#10B981"/>
    </linearGradient>
    <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#A7F3D0"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#A7F3D0"/>
    </linearGradient>
    <linearGradient id="amberGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#10B981"/>
    </linearGradient>
    <radialGradient id="depthLighting" cx="50%" cy="30%" r="65%">
      <stop offset="0%" stop-color="rgba(52,211,153,0.14)"/>
      <stop offset="55%" stop-color="rgba(16,185,129,0.03)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
  </defs>

  <!-- Deep Obsidian Canvas & Radial Depth Lighting -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
  <rect width="${width}" height="${height}" fill="url(#depthLighting)"/>
  
  <!-- Ultra-subtle minimal grid (no distraction from motion content) -->
  <g opacity="0.02" transform="translate(0, ${(globalTime * 8) % 60})">
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#FFFFFF" stroke-width="1"/>
    </pattern>
    <rect width="${width}" height="${height + 60}" fill="url(#grid)"/>
  </g>

  <!-- Animated Camera Viewport Group (CONTENT_SAFE_ZONE) -->
  <g transform="translate(${width / 2}, ${height / 2}) scale(${cameraScale.toFixed(4)}) translate(${-width / 2 + cameraTranslateX}, ${-height / 2 + cameraTranslateY})" opacity="${sceneAlpha.toFixed(3)}">
    ${sceneInnerContent}
  </g>

  <!-- Global Brand & Format Bar Header (HEADER_SAFE_ZONE: Y 95-137) -->
  <g transform="translate(60, 95)">
    <rect width="180" height="42" rx="21" fill="rgba(248,250,252,0.06)" stroke="rgba(248,250,252,0.15)" stroke-width="1.5"/>
    <circle cx="24" cy="21" r="7" fill="#34D399"/>
    <text x="42" y="27" font-size="19" font-weight="800" fill="#F8FAFC" letter-spacing="1">FLASH.Ai</text>
    
    <rect x="200" y="0" width="300" height="42" rx="21" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.32)" stroke-width="1.5"/>
    <text x="350" y="27" font-size="15" font-weight="700" fill="#A7F3D0" text-anchor="middle" letter-spacing="0.5">${escapeXml(templateLabel)}</text>
  </g>

  <!-- Kinetic Captions Overlay (CAPTION_SAFE_ZONE: Y 1440-1540) -->
  ${captionOverlay}
</svg>
`;
  }

  /**
   * Dispatches scene rendering to the appropriate template layout
   */
  public renderSceneContent(ctx: FrameContext): string {
    const tid = (ctx.templateId || 'cinematic-storytelling').toLowerCase();

    // 5 Cohesive Distinct Presentation Styles
    if (tid.includes('developer-studio') || tid.includes('developer') || (tid.includes('code') && !tid.includes('subscene'))) {
      return this.renderDeveloperStudioTemplate(ctx);
    }
    if (tid.includes('trend-breakdown') || (tid.includes('breakdown') && !tid.includes('concept'))) {
      return this.renderTrendBreakdownTemplate(ctx);
    }
    if (tid.includes('clean-editorial') || tid.includes('editorial')) {
      return this.renderCleanEditorialTemplate(ctx);
    }
    if (tid.includes('cinematic-storytelling') || tid.includes('storytelling')) {
      return this.renderCinematicStorytellingTemplate(ctx);
    }
    if (tid.includes('product-workflow-demo') || tid.includes('product-demo')) {
      return this.renderProductDemoTemplate(ctx);
    }

    // Existing template formats
    if (tid.includes('tool-showcase')) {
      return this.renderToolShowcaseTemplate(ctx);
    }
    if (tid.includes('news-update') || tid.includes('news')) {
      return this.renderNewsUpdateTemplate(ctx);
    }
    if (tid.includes('ai-update') || tid.includes('update')) {
      return this.renderAiUpdateTemplate(ctx);
    }
    if (tid.includes('explainer') && !tid.includes('cinematic')) {
      return this.renderExplainerTemplate(ctx);
    }
    if (tid.includes('how-to') || tid.includes('tutorial')) {
      return this.renderHowToTemplate(ctx);
    }
    if (tid.includes('listicle') || tid.includes('list')) {
      return this.renderListicleTemplate(ctx);
    }
    if (tid.includes('comparison') || tid.includes('versus')) {
      return this.renderComparisonTemplate(ctx);
    }
    if (tid.includes('before-after')) {
      return this.renderBeforeAfterTemplate(ctx);
    }
    if (tid.includes('automation') || tid.includes('workflow')) {
      return this.renderAutomationWorkflowTemplate(ctx);
    }
    if (tid.includes('data') || tid.includes('insight')) {
      return this.renderDataInsightTemplate(ctx);
    }

    // Default to Cinematic Storytelling / Explainer
    return this.renderCinematicStorytellingTemplate(ctx);
  }

  // =========================================================================
  // TEMPLATE 1: PRODUCT DEMO (Interactive Desktop App UI & Cursors)
  // =========================================================================
  // TEMPLATE 1: PRODUCT DEMO (Realistic Interactive App UI, Chat, Artifacts & Cursors)
  // =========================================================================
  private renderProductDemoTemplate(ctx: FrameContext): string {
    const { globalTime, headline, subtitle } = ctx;

    // SCENE 1 (0–2.5s): Realistic Claude Chat Interface & Rapid Prompt Execution
    if (globalTime < 2.5) {
      // Stronger First 2 Seconds: Start with prompt prefix visible immediately
      const basePrefix = "Build me a task management app with ";
      const extraPrompt = "filters, progress tracking and a clean dashboard.";
      const typeProgress = Math.min(1, globalTime / 1.15);
      const extraChars = Math.floor(typeProgress * extraPrompt.length);
      const fullTyped = basePrefix + extraPrompt.slice(0, extraChars);
      const cursorBlink = Math.floor(globalTime * 5) % 2 === 0 ? '|' : ' ';

      const isSubmitted = globalTime >= 1.40;
      const showClaudeReply = globalTime >= 1.65;
      const showArtifactDrawer = globalTime >= 1.90;

      const sendButtonScale = (globalTime >= 1.35 && globalTime <= 1.60) ? 0.90 : 1.0;
      const sendGlowOpacity = (globalTime >= 1.35 && globalTime <= 1.60) ? 1.0 : 0.0;
      const openButtonScale = (globalTime >= 2.20 && globalTime <= 2.45) ? 0.92 : 1.0;

      // Realistic Cursor motion path
      let cursorX = 520;
      let cursorY = 560;
      if (globalTime < 1.15) {
        // Typing cursor hover at prompt text
        cursorX = 460 + 60 * Math.sin(globalTime * 2);
        cursorY = 550 + 10 * Math.cos(globalTime * 2);
      } else if (globalTime < 1.45) {
        // Swift glide to Send button
        const p = (globalTime - 1.15) / 0.30;
        cursorX = 520 + 310 * FrameAnimationEngine.easeInOutCubic(p);
        cursorY = 560 - 75 * FrameAnimationEngine.easeInOutCubic(p);
      } else if (globalTime < 1.90) {
        // Linger over send button
        cursorX = 830 + 10 * Math.sin(globalTime * 3);
        cursorY = 485 + 5 * Math.cos(globalTime * 3);
      } else if (globalTime < 2.25) {
        // Move down to [OPEN Live Workspace >>] button
        const p = (globalTime - 1.90) / 0.35;
        cursorX = 830 - 30 * FrameAnimationEngine.easeInOutCubic(p);
        cursorY = 485 + 460 * FrameAnimationEngine.easeInOutCubic(p);
      } else {
        // Click on Open Workspace
        cursorX = 800;
        cursorY = 945;
      }

      // High-contrast 2-line wrapped text for 32px prompt
      let line1 = '';
      let line2 = '';
      if (fullTyped.length <= 44) {
        line1 = fullTyped;
      } else {
        line1 = fullTyped.slice(0, 44);
        line2 = fullTyped.slice(44).trimStart();
      }

      // Subtle camera push-in during Scene 1
      const camPush = 1.00 + 0.025 * FrameAnimationEngine.easeOutQuad(globalTime / 2.5);

      return `
        <!-- Title & Subtitle Header (Y: 200) -->
        <g transform="translate(60, 200)">
          <text x="0" y="0" font-size="48" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(headline || 'CLAUDE ARTIFACTS')}</text>
          <text x="0" y="46" font-size="24" font-weight="700" fill="#38BDF8">${escapeXml(subtitle || 'Natural Language Prompt → Interactive Workspace')}</text>
        </g>

        <!-- Continuous Claude Desktop Browser Window (Y: 275) -->
        <g transform="scale(${camPush.toFixed(4)})" transform-origin="540 850">
          <g transform="translate(60, 275)">
            <rect width="960" height="1140" rx="24" fill="#11141E" stroke="#252E40" stroke-width="2"/>
            
            <!-- Window Titlebar -->
            <g transform="translate(32, 28)">
              <circle cx="0" cy="0" r="7" fill="#EF4444"/>
              <circle cx="22" cy="0" r="7" fill="#F59E0B"/>
              <circle cx="44" cy="0" r="7" fill="#10B981"/>
              
              <!-- URL / Status Pill -->
              <rect x="180" y="-16" width="460" height="34" rx="17" fill="#1B2130" stroke="#334155" stroke-width="1"/>
              <text x="210" y="7" font-size="14" font-family="Consolas, monospace" fill="#94A3B8">https://claude.ai/chat/artifacts-live</text>
              
              <!-- Model Badge with Vector Star -->
              <rect x="670" y="-18" width="225" height="36" rx="18" fill="#2E1C0C" stroke="#D97706" stroke-width="2"/>
              <polygon points="692,-4 695,1 700,3 695,5 692,10 689,5 684,3 689,1" fill="#F59E0B"/>
              <text x="715" y="7" font-size="15" font-weight="800" fill="#FBBF24">Claude 3.5 Sonnet</text>
            </g>

            <!-- Chat History Stream -->
            <g transform="translate(32, 75)">
              <!-- Context Message 1: User -->
              <g transform="translate(0, 0)">
                <rect width="896" height="85" rx="16" fill="#1B2232" stroke="#2E3A52" stroke-width="1.5"/>
                <circle cx="36" cy="42" r="18" fill="#2563EB"/>
                <text x="36" y="48" font-size="13" font-weight="900" fill="#FFF" text-anchor="middle">YOU</text>
                <text x="68" y="34" font-size="14" font-weight="800" fill="#93C5FD">User Intent:</text>
                <text x="68" y="60" font-size="17" font-weight="600" fill="#FFFFFF">"Can you build a complete task tracker dashboard directly in React?"</text>
              </g>

              <!-- Context Message 2: Claude Response -->
              <g transform="translate(0, 98)" opacity="${showClaudeReply ? '1.0' : '0.4'}">
                <rect width="896" height="95" rx="16" fill="#19202E" stroke="${showClaudeReply ? '#D97706' : '#2E3A52'}" stroke-width="1.5"/>
                <circle cx="36" cy="45" r="18" fill="#D97706"/>
                <polygon points="36,37 38,42 43,45 38,48 36,53 34,48 29,45 34,42" fill="#FFFFFF"/>
                <text x="68" y="34" font-size="15" font-weight="800" fill="#FBBF24">Claude 3.5 Sonnet</text>
                <text x="68" y="60" font-size="17" fill="#FFFFFF">Yes! Generating a fully interactive TaskFlow application with live filters</text>
                <text x="68" y="84" font-size="15" fill="#94A3B8">and real-time state management directly in a side-by-side Artifact.</text>
              </g>
            </g>

            <!-- Active Prompt Input Container -->
            <g transform="translate(32, 288)">
              <rect width="896" height="375" rx="20" fill="#161B28" stroke="${isSubmitted ? '#10B981' : '#38BDF8'}" stroke-width="${isSubmitted ? 3 : 2}"/>
              
              <!-- Prompt Input Header -->
              <g transform="translate(24, 28)">
                <circle cx="12" cy="14" r="7" fill="#38BDF8"/>
                <text x="28" y="20" font-size="17" font-weight="900" fill="#38BDF8">ACTIVE PROMPT INTERFACE</text>
                <rect x="660" y="2" width="200" height="28" rx="8" fill="#064E3B" stroke="#10B981" stroke-width="1"/>
                <circle cx="676" cy="16" r="4" fill="#34D399"/>
                <text x="765" y="21" font-size="13" font-weight="800" fill="#34D399" text-anchor="middle">Rich Artifact Mode ON</text>
              </g>

              <!-- Prompt Text Area with Typed Text (Large 32px Font) -->
              <g transform="translate(24, 65)">
                <rect width="848" height="215" rx="16" fill="#0A0E17" stroke="${isSubmitted ? '#10B981' : '#334155'}" stroke-width="${isSubmitted ? 2.5 : 1.5}"/>
                
                <text x="24" y="55" font-size="32" font-weight="700" fill="#FFFFFF">
                  ${escapeXml(line1)}
                </text>
                <text x="24" y="105" font-size="32" font-weight="700" fill="#FFFFFF">
                  ${escapeXml(line2)}<tspan fill="#F59E0B" font-weight="900">${cursorBlink}</tspan>
                </text>

                <!-- Prompt Feature Badges -->
                <g transform="translate(24, 155)">
                  <rect width="145" height="36" rx="10" fill="#0C4A6E" stroke="#0284C7" stroke-width="1.5"/>
                  <text x="72" y="24" font-size="15" font-weight="800" fill="#38BDF8" text-anchor="middle">React 18 + TS</text>
                  
                  <rect x="160" width="145" height="36" rx="10" fill="#3B0764" stroke="#7C3AED" stroke-width="1.5"/>
                  <text x="232" y="24" font-size="15" font-weight="800" fill="#C084FC" text-anchor="middle">Tailwind CSS</text>
                  
                  <rect x="320" width="165" height="36" rx="10" fill="#064E3B" stroke="#059669" stroke-width="1.5"/>
                  <text x="402" y="24" font-size="15" font-weight="800" fill="#34D399" text-anchor="middle">Interactive State</text>
                </g>

                <!-- Send Button with Interactive Click Glow -->
                <g transform="translate(730, 75) scale(${sendButtonScale})" transform-origin="48 35">
                  <circle cx="48" cy="35" r="${40 + sendGlowOpacity * 20}" fill="none" stroke="#F59E0B" stroke-width="3" opacity="${sendGlowOpacity}"/>
                  <rect width="96" height="70" rx="18" fill="#D97706"/>
                  <polygon points="38,22 68,35 38,48 44,35" fill="#FFFFFF"/>
                </g>
              </g>

              <!-- Status line below prompt -->
              <g transform="translate(24, 310)">
                <text x="0" y="25" font-size="16" font-weight="800" fill="#94A3B8">Target Output:</text>
                <rect x="120" y="4" width="280" height="32" rx="10" fill="#083344" stroke="#06B6D4" stroke-width="1.5"/>
                <text x="260" y="26" font-size="14" font-weight="900" fill="#38BDF8" text-anchor="middle">Standalone Interactive Artifact</text>
                <text x="420" y="26" font-size="15" font-weight="600" fill="#E2E8F0">Zero external IDE setup required</text>
              </g>
            </g>

            <!-- Streaming Artifact Card Trigger (Pops open on submit) -->
            <g transform="translate(32, 690)" opacity="${showArtifactDrawer ? '1.0' : '0.2'}">
              <rect width="896" height="390" rx="22" fill="#0C1B2A" stroke="${showArtifactDrawer ? '#06B6D4' : '#1E293B'}" stroke-width="2.5"/>
              
              <g transform="translate(30, 36)">
                <circle cx="28" cy="28" r="24" fill="#06B6D4"/>
                <polygon points="28,16 22,28 27,28 24,40 34,26 29,26" fill="#000000"/>
                
                <text x="70" y="24" font-size="24" font-weight="900" fill="#FFFFFF">Artifact Created: TaskFlowStudio.tsx</text>
                <text x="70" y="52" font-size="16" font-weight="700" fill="#38BDF8">Interactive React Component • Priority Filter System • Ready to Preview</text>
              </g>

              <!-- Code Preview Snippet Inside Launcher Card -->
              <g transform="translate(30, 115)">
                <rect width="836" height="235" rx="16" fill="#060911" stroke="#1E293B" stroke-width="1.5"/>
                <text x="28" y="45" font-size="20" font-family="Consolas, monospace" fill="#F43F5E">import { useState } from 'react';</text>
                <text x="28" y="85" font-size="20" font-family="Consolas, monospace" fill="#38BDF8">export function TaskFlow() {</text>
                <text x="56" y="125" font-size="20" font-family="Consolas, monospace" fill="#E2E8F0">  const [filter, setFilter] = useState('ALL');</text>
                <text x="56" y="165" font-size="20" font-family="Consolas, monospace" fill="#34D399">  return &lt;TaskDashboard activeFilter={filter} /&gt;;</text>
                <text x="28" y="205" font-size="20" font-family="Consolas, monospace" fill="#38BDF8">}</text>
                
                <!-- Open Artifact Button -->
                <g transform="translate(630, 65) scale(${openButtonScale})" transform-origin="90 55">
                  <rect width="180" height="110" rx="18" fill="#06B6D4"/>
                  <text x="90" y="55" font-size="20" font-weight="900" fill="#000" text-anchor="middle">OPEN</text>
                  <text x="90" y="85" font-size="14" font-weight="900" fill="#000" text-anchor="middle">Live Workspace &gt;&gt;</text>
                </g>
              </g>
            </g>
          </g>

          <!-- Animated Mouse Pointer Cursor -->
          <g transform="translate(${cursorX.toFixed(1)}, ${cursorY.toFixed(1)})">
            <circle cx="0" cy="0" r="18" fill="rgba(6,182,212,0.3)"/>
            <path d="M0,0 L0,26 L6,20 L14,35 L20,32 L12,17 L21,17 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="2.5"/>
          </g>
        </g>
      `;
    }

    // SCENE 2 (2.5–5.0s): Split-Screen Chat → Real-Time Code Generation & Artifact Opening
    if (globalTime < 5.0) {
      const sceneProgress = Math.min(1, Math.max(0, (globalTime - 2.5) / 2.5));
      const slideIn = FrameAnimationEngine.easeOutQuad(FrameAnimationEngine.clamp(sceneProgress / 0.5, 0, 1));
      const artifactX = 350 + (1 - slideIn) * 120;
      const isPreviewActive = sceneProgress > 0.65;
      const tabScale = (sceneProgress > 0.60 && sceneProgress < 0.75) ? 0.92 : 1.0;

      // Real changing/streaming code lines in 22px Consolas monospace font
      const codeLines = [
        '<text x="0" y="0" font-size="18" font-family="Consolas, monospace" fill="#6E7681">01</text><text x="45" y="0" font-size="22" font-family="Consolas, monospace" fill="#FF7B72">import <tspan fill="#FFFFFF">React, { useState } from </tspan><tspan fill="#7EE787">\'react\'</tspan>;</text>',
        '<text x="0" y="38" font-size="18" font-family="Consolas, monospace" fill="#6E7681">02</text><text x="45" y="38" font-size="22" font-family="Consolas, monospace" fill="#FF7B72">export function <tspan fill="#79C0FF">TaskFlowStudio</tspan>() {</text>',
        '<text x="0" y="76" font-size="18" font-family="Consolas, monospace" fill="#6E7681">03</text><text x="75" y="76" font-size="22" font-family="Consolas, monospace" fill="#FFA657">const <tspan fill="#FFFFFF">[filter, setFilter] = </tspan><tspan fill="#79C0FF">useState</tspan><tspan fill="#7EE787">(\'ALL\')</tspan>;</text>',
        '<text x="0" y="114" font-size="18" font-family="Consolas, monospace" fill="#6E7681">04</text><text x="75" y="114" font-size="22" font-family="Consolas, monospace" fill="#FFA657">const <tspan fill="#FFFFFF">[tasks, setTasks] = </tspan><tspan fill="#79C0FF">useState</tspan>([</text>',
        '<text x="0" y="152" font-size="18" font-family="Consolas, monospace" fill="#6E7681">05</text><text x="100" y="152" font-size="22" font-family="Consolas, monospace" fill="#7EE787">{ id: 1, title: \'Deploy AI Pipeline\', prio: \'URGENT\' },</text>',
        '<text x="0" y="190" font-size="18" font-family="Consolas, monospace" fill="#6E7681">06</text><text x="100" y="190" font-size="22" font-family="Consolas, monospace" fill="#7EE787">{ id: 2, title: \'Build Analytics UI\', prio: \'HIGH\' },</text>',
        '<text x="0" y="228" font-size="18" font-family="Consolas, monospace" fill="#6E7681">07</text><text x="100" y="228" font-size="22" font-family="Consolas, monospace" fill="#7EE787">{ id: 3, title: \'Auth &amp; OAuth Tokens\', prio: \'MED\' }</text>',
        '<text x="0" y="266" font-size="18" font-family="Consolas, monospace" fill="#6E7681">08</text><text x="75" y="266" font-size="22" font-family="Consolas, monospace" fill="#FFA657">]);</text>',
        '<text x="0" y="304" font-size="18" font-family="Consolas, monospace" fill="#6E7681">09</text><text x="75" y="304" font-size="22" font-family="Consolas, monospace" fill="#FF7B72">return (</text>',
        '<text x="0" y="342" font-size="18" font-family="Consolas, monospace" fill="#6E7681">10</text><text x="100" y="342" font-size="22" font-family="Consolas, monospace" fill="#79C0FF">&lt;div <tspan fill="#FFA657">className</tspan>=<tspan fill="#7EE787">"taskflow-app"</tspan>&gt;</text>',
        '<text x="0" y="380" font-size="18" font-family="Consolas, monospace" fill="#6E7681">11</text><text x="125" y="380" font-size="22" font-family="Consolas, monospace" fill="#56D364">&lt;FilterTabs <tspan fill="#FFA657">active</tspan>={filter} <tspan fill="#FFA657">onChange</tspan>={setFilter} /&gt;</text>',
        '<text x="0" y="418" font-size="18" font-family="Consolas, monospace" fill="#6E7681">12</text><text x="125" y="418" font-size="22" font-family="Consolas, monospace" fill="#56D364">&lt;TaskMetrics <tspan fill="#FFA657">completed</tspan>={3} <tspan fill="#FFA657">total</tspan>={4} /&gt;</text>',
        '<text x="0" y="456" font-size="18" font-family="Consolas, monospace" fill="#6E7681">13</text><text x="125" y="456" font-size="22" font-family="Consolas, monospace" fill="#56D364">&lt;TaskList <tspan fill="#FFA657">items</tspan>={tasks} <tspan fill="#FFA657">filter</tspan>={filter} /&gt;</text>',
        '<text x="0" y="494" font-size="18" font-family="Consolas, monospace" fill="#6E7681">14</text><text x="100" y="494" font-size="22" font-family="Consolas, monospace" fill="#79C0FF">&lt;/div&gt;</text>',
        '<text x="0" y="532" font-size="18" font-family="Consolas, monospace" fill="#6E7681">15</text><text x="75" y="532" font-size="22" font-family="Consolas, monospace" fill="#FF7B72">);</text>',
        '<text x="0" y="570" font-size="18" font-family="Consolas, monospace" fill="#6E7681">16</text><text x="45" y="570" font-size="22" font-family="Consolas, monospace" fill="#FF7B72">}</text>'
      ];
      const visibleCount = Math.max(6, Math.min(codeLines.length, Math.floor(sceneProgress * 22)));
      const renderedCode = codeLines.slice(0, visibleCount).join('\n                ');

      // Cursor moves from code editor up to [Preview] tab and clicks
      let cursorX = 520;
      let cursorY = 720;
      if (sceneProgress < 0.65) {
        const p = sceneProgress / 0.65;
        cursorX = 520 + 330 * FrameAnimationEngine.easeInOutCubic(p);
        cursorY = 720 - 290 * FrameAnimationEngine.easeInOutCubic(p);
      } else {
        const p = Math.min(1, (sceneProgress - 0.65) / 0.35);
        cursorX = 850 + 15 * Math.sin(p * Math.PI);
        cursorY = 430 + 8 * Math.cos(p * Math.PI);
      }

      // Continuous camera zoom
      const camPush = 1.01 + 0.02 * FrameAnimationEngine.easeOutQuad(sceneProgress);

      return `
        <!-- Title & Subtitle Header -->
        <g transform="translate(60, 200)">
          <text x="0" y="0" font-size="48" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(headline || 'PROMPT → ARTIFACT')}</text>
          <text x="0" y="46" font-size="24" font-weight="700" fill="#38BDF8">${escapeXml(subtitle || 'Real-Time Code Generation & Hot Reload Workspace')}</text>
        </g>

        <!-- Main Split Screen Workspace Window -->
        <g transform="scale(${camPush.toFixed(4)})" transform-origin="540 850">
          <g transform="translate(60, 275)">
            <rect width="960" height="1140" rx="24" fill="#11141E" stroke="#252E40" stroke-width="2"/>
            
            <!-- Window Titlebar -->
            <g transform="translate(32, 28)">
              <circle cx="0" cy="0" r="7" fill="#EF4444"/>
              <circle cx="22" cy="0" r="7" fill="#F59E0B"/>
              <circle cx="44" cy="0" r="7" fill="#10B981"/>
              
              <!-- URL / Status Pill -->
              <rect x="180" y="-16" width="460" height="34" rx="17" fill="#1B2130" stroke="#334155" stroke-width="1"/>
              <text x="210" y="7" font-size="14" font-family="Consolas, monospace" fill="#94A3B8">https://claude.ai/chat/artifacts-live</text>
              
              <!-- Model Badge with Vector Star -->
              <rect x="670" y="-18" width="225" height="36" rx="18" fill="#2E1C0C" stroke="#D97706" stroke-width="2"/>
              <polygon points="692,-4 695,1 700,3 695,5 692,10 689,5 684,3 689,1" fill="#F59E0B"/>
              <text x="715" y="7" font-size="15" font-weight="800" fill="#FBBF24">Claude 3.5 Sonnet</text>
            </g>

            <!-- Left Column: Chat Context (310px wide) -->
            <g transform="translate(24, 60)">
              <rect width="310" height="1050" rx="18" fill="#161B28" stroke="#262F42" stroke-width="1.5"/>
              
              <text x="20" y="38" font-size="16" font-weight="900" fill="#94A3B8" letter-spacing="1">CONVERSATION CONTEXT</text>
              
              <!-- User Prompt Card -->
              <g transform="translate(16, 55)">
                <rect width="278" height="125" rx="14" fill="#1E2A40" stroke="#2563EB" stroke-width="2"/>
                <text x="16" y="28" font-size="13" font-weight="900" fill="#93C5FD">PROMPT INPUT:</text>
                <text x="16" y="55" font-size="16" font-weight="800" fill="#FFFFFF">Build interactive task tracker</text>
                <text x="16" y="80" font-size="15" fill="#E2E8F0">with priority filters &amp; status</text>
                <text x="16" y="106" font-size="13" font-weight="700" fill="#38BDF8">React Component • Tailwind CSS</text>
              </g>

              <!-- Claude Streaming Response -->
              <g transform="translate(16, 195)">
                <rect width="278" height="170" rx="14" fill="#1F2432" stroke="#D97706" stroke-width="1.5"/>
                <polygon points="26,20 28,25 33,27 28,29 26,34 24,29 19,27 24,25" fill="#FBBF24"/>
                <text x="40" y="30" font-size="15" font-weight="900" fill="#FBBF24">Claude 3.5 Sonnet</text>
                <text x="16" y="60" font-size="14" fill="#FFFFFF">Generated TaskFlow component.</text>
                <text x="16" y="85" font-size="14" fill="#FFFFFF">Click Preview tab to test the</text>
                <text x="16" y="110" font-size="14" fill="#FFFFFF">live interactive component</text>
                <text x="16" y="135" font-size="14" fill="#FFFFFF">with state management.</text>
                <rect x="16" y="148" width="130" height="10" rx="5" fill="#06B6D4"/>
              </g>

              <!-- Live Generation Metrics -->
              <g transform="translate(16, 380)">
                <rect width="278" height="260" rx="14" fill="#0A0E17" stroke="#262F42" stroke-width="1.5"/>
                <text x="16" y="32" font-size="15" font-weight="900" fill="#38BDF8">GENERATION STATS</text>
                
                <text x="16" y="68" font-size="14" font-weight="600" fill="#E2E8F0">Model: Claude 3.5 Sonnet</text>
                <text x="16" y="98" font-size="14" font-weight="600" fill="#E2E8F0">Speed: 1,840 tokens/sec</text>
                <text x="16" y="128" font-size="14" font-weight="600" fill="#E2E8F0">Language: TypeScript / TSX</text>
                <text x="16" y="158" font-size="14" font-weight="600" fill="#E2E8F0">Latency: 38ms TTFT</text>
                <text x="16" y="188" font-size="14" font-weight="800" fill="#34D399">Status: Hot Reload Synced</text>
                
                <rect x="16" y="208" width="246" height="34" rx="8" fill="#064E3B" stroke="#059669" stroke-width="1.5"/>
                <path d="M40 225 L45 230 L55 218" fill="none" stroke="#34D399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <text x="145" y="230" font-size="13" font-weight="900" fill="#34D399" text-anchor="middle">ZERO CONTEXT LOSS</text>
              </g>

              <!-- Key Benefits List -->
              <g transform="translate(16, 655)">
                <rect width="278" height="375" rx="14" fill="#141824" stroke="#262F42" stroke-width="1.5"/>
                <text x="20" y="38" font-size="16" font-weight="900" fill="#FFFFFF">WHY ARTIFACTS?</text>
                <text x="20" y="78" font-size="15" font-weight="700" fill="#38BDF8">• Real-time side panel</text>
                <text x="20" y="118" font-size="15" font-weight="700" fill="#38BDF8">• Instant live preview</text>
                <text x="20" y="158" font-size="15" font-weight="700" fill="#38BDF8">• Zero environment setup</text>
                <text x="20" y="198" font-size="15" font-weight="700" fill="#38BDF8">• Direct code export</text>
                <text x="20" y="238" font-size="15" font-weight="700" fill="#38BDF8">• Multi-tab navigation</text>
                <text x="20" y="278" font-size="15" font-weight="700" fill="#34D399">• Instant state hot reload</text>
                <text x="20" y="318" font-size="15" font-weight="700" fill="#34D399">• Production React TSX</text>
              </g>
            </g>

            <!-- Right Column: Dedicated Sliding Artifact Window (586px wide) -->
            <g transform="translate(${artifactX.toFixed(1)}, 60)">
              <rect width="586" height="1050" rx="18" fill="#0D1117" stroke="#06B6D4" stroke-width="2.5"/>
              
              <!-- Artifact Window Header & Tab Switcher -->
              <g transform="translate(24, 20)">
                <rect width="538" height="64" rx="14" fill="#161B22" stroke="#30363D" stroke-width="1.5"/>
                <circle cx="28" cy="32" r="10" fill="#06B6D4"/>
                <text x="48" y="38" font-size="18" font-weight="900" fill="#FFFFFF">TaskFlowStudio.tsx</text>
                <text x="245" y="38" font-size="14" font-weight="700" fill="#34D399">React 18</text>
                
                <!-- Tabs: [Code] and [Preview] -->
                <rect x="330" y="12" width="90" height="40" rx="10" fill="${isPreviewActive ? '#21262D' : '#06B6D4'}"/>
                <text x="375" y="37" font-size="16" font-weight="900" fill="${isPreviewActive ? '#94A3B8' : '#000'}" text-anchor="middle">Code</text>
                
                <g transform="scale(${tabScale})" transform-origin="480 32">
                  <rect x="430" y="12" width="100" height="40" rx="10" fill="${isPreviewActive ? '#06B6D4' : '#21262D'}"/>
                  <text x="480" y="37" font-size="16" font-weight="900" fill="${isPreviewActive ? '#000' : '#94A3B8'}" text-anchor="middle">Preview &gt;</text>
                </g>
              </g>

              <!-- Live Code View with Syntax Highlighting (Large 22px Consolas) -->
              <g transform="translate(24, 95)">
                <rect width="538" height="710" rx="14" fill="#06090E" stroke="#30363D" stroke-width="1.5"/>
                
                <!-- Code Lines with Line Numbers -->
                <g transform="translate(20, 36)">
                  ${renderedCode}
                </g>
              </g>

              <!-- Live Compilation Notification Bar -->
              <g transform="translate(24, 820)">
                <rect width="538" height="76" rx="14" fill="#0E2E1B" stroke="#238636" stroke-width="2"/>
                <circle cx="32" cy="38" r="14" fill="#238636"/>
                <path d="M25 38 L30 43 L39 33" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <text x="56" y="35" font-size="16" font-weight="900" fill="#3FB950">React Component Compiled Successfully</text>
                <text x="56" y="58" font-size="14" font-weight="600" fill="#A7F3D0">Zero compilation errors • Hot Module Replacement Active</text>
              </g>

              <!-- Live Preview Transition Box (Visible when Preview tab active) -->
              <g transform="translate(24, 910)" opacity="${isPreviewActive ? '1' : '0.15'}">
                <rect width="538" height="120" rx="14" fill="#082A3A" stroke="#06B6D4" stroke-width="2"/>
                <text x="269" y="38" font-size="18" font-weight="900" fill="#FFFFFF" text-anchor="middle">Launching Live Interactive Preview...</text>
                <text x="269" y="64" font-size="14" font-weight="600" fill="#94A3B8" text-anchor="middle">Rendering stateful task dashboard with full event listeners</text>
                <rect x="160" y="76" width="218" height="34" rx="10" fill="#06B6D4"/>
                <text x="269" y="98" font-size="14" font-weight="900" fill="#000" text-anchor="middle">Interactive View Active</text>
              </g>
            </g>
          </g>

          <!-- Cursor Moving across into Preview tab -->
          <g transform="translate(${cursorX.toFixed(1)}, ${cursorY.toFixed(1)})">
            <circle cx="0" cy="0" r="18" fill="rgba(6,182,212,0.3)"/>
            <path d="M0,0 L0,26 L6,20 L14,35 L20,32 L12,17 L21,17 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="2.5"/>
          </g>
        </g>
      `;
    }

    // SCENE 3 (5.0–8.0s): Full Interactive Mini-Application (TaskFlow Studio with Live Clicks & State Changes)
    if (globalTime < 8.0) {
      const sceneProgress = Math.min(1, Math.max(0, (globalTime - 5.0) / 3.0));

      // Step 1: Filter click at sceneProgress >= 0.30
      const isFilterClicked = sceneProgress >= 0.30;
      const activeTab = isFilterClicked ? 'HIGH' : 'ALL';
      
      // Step 2: Checkbox click at sceneProgress >= 0.60
      const isCardChecked = sceneProgress >= 0.60;

      // Step 3: Progress bar dynamic calculation (75% -> 100%)
      const progressPct = isCardChecked 
        ? Math.min(100, Math.round(75 + 25 * FrameAnimationEngine.easeOutQuad(Math.min(1, (sceneProgress - 0.60) / 0.25))))
        : 75;
      const progressBarWidth = (progressPct / 100) * 888;

      // Realistic Cursor motion path
      let cursorX = 220;
      let cursorY = 715;

      if (sceneProgress < 0.30) {
        const p = sceneProgress / 0.30;
        cursorX = 220 + 95 * FrameAnimationEngine.easeInOutCubic(p);
        cursorY = 715 - 165 * FrameAnimationEngine.easeInOutCubic(p);
      } else if (sceneProgress < 0.60) {
        const p = (sceneProgress - 0.30) / 0.30;
        cursorX = 315 - 235 * FrameAnimationEngine.easeInOutCubic(p);
        cursorY = 550 + 175 * FrameAnimationEngine.easeInOutCubic(p);
      } else {
        const p = Math.min(1, (sceneProgress - 0.60) / 0.40);
        cursorX = 80 + 50 * Math.sin(p * Math.PI);
        cursorY = 725 + 15 * Math.cos(p * Math.PI);
      }

      // Continuous subtle camera push-in
      const camPush = 1.00 + 0.03 * FrameAnimationEngine.easeOutQuad(sceneProgress);

      return `
        <!-- Top Prompt Context Reference Bar (Safe Y: 155) -->
        <g transform="translate(60, 155)">
          <rect width="960" height="38" rx="10" fill="#1E2A40" stroke="#2563EB" stroke-width="1.5"/>
          <text x="24" y="24" font-size="14" font-weight="800" fill="#93C5FD">PROMPT: <tspan fill="#FFFFFF">"Build me a task management app with filters, progress tracking and a clean dashboard."</tspan> • <tspan fill="#38BDF8" font-weight="900">React 18 + TS</tspan></text>
        </g>

        <!-- Title & Subtitle Header (Y: 205) -->
        <g transform="translate(60, 205)">
          <text x="0" y="38" font-size="44" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(headline || 'TASKFLOW APPLICATION')}</text>
          <text x="0" y="74" font-size="22" font-weight="700" fill="#38BDF8">${escapeXml(subtitle || 'Real React Component • State Management & Live Clicks')}</text>
        </g>

        <!-- Main Interactive Application Window -->
        <g transform="scale(${camPush.toFixed(4)})" transform-origin="540 850">
          <g transform="translate(60, 300)">
            <rect width="960" height="1125" rx="24" fill="#11141E" stroke="#252E40" stroke-width="2"/>
            
            <!-- App Header -->
            <g transform="translate(36, 24)">
              <circle cx="20" cy="20" r="18" fill="url(#cyanGrad)"/>
              <polygon points="20,10 14,20 19,20 17,30 26,18 21,18" fill="#000000"/>
              <text x="50" y="28" font-size="34" font-weight="900" fill="#FFFFFF">TaskFlow Studio</text>
              <rect x="330" y="4" width="140" height="34" rx="17" fill="#064E3B" stroke="#10B981" stroke-width="1.5"/>
              <circle cx="346" cy="21" r="4" fill="#34D399"/>
              <text x="408" y="26" font-size="15" font-weight="800" fill="#34D399" text-anchor="middle">React 18 Live</text>
              
              <!-- Add Task Button -->
              <rect x="730" y="0" width="158" height="44" rx="14" fill="#06B6D4"/>
              <text x="809" y="28" font-size="16" font-weight="900" fill="#000" text-anchor="middle">+ New Task</text>
            </g>

            <!-- Dashboard Statistics Row (Large 38px numbers) -->
            <g transform="translate(36, 80)">
              <rect width="888" height="115" rx="16" fill="#171B26" stroke="#293245" stroke-width="1.5"/>
              
              <!-- Stat 1: Total Tasks -->
              <g transform="translate(24, 20)">
                <text x="0" y="18" font-size="14" font-weight="800" fill="#94A3B8">TOTAL TASKS</text>
                <text x="0" y="56" font-size="38" font-weight="900" fill="#FFFFFF">12</text>
                <text x="0" y="82" font-size="13" font-weight="600" fill="#CBD5E1">3 Sprints Tracked</text>
              </g>

              <!-- Divider -->
              <line x1="200" y1="20" x2="200" y2="95" stroke="#334155" stroke-width="1.5"/>

              <!-- Stat 2: High Priority -->
              <g transform="translate(224, 20)">
                <text x="0" y="18" font-size="14" font-weight="800" fill="#FCA5A5">HIGH PRIORITY</text>
                <text x="0" y="56" font-size="38" font-weight="900" fill="#EF4444">4</text>
                <text x="0" y="82" font-size="13" font-weight="600" fill="#FCA5A5">Urgent SLA</text>
              </g>

              <!-- Divider -->
              <line x1="420" y1="20" x2="420" y2="95" stroke="#334155" stroke-width="1.5"/>

              <!-- Stat 3: Sprint Progress -->
              <g transform="translate(444, 20)">
                <text x="0" y="18" font-size="14" font-weight="800" fill="#38BDF8">SPRINT PROGRESS</text>
                <text x="0" y="56" font-size="38" font-weight="900" fill="${isCardChecked ? '#34D399' : '#38BDF8'}">${progressPct}%</text>
                <text x="0" y="82" font-size="13" font-weight="700" fill="${isCardChecked ? '#34D399' : '#94A3B8'}">${isCardChecked ? '4 of 4 Done' : '3 of 4 Done'}</text>
              </g>

              <!-- Divider -->
              <line x1="640" y1="20" x2="640" y2="95" stroke="#334155" stroke-width="1.5"/>

              <!-- Stat 4: Sync Status -->
              <g transform="translate(664, 20)">
                <text x="0" y="18" font-size="14" font-weight="800" fill="#C084FC">REACT STATE</text>
                <text x="0" y="56" font-size="32" font-weight="900" fill="#34D399">ACTIVE</text>
                <text x="0" y="82" font-size="13" font-weight="700" fill="#6EE7B7">&lt;16ms Latency</text>
              </g>
            </g>

            <!-- Metrics & Progress Overview Bar -->
            <g transform="translate(36, 210)">
              <rect width="888" height="54" rx="14" fill="#161B26" stroke="#293245" stroke-width="1.5"/>
              <text x="24" y="24" font-size="18" font-weight="800" fill="#FFFFFF">
                Sprint Task Completion: <tspan fill="#34D399">${isCardChecked ? '4 / 4 (100%)' : '3 / 4 (75%)'}</tspan>
              </text>
              <text x="864" y="24" font-size="15" font-weight="800" fill="#38BDF8" text-anchor="end">${isCardChecked ? 'All Sprint Goals Met' : '1 Task Pending'}</text>
              <rect x="24" y="32" width="840" height="14" rx="7" fill="#1E293B"/>
              <rect x="24" y="32" width="${(progressBarWidth * 0.94).toFixed(1)}" height="14" rx="7" fill="url(#emeraldGrad)"/>
            </g>

            <!-- Priority Filter Tabs (Large 16px Bold) -->
            <g transform="translate(36, 278)">
              <rect width="888" height="54" rx="14" fill="#1B2130" stroke="#2E3A52" stroke-width="1.5"/>
              
              <!-- Tab ALL -->
              <rect x="6" y="6" width="190" height="42" rx="10" fill="${activeTab === 'ALL' ? '#06B6D4' : 'transparent'}"/>
              <text x="101" y="33" font-size="16" font-weight="900" fill="${activeTab === 'ALL' ? '#000' : '#E2E8F0'}" text-anchor="middle">ALL (12)</text>
              
              <!-- Tab HIGH -->
              <rect x="206" y="6" width="210" height="42" rx="10" fill="${activeTab === 'HIGH' ? '#06B6D4' : 'transparent'}"/>
              <text x="311" y="33" font-size="16" font-weight="900" fill="${activeTab === 'HIGH' ? '#000' : '#E2E8F0'}" text-anchor="middle">HIGH (4)</text>

              <!-- Tab MEDIUM -->
              <rect x="426" y="6" width="220" height="42" rx="10" fill="transparent"/>
              <text x="536" y="33" font-size="16" font-weight="800" fill="#94A3B8" text-anchor="middle">IN PROGRESS (5)</text>

              <!-- Tab LOW -->
              <rect x="656" y="6" width="220" height="42" rx="10" fill="transparent"/>
              <text x="766" y="33" font-size="16" font-weight="800" fill="#94A3B8" text-anchor="middle">DONE (3)</text>
            </g>

            <!-- 4 Real Task Rows (24px Bold Titles, 15px Metadata) -->
            <g transform="translate(36, 345)">
              <!-- Task 1: Deploy AI Pipeline -->
              <g transform="translate(0, 0)">
                <rect width="888" height="116" rx="16" fill="#161B28" stroke="${isCardChecked ? '#10B981' : '#EF4444'}" stroke-width="${isCardChecked ? 2.5 : 1.5}"/>
                <rect x="20" y="24" width="36" height="36" rx="10" fill="${isCardChecked ? '#10B981' : '#2D1B1B'}" stroke="${isCardChecked ? '#10B981' : '#EF4444'}" stroke-width="2"/>
                <path d="M26 42 L32 48 L44 36" fill="none" stroke="${isCardChecked ? '#FFFFFF' : 'transparent'}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <text x="72" y="49" font-size="24" font-weight="900" fill="#FFFFFF" text-decoration="${isCardChecked ? 'line-through' : 'none'}">Deploy AI Pipeline to Production</text>
                <rect x="690" y="22" width="175" height="36" rx="10" fill="${isCardChecked ? '#10B981' : '#EF4444'}"/>
                <text x="777" y="46" font-size="14" font-weight="900" fill="#FFF" text-anchor="middle">${isCardChecked ? 'COMPLETED' : 'HIGH PRIORITY'}</text>
                <text x="72" y="86" font-size="15" font-weight="600" fill="#CBD5E1">Due: Today • Assignee: Core AI Engine Team • Latency SLA &lt;50ms</text>
              </g>

              <!-- Task 2: Build Analytics Dashboard -->
              <g transform="translate(0, 128)">
                <rect width="888" height="116" rx="16" fill="#161B28" stroke="#0284C7" stroke-width="1.5"/>
                <rect x="20" y="24" width="36" height="36" rx="10" fill="#0C2538" stroke="#38BDF8" stroke-width="2"/>
                <text x="72" y="49" font-size="24" font-weight="900" fill="#FFFFFF">Build Analytics Dashboard UI</text>
                <rect x="690" y="22" width="175" height="36" rx="10" fill="#0284C7"/>
                <text x="777" y="46" font-size="14" font-weight="900" fill="#FFF" text-anchor="middle">ACTIVE</text>
                <text x="72" y="86" font-size="15" font-weight="600" fill="#CBD5E1">Real-time metrics charts • Responsive layout • Live filtering</text>
              </g>

              <!-- Task 3: Fix Authentication -->
              <g transform="translate(0, 256)" opacity="${isFilterClicked ? '0.35' : '1.0'}">
                <rect width="888" height="116" rx="16" fill="#161B28" stroke="#7C3AED" stroke-width="1.5"/>
                <rect x="20" y="24" width="36" height="36" rx="10" fill="#221338" stroke="#A855F7" stroke-width="2"/>
                <text x="72" y="49" font-size="24" font-weight="900" fill="#FFFFFF">Fix Authentication &amp; OAuth</text>
                <rect x="690" y="22" width="175" height="36" rx="10" fill="#7C3AED"/>
                <text x="777" y="46" font-size="14" font-weight="900" fill="#FFF" text-anchor="middle">SECURITY</text>
                <text x="72" y="86" font-size="15" font-weight="600" fill="#CBD5E1">Session cookie rotation • OAuth2 token verification</text>
              </g>

              <!-- Task 4: Prepare Release -->
              <g transform="translate(0, 384)" opacity="${isFilterClicked ? '0.35' : '1.0'}">
                <rect width="888" height="116" rx="16" fill="#161B28" stroke="#D97706" stroke-width="1.5"/>
                <rect x="20" y="24" width="36" height="36" rx="10" fill="#2E1C0C" stroke="#F59E0B" stroke-width="2"/>
                <text x="72" y="49" font-size="24" font-weight="900" fill="#FFFFFF">Prepare Production Release</text>
                <rect x="690" y="22" width="175" height="36" rx="10" fill="#D97706"/>
                <text x="777" y="46" font-size="14" font-weight="900" fill="#FFF" text-anchor="middle">RELEASE</text>
                <text x="72" y="86" font-size="15" font-weight="600" fill="#CBD5E1">Production build bundle verification • Zero compiler warnings</text>
              </g>
            </g>

            <!-- Interactive Action Bar at Bottom of App -->
            <g transform="translate(36, 855)">
              <rect width="888" height="165" rx="18" fill="#132030" stroke="#06B6D4" stroke-width="2"/>
              <text x="36" y="38" font-size="19" font-weight="900" fill="#38BDF8">REAL-TIME APPLICATION CAPABILITIES:</text>
              <text x="36" y="72" font-size="16" font-weight="600" fill="#FFFFFF">• Full React state management and instant DOM reactivity</text>
              <text x="36" y="104" font-size="16" font-weight="600" fill="#FFFFFF">• Zero external dependencies or build pipeline needed</text>
              <text x="36" y="136" font-size="16" font-weight="600" fill="#34D399">• Instant code iteration directly through natural language</text>
            </g>
          </g>

          <!-- Cursor Moving & Clicking Real Elements -->
          <g transform="translate(${cursorX.toFixed(1)}, ${cursorY.toFixed(1)})">
            <circle cx="0" cy="0" r="18" fill="rgba(6,182,212,0.3)"/>
            <path d="M0,0 L0,26 L6,20 L14,35 L20,32 L12,17 L21,17 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="2.5"/>
          </g>
        </g>
      `;
    }

    // SCENE 4 (8.0–10.0s): Transformation Flow (Conversation -> Generated Code -> Working App)
    if (globalTime < 10.0) {
      const sceneProgress = Math.min(1, Math.max(0, (globalTime - 8.0) / 2.0));
      const camY = -sceneProgress * 40;
      const camScale = 1.0 + 0.03 * Math.sin(sceneProgress * Math.PI);
      const dashOffset = (-globalTime * 60).toFixed(1);
      const activeStage = sceneProgress < 0.35 ? 1 : (sceneProgress < 0.70 ? 2 : 3);

      return `
        <!-- Title & Subtitle Header -->
        <g transform="translate(60, 200)">
          <text x="0" y="0" font-size="48" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(headline || 'SEAMLESS TRANSFORMATION')}</text>
          <text x="0" y="46" font-size="22" font-weight="800" fill="#38BDF8">CONVERSATION → GENERATED CODE → WORKING APP</text>
        </g>

        <!-- Dynamic Flow Container with Camera Zoom/Pan -->
        <g transform="translate(0, ${camY.toFixed(1)}) scale(${camScale.toFixed(3)})" transform-origin="540 850">
          
          <!-- NODE 1: NATURAL LANGUAGE CONVERSATION (Y: 295) -->
          <g transform="translate(60, 295)">
            <rect width="960" height="240" rx="20" fill="#161B28" stroke="${activeStage === 1 ? '#38BDF8' : '#2D3548'}" stroke-width="${activeStage === 1 ? 3 : 1.5}"/>
            <rect x="24" y="20" width="190" height="34" rx="10" fill="#0C4A6E"/>
            <text x="119" y="43" font-size="15" font-weight="900" fill="#38BDF8" text-anchor="middle">1. CONVERSATION</text>
            <text x="235" y="43" font-size="15" font-weight="700" fill="#94A3B8">Natural Language Prompt Input</text>

            <rect x="24" y="68" width="912" height="145" rx="14" fill="#0A0E17" stroke="#252E40" stroke-width="1.5"/>
            <text x="50" y="112" font-size="24" font-weight="700" fill="#FFFFFF">"Build me a task management app with filters,</text>
            <text x="50" y="146" font-size="24" font-weight="700" fill="#FFFFFF">progress tracking and a clean dashboard."</text>
            <text x="50" y="186" font-size="15" font-weight="700" fill="#34D399">Interpreted by Claude 3.5 Sonnet • Synthesizing State &amp; UI Components</text>
          </g>

          <!-- DYNAMIC CONNECTOR 1: Flow Beam with moving energy pulse -->
          <g transform="translate(540, 485)">
            <line x1="0" y1="0" x2="0" y2="70" stroke="${activeStage >= 2 ? '#38BDF8' : '#475569'}" stroke-width="4" stroke-dasharray="8 6" stroke-dashoffset="${dashOffset}"/>
            <polygon points="-8,60 8,60 0,72" fill="${activeStage >= 2 ? '#38BDF8' : '#475569'}"/>
            <circle cx="0" cy="${(sceneProgress * 70).toFixed(1)}" r="7" fill="#38BDF8"/>
            <rect x="20" y="18" width="230" height="32" rx="10" fill="#161B28" stroke="#38BDF8" stroke-width="1.5"/>
            <text x="135" y="40" font-size="14" font-weight="900" fill="#38BDF8" text-anchor="middle">REACT AST CODEGEN</text>
          </g>

          <!-- NODE 2: REAL GENERATED CODE (Y: 555) -->
          <g transform="translate(60, 555)">
            <rect width="960" height="320" rx="20" fill="#161B28" stroke="${activeStage === 2 ? '#A855F7' : '#2D3548'}" stroke-width="${activeStage === 2 ? 3 : 1.5}"/>
            <rect x="24" y="20" width="200" height="34" rx="10" fill="#3B0764"/>
            <text x="124" y="43" font-size="15" font-weight="900" fill="#C084FC" text-anchor="middle">2. GENERATED CODE</text>
            <text x="245" y="43" font-size="15" font-family="Consolas, monospace" font-weight="700" fill="#94A3B8">TaskFlowStudio.tsx (Clean TSX)</text>

            <rect x="24" y="68" width="912" height="230" rx="14" fill="#0A0E17" stroke="#252E40" stroke-width="1.5"/>
            <g transform="translate(48, 110)">
              <text x="0" y="0" font-size="20" font-family="Consolas, monospace" fill="#FF7B72">export function <tspan fill="#38BDF8">TaskFlowApp</tspan>() {</text>
              <text x="30" y="35" font-size="20" font-family="Consolas, monospace" fill="#CBD5E1">const [tasks, setTasks] = useState(DEFAULT_TASKS);</text>
              <text x="30" y="70" font-size="20" font-family="Consolas, monospace" fill="#CBD5E1">const [filter, setFilter] = useState('HIGH');</text>
              <text x="30" y="105" font-size="20" font-family="Consolas, monospace" fill="#FF7B72">return &lt;<tspan fill="#FFA657">TaskDashboard</tspan> tasks={tasks} filter={filter} /&gt;;</text>
              <text x="0" y="140" font-size="20" font-family="Consolas, monospace" fill="#FF7B72">}</text>
              <text x="0" y="175" font-size="15" font-family="Consolas, monospace" font-weight="700" fill="#34D399">// Hot-reloaded into interactive sandbox without page refresh</text>
            </g>
          </g>

          <!-- DYNAMIC CONNECTOR 2: Flow Beam to Live App -->
          <g transform="translate(540, 875)">
            <line x1="0" y1="0" x2="0" y2="70" stroke="${activeStage === 3 ? '#10B981' : '#475569'}" stroke-width="4" stroke-dasharray="8 6" stroke-dashoffset="${dashOffset}"/>
            <polygon points="-8,60 8,60 0,72" fill="${activeStage >= 3 ? '#10B981' : '#475569'}"/>
            <circle cx="0" cy="${(sceneProgress * 70).toFixed(1)}" r="7" fill="#10B981"/>
            <rect x="20" y="18" width="240" height="32" rx="10" fill="#161B28" stroke="#10B981" stroke-width="1.5"/>
            <text x="140" y="40" font-size="14" font-weight="900" fill="#34D399" text-anchor="middle">INSTANT COMPILATION</text>
          </g>

          <!-- NODE 3: WORKING INTERACTIVE APPLICATION (Y: 945) -->
          <g transform="translate(60, 945)">
            <rect width="960" height="420" rx="20" fill="#161B28" stroke="${activeStage === 3 ? '#10B981' : '#2D3548'}" stroke-width="${activeStage === 3 ? 3 : 1.5}"/>
            <rect x="24" y="20" width="180" height="34" rx="10" fill="#064E3B"/>
            <text x="114" y="43" font-size="15" font-weight="900" fill="#34D399" text-anchor="middle">3. WORKING APP</text>
            <text x="230" y="43" font-size="15" font-weight="700" fill="#34D399">Live Stateful Artifact Sandbox</text>

            <!-- App Mini-View Inside Node 3 -->
            <g transform="translate(24, 68)">
              <rect width="912" height="325" rx="14" fill="#0A0E17" stroke="#252E40" stroke-width="1.5"/>
              
              <!-- Metrics Header -->
              <g transform="translate(24, 25)">
                <text x="0" y="24" font-size="22" font-weight="900" fill="#FFFFFF">TaskFlow Studio Pro • Sprint Completion: <tspan fill="#34D399">100% (4/4)</tspan></text>
                <rect x="0" y="38" width="864" height="16" rx="8" fill="#1E293B"/>
                <rect x="0" y="38" width="864" height="16" rx="8" fill="url(#emeraldGrad)"/>
              </g>

              <!-- Completed Task Rows -->
              <g transform="translate(24, 95)">
                <!-- Row 1 -->
                <rect width="864" height="75" rx="12" fill="#161B28" stroke="#10B981" stroke-width="2"/>
                <circle cx="36" cy="37" r="16" fill="#10B981"/>
                <path d="M29 37 L34 42 L43 32" fill="none" stroke="#000000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <text x="68" y="44" font-size="20" font-weight="900" fill="#FFF" text-decoration="line-through">Deploy AI Pipeline to Production</text>
                <rect x="730" y="20" width="115" height="34" rx="8" fill="#10B981"/>
                <text x="787" y="43" font-size="14" font-weight="900" fill="#000" text-anchor="middle">DONE</text>

                <!-- Row 2 -->
                <g transform="translate(0, 90)">
                  <rect width="864" height="75" rx="12" fill="#161B28" stroke="#0284C7" stroke-width="1.5"/>
                  <circle cx="36" cy="37" r="16" fill="#0C2538" stroke="#38BDF8" stroke-width="2"/>
                  <text x="68" y="44" font-size="20" font-weight="900" fill="#FFF">Build Analytics Dashboard UI</text>
                  <rect x="730" y="20" width="115" height="34" rx="8" fill="#0284C7"/>
                  <text x="787" y="43" font-size="14" font-weight="900" fill="#FFF" text-anchor="middle">ACTIVE</text>
                </g>
              </g>
            </g>
          </g>
        </g>
      `;
    }

    // SCENE 5 (10.0–12.1s): Final Working Application Full-Screen Payoff with Camera Push-In
    const sceneProgress = Math.min(1, Math.max(0, (globalTime - 10.0) / 2.1));
    const pushIn = 1.0 + 0.045 * FrameAnimationEngine.easeOutQuad(sceneProgress);
    const cursorPulse = 1 + 0.08 * Math.sin(sceneProgress * Math.PI * 4);

    return `
      <!-- Title & Subtitle Header -->
      <g transform="translate(60, 200)">
        <text x="0" y="0" font-size="48" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(headline || 'WORKING SOFTWARE')}</text>
        <text x="0" y="46" font-size="24" font-weight="800" fill="#38BDF8">NATURAL LANGUAGE <tspan fill="#34D399">→ CODE →</tspan> <tspan fill="#FBBF24">WORKING SOFTWARE</tspan></text>
      </g>

      <!-- Full-Screen Working App with Subtle Camera Push-In -->
      <g transform="scale(${pushIn.toFixed(4)})" transform-origin="540 850">
        <g transform="translate(60, 275)">
          <rect width="960" height="1025" rx="24" fill="#10131E" stroke="#10B981" stroke-width="2.5"/>

          <!-- Top App Navigation Bar -->
          <g transform="translate(36, 28)">
            <circle cx="0" cy="18" r="7" fill="#EF4444"/>
            <circle cx="20" cy="18" r="7" fill="#F59E0B"/>
            <circle cx="40" cy="18" r="7" fill="#10B981"/>
            <circle cx="80" cy="18" r="18" fill="url(#emeraldGrad)"/>
            <path d="M74 18 L78 22 L86 13" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="110" y="27" font-size="28" font-weight="900" fill="#FFFFFF">TaskFlow Studio Pro</text>
            <rect x="420" y="4" width="140" height="32" rx="16" fill="#064E3B" stroke="#10B981" stroke-width="1.5"/>
            <circle cx="436" cy="20" r="4" fill="#34D399"/>
            <text x="495" y="26" font-size="15" font-weight="800" fill="#34D399" text-anchor="middle">React 18 Live</text>
            
            <!-- 1-Click Export TSX Button with Subtle Pulse -->
            <g transform="translate(730, 0) scale(${cursorPulse.toFixed(3)})" transform-origin="80 20">
              <rect width="165" height="44" rx="14" fill="#06B6D4"/>
              <text x="82" y="29" font-size="16" font-weight="900" fill="#000" text-anchor="middle">Export TSX &gt;&gt;</text>
            </g>
          </g>

          <!-- 4-Stat High-Density KPI Dashboard Grid (Large 38px numbers) -->
          <g transform="translate(36, 90)">
            <!-- KPI 1 -->
            <rect x="0" y="0" width="206" height="105" rx="14" fill="#161A26" stroke="#283244" stroke-width="1.5"/>
            <text x="20" y="32" font-size="14" font-weight="800" fill="#94A3B8">TOTAL TASKS</text>
            <text x="20" y="72" font-size="38" font-weight="900" fill="#FFFFFF">12</text>
            <text x="20" y="94" font-size="13" font-weight="600" fill="#CBD5E1">3 Sprints Tracked</text>

            <!-- KPI 2 -->
            <rect x="226" y="0" width="206" height="105" rx="14" fill="#0E2E1B" stroke="#10B981" stroke-width="2"/>
            <text x="246" y="32" font-size="14" font-weight="900" fill="#34D399">COMPLETED</text>
            <text x="246" y="72" font-size="38" font-weight="900" fill="#34D399">4 / 4</text>
            <text x="246" y="94" font-size="13" font-weight="700" fill="#A7F3D0">100% Target Met</text>

            <!-- KPI 3 -->
            <rect x="452" y="0" width="206" height="105" rx="14" fill="#161A26" stroke="#283244" stroke-width="1.5"/>
            <text x="472" y="32" font-size="14" font-weight="800" fill="#38BDF8">VELOCITY</text>
            <text x="472" y="72" font-size="38" font-weight="900" fill="#38BDF8">24</text>
            <text x="472" y="94" font-size="13" font-weight="600" fill="#CBD5E1">Points / Sprint</text>

            <!-- KPI 4 -->
            <rect x="678" y="0" width="210" height="105" rx="14" fill="#161A26" stroke="#283244" stroke-width="1.5"/>
            <text x="698" y="32" font-size="14" font-weight="800" fill="#FBBF24">LATENCY</text>
            <text x="698" y="72" font-size="38" font-weight="900" fill="#FBBF24">&lt;16ms</text>
            <text x="698" y="94" font-size="13" font-weight="700" fill="#FDE68A">Instant Hot Reload</text>
          </g>

          <!-- Interactive Filter Tabs (Large 15px Bold) -->
          <g transform="translate(36, 215)">
            <rect width="888" height="54" rx="14" fill="#1B2130" stroke="#2E3A52" stroke-width="1.5"/>
            <rect x="6" y="6" width="210" height="42" rx="10" fill="#06B6D4"/>
            <text x="111" y="33" font-size="15" font-weight="900" fill="#000" text-anchor="middle">HIGH PRIORITY (4)</text>
            <text x="310" y="33" font-size="15" font-weight="800" fill="#E2E8F0">ALL TASKS (12)</text>
            <text x="510" y="33" font-size="15" font-weight="800" fill="#E2E8F0">IN PROGRESS (5)</text>
            <text x="750" y="33" font-size="15" font-weight="900" fill="#34D399">VERIFIED (4)</text>
          </g>

          <!-- Real Full-Content Task Rows (24px Bold Titles, 15px Metadata) -->
          <g transform="translate(36, 288)">
            <!-- Task Row 1: Completed with Checkmark -->
            <g transform="translate(0, 0)">
              <rect width="888" height="125" rx="16" fill="#161A28" stroke="#10B981" stroke-width="2"/>
              <rect x="20" y="24" width="38" height="38" rx="10" fill="#10B981"/>
              <path d="M28 43 L34 49 L46 37" fill="none" stroke="#000000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
              <text x="74" y="49" font-size="24" font-weight="900" fill="#FFFFFF" text-decoration="line-through">Deploy AI Pipeline to Production</text>
              <rect x="690" y="24" width="175" height="36" rx="10" fill="#10B981"/>
              <text x="777" y="48" font-size="15" font-weight="900" fill="#000" text-anchor="middle">COMPLETED</text>
              <text x="74" y="92" font-size="15" font-weight="600" fill="#CBD5E1">Assignee: Core AI Engine Team • Latency SLA &lt;50ms • Production Verified</text>
            </g>

            <!-- Task Row 2 -->
            <g transform="translate(0, 142)">
              <rect width="888" height="125" rx="16" fill="#161A28" stroke="#0284C7" stroke-width="1.5"/>
              <rect x="20" y="24" width="38" height="38" rx="10" fill="#0C2538" stroke="#38BDF8" stroke-width="2"/>
              <text x="74" y="49" font-size="24" font-weight="900" fill="#FFFFFF">Optimize Vector Search Index</text>
              <rect x="690" y="24" width="175" height="36" rx="10" fill="#0284C7"/>
              <text x="777" y="48" font-size="15" font-weight="900" fill="#FFF" text-anchor="middle">VECTOR SEARCH</text>
              <text x="74" y="92" font-size="15" font-weight="600" fill="#CBD5E1">200M Embeddings • HNSW Indexing • Sub-second Latency Target</text>
            </g>

            <!-- Task Row 3 -->
            <g transform="translate(0, 284)">
              <rect width="888" height="125" rx="16" fill="#161A28" stroke="#7C3AED" stroke-width="1.5"/>
              <rect x="20" y="24" width="38" height="38" rx="10" fill="#221338" stroke="#A855F7" stroke-width="2"/>
              <text x="74" y="49" font-size="24" font-weight="900" fill="#FFFFFF">Webhook Trigger &amp; Event Stream</text>
              <rect x="690" y="24" width="175" height="36" rx="10" fill="#7C3AED"/>
              <text x="777" y="48" font-size="15" font-weight="900" fill="#FFF" text-anchor="middle">AUTOMATION</text>
              <text x="74" y="92" font-size="15" font-weight="600" fill="#CBD5E1">Real-time webhook ingestion • Cross-platform state synchronization</text>
            </g>

            <!-- Task Row 4 -->
            <g transform="translate(0, 426)">
              <rect width="888" height="125" rx="16" fill="#161A28" stroke="#D97706" stroke-width="1.5"/>
              <rect x="20" y="24" width="38" height="38" rx="10" fill="#2E1C0C" stroke="#F59E0B" stroke-width="2"/>
              <text x="74" y="49" font-size="24" font-weight="900" fill="#FFFFFF">Real-Time Metric Dashboard Widgets</text>
              <rect x="690" y="24" width="175" height="36" rx="10" fill="#D97706"/>
              <text x="777" y="48" font-size="15" font-weight="900" fill="#FFF" text-anchor="middle">DASHBOARD</text>
              <text x="74" y="92" font-size="15" font-weight="600" fill="#CBD5E1">Custom charting widgets with live hot reload from conversation</text>
            </g>
          </g>

          <!-- Bottom Footer Bar (Ending at Y: 1000, safely above captions) -->
          <g transform="translate(36, 855)">
            <rect width="888" height="145" rx="18" fill="#132030" stroke="#06B6D4" stroke-width="2"/>
            <text x="36" y="38" font-size="20" font-weight="900" fill="#38BDF8">CLAUDE 3.5 SONNET • ARTIFACTS CAPABILITIES:</text>
            <text x="36" y="70" font-size="16" font-weight="600" fill="#FFFFFF">• Turn natural language directly into running web software</text>
            <text x="36" y="100" font-size="16" font-weight="600" fill="#FFFFFF">• Modify, preview and iterate without leaving the chat</text>
            <text x="36" y="130" font-size="16" font-weight="700" fill="#34D399">• Zero local environment or dependencies required</text>
          </g>
        </g>

        <!-- Hover Cursor on Export Button -->
        <g transform="translate(830, 310)">
          <circle cx="0" cy="0" r="14" fill="rgba(6,182,212,0.3)"/>
          <path d="M0,0 L0,22 L5,17 L12,30 L17,27 L10,14 L18,14 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
        </g>
      </g>
    `;
  }

  // =========================================================================
  // TEMPLATE 2: TOOL SHOWCASE (Hero Spotlight & 3-5 Feature Demonstrations)
  // =========================================================================
  private renderToolShowcaseTemplate(ctx: FrameContext): string {
    const { sceneElapsed, headline, subtitle } = ctx;
    const pulse = 1 + 0.03 * Math.sin(sceneElapsed * 4);

    return `
      <g transform="translate(60, 240)">
        <text x="0" y="0" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(headline || 'AI TOOL SHOWCASE')}</text>
        <text x="0" y="52" font-size="28" font-weight="500" fill="#94A3B8">${escapeXml(subtitle || 'Essential Creator & Developer Toolkit')}</text>
      </g>

      <g transform="translate(60, 400)">
        <!-- Hero Visual Spotlight Card -->
        <g transform="scale(${pulse.toFixed(3)}) translate(${((1 - pulse) * 480).toFixed(1)}, 0)">
          <rect width="960" height="340" rx="28" fill="url(#cyanGrad)" opacity="0.15"/>
          <rect width="960" height="340" rx="28" fill="rgba(15,23,42,0.9)" stroke="rgba(56,189,248,0.4)" stroke-width="2"/>
          <circle cx="120" cy="170" r="60" fill="url(#cyanGrad)"/>
          <text x="120" y="185" font-size="44" fill="#000" font-weight="900" text-anchor="middle">•</text>
          <text x="220" y="145" font-size="36" font-weight="900" fill="#FFFFFF">SPOTLIGHT CAPABILITY</text>
          <text x="220" y="190" font-size="20" font-weight="600" fill="#38BDF8">High-Speed AI Engine • Verified 2026 Release</text>
          <text x="220" y="230" font-size="18" fill="#94A3B8">Automates multi-step research, extraction, and synthesis</text>
        </g>

        <!-- 3 Feature Demonstrations -->
        <g transform="translate(0, 380)">
          <rect y="0" width="960" height="120" rx="20" fill="rgba(30,41,59,0.7)" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
          <circle cx="60" cy="60" r="24" fill="rgba(6,182,212,0.2)"/>
          <text x="60" y="68" font-size="22" fill="#38BDF8" text-anchor="middle">01</text>
          <text x="110" y="50" font-size="22" font-weight="700" fill="#FFF">Real-Time Search &amp; Citations</text>
          <text x="110" y="85" font-size="17" fill="#94A3B8">Indexes 200M+ research papers with exact source links</text>

          <rect y="140" width="960" height="120" rx="20" fill="rgba(30,41,59,0.7)" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
          <circle cx="60" cy="200" r="24" fill="rgba(139,92,246,0.2)"/>
          <text x="60" y="208" font-size="22" fill="#C084FC" text-anchor="middle">02</text>
          <text x="110" y="190" font-size="22" font-weight="700" fill="#FFF">Visual Canvas Drag-and-Drop</text>
          <text x="110" y="225" font-size="17" fill="#94A3B8">Direct file ingestion with interactive module chaining</text>

          <rect y="280" width="960" height="120" rx="20" fill="rgba(30,41,59,0.7)" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
          <circle cx="60" cy="340" r="24" fill="rgba(16,185,129,0.2)"/>
          <text x="60" y="348" font-size="22" fill="#34D399" text-anchor="middle">03</text>
          <text x="110" y="330" font-size="22" font-weight="700" fill="#FFF">Zero Setup &amp; Offline Support</text>
          <text x="110" y="365" font-size="17" fill="#94A3B8">Runs directly in browser or locally on laptop</text>
        </g>
      </g>
    `;
  }

  // =========================================================================
  // TEMPLATE 3: NEWS UPDATE (Headline Card, Source Badge & 3-Point Ticker)
  // =========================================================================
  private renderNewsUpdateTemplate(ctx: FrameContext): string {
    const { sceneElapsed, headline, subtitle } = ctx;
    const tickerProgress = FrameAnimationEngine.clamp(sceneElapsed / 2.5, 0, 1);
    const bulletsVisible = Math.floor(tickerProgress * 3) + 1;

    return `
      <g transform="translate(60, 230)">
        <rect width="240" height="38" rx="19" fill="#EF4444" opacity="0.9"/>
        <text x="120" y="26" font-size="16" font-weight="900" fill="#FFF" text-anchor="middle" letter-spacing="1">⚡ BREAKING AI UPDATE</text>
        <text x="0" y="85" font-size="48" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(headline || 'AI INDUSTRY DEVELOPMENTS')}</text>
        <text x="0" y="130" font-size="24" font-weight="600" fill="#94A3B8">${escapeXml(subtitle || 'Verified Source • Official Deployment • 2026')}</text>
      </g>

      <g transform="translate(60, 420)">
        <rect width="960" height="780" rx="28" fill="#0F172A" stroke="rgba(239,68,68,0.3)" stroke-width="2"/>
        
        <!-- Source Badge Banner -->
        <g transform="translate(40, 40)">
          <rect width="880" height="70" rx="16" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.3)"/>
          <circle cx="36" cy="35" r="12" fill="#EF4444"/>
          <text x="64" y="42" font-size="20" font-weight="800" fill="#FCA5A5">VERIFIED AI RELEASE • OFFICIAL DOCUMENTATION</text>
        </g>

        <!-- 3-Bullet News Ticker -->
        <g transform="translate(40, 150)">
          ${bulletsVisible >= 1 ? `
            <g transform="translate(0, 0)">
              <rect width="880" height="150" rx="20" fill="rgba(30,41,59,0.8)" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
              <text x="36" y="52" font-size="24" font-weight="800" fill="#FFF">1. Architecture Breakthrough</text>
              <text x="36" y="90" font-size="18" fill="#CBD5E1">Hybrid reasoning dynamically switches between high-speed and deep-thinking modes.</text>
              <text x="36" y="125" font-size="15" font-weight="600" fill="#38BDF8">Impact: 3x efficiency improvement across reasoning benchmarks</text>
            </g>
          ` : ''}

          ${bulletsVisible >= 2 ? `
            <g transform="translate(0, 180)">
              <rect width="880" height="150" rx="20" fill="rgba(30,41,59,0.8)" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
              <text x="36" y="52" font-size="24" font-weight="800" fill="#FFF">2. Developer &amp; Creator Rollout</text>
              <text x="36" y="90" font-size="18" fill="#CBD5E1">Available immediately across API endpoints and web client interfaces.</text>
              <text x="36" y="125" font-size="15" font-weight="600" fill="#34D399">Deployment: Global production rollout complete</text>
            </g>
          ` : ''}

          ${bulletsVisible >= 3 ? `
            <g transform="translate(0, 360)">
              <rect width="880" height="150" rx="20" fill="rgba(30,41,59,0.8)" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
              <text x="36" y="52" font-size="24" font-weight="800" fill="#FFF">3. Everyday Workflow Application</text>
              <text x="36" y="90" font-size="18" fill="#CBD5E1">Complex spreadsheet and coding tasks execute with near-zero prompting friction.</text>
              <text x="36" y="125" font-size="15" font-weight="600" fill="#C084FC">Status: Ready for daily operational use</text>
            </g>
          ` : ''}
        </g>
      </g>
    `;
  }

  // =========================================================================
  // TEMPLATE 4: AI UPDATE (Model Release, Version Changelog & Demo Canvas)
  // =========================================================================
  private renderAiUpdateTemplate(ctx: FrameContext): string {
    const { sceneElapsed, headline, subtitle } = ctx;
    const progress = FrameAnimationEngine.clamp(sceneElapsed / 3.0, 0, 1);
    const speedPercent = Math.min(100, Math.round(progress * 98));

    return `
      <g transform="translate(60, 240)">
        <text x="0" y="0" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(headline || 'AI MODEL UPDATE')}</text>
        <text x="0" y="52" font-size="28" font-weight="500" fill="#94A3B8">${escapeXml(subtitle || 'Capability Upgrades &amp; Performance Metrics')}</text>
      </g>

      <g transform="translate(60, 400)">
        <rect width="960" height="780" rx="28" fill="#0F172A" stroke="rgba(16,185,129,0.3)" stroke-width="2"/>

        <!-- Version Pill Header -->
        <g transform="translate(40, 40)">
          <rect width="320" height="50" rx="25" fill="#065F46"/>
          <text x="160" y="32" font-size="20" font-weight="800" fill="#A7F3D0" text-anchor="middle">VERSION 3.0 DEPLOYED</text>
        </g>

        <!-- Changelog Highlights -->
        <g transform="translate(40, 120)">
          <rect width="880" height="280" rx="20" fill="rgba(30,41,59,0.7)" stroke="rgba(255,255,255,0.08)"/>
          <text x="36" y="50" font-size="24" font-weight="800" fill="#34D399">Changelog Highlights</text>
          
          <text x="36" y="100" font-size="19" fill="#FFF">+ Real-time hybrid reasoning switch</text>
          <text x="36" y="145" font-size="19" fill="#FFF">+ 200,000 token context window with zero recall loss</text>
          <text x="36" y="190" font-size="19" fill="#FFF">+ Visual multi-file canvas editing</text>
          <text x="36" y="235" font-size="19" fill="#FFF">+ 5x lower latency on multi-step agentic workflows</text>
        </g>

        <!-- Benchmark Meter -->
        <g transform="translate(40, 430)">
          <rect width="880" height="280" rx="20" fill="rgba(2,6,23,0.7)" stroke="rgba(16,185,129,0.2)"/>
          <text x="36" y="50" font-size="22" font-weight="700" fill="#34D399">Benchmark Performance Index</text>
          
          <!-- Bar 1 -->
          <text x="36" y="100" font-size="18" fill="#94A3B8">Accuracy</text>
          <rect x="36" y="115" width="700" height="24" rx="12" fill="#1E293B"/>
          <rect x="36" y="115" width="${(700 * (speedPercent / 100)).toFixed(1)}" height="24" rx="12" fill="url(#emeraldGrad)"/>
          <text x="760" y="134" font-size="18" font-weight="800" fill="#34D399">${speedPercent}%</text>

          <!-- Bar 2 -->
          <text x="36" y="180" font-size="18" fill="#94A3B8">Processing Speed</text>
          <rect x="36" y="195" width="700" height="24" rx="12" fill="#1E293B"/>
          <rect x="36" y="195" width="${(700 * (speedPercent * 0.95 / 100)).toFixed(1)}" height="24" rx="12" fill="url(#cyanGrad)"/>
          <text x="760" y="214" font-size="18" font-weight="800" fill="#38BDF8">${(speedPercent * 0.95).toFixed(0)}%</text>
        </g>
      </g>
    `;
  }

  // =========================================================================
  // TEMPLATE 5: EXPLAINER (Animated Concept Diagram & Flow Relationships)
  // =========================================================================
  private renderExplainerTemplate(ctx: FrameContext): string {
    const { sceneElapsed, headline, subtitle } = ctx;
    const orbitAngle = Math.round((sceneElapsed * 30) % 360);

    return `
      <g transform="translate(60, 240)">
        <text x="0" y="0" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(headline || 'HOW IT WORKS')}</text>
        <text x="0" y="52" font-size="28" font-weight="500" fill="#94A3B8">${escapeXml(subtitle || 'Concept Breakdown &amp; Mental Model')}</text>
      </g>

      <g transform="translate(60, 400)">
        <rect width="960" height="780" rx="28" fill="#0F172A" stroke="rgba(139,92,246,0.3)" stroke-width="2"/>

        <!-- Central Explainer Diagram -->
        <g transform="translate(480, 390)">
          <!-- Orbital rings -->
          <circle cx="0" cy="0" r="220" fill="none" stroke="rgba(139,92,246,0.2)" stroke-width="2" stroke-dasharray="8,8" transform="rotate(${orbitAngle})"/>
          <circle cx="0" cy="0" r="140" fill="none" stroke="rgba(6,182,212,0.3)" stroke-width="2" transform="rotate(${-orbitAngle})"/>
          
          <!-- Center Core -->
          <circle cx="0" cy="0" r="70" fill="url(#purpleGrad)"/>
          <text x="0" y="-8" font-size="22" font-weight="900" fill="#FFF" text-anchor="middle">CORE</text>
          <text x="0" y="22" font-size="16" font-weight="700" fill="#FFF" text-anchor="middle">ENGINE</text>

          <!-- Node 1: Input -->
          <g transform="translate(-220, -120)">
            <circle cx="0" cy="0" r="45" fill="#1E293B" stroke="#06B6D4" stroke-width="2"/>
            <text x="0" y="6" font-size="16" font-weight="700" fill="#FFF" text-anchor="middle">INPUT</text>
          </g>

          <!-- Node 2: Logic -->
          <g transform="translate(220, -120)">
            <circle cx="0" cy="0" r="45" fill="#1E293B" stroke="#8B5CF6" stroke-width="2"/>
            <text x="0" y="6" font-size="16" font-weight="700" fill="#FFF" text-anchor="middle">LOGIC</text>
          </g>

          <!-- Node 3: Result -->
          <g transform="translate(0, 220)">
            <circle cx="0" cy="0" r="45" fill="#065F46" stroke="#34D399" stroke-width="2"/>
            <text x="0" y="6" font-size="16" font-weight="700" fill="#FFF" text-anchor="middle">OUTPUT</text>
          </g>
        </g>

        <!-- Bottom Takeaway -->
        <g transform="translate(40, 640)">
          <rect width="880" height="90" rx="18" fill="rgba(139,92,246,0.15)" stroke="#8B5CF6" stroke-width="1.5"/>
          <text x="440" y="52" font-size="22" font-weight="800" fill="#C4B5FD" text-anchor="middle">
            Decomposes Complexity into Clean Modular Steps
          </text>
        </g>
      </g>
    `;
  }

  // =========================================================================
  // TEMPLATE 6: HOW TO (Step 1 2 3 Progression & Real Interaction Simulation)
  // =========================================================================
  private renderHowToTemplate(ctx: FrameContext): string {
    const { sceneElapsed, headline, subtitle } = ctx;
    const step = Math.min(3, Math.floor(sceneElapsed / 2.2) + 1);

    return `
      <g transform="translate(60, 240)">
        <text x="0" y="0" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(headline || 'HOW TO EXECUTE')}</text>
        <text x="0" y="52" font-size="28" font-weight="500" fill="#94A3B8">${escapeXml(subtitle || 'Step-by-Step Practical Workflow')}</text>
      </g>

      <g transform="translate(60, 400)">
        <rect width="960" height="780" rx="28" fill="#0F172A" stroke="rgba(56,189,248,0.3)" stroke-width="2"/>

        <!-- Step 1 -->
        <g transform="translate(40, 40)">
          <rect width="880" height="180" rx="20" fill="${step >= 1 ? 'rgba(6,182,212,0.15)' : 'rgba(30,41,59,0.5)'}" stroke="${step >= 1 ? '#06B6D4' : 'rgba(255,255,255,0.08)'}" stroke-width="2"/>
          <circle cx="50" cy="90" r="30" fill="${step >= 1 ? '#06B6D4' : '#1E293B'}"/>
          <text x="50" y="99" font-size="26" font-weight="900" fill="${step >= 1 ? '#000' : '#FFF'}" text-anchor="middle">01</text>
          <text x="110" y="70" font-size="24" font-weight="800" fill="#FFF">Step 1: Input Raw Context / Files</text>
          <text x="110" y="110" font-size="18" fill="#CBD5E1">Drop spreadsheets, documents, or plain language prompts</text>
        </g>

        <!-- Step 2 -->
        <g transform="translate(40, 250)">
          <rect width="880" height="180" rx="20" fill="${step >= 2 ? 'rgba(139,92,246,0.15)' : 'rgba(30,41,59,0.5)'}" stroke="${step >= 2 ? '#8B5CF6' : 'rgba(255,255,255,0.08)'}" stroke-width="2"/>
          <circle cx="50" cy="90" r="30" fill="${step >= 2 ? '#8B5CF6' : '#1E293B'}"/>
          <text x="50" y="99" font-size="26" font-weight="900" fill="${step >= 2 ? '#000' : '#FFF'}" text-anchor="middle">02</text>
          <text x="110" y="70" font-size="24" font-weight="800" fill="#FFF">Step 2: AI Analyzes &amp; Chains Operations</text>
          <text x="110" y="110" font-size="18" fill="#CBD5E1">Synthesizes structure, verifies schema, and generates assets</text>
        </g>

        <!-- Step 3 -->
        <g transform="translate(40, 460)">
          <rect width="880" height="180" rx="20" fill="${step >= 3 ? 'rgba(16,185,129,0.15)' : 'rgba(30,41,59,0.5)'}" stroke="${step >= 3 ? '#10B981' : 'rgba(255,255,255,0.08)'}" stroke-width="2"/>
          <circle cx="50" cy="90" r="30" fill="${step >= 3 ? '#10B981' : '#1E293B'}"/>
          <text x="50" y="99" font-size="26" font-weight="900" fill="${step >= 3 ? '#000' : '#FFF'}" text-anchor="middle">03</text>
          <text x="110" y="70" font-size="24" font-weight="800" fill="#FFF">Step 3: Review Finished Output</text>
          <text x="110" y="110" font-size="18" fill="#CBD5E1">Inspect high-fidelity result and export with zero friction</text>
        </g>
      </g>
    `;
  }

  // =========================================================================
  // TEMPLATE 7: LISTICLE (Bold Numbers & Varied Layouts Per Item)
  // =========================================================================
  private renderListicleTemplate(ctx: FrameContext): string {
    const { sceneIndex, headline, subtitle } = ctx;
    const itemNum = (sceneIndex % 5) + 1;

    return `
      <g transform="translate(60, 240)">
        <text x="0" y="0" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(headline || `ITEM 0${itemNum}`)}</text>
        <text x="0" y="52" font-size="28" font-weight="500" fill="#94A3B8">${escapeXml(subtitle || 'Top AI Tools &amp; Methods')}</text>
      </g>

      <g transform="translate(60, 400)">
        <rect width="960" height="780" rx="28" fill="#0F172A" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>

        <!-- Number Header Badge -->
        <g transform="translate(40, 40)">
          <rect width="140" height="90" rx="24" fill="url(#cyanGrad)"/>
          <text x="70" y="60" font-size="44" font-weight="900" fill="#000" text-anchor="middle">0${itemNum}</text>
          <text x="170" y="58" font-size="32" font-weight="900" fill="#FFF">${escapeXml(headline || `Featured AI Workflow`)}</text>
        </g>

        <!-- Dynamic Content Box with unique style per item -->
        <g transform="translate(40, 160)">
          <rect width="880" height="560" rx="24" fill="rgba(30,41,59,0.7)" stroke="rgba(255,255,255,0.08)"/>
          
          <g transform="translate(50, 60)">
            <text x="0" y="40" font-size="26" font-weight="800" fill="#38BDF8">Key Advantage &amp; Why It Matters</text>
            <text x="0" y="90" font-size="20" fill="#CBD5E1">• Built for frictionless daily knowledge work</text>
            <text x="0" y="140" font-size="20" fill="#CBD5E1">• 100% verified production reliability</text>
            <text x="0" y="190" font-size="20" fill="#CBD5E1">• Saves 10+ hours per week on complex tasks</text>
            
            <g transform="translate(0, 260)">
              <rect width="780" height="120" rx="18" fill="rgba(6,182,212,0.12)" stroke="#06B6D4"/>
              <text x="30" y="50" font-size="22" font-weight="800" fill="#38BDF8">Production Ready</text>
              <text x="30" y="88" font-size="18" fill="#94A3B8">Integrated into the FLASH.Ai daily automation pipeline</text>
            </g>
          </g>
        </g>
      </g>
    `;
  }

  // =========================================================================
  // TEMPLATE 8: COMPARISON (True Side-by-Side Split Screen with Moving Divider)
  // =========================================================================
  private renderComparisonTemplate(ctx: FrameContext): string {
    const { sceneElapsed, headline, subtitle } = ctx;
    const progress = FrameAnimationEngine.clamp((sceneElapsed - 1.5) / 2.0, 0, 1);
    const dividerX = 540 + Math.sin(progress * Math.PI) * 120;

    return `
      <g transform="translate(60, 240)">
        <text x="0" y="0" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(headline || 'SIDE-BY-SIDE COMPARISON')}</text>
        <text x="0" y="52" font-size="28" font-weight="500" fill="#94A3B8">${escapeXml(subtitle || 'Traditional Method vs Modern AI Workflow')}</text>
      </g>

      <g transform="translate(60, 400)">
        <rect width="960" height="780" rx="28" fill="#0F172A" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>

        <!-- Left Side: Old / Complex Method -->
        <g transform="translate(40, 40)">
          <rect width="420" height="700" rx="20" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.3)" stroke-width="1.5"/>
          <text x="30" y="50" font-size="24" font-weight="800" fill="#F87171">OLD: COMPLEX</text>
          <text x="30" y="110" font-size="18" fill="#CBD5E1">❌ Manual prompt syntax</text>
          <text x="30" y="160" font-size="18" fill="#CBD5E1">❌ High setup friction</text>
          <text x="30" y="210" font-size="18" fill="#CBD5E1">❌ Slow iteration time</text>
          <text x="30" y="260" font-size="18" fill="#CBD5E1">❌ Inconsistent results</text>
        </g>

        <!-- Right Side: New AI Method -->
        <g transform="translate(500, 40)">
          <rect width="420" height="700" rx="20" fill="rgba(6,182,212,0.08)" stroke="#06B6D4" stroke-width="2"/>
          <text x="30" y="50" font-size="24" font-weight="800" fill="#38BDF8">NEW: FLASH AI</text>
          <text x="30" y="110" font-size="18" fill="#FFF">• Natural language intent</text>
          <text x="30" y="160" font-size="18" fill="#FFF">• Zero setup barrier</text>
          <text x="30" y="210" font-size="18" fill="#FFF">• 10x faster execution</text>
          <text x="30" y="260" font-size="18" fill="#FFF">• 100% verified accuracy</text>
        </g>

        <!-- Dynamic Laser Divider Line -->
        <line x1="${Math.round(dividerX - 60)}" y1="30" x2="${Math.round(dividerX - 60)}" y2="750" stroke="#38BDF8" stroke-width="3" stroke-dasharray="8,4" opacity="0.6"/>
      </g>
    `;
  }

  // =========================================================================
  // TEMPLATE 9: BEFORE AFTER (State A Manual -> Laser Wipe -> State B Automated)
  // =========================================================================
  private renderBeforeAfterTemplate(ctx: FrameContext): string {
    const { sceneElapsed, headline, subtitle } = ctx;
    const progress = FrameAnimationEngine.clamp(sceneElapsed / 3.0, 0, 1);
    const wipeY = 80 + progress * 600;

    return `
      <g transform="translate(60, 240)">
        <text x="0" y="0" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(headline || 'WORKFLOW TRANSFORMATION')}</text>
        <text x="0" y="52" font-size="28" font-weight="500" fill="#94A3B8">${escapeXml(subtitle || 'Before vs After AI Automation')}</text>
      </g>

      <g transform="translate(60, 400)">
        <rect width="960" height="780" rx="28" fill="#0F172A" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>

        <g transform="translate(40, 40)">
          <rect width="880" height="700" rx="20" fill="rgba(30,41,59,0.7)"/>

          <!-- Top/Before Area -->
          <text x="40" y="60" font-size="24" font-weight="800" fill="#EF4444">BEFORE: UNSTRUCTURED &amp; SLOW</text>
          <text x="40" y="100" font-size="18" fill="#94A3B8">Manual data entry, fragmented spreadsheets, repetitive copy-pasting</text>

          <!-- Laser Wipe Line -->
          <line x1="20" y1="${wipeY.toFixed(1)}" x2="860" y2="${wipeY.toFixed(1)}" stroke="#06B6D4" stroke-width="4"/>

          <!-- Bottom/After Area -->
          <g transform="translate(40, ${(Math.max(160, wipeY + 20)).toFixed(1)})">
            <text x="0" y="40" font-size="24" font-weight="800" fill="#34D399">AFTER: AUTONOMOUS &amp; VERIFIED</text>
            <text x="0" y="80" font-size="18" fill="#FFF">Instant structured synthesis, zero human intervention, 21:00 IST scheduled</text>
          </g>
        </g>
      </g>
    `;
  }

  // =========================================================================
  // TEMPLATE 10: AUTOMATION WORKFLOW (Trigger -> Processing -> Output Nodes)
  // =========================================================================
  private renderAutomationWorkflowTemplate(ctx: FrameContext): string {
    const { sceneElapsed, headline, subtitle } = ctx;
    const progress = FrameAnimationEngine.clamp(sceneElapsed / 3.0, 0, 1);
    const pulseX = 140 + progress * 680;

    return `
      <g transform="translate(60, 240)">
        <text x="0" y="0" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(headline || 'AUTOMATION PIPELINE')}</text>
        <text x="0" y="52" font-size="28" font-weight="500" fill="#94A3B8">${escapeXml(subtitle || 'Trigger • AI Reasoning • Action Nodes')}</text>
      </g>

      <g transform="translate(60, 400)">
        <rect width="960" height="780" rx="28" fill="#0F172A" stroke="rgba(6,182,212,0.3)" stroke-width="2"/>

        <!-- Connecting Pipeline Path -->
        <path d="M 140 390 L 820 390" stroke="#06B6D4" stroke-width="6" stroke-dasharray="12,8"/>
        <circle cx="${pulseX.toFixed(1)}" cy="390" r="14" fill="#38BDF8"/>

        <!-- Node 1: Trigger -->
        <g transform="translate(80, 320)">
          <rect width="140" height="140" rx="28" fill="#1E293B" stroke="#06B6D4" stroke-width="2"/>
          <text x="70" y="65" font-size="32" text-anchor="middle">⚡</text>
          <text x="70" y="105" font-size="16" font-weight="800" fill="#FFF" text-anchor="middle">TRIGGER</text>
        </g>

        <!-- Node 2: AI Logic -->
        <g transform="translate(410, 320)">
          <rect width="140" height="140" rx="28" fill="#4338CA" stroke="#818CF8" stroke-width="2"/>
          <text x="70" y="65" font-size="32" text-anchor="middle">🧠</text>
          <text x="70" y="105" font-size="16" font-weight="800" fill="#FFF" text-anchor="middle">REASONING</text>
        </g>

        <!-- Node 3: Output -->
        <g transform="translate(740, 320)">
          <rect width="140" height="140" rx="28" fill="#065F46" stroke="#34D399" stroke-width="2"/>
          <text x="70" y="65" font-size="32" text-anchor="middle">🚀</text>
          <text x="70" y="105" font-size="16" font-weight="800" fill="#FFF" text-anchor="middle">EXECUTE</text>
        </g>

        <!-- Active Pipeline Status -->
        <g transform="translate(40, 580)">
          <rect width="880" height="120" rx="20" fill="rgba(6,182,212,0.12)" stroke="#06B6D4"/>
          <text x="440" y="52" font-size="24" font-weight="800" fill="#38BDF8" text-anchor="middle">Continuous Autonomous Execution</text>
          <text x="440" y="90" font-size="18" fill="#94A3B8" text-anchor="middle">Zero-touch daily pipeline running reliably in background</text>
        </g>
      </g>
    `;
  }

  // =========================================================================
  // TEMPLATE 11: DATA INSIGHT (Animated Bar Charts, Speed & Accuracy Counters)
  // =========================================================================
  private renderDataInsightTemplate(ctx: FrameContext): string {
    const { sceneElapsed, headline, subtitle } = ctx;
    const progress = FrameAnimationEngine.clamp(sceneElapsed / 2.5, 0, 1);
    const bar1Height = progress * 400;
    const bar2Height = progress * 240;
    const bar3Height = progress * 520;

    return `
      <g transform="translate(60, 240)">
        <text x="0" y="0" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(headline || 'BENCHMARK DATA')}</text>
        <text x="0" y="52" font-size="28" font-weight="500" fill="#94A3B8">${escapeXml(subtitle || 'Verified Industry Research &amp; Performance Metrics')}</text>
      </g>

      <g transform="translate(60, 400)">
        <rect width="960" height="780" rx="28" fill="#0F172A" stroke="rgba(56,189,248,0.3)" stroke-width="2"/>

        <!-- Chart Grid & Bars -->
        <g transform="translate(80, 100)">
          <line x1="0" y1="560" x2="800" y2="560" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>

          <!-- Bar 1 -->
          <rect x="80" y="${(560 - bar1Height).toFixed(1)}" width="140" height="${bar1Height.toFixed(1)}" rx="16" fill="url(#cyanGrad)"/>
          <text x="150" y="595" font-size="18" font-weight="700" fill="#94A3B8" text-anchor="middle">Speed</text>

          <!-- Bar 2 -->
          <rect x="330" y="${(560 - bar2Height).toFixed(1)}" width="140" height="${bar2Height.toFixed(1)}" rx="16" fill="url(#purpleGrad)"/>
          <text x="400" y="595" font-size="18" font-weight="700" fill="#94A3B8" text-anchor="middle">Cost</text>

          <!-- Bar 3 -->
          <rect x="580" y="${(560 - bar3Height).toFixed(1)}" width="140" height="${bar3Height.toFixed(1)}" rx="16" fill="url(#emeraldGrad)"/>
          <text x="650" y="595" font-size="18" font-weight="700" fill="#94A3B8" text-anchor="middle">Accuracy</text>
        </g>
      </g>
    `;
  }

  // =========================================================================
  // PRESENTATION STYLE 1: DEVELOPER & CODE STUDIO
  // (Dark IDE, Syntax-Highlighted Code, Terminal CLI Execution & Benchmarks)
  // =========================================================================
  private renderDeveloperStudioTemplate(ctx: FrameContext): string {
    const { globalTime, headline, subtitle } = ctx;

    // SCENE 1 (0-2.5s): Terminal launch & command execution
    if (globalTime < 2.5) {
      const fullCmd = "$ ollama run deepseek-r1:8b --gpu-layers 33";
      const typeProg = Math.min(1, globalTime / 1.2);
      const chars = Math.floor(typeProg * (fullCmd.length - 2));
      const typedCmd = fullCmd.slice(0, 2 + chars);
      const cursorBlink = Math.floor(globalTime * 5) % 2 === 0 ? '█' : ' ';
      const showInit = globalTime >= 1.3;
      const showTokens = globalTime >= 1.8;

      return `
        <!-- Title Header -->
        <g transform="translate(60, 200)">
          <text x="0" y="0" font-size="48" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(headline || 'DEVELOPER STUDIO')}</text>
          <text x="0" y="46" font-size="24" font-weight="700" fill="#10B981">${escapeXml(subtitle || 'Local Model Execution &amp; Real-Time CLI')}</text>
        </g>

        <!-- IDE / Terminal Window (Y: 275) -->
        <g transform="translate(60, 275)">
          <rect width="960" height="1140" rx="24" fill="#0A0E17" stroke="#1E293B" stroke-width="2"/>
          
          <!-- Titlebar with tabs -->
          <rect width="960" height="52" rx="24" fill="#111827"/>
          <circle cx="36" cy="26" r="7" fill="#EF4444"/>
          <circle cx="58" cy="26" r="7" fill="#F59E0B"/>
          <circle cx="80" cy="26" r="7" fill="#10B981"/>

          <!-- Active Tab -->
          <rect x="120" y="8" width="180" height="44" rx="10" fill="#0A0E17" stroke="#334155" stroke-width="1"/>
          <text x="210" y="35" font-size="16" font-family="Consolas, monospace" font-weight="700" fill="#38BDF8" text-anchor="middle">terminal ~ zsh</text>

          <rect x="310" y="8" width="180" height="44" rx="10" fill="#111827"/>
          <text x="400" y="35" font-size="16" font-family="Consolas, monospace" fill="#64748B" text-anchor="middle">server.py</text>

          <!-- Terminal Content Area -->
          <g transform="translate(36, 90)">
            <!-- Prompt Command -->
            <text x="0" y="30" font-size="26" font-family="Consolas, monospace" font-weight="700" fill="#10B981">
              ${escapeXml(typedCmd)}<tspan fill="#38BDF8">${cursorBlink}</tspan>
            </text>

            <!-- Initialization Logs -->
            <g transform="translate(0, 80)" opacity="${showInit ? '1.0' : '0.0'}">
              <text x="0" y="0" font-size="20" font-family="Consolas, monospace" fill="#64748B">[00:00.12] allocating 5.4 GB VRAM on NVIDIA RTX GPU</text>
              <text x="0" y="32" font-size="20" font-family="Consolas, monospace" fill="#64748B">[00:00.28] warm-up KV cache (context_len=32768)</text>
              <text x="0" y="64" font-size="20" font-family="Consolas, monospace" fill="#34D399">[00:00.41] Model loaded successfully: deepseek-r1-8b-q4_K_M</text>
            </g>

            <!-- Output Generation Simulation -->
            <g transform="translate(0, 210)" opacity="${showTokens ? '1.0' : '0.0'}">
              <rect width="888" height="340" rx="16" fill="#0D1322" stroke="#10B981" stroke-width="1.5"/>
              <text x="24" y="45" font-size="22" font-family="Consolas, monospace" fill="#F8FAFC">&gt; Response streaming:</text>
              <text x="24" y="90" font-size="20" font-family="Consolas, monospace" fill="#A7F3D0">"To optimize memory-bound attention layers in PyTorch,"</text>
              <text x="24" y="125" font-size="20" font-family="Consolas, monospace" fill="#A7F3D0">"enable FlashAttention-2 with torch.compile()."</text>
              <text x="24" y="160" font-size="20" font-family="Consolas, monospace" fill="#A7F3D0">"This reduces peak VRAM usage by 3.8x."</text>

              <!-- Speed Metrics Badge -->
              <g transform="translate(24, 220)">
                <rect width="320" height="48" rx="12" fill="#064E3B" stroke="#059669" stroke-width="1.5"/>
                <text x="160" y="32" font-size="18" font-family="Consolas, monospace" font-weight="900" fill="#34D399" text-anchor="middle">⚡ 148.2 tokens / sec</text>

                <rect x="340" width="240" height="48" rx="12" fill="#0C4A6E" stroke="#0284C7" stroke-width="1.5"/>
                <text x="460" y="32" font-size="18" font-family="Consolas, monospace" font-weight="900" fill="#38BDF8" text-anchor="middle">Latency: 14.5ms</text>
              </g>
            </g>

            <!-- GitHub Attribution Strip -->
            <g transform="translate(0, 620)">
              <rect width="888" height="120" rx="18" fill="#111827" stroke="#374151" stroke-width="1.5"/>
              <text x="32" y="45" font-size="22" font-weight="800" fill="#FFFFFF">github.com/ollama/ollama</text>
              <text x="32" y="80" font-size="16" font-family="Consolas, monospace" fill="#9CA3AF">⭐ 98.4k stars • Apache 2.0 • Zero Cloud Telemetry</text>
              <rect x="680" y="28" width="170" height="40" rx="10" fill="#065F46" stroke="#10B981" stroke-width="1"/>
              <text x="765" y="54" font-size="16" font-weight="800" fill="#A7F3D0" text-anchor="middle">VERIFIED REPO</text>
            </g>
          </g>
        </g>
      `;
    }

    // SCENE 2+ (2.5s+): Syntax-Highlighted Multi-File IDE + Architecture
    const codeProgress = FrameAnimationEngine.clamp((globalTime - 2.5) / 3.0, 0, 1);
    const visibleLines = Math.floor(4 + codeProgress * 7);

    const code = [
      '<text x="0" y="0" font-size="18" font-family="Consolas, monospace" fill="#6E7681">01</text><text x="45" y="0" font-size="22" font-family="Consolas, monospace" fill="#FF7B72">from <tspan fill="#79C0FF">fastapi</tspan> import <tspan fill="#FFFFFF">FastAPI, WebSocket</tspan></text>',
      '<text x="0" y="38" font-size="18" font-family="Consolas, monospace" fill="#6E7681">02</text><text x="45" y="38" font-size="22" font-family="Consolas, monospace" fill="#FF7B72">import <tspan fill="#79C0FF">ollama</tspan></text>',
      '<text x="0" y="76" font-size="18" font-family="Consolas, monospace" fill="#6E7681">03</text><text x="45" y="76" font-size="22" font-family="Consolas, monospace" fill="#FFA657">app <tspan fill="#FFFFFF">= FastAPI()</tspan></text>',
      '<text x="0" y="114" font-size="18" font-family="Consolas, monospace" fill="#6E7681">04</text><text x="45" y="114" font-size="22" font-family="Consolas, monospace" fill="#7EE787">@app.post("/v1/inference")</text>',
      '<text x="0" y="152" font-size="18" font-family="Consolas, monospace" fill="#6E7681">05</text><text x="45" y="152" font-size="22" font-family="Consolas, monospace" fill="#FF7B72">async def <tspan fill="#79C0FF">generate_stream</tspan><tspan fill="#FFFFFF">(prompt: str):</tspan></text>',
      '<text x="0" y="190" font-size="18" font-family="Consolas, monospace" fill="#6E7681">06</text><text x="75" y="190" font-size="22" font-family="Consolas, monospace" fill="#FFA657">stream <tspan fill="#FFFFFF">= ollama.chat(</tspan></text>',
      '<text x="0" y="228" font-size="18" font-family="Consolas, monospace" fill="#6E7681">07</text><text x="100" y="228" font-size="22" font-family="Consolas, monospace" fill="#7EE787">model=\'deepseek-r1:8b\',</text>',
      '<text x="0" y="266" font-size="18" font-family="Consolas, monospace" fill="#6E7681">08</text><text x="100" y="266" font-size="22" font-family="Consolas, monospace" fill="#FFFFFF">messages=[{\'role\': \'user\', \'content\': prompt}],</text>',
      '<text x="0" y="304" font-size="18" font-family="Consolas, monospace" fill="#6E7681">09</text><text x="100" y="304" font-size="22" font-family="Consolas, monospace" fill="#FFA657">stream<tspan fill="#FFFFFF">=True</tspan></text>',
      '<text x="0" y="342" font-size="18" font-family="Consolas, monospace" fill="#6E7681">10</text><text x="75" y="342" font-size="22" font-family="Consolas, monospace" fill="#FFFFFF">)</text>',
      '<text x="0" y="380" font-size="18" font-family="Consolas, monospace" fill="#6E7681">11</text><text x="75" y="380" font-size="22" font-family="Consolas, monospace" fill="#FF7B72">return <tspan fill="#FFFFFF">StreamingResponse(stream)</tspan></text>'
    ];

    const renderedCode = code.slice(0, visibleLines).join('\n              ');

    return `
      <g transform="translate(60, 200)">
        <text x="0" y="0" font-size="48" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(headline || 'DEVELOPER STUDIO')}</text>
        <text x="0" y="46" font-size="24" font-weight="700" fill="#10B981">${escapeXml(subtitle || 'Real-World Python &amp; Terminal Architecture')}</text>
      </g>

      <g transform="translate(60, 275)">
        <rect width="960" height="1140" rx="24" fill="#0A0E17" stroke="#1E293B" stroke-width="2"/>
        
        <!-- Tab Header -->
        <rect width="960" height="52" rx="24" fill="#111827"/>
        <circle cx="36" cy="26" r="7" fill="#EF4444"/>
        <circle cx="58" cy="26" r="7" fill="#F59E0B"/>
        <circle cx="80" cy="26" r="7" fill="#10B981"/>

        <rect x="120" y="8" width="180" height="44" rx="10" fill="#0A0E17" stroke="#10B981" stroke-width="1.5"/>
        <text x="210" y="35" font-size="16" font-family="Consolas, monospace" font-weight="700" fill="#10B981" text-anchor="middle">pipeline.py</text>

        <!-- Code Block Container -->
        <g transform="translate(36, 90)">
          <rect width="888" height="460" rx="16" fill="#060911" stroke="#1E293B" stroke-width="1.5"/>
          <g transform="translate(24, 40)">
            ${renderedCode}
          </g>
        </g>

        <!-- Real-Time Benchmark Bar -->
        <g transform="translate(36, 580)">
          <rect width="888" height="200" rx="18" fill="#0D1322" stroke="#10B981" stroke-width="1.5"/>
          <text x="32" y="45" font-size="22" font-weight="800" fill="#FFFFFF">Execution &amp; Throughput Benchmark</text>
          
          <!-- Bar 1: PyTorch Baseline -->
          <g transform="translate(32, 70)">
            <text x="0" y="20" font-size="16" font-family="Consolas, monospace" fill="#94A3B8">Baseline</text>
            <rect x="100" y="4" width="220" height="24" rx="6" fill="#334155"/>
            <text x="330" y="22" font-size="16" font-family="Consolas, monospace" fill="#94A3B8">38 tok/s</text>
          </g>

          <!-- Bar 2: FlashAttention + Ollama -->
          <g transform="translate(32, 115)">
            <text x="0" y="20" font-size="16" font-family="Consolas, monospace" font-weight="700" fill="#10B981">Optimized</text>
            <rect x="100" y="4" width="620" height="24" rx="6" fill="url(#emeraldGrad)"/>
            <text x="735" y="22" font-size="16" font-family="Consolas, monospace" font-weight="900" fill="#34D399">148 tok/s (3.9x)</text>
          </g>
        </g>

        <!-- Summary Takeaway Footer -->
        <g transform="translate(36, 810)">
          <rect width="888" height="130" rx="18" fill="#111827" stroke="#374151" stroke-width="1.5"/>
          <text x="32" y="45" font-size="22" font-weight="800" fill="#38BDF8">💡 Developer Takeaway</text>
          <text x="32" y="80" font-size="18" fill="#E2E8F0">Run full reasoning models locally with sub-15ms first-token latency.</text>
        </g>
      </g>
    `;
  }

  // =========================================================================
  // PRESENTATION STYLE 2: DYNAMIC TREND & DATA BREAKDOWN
  // (Milestone Timeline, Spec Comparison Bars, Verified Source Badges)
  // =========================================================================
  private renderTrendBreakdownTemplate(ctx: FrameContext): string {
    const { globalTime, headline, subtitle } = ctx;
    const progress = FrameAnimationEngine.clamp(globalTime / 4.0, 0, 1);

    // Dynamic bar growth
    const barW1 = 200 + progress * 460;
    const barW2 = 180 + progress * 320;
    const barW3 = 160 + progress * 580;

    return `
      <!-- Title Header -->
      <g transform="translate(60, 200)">
        <text x="0" y="0" font-size="48" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(headline || 'TREND BREAKDOWN')}</text>
        <text x="0" y="46" font-size="24" font-weight="700" fill="#EC4899">${escapeXml(subtitle || 'Milestones • Benchmark Evals • Market Velocity')}</text>
      </g>

      <!-- Main Trend Container -->
      <g transform="translate(60, 275)">
        <rect width="960" height="1140" rx="24" fill="#0E0814" stroke="#281124" stroke-width="2"/>

        <!-- Milestone Timeline Strip (Y: 30) -->
        <g transform="translate(36, 30)">
          <rect width="888" height="170" rx="20" fill="#180D22" stroke="#3B1842" stroke-width="1.5"/>
          <text x="32" y="38" font-size="20" font-weight="800" fill="#F472B6">RELEASE &amp; ADOPTION TIMELINE</text>
          
          <!-- Timeline track -->
          <line x1="60" y1="90" x2="820" y2="90" stroke="#4C1D59" stroke-width="3"/>
          <line x1="60" y1="90" x2="${(60 + progress * 760).toFixed(1)}" y2="90" stroke="#EC4899" stroke-width="4"/>

          <!-- Nodes -->
          <circle cx="100" cy="90" r="14" fill="#EC4899"/>
          <text x="100" y="130" font-size="14" font-weight="700" fill="#F9A8D4" text-anchor="middle">v1.0 Launch</text>

          <circle cx="340" cy="90" r="14" fill="#EC4899" opacity="${progress > 0.3 ? '1.0' : '0.4'}"/>
          <text x="340" y="130" font-size="14" font-weight="700" fill="#F9A8D4" text-anchor="middle">Reasoning Engine</text>

          <circle cx="580" cy="90" r="14" fill="#EC4899" opacity="${progress > 0.6 ? '1.0' : '0.4'}"/>
          <text x="580" y="130" font-size="14" font-weight="700" fill="#F9A8D4" text-anchor="middle">API &amp; Tools</text>

          <circle cx="800" cy="90" r="14" fill="#EC4899" opacity="${progress > 0.9 ? '1.0' : '0.4'}"/>
          <text x="800" y="130" font-size="14" font-weight="700" fill="#F9A8D4" text-anchor="middle">Autonomous</text>
        </g>

        <!-- Comparative Spec & Benchmark Bars (Y: 225) -->
        <g transform="translate(36, 225)">
          <rect width="888" height="460" rx="20" fill="#150B1E" stroke="#3B1842" stroke-width="1.5"/>
          <text x="32" y="45" font-size="22" font-weight="800" fill="#FFFFFF">Head-to-Head Benchmark Metrics</text>

          <!-- Metric 1: Reasoning Score -->
          <g transform="translate(32, 75)">
            <text x="0" y="24" font-size="18" font-weight="700" fill="#E2E8F0">MMLU-Pro Accuracy</text>
            <rect x="0" y="36" width="824" height="28" rx="8" fill="#241233"/>
            <rect x="0" y="36" width="${barW1.toFixed(1)}" height="28" rx="8" fill="url(#purpleGrad)"/>
            <text x="${(barW1 + 15).toFixed(1)}" y="57" font-size="18" font-weight="900" fill="#F472B6">89.4%</text>
          </g>

          <!-- Metric 2: Speed / Latency -->
          <g transform="translate(32, 185)">
            <text x="0" y="24" font-size="18" font-weight="700" fill="#E2E8F0">Inference Throughput</text>
            <rect x="0" y="36" width="824" height="28" rx="8" fill="#241233"/>
            <rect x="0" y="36" width="${barW3.toFixed(1)}" height="28" rx="8" fill="url(#cyanGrad)"/>
            <text x="${(barW3 + 15).toFixed(1)}" y="57" font-size="18" font-weight="900" fill="#38BDF8">164 tok/s</text>
          </g>

          <!-- Metric 3: Context Retention -->
          <g transform="translate(32, 295)">
            <text x="0" y="24" font-size="18" font-weight="700" fill="#E2E8F0">Active Context Window</text>
            <rect x="0" y="36" width="824" height="28" rx="8" fill="#241233"/>
            <rect x="0" y="36" width="${barW2.toFixed(1)}" height="28" rx="8" fill="url(#emeraldGrad)"/>
            <text x="${(barW2 + 15).toFixed(1)}" y="57" font-size="18" font-weight="900" fill="#34D399">128K tokens</text>
          </g>
        </g>

        <!-- Verified Community Source Badges (Y: 710) -->
        <g transform="translate(36, 710)">
          <rect width="888" height="150" rx="20" fill="#180D22" stroke="#3B1842" stroke-width="1.5"/>
          <text x="32" y="40" font-size="20" font-weight="800" fill="#94A3B8">VERIFIED COMMUNITY ATTRIBUTION</text>
          
          <g transform="translate(32, 60)">
            <rect width="250" height="60" rx="14" fill="#2A1438" stroke="#EC4899" stroke-width="1.5"/>
            <text x="125" y="36" font-size="18" font-weight="800" fill="#F472B6" text-anchor="middle">▲ HN 890+ Points</text>

            <rect x="270" width="250" height="60" rx="14" fill="#1E1235" stroke="#8B5CF6" stroke-width="1.5"/>
            <text x="395" y="36" font-size="18" font-weight="800" fill="#C084FC" text-anchor="middle">⭐ 24.5k GitHub Stars</text>

            <rect x="540" width="280" height="60" rx="14" fill="#0F2438" stroke="#06B6D4" stroke-width="1.5"/>
            <text x="680" y="36" font-size="18" font-weight="800" fill="#38BDF8" text-anchor="middle">🚀 Top 1% Growth</text>
          </g>
        </g>

        <!-- Summary Takeaway Card (Y: 885) -->
        <g transform="translate(36, 885)">
          <rect width="888" height="130" rx="18" fill="#150B1E" stroke="#EC4899" stroke-width="1.5"/>
          <text x="32" y="45" font-size="22" font-weight="800" fill="#EC4899">📈 Trend Analysis</text>
          <text x="32" y="80" font-size="18" fill="#F8FAFC">Leading the open-weight reasoning race with exceptional memory efficiency.</text>
        </g>
      </g>
    `;
  }

  // =========================================================================
  // PRESENTATION STYLE 3: CLEAN EDITORIAL EXPLAINER
  // (Editorial Typography, Numbered Concept Cards 01-03, Mental Models)
  // =========================================================================
  private renderCleanEditorialTemplate(ctx: FrameContext): string {
    const { globalTime, headline, subtitle } = ctx;
    const progress = FrameAnimationEngine.clamp(globalTime / 3.5, 0, 1);

    return `
      <!-- Header -->
      <g transform="translate(60, 200)">
        <text x="0" y="0" font-size="48" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(headline || 'EDITORIAL EXPLAINER')}</text>
        <text x="0" y="46" font-size="24" font-weight="700" fill="#F59E0B">${escapeXml(subtitle || 'Mental Models • Architectural Principles')}</text>
      </g>

      <!-- Editorial Card Container -->
      <g transform="translate(60, 275)">
        <rect width="960" height="1140" rx="24" fill="#0C101D" stroke="#1E293B" stroke-width="2"/>

        <!-- Card 01: Core Premise -->
        <g transform="translate(36, 40)">
          <rect width="888" height="230" rx="20" fill="#111827" stroke="#F59E0B" stroke-width="1.5"/>
          <rect x="28" y="28" width="60" height="40" rx="10" fill="#78350F"/>
          <text x="58" y="55" font-size="22" font-weight="900" fill="#FBBF24" text-anchor="middle">01</text>
          
          <text x="105" y="55" font-size="24" font-weight="800" fill="#FFFFFF">The Architectural Foundation</text>
          <text x="28" y="115" font-size="19" fill="#CBD5E1">Instead of generating tokens sequentially without planning,</text>
          <text x="28" y="148" font-size="19" fill="#CBD5E1">reasoning models perform dynamic search and self-verification.</text>
          <text x="28" y="190" font-size="16" font-weight="700" fill="#F59E0B">✦ Step-by-step internal deliberation before final answer</text>
        </g>

        <!-- Card 02: Mental Model -->
        <g transform="translate(36, 295)" opacity="${progress > 0.3 ? '1.0' : '0.4'}">
          <rect width="888" height="250" rx="20" fill="#111827" stroke="#3B82F6" stroke-width="1.5"/>
          <rect x="28" y="28" width="60" height="40" rx="10" fill="#1E3A8A"/>
          <text x="58" y="55" font-size="22" font-weight="900" fill="#60A5FA" text-anchor="middle">02</text>
          
          <text x="105" y="55" font-size="24" font-weight="800" fill="#FFFFFF">How the Mental Model Operates</text>
          
          <!-- Flow Diagram -->
          <g transform="translate(28, 95)">
            <rect width="240" height="60" rx="12" fill="#1E293B" stroke="#475569"/>
            <text x="120" y="36" font-size="17" font-weight="700" fill="#F8FAFC" text-anchor="middle">1. Intent Parse</text>

            <text x="255" y="38" font-size="22" fill="#60A5FA">→</text>

            <rect x="285" width="240" height="60" rx="12" fill="#1E293B" stroke="#3B82F6"/>
            <text x="405" y="36" font-size="17" font-weight="700" fill="#60A5FA" text-anchor="middle">2. Search Graph</text>

            <text x="540" y="38" font-size="22" fill="#60A5FA">→</text>

            <rect x="570" width="240" height="60" rx="12" fill="#1E293B" stroke="#10B981"/>
            <text x="690" y="36" font-size="17" font-weight="700" fill="#34D399" text-anchor="middle">3. Verified Result</text>
          </g>

          <text x="28" y="210" font-size="16" font-weight="700" fill="#60A5FA">✦ Backtracking error correction eliminates hallucinations</text>
        </g>

        <!-- Card 03: Practical Utility -->
        <g transform="translate(36, 570)" opacity="${progress > 0.6 ? '1.0' : '0.4'}">
          <rect width="888" height="230" rx="20" fill="#111827" stroke="#10B981" stroke-width="1.5"/>
          <rect x="28" y="28" width="60" height="40" rx="10" fill="#064E3B"/>
          <text x="58" y="55" font-size="22" font-weight="900" fill="#34D399" text-anchor="middle">03</text>
          
          <text x="105" y="55" font-size="24" font-weight="800" fill="#FFFFFF">Real-World Practical Impact</text>
          <text x="28" y="115" font-size="19" fill="#CBD5E1">Transforms raw knowledge lookup into deterministic execution.</text>
          <text x="28" y="148" font-size="19" fill="#CBD5E1">Autonomous workflows solve engineering tasks end-to-end.</text>
          <text x="28" y="190" font-size="16" font-weight="700" fill="#34D399">✦ 10x reliability in complex multi-step reasoning</text>
        </g>

        <!-- Summary Strip -->
        <g transform="translate(36, 830)">
          <rect width="888" height="150" rx="20" fill="#0A0F1D" stroke="#F59E0B" stroke-width="1.5"/>
          <text x="32" y="45" font-size="22" font-weight="800" fill="#F59E0B">💡 Editorial Takeaway</text>
          <text x="32" y="85" font-size="19" fill="#F8FAFC">Reasoning models don't just predict text—they verify logic before responding.</text>
        </g>
      </g>
    `;
  }

  // =========================================================================
  // PRESENTATION STYLE 4: CINEMATIC TECH STORYTELLING
  // (Atmospheric Dark Slate, Energy Glows, Neural Pulse Diagrams, Macro Vision)
  // =========================================================================
  private renderCinematicStorytellingTemplate(ctx: FrameContext): string {
    switch (ctx.sceneIndex % 4) {
      case 0:
        return this.renderScene1Motion(ctx);
      case 1:
        return this.renderScene2Motion(ctx);
      case 2:
        return this.renderScene3Motion(ctx);
      case 3:
      default:
        return this.renderScene4Motion(ctx);
    }
  }

  // =========================================================================
  // TEMPLATE 12: CINEMATIC EXPLAINER (Multi-Scene High-Concept Storytelling)
  // =========================================================================
  private renderScene1Motion(ctx: FrameContext): string {
    const { sceneElapsed } = ctx;
    const panelProgress = FrameAnimationEngine.clamp(sceneElapsed / 1.2, 0, 1);
    const panelY = 400 + (1 - FrameAnimationEngine.spring(panelProgress)) * 120;
    const panelOpacity = FrameAnimationEngine.clamp(sceneElapsed / 0.8, 0, 1);

    const cursorProgress = FrameAnimationEngine.clamp((sceneElapsed - 1.5) / 1.8, 0, 1);
    const cursorX = 140 + FrameAnimationEngine.easeInOutCubic(cursorProgress) * 380;
    const cursorY = panelY + 130 + Math.sin(cursorProgress * Math.PI) * 20;

    const typingProgress = FrameAnimationEngine.clamp((sceneElapsed - 2.5) / 1.8, 0, 1);
    const fullText = "Summarize document and build zero-code canvas...";
    const currentChars = Math.floor(typingProgress * fullText.length);
    const typedText = fullText.substring(0, currentChars);

    const aiProgress = FrameAnimationEngine.clamp((sceneElapsed - 3.8) / 1.5, 0, 1);
    const resultOpacity = FrameAnimationEngine.clamp((sceneElapsed - 4.8) / 1.2, 0, 1);
    const cardScale = 0.95 + 0.05 * FrameAnimationEngine.spring(resultOpacity);

    const displayHeadline = escapeXml(ctx.headline || 'NEXT-GEN AI WORKFLOW');
    const displaySubtitle = escapeXml(ctx.subtitle || 'Everyday Productivity • Zero Setup');

    return `
      <g transform="translate(60, 240)">
        <text x="0" y="0" font-size="52" font-weight="900" fill="#F8FAFC" letter-spacing="-0.5">${displayHeadline}</text>
        <text x="0" y="52" font-size="28" font-weight="500" fill="#9BB0A5">${displaySubtitle}</text>
      </g>

      <g transform="translate(60, ${panelY.toFixed(1)})" opacity="${panelOpacity.toFixed(3)}">
        <rect width="960" height="780" rx="28" fill="rgba(12,17,25,0.88)" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
        
        <circle cx="36" cy="36" r="8" fill="#EF4444"/>
        <circle cx="64" cy="36" r="8" fill="#F59E0B"/>
        <circle cx="92" cy="36" r="8" fill="#10B981"/>
        <text x="480" y="42" font-size="18" font-weight="600" fill="#94A3B8" text-anchor="middle">workspace.flash.ai — high precision canvas</text>

        <g transform="translate(40, 80)">
          <rect width="880" height="84" rx="20" fill="rgba(20,28,40,0.9)" stroke="${typingProgress > 0 ? '#34D399' : 'rgba(255,255,255,0.1)'}" stroke-width="2"/>
          <circle cx="44" cy="42" r="16" fill="rgba(16,185,129,0.2)"/>
          <text x="44" y="48" font-size="20" fill="#34D399" text-anchor="middle">•</text>
          <text x="80" y="49" font-size="23" font-weight="500" fill="${typingProgress > 0 ? '#F8FAFC' : '#94A3B8'}">
            ${escapeXml(typedText)}<tspan fill="#34D399" opacity="${(Math.sin(sceneElapsed * 8) > 0 ? 1 : 0)}">|</tspan>
          </text>
        </g>

        ${aiProgress > 0 && aiProgress < 1 ? `
          <g transform="translate(40, 190)">
            <rect width="${(880 * aiProgress).toFixed(1)}" height="6" rx="3" fill="url(#sageGrad)"/>
            <text x="440" y="32" font-size="17" font-weight="600" fill="#A7F3D0" text-anchor="middle">Synthesizing workspace canvas &amp; verified actions...</text>
          </g>
        ` : ''}

        <g transform="translate(40, 220) scale(${cardScale.toFixed(3)})" opacity="${resultOpacity.toFixed(3)}">
          <rect x="0" y="0" width="425" height="240" rx="20" fill="rgba(18,25,38,0.7)" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
          <text x="24" y="42" font-size="19" font-weight="700" fill="#A7F3D0">📄 Executive Brief</text>
          <text x="24" y="80" font-size="17" fill="#E2E8F0">• 42-page brief distilled in 1.2s</text>
          <text x="24" y="115" font-size="17" fill="#E2E8F0">• Key action items extracted</text>
          <text x="24" y="150" font-size="17" fill="#E2E8F0">• Team assigned automatically</text>
          <rect x="24" y="180" width="140" height="34" rx="17" fill="rgba(16,185,129,0.18)"/>
          <text x="94" y="202" font-size="15" font-weight="700" fill="#34D399" text-anchor="middle">Ready to Share</text>

          <rect x="455" y="0" width="425" height="240" rx="20" fill="rgba(18,25,38,0.7)" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
          <text x="480" y="42" font-size="19" font-weight="700" fill="#34D399">⚡ Drag-and-Drop Nodes</text>
          <circle cx="500" cy="100" r="22" fill="#047857"/>
          <text x="500" y="106" font-size="15" fill="#FFF" text-anchor="middle">DOC</text>
          <line x1="522" y1="100" x2="630" y2="100" stroke="#34D399" stroke-width="3" stroke-dasharray="6,4"/>
          <circle cx="652" cy="100" r="22" fill="#059669"/>
          <text x="652" y="106" font-size="15" fill="#FFF" text-anchor="middle">AI</text>
          <line x1="674" y1="100" x2="780" y2="100" stroke="#10B981" stroke-width="3"/>
          <circle cx="802" cy="100" r="22" fill="#10B981"/>
          <text x="802" y="106" font-size="15" fill="#FFF" text-anchor="middle">OUT</text>
          <text x="480" y="180" font-size="17" fill="#E2E8F0">Instant Pipeline: Zero Code</text>
        </g>

        <g transform="translate(40, 500)" opacity="${resultOpacity.toFixed(3)}">
          <rect width="880" height="120" rx="20" fill="rgba(16,185,129,0.08)" stroke="#10B981" stroke-width="1.5"/>
          <text x="44" y="52" font-size="24" font-weight="800" fill="#A7F3D0">Instant Frictionless Interaction</text>
          <text x="44" y="90" font-size="18" fill="#9BB0A5">Natural Language • Interactive Canvas • Zero Setup Barrier</text>
        </g>
      </g>

      <g transform="translate(${cursorX.toFixed(1)}, ${cursorY.toFixed(1)})" opacity="${(sceneElapsed < 4.5 ? 0.9 : 0.2)}">
        <path d="M0,0 L0,28 L7,22 L16,38 L22,35 L13,19 L23,19 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>
      </g>
    `;
  }

  private renderScene2Motion(ctx: FrameContext): string {
    const { sceneElapsed } = ctx;
    const shiftProgress = FrameAnimationEngine.clamp((sceneElapsed - 2.8) / 1.8, 0, 1);
    const dividerX = 540 - FrameAnimationEngine.easeInOutCubic(shiftProgress) * 220;
    const nodeProgress = FrameAnimationEngine.clamp((sceneElapsed - 3.8) / 2.0, 0, 1);

    const displayHeadline = escapeXml(ctx.headline || 'CORE ARCHITECTURE BREAKDOWN');
    const displaySubtitle = escapeXml(ctx.subtitle || 'Natural Language • Drag & Drop Context • Visual Execution');

    return `
      <g transform="translate(60, 240)">
        <text x="0" y="0" font-size="52" font-weight="900" fill="#F8FAFC" letter-spacing="-0.5">${displayHeadline}</text>
        <text x="0" y="52" font-size="28" font-weight="500" fill="#9BB0A5">${displaySubtitle}</text>
      </g>

      <g transform="translate(60, 400)">
        <rect width="960" height="820" rx="28" fill="#0E131E" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>

        <!-- LEFT PANEL: Complex Friction -->
        <g clip-path="url(#leftClip)">
          <clipPath id="leftClip">
            <rect x="0" y="0" width="${(dividerX - 60).toFixed(1)}" height="820" rx="28"/>
          </clipPath>
          <rect width="960" height="820" fill="rgba(239,68,68,0.04)"/>
          <text x="36" y="60" font-size="20" font-weight="800" fill="#F87171" letter-spacing="1">PREVIOUS: MANUAL FRICTION</text>
          
          <g transform="translate(36, 100)">
            <rect width="400" height="240" rx="14" fill="rgba(0,0,0,0.5)" stroke="rgba(239,68,68,0.2)"/>
            <text x="20" y="38" font-size="15" fill="#EF4444" font-family="monospace">&lt;system_instruction&gt;</text>
            <text x="20" y="70" font-size="14" fill="#94A3B8" font-family="monospace">You are a deterministic engine.</text>
            <text x="20" y="98" font-size="14" fill="#94A3B8" font-family="monospace">Do NOT hallucinate [temp=0.0]</text>
            <text x="20" y="126" font-size="14" fill="#94A3B8" font-family="monospace">Format: JSONSchema Strict</text>
            <text x="20" y="154" font-size="14" fill="#F87171" font-family="monospace">Regex: ^[A-Z0-9_]{32}$</text>
            <text x="20" y="190" font-size="14" fill="#EF4444" font-family="monospace">&lt;/system_instruction&gt;</text>
          </g>

          <g transform="translate(36, 380)">
            <rect width="400" height="120" rx="14" fill="rgba(239,68,68,0.1)"/>
            <text x="20" y="46" font-size="18" font-weight="700" fill="#FCA5A5">⚠️ High Cognitive Friction</text>
            <text x="20" y="80" font-size="15" fill="#F87171">Requires prompt syntax &amp; rules</text>
          </g>
        </g>

        <!-- RIGHT PANEL: Modern Visual Canvas -->
        <g clip-path="url(#rightClip)">
          <clipPath id="rightClip">
            <rect x="${(dividerX - 60).toFixed(1)}" y="0" width="${(1020 - dividerX).toFixed(1)}" height="820" rx="28"/>
          </clipPath>
          <rect width="960" height="820" fill="rgba(16,185,129,0.06)"/>
          <text x="${(dividerX - 30).toFixed(1)}" y="60" font-size="20" font-weight="800" fill="#A7F3D0" letter-spacing="1">NEW: VISUAL CANVAS</text>

          <g transform="translate(340, 120)">
            <path d="M 60 120 C 180 60, 240 220, 380 140" fill="none" stroke="#34D399" stroke-width="4" stroke-dasharray="8,6"/>
            <circle cx="${60 + nodeProgress * 320}" cy="${120 + Math.sin(nodeProgress * Math.PI) * 40}" r="8" fill="#34D399"/>

            <g transform="translate(0, 70)">
              <rect width="130" height="100" rx="18" fill="#141E2D" stroke="#34D399" stroke-width="2"/>
              <text x="65" y="44" font-size="28" text-anchor="middle">📁</text>
              <text x="65" y="76" font-size="15" font-weight="700" fill="#FFF" text-anchor="middle">Raw Input</text>
            </g>

            <g transform="translate(200, 180) scale(${1 + 0.05 * Math.sin(sceneElapsed * 4)})">
              <rect width="130" height="100" rx="18" fill="#065F46" stroke="#34D399" stroke-width="2"/>
              <text x="65" y="44" font-size="28" text-anchor="middle">⚡</text>
              <text x="65" y="76" font-size="15" font-weight="700" fill="#FFF" text-anchor="middle">Auto-Flow</text>
            </g>

            <g transform="translate(360, 90)">
              <rect width="130" height="100" rx="18" fill="#047857" stroke="#A7F3D0" stroke-width="2"/>
              <text x="65" y="44" font-size="28" text-anchor="middle">📊</text>
              <text x="65" y="76" font-size="15" font-weight="700" fill="#FFF" text-anchor="middle">Live Result</text>
            </g>
          </g>

          <g transform="translate(${(dividerX - 20).toFixed(1)}, 440)">
            <rect width="520" height="90" rx="18" fill="rgba(20,28,40,0.85)" stroke="rgba(167,243,208,0.3)" stroke-width="1.5"/>
            <text x="28" y="38" font-size="19" font-weight="700" fill="#A7F3D0">✨ Natural Language Intent</text>
            <text x="28" y="68" font-size="16" fill="#9BB0A5">Just speak or drop files — zero coding required</text>
          </g>
        </g>

        <!-- MOVING NEON SPLIT DIVIDER BAR -->
        <g transform="translate(${(dividerX - 60).toFixed(1)}, 0)">
          <line x1="0" y1="0" x2="0" y2="820" stroke="#34D399" stroke-width="4"/>
          <circle cx="0" cy="410" r="22" fill="#047857" stroke="#A7F3D0" stroke-width="3"/>
          <text x="0" y="416" font-size="18" fill="#FFFFFF" text-anchor="middle" font-weight="900">⮂ ⮃</text>
        </g>
      </g>
    `;
  }

  private renderScene3Motion(ctx: FrameContext): string {
    const { sceneElapsed } = ctx;
    let activeTab = 0;
    let tabProgress = 0;
    if (sceneElapsed < 2.4) {
      activeTab = 0;
      tabProgress = sceneElapsed / 2.4;
    } else if (sceneElapsed < 4.8) {
      activeTab = 1;
      tabProgress = (sceneElapsed - 2.4) / 2.4;
    } else {
      activeTab = 2;
      tabProgress = (sceneElapsed - 4.8) / 2.4;
    }

    const displayHeadline = escapeXml(ctx.headline || 'HIGH-EFFICIENCY CAPABILITIES');
    const displaySubtitle = escapeXml(ctx.subtitle || 'Instant Execution • Auto-Structuring • Clean Output');

    return `
      <g transform="translate(60, 240)">
        <text x="0" y="0" font-size="50" font-weight="900" fill="#F8FAFC" letter-spacing="-0.5">${displayHeadline}</text>
        <text x="0" y="52" font-size="28" font-weight="500" fill="#9BB0A5">${displaySubtitle}</text>
      </g>

      <g transform="translate(60, 360)">
        <rect width="960" height="60" rx="20" fill="rgba(15,23,42,0.8)" stroke="rgba(255,255,255,0.08)"/>
        
        <rect x="10" y="8" width="300" height="44" rx="14" fill="${activeTab === 0 ? 'url(#cyanGrad)' : 'transparent'}"/>
        <text x="160" y="36" font-size="18" font-weight="700" fill="${activeTab === 0 ? '#FFF' : '#64748B'}" text-anchor="middle">1. Documents</text>
        
        <rect x="330" y="8" width="300" height="44" rx="14" fill="${activeTab === 1 ? 'url(#emeraldGrad)' : 'transparent'}"/>
        <text x="480" y="36" font-size="18" font-weight="700" fill="${activeTab === 1 ? '#FFF' : '#64748B'}" text-anchor="middle">2. Spreadsheets</text>
        
        <rect x="650" y="8" width="300" height="44" rx="14" fill="${activeTab === 2 ? 'url(#purpleGrad)' : 'transparent'}"/>
        <text x="800" y="36" font-size="18" font-weight="700" fill="${activeTab === 2 ? '#FFF' : '#64748B'}" text-anchor="middle">3. Clean Code</text>
      </g>

      <g transform="translate(60, 450)">
        <rect width="960" height="780" rx="28" fill="#0F172A" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>

        ${activeTab === 0 ? this.renderDocSubscene(tabProgress) : ''}
        ${activeTab === 1 ? this.renderSheetSubscene(tabProgress) : ''}
        ${activeTab === 2 ? this.renderCodeSubscene(tabProgress) : ''}
      </g>
    `;
  }

  private renderDocSubscene(progress: number): string {
    const scanLineY = 80 + progress * 480;
    const bulletsCount = Math.floor(progress * 4);

    return `
      <g transform="translate(40, 40)">
        <text x="0" y="40" font-size="28" font-weight="800" fill="#38BDF8">📄 Document Summarization Engine</text>
        <text x="0" y="75" font-size="18" fill="#94A3B8">Laser scan distilling 60 pages into key action pillars</text>

        <rect x="0" y="110" width="880" height="560" rx="20" fill="rgba(30,41,59,0.5)" stroke="rgba(255,255,255,0.06)"/>
        <line x1="20" y1="${scanLineY.toFixed(1)}" x2="860" y2="${scanLineY.toFixed(1)}" stroke="#06B6D4" stroke-width="3"/>

        <g transform="translate(40, 160)">
          ${bulletsCount >= 1 ? `
            <g transform="translate(0, 0)">
              <circle cx="16" cy="20" r="14" fill="#06B6D4"/>
              <text x="16" y="26" font-size="16" fill="#FFF" text-anchor="middle">•</text>
              <text x="44" y="27" font-size="21" font-weight="700" fill="#FFF">Revenue surged +142% year-over-year</text>
            </g>
          ` : ''}

          ${bulletsCount >= 2 ? `
            <g transform="translate(0, 90)">
              <circle cx="16" cy="20" r="14" fill="#06B6D4"/>
              <text x="16" y="26" font-size="16" fill="#FFF" text-anchor="middle">•</text>
              <text x="44" y="27" font-size="21" font-weight="700" fill="#FFF">Automated zero-setup workflow adopted across team</text>
            </g>
          ` : ''}

          ${bulletsCount >= 3 ? `
            <g transform="translate(0, 180)">
              <circle cx="16" cy="20" r="14" fill="#06B6D4"/>
              <text x="16" y="26" font-size="16" fill="#FFF" text-anchor="middle">•</text>
              <text x="44" y="27" font-size="21" font-weight="700" fill="#FFF">Saved 14.5 hours per knowledge worker weekly</text>
            </g>
          ` : ''}

          ${bulletsCount >= 4 ? `
            <g transform="translate(0, 270)">
              <rect width="800" height="90" rx="16" fill="rgba(6,182,212,0.15)" stroke="#06B6D4"/>
              <text x="24" y="52" font-size="22" font-weight="800" fill="#38BDF8">⚡ Full Document Intelligence Ready</text>
            </g>
          ` : ''}
        </g>
      </g>
    `;
  }

  private renderSheetSubscene(progress: number): string {
    const isTransformed = progress > 0.45;

    return `
      <g transform="translate(40, 40)">
        <text x="0" y="40" font-size="28" font-weight="800" fill="#34D399">📊 Spreadsheet Auto-Structuring</text>
        <text x="0" y="75" font-size="18" fill="#94A3B8">Messy unformatted rows → Clean categorized database</text>

        <g transform="translate(0, 110)">
          <rect width="880" height="560" rx="20" fill="rgba(30,41,59,0.5)" stroke="rgba(255,255,255,0.06)"/>

          ${!isTransformed ? `
            <g transform="translate(40, 50)">
              <text x="0" y="30" font-size="18" fill="#EF4444" font-family="monospace">RAW: "user_901, john, 499.00 USD, 12-04-2026, UNPAID"</text>
              <text x="0" y="80" font-size="18" fill="#EF4444" font-family="monospace">RAW: "NaN, sarah, 1200.0, Apr 12, COMPLETE, err:null"</text>
              <text x="0" y="130" font-size="18" fill="#EF4444" font-family="monospace">RAW: "904_alpha, alex, $89.50, pending_review, n/a"</text>
              <rect x="0" y="200" width="800" height="60" rx="14" fill="rgba(239,68,68,0.1)"/>
              <text x="400" y="238" font-size="18" font-weight="700" fill="#FCA5A5" text-anchor="middle">Structuring columns &amp; normalizing schema...</text>
            </g>
          ` : `
            <g transform="translate(40, 50)">
              <rect width="800" height="50" rx="10" fill="#065F46"/>
              <text x="30" y="32" font-size="17" font-weight="700" fill="#FFF">USER</text>
              <text x="250" y="32" font-size="17" font-weight="700" fill="#FFF">REVENUE</text>
              <text x="450" y="32" font-size="17" font-weight="700" fill="#FFF">DATE</text>
              <text x="650" y="32" font-size="17" font-weight="700" fill="#FFF">STATUS</text>

              <g transform="translate(0, 70)">
                <rect width="800" height="60" rx="10" fill="rgba(16,185,129,0.08)"/>
                <text x="30" y="38" font-size="18" font-weight="600" fill="#FFF">John Doe</text>
                <text x="250" y="38" font-size="18" font-weight="700" fill="#34D399">$499.00</text>
                <text x="450" y="38" font-size="18" fill="#CBD5E1">Apr 12, 2026</text>
                <text x="650" y="38" font-size="18" font-weight="700" fill="#34D399">Active</text>
              </g>

              <g transform="translate(0, 150)">
                <rect width="800" height="60" rx="10" fill="rgba(16,185,129,0.08)"/>
                <text x="30" y="38" font-size="18" font-weight="600" fill="#FFF">Sarah Connor</text>
                <text x="250" y="38" font-size="18" font-weight="700" fill="#34D399">$1,200.00</text>
                <text x="450" y="38" font-size="18" fill="#CBD5E1">Apr 12, 2026</text>
                <text x="650" y="38" font-size="18" font-weight="700" fill="#34D399">Active</text>
              </g>

              <g transform="translate(0, 230)">
                <rect width="800" height="60" rx="10" fill="rgba(16,185,129,0.08)"/>
                <text x="30" y="38" font-size="18" font-weight="600" fill="#FFF">Alex Rivers</text>
                <text x="250" y="38" font-size="18" font-weight="700" fill="#34D399">$89.50</text>
                <text x="450" y="38" font-size="18" fill="#CBD5E1">Apr 12, 2026</text>
                <text x="650" y="38" font-size="18" font-weight="700" fill="#34D399">Active</text>
              </g>
            </g>
          `}
        </g>
      </g>
    `;
  }

  private renderCodeSubscene(progress: number): string {
    const codeLines = [
      "export async function processWorkflow(data: RawContext) {",
      "  const summary = await ai.summarize(data.documents);",
      "  const table = await ai.structureData(data.spreadsheet);",
      "  return { summary, table, status: 'complete' };",
      "}"
    ];
    const visibleLines = Math.min(codeLines.length, Math.floor(progress * 6));

    return `
      <g transform="translate(40, 40)">
        <text x="0" y="40" font-size="28" font-weight="800" fill="#C084FC">💻 Clean Code Generation</text>
        <text x="0" y="75" font-size="18" fill="#94A3B8">Natural request → Production TypeScript function</text>

        <g transform="translate(0, 110)">
          <rect width="880" height="560" rx="20" fill="rgba(15,23,42,0.95)" stroke="rgba(192,132,252,0.3)" stroke-width="1.5"/>
          
          <g transform="translate(40, 50)" font-family="monospace">
            ${codeLines.slice(0, visibleLines).map((line, idx) => `
              <text x="0" y="${idx * 45 + 30}" font-size="20" fill="${idx === 0 || idx === 4 ? '#C084FC' : '#E2E8F0'}">${line}</text>
            `).join('')}
            ${visibleLines < codeLines.length ? `
              <rect x="${visibleLines * 12 + 20}" y="${visibleLines * 45 + 10}" width="12" height="24" fill="#C084FC"/>
            ` : ''}
          </g>

          ${visibleLines >= 4 ? `
            <g transform="translate(40, 380)">
              <rect width="800" height="80" rx="16" fill="rgba(168,85,247,0.15)" stroke="#A855F7"/>
              <text x="30" y="48" font-size="21" font-weight="700" fill="#E9D5FF">• Zero Configuration • Clean Modern Syntax</text>
            </g>
          ` : ''}
        </g>
      </g>
    `;
  }

  private renderScene4Motion(ctx: FrameContext): string {
    const { sceneElapsed } = ctx;
    const connectProgress = FrameAnimationEngine.clamp(sceneElapsed / 3.0, 0, 1);
    const rotationDeg = (sceneElapsed * 25) % 360;

    const displayHeadline = escapeXml(ctx.headline || 'PRACTICAL AI PRODUCTIVITY');
    const displaySubtitle = escapeXml(ctx.subtitle || 'Directly Inside Everyday Workflows');

    return `
      <g transform="translate(60, 240)">
        <text x="0" y="0" font-size="52" font-weight="900" fill="#F8FAFC" letter-spacing="-0.5">${displayHeadline}</text>
        <text x="0" y="52" font-size="28" font-weight="500" fill="#9BB0A5">${displaySubtitle}</text>
      </g>

      <g transform="translate(60, 400)">
        <rect width="960" height="820" rx="28" fill="#0E131E" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>

        <g stroke-dasharray="10,6">
          <path d="M 200 160 C 350 160, 350 410, 480 410" fill="none" stroke="#06B6D4" stroke-width="4" opacity="${connectProgress.toFixed(2)}"/>
          <path d="M 480 410 C 600 410, 600 160, 760 160" fill="none" stroke="#06B6D4" stroke-width="4" opacity="${connectProgress.toFixed(2)}"/>

          <path d="M 200 410 L 480 410" fill="none" stroke="#10B981" stroke-width="4" opacity="${connectProgress.toFixed(2)}"/>
          <path d="M 480 410 L 760 410" fill="none" stroke="#10B981" stroke-width="4" opacity="${connectProgress.toFixed(2)}"/>

          <path d="M 200 660 C 350 660, 350 410, 480 410" fill="none" stroke="#8B5CF6" stroke-width="4" opacity="${connectProgress.toFixed(2)}"/>
          <path d="M 480 410 C 600 410, 600 660, 760 660" fill="none" stroke="#8B5CF6" stroke-width="4" opacity="${connectProgress.toFixed(2)}"/>
        </g>

        <g transform="translate(100, 110)">
          <rect width="180" height="90" rx="18" fill="#1E293B" stroke="#06B6D4" stroke-width="2"/>
          <text x="90" y="42" font-size="22" font-weight="700" fill="#FFF" text-anchor="middle">📄 Documents</text>
          <text x="90" y="68" font-size="14" fill="#94A3B8" text-anchor="middle">Raw Context</text>
        </g>

        <g transform="translate(100, 365)">
          <rect width="180" height="90" rx="18" fill="#1E293B" stroke="#10B981" stroke-width="2"/>
          <text x="90" y="42" font-size="22" font-weight="700" fill="#FFF" text-anchor="middle">📊 Data Sheets</text>
          <text x="90" y="68" font-size="14" fill="#94A3B8" text-anchor="middle">Unstructured</text>
        </g>

        <g transform="translate(100, 615)">
          <rect width="180" height="90" rx="18" fill="#1E293B" stroke="#8B5CF6" stroke-width="2"/>
          <text x="90" y="42" font-size="22" font-weight="700" fill="#FFF" text-anchor="middle">💬 Natural Text</text>
          <text x="90" y="68" font-size="14" fill="#94A3B8" text-anchor="middle">Plain Language</text>
        </g>

        <g transform="translate(480, 410)">
          <g transform="rotate(${rotationDeg.toFixed(1)})">
            <circle cx="0" cy="0" r="85" fill="none" stroke="url(#cyanGrad)" stroke-width="4" stroke-dasharray="16,10"/>
          </g>
          <circle cx="0" cy="0" r="70" fill="#0A0D14" stroke="#FFFFFF" stroke-width="2"/>
          <text x="0" y="-8" font-size="24" font-weight="900" fill="#38BDF8" text-anchor="middle">FLASH</text>
          <text x="0" y="24" font-size="16" font-weight="700" fill="#FFF" text-anchor="middle">CORE AI</text>
        </g>

        <g transform="translate(680, 110)">
          <rect width="180" height="90" rx="18" fill="#065F46" stroke="#34D399" stroke-width="2"/>
          <text x="90" y="42" font-size="22" font-weight="700" fill="#FFF" text-anchor="middle">⚡ Briefs</text>
          <text x="90" y="68" font-size="14" fill="#A7F3D0" text-anchor="middle">Instant Summary</text>
        </g>

        <g transform="translate(680, 365)">
          <rect width="180" height="90" rx="18" fill="#065F46" stroke="#34D399" stroke-width="2"/>
          <text x="90" y="42" font-size="22" font-weight="700" fill="#FFF" text-anchor="middle">📈 Structured</text>
          <text x="90" y="68" font-size="14" fill="#A7F3D0" text-anchor="middle">Clean Tables</text>
        </g>

        <g transform="translate(680, 615)">
          <rect width="180" height="90" rx="18" fill="#4C1D95" stroke="#C084FC" stroke-width="2"/>
          <text x="90" y="42" font-size="22" font-weight="700" fill="#FFF" text-anchor="middle">💻 Code API</text>
          <text x="90" y="68" font-size="14" fill="#DDD6FE" text-anchor="middle">0-Setup Function</text>
        </g>
      </g>

      <g transform="translate(60, 1260)">
        <rect width="960" height="80" rx="24" fill="rgba(6,182,212,0.15)" stroke="#06B6D4" stroke-width="2"/>
        <text x="480" y="48" font-size="24" font-weight="800" fill="#38BDF8" text-anchor="middle">
          Daily Workflows • Zero Setup • Instant Practical AI
        </text>
      </g>
    `;
  }

  /**
   * Renders dynamic kinetic captions in the safe zone (71-75% Y)
   */
  private renderKineticCaption(globalTime: number, width: number, _height: number): string {
    const currentBeat = this.captionBeats.find(
      b => globalTime >= b.startTime && globalTime <= b.endTime
    );

    if (!currentBeat) return '';

    const words = currentBeat.words;
    const highlightIdx = currentBeat.highlightWordIndex;
    const progress = (globalTime - currentBeat.startTime) / Math.max(0.1, currentBeat.endTime - currentBeat.startTime);
    const popScale = 0.95 + 0.05 * FrameAnimationEngine.easeOutQuad(Math.min(1, progress * 3));

    return `
      <g transform="translate(${width / 2}, 1450) scale(${popScale.toFixed(3)}) translate(${-width / 2}, 0)">
        <rect x="70" y="-40" width="${width - 140}" height="80" rx="26" fill="rgba(6,9,14,0.88)" stroke="rgba(167,243,208,0.25)" stroke-width="1.5"/>
        <text x="${width / 2}" y="14" font-size="34" font-weight="800" text-anchor="middle" letter-spacing="0.5">
          ${words.map((w, idx) => {
            const isHighlight = idx === highlightIdx;
            const fill = isHighlight ? '#A7F3D0' : '#F8FAFC';
            const weight = isHighlight ? '900' : '700';
            return `<tspan fill="${fill}" font-weight="${weight}">${escapeXml(w)} </tspan>`;
          }).join('')}
        </text>
      </g>
    `;
  }
}
