// File: /app/layout.tsx
import React from 'react';
import type { ReactNode } from 'react';
import { RootLayout as AppLayout, metadata as appMetadata } from '../next/type/app/layout';

export const metadata = appMetadata;

export interface LayoutProps {
  children?: ReactNode;
  params?: any;
}

export default function RootLayout({ children, params }: LayoutProps) {
  // You can pass params down if your AppLayout needs them
  return <AppLayout params={params}>{children}</AppLayout>;
}