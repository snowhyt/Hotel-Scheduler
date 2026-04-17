import {useEffect, useState} from 'react'
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from "recharts"
import { getMonthlyRevenue } from '../services/api';



export default function RenevueTable() {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
    fetchRevenue();
}, []);

const fetchRevenue = async () => {
    try {
        setLoading(true);
        const result = await getMonthlyRevenue();
        console.log(result.data);

        //validation
        if(result.data && Array.isArray(result.data)){
            const formattedData = processMonthlyData(result.data);
            console.log(formattedData);
            setRevenueData(formattedData);
            setError(null);
        } else {
            console.error("API did not return an array. Received:", result.data);
            setError("API did not return an array");
        }
    } catch (err) {
        console.error("Error fetching revenue: ", err);
        setError(err.response?.data?.message || "Error fetching revenue");
    } finally {
        setLoading(false);
    }
};


const processMonthlyData = (revenue) => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    const monthlyRevenue = new Array(12).fill(0);

    revenue.forEach((r) => {
        const monthIndex = parseInt(r.month)-1;
        const revenue = parseFloat(r.revenue) || 0;
        monthlyRevenue[monthIndex] = revenue;
    });

    return months.map((month, index) => ({
        name: month,
        revenue: monthlyRevenue[index],
    }));
};

//current config
const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(value);
    };



//custom tooltop
const CustomTooltip = ({active, payload, label}) => {

    if(active && payload && payload.length){
        return (
            <div className='bg-white p-4 border rounded-lg shadow-lg'>
                <p className='font-semibold text-gray-700'>{label}</p>
                <p className='text-green-600 font-bold'>Revenue: {formatCurrency(payload[0].value)}</p>
            </div>
        )
        return null;
    }
};


if (loading) return <div className='p-6 text-center'>Loading revenue data...</div>;
if (error) return <div className='p-6 text-center'>{error}</div>;
if (!revenueData || revenueData.length === 0) return <div className='p-6 text-center'>No revenue data available</div>;
  
const totalRevenue = revenueData.reduce((sum, month) => sum + month.revenue, 0);
  
    return (
     <div className="mt-10 bg-white w-full p-6 rounded-2xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Monthly Revenue</h2>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-blue-500">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>
      
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              tickFormatter={(value) => `₱${value.toLocaleString()}`}
              label={{ value: 'Revenue (₱)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="revenue" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              name="Revenue"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Optional: Summary statistics */}
      {totalRevenue > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Average Monthly Revenue</p>
            <p className="text-lg font-semibold">{formatCurrency(totalRevenue / 12)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Highest Month</p>
            <p className="text-lg font-semibold">
              {revenueData.reduce((max, month) => 
                month.revenue > max.revenue ? month : max, revenueData[0]
              ).name}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Months with Revenue</p>
            <p className="text-lg font-semibold">
              {revenueData.filter(month => month.revenue > 0).length} / 12
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
