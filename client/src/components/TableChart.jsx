import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getBookingsPerMonth } from '../services/api'; // Use your standard getBookings or specific monthly API


export default function TableChart() {

  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

//use effect
  useEffect(() => {
    fetchData();
  }, []);

const fetchData = async () => {
  try {
    setLoading(true);
    const result = await getBookingsPerMonth();
    console.log(result.data);


    if (result.data && Array.isArray(result.data)){
      const formattedData = processMonthlyData(result.data);
      console.log(formattedData);
      setStatusData(formattedData);
      setError(null);
    }
    else {
      console.error("API did not return an array. Received:", result.data);
      setError("API did not return an array");
    }
  } catch (err) {
    console.error("Error fetching data: ", err);
    setError(err.response?.data?.message || "Error fetching data")
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
    //convert month_num to number (API return 4 as a string)
    const monthIndex = parseInt(b.month_num)-1;

    //convert string values to numbers
    const confirmed = parseInt(b.confirmed) || 0;
    const cancelled = parseInt(b.cancelled) || 0;
  
    confirmedCounts[monthIndex] = confirmed;
    cancelledCounts[monthIndex] = cancelled;
  });

  //map to the format recharts expect
  return months.map((month, index) => ({
    name: month,
    confirmed: confirmedCounts[index],
    cancelled: cancelledCounts[index],
  }));
};

if (loading) return <div className="p-6">Loading...</div>;
if (error) return <div className="p-6">{error}</div>;
if (statusData.length === 0) return <div className="p-6">No data available</div>;


return (

<div className="mt-10 bg-white w-100% h-50 p-6 rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">Booking Status per Month</h2>
      
      {/* Use ResponsiveContainer so the chart scales with your dashboard width */}
      <div style={{ width: '100%', height: 150 }}>
        <ResponsiveContainer>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip cursor={{fill: '#f3f4f6'}} />
            <Legend />
           
            <Bar dataKey="confirmed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
            
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

);

}
  


