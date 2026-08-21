'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  FileCheck,
  Building,
  User,
  ExternalLink,
} from 'lucide-react';
import { adminApi, KycRecord } from '@/lib/api-client';
import { VerificationStatus, UserRole } from '@cbp/shared';
import { formatDateTime } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Input,
  Textarea,
  Tabs,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Alert,
} from '@/components/ui';

export default function VerificationsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CREATOR' | 'BUSINESS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedRecord, setSelectedRecord] = useState<KycRecord | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<VerificationStatus | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const { data: kycList = [], isLoading } = useQuery({
    queryKey: ['admin-kyc', activeTab],
    queryFn: () => adminApi.getKycQueue(activeTab),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: VerificationStatus; notes: string }) =>
      adminApi.reviewKyc(id, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      setIsReviewModalOpen(false);
      setSelectedRecord(null);
      setReviewNotes('');
    },
  });

  const handleOpenReview = (record: KycRecord, action: VerificationStatus) => {
    setSelectedRecord(record);
    setReviewAction(action);
    setReviewNotes('');
    setIsReviewModalOpen(true);
  };

  const handleConfirmReview = () => {
    if (!selectedRecord || !reviewAction) return;
    reviewMutation.mutate({
      id: selectedRecord.id,
      status: reviewAction,
      notes: reviewNotes,
    });
  };

  const filteredList = kycList.filter((item) => {
    if (roleFilter !== 'ALL' && item.userRole !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.userName.toLowerCase().includes(q) ||
        item.userEmail.toLowerCase().includes(q) ||
        item.entityName.toLowerCase().includes(q) ||
        (item.documents.panNumber && item.documents.panNumber.toLowerCase().includes(q)) ||
        (item.documents.gstNumber && item.documents.gstNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const tabCounts = {
    ALL: kycList.length,
    PENDING: kycList.filter((k) => k.verificationStatus === VerificationStatus.PENDING).length,
    UNDER_REVIEW: kycList.filter((k) => k.verificationStatus === VerificationStatus.UNDER_REVIEW).length,
    VERIFIED: kycList.filter(
      (k) =>
        k.verificationStatus === VerificationStatus.VERIFIED ||
        k.verificationStatus === VerificationStatus.APPROVED
    ).length,
    REQUIRES_INFO: kycList.filter((k) => k.verificationStatus === VerificationStatus.REQUIRES_INFO).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">KYC Verification Operations</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit government identity documents, PAN format compliance, and GSTIN registration certificates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={roleFilter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRoleFilter('ALL')}
          >
            All Entities
          </Button>
          <Button
            variant={roleFilter === 'CREATOR' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRoleFilter('CREATOR')}
            className="gap-1.5"
          >
            <User className="h-3.5 w-3.5" /> Creators
          </Button>
          <Button
            variant={roleFilter === 'BUSINESS' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRoleFilter('BUSINESS')}
            className="gap-1.5"
          >
            <Building className="h-3.5 w-3.5" /> Businesses
          </Button>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <Card className="border-border/60">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 border-b border-border">
          <Tabs
            tabs={[
              { id: 'ALL', label: 'All Requests', count: tabCounts.ALL },
              { id: 'PENDING', label: 'Pending Review', count: tabCounts.PENDING },
              { id: 'UNDER_REVIEW', label: 'In Progress', count: tabCounts.UNDER_REVIEW },
              { id: 'VERIFIED', label: 'Verified', count: tabCounts.VERIFIED },
              { id: 'REQUIRES_INFO', label: 'Info Requested', count: tabCounts.REQUIRES_INFO },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="border-b-0"
          />

          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, PAN, GST..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity / User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>PAN / Tax ID</TableHead>
                <TableHead>GSTIN Status</TableHead>
                <TableHead>Verification Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground">
                    Loading verification queues...
                  </TableCell>
                </TableRow>
              ) : filteredList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground">
                    No verification records matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredList.map((record) => {
                  const isCreator = record.userRole === UserRole.CREATOR;

                  return (
                    <TableRow key={record.id} className="hover:bg-muted/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                            {isCreator ? <User className="h-4 w-4" /> : <Building className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-xs">{record.userName}</div>
                            <div className="text-[11px] text-muted-foreground">{record.userEmail}</div>
                            {record.entityName && (
                              <span className="text-[10px] text-primary/80 block">{record.entityName}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={isCreator ? 'purple' : 'info'} className="text-[10px]">
                          {record.userRole}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {record.documents.panNumber ? (
                          <div className="space-y-0.5">
                            <span className="font-mono text-xs font-semibold text-foreground">
                              {record.documents.panNumber}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" /> Valid Format
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {record.documents.gstNumber ? (
                          <div className="space-y-0.5">
                            <span className="font-mono text-xs font-semibold text-foreground">
                              {record.documents.gstNumber}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" /> Active GSTIN
                            </span>
                          </div>
                        ) : isCreator ? (
                          <span className="text-[11px] text-muted-foreground">Exempt (Creator)</span>
                        ) : (
                          <span className="text-[11px] text-amber-400 font-medium">Missing GST</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            record.verificationStatus === VerificationStatus.VERIFIED ||
                            record.verificationStatus === VerificationStatus.APPROVED
                              ? 'success'
                              : record.verificationStatus === VerificationStatus.REQUIRES_INFO
                              ? 'warning'
                              : record.verificationStatus === VerificationStatus.REJECTED
                              ? 'destructive'
                              : 'info'
                          }
                          className="text-[10px]"
                        >
                          {record.verificationStatus}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(record.submittedAt)}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRecord(record)}
                            className="h-8 text-xs gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" /> Inspect
                          </Button>

                          {record.verificationStatus !== VerificationStatus.VERIFIED &&
                            record.verificationStatus !== VerificationStatus.APPROVED && (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleOpenReview(record, VerificationStatus.VERIFIED)}
                                  className="h-8 text-xs gap-1"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                                </Button>

                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleOpenReview(record, VerificationStatus.REJECTED)}
                                  className="h-8 text-xs gap-1"
                                >
                                  <XCircle className="h-3.5 w-3.5" /> Reject
                                </Button>
                              </>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Document Inspector Modal */}
      {selectedRecord && !isReviewModalOpen && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={`KYC Dossier — ${selectedRecord.userName}`}
          description={`Registered Role: ${selectedRecord.userRole} | Entity: ${selectedRecord.entityName || selectedRecord.userName}`}
          maxWidth="4xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Submitted on {formatDateTime(selectedRecord.submittedAt)}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => handleOpenReview(selectedRecord, VerificationStatus.REQUIRES_INFO)}
                  className="gap-1.5"
                >
                  <AlertCircle className="h-4 w-4" /> Request Clarification
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleOpenReview(selectedRecord, VerificationStatus.REJECTED)}
                  className="gap-1.5"
                >
                  <XCircle className="h-4 w-4" /> Reject KYC
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleOpenReview(selectedRecord, VerificationStatus.VERIFIED)}
                  className="gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve & Verify
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card/50 p-4 space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Government PAN</p>
                <p className="font-mono text-sm font-bold text-foreground">
                  {selectedRecord.documents.panNumber || 'Not provided'}
                </p>
                <Badge variant="success" className="text-[10px] mt-1">
                  Format Validated
                </Badge>
              </div>

              {selectedRecord.userRole === UserRole.BUSINESS && (
                <div className="rounded-xl border border-border bg-card/50 p-4 space-y-1">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase">GSTIN Certificate</p>
                  <p className="font-mono text-sm font-bold text-foreground">
                    {selectedRecord.documents.gstNumber || 'Not provided'}
                  </p>
                  <Badge variant="info" className="text-[10px] mt-1">
                    State: {selectedRecord.documents.gstNumber?.slice(0, 2) || '27 (MH)'}
                  </Badge>
                </div>
              )}

              <div className="rounded-xl border border-border bg-card/50 p-4 space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Payout Bank Account</p>
                <p className="text-xs font-semibold text-foreground">
                  {selectedRecord.documents.bankAccountHolderName || selectedRecord.userName}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  Acc: {selectedRecord.documents.bankAccountNumber || '•••• •••• 1012'} | IFSC:{' '}
                  {selectedRecord.documents.bankIfsc || 'HDFC0001234'}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-primary" />
                Submitted Verification Documents
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedRecord.documents.idDocumentUrl && (
                  <div className="rounded-xl border border-border overflow-hidden bg-muted/20">
                    <div className="flex items-center justify-between p-3 border-b border-border bg-card">
                      <span className="text-xs font-semibold text-foreground">
                        {selectedRecord.documents.idDocumentType || 'Government ID'} Document
                      </span>
                      <a
                        href={selectedRecord.documents.idDocumentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary flex items-center gap-1 hover:underline"
                      >
                        Open Original <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="p-4 flex items-center justify-center bg-black/40 min-h-[220px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedRecord.documents.idDocumentUrl}
                        alt="ID Proof"
                        className="max-h-[200px] w-auto rounded-lg object-contain shadow-md"
                      />
                    </div>
                  </div>
                )}

                {selectedRecord.documents.gstCertificateUrl && (
                  <div className="rounded-xl border border-border overflow-hidden bg-muted/20">
                    <div className="flex items-center justify-between p-3 border-b border-border bg-card">
                      <span className="text-xs font-semibold text-foreground">GST Registration Certificate</span>
                      <a
                        href={selectedRecord.documents.gstCertificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary flex items-center gap-1 hover:underline"
                      >
                        Open Original <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="p-4 flex items-center justify-center bg-black/40 min-h-[220px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedRecord.documents.gstCertificateUrl}
                        alt="GST Proof"
                        className="max-h-[200px] w-auto rounded-lg object-contain shadow-md"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedRecord.verificationNotes && (
              <Alert variant="warning" title="Previous Verification Audit Notes">
                {selectedRecord.verificationNotes}
              </Alert>
            )}
          </div>
        </Modal>
      )}

      {/* Review Action Confirmation Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={
          reviewAction === VerificationStatus.VERIFIED
            ? 'Approve KYC Verification'
            : reviewAction === VerificationStatus.REJECTED
            ? 'Reject KYC Submission'
            : 'Request Additional KYC Information'
        }
        description={`Record: ${selectedRecord?.userName} (${selectedRecord?.userEmail})`}
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={
                reviewAction === VerificationStatus.VERIFIED
                  ? 'success'
                  : reviewAction === VerificationStatus.REJECTED
                  ? 'destructive'
                  : 'warning'
              }
              onClick={handleConfirmReview}
              isLoading={reviewMutation.isPending}
            >
              Confirm Decision
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            {reviewAction === VerificationStatus.VERIFIED
              ? 'This user will be marked as VERIFIED and granted access to escrow payouts and verified campaign participation.'
              : reviewAction === VerificationStatus.REJECTED
              ? 'The KYC submission will be marked REJECTED. The user will be notified with your rejection notes.'
              : 'Specify the missing or unreadable documents needed from the user.'}
          </p>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Audit Notes & Feedback to User {reviewAction !== VerificationStatus.VERIFIED && '*'}
            </label>
            <Textarea
              placeholder={
                reviewAction === VerificationStatus.VERIFIED
                  ? 'Optional: Approved per PAN & Aadhaar validation.'
                  : 'Specify why this was rejected or what document needs re-uploading...'
              }
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
