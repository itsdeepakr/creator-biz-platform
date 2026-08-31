import React from 'react';
import DisputeDetailClient from './DisputeDetailClient';

export function generateStaticParams() {
  return [
    { id: 'disp-1' },
    { id: 'disp-2' },
    { id: 'disp-3' },
    { id: 'disp-4' },
    { id: 'disp-5' },
    { id: 'disp-001' },
    { id: 'disp-002' },
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: 'DISP-1' },
    { id: 'DISP-892' },
    { id: 'seed' },
    { id: 'default' },
  ];
}

export default function DisputeDetailPage() {
  return <DisputeDetailClient />;
}
