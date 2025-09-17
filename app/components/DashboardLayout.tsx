import React, { ReactNode } from 'react'; 
 
 export interface DashboardLayoutProps { 
   children: ReactNode; 
   params?: any; 
 } 
 
 export const DashboardLayout = ({ children }: DashboardLayoutProps) => { 
   return ( 
     <html lang="en"> 
       <body> 
         {/* You can add header/navbar/footer here */} 
         {children} 
       </body> 
     </html> 
   ); 
 };