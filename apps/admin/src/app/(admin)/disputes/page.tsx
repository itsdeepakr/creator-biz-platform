'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Scale,
  Search,
  ArrowRight,
  Building,
  User,
} from 'lucide-react';
import { adminApi, DisputeRecord } from '@/lib/api-client';
import { DisputeStatus } from '@cbp/shared';
import { formatCurrency } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Input,
  Tabs,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';

export default function DisputesListPage() {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ['admin-disputes', activeTab],
    queryFn: () => adminApi.getDisputes(activeTab),
  });

  const filteredDisputes = disputes.filter((d) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.campaignTitle.toLowerCase().includes(q) ||
        d.creatorName.toLowerCase().includes(q) ||
        d.businessName.toLowerCase().includes(q) ||
        d.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalEscrowAtRisk = disputes.reduce((acc, curr) => acc + curr.escrowAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Dispute Resolution & Escrow Arbitration</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Adjudicate contractual disagreements, inspect communication logs, and execute automated split payouts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-right">
            <span className="text-[10px] font-semibold uppercase text-amber-400">Escrow in Arbitration</span>
            <p className="text-sm font-bold text-foreground">{formatCurrency(totalEscrowAtRisk)}</p>
          </div>
        </div>
      </div>

      {/* Disputes Table Container */}
      <Card className="border-border/60">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 border-b border-border">
          <Tabs
            tabs={[
              { id: 'ALL', label: 'All Disputes', count: disputes.length },
              {
                id: 'OPEN',
                label: 'Open Cases',
                count: disputes.filter((d) => d.status === DisputeStatus.OPEN).length,
              },
              {
                id: 'UNDER_REVIEW',
                label: 'Under Review',
                count: disputes.filter((d) => d.status === DisputeStatus.UNDER_REVIEW).length,
              },
              {
                id: 'RESOLVED',
                label: 'Resolved',
                count: disputes.filter((d) => d.status.toString().startsWith('RESOLVED')).length,
              },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="border-b-0"
          />

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns, parties, reasons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case & Campaign</TableHead>
                <TableHead>Disputing Parties</TableHead>
                <TableHead>Escrow Held</TableHead>
                <TableHead>Category / Reason</TableHead>
                <TableHead>Initiator</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground">
                    Loading dispute cases...
                  </TableCell>
                </TableRow>
              ) : filteredDisputes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground">
                    No disputes found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDisputes.map((dispute) => (
                  <TableRow key={dispute.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div>
                        <span className="font-semibold text-foreground text-xs block">
                          {dispute.campaignTitle}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          Case #{dispute.id}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-foreground">
                          <Building className="h-3 w-3 text-blue-400" />
                          <span className="font-medium">{dispute.businessName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="h-3 w-3 text-purple-400" />
                          <span>{dispute.creatorName}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <span className="font-mono text-xs font-bold text-foreground">
                          {formatCurrency(dispute.escrowAmount)}
                        </span>
                        <span className="block text-[10px] text-muted-foreground">
                          Fee: {formatCurrency(dispute.platformFeeAmount)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="max-w-xs">
                      <div>
                        <Badge variant="outline" className="text-[10px] mb-1">
                          {dispute.category}
                        </Badge>
                        <p className="text-xs text-muted-foreground truncate">{dispute.reason}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={dispute.initiatedBy === 'BUSINESS' ? 'info' : 'purple'}
                        className="text-[10px]"
                      >
                        By {dispute.initiatedBy}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          dispute.status === DisputeStatus.OPEN
                            ? 'warning'
                            : dispute.status === DisputeStatus.UNDER_REVIEW
                            ? 'info'
                            : 'success'
                        }
                        className="text-[10px]"
                      >
                        {dispute.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <Link href={`/disputes/${dispute.id}`}>
                        <Button size="sm" className="h-8 text-xs gap-1">
                          Adjudicate <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
