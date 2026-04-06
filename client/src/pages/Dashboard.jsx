import {useEffect, useState} from 'react';
import Card from "../components/Card.jsx";
import API, { getDashboardStats } from "../services/api.js";
import TableChart from '../components/TableChart.jsx';

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

    //F0b100
    const chartData = [
        {name: "Confirmed", value: stats.confirmed, fill: "#00c950"},
        {name: "Pending", value: stats.pending, fill: "#ad46ff"},
        {name: "Cancelled", value: stats.cancelled, fill: "#F0b100"},
        {name: "Completed", value: stats.completed, fill: "#2b7fff"},
    ];


  return (
    <div className='p-6 bg-gray-100 min-h-screen '>
        <h1 className='text-2xl font-bold mb-6'>Dashboard</h1>

        {/*Stats card */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <Card title="Total Bookings" value={stats.total}/>
        <Card title="Confirmed" value={stats.confirmed}/>
        <Card title="Pending" value={stats.pending}/>
        <Card title="Cancelled" value={stats.cancelled} />
        </div>

        {/* Chart */}
        <div className='mt-10 bg-white p-6 rounded-2xl shadow w-fit'>
            <h2 className='text-xl font-bold mb-4'>Booking status</h2>

            <PieChart width={400} height={300}>
                <Pie
                    className='text-sm'
             
                    data={chartData}
                    dataKey = "value"
                    nameKey = "name"
                    outerRadius={100}
                    label
                
                 />
                <Legend />
            </PieChart>

           
        </div>
         <TableChart />
    </div>
  )
}
//add live time and date, add month of "month"