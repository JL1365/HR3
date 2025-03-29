import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";

function LoginActivity() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 10;
  const historyItemsPerPage = 5;

  const fetchLoginActivities = useAuthStore((state) => state.fetchLoginActivities);
  const loginActivities = useAuthStore((state) => state.loginActivities);

  useEffect(() => {
    fetchLoginActivities();
  }, [fetchLoginActivities]);

  const handleHistoryClick = (history) => {
    setSelectedHistory(history);
    setIsHistoryModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedHistory([]);
    setHistoryPage(1);
  };

  const combineData = (activities) => {
    const combinedData = {};
    activities.forEach(activity => {
      const key = activity.email || "Unknown";
      if (!combinedData[key]) {
        combinedData[key] = {
          ...activity,
          loginCount: 0,
          failedLoginAttempts: 0,
          loginHistory: [],
        };
      }
      combinedData[key].loginCount += activity.loginCount;
      combinedData[key].failedLoginAttempts += activity.failedLoginAttempts;
      combinedData[key].loginHistory = combinedData[key].loginHistory.concat(activity.loginHistory);
    });
    return Object.values(combinedData);
  };

  const combinedLoginActivities = combineData(loginActivities);

  const indexOfLastActivity = currentPage * itemsPerPage;
  const indexOfFirstActivity = indexOfLastActivity - itemsPerPage;
  const currentActivities = combinedLoginActivities.slice(indexOfFirstActivity, indexOfLastActivity);
  const totalPages = Math.ceil(combinedLoginActivities.length / itemsPerPage);

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-2 md:p-4"
    >
      <h3 className="text-lg font-semibold mb-2">Login Activities</h3>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="overflow-x-auto"
      >
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full table-auto text-xs md:text-sm">
              <thead className="bg-white text-gray-500 border-b">
                <tr>
                  <th className="p-2 md:p-3 text-left">Employee name</th>
                  <th className="p-2 md:p-3 text-left">Email</th>
                  <th className="p-2 md:p-3 text-left">Role</th>
                  <th className="p-2 md:p-3 text-left">Position</th>
                  <th className="p-2 md:p-3 text-left">Login Count</th>
                  <th className="p-2 md:p-3 text-left">Last Login</th>
                  <th className="p-2 md:p-3 text-left">Failed Login</th>
                  <th className="p-2 md:p-3 text-left">History</th>
                </tr>
              </thead>
              <tbody className="bg-white text-neutral-500 border-b">
                {currentActivities.length > 0 ? (
                  currentActivities.map((activity, index) => (
                    <motion.tr
                      key={activity._id}
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {activity.firstName} {activity.lastName}
                      </td>
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {activity.email}
                      </td>
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {activity.role}
                      </td>
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {activity.position}
                      </td>
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {activity.loginCount}
                      </td>
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {activity.lastLogin ? new Date(activity.lastLogin).toLocaleString() : "N/A"}
                      </td>
                      <td className="p-2 md:p-3 text-left text-xs md:text-sm">
                        {activity.failedLoginAttempts}
                      </td>
                      <td className="p-2 md:p-3 text-left flex flex-col md:flex-row gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleHistoryClick(activity.loginHistory)}
                          className="btn bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"
                        >
                          View History
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      No login activities found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary text-xs md:text-sm w-full md:w-auto"
          onClick={handlePageChange.bind(null, "prev")}
          disabled={currentPage === 1}
        >
          Previous
        </motion.button>
        <span className="text-gray-700 text-xs md:text-sm">
          Page {currentPage}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary text-xs md:text-sm w-full md:w-auto"
          onClick={handlePageChange.bind(null, "next")}
          disabled={indexOfLastActivity >= combinedLoginActivities.length}
        >
          Next
        </motion.button>
      </div>

      <h3 className="text-lg font-semibold mb-2 mt-6">Login Activities Chart</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={combinedLoginActivities}>
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 md:p-6 rounded-lg w-full max-w-md md:max-w-2xl lg:max-w-3xl"
          >
            <h2 className="text-lg md:text-xl font-semibold mb-4">Login History</h2>
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                  <thead className="bg-gray-50">
                    <tr className="bg-gray-200">
                      <th className="px-4 md:px-6 py-2 md:py-4 text-left font-semibold text-neutral uppercase tracking-wider">Timestamp</th>
                      <th className="px-4 md:px-6 py-2 md:py-4 text-left font-semibold text-neutral uppercase tracking-wider">IP Address</th>
                      <th className="px-4 md:px-6 py-2 md:py-4 text-left font-semibold text-neutral uppercase tracking-wider">Device</th>
                      <th className="px-4 md:px-6 py-2 md:py-4 text-left font-semibold text-neutral uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentHistory.map((history, index) => (
                      <tr key={index} className="hover:bg-gray-300 hover:text-neutral">
                        <td className="px-4 md:px-6 py-2 md:py-4 text-left">{new Date(history.timestamp).toLocaleString()}</td>
                        <td className="px-4 md:px-6 py-2 md:py-4 text-left">{history.ipAddress}</td>
                        <td className="px-4 md:px-6 py-2 md:py-4 text-left">{history.device}</td>
                        <td className={`px-4 md:px-6 py-2 md:py-4 text-left ${history.status === "Success" ? "text-green-600 font-bold" : "text-red-600 font-bold"}`}>
                          {history.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-center mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleHistoryPageChange("prev")}
                    className="mx-1 px-3 py-1 border rounded bg-white text-black"
                    disabled={historyPage === 1}
                  >
                    Previous
                  </motion.button>
                  <span className="mx-2">{historyPage} of {totalHistoryPages}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleHistoryPageChange("next")}
                    className="mx-1 px-3 py-1 border rounded bg-white text-black"
                    disabled={historyPage === totalHistoryPages}
                  >
                    Next
                  </motion.button>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCloseModal}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full"
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default LoginActivity;