'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Star,
  PauseCircle,
  PlayCircle,
  Eye,
  Building,
} from 'lucide-react';
import { adminApi, AdminCampaignRecord } from '@/lib/api-client';
import { CampaignStatus } from '@cbp/shared';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  Card,
  CardContent,
  Badge,
  Button,
  Input,
  Tabs,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui';

export default function CampaignsModerationPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<AdminCampaignRecord | null>(null);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['admin-campaigns', activeTab],
    queryFn: () => adminApi.getCampaigns({ status: activeTab }),
  });

  const featuredMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleCampaignFeatured(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CampaignStatus }) =>
      adminApi.updateCampaignStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      if (selectedCampaign) {
        setSelectedCampaign(null);
      }
    },
  });

  const filteredCampaigns = campaigns.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.businessName.toLowerCase().includes(q) ||
        c.creatorCategories.some((cat) => cat.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Campaign Moderation Directory</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit brand campaigns, manage discoverability, toggle featured spotlights, and enforce compliance
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/60">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 border-b border-border">
          <Tabs
            tabs={[
              { id: 'ALL', label: 'All Campaigns', count: campaigns.length },
              {
                id: 'ACTIVE',
                label: 'Active',
                count: campaigns.filter((c) => c.status === CampaignStatus.ACTIVE).length,
              },
              {
                id: 'IN_REVIEW',
                label: 'In Review',
                count: campaigns.filter((c) => c.status === CampaignStatus.IN_REVIEW).length,
              },
              {
                id: 'PAUSED',
                label: 'Paused',
                count: campaigns.filter((c) => c.status === CampaignStatus.PAUSED).length,
              },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="border-b-0"
          />

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search title, brand, category..."
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
                <TableHead>Campaign & Brand</TableHead>
                <TableHead>Budget Range</TableHead>
                <TableHead>Categories & Deliverables</TableHead>
                <TableHead>Hiring Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Moderation Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground">
                    Loading campaigns...
                  </TableCell>
                </TableRow>
              ) : filteredCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground">
                    No campaigns matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCampaigns.map((camp) => (
                  <TableRow key={camp.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div>
                        <span className="font-semibold text-foreground text-xs block">
                          {camp.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building className="h-3 w-3 text-blue-400" /> {camp.businessName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {formatCurrency(camp.budgetMin)} - {formatCurrency(camp.budgetMax)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {camp.creatorCategories.map((cat, i) => (
                          <span
                            key={i}
                            className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-muted-foreground"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        <strong className="text-foreground font-semibold">{camp.acceptedCount}</strong> /{' '}
                        {camp.applicantCount} bids
                      </span>
                    </TableCell>

                    <TableCell>
                      <button
                        onClick={() => featuredMutation.mutate(camp.id)}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
                          camp.isFeatured
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-muted/30 text-muted-foreground border-border hover:text-foreground'
                        }`}
                        title={camp.isFeatured ? 'Featured on Explore' : 'Click to feature'}
                      >
                        <Star className={`h-3.5 w-3.5 ${camp.isFeatured ? 'fill-amber-400' : ''}`} />
                      </button>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          camp.status === CampaignStatus.ACTIVE
                            ? 'success'
                            : camp.status === CampaignStatus.IN_REVIEW
                            ? 'info'
                            : camp.status === CampaignStatus.PAUSED
                            ? 'warning'
                            : 'secondary'
                        }
                        className="text-[10px]"
                      >
                        {camp.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCampaign(camp)}
                          className="h-8 text-xs gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>

                        {camp.status === CampaignStatus.ACTIVE ? (
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() =>
                              statusMutation.mutate({ id: camp.id, status: CampaignStatus.PAUSED })
                            }
                            className="h-8 text-xs gap-1"
                          >
                            <PauseCircle className="h-3.5 w-3.5" /> Pause
                          </Button>
                        ) : camp.status === CampaignStatus.PAUSED ||
                          camp.status === CampaignStatus.IN_REVIEW ? (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() =>
                              statusMutation.mutate({ id: camp.id, status: CampaignStatus.ACTIVE })
                            }
                            className="h-8 text-xs gap-1"
                          >
                            <PlayCircle className="h-3.5 w-3.5" /> Publish
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <Modal
          isOpen={!!selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          title={selectedCampaign.title}
          description={`Business: ${selectedCampaign.businessName} | Created: ${formatDateTime(selectedCampaign.createdAt)}`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-muted-foreground">
                Deadline: {formatDateTime(selectedCampaign.applicationDeadline)}
              </span>
              <div className="flex items-center gap-2">
                {selectedCampaign.status === CampaignStatus.ACTIVE && (
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() =>
                      statusMutation.mutate({
                        id: selectedCampaign.id,
                        status: CampaignStatus.PAUSED,
                      })
                    }
                  >
                    Pause Campaign
                  </Button>
                )}
                {selectedCampaign.status !== CampaignStatus.CANCELLED && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      statusMutation.mutate({
                        id: selectedCampaign.id,
                        status: CampaignStatus.CANCELLED,
                      })
                    }
                  >
                    Cancel / Remove
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card/60 p-4 space-y-2">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase">Campaign Brief</h5>
              <p className="text-xs text-foreground leading-relaxed">{selectedCampaign.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border p-3 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                  Budget Allocation
                </span>
                <p className="text-sm font-mono font-bold text-foreground">
                  {formatCurrency(selectedCampaign.budgetMin)} - {formatCurrency(selectedCampaign.budgetMax)}
                </p>
              </div>

              <div className="rounded-xl border border-border p-3 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                  Required Platforms
                </span>
                <div className="flex gap-1">
                  {selectedCampaign.requiredPlatforms.map((p, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
