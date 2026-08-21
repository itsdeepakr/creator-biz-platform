'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Star,
  Search,
  Flag,
  Trash2,
  Eye,
  EyeOff,
  Building,
  User,
} from 'lucide-react';
import { adminApi } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';
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

export default function ReviewsModerationPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews', activeTab],
    queryFn: () => adminApi.getReviews({ flaggedOnly: activeTab === 'FLAGGED' }),
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleReviewVisibility(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });

  const filteredReviews = reviews.filter((r) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.comment.toLowerCase().includes(q) ||
        r.reviewerName.toLowerCase().includes(q) ||
        r.revieweeName.toLowerCase().includes(q) ||
        r.campaignTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Review & Rating Moderation</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit bilateral collaboration feedback, moderate abusive remarks, and manage reputation fairness
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/60">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 border-b border-border">
          <Tabs
            tabs={[
              { id: 'ALL', label: 'All Reviews', count: reviews.length },
              {
                id: 'FLAGGED',
                label: 'Flagged by Users',
                count: reviews.filter((r) => r.isFlagged).length,
              },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="border-b-0"
          />

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search comments or users..."
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
                <TableHead>Reviewer → Reviewee</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Feedback & Comment</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Moderation Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground">
                    Loading reviews...
                  </TableCell>
                </TableRow>
              ) : filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground">
                    No reviews matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((rev) => (
                  <TableRow key={rev.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold">
                          {rev.reviewerRole === 'BUSINESS' ? (
                            <Building className="h-3 w-3 text-blue-400" />
                          ) : (
                            <User className="h-3 w-3 text-purple-400" />
                          )}
                          {rev.reviewerName}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          for {rev.revieweeName} ({rev.revieweeRole})
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < rev.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="max-w-md">
                      <p className="text-xs text-foreground leading-relaxed italic">
                        &quot;{rev.comment}&quot;
                      </p>
                      {rev.isFlagged && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-rose-400 font-semibold">
                          <Flag className="h-3 w-3" /> Flagged for policy violation
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {rev.campaignTitle}
                    </TableCell>

                    <TableCell>
                      <Badge variant={rev.isPublic ? 'success' : 'secondary'} className="text-[10px]">
                        {rev.isPublic ? 'Public' : 'Hidden'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(rev.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleVisibilityMutation.mutate(rev.id)}
                          className="h-8 text-xs gap-1"
                        >
                          {rev.isPublic ? (
                            <>
                              <EyeOff className="h-3.5 w-3.5" /> Hide
                            </>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5" /> Show
                            </>
                          )}
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMutation.mutate(rev.id)}
                          className="h-8 text-xs gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
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
