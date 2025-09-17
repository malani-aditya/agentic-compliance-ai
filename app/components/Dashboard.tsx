import React from 'react'; 
 
 export interface DashboardProps { 
   params?: any; 
   searchParams?: any; 
 } 
 
 const Dashboard = ({ params, searchParams }: DashboardProps) => { 
   return ( 
     <div> 
       <h1>Dashboard</h1> 
       <p>Params: {JSON.stringify(params)}</p> 
       <p>Search Params: {JSON.stringify(searchParams)}</p> 
     </div> 
   ); 
 }; 
 
 export default Dashboard;