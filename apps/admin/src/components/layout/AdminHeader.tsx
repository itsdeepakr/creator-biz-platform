'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, ShieldCheck } from 'lucide-react';
import { Badge, Button } from '@/components/ui';

const pageTitleMap: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Platform Executive Overview', subtitle: 'Real-time metrics, GMV trendlines & core activity pulse' },
  '/verifications': { title: 'KYC & Identity Verification Queue', subtitle: 'PAN, GST, Aadhaar and business registration approval pipeline' },
  '/disputes': { title: 'Dispute Resolution & Escrow Settlement', subtitle: 'Adjudicate collaboration disputes, evidence vaults, chat logs & split release' },
  '/campaigns': { title: 'Campaign Moderation Directory', subtitle: 'Audit brand campaigns, toggle featured status & manage platform safety' },
  '/users': { title: 'User Management & Directory', subtitle: 'Creators, Businesses and Admin directory with suspension controls' },
  '/payments': { title: 'Escrow Transactions & Payout Ledger', subtitle: 'Razorpay payment flow, platform fee reconciliation & escrow tracking' },
  '/reviews': { title: 'Review & Rating Moderation', subtitle: 'Monitor bilateral reviews, manage flagged comments & reputation scores' },
  '/settings': { title: 'Platform Global Configuration', subtitle: 'Platform commission fee %, escrow release rules & system parameters' },
};

export function AdminHeader() {
  const pathname = usePathname();

  const matchingKey = Object.keys(pageTitleMap).find((k) =>
    pathname === k || (k !== '/dashboard' && pathname.startsWith(k))
  );
  const info = matchingKey ? pageTitleMap[matchingKey] : { title: 'Administration', subtitle: 'Control Center' };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-8 backdrop-blur-md">
      <div>
        <h1 className="text-base font-bold tracking-tight text-foreground">{info.title}</h1>
        <p className="text-xs text-muted-foreground hidden sm:block">{info.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="success" className="hidden md:flex items-center gap-1.5 py-1 px-3">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Production Live
        </Badge>

        <Badge variant="purple" className="flex items-center gap-1.5 py-1 px-3">
          <ShieldCheck className="h-3 w-3" />
          Escrow Protected
        </Badge>

        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl relative">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            4
          </span>
        </Button>
      </div>
    </header>
  );
}
