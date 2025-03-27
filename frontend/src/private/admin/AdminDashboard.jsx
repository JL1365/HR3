import React, { useEffect, useState } from 'react';
import { useAdminDashboard } from '../../store/adminDashboardStore';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  DollarSign, 
  Award, 
  Clock, 
  CreditCard 
} from 'lucide-react';

import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';

function AdminDashboard() {
  const {
    userCount,
    appliedRequestCount,
    totalDeductions,
    totalIncentivesGiven,
    employeeIncentiveCount,
    employeeLeaveCount,
    totalSalary,
    fetchDashboardData,
    error,
    clearError
  } = useAdminDashboard();

  const [leaveRequestDetails, setLeaveRequestDetails] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value);
  };

  const fetchLeaveRequestDetails = async () => {
    try {
      const response = await axios.get('/api/leave-request-details');
      setLeaveRequestDetails(response.data);
    } catch (error) {
      console.error('Error fetching leave request details:', error);
    }
  };

  const DashboardCard = ({ icon: Icon, title, value, color }) => (
    <motion.div 
      className={`bg-white shadow-lg rounded-xl p-5 border-l-4 ${color} flex items-center space-x-4 transition-all duration-300 relative`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </motion.div>
  );

  const pieData = [
    { name: "Incentives", value: totalIncentivesGiven },
    { name: "Deductions", value: totalDeductions },
    { name: "Salary", value: totalSalary }
  ];

  const PIE_COLORS = ["#6366f1", "#ef4444", "#10b981"];

  const barData = [
    { name: "Requests", count: appliedRequestCount },
    { name: "Leaves", count: employeeLeaveCount },
    { name: "Incentives", count: employeeIncentiveCount }
  ];

  const BAR_COLORS = ["#3b82f6", "#10b981", "#8b5cf6"];

  return (
    <div className="bg-gray-50 min-h-screen p-8 relative z-0">
      <div className="container mx-auto">

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button 
              onClick={clearError} 
              className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <DashboardCard 
            icon={Users} 
            title="Total Users" 
            value={userCount} 
            color="text-blue-500" 
          />
          <DashboardCard 
            icon={FileText} 
            title="Applied Requests" 
            value={appliedRequestCount} 
            color="text-green-500" 
          />
          <DashboardCard 
            icon={DollarSign} 
            title="Total Deductions" 
            value={formatCurrency(totalDeductions)} 
            color="text-red-500" 
          />
          <DashboardCard 
            icon={Award} 
            title="Total Incentives" 
            value={formatCurrency(totalIncentivesGiven)} 
            color="text-purple-500" 
          />
          <DashboardCard 
            icon={CreditCard} 
            title="Employee Incentives" 
            value={employeeIncentiveCount} 
            color="text-indigo-500" 
          />
          <DashboardCard 
            icon={Clock} 
            title="Employee Leaves" 
            value={employeeLeaveCount} 
            color="text-yellow-500" 
          />
          <DashboardCard 
            icon={CreditCard} 
            title="Total Salary" 
            value={formatCurrency(totalSalary)} 
            color="text-green-600" 
          />
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Payroll Summary</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Employee Activities</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6">
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;