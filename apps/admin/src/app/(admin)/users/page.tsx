'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Building,
  User,
  Shield,
  Ban,
  UserX,
  UserCheck,
  Star,
  Eye,
} from 'lucide-react';
import { adminApi, AdminUserRecord } from '@/lib/api-client';
import { UserRole } from '@cbp/shared';
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

export default function UsersDirectoryPage() {
  const queryClient = useQueryClient();
  const [activeRole, setActiveRole] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', activeRole],
    queryFn: () => adminApi.getUsers({ role: activeRole }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' }) =>
      adminApi.updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      if (selectedUser) {
        setSelectedUser(null);
      }
    },
  });

  const filteredUsers = users.filter((u) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">User Management & Directory</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit platform participants, monitor collaboration volume, enforce trust & safety rules
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/60">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 border-b border-border">
          <Tabs
            tabs={[
              { id: 'ALL', label: 'All Users', count: users.length },
              {
                id: 'CREATOR',
                label: 'Creators',
                count: users.filter((u) => u.role === UserRole.CREATOR).length,
              },
              {
                id: 'BUSINESS',
                label: 'Businesses',
                count: users.filter((u) => u.role === UserRole.BUSINESS).length,
              },
              {
                id: 'ADMIN',
                label: 'Staff Admins',
                count: users.filter((u) => u.role === UserRole.ADMIN).length,
              },
            ]}
            activeTab={activeRole}
            onChange={setActiveRole}
            className="border-b-0"
          />

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
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
                <TableHead>User Profile</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Volume & Collabs</TableHead>
                <TableHead>Platform Rating</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-xs text-muted-foreground">
                    No users found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                          {u.role === UserRole.CREATOR ? (
                            <User className="h-4 w-4" />
                          ) : u.role === UserRole.BUSINESS ? (
                            <Building className="h-4 w-4" />
                          ) : (
                            <Shield className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-xs">{u.name}</div>
                          <div className="text-[11px] text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          u.role === UserRole.CREATOR
                            ? 'purple'
                            : u.role === UserRole.BUSINESS
                            ? 'info'
                            : 'default'
                        }
                        className="text-[10px]"
                      >
                        {u.role}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div>
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {formatCurrency(u.totalVolume)}
                        </span>
                        <span className="block text-[10px] text-muted-foreground">
                          {u.totalCollaborations} collaborations
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        {u.rating.toFixed(1)}
                      </div>
                    </TableCell>

                    <TableCell>
                      {u.isVerified ? (
                        <Badge variant="success" className="text-[10px]">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Unverified
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          u.status === 'ACTIVE'
                            ? 'success'
                            : u.status === 'SUSPENDED'
                            ? 'warning'
                            : 'destructive'
                        }
                        className="text-[10px]"
                      >
                        {u.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(u)}
                          className="h-8 text-xs gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> Details
                        </Button>

                        {u.role !== UserRole.ADMIN && (
                          <>
                            {u.status === 'ACTIVE' ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  statusMutation.mutate({ id: u.id, status: 'SUSPENDED' })
                                }
                                className="h-8 text-xs gap-1"
                              >
                                <UserX className="h-3.5 w-3.5" /> Suspend
                              </Button>
                            ) : (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() =>
                                  statusMutation.mutate({ id: u.id, status: 'ACTIVE' })
                                }
                                className="h-8 text-xs gap-1"
                              >
                                <UserCheck className="h-3.5 w-3.5" /> Unsuspend
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`User Profile — ${selectedUser.name}`}
          description={`ID: ${selectedUser.id} | Registered: ${formatDateTime(selectedUser.createdAt)}`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-muted-foreground">
                Last active: {formatDateTime(selectedUser.lastLoginAt)}
              </span>
              {selectedUser.role !== UserRole.ADMIN && (
                <div className="flex items-center gap-2">
                  {selectedUser.status !== 'BANNED' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        statusMutation.mutate({ id: selectedUser.id, status: 'BANNED' })
                      }
                      className="gap-1.5"
                    >
                      <Ban className="h-3.5 w-3.5" /> Permanently Ban
                    </Button>
                  )}
                  {selectedUser.status !== 'ACTIVE' && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() =>
                        statusMutation.mutate({ id: selectedUser.id, status: 'ACTIVE' })
                      }
                      className="gap-1.5"
                    >
                      <UserCheck className="h-3.5 w-3.5" /> Reactivate Account
                    </Button>
                  )}
                </div>
              )}
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border p-3 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                  Completed Collabs
                </span>
                <p className="text-base font-bold text-foreground">{selectedUser.totalCollaborations}</p>
              </div>

              <div className="rounded-xl border border-border p-3 space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                  Total Transaction Volume
                </span>
                <p className="text-base font-mono font-bold text-foreground">
                  {formatCurrency(selectedUser.totalVolume)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border p-3 space-y-1 bg-card/60">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                Email Address
              </span>
              <p className="text-xs font-mono text-foreground">{selectedUser.email}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
