import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AUTH_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:7687/api/auth"
    : "https://backend-hr3.jjm-manufacturing.com/api/auth";

function LoginActivity() {
  const [loginActivities, setLoginActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 10;
  const historyItemsPerPage = 5;

  useEffect(() => {
    fetchLoginActivities();
  }, []);

  const fetchLoginActivities = async () => {
    try {
      const response = await axios.get(`${AUTH_URL}/get-login-activities`);
      setLoginActivities(response.data.data);
    } catch (error) {
      console.error("Error fetching login activities:", error);
    }
  };

  const handleHistoryClick = (history) => {
    setSelectedHistory(history);
    setIsHistoryModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedHistory([]);
    setHistoryPage(1);
  };

  const indexOfLastActivity = currentPage * itemsPerPage;
  const indexOfFirstActivity = indexOfLastActivity - itemsPerPage;
  const currentActivities = loginActivities.slice(indexOfFirstActivity, indexOfLastActivity);
  const totalPages = Math.ceil(loginActivities.length / itemsPerPage);

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const indexOfLastHistory = historyPage * historyItemsPerPage;
  const indexOfFirstHistory = indexOfLastHistory - historyItemsPerPage;
  const currentHistory = selectedHistory.slice(indexOfFirstHistory, indexOfLastHistory);
  const totalHistoryPages = Math.ceil(selectedHistory.length / historyItemsPerPage);

  const handleHistoryPageChange = (direction) => {
    if (direction === "next" && historyPage < totalHistoryPages) {
      setHistoryPage(historyPage + 1);
    } else if (direction === "prev" && historyPage > 1) {
      setHistoryPage(historyPage - 1);
    }
  };

  return (
    <div className="p-6">

      <h3 className="text-lg font-semibold mb-2">Login Activities</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="bg-gray-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">First Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">Last Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">Position</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">Login Count</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">Failed Login</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">History</th>
            </tr>
          </thead>
          <tbody>
            {currentActivities.map((activity, index) => (
              <tr key={index} className="hover:bg-gray-300 hover:text-white">
                <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">{activity.firstName}</td>
                <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">{activity.lastName}</td>
                <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">{activity.email}</td>
                <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">{activity.role}</td>
                <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">{activity.position}</td>
                <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">{activity.loginCount}</td>
                <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">
                  {activity.lastLogin ? new Date(activity.lastLogin).toLocaleString() : "N/A"}
                </td>
                <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">{activity.failedLoginAttempts}</td>
                <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">
                  <button onClick={() => handleHistoryClick(activity.loginHistory)} className="btn btn-primary">View History</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => handlePageChange("prev")}
            className="mx-1 px-3 py-1 border rounded bg-white text-black"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="mx-2">{currentPage} of {totalPages}</span>
          <button
            onClick={() => handlePageChange("next")}
            className="mx-1 px-3 py-1 border rounded bg-white text-black"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2 mt-6">Login Activities Chart</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={loginActivities}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="email" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="loginCount" fill="#8884d8" />
          <Bar dataKey="failedLoginAttempts" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>

      {isHistoryModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl mb-4">Login History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="bg-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">Device</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentHistory.map((history, index) => (
                    <tr key={index} className="hover:bg-gray-300 hover:text-white">
                      <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">{new Date(history.timestamp).toLocaleString()}</td>
                      <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">{history.ipAddress}</td>
                      <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">{history.device}</td>
                      <td className={`px-6 py-4 text-left text-xs font-semibold text-green uppercase tracking-wider ${history.status === "Success" ? "text-green-600 font-bold" : "text-red-600 font-bold"}`}>
                        {history.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => handleHistoryPageChange("prev")}
                  className="mx-1 px-3 py-1 border rounded bg-white text-black"
                  disabled={historyPage === 1}
                >
                  Previous
                </button>
                <span className="mx-2">{historyPage} of {totalHistoryPages}</span>
                <button
                  onClick={() => handleHistoryPageChange("next")}
                  className="mx-1 px-3 py-1 border rounded bg-white text-black"
                  disabled={historyPage === totalHistoryPages}
                >
                  Next
                </button>
              </div>
            </div>
            <button onClick={handleCloseModal} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginActivity;