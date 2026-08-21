const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = path.join(__dirname, '../demo_recording');
const FINAL_VIDEO = path.join(__dirname, '../creator_business_platform_demo.mp4');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const scenes = [
  {
    id: 'scene1_intro',
    title: 'Platform Overview & Admin Dashboard',
    voiceText: 'Welcome to the Creator-Business Collaboration Platform demonstration. This enterprise system unites content creators and brands across India with guaranteed escrow protection and automated state machine workflows.',
    url: 'http://localhost:3001/dashboard',
    prepare: async (page) => {
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 2000));
    },
    animate: async (page, duration) => {
      const steps = Math.floor(duration * 20);
      for (let i = 0; i < steps; i++) {
        await page.evaluate((progress) => {
          window.scrollTo({ top: Math.sin(progress * Math.PI) * 400, behavior: 'smooth' });
        }, i / steps);
        await new Promise(r => setTimeout(r, 50));
      }
    }
  },
  {
    id: 'scene2_kyc',
    title: 'Creator & Business KYC Verification',
    voiceText: 'Trust and security start with comprehensive verification. Administrators manage dedicated queues for creator PAN cards and business GST registration documents with real-time approval actions.',
    url: 'http://localhost:3001/verifications',
    prepare: async (page) => {
      await page.goto('http://localhost:3001/verifications', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 2000));
    },
    animate: async (page, duration) => {
      const tabs = await page.$$('button[role="tab"], button');
      if (tabs.length > 2) {
        await tabs[1].click().catch(() => {});
        await new Promise(r => setTimeout(r, 1500));
        await tabs[0].click().catch(() => {});
      }
      await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
      await new Promise(r => setTimeout(r, 2000));
      await page.evaluate(() => window.scrollBy({ top: -300, behavior: 'smooth' }));
    }
  },
  {
    id: 'scene3_campaigns',
    title: 'Campaign Management & Discovery',
    voiceText: 'Brands launch high-impact promotional campaigns specifying deliverable types, target creator counts, and budget ranges. Creators seamlessly discover opportunities matching their audience and niche.',
    url: 'http://localhost:3001/campaigns',
    prepare: async (page) => {
      await page.goto('http://localhost:3001/campaigns', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 2000));
    },
    animate: async (page, duration) => {
      await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
      await new Promise(r => setTimeout(r, 2000));
      await page.evaluate(() => window.scrollBy({ top: -400, behavior: 'smooth' }));
      await new Promise(r => setTimeout(r, 1500));
    }
  },
  {
    id: 'scene4_disputes',
    title: 'Dispute Arbitration & Split Settlement',
    voiceText: 'When collaboration disagreements occur, the platform provides an administrative arbitration dossier featuring full chat transcripts, revision histories, and an interactive split settlement calculator.',
    url: 'http://localhost:3001/disputes',
    prepare: async (page) => {
      await page.goto('http://localhost:3001/disputes', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 2000));
      const disputeLinks = await page.$$('a[href*="/disputes/"]');
      if (disputeLinks.length > 0) {
        await disputeLinks[0].click().catch(() => {});
        await new Promise(r => setTimeout(r, 2000));
      }
    },
    animate: async (page, duration) => {
      await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
      await new Promise(r => setTimeout(r, 2500));
      await page.evaluate(() => window.scrollBy({ top: -500, behavior: 'smooth' }));
    }
  },
  {
    id: 'scene5_payments',
    title: 'Razorpay Escrow & Payment Settlement',
    voiceText: 'Financial transactions are safeguarded through Razorpay Route escrow. Funds are securely locked during campaign execution and automatically disbursed with transparent platform fee deduction upon milestone approval.',
    url: 'http://localhost:3001/payments',
    prepare: async (page) => {
      await page.goto('http://localhost:3001/payments', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 2000));
    },
    animate: async (page, duration) => {
      await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
      await new Promise(r => setTimeout(r, 2000));
      await page.evaluate(() => window.scrollBy({ top: -350, behavior: 'smooth' }));
    }
  },
  {
    id: 'scene6_reviews_users',
    title: 'Community Trust, Reviews & Conclusion',
    voiceText: 'Bidirectional reviews, anti-disintermediation chat filters, and mobile applications for both creators and businesses make this platform completely developed, rigorously tested, and production ready.',
    url: 'http://localhost:3001/reviews',
    prepare: async (page) => {
      await page.goto('http://localhost:3001/reviews', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 2000));
    },
    animate: async (page, duration) => {
      await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
      await new Promise(r => setTimeout(r, 2500));
      await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 2000));
    }
  }
];

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
  return 8.0;
}

async function run() {
  console.log('🚀 Starting Demo Video Generation Pipeline...');
  
  console.log('🎙️ Generating natural voiceovers with Edge TTS...');
  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    const audioPath = path.join(OUTPUT_DIR, `${s.id}.mp3`);
    console.log(`Generating voice for ${s.id}...`);
    execSync(`python3 -m edge_tts --voice en-US-AndrewMultilingualNeural --rate="+0%" --text "${s.voiceText}" --write-media "${audioPath}"`);
    s.audioPath = audioPath;
    s.duration = getAudioDuration(audioPath) + 1.0;
    console.log(`✓ Scene ${s.id} audio duration: ${s.duration.toFixed(2)}s`);
  }

  console.log('🌐 Launching headless Chrome with Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--window-size=1920,1080',
      '--hide-scrollbars'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  try {
    console.log('🔑 Logging into Admin Portal...');
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.type('input[type="email"], input[name="email"]', 'admin@cbp.platform').catch(() => {});
    await page.type('input[type="password"], input[name="password"]', 'Admin@12345').catch(() => {});
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await new Promise(r => setTimeout(r, 2000));
    }
  } catch (e) {
    console.log('Login attempt complete.');
  }

  const segmentVideoFiles = [];

  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    console.log(`\n🎬 Recording Scene ${i + 1}/${scenes.length}: ${s.title} (${s.duration.toFixed(2)}s)...`);
    
    const framesDir = path.join(OUTPUT_DIR, `frames_${s.id}`);
    if (fs.existsSync(framesDir)) {
      fs.rmSync(framesDir, { recursive: true });
    }
    fs.mkdirSync(framesDir, { recursive: true });

    await s.prepare(page);

    const fps = 25;
    const totalFrames = Math.ceil(s.duration * fps);
    const frameIntervalMs = 1000 / fps;

    console.log(`Capturing ${totalFrames} frames at ${fps} fps...`);
    const animPromise = s.animate(page, s.duration);

    for (let frame = 0; frame < totalFrames; frame++) {
      const frameFile = path.join(framesDir, `frame_${String(frame).padStart(5, '0')}.png`);
      await page.screenshot({ path: frameFile, type: 'png' });
      await new Promise(r => setTimeout(r, Math.max(10, frameIntervalMs - 30)));
    }

    await animPromise.catch(() => {});

    const sceneVideoPath = path.join(OUTPUT_DIR, `${s.id}_raw.mp4`);
    const sceneMergedPath = path.join(OUTPUT_DIR, `${s.id}_final.mp4`);

    console.log(`Encoding frames to video with ffmpeg...`);
    execSync(`/opt/homebrew/bin/ffmpeg -y -framerate ${fps} -i "${framesDir}/frame_%05d.png" -c:v libx264 -pix_fmt yuv420p -r 30 "${sceneVideoPath}"`, { stdio: 'ignore' });

    console.log(`Muxing video and audio...`);
    execSync(`/opt/homebrew/bin/ffmpeg -y -i "${sceneVideoPath}" -i "${s.audioPath}" -c:v copy -c:a aac -shortest "${sceneMergedPath}"`, { stdio: 'ignore' });

    segmentVideoFiles.push(sceneMergedPath);
    console.log(`✓ Scene ${i + 1} completed: ${sceneMergedPath}`);
  }

  await browser.close();

  console.log('\n🎞️ Concatenating all scenes into final demo video...');
  const concatListPath = path.join(OUTPUT_DIR, 'concat_list.txt');
  const concatContent = segmentVideoFiles.map(f => `file '${f}'`).join('\n');
  fs.writeFileSync(concatListPath, concatContent);

  execSync(`/opt/homebrew/bin/ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c:v libx264 -preset fast -crf 20 -c:a aac -b:a 192k "${FINAL_VIDEO}"`);

  console.log(`\n🎉 DEMO VIDEO CREATED SUCCESSFULLY!`);
  console.log(`📍 File: ${FINAL_VIDEO}`);

  const stats = fs.statSync(FINAL_VIDEO);
  console.log(`📊 Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
}

run().catch(err => {
  console.error('Fatal recording error:', err);
  process.exit(1);
});
