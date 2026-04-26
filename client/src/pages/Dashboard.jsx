import {useEffect, useState} from 'react';
import Card from "../components/Card.jsx";
import API, { getDashboardStats } from "../services/api.js";
import TableChart from '../components/TableChart.jsx';
import RenevueTable from '../components/RenevueTable.jsx';

import { PieChart, Pie, Legend } from 'recharts';

export default function Dashboard() {
    const [stats, setStats] = useState(null);    

    

    
    useEffect(() => {
        fetchStats();
    },[]);

    const fetchStats = async () => {
        try {
            const res = await getDashboardStats();
            setStats(res.data);
        } catch (err) {
           console.error("Error fetching stats:", err);
            
        }
    };

    if (!stats) {return <div className='p-6'>Loading...</div>;}

    
    const chartData = [
        {name: "Confirmed", value: stats.confirmed, fill: "#3b82f6"},
        {name: "Pending", value: stats.pending, fill: "#f59e0b"},
        {name: "Cancelled", value: stats.cancelled, fill: "#ef4444"},
        {name: "Completed", value: stats.completed, fill: "#6b7280"},
    ];


  return (
    <div className='p-6 bg-gray-100 min-h-screen '>
        <div className="flex justify-between items-center">
        <h1 className='text-2xl font-bold mb-6'>Dashboard</h1>
        <p className='text-xl'><b>Friday</b> - 04/17/2026, 5:00 PM</p>
        </div>

        {/*Stats card */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-[-20px]'>
        <Card title="In House" value={stats.inHouse}/>
        <Card title="Expected Arrivals" value={stats.expectedArrivals }/>
        <Card title="Expected Departures" value={stats.expectedDepartures }/>
        <Card title="End of Day" value={stats.endOfDay } />
        </div>

        {/* Chart grid grid-cols-3 md:grid-cols-2 */}
        <section className='flex flex-col-2 sm:flex-col-1 gap-6'>
       
        <div className='mt-10 bg-white p-6 rounded-2xl shadow w-fit'>
            <h2 className='text-xl font-bold mb-4'>Booking status</h2>

            <PieChart width={600} height={600}
            >
                <Pie
                    className='text-sm'
             
                    data={chartData}
                    dataKey = "value"
                    nameKey = "name"
                    outerRadius={180}
                    label
                
                 />
                <Legend />
            </PieChart>

           
        </div>
        <div className='flex-1'>
         <TableChart />
         <RenevueTable />
        </div>

         </section>
        
    </div>
  )
}
//add live time and date, add month of "month"