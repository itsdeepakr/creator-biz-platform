'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  Building,
  User,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Lock,
  Instagram,
  Youtube,
  DollarSign,
  FileCheck,
  Scale,
  RefreshCw,
  Star,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

export default function ShowcaseStoryPage() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'business', text: 'Hi Rohit! We love your tech & audio content. Could you deliver the reel by Friday?', time: '10:14 AM' },
    { sender: 'creator', text: 'Hey Boat team! Absolutely, the script is ready and I will include the ANC testing benchmark in the unboxing.', time: '10:16 AM' },
    { sender: 'creator', text: 'You can also reach me on my private number 9876543210 for quick updates.', time: '10:17 AM', flagged: true },
  ]);
  const [escrowStatus, setEscrowStatus] = useState<'PENDING' | 'ESCROW_HELD' | 'RELEASED'>('ESCROW_HELD');
  const [deliverableStatus, setDeliverableStatus] = useState<'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED'>('SUBMITTED');
  const [splitPercent, setSplitPercent] = useState<number>(70);

  const steps = [
    { id: 1, title: 'Act 1: Brand Campaign Creation', role: 'Business (Boat Lifestyle)', icon: Building },
    { id: 2, title: 'Act 2: Creator Discovery & Bidding', role: 'Creator (Rohit Sharma)', icon: User },
    { id: 3, title: 'Act 3: Razorpay Escrow & Protected Chat', role: 'Collaboration Engine', icon: Lock },
    { id: 4, title: 'Act 4: Deliverables & Instant Settlement', role: 'State Machine & Wallet', icon: CheckCircle2 },
    { id: 5, title: 'Act 5: Admin Arbitration & KYC', role: 'Platform Admin', icon: Scale },
    { id: 6, title: 'Act 6: Mutual Reviews & Analytics', role: 'Marketplace Trust', icon: Star },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-6 border border-primary/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase tracking-wide">
                Interactive Journey Simulator
              </span>
              <span className="text-xs text-muted-foreground">• Complete Storytelling Mode</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Creator-Business Collaboration Platform: End-to-End Story
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Follow the complete lifecycle: from Boat Lifestyle creating a campaign and Rohit Sharma bidding, to Razorpay Escrow funding, anti-disintermediation chat, 1-click deliverable approval, and admin dispute arbitration.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveStep(prev => prev > 1 ? prev - 1 : 6)}
              className="text-xs"
            >
              Previous Act
            </Button>
            <Button
              size="sm"
              onClick={() => setActiveStep(prev => prev < 6 ? prev + 1 : 1)}
              className="text-xs bg-primary hover:bg-primary/90 text-white font-semibold gap-1.5 shadow-lg shadow-primary/25"
            >
              Next Act <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Step Tabs Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-6 pt-5 border-t border-white/10">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = activeStep === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                className={`flex flex-col items-start p-3 rounded-xl transition-all text-left border ${
                  isActive
                    ? 'bg-primary/20 border-primary text-white shadow-md shadow-primary/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Act {s.id}</span>
                </div>
                <span className="text-xs font-semibold line-clamp-1">{s.title.split(': ')[1]}</span>
                <span className="text-[10px] text-muted-foreground truncate w-full mt-0.5">{s.role}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Mobile App Persona Simulation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {activeStep === 1 || activeStep === 3 ? 'Flutter Business App (Brand Persona)' : 'Flutter Creator App (Creator Persona)'}
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              iOS / Android 60fps
            </Badge>
          </div>

          {/* Mobile Phone Mockup Device Frame */}
          <div className="relative mx-auto w-full max-w-[380px] rounded-[36px] border-4 border-slate-700 bg-slate-950 p-3 shadow-2xl shadow-black/60">
            {/* Phone Notch / Dynamic Island */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 h-4 w-28 rounded-full bg-slate-900 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-slate-800 mr-2" />
              <div className="h-2 w-6 rounded-full bg-slate-800" />
            </div>

            {/* Mobile Screen Content */}
            <div className="mt-6 rounded-[26px] bg-slate-900 border border-slate-800 p-4 text-white min-h-[520px] flex flex-col justify-between overflow-hidden">
              
              {/* Step 1: Business App View */}
              {activeStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-xs">
                        b
                      </div>
                      <div>
                        <h4 className="text-xs font-bold">Boat Lifestyle India</h4>
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">GSTIN Verified</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="purple" className="text-[9px]">Brand Tier 1</Badge>
                  </div>

                  <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-primary">New Campaign Draft</span>
                      <span className="text-xs font-extrabold text-emerald-400">₹25,000 INR</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">Festive Sound Revolution 2026</h3>
                    <p className="text-[11px] text-slate-300">
                      Promote Nirvana ANC 751 Wireless Headphones with unboxing reel & sound test.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] text-slate-300">📹 1x Instagram Reel</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] text-slate-300">⚡ 1x YouTube Short</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Milestone Escrow Allocation</span>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-lg bg-slate-800 p-2 border border-slate-700">
                        <span className="block text-[9px] text-slate-400">Escrow Deposit</span>
                        <span className="text-xs font-bold text-white">₹25,000</span>
                      </div>
                      <div className="rounded-lg bg-slate-800 p-2 border border-slate-700">
                        <span className="block text-[9px] text-slate-400">Target Creators</span>
                        <span className="text-xs font-bold text-emerald-400">3 Creators</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full text-xs font-bold bg-primary hover:bg-primary/90 h-9">
                    Publish to Creator Feed 🚀
                  </Button>
                </div>
              )}

              {/* Step 2: Creator App View */}
              {activeStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-xs">
                        RS
                      </div>
                      <div>
                        <h4 className="text-xs font-bold">Rohit Sharma Tech</h4>
                        <span className="text-[10px] text-emerald-400">PAN Verified • Score 98%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-full text-[10px]">
                      <Instagram className="h-3 w-3 text-pink-400" /> 320k
                      <Youtube className="h-3 w-3 text-red-500 ml-1" /> 130k
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-800/80 p-3 border border-primary/40 space-y-2 relative">
                    <div className="flex justify-between items-center">
                      <Badge variant="info" className="text-[9px]">Matched Niche: Tech</Badge>
                      <span className="text-xs font-bold text-emerald-400">₹25,000 Budget</span>
                    </div>
                    <h3 className="text-xs font-bold text-white">Festive Sound Revolution</h3>
                    <p className="text-[10px] text-slate-300">Boat Lifestyle • Deliverable: 1 Reel + 1 Story</p>
                    
                    <div className="rounded-lg bg-slate-950/80 p-2.5 border border-slate-700/60 mt-2 space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">Custom Bid Proposal:</span>
                        <span className="font-bold text-white">₹22,000 INR</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">Turnaround Time:</span>
                        <span className="font-bold text-emerald-400">4 Business Days</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 h-9">
                    Submit Proposal Bid 💼
                  </Button>
                </div>
              )}

              {/* Step 3: Protected Chat & Escrow */}
              {activeStep === 3 && (
                <div className="space-y-3 animate-in fade-in duration-300 flex-1 flex flex-col justify-between">
                  <div className="border-b border-slate-800 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold">b</div>
                        <span className="text-xs font-bold">Boat & Rohit Sharma</span>
                      </div>
                      <Badge variant="success" className="text-[9px]">
                        <Lock className="h-2.5 w-2.5 mr-1" /> ₹22,000 Locked
                      </Badge>
                    </div>
                    <div className="mt-1.5 rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[9px] text-amber-300 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Anti-Disintermediation Filter Active
                    </div>
                  </div>

                  {/* Chat Bubbles */}
                  <div className="space-y-2 py-1 flex-1 overflow-y-auto max-h-[280px]">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.sender === 'business' ? 'items-start' : 'items-end'}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed ${
                            msg.sender === 'business'
                              ? 'bg-slate-800 text-slate-100 rounded-tl-xs'
                              : 'bg-primary text-white rounded-tr-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                        {msg.flagged && (
                          <div className="mt-1 flex items-center gap-1 rounded bg-red-500/20 px-1.5 py-0.5 text-[8px] text-red-300 border border-red-500/40">
                            <AlertTriangle className="h-2.5 w-2.5" /> Warning: Off-platform contact sharing flagged
                          </div>
                        )}
                        <span className="text-[9px] text-slate-500 px-1 mt-0.5">{msg.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex gap-1.5">
                    <input
                      disabled
                      placeholder="Type a message..."
                      className="bg-slate-800 rounded-lg px-2.5 py-1 text-[11px] flex-1 text-slate-400 outline-none"
                      value="Audio testing script approved! Proceeding to record."
                    />
                    <button className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-white">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Deliverables & Settlement */}
              {activeStep === 4 && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold">Deliverable Milestone #1</h4>
                      <span className="text-[10px] text-slate-400">Instagram 60s 4K Reel</span>
                    </div>
                    <Badge variant="success" className="text-[9px]">Approved</Badge>
                  </div>

                  <div className="rounded-xl bg-slate-800/90 p-3 border border-emerald-500/40 space-y-2">
                    <div className="aspect-video rounded-lg bg-slate-950 flex flex-col items-center justify-center text-slate-400 border border-slate-800 relative overflow-hidden">
                      <Play className="h-8 w-8 text-primary opacity-80" />
                      <span className="text-[10px] text-slate-300 mt-1 font-mono">boat_nirvana_review_final.mp4</span>
                      <span className="absolute bottom-1 right-2 text-[9px] text-emerald-400 font-bold">4K 60fps • 0:58s</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-300">
                      <span>Live Link: <span className="text-primary underline">instagram.com/p/DF931x</span></span>
                      <span className="text-emerald-400 font-bold">142.5K Views</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Contract Total:</span>
                      <span className="font-bold text-white">₹22,000</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Platform Fee (10%):</span>
                      <span className="text-amber-400">-₹2,200</span>
                    </div>
                    <div className="flex justify-between text-xs font-extrabold pt-1 border-t border-slate-800">
                      <span className="text-emerald-400">Net Creator Payout:</span>
                      <span className="text-emerald-400">₹19,800 INR</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2 text-center">
                    <span className="text-[10px] font-bold text-emerald-300 flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Payout Settled to Razorpay Route
                    </span>
                  </div>
                </div>
              )}

              {/* Step 5: Admin Dispute Resolution */}
              {activeStep === 5 && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-amber-400">Dispute Case #DISP-892</h4>
                      <span className="text-[10px] text-slate-400">Contract: ₹50,000 Escrow</span>
                    </div>
                    <Badge variant="warning" className="text-[9px]">In Arbitration</Badge>
                  </div>

                  <div className="rounded-xl bg-slate-800/80 p-2.5 border border-slate-700 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-300">Reason: Scope Deviation on Video Edits</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Brand requested 3 revisions; creator delivered 2. Admin mediating fair partial settlement.
                    </p>
                  </div>

                  <div className="space-y-2 rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Creator Split: {splitPercent}%</span>
                      <span className="text-slate-400">Brand Refund: {100 - splitPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={splitPercent}
                      onChange={(e) => setSplitPercent(Number(e.target.value))}
                      className="w-full accent-primary h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div className="grid grid-cols-2 gap-2 text-center pt-1">
                      <div className="rounded bg-slate-900 p-1.5 border border-slate-800">
                        <span className="block text-[8px] text-slate-400">Creator Net ({splitPercent}%)</span>
                        <span className="text-[11px] font-bold text-emerald-400">
                          ₹{((50000 * splitPercent / 100) * 0.9).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="rounded bg-slate-900 p-1.5 border border-slate-800">
                        <span className="block text-[8px] text-slate-400">Brand Refund ({100 - splitPercent}%)</span>
                        <span className="text-[11px] font-bold text-blue-400">
                          ₹{(50000 * (100 - splitPercent) / 100).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full text-xs font-bold bg-amber-600 hover:bg-amber-500 h-8">
                    Execute Binding Split Settlement ⚖️
                  </Button>
                </div>
              )}

              {/* Step 6: Mutual Reviews */}
              {activeStep === 6 && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="border-b border-slate-800 pb-2 text-center">
                    <h4 className="text-xs font-bold text-white">Collaboration Completed</h4>
                    <span className="text-[10px] text-emerald-400">Mutual 5-Star Feedback Exchanged</span>
                  </div>

                  <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-primary">Boat Lifestyle wrote:</span>
                      <div className="flex text-amber-400 text-[10px]">★★★★★</div>
                    </div>
                    <p className="text-[10px] text-slate-300 italic">
                      "Outstanding quality! Rohit delivered high-engagement reel ahead of schedule."
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-emerald-400">Rohit Sharma wrote:</span>
                      <div className="flex text-amber-400 text-[10px]">★★★★★</div>
                    </div>
                    <p className="text-[10px] text-slate-300 italic">
                      "Prompt brief and lightning-fast escrow release. Would love to collaborate again!"
                    </p>
                  </div>

                  <div className="rounded-xl bg-gradient-to-r from-primary/20 to-indigo-500/20 p-3 border border-primary/40 text-center">
                    <span className="block text-[10px] font-bold text-white">Overall Trust Rating</span>
                    <span className="text-lg font-black text-primary">4.9 / 5.0 (38 Collaborations)</span>
                  </div>
                </div>
              )}

              {/* Mobile Bottom Navigation Bar */}
              <div className="pt-3 border-t border-slate-800/80 flex justify-around text-slate-500 text-[9px]">
                <div className="flex flex-col items-center text-primary font-bold">
                  <span>Feed</span>
                </div>
                <div className="flex flex-col items-center">
                  <span>Contracts</span>
                </div>
                <div className="flex flex-col items-center">
                  <span>Chat</span>
                </div>
                <div className="flex flex-col items-center">
                  <span>Wallet</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Deep Platform Architecture & Admin Portal Real-Time State (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Live Backend State Machine & Admin Portal Telemetry
              </span>
            </div>
            <Badge variant="purple" className="text-[10px]">
              NestJS + Prisma + PostgreSQL 16
            </Badge>
          </div>

          <Card className="border-border/80 bg-card/95 shadow-xl">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {steps[activeStep - 1].title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Architectural deep-dive into the state machine transitions and database models.
                  </p>
                </div>
                <Badge variant={activeStep === 4 ? 'success' : activeStep === 5 ? 'warning' : 'info'}>
                  State: {activeStep === 1 ? 'CAMPAIGN_PUBLISHED' : activeStep === 2 ? 'BID_SUBMITTED' : activeStep === 3 ? 'ESCROW_LOCKED' : activeStep === 4 ? 'APPROVED_PAYOUT' : activeStep === 5 ? 'DISPUTE_ARBITRATION' : 'COMPLETED_MUTUAL'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              
              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">Key Protocol</span>
                  <p className="text-xs font-bold text-foreground mt-1">
                    {activeStep === 1 && 'Multi-Deliverable Schema'}
                    {activeStep === 2 && 'Social Metric Aggregator'}
                    {activeStep === 3 && 'Razorpay Route Escrow'}
                    {activeStep === 4 && 'State Machine Automator'}
                    {activeStep === 5 && 'Arbitration Split Math'}
                    {activeStep === 6 && 'Reputation Ledger v2'}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">Security Layer</span>
                  <p className="text-xs font-bold text-foreground mt-1">
                    {activeStep === 1 && 'Role-Based Access Control'}
                    {activeStep === 2 && 'PAN / GSTIN KYC Gate'}
                    {activeStep === 3 && 'Regex Leak Guard'}
                    {activeStep === 4 && 'SHA-256 Webhook Hash'}
                    {activeStep === 5 && 'Audit Trail Transcript'}
                    {activeStep === 6 && 'Sybil-Proof Double-Blind'}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">Financial Impact</span>
                  <p className="text-xs font-bold text-emerald-400 mt-1">
                    {activeStep === 1 && '₹25,000 Budget Allocated'}
                    {activeStep === 2 && '₹22,000 Negotiated Bid'}
                    {activeStep === 3 && '100% Escrow Protected'}
                    {activeStep === 4 && '₹2,200 Platform Fee (10%)'}
                    {activeStep === 5 && 'Custom Pro-Rata Split'}
                    {activeStep === 6 && '₹1.84M Total Platform GMV'}
                  </p>
                </div>
              </div>

              {/* State Machine Transition Visualizer */}
              <div className="rounded-xl border border-border/60 bg-slate-950 p-4 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-400">Collaboration State Machine Flow</span>
                  <span className="text-[10px] font-mono text-primary">Prisma Schema v16</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                  <span className={`px-2 py-1 rounded-md font-mono ${activeStep >= 1 ? 'bg-indigo-900/60 text-indigo-200 border border-indigo-500' : 'bg-slate-900 text-slate-600'}`}>
                    DRAFT
                  </span>
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span className={`px-2 py-1 rounded-md font-mono ${activeStep >= 2 ? 'bg-indigo-900/60 text-indigo-200 border border-indigo-500' : 'bg-slate-900 text-slate-600'}`}>
                    BID_ACCEPTED
                  </span>
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span className={`px-2 py-1 rounded-md font-mono ${activeStep >= 3 ? 'bg-amber-900/60 text-amber-200 border border-amber-500' : 'bg-slate-900 text-slate-600'}`}>
                    PAYMENT_ESCROW
                  </span>
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span className={`px-2 py-1 rounded-md font-mono ${activeStep >= 4 ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-500' : 'bg-slate-900 text-slate-600'}`}>
                    SUBMITTED
                  </span>
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <span className={`px-2 py-1 rounded-md font-mono ${activeStep >= 4 ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-500' : 'bg-slate-900 text-slate-600'}`}>
                    APPROVED & SETTLED
                  </span>
                </div>
              </div>

              {/* Deep Narrative Explanation */}
              <div className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Story Narrative & Product Capability
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {activeStep === 1 && "Boat Lifestyle accesses the Business portal to configure campaign deliverables with strict requirements for 4K video resolution and specific hashtag compliance. The budget of ₹25,000 is prepared for escrow lock."}
                  {activeStep === 2 && "Rohit Sharma, verified with PAN and live social statistics (320k Instagram, 130k YouTube), browses available campaigns, submits a ₹22,000 bid with a 4-day delivery commitment."}
                  {activeStep === 3 && "Boat accepts the bid and funds ₹22,000 into Razorpay Escrow. Direct WebSocket chat enables seamless communication, while automated filters flag any off-platform contact attempts to ensure transaction safety."}
                  {activeStep === 4 && "Rohit submits the final 4K Instagram Reel. Boat inspects and grants 1-click approval. The NestJS state machine executes instant settlement: ₹19,800 to the creator and ₹2,200 (10%) platform revenue."}
                  {activeStep === 5 && "When disagreements arise, platform administrators step into the dispute dossier, review full communication transcripts, and use the split calculator to disburse funds equitably."}
                  {activeStep === 6 && "Both parties leave mutual 5-star ratings, boosting creator marketplace discoverability and brand trustworthiness across the nationwide creator economy."}
                </p>
              </div>

              {/* Quick Navigation to Admin Pages */}
              <div className="pt-2 flex flex-wrap gap-2">
                <a href="/dashboard" className="text-[11px] px-3 py-1.5 rounded-lg border border-border/80 bg-background/60 hover:bg-muted font-semibold text-foreground inline-flex items-center gap-1">
                  Admin Dashboard 📊
                </a>
                <a href="/campaigns" className="text-[11px] px-3 py-1.5 rounded-lg border border-border/80 bg-background/60 hover:bg-muted font-semibold text-foreground inline-flex items-center gap-1">
                  Campaign Directory 📢
                </a>
                <a href="/verifications" className="text-[11px] px-3 py-1.5 rounded-lg border border-border/80 bg-background/60 hover:bg-muted font-semibold text-foreground inline-flex items-center gap-1">
                  KYC Queue 🛡️
                </a>
                <a href="/disputes" className="text-[11px] px-3 py-1.5 rounded-lg border border-border/80 bg-background/60 hover:bg-muted font-semibold text-foreground inline-flex items-center gap-1">
                  Dispute Dossiers ⚖️
                </a>
                <a href="/payments" className="text-[11px] px-3 py-1.5 rounded-lg border border-border/80 bg-background/60 hover:bg-muted font-semibold text-foreground inline-flex items-center gap-1">
                  Escrow Ledger 💳
                </a>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
