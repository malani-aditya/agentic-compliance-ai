// File: /app/page.tsx
import React from 'react';
import type { ReactNode } from 'react';
import { HomePage as AppPage, metadata as pageMetadata } from '../next/type/app/page';

export const metadata = pageMetadata;

export interface PageProps {
  params?: any;
  children?: ReactNode;
}

export default function Page({ params, children }: PageProps) {
  // Pass params down if your internal page component uses them
  return <AppPage params={params}>{children}</AppPage>;
}