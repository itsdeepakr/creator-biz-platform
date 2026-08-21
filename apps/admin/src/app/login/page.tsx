'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Button, Alert } from '@/components/ui';
import { ShieldCheck, Sparkles, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@cbp.platform');
  const [password, setPassword] = useState('Admin@12345');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Authentication failed. Check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@cbp.platform');
    setPassword('Admin@12345');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md border-border/80 bg-card/90 shadow-2xl backdrop-blur-xl relative z-10">
        <CardHeader className="space-y-3 text-center pb-6 border-b border-border/50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 shadow-lg shadow-primary/25">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Admin Portal
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Creator-Business Collaboration & Escrow Control Center
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-5">
          {error && (
            <Alert variant="danger" title="Authentication Error">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" />
                Admin Email Address
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cbp.platform"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-primary" />
                Password
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="bg-background/50"
              />
            </div>

            <Button type="submit" className="w-full gap-2 font-semibold h-11" isLoading={isLoading}>
              Sign In to Control Center
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Quick Admin Credentials
              </div>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                Auto-fill
              </button>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Default: <code className="text-foreground">admin@cbp.platform</code> / <code className="text-foreground">Admin@12345</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
