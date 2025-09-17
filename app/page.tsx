import React from 'react'; 
 import type { PageProps } from './types/app'; 
 
 export default function HomePage({ params, searchParams }: PageProps) { 
   return <div> 
     <h1>Welcome to My App</h1> 
     <p>Params: {JSON.stringify(params)}</p> 
   </div>; 
 }