import React from 'react';
import DisputeDetailClient from './DisputeDetailClient';

export function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: 'seed' },
    { id: 'default' },
  ];
}

export default function DisputeDetailPage() {
  return <DisputeDetailClient />;
}
