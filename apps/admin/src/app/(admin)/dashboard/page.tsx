'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  IndianRupee,
  TrendingUp,
  Megaphone,
  Scale,
  ShieldCheck,
  Users,
  CreditCard,
  ArrowUpRight,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { adminApi, ActivityItem } from '@/lib/api-client';
import { formatCurrency, formatNumber, formatDateTime } from '@/lib/utils';
import {
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
} from '@/components/ui';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export default function DashboardPage() {
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => adminApi.getDashboardMetrics(),
  });

  const { data: trends, isLoading: loadingTrends } = useQuery({
    queryKey: ['admin-revenue-trends'],
    queryFn: () => adminApi.getRevenueTrends(),
  });

  const { data: activities, isLoading: loadingActivities } = useQuery({
    queryKey: ['admin-activities'],
    queryFn: () => adminApi.getRecentActivities(),
  });

  return (
    <div className="space-y-8">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary/15 via-indigo-500/10 to-transparent p-6 border border-primary/20">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">Welcome to Admin Operations</h2>
            <Badge variant="purple" className="text-[10px] font-semibold">
              Live Escrow v2.4
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Real-time collaboration monitoring, Razorpay escrow settlement audit, automated KYC pipelines, and dispute adjudication engine.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/verifications">
            <Button variant="outline" size="sm" className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
              <ShieldCheck className="h-4 w-4" />
              KYC Queue ({metrics?.pendingKycCount ?? 7})
            </Button>
          </Link>
          <Link href="/disputes">
            <Button size="sm" className="gap-1.5 shadow-md shadow-primary/20">
              <Scale className="h-4 w-4" />
              Disputes ({metrics?.pendingDisputes ?? 3})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Gross Merchandise Value (GMV)"
          value={loadingMetrics ? '—' : formatCurrency(metrics?.gmv || 0)}
          change={metrics?.gmvGrowth}
          changeLabel="vs last month"
          icon={<IndianRupee className="h-5 w-5" />}
        />
        <StatCard
          title="Platform Net Revenue (10%)"
          value={loadingMetrics ? '—' : formatCurrency(metrics?.platformRevenue || 0)}
          change={metrics?.revenueGrowth}
          changeLabel="vs last month"
          icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
        />
        <StatCard
          title="Active Campaigns"
          value={loadingMetrics ? '—' : formatNumber(metrics?.activeCampaigns || 0)}
          change={metrics?.campaignsGrowth}
          changeLabel="18 closing this week"
          icon={<Megaphone className="h-5 w-5 text-blue-400" />}
        />
        <StatCard
          title="Pending Disputes"
          value={loadingMetrics ? '—' : metrics?.pendingDisputes ?? 0}
          description="Avg resolution time 2.4h"
          icon={<Scale className="h-5 w-5 text-amber-400" />}
        />
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Escrow Funds in Custody</p>
              <h4 className="text-xl font-bold text-foreground mt-1">
                {loadingMetrics ? '—' : formatCurrency(metrics?.activeEscrowBalance || 0)}
              </h4>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                <CheckCircle2 className="h-3 w-3" /> Razorpay Market Escrow 100% Backed
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CreditCard className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Active Verified Creators</p>
              <h4 className="text-xl font-bold text-foreground mt-1">
                {loadingMetrics ? '—' : formatNumber(metrics?.totalCreators || 0)}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-1">Instagram, YouTube & Threads</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Active Verified Brands</p>
              <h4 className="text-xl font-bold text-foreground mt-1">
                {loadingMetrics ? '—' : formatNumber(metrics?.totalBusinesses || 0)}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-1">D2C, Tech, FMCG, Lifestyle</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Platform GMV & Net Revenue Trend</CardTitle>
              <CardDescription className="text-xs">
                Monthly gross collaboration throughput (INR) & 10% platform take
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Last 6 Months
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px] w-full">
              {loadingTrends ? (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Loading trendlines...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trends || []}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorFee" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                      formatter={(val: any) => [formatCurrency(Number(val)), '']}
                    />
                    <Area
                      type="monotone"
                      dataKey="gmv"
                      name="Gross Volume (GMV)"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorGmv)"
                    />
                    <Area
                      type="monotone"
                      dataKey="platformFee"
                      name="Platform Fee (10%)"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorFee)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payout Settlement Flow</CardTitle>
            <CardDescription className="text-xs">
              Escrow funded vs Creator payouts completed
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px] w-full">
              {loadingTrends ? (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Loading settlement chart...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                      formatter={(val: any) => [formatCurrency(Number(val)), '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="payouts" name="Creator Payouts" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="platformFee" name="Platform Net" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Logs & Quick Review Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Live Platform Events & Audit Stream
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time transactions, KYC submissions and dispute triggers
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[11px]">
              Auto-updating
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingActivities ? (
              <div className="py-8 text-center text-xs text-muted-foreground">Loading activity feed...</div>
            ) : activities?.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">No recent activities.</div>
            ) : (
              activities?.map((act: ActivityItem) => (
                <div
                  key={act.id}
                  className="flex items-start justify-between rounded-xl border border-border/50 bg-card/60 p-3.5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        act.severity === 'warning'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : act.severity === 'success'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-primary/10 text-primary border border-primary/20'
                      }`}
                    >
                      {act.type === 'DISPUTE' ? (
                        <Scale className="h-4 w-4" />
                      ) : act.type === 'VERIFICATION' ? (
                        <ShieldCheck className="h-4 w-4" />
                      ) : act.type === 'PAYMENT' ? (
                        <IndianRupee className="h-4 w-4" />
                      ) : (
                        <Megaphone className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-foreground">{act.title}</h5>
                      <p className="text-xs text-muted-foreground mt-0.5">{act.description}</p>
                      <span className="text-[10px] text-muted-foreground/80 mt-1 block">
                        {formatDateTime(act.timestamp)}
                      </span>
                    </div>
                  </div>

                  {act.type === 'DISPUTE' ? (
                    <Link href="/disputes">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary">
                        Review <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  ) : act.type === 'VERIFICATION' ? (
                    <Link href="/verifications">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary">
                        Verify <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Fast Control Actions</CardTitle>
            <CardDescription className="text-xs">One-click administrative workflows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/verifications" className="block">
              <div className="group flex items-center justify-between rounded-xl border border-border/50 p-3.5 transition-all hover:border-primary/40 hover:bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-foreground group-hover:text-primary">
                      KYC Verification Queue
                    </h5>
                    <p className="text-[11px] text-muted-foreground">7 profiles pending approval</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
            </Link>

            <Link href="/disputes" className="block">
              <div className="group flex items-center justify-between rounded-xl border border-border/50 p-3.5 transition-all hover:border-primary/40 hover:bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                    <Scale className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-foreground group-hover:text-primary">
                      Dispute Settlement Desk
                    </h5>
                    <p className="text-[11px] text-muted-foreground">3 cases awaiting arbitration</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
            </Link>

            <Link href="/payments" className="block">
              <div className="group flex items-center justify-between rounded-xl border border-border/50 p-3.5 transition-all hover:border-primary/40 hover:bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-foreground group-hover:text-primary">
                      Export Escrow Ledger
                    </h5>
                    <p className="text-[11px] text-muted-foreground">Download Razorpay reconciliation CSV</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
            </Link>

            <Link href="/settings" className="block">
              <div className="group flex items-center justify-between rounded-xl border border-border/50 p-3.5 transition-all hover:border-primary/40 hover:bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-foreground group-hover:text-primary">
                      Platform Fee Configuration
                    </h5>
                    <p className="text-[11px] text-muted-foreground">Currently 10.0% take rate</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
