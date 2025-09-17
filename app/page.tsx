import React from 'react'; 
 import { PageProps } from './types/app'; 
 import Dashboard from './components/Dashboard'; 
 
 export default function HomePage({ params, searchParams }: PageProps) { 
   return <Dashboard params={params} searchParams={searchParams} />; 
 }