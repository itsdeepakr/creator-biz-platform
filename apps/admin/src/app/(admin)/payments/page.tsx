'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CreditCard,
  Download,
  Search,
  CheckCircle2,
  Lock,
  TrendingUp,
} from 'lucide-react';
import { adminApi } from '@/lib/api-client';
import { PaymentStatus, EscrowTransactionType } from '@cbp/shared';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  Card,
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

export default function PaymentsEscrowLedgerPage() {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['admin-payments', activeTab],
    queryFn: () => adminApi.getPayments({ status: activeTab }),
  });

  const filteredPayments = payments.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.campaignTitle.toLowerCase().includes(q) ||
        p.businessName.toLowerCase().includes(q) ||
        p.creatorName.toLowerCase().includes(q) ||
        (p.razorpayPaymentId && p.razorpayPaymentId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalVolume = payments.reduce((sum, p) => sum + p.grossAmount, 0);
  const totalFees = payments.reduce((sum, p) => sum + p.platformFee, 0);
  const totalEscrowHeld = payments
    .filter((p) => p.status === PaymentStatus.ESCROW_HELD)
    .reduce((sum, p) => sum + p.grossAmount, 0);

  const handleExportCsv = () => {
    const headers = [
      'Transaction ID',
      'Razorpay Payment ID',
      'Campaign Title',
      'Business / Brand',
      'Creator',
      'Type',
      'Gross Amount (INR)',
      'Platform Fee (INR)',
      'Net Payout (INR)',
      'Escrow Status',
      'Timestamp',
    ];

    const rows = filteredPayments.map((p) => [
      p.id,
      p.razorpayPaymentId || 'N/A',
      `"${p.campaignTitle.replace(/"/g, '""')}"`,
      `"${p.businessName.replace(/"/g, '""')}"`,
      `"${p.creatorName.replace(/"/g, '""')}"`,
      p.type,
      p.grossAmount,
      p.platformFee,
      p.netPayout,
      p.status,
      p.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cbp_escrow_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Escrow Ledger & Payout Audit</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit Razorpay escrow transactions, platform fee deductions (10%), and bank settlement releases
          </p>
        </div>

        <Button onClick={handleExportCsv} size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Download className="h-4 w-4" />
          Export Ledger (CSV)
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Current Escrow Balance</p>
              <h4 className="text-xl font-bold text-foreground mt-1 font-mono">
                {formatCurrency(totalEscrowHeld)}
              </h4>
              <p className="text-[11px] text-amber-400 flex items-center gap-1 mt-0.5">
                <Lock className="h-3 w-3" /> Locked pending approval
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Lock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Platform Revenue Retained</p>
              <h4 className="text-xl font-bold text-foreground mt-1 font-mono">
                {formatCurrency(totalFees)}
              </h4>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3 w-3" /> 10% on completed collaborations
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Volume Audited</p>
              <h4 className="text-xl font-bold text-foreground mt-1 font-mono">
                {formatCurrency(totalVolume)}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">Across all transaction types</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table Card */}
      <Card className="border-border/60">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 border-b border-border">
          <Tabs
            tabs={[
              { id: 'ALL', label: 'All Transactions', count: payments.length },
              {
                id: 'ESCROW_HELD',
                label: 'Held in Escrow',
                count: payments.filter((p) => p.status === PaymentStatus.ESCROW_HELD).length,
              },
              {
                id: 'RELEASED',
                label: 'Released to Creator',
                count: payments.filter((p) => p.status === PaymentStatus.RELEASED).length,
              },
              {
                id: 'REFUNDED',
                label: 'Refunded to Brand',
                count: payments.filter((p) => p.status === PaymentStatus.REFUNDED).length,
              },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="border-b-0"
          />

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, brand, creator, RZP ID..."
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
                <TableHead>Collaboration & Parties</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Gross Escrow</TableHead>
                <TableHead>Platform Fee</TableHead>
                <TableHead>Net Payout</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Gateway Reference</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-xs text-muted-foreground">
                    Loading escrow transactions...
                  </TableCell>
                </TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-xs text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((pay) => (
                  <TableRow key={pay.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div>
                        <span className="font-semibold text-foreground text-xs block">
                          {pay.campaignTitle}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {pay.businessName} → {pay.creatorName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          pay.type === EscrowTransactionType.FUND
                            ? 'info'
                            : pay.type === EscrowTransactionType.RELEASE
                            ? 'success'
                            : 'warning'
                        }
                        className="text-[10px]"
                      >
                        {pay.type}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-mono text-xs font-bold text-foreground">
                      {formatCurrency(pay.grossAmount)}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-emerald-400 font-medium">
                      {pay.platformFee > 0 ? formatCurrency(pay.platformFee) : '—'}
                    </TableCell>

                    <TableCell className="font-mono text-xs font-semibold text-purple-400">
                      {pay.netPayout > 0 ? formatCurrency(pay.netPayout) : '—'}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          pay.status === PaymentStatus.RELEASED
                            ? 'success'
                            : pay.status === PaymentStatus.ESCROW_HELD
                            ? 'warning'
                            : pay.status === PaymentStatus.REFUNDED
                            ? 'info'
                            : 'destructive'
                        }
                        className="text-[10px]"
                      >
                        {pay.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-[11px] text-muted-foreground block truncate max-w-[140px]">
                        {pay.razorpayPaymentId || pay.paymentId}
                      </span>
                    </TableCell>

                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDateTime(pay.createdAt)}
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
