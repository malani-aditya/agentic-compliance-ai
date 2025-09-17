import React from 'react'; 
 import type { LayoutProps } from './layout'; 
 import Dashboard from './components/Dashboard'; 
 
 export interface PageProps extends LayoutProps { 
   searchParams?: any; 
 } 
 
 export default function HomePage({ params, searchParams }: PageProps) { 
   return <Dashboard params={params} searchParams={searchParams} />; 
 }