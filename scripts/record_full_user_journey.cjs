const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = path.join(__dirname, '../user_journey_recording');
const FINAL_VIDEO = path.join(__dirname, '../creator_business_complete_user_journey.mp4');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const acts = [
  {
    id: 'act1_brand_campaign',
    title: 'Act 1: Brand Onboarding & Campaign Creation',
    voiceText: 'In Act One, we follow Boat Lifestyle on the Business platform. The brand launches a new promotional campaign specifying target creator quotas, budget allocations of twenty-five thousand rupees, and required deliverables including Instagram Reels and YouTube Shorts.',
    url: 'http://localhost:3001/campaigns',
    prepare: async (page) => {
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto('http://localhost:3001/campaigns', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 2000));
    },
    animate: async (page, duration) => {
      await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
      await new Promise(r => setTimeout(r, 2500));
      await page.evaluate(() => window.scrollBy({ top: -350, behavior: 'smooth' }));
    }
  },
  {
    id: 'act2_creator_discovery',
    title: 'Act 2: Creator Discovery, Bidding & Negotiation',
    voiceText: 'In Act Two, content creator Rohit Sharma explores the live campaign feed on the Creator App. He discovers the Boat campaign, reviews deliverables, and submits a custom bid of twenty-two thousand rupees with a negotiated delivery timeline.',
    url: 'http://localhost:3002',
    prepare: async (page) => {
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto('http://localhost:3002', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 2500));
    },
    animate: async (page, duration) => {
      await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
      await new Promise(r => setTimeout(r, 2500));
      await page.evaluate(() => window.scrollBy({ top: -300, behavior: 'smooth' }));
    }
  },
  {
    id: 'act3_escrow_chat',
    title: 'Act 3: Razorpay Escrow Funding & Protected Chat',
    voiceText: 'In Act Three, the business accepts the bid and funds the full contract amount into Razorpay Escrow. Both parties collaborate via real-time WebSocket chat, protected by automated anti-disintermediation filters that guard off-platform contact sharing.',
    url: 'http://localhost:3001/payments',
    prepare: async (page) => {
      await page.goto('http://localhost:3001/payments', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 2000));
    },
    animate: async (page, duration) => {
      await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
      await new Promise(r => setTimeout(r, 2500));
      await page.evaluate(() => window.scrollBy({ top: -400, behavior: 'smooth' }));
    }
  },
  {
    id: 'act4_deliverables_payout',
    title: 'Act 4: Deliverable Submission & Instant Settlement',
    voiceText: 'In Act Four, Rohit submits the completed Instagram Reel video proof. The business reviews and approves the deliverable, which triggers the collaboration state machine to disburse funds automatically with transparent platform fee deduction.',
    url: 'http://localhost:3001/dashboard',
    prepare: async (page) => {
      await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 2000));
    },
    animate: async (page, duration) => {
      await page.evaluate(() => window.scrollBy({ top: 450, behavior: 'smooth' }));
      await new Promise(r => setTimeout(r, 2500));
      await page.evaluate(() => window.scrollBy({ top: -450, behavior: 'smooth' }));
    }
  },
  {
    id: 'act5_admin_kyc_disputes',
    title: 'Act 5: Admin KYC Dossiers, Dispute Arbitration & Ratings',
    voiceText: 'In Act Five, platform administrators oversee KYC verification queues for PAN and GST documents, utilize the interactive dispute split settlement calculator, and inspect mutual five-star ratings, ensuring an airtight, trustworthy marketplace.',
    url: 'http://localhost:3001/verifications',
    prepare: async (page) => {
      await page.goto('http://localhost:3001/verifications', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 2000));
      const tabs = await page.$$('button[role="tab"], button');
      if (tabs.length > 2) {
        await tabs[1].click().catch(() => {});
        await new Promise(r => setTimeout(r, 1500));
        await tabs[0].click().catch(() => {});
      }
    },
    animate: async (page, duration) => {
      await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
      await new Promise(r => setTimeout(r, 2000));
      await page.goto('http://localhost:3001/disputes', { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 2000));
      await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
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
  console.log('🚀 Starting Complete User Journey Recording Pipeline...');
  
  console.log('🎙️ Generating natural neural voiceover tracks...');
  for (let i = 0; i < acts.length; i++) {
    const a = acts[i];
    const audioPath = path.join(OUTPUT_DIR, `${a.id}.mp3`);
    console.log(`Generating audio for ${a.id}...`);
    execSync(`python3 -m edge_tts --voice en-US-AndrewMultilingualNeural --rate="+0%" --text "${a.voiceText}" --write-media "${audioPath}"`);
    a.audioPath = audioPath;
    a.duration = getAudioDuration(audioPath) + 1.2;
    console.log(`✓ Act ${a.id} duration: ${a.duration.toFixed(2)}s`);
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
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.type('input[type="email"], input[name="email"]', 'admin@cbp.platform').catch(() => {});
    await page.type('input[type="password"], input[name="password"]', 'Admin@12345').catch(() => {});
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await new Promise(r => setTimeout(r, 2000));
    }
  } catch (e) {}

  const segmentVideoFiles = [];

  for (let i = 0; i < acts.length; i++) {
    const a = acts[i];
    console.log(`\n🎬 Recording ${a.title} (${a.duration.toFixed(2)}s)...`);
    
    const framesDir = path.join(OUTPUT_DIR, `frames_${a.id}`);
    if (fs.existsSync(framesDir)) {
      fs.rmSync(framesDir, { recursive: true });
    }
    fs.mkdirSync(framesDir, { recursive: true });

    await a.prepare(page);

    const fps = 25;
    const totalFrames = Math.ceil(a.duration * fps);
    const frameIntervalMs = 1000 / fps;

    console.log(`Capturing ${totalFrames} frames at ${fps} fps...`);
    const animPromise = a.animate(page, a.duration);

    for (let frame = 0; frame < totalFrames; frame++) {
      const frameFile = path.join(framesDir, `frame_${String(frame).padStart(5, '0')}.png`);
      await page.screenshot({ path: frameFile, type: 'png' });
      await new Promise(r => setTimeout(r, Math.max(10, frameIntervalMs - 30)));
    }

    await animPromise.catch(() => {});

    const sceneVideoPath = path.join(OUTPUT_DIR, `${a.id}_raw.mp4`);
    const sceneMergedPath = path.join(OUTPUT_DIR, `${a.id}_final.mp4`);

    console.log(`Encoding frames with ffmpeg...`);
    execSync(`/opt/homebrew/bin/ffmpeg -y -framerate ${fps} -i "${framesDir}/frame_%05d.png" -c:v libx264 -pix_fmt yuv420p -r 30 "${sceneVideoPath}"`, { stdio: 'ignore' });

    console.log(`Muxing with audio...`);
    execSync(`/opt/homebrew/bin/ffmpeg -y -i "${sceneVideoPath}" -i "${a.audioPath}" -c:v copy -c:a aac -shortest "${sceneMergedPath}"`, { stdio: 'ignore' });

    segmentVideoFiles.push(sceneMergedPath);
    console.log(`✓ Act ${i + 1} completed: ${sceneMergedPath}`);
  }

  await browser.close();

  console.log('\n🎞️ Concatenating all acts into complete user journey video...');
  const concatListPath = path.join(OUTPUT_DIR, 'concat_list.txt');
  const concatContent = segmentVideoFiles.map(f => `file '${f}'`).join('\n');
  fs.writeFileSync(concatListPath, concatContent);

  execSync(`/opt/homebrew/bin/ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c:v libx264 -preset fast -crf 20 -c:a aac -b:a 192k "${FINAL_VIDEO}"`);

  console.log(`\n🎉 USER JOURNEY VIDEO CREATED SUCCESSFULLY!`);
  console.log(`📍 File: ${FINAL_VIDEO}`);

  const stats = fs.statSync(FINAL_VIDEO);
  console.log(`📊 Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
}

run().catch(err => {
  console.error('Fatal recording error:', err);
  process.exit(1);
});
