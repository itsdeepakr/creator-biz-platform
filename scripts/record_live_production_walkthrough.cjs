const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = path.join(__dirname, '../production_walkthrough_recording');
const FINAL_VIDEO = path.join(__dirname, '../creator_business_production_master_demo.mp4');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 8 Comprehensive Production Chapters: Mobile Creator + Mobile Business + 6 Real Admin Console Screens
const acts = [
  {
    id: 'act1_mobile_business_app',
    title: 'Chapter 1: Flutter Business Mobile App',
    subtitle: 'Real Mobile App • Campaign Management & Creator Deals',
    deviceMode: 'mobile', // 412x915 mobile viewport
    voiceText: 'We begin with the live Flutter Business Mobile App. Brand representatives manage active campaigns, monitor real-time creator bids, and launch new influencer marketing campaigns with structured deliverable quotas, budget allocations, and milestone escrow funding.',
    url: 'http://localhost:3003',
    setup: async (page) => {
      await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
      await page.goto('http://localhost:3003', { waitUntil: 'networkidle0', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2000));
    },
    updateFrame: async (page, progress) => {
      // Smooth mobile touch interaction simulation
      if (progress < 0.4) {
        // Top view
      } else if (progress < 0.75) {
        const subP = (progress - 0.4) / 0.35;
        await page.mouse.move(206, 600 - subP * 300);
      }
    }
  },
  {
    id: 'act2_mobile_creator_app',
    title: 'Chapter 2: Flutter Creator Mobile App',
    subtitle: 'Real Mobile App • Campaign Feed, Bids & Portfolio',
    deviceMode: 'mobile',
    voiceText: 'Switching to the live Flutter Creator Mobile App, content creators experience an intuitive mobile marketplace. Creators explore campaigns matching their niche, submit competitive bids with delivery timelines, manage active milestone deliverables, and monitor wallet payouts.',
    url: 'http://localhost:3002',
    setup: async (page) => {
      await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
      await page.goto('http://localhost:3002', { waitUntil: 'networkidle0', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2000));
    },
    updateFrame: async (page, progress) => {
      if (progress > 0.4 && progress < 0.75) {
        const subP = (progress - 0.4) / 0.35;
        await page.mouse.move(206, 650 - subP * 250);
      }
    }
  },
  {
    id: 'act3_admin_dashboard',
    title: 'Chapter 3: Admin Operations & Financial KPIs',
    subtitle: 'Production Admin Console • Real-Time GMV & Escrow Metrics',
    deviceMode: 'desktop', // 1920x1080
    voiceText: 'On the production Next.js Admin Console, platform directors access the executive operations dashboard. Real-time telemetry tracks gross merchandise value exceeding eighteen million rupees, active escrow balances, monthly revenue trends, and platform settlement throughput.',
    url: 'http://localhost:3001/dashboard',
    setup: async (page) => {
      await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
      await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1500));
    },
    updateFrame: async (page, progress) => {
      let scrollY = 0;
      let cursorX = 500;
      let cursorY = 280;
      if (progress < 0.35) {
        scrollY = 0;
        cursorX = 400 + progress * 200;
        cursorY = 280;
      } else if (progress < 0.75) {
        const subP = (progress - 0.35) / 0.4;
        scrollY = subP * 420;
        cursorX = 850;
        cursorY = 420;
      } else {
        const subP = (progress - 0.75) / 0.25;
        scrollY = 420 * (1 - subP);
        cursorX = 500;
        cursorY = 300;
      }
      await page.evaluate((sY, cX, cY) => {
        window.scrollTo({ top: sY, behavior: 'instant' });
        const cur = document.getElementById('demo-video-cursor');
        if (cur) { cur.style.left = `${cX}px`; cur.style.top = `${cY}px`; }
      }, scrollY, cursorX, cursorY);
    }
  },
  {
    id: 'act4_admin_verifications',
    title: 'Chapter 4: KYC & Identity Verification Queue',
    subtitle: 'Compliance Portal • PAN, Aadhaar & GSTIN Verification',
    deviceMode: 'desktop',
    voiceText: 'Compliance officers utilize the dedicated KYC Verification Queue to inspect government identity documents. The system validates PAN number formats, Aadhaar records, and business GST registration certificates, allowing one-click verification and status auditing.',
    url: 'http://localhost:3001/verifications',
    setup: async (page) => {
      await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
      await page.goto('http://localhost:3001/verifications', { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1500));
    },
    updateFrame: async (page, progress) => {
      let scrollY = 0;
      let cursorX = 450;
      let cursorY = 250;
      if (progress < 0.35) {
        scrollY = 0;
        cursorX = 450 + progress * 150;
        cursorY = 250;
      } else if (progress < 0.75) {
        const subP = (progress - 0.35) / 0.4;
        scrollY = subP * 350;
        cursorX = 920;
        cursorY = 400;
      } else {
        const subP = (progress - 0.75) / 0.25;
        scrollY = 350 * (1 - subP);
        cursorX = 500;
        cursorY = 260;
      }
      await page.evaluate((sY, cX, cY) => {
        window.scrollTo({ top: sY, behavior: 'instant' });
        const cur = document.getElementById('demo-video-cursor');
        if (cur) { cur.style.left = `${cX}px`; cur.style.top = `${cY}px`; }
      }, scrollY, cursorX, cursorY);
    }
  },
  {
    id: 'act5_admin_campaigns',
    title: 'Chapter 5: Campaign Moderation & Directory',
    subtitle: 'Marketplace Operations • Campaign Compliance & Featured Spotlight',
    deviceMode: 'desktop',
    voiceText: 'In the Campaign Moderation Directory, administrators oversee all active brand campaigns across India. Admins can audit deliverables, review target creator categories, toggle featured spotlights, and pause or activate campaigns in real time.',
    url: 'http://localhost:3001/campaigns',
    setup: async (page) => {
      await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
      await page.goto('http://localhost:3001/campaigns', { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1500));
    },
    updateFrame: async (page, progress) => {
      let scrollY = 0;
      let cursorX = 500;
      let cursorY = 280;
      if (progress < 0.35) {
        scrollY = 0;
        cursorX = 500 + progress * 120;
        cursorY = 280;
      } else if (progress < 0.75) {
        const subP = (progress - 0.35) / 0.4;
        scrollY = subP * 380;
        cursorX = 850;
        cursorY = 420;
      } else {
        const subP = (progress - 0.75) / 0.25;
        scrollY = 380 * (1 - subP);
        cursorX = 500;
        cursorY = 300;
      }
      await page.evaluate((sY, cX, cY) => {
        window.scrollTo({ top: sY, behavior: 'instant' });
        const cur = document.getElementById('demo-video-cursor');
        if (cur) { cur.style.left = `${cX}px`; cur.style.top = `${cY}px`; }
      }, scrollY, cursorX, cursorY);
    }
  },
  {
    id: 'act6_admin_disputes',
    title: 'Chapter 6: Dispute Arbitration & Split Settlement',
    subtitle: 'Arbitration Dossier • Chat Audit & Escrow Settlement',
    deviceMode: 'desktop',
    voiceText: 'When collaboration disagreements arise, platform adjudicators open the comprehensive Dispute Resolution Dossier. Officers inspect immutable communication transcripts, evaluate creative evidence, and calculate binding split settlements to disburse escrow funds fairly.',
    url: 'http://localhost:3001/disputes/disp-1/',
    setup: async (page) => {
      await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
      await page.goto('http://localhost:3001/disputes/disp-1/', { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1500));
    },
    updateFrame: async (page, progress) => {
      let scrollY = 0;
      let cursorX = 600;
      let cursorY = 280;
      if (progress < 0.35) {
        scrollY = 0;
        cursorX = 600 + progress * 100;
        cursorY = 280;
      } else if (progress < 0.75) {
        const subP = (progress - 0.35) / 0.4;
        scrollY = subP * 420;
        cursorX = 880;
        cursorY = 450;
      } else {
        const subP = (progress - 0.75) / 0.25;
        scrollY = 420 * (1 - subP);
        cursorX = 600;
        cursorY = 320;
      }
      await page.evaluate((sY, cX, cY) => {
        window.scrollTo({ top: sY, behavior: 'instant' });
        const cur = document.getElementById('demo-video-cursor');
        if (cur) { cur.style.left = `${cX}px`; cur.style.top = `${cY}px`; }
      }, scrollY, cursorX, cursorY);
    }
  },
  {
    id: 'act7_admin_payments',
    title: 'Chapter 7: Razorpay Escrow Ledger & Payouts',
    subtitle: 'Financial Ledger • Escrow Custody & Platform Revenue',
    deviceMode: 'desktop',
    voiceText: 'The Payments and Escrow Ledger provides complete financial transparency. Administrators audit locked escrow balances, track Razorpay payment identifiers, monitor ten percent platform fee collections, and export verified ledger data.',
    url: 'http://localhost:3001/payments',
    setup: async (page) => {
      await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
      await page.goto('http://localhost:3001/payments', { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1500));
    },
    updateFrame: async (page, progress) => {
      let scrollY = 0;
      let cursorX = 450;
      let cursorY = 280;
      if (progress < 0.35) {
        scrollY = 0;
        cursorX = 450 + progress * 150;
        cursorY = 280;
      } else if (progress < 0.75) {
        const subP = (progress - 0.35) / 0.4;
        scrollY = subP * 380;
        cursorX = 850;
        cursorY = 420;
      } else {
        const subP = (progress - 0.75) / 0.25;
        scrollY = 380 * (1 - subP);
        cursorX = 500;
        cursorY = 300;
      }
      await page.evaluate((sY, cX, cY) => {
        window.scrollTo({ top: sY, behavior: 'instant' });
        const cur = document.getElementById('demo-video-cursor');
        if (cur) { cur.style.left = `${cX}px`; cur.style.top = `${cY}px`; }
      }, scrollY, cursorX, cursorY);
    }
  },
  {
    id: 'act8_admin_reviews_settings',
    title: 'Chapter 8: Community Trust & Platform Settings',
    subtitle: 'Marketplace Trust • Mutual Ratings & Global Parameters',
    deviceMode: 'desktop',
    voiceText: 'Finally, the Reviews and Platform Settings modules enforce bidirectional trust and system configurations. With five-star ratings, automated state machines, and full-stack Flutter and NestJS architecture, this platform is completely built, tested, and ready to launch.',
    url: 'http://localhost:3001/reviews',
    setup: async (page) => {
      await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
      await page.goto('http://localhost:3001/reviews', { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1500));
    },
    updateFrame: async (page, progress) => {
      let scrollY = 0;
      let cursorX = 500;
      let cursorY = 280;
      if (progress < 0.4) {
        scrollY = 0;
        cursorX = 450 + progress * 150;
        cursorY = 280;
      } else if (progress < 0.75) {
        const subP = (progress - 0.4) / 0.35;
        scrollY = subP * 350;
        cursorX = 800;
        cursorY = 420;
      } else {
        const subP = (progress - 0.75) / 0.25;
        scrollY = 350 * (1 - subP);
        cursorX = 500;
        cursorY = 300;
      }
      await page.evaluate((sY, cX, cY) => {
        window.scrollTo({ top: sY, behavior: 'instant' });
        const cur = document.getElementById('demo-video-cursor');
        if (cur) { cur.style.left = `${cX}px`; cur.style.top = `${cY}px`; }
      }, scrollY, cursorX, cursorY);
    }
  }
];

function injectOverlayHUD(page, actTitle, actSubtitle, isMobile = false) {
  return page.evaluate((title, sub, mobile) => {
    const oldHud = document.getElementById('demo-video-hud');
    if (oldHud) oldHud.remove();
    const oldCursor = document.getElementById('demo-video-cursor');
    if (oldCursor) oldCursor.remove();

    const hud = document.createElement('div');
    hud.id = 'demo-video-hud';
    hud.style.position = 'fixed';
    hud.style.top = mobile ? '12px' : '16px';
    hud.style.left = '50%';
    hud.style.transform = 'translateX(-50%)';
    hud.style.zIndex = '999999';
    hud.style.display = 'flex';
    hud.style.alignItems = 'center';
    hud.style.gap = mobile ? '8px' : '14px';
    hud.style.background = 'rgba(15, 23, 42, 0.92)';
    hud.style.backdropFilter = 'blur(16px)';
    hud.style.border = '1.5px solid rgba(99, 102, 241, 0.5)';
    hud.style.borderRadius = '9999px';
    hud.style.padding = mobile ? '6px 14px' : '8px 24px';
    hud.style.boxShadow = '0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 25px rgba(99, 102, 241, 0.4)';
    hud.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    hud.style.color = '#ffffff';
    hud.style.pointerEvents = 'none';

    hud.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; width: ${mobile ? '22px' : '28px'}; height: ${mobile ? '22px' : '28px'}; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); box-shadow: 0 0 12px #6366f1;">
        <svg width="${mobile ? '12' : '15'}" height="${mobile ? '12' : '15'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      </div>
      <div>
        <div style="font-size: ${mobile ? '11px' : '13px'}; font-weight: 800; color: #ffffff;">${title}</div>
        <div style="font-size: ${mobile ? '9px' : '11px'}; font-weight: 600; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.05em;">${sub}</div>
      </div>
      <div style="margin-left: 6px; padding: 2px 8px; border-radius: 9999px; background: rgba(34, 197, 94, 0.25); border: 1px solid rgba(34, 197, 94, 0.5); font-size: ${mobile ? '8px' : '10px'}; font-weight: 700; color: #4ade80; text-transform: uppercase;">
        • ${mobile ? 'MOBILE APP' : 'LIVE CONSOLE'}
      </div>
    `;
    document.body.appendChild(hud);

    if (!mobile) {
      const cursor = document.createElement('div');
      cursor.id = 'demo-video-cursor';
      cursor.style.position = 'fixed';
      cursor.style.top = '250px';
      cursor.style.left = '450px';
      cursor.style.width = '24px';
      cursor.style.height = '24px';
      cursor.style.pointerEvents = 'none';
      cursor.style.zIndex = '9999999';
      cursor.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z" fill="#6366f1" stroke="#ffffff" stroke-width="1.5"/>
        </svg>
        <div style="position: absolute; top: -5px; left: -5px; width: 30px; height: 30px; border-radius: 50%; background: rgba(99, 102, 241, 0.35); border: 1px solid rgba(99, 102, 241, 0.7);"></div>
      `;
      document.body.appendChild(cursor);
    }
  }, actTitle, actSubtitle, isMobile);
}

function getAudioDuration(audioPath) {
  try {
    const out = execSync(`/opt/homebrew/bin/ffmpeg -i "${audioPath}" 2>&1 | grep "Duration"`, { encoding: 'utf-8' });
    const match = out.match(/Duration:\s+(\d+):(\d+):(\d+\.\d+)/);
    if (match) {
      const hours = parseFloat(match[1]);
      const mins = parseFloat(match[2]);
      const secs = parseFloat(match[3]);
      return hours * 3600 + mins * 60 + secs;
    }
  } catch (e) {
    console.error('Error getting duration:', e);
  }
  return 15.0;
}

async function main() {
  console.log('🚀 Starting Live Production Walkthrough Pipeline (Real Mobile + Real Admin)...');

  // Step 1: Generate high quality neural voiceovers
  console.log('🎙️ Generating natural neural voiceover tracks with Edge TTS...');
  for (let i = 0; i < acts.length; i++) {
    const a = acts[i];
    const audioPath = path.join(OUTPUT_DIR, `${a.id}.mp3`);
    console.log(`[Chapter ${i + 1}/${acts.length}] Generating voice for: ${a.title}...`);
    execSync(`python3 -m edge_tts --voice en-US-AndrewMultilingualNeural --rate="+2%" --pitch="+0Hz" --text "${a.voiceText}" --write-media "${audioPath}"`);
    a.audioPath = audioPath;
    const baseDur = getAudioDuration(audioPath);
    a.duration = baseDur + 0.8;
    console.log(`✓ Voice ready (${baseDur.toFixed(2)}s audio, ${a.duration.toFixed(2)}s total segment)\n`);
  }

  console.log('🌐 Launching headless Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--hide-scrollbars'
    ]
  });

  const page = await browser.newPage();

  // Persistent auth injection on every page load
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('cbp_admin_token', 'mock_admin_token_123');
    localStorage.setItem('cbp_admin_user', JSON.stringify({
      id: 'usr-admin-01',
      email: 'admin@cbp.platform',
      name: 'Platform Director',
      role: 'ADMIN'
    }));
  });

  const segmentVideoFiles = [];
  const fps = 20; // 20 frames per second

  for (let i = 0; i < acts.length; i++) {
    const a = acts[i];
    const totalFrames = Math.ceil(a.duration * fps);
    const isMobile = a.deviceMode === 'mobile';

    console.log(`\n🎬 Recording Chapter ${i + 1}/${acts.length}: ${a.title} (${isMobile ? '📱 Mobile View' : '💻 Desktop Console'})`);
    console.log(`⏱️ Duration: ${a.duration.toFixed(2)}s (${totalFrames} frames)`);

    const framesDir = path.join(OUTPUT_DIR, `frames_${a.id}`);
    if (fs.existsSync(framesDir)) {
      fs.rmSync(framesDir, { recursive: true });
    }
    fs.mkdirSync(framesDir, { recursive: true });

    await a.setup(page);
    await injectOverlayHUD(page, a.title, a.subtitle, isMobile);

    for (let frame = 0; frame < totalFrames; frame++) {
      const progress = frame / totalFrames;
      await a.updateFrame(page, progress);
      const frameFile = path.join(framesDir, `frame_${String(frame).padStart(5, '0')}.jpg`);
      await page.screenshot({ path: frameFile, type: 'jpeg', quality: 92 });
    }

    const sceneVideoPath = path.join(OUTPUT_DIR, `${a.id}_raw.mp4`);
    const sceneMergedPath = path.join(OUTPUT_DIR, `${a.id}_final.mp4`);

    console.log(`Encoding frames to video...`);
    // Scale mobile to 1080p canvas with blurred background or 1920x1080 standard canvas
    if (isMobile) {
      execSync(`/opt/homebrew/bin/ffmpeg -y -framerate ${fps} -i "${framesDir}/frame_%05d.jpg" -vf "scale=-2:1080,pad=1920:1080:(1920-iw)/2:0:color=0x0b0f19" -c:v libx264 -pix_fmt yuv420p -r 30 -crf 18 -preset fast "${sceneVideoPath}"`, { stdio: 'ignore' });
    } else {
      execSync(`/opt/homebrew/bin/ffmpeg -y -framerate ${fps} -i "${framesDir}/frame_%05d.jpg" -vf "scale=1920:1080" -c:v libx264 -pix_fmt yuv420p -r 30 -crf 18 -preset fast "${sceneVideoPath}"`, { stdio: 'ignore' });
    }

    console.log(`Muxing with audio...`);
    execSync(`/opt/homebrew/bin/ffmpeg -y -i "${sceneVideoPath}" -i "${a.audioPath}" -c:v copy -c:a aac -b:a 192k -shortest "${sceneMergedPath}"`, { stdio: 'ignore' });

    segmentVideoFiles.push(sceneMergedPath);
    console.log(`✓ Chapter ${i + 1} ready: ${sceneMergedPath}`);
  }

  await browser.close();

  console.log('\n🎞️ Concatenating all 8 chapters into final Master Demo Video...');
  const concatListPath = path.join(OUTPUT_DIR, 'concat_list.txt');
  const concatContent = segmentVideoFiles.map(f => `file '${f}'`).join('\n');
  fs.writeFileSync(concatListPath, concatContent);

  execSync(`/opt/homebrew/bin/ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k "${FINAL_VIDEO}"`);

  console.log(`\n🎉 REAL PRODUCTION WALKTHROUGH DEMO VIDEO COMPLETE!`);
  console.log(`📍 File Path: ${FINAL_VIDEO}`);
  const stats = fs.statSync(FINAL_VIDEO);
  console.log(`📊 Total Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
}

main().catch(err => {
  console.error('Fatal error during recording:', err);
  process.exit(1);
});
