import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";

const AUTH_URL = process.env.NODE_ENV === "development" 
  ? "http://localhost:7687/api/auth" 
  : "https://backend-hr3.jjm-manufacturing.com/api/auth";

function PageVisits() {
  const [allVisits, setAllVisits] = useState([]);
  const [pageSummary, setPageSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisits, setSelectedVisits] = useState([]);
  const [modalPage, setModalPage] = useState(1);
  const itemsPerPage = 10;
  const modalItemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allVisitsRes = await axios.get(`${AUTH_URL}/get-all-page-visits`);
        if (allVisitsRes.data.success) {
          const visits = allVisitsRes.data.data.reduce((acc, visit) => {
            const userVisits = acc[visit.user_id] || [];
            userVisits.push(visit);
            acc[visit.user_id] = userVisits;
            return acc;
          }, {});
          setAllVisits(Object.entries(visits));
        } else {
          console.error("Failed to fetch all page visits:", allVisitsRes.data.message);
        }

        const pageSummaryRes = await axios.get(`${AUTH_URL}/get-page-visits`);
        if (pageSummaryRes.data) {
          setPageSummary(pageSummaryRes.data);
        } else {
          console.error("Failed to fetch page summary:", pageSummaryRes.data.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const indexOfLastVisit = currentPage * itemsPerPage;
  const indexOfFirstVisit = indexOfLastVisit - itemsPerPage;
  const currentVisits = allVisits.slice(indexOfFirstVisit, indexOfLastVisit);
  const totalPages = Math.ceil(allVisits.length / itemsPerPage);

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleModalPageChange = (direction) => {
    if (direction === "next" && modalPage < Math.ceil(selectedVisits.length / modalItemsPerPage)) {
      setModalPage(modalPage + 1);
    } else if (direction === "prev" && modalPage > 1) {
      setModalPage(modalPage - 1);
    }
  };

  const handleViewDetails = (visits) => {
    setSelectedVisits(visits);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVisits([]);
    setModalPage(1);
  };

  const indexOfLastModalVisit = modalPage * modalItemsPerPage;
  const indexOfFirstModalVisit = indexOfLastModalVisit - modalItemsPerPage;
  const currentModalVisits = selectedVisits.slice(indexOfFirstModalVisit, indexOfLastModalVisit);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-2 md:p-4"
    >
      <h2>All Page Visits</h2>
      {loading ? <p>Loading...</p> : (
        <div>
          <table className="min-w-full table-auto text-xs md:text-sm">
            <thead className="bg-white text-gray-500 border-b">
              <tr>
                <th className="px-2 md:px-6 py-2 md:py-4 text-left">Employee name</th>
                <th className="px-2 md:px-6 py-2 md:py-4 text-left">Total Visits</th>
                <th className="px-2 md:px-6 py-2 md:py-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentVisits.length > 0 ? (
                currentVisits.map(([userId, visits]) => (
                  <tr key={userId} className="hover:bg-gray-300 hover:text-white">
                    <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">{visits[0]?.firstName || "Unknown"}{visits[0]?.lastName || "Unknown"}</td>
                    <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">{visits.length}</td>
                    <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewDetails(visits)}
                        className="btn btn-primary"
                      >
                        View Details
                      </motion.button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">No page visits recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex flex-col md:flex-row justify-center items-center mt-4 gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange("prev")}
              className="mx-1 px-3 py-1 border rounded bg-white text-black w-full md:w-auto"
              disabled={currentPage === 1}
            >
              Previous
            </motion.button>
            <span className="mx-2 text-xs md:text-sm">{currentPage} of {totalPages}</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange("next")}
              className="mx-1 px-3 py-1 border rounded bg-white text-black w-full md:w-auto"
              disabled={currentPage === totalPages}
            >
              Next
            </motion.button>
          </div>
        </div>
      )}

      <h2>Page Visit Summary</h2>
      {loading ? <p>Loading...</p> : (
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-white text-gray-500 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">Page Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">Total Visits</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">Total Time Spent (minutes)</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">Average Time Spent (minutes)</th>
            </tr>
          </thead>
          <tbody>
            {pageSummary.length > 0 ? (
              pageSummary.map((page) => (
                <tr key={page._id} className="hover:bg-gray-300 hover:text-white">
                  <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">{page._id}</td>
                  <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">{page.totalVisits}</td>
                  <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">{(page.totalTimeSpent / 60).toFixed(2)}</td>
                  <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">{(page.averageTimeSpent / 60).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">No summary data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <h3 className="text-lg font-semibold mb-2 mt-6">Page Visits Chart</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={pageSummary}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalVisits" fill="#8884d8" />
          <Bar dataKey="totalTimeSpent" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>

      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 md:p-6 rounded shadow-lg w-full max-w-xs md:max-w-lg"
          >
            <h2 className="text-xl mb-4">Page Visit Details</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="bg-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">Page Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">Duration (minutes)</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {currentModalVisits.map((visit, index) => (
                    <tr key={index} className="hover:bg-gray-300 hover:text-white">
                      <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">{visit.pageName}</td>
                      <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">{(visit.duration / 60).toFixed(2)}</td>
                      <td className="px-6 py-4 text-left text-xs font-semibold text-neutral uppercase tracking-wider">{new Date(visit.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-center mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleModalPageChange("prev")}
                  className="mx-1 px-3 py-1 border rounded bg-white text-black"
                  disabled={modalPage === 1}
                >
                  Previous
                </motion.button>
                <span className="mx-2">{modalPage} of {Math.ceil(selectedVisits.length / modalItemsPerPage)}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleModalPageChange("next")}
                  className="mx-1 px-3 py-1 border rounded bg-white text-black"
                  disabled={modalPage === Math.ceil(selectedVisits.length / modalItemsPerPage)}
                >
                  Next
                </motion.button>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCloseModal}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default PageVisits;
