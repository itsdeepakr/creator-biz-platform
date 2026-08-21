import * as React from 'react';
import { Card, CardContent } from './card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon,
  description,
  className,
}: StatCardProps) {
  const isPositive = change !== undefined ? change >= 0 : undefined;

  return (
    <Card className={cn('overflow-hidden relative border-border/60 hover:border-border transition-all', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
          {change !== undefined && (
            <div
              className={cn(
                'flex items-center text-xs font-semibold px-2 py-0.5 rounded-full',
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              )}
            >
              {isPositive ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {isPositive ? '+' : ''}
              {change}%
            </div>
          )}
        </div>

        {(changeLabel || description) && (
          <p className="mt-2 text-xs text-muted-foreground">
            {change !== undefined ? changeLabel : description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'danger' | 'success';
  className?: string;
  icon?: React.ReactNode;
}

export function Alert({ title, children, variant = 'info', className, icon }: AlertProps) {
  const styles = {
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    danger: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
  };

  return (
    <div className={cn('flex gap-3 rounded-xl border p-4 text-sm', styles[variant], className)}>
      {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-1 text-foreground">{title}</h5>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}
