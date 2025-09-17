import type { ReactNode } from 'react'; 
 
 export interface LayoutProps { 
   children: ReactNode; 
   params?: any; 
 } 
 
 export interface PageProps { 
   params?: any; 
   searchParams?: any; 
 }