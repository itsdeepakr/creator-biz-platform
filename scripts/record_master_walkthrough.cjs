const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = path.join(__dirname, '../master_walkthrough_recording');
const FINAL_VIDEO = path.join(__dirname, '../creator_business_master_walkthrough_demo.mp4');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const acts = [
  {
    id: 'act1_brand_campaign',
    title: 'Act 1: Brand Onboarding & Campaign Creation',
    subtitle: 'Business Persona • Boat Lifestyle India',
    audioFile: 'act1_brand_campaign.mp3',
    setup: async (page) => {
      await page.goto('http://localhost:3001/showcase', { waitUntil: 'networkidle2', timeout: 30000 });
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const b = btns.find(x => x.textContent && x.textContent.includes('Act 1'));
        if (b) b.click();
      });
      await new Promise(r => setTimeout(r, 600));
    },
    updateFrame: async (page, progress) => {
      let scrollY = 0;
      let cursorX = 400;
      let cursorY = 300;

      if (progress < 0.35) {
        scrollY = 0;
        cursorX = 450 + progress * 200;
        cursorY = 280 + Math.sin(progress * Math.PI) * 40;
      } else if (progress < 0.70) {
        const subP = (progress - 0.35) / 0.35;
        scrollY = subP * 280;
        cursorX = 350 + subP * 100;
        cursorY = 480;
      } else {
        const subP = (progress - 0.70) / 0.30;
        scrollY = 280 * (1 - subP);
        cursorX = 450;
        cursorY = 380;
      }

      await page.evaluate((sY, cX, cY) => {
        window.scrollTo({ top: sY, behavior: 'instant' });
        const cur = document.getElementById('demo-video-cursor');
        if (cur) {
          cur.style.left = `${cX}px`;
          cur.style.top = `${cY}px`;
        }
      }, scrollY, cursorX, cursorY);
    }
  },
  {
    id: 'act2_creator_bidding',
    title: 'Act 2: Creator Discovery, Social Stats & Bidding',
    subtitle: 'Creator Persona • Rohit Sharma Tech (450K Followers)',
    audioFile: 'act2_creator_bidding.mp3',
    setup: async (page) => {
      await page.goto('http://localhost:3001/showcase', { waitUntil: 'networkidle2', timeout: 30000 });
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const b = btns.find(x => x.textContent && x.textContent.includes('Act 2'));
        if (b) b.click();
      });
      await new Promise(r => setTimeout(r, 600));
    },
    updateFrame: async (page, progress) => {
      let scrollY = 0;
      let cursorX = 450;
      let cursorY = 280;

      if (progress < 0.35) {
        scrollY = 0;
        cursorX = 420 + progress * 150;
        cursorY = 260 + progress * 80;
      } else if (progress < 0.70) {
        const subP = (progress - 0.35) / 0.35;
        scrollY = subP * 250;
        cursorX = 360 + subP * 120;
        cursorY = 460;
      } else {
        const subP = (progress - 0.70) / 0.30;
        scrollY = 250 * (1 - subP);
        cursorX = 980;
        cursorY = 400;
      }

      await page.evaluate((sY, cX, cY) => {
        window.scrollTo({ top: sY, behavior: 'instant' });
        const cur = document.getElementById('demo-video-cursor');
        if (cur) {
          cur.style.left = `${cX}px`;
          cur.style.top = `${cY}px`;
        }
      }, scrollY, cursorX, cursorY);
    }
  },
  {
    id: 'act3_escrow_chat',
    title: 'Act 3: Razorpay Escrow & Anti-Disintermediation Chat',
    subtitle: 'Collaboration Engine • Secure Escrow & Real-Time Messaging',
    audioFile: 'act3_escrow_chat.mp3',
    setup: async (page) => {
      await page.goto('http://localhost:3001/showcase', { waitUntil: 'networkidle2', timeout: 30000 });
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const b = btns.find(x => x.textContent && x.textContent.includes('Act 3'));
        if (b) b.click();
      });
      await new Promise(r => setTimeout(r, 600));
    },
    updateFrame: async (page, progress) => {
      let scrollY = 0;
      let cursorX = 450;
      let cursorY = 320;

      if (progress < 0.35) {
        scrollY = 0;
        cursorX = 520;
        cursorY = 240;
      } else if (progress < 0.70) {
        const subP = (progress - 0.35) / 0.35;
        scrollY = subP * 180;
        cursorX = 380 + subP * 80;
        cursorY = 420;
      } else {
        const subP = (progress - 0.70) / 0.30;
        scrollY = 180 * (1 - subP);
        cursorX = 400;
        cursorY = 560;
      }

      await page.evaluate((sY, cX, cY) => {
        window.scrollTo({ top: sY, behavior: 'instant' });
        const cur = document.getElementById('demo-video-cursor');
        if (cur) {
          cur.style.left = `${cX}px`;
          cur.style.top = `${cY}px`;
        }
      }, scrollY, cursorX, cursorY);
    }
  },
  {
    id: 'act4_deliverables_payout',
    title: 'Act 4: Milestone Deliverables & Instant Escrow Settlement',
    subtitle: 'State Machine • Automated 1-Click Payout Release',
    audioFile: 'act4_deliverables_payout.mp3',
    setup: async (page) => {
      await page.goto('http://localhost:3001/showcase', { waitUntil: 'networkidle2', timeout: 30000 });
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const b = btns.find(x => x.textContent && x.textContent.includes('Act 4'));
        if (b) b.click();
      });
      await new Promise(r => setTimeout(r, 600));
    },
    updateFrame: async (page, progress) => {
      let scrollY = 0;
      let cursorX = 400;
      let cursorY = 320;

      if (progress < 0.35) {
        scrollY = 0;
        cursorX = 420;
        cursorY = 320;
      } else if (progress < 0.70) {
        const subP = (progress - 0.35) / 0.35;
        scrollY = subP * 240;
        cursorX = 360 + subP * 100;
        cursorY = 480;
      } else {
        const subP = (progress - 0.70) / 0.30;
        scrollY = 240 * (1 - subP);
        cursorX = 980;
        cursorY = 350;
      }

      await page.evaluate((sY, cX, cY) => {
        window.scrollTo({ top: sY, behavior: 'instant' });
        const cur = document.getElementById('demo-video-cursor');
        if (cur) {
          cur.style.left = `${cX}px`;
          cur.style.top = `${cY}px`;
        }
      }, scrollY, cursorX, cursorY);
    }
  },
  {
    id: 'act5_admin_kyc',
    title: 'Act 5: Platform Administration & KYC Verification Queue',
    subtitle: 'Admin Oversight • PAN, Aadhaar & GST Verification',
    audioFile: 'act5_admin_kyc.mp3',
    setup: async (page) => {
      await page.goto('http://localhost:3001/verifications', { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 800));
    },
    updateFrame: async (page, progress) => {
      let scrollY = 0;
      let cursorX = 500;
      let cursorY = 220;

      if (progress < 0.35) {
        scrollY = 0;
        cursorX = 420 + progress * 150;
        cursorY = 220;
      } else if (progress < 0.70) {
        const subP = (progress - 0.35) / 0.35;
        scrollY = subP * 340;
        cursorX = 920;
        cursorY = 420;
      } else {
        const subP = (progress - 0.70) / 0.30;
        scrollY = 340 * (1 - subP);
        cursorX = 500;
        cursorY = 250;
      }

      await page.evaluate((sY, cX, cY) => {
        window.scrollTo({ top: sY, behavior: 'instant' });
        const cur = document.getElementById('demo-video-cursor');
        if (cur) {
          cur.style.left = `${cX}px`;
          cur.style.top = `${cY}px`;
        }
      }, scrollY, cursorX, cursorY);
    }
  },
  {
    id: 'act6_dispute_split',
    title: 'Act 6: Dispute Arbitration & Interactive Split Settlement',
    subtitle: 'Arbitration Dossier • Chat Audit & Settlement Calculator',
    audioFile: 'act6_dispute_split.mp3',
    setup: async (page) => {
      await page.goto('http://localhost:3001/disputes/disp-1', { waitUntil: 'networkidle2', timeout: 30000 }).catch(async () => {
        await page.goto('http://localhost:3001/disputes', { waitUntil: 'networkidle2', timeout: 30000 });
      });
      await new Promise(r => setTimeout(r, 800));
    },
    updateFrame: async (page, progress) => {
      let scrollY = 0;
      let cursorX = 600;
      let cursorY = 280;

      if (progress < 0.35) {
        scrollY = 0;
        cursorX = 600 + progress * 100;
        cursorY = 280;
      } else if (progress < 0.70) {
        const subP = (progress - 0.35) / 0.35;
        scrollY = subP * 400;
        cursorX = 850;
        cursorY = 450;
      } else {
        const subP = (progress - 0.70) / 0.30;
        scrollY = 400 * (1 - subP);
        cursorX = 600;
        cursorY = 320;
      }

      await page.evaluate((sY, cX, cY) => {
        window.scrollTo({ top: sY, behavior: 'instant' });
        const cur = document.getElementById('demo-video-cursor');
        if (cur) {
          cur.style.left = `${cX}px`;
          cur.style.top = `${cY}px`;
        }
      }, scrollY, cursorX, cursorY);
    }
  },
  {
    id: 'act7_reviews_architecture',
    title: 'Act 7: Mutual Reviews & Full-Stack Platform Architecture',
    subtitle: 'Marketplace Trust • Flutter, Next.js, NestJS & PostgreSQL',
    audioFile: 'act7_reviews_architecture.mp3',
    setup: async (page) => {
      await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 800));
    },
    updateFrame: async (page, progress) => {
      let scrollY = 0;
      let cursorX = 500;
      let cursorY = 300;

      if (progress < 0.35) {
        scrollY = 0;
        cursorX = 400 + progress * 300;
        cursorY = 250 + progress * 100;
      } else if (progress < 0.70) {
        const subP = (progress - 0.35) / 0.35;
        scrollY = subP * 420;
        cursorX = 800;
        cursorY = 420;
      } else {
        const subP = (progress - 0.70) / 0.30;
        scrollY = 420 * (1 - subP);
        cursorX = 500;
        cursorY = 300;
      }

      await page.evaluate((sY, cX, cY) => {
        window.scrollTo({ top: sY, behavior: 'instant' });
        const cur = document.getElementById('demo-video-cursor');
        if (cur) {
          cur.style.left = `${cX}px`;
          cur.style.top = `${cY}px`;
        }
      }, scrollY, cursorX, cursorY);
    }
  }
];

function injectOverlayHUD(page, actTitle, actSubtitle) {
  return page.evaluate((title, sub) => {
    const oldHud = document.getElementById('demo-video-hud');
    if (oldHud) oldHud.remove();
    const oldCursor = document.getElementById('demo-video-cursor');
    if (oldCursor) oldCursor.remove();

    const hud = document.createElement('div');
    hud.id = 'demo-video-hud';
    hud.style.position = 'fixed';
    hud.style.top = '16px';
    hud.style.left = '50%';
    hud.style.transform = 'translateX(-50%)';
    hud.style.zIndex = '999999';
    hud.style.display = 'flex';
    hud.style.alignItems = 'center';
    hud.style.gap = '14px';
    hud.style.background = 'rgba(15, 23, 42, 0.90)';
    hud.style.backdropFilter = 'blur(16px)';
    hud.style.border = '1.5px solid rgba(99, 102, 241, 0.5)';
    hud.style.borderRadius = '9999px';
    hud.style.padding = '8px 24px';
    hud.style.boxShadow = '0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 25px rgba(99, 102, 241, 0.4)';
    hud.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    hud.style.color = '#ffffff';
    hud.style.pointerEvents = 'none';

    hud.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); box-shadow: 0 0 12px #6366f1;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      </div>
      <div>
        <div style="font-size: 13px; font-weight: 800; color: #ffffff;">${title}</div>
        <div style="font-size: 11px; font-weight: 600; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.05em;">${sub}</div>
      </div>
      <div style="margin-left: 8px; padding: 3px 10px; border-radius: 9999px; background: rgba(34, 197, 94, 0.25); border: 1px solid rgba(34, 197, 94, 0.5); font-size: 10px; font-weight: 700; color: #4ade80; text-transform: uppercase; letter-spacing: 0.05em;">
        • SYNCED AUDIO
      </div>
    `;
    document.body.appendChild(hud);

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
  }, actTitle, actSubtitle);
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
  return 20.0;
}

async function main() {
  console.log('🚀 Starting Master Walkthrough Demo Pipeline with Persistent Auth Injection...');

  console.log('🌐 Launching headless Chrome...');
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
  const fps = 20; // 20 frames per second for silky smooth playback

  for (let i = 0; i < acts.length; i++) {
    const a = acts[i];
    const audioPath = path.join(OUTPUT_DIR, a.audioFile);
    const rawDuration = getAudioDuration(audioPath);
    const totalDuration = rawDuration + 0.8; // 0.8s smooth buffer
    const totalFrames = Math.ceil(totalDuration * fps);

    console.log(`\n🎬 Recording Act ${i + 1}/${acts.length}: ${a.title}`);
    console.log(`⏱️ Duration: ${totalDuration.toFixed(2)}s (${totalFrames} frames)`);

    const framesDir = path.join(OUTPUT_DIR, `frames_${a.id}`);
    if (fs.existsSync(framesDir)) {
      fs.rmSync(framesDir, { recursive: true });
    }
    fs.mkdirSync(framesDir, { recursive: true });

    await a.setup(page);
    await injectOverlayHUD(page, a.title, a.subtitle);

    for (let frame = 0; frame < totalFrames; frame++) {
      const progress = frame / totalFrames;
      await a.updateFrame(page, progress);
      const frameFile = path.join(framesDir, `frame_${String(frame).padStart(5, '0')}.jpg`);
      await page.screenshot({ path: frameFile, type: 'jpeg', quality: 92 });
    }

    const sceneVideoPath = path.join(OUTPUT_DIR, `${a.id}_raw.mp4`);
    const sceneMergedPath = path.join(OUTPUT_DIR, `${a.id}_final.mp4`);

    console.log(`Encoding frames to video...`);
    execSync(`/opt/homebrew/bin/ffmpeg -y -framerate ${fps} -i "${framesDir}/frame_%05d.jpg" -c:v libx264 -pix_fmt yuv420p -r 30 -crf 18 -preset fast "${sceneVideoPath}"`, { stdio: 'ignore' });

    console.log(`Muxing with audio...`);
    execSync(`/opt/homebrew/bin/ffmpeg -y -i "${sceneVideoPath}" -i "${audioPath}" -c:v copy -c:a aac -b:a 192k -shortest "${sceneMergedPath}"`, { stdio: 'ignore' });

    segmentVideoFiles.push(sceneMergedPath);
    console.log(`✓ Act ${i + 1} ready: ${sceneMergedPath}`);
  }

  await browser.close();

  console.log('\n🎞️ Concatenating all 7 acts into final Master Walkthrough Demo Video...');
  const concatListPath = path.join(OUTPUT_DIR, 'concat_list.txt');
  const concatContent = segmentVideoFiles.map(f => `file '${f}'`).join('\n');
  fs.writeFileSync(concatListPath, concatContent);

  execSync(`/opt/homebrew/bin/ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k "${FINAL_VIDEO}"`);

  console.log(`\n🎉 MASTER WALKTHROUGH DEMO VIDEO COMPLETE!`);
  console.log(`📍 File Path: ${FINAL_VIDEO}`);
  const stats = fs.statSync(FINAL_VIDEO);
  console.log(`📊 Total Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
}

main().catch(err => {
  console.error('Fatal error during recording:', err);
  process.exit(1);
});
