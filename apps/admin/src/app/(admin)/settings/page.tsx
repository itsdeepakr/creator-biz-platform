'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Percent,
  ShieldCheck,
  CreditCard,
  Save,
} from 'lucide-react';
import { adminApi, PlatformSettingsData } from '@/lib/api-client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Alert,
} from '@/components/ui';

export default function PlatformSettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<PlatformSettingsData | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings(),
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<PlatformSettingsData>) => adminApi.updateSettings(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin-settings'], updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
  });

  if (isLoading || !formData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-xs text-muted-foreground">Loading platform configuration...</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Platform Global Configuration</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure transaction commission rates, escrow automation timers, KYC enforcement and system parameters
        </p>
      </div>

      {savedSuccess && (
        <Alert variant="success" title="Settings Saved">
          Platform configurations have been updated successfully and broadcast to all microservices.
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Percent className="h-4 w-4 text-primary" />
              Platform Fee & Monetization Model
            </CardTitle>
            <CardDescription className="text-xs">
              Commission retained by the platform from creator payouts upon milestone completion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Platform Commission Take-Rate (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  value={formData.platformFeePercentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      platformFeePercentage: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
                <p className="text-[11px] text-muted-foreground">Standard market benchmark is 10.0%.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Minimum Payout Release Threshold (INR)
                </label>
                <Input
                  type="number"
                  min="100"
                  step="100"
                  value={formData.minimumPayoutAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimumPayoutAmount: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Minimum accumulated wallet balance before automatic NEFT/IMPS payout release.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Escrow Lifecycle & Auto-Release Automation
            </CardTitle>
            <CardDescription className="text-xs">
              Automation timers for unattended deliverable approvals and arbitration deadlines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Auto-Release Escrow after Client Approval (Days)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.autoReleaseDaysAfterApproval}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      autoReleaseDaysAfterApproval: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Escrow automatically unlocks and transfers to creator bank account after this window.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Dispute Evidence Filing Window (Days)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.disputeResolutionWindowDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      disputeResolutionWindowDays: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Window for both parties to furnish proof before mandatory admin arbitration.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Statutory KYC & Tax Compliance Policies
            </CardTitle>
            <CardDescription className="text-xs">
              Indian regulatory mandates (PAN TDS and GSTIN invoice generation)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-3 rounded-xl border border-border p-3.5 hover:bg-muted/20 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.panMandatoryForPayouts}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    panMandatoryForPayouts: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <span className="text-xs font-semibold text-foreground block">
                  Mandatory PAN Verification for Creator Payouts (Section 194J TDS)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Prevents escrow withdrawal until valid Government PAN is verified on NSDL.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-border p-3.5 hover:bg-muted/20 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.gstMandatoryForBusinesses}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gstMandatoryForBusinesses: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <span className="text-xs font-semibold text-foreground block">
                  Mandatory GSTIN Registration for Brand Campaign Funding
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Requires valid GST Certificate before publishing campaigns with budget &gt; ₹50,000.
                </span>
              </div>
            </label>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            isLoading={updateMutation.isPending}
            className="gap-2 bg-gradient-to-r from-primary to-indigo-600 px-6"
          >
            <Save className="h-4 w-4" />
            Save Platform Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
