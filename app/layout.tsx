import React from 'react'; 
 import { DashboardLayout } from './components/DashboardLayout'; 
 import { metadata as appMetadata } from './components/metadata'; 
 import { LayoutProps } from './types/app'; 
 
 export const metadata = appMetadata; 
 
 export default function RootLayout({ children, params }: LayoutProps) { 
   return <DashboardLayout params={params}>{children}</DashboardLayout>; 
 }