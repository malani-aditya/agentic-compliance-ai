import type { ReactNode } from 'react'; 
 import type { ResolvingMetadata, ResolvingViewport } from 'next/dist/lib/metadata/types/metadata-interface.js'; 
 
 export interface LayoutProps { 
   children?: ReactNode; 
   params?: any; 
 } 
 
 export interface PageProps { 
   params?: any; 
   searchParams?: any; 
 } 
 
 export type PageParams = any; 
 
 // Utility types 
 export type RevalidateRange<T> = T extends { revalidate: any } ? NonNegative<T['revalidate']> : never; 
 
 type Numeric = number | bigint; 
 type Zero = 0 | 0n; 
 type Negative<T extends Numeric> = T extends Zero ? never : `${T}` extends `-${string}` ? T : never; 
 type NonNegative<T extends Numeric> = T extends Zero ? T : Negative<T> extends never ? T : '__invalid_negative_number__';