import React from 'react'; 
 import { LayoutProps } from './types/app'; 
 
 // Optional: add metadata here 
 export const metadata = { 
   title: 'My App', 
   description: 'Description of my app', 
 }; 
 
 export default function RootLayout({ children, params }: LayoutProps) { 
   // Pass params down if needed to nested layout/components 
   return <html lang="en"> 
     <body>{children}</body> 
   </html>; 
 }