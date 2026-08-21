'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  Scale,
  ShieldCheck,
  Building,
  User,
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Calculator,
} from 'lucide-react';
import { adminApi } from '@/lib/api-client';
import { DisputeStatus, DisputeOutcome } from '@cbp/shared';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Textarea,
  Modal,
  Alert,
} from '@/components/ui';

export default function DisputeDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const disputeId = params.id as string;

  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [outcome, setOutcome] = useState<DisputeOutcome>(DisputeOutcome.PARTIAL_BOTH);
  const [creatorSplitPercent, setCreatorSplitPercent] = useState<number>(50);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: dispute, isLoading } = useQuery({
    queryKey: ['admin-dispute-detail', disputeId],
    queryFn: () => adminApi.getDisputeById(disputeId),
  });

  const resolveMutation = useMutation({
    mutationFn: (data: {
      outcome: DisputeOutcome;
      resolutionNotes: string;
      amountRefunded?: number;
      amountReleased?: number;
    }) => adminApi.resolveDispute(disputeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dispute-detail', disputeId] });
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      setIsSettlementModalOpen(false);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to execute settlement');
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-xs text-muted-foreground">Loading dispute dossier...</p>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="space-y-4">
        <Alert variant="danger">Dispute case not found.</Alert>
        <Link href="/disputes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Disputes
          </Button>
        </Link>
      </div>
    );
  }

  const grossEscrow = dispute.escrowAmount || 50000;
  const platformFeeRate = 0.1; // 10%
  const businessSplitPercent = 100 - creatorSplitPercent;

  const rawCreatorShare = (grossEscrow * creatorSplitPercent) / 100;
  const platformFeeDeduction = rawCreatorShare * platformFeeRate;
  const creatorNetPayout = rawCreatorShare - platformFeeDeduction;
  const businessRefundAmount = (grossEscrow * businessSplitPercent) / 100;

  const handleSelectPreset = (preset: 'CREATOR_100' | 'BUSINESS_100' | 'SPLIT_50' | 'SPLIT_70_30') => {
    if (preset === 'CREATOR_100') {
      setOutcome(DisputeOutcome.PAYOUT_CREATOR);
      setCreatorSplitPercent(100);
    } else if (preset === 'BUSINESS_100') {
      setOutcome(DisputeOutcome.REFUND_BUSINESS);
      setCreatorSplitPercent(0);
    } else if (preset === 'SPLIT_50') {
      setOutcome(DisputeOutcome.PARTIAL_BOTH);
      setCreatorSplitPercent(50);
    } else if (preset === 'SPLIT_70_30') {
      setOutcome(DisputeOutcome.PARTIAL_BOTH);
      setCreatorSplitPercent(70);
    }
  };

  const handleExecuteSettlement = () => {
    if (!resolutionNotes.trim()) {
      setErrorMsg('Mandatory arbitration resolution finding notes are required.');
      return;
    }
    setErrorMsg(null);
    resolveMutation.mutate({
      outcome,
      resolutionNotes,
      amountReleased: creatorNetPayout,
      amountRefunded: businessRefundAmount,
    });
  };

  const isResolved =
    dispute.status !== DisputeStatus.OPEN && dispute.status !== DisputeStatus.UNDER_REVIEW;

  return (
    <div className="space-y-6">
      {/* Back Navigation & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/disputes">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">Dispute Dossier #{dispute.id}</h2>
              <Badge
                variant={isResolved ? 'success' : 'warning'}
                className="text-[10px] uppercase font-bold"
              >
                {dispute.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Campaign: <span className="text-foreground font-medium">{dispute.campaignTitle}</span> |
              Filed on {formatDateTime(dispute.createdAt)}
            </p>
          </div>
        </div>

        {!isResolved ? (
          <Button
            size="sm"
            onClick={() => {
              setErrorMsg(null);
              setIsSettlementModalOpen(true);
            }}
            className="gap-2 bg-gradient-to-r from-primary to-indigo-600 shadow-md shadow-primary/25"
          >
            <Scale className="h-4 w-4" />
            Adjudicate & Settle Escrow
          </Button>
        ) : (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Adjudication Executed on{' '}
            {formatDateTime(dispute.resolvedAt)}
          </div>
        )}
      </div>

      {/* Disputing Parties & Escrow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-border/60">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-blue-400" /> Brand / Business
            </span>
            {dispute.initiatedBy === 'BUSINESS' && (
              <Badge variant="info" className="text-[9px]">
                Initiator
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-1.5">
            <h4 className="text-sm font-bold text-foreground">{dispute.businessName}</h4>
            <p className="text-xs text-muted-foreground">ID: {dispute.businessId}</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-purple-400" /> Content Creator
            </span>
            {dispute.initiatedBy === 'CREATOR' && (
              <Badge variant="purple" className="text-[9px]">
                Initiator
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-1.5">
            <h4 className="text-sm font-bold text-foreground">{dispute.creatorName}</h4>
            <p className="text-xs text-muted-foreground">ID: {dispute.creatorId}</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-primary/5 border-primary/20">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <span className="text-[11px] font-semibold text-primary uppercase flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Razorpay Escrow Locked
            </span>
            <Badge variant="default" className="text-[9px]">
              Custody
            </Badge>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <h4 className="text-xl font-mono font-bold text-foreground">
              {formatCurrency(dispute.escrowAmount)}
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Standard 10% Platform Fee: {formatCurrency(dispute.platformFeeAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grievance Statement */}
      <Card className="border-border/60">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Formal Disagreement Ground: {dispute.category}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <p className="text-xs text-foreground bg-muted/30 p-3.5 rounded-xl leading-relaxed border border-border/40">
            {dispute.reason}
          </p>
        </CardContent>
      </Card>

      {/* Grid: Chat Audit Log + Evidence Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Audit Log */}
        <Card className="border-border/60">
          <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Collaboration In-App Chat Audit
              </CardTitle>
              <CardDescription className="text-[11px]">
                Immutable server audit log of messages between Brand and Creator
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px]">
              {dispute.chatAuditLogs?.length || 0} Messages
            </Badge>
          </CardHeader>
          <CardContent className="p-4 max-h-[420px] overflow-y-auto space-y-3">
            {dispute.chatAuditLogs?.map((msg) => {
              const isBusiness = msg.senderRole === 'BUSINESS';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col rounded-xl p-3 text-xs space-y-1 ${
                    isBusiness
                      ? 'bg-blue-500/10 border border-blue-500/20 mr-6'
                      : 'bg-purple-500/10 border border-purple-500/20 ml-6'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      {isBusiness ? (
                        <Building className="h-3 w-3 text-blue-400" />
                      ) : (
                        <User className="h-3 w-3 text-purple-400" />
                      )}
                      {msg.senderName} ({msg.senderRole})
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDateTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">{msg.content}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Evidence Vault */}
        <Card className="border-border/60">
          <CardHeader className="p-4 border-b border-border">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Evidence Vault & Media Attachments
            </CardTitle>
            <CardDescription className="text-[11px]">
              Screenshots, raw footage links and brief revision records
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 max-h-[420px] overflow-y-auto space-y-4">
            <div>
              <h5 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                Creator Submissions
              </h5>
              {Array.isArray(dispute.creatorEvidence) && dispute.creatorEvidence.length > 0 ? (
                dispute.creatorEvidence.map((ev) => (
                  <div key={ev.id} className="rounded-xl border border-border bg-card/40 p-3 space-y-2 mb-2">
                    <p className="text-xs text-foreground">{ev.description}</p>
                    {ev.mediaUrls && (
                      <div className="flex flex-wrap gap-2">
                        {ev.mediaUrls.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary flex items-center gap-1 hover:underline bg-primary/10 px-2 py-1 rounded-md"
                          >
                            Evidence Asset #{idx + 1} <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No creator evidence filed.</p>
              )}
            </div>

            <div>
              <h5 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                Business Submissions
              </h5>
              {Array.isArray(dispute.businessEvidence) && dispute.businessEvidence.length > 0 ? (
                dispute.businessEvidence.map((ev) => (
                  <div key={ev.id} className="rounded-xl border border-border bg-card/40 p-3 space-y-2 mb-2">
                    <p className="text-xs text-foreground">{ev.description}</p>
                    {ev.mediaUrls && (
                      <div className="flex flex-wrap gap-2">
                        {ev.mediaUrls.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary flex items-center gap-1 hover:underline bg-primary/10 px-2 py-1 rounded-md"
                          >
                            Evidence Asset #{idx + 1} <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No business evidence filed.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resolution Notes If already settled */}
      {isResolved && dispute.resolutionNotes && (
        <Alert variant="success" title="Arbitration Settlement Findings">
          <p className="text-xs">{dispute.resolutionNotes}</p>
          <div className="mt-2 flex gap-4 text-xs font-mono">
            <span>Creator Payout: {formatCurrency(dispute.amountReleased || 0)}</span>
            <span>Business Refund: {formatCurrency(dispute.amountRefunded || 0)}</span>
          </div>
        </Alert>
      )}

      {/* Interactive Settlement Modal with Split Percentage Calculator */}
      <Modal
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        title="Escrow Settlement & Split Calculator"
        description={`Collaboration: ${dispute.campaignTitle} | Total Escrow: ${formatCurrency(grossEscrow)}`}
        maxWidth="2xl"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setIsSettlementModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleExecuteSettlement}
              isLoading={resolveMutation.isPending}
              className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600"
            >
              <CheckCircle2 className="h-4 w-4" />
              Execute Escrow Release & Refund
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase block mb-2">
              Settlement Allocation Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                variant={creatorSplitPercent === 100 ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSelectPreset('CREATOR_100')}
                className="text-xs"
              >
                100% Creator
              </Button>
              <Button
                variant={creatorSplitPercent === 0 ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSelectPreset('BUSINESS_100')}
                className="text-xs"
              >
                100% Brand Refund
              </Button>
              <Button
                variant={creatorSplitPercent === 50 ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSelectPreset('SPLIT_50')}
                className="text-xs"
              >
                50 / 50 Split
              </Button>
              <Button
                variant={creatorSplitPercent === 70 ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSelectPreset('SPLIT_70_30')}
                className="text-xs"
              >
                70% Creator / 30%
              </Button>
            </div>
          </div>

          {/* Split Slider */}
          <div className="rounded-xl border border-border bg-card/60 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-purple-400">Creator Share: {creatorSplitPercent}%</span>
              <span className="text-blue-400">Brand Refund: {businessSplitPercent}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={creatorSplitPercent}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCreatorSplitPercent(val);
                if (val === 100) setOutcome(DisputeOutcome.PAYOUT_CREATOR);
                else if (val === 0) setOutcome(DisputeOutcome.REFUND_BUSINESS);
                else setOutcome(DisputeOutcome.PARTIAL_BOTH);
              }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Financial Breakdown Card */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
            <h5 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="h-3.5 w-3.5 text-primary" />
              Calculated Payout & Refund Ledger
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-lg bg-card p-3 border border-border/60">
                <span className="text-[10px] text-purple-400 font-semibold uppercase block">
                  Creator Net Payout
                </span>
                <p className="text-base font-mono font-bold text-foreground">
                  {formatCurrency(creatorNetPayout)}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  (Fee: {formatCurrency(platformFeeDeduction)})
                </span>
              </div>

              <div className="rounded-lg bg-card p-3 border border-border/60">
                <span className="text-[10px] text-blue-400 font-semibold uppercase block">
                  Brand Refund Amount
                </span>
                <p className="text-base font-mono font-bold text-foreground">
                  {formatCurrency(businessRefundAmount)}
                </p>
                <span className="text-[10px] text-muted-foreground">Returned via Razorpay</span>
              </div>

              <div className="rounded-lg bg-card p-3 border border-border/60">
                <span className="text-[10px] text-emerald-400 font-semibold uppercase block">
                  Platform Fee Retained
                </span>
                <p className="text-base font-mono font-bold text-foreground">
                  {formatCurrency(platformFeeDeduction)}
                </p>
                <span className="text-[10px] text-muted-foreground">10% on Creator share</span>
              </div>
            </div>
          </div>

          {/* Mandatory Resolution Notes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Formal Arbitration Findings & Notes *
            </label>
            <Textarea
              placeholder="State the arbitration findings, evidence review rationale, and reason for percentage allocation..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={4}
              required
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
