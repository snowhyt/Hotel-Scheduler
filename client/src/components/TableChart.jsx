import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getBookingsPerMonth } from '../services/api'; // Use your standard getBookings or specific monthly API


export default function TableChart() {

  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

//use effect
  useEffect(() => {
    fetchData();
  }, []);

const fetchData = async () => {
  try {
    const result = await getBookingsPerMonth();
    if (result.data && Array.isArray(result.data)){
      const formattedData = processMonthlyData(result.data);
      setStatusData(formattedData);
      setLoading(false);
    }
    else {
      console.error("API did not return an array. Received:", result.data);
    }
  } catch (err) {
    console.error("Error fetching data: ", err)
  } finally {
    setLoading(false);
  }
};

const processMonthlyData = (bookings) => {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  //initialize arrays for counts
  const confirmedCounts = new Array(12).fill(0);
  const cancelledCounts = new Array(12).fill(0);

  bookings.forEach((b) => {
    const monthIndex = new Date(b.check_in).getMonth();
    if(b.status === "confirmed"){
      confirmedCounts[monthIndex]++;
    } else if (b.status === "cancelled"){
      cancelledCounts[monthIndex]++;
    }

  });

  //map to the format recharts expect
  return months.map((month, index) => ({
    name: month,
    confirmed: confirmedCounts[index],
    cancelled: cancelledCounts[index],
  }));
};

if (loading) return <div className="p-6">Loading...</div>;


return (

<div className="mt-10 bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">Booking Status per Month</h2>
      
      {/* Use ResponsiveContainer so the chart scales with your dashboard width */}
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip cursor={{fill: '#f3f4f6'}} />
            <Legend />
            <Bar dataKey="confirmed" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

);

}
  


