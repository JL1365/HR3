import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useBenefitDeductiontStore } from "../../store/benefitDeductionStore";
import { useAuthStore } from "../../store/authStore";
import { useBenefitRequestStore } from "../../store/benefitRequestStore";

function BenefitDeduction() {
  const {
    allDeductions = [],
    fetchAllBenefitDeductions,
    addUserDeduction,
    loading,
  } = useBenefitDeductiontStore();

  const { fetchAllUsers, users = [] } = useAuthStore();
  const { allBenefitRequests, fetchAllBenefitRequest = [] } = useBenefitRequestStore();

  const [selectedUser, setSelectedUser] = useState("");
  const [benefitRequestId, setBenefitRequestId] = useState("");
  const [amount, setAmount] = useState("");
  const [userDeductions, setUserDeductions] = useState([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  
  const [currentDeductionPage, setCurrentDeductionPage] = useState(1);
  const [deductionsPerPage] = useState(10);

  useEffect(() => {
    fetchAllBenefitDeductions();
    fetchAllUsers();
    fetchAllBenefitRequest();
  }, []);

  const handleAddDeduction = async (e) => {
    e.preventDefault();
    if (!selectedUser || !benefitRequestId || !amount) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const result = await addUserDeduction({
        userId: selectedUser,
        benefitRequestId,
        amount,
      });

      if (result.success) {
        setSelectedUser("");
        setBenefitRequestId("");
        setAmount("");
        setIsFormModalOpen(false);
        toast.success("Deduction added successfully!");
        fetchAllBenefitDeductions();
      } else {
        toast.error(result.message || "Error adding deduction");
      }
    } catch (error) {
      toast.error("Failed to add deduction");
    }
  };

  const handleRowClick = (user) => {
    if (!allDeductions) return;

    const filtered = allDeductions.filter(
      (deduction) => deduction.userId === user._id
    );
    setUserDeductions(filtered);
    setSelectedUser(user._id);
    setIsUserModalOpen(true);
    setCurrentDeductionPage(1); 
  };

  const uniqueUsersMap = new Map();
  allDeductions?.forEach((deduction) => {
    const userId = deduction.userId;
    if (userId && !uniqueUsersMap.has(userId)) {
      uniqueUsersMap.set(userId, deduction.user);
    }
  });
  
  const uniqueUsers = Array.from(uniqueUsersMap.entries()).map(
    ([id, user]) => ({
      _id: id,
      ...user,
    })
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = uniqueUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(uniqueUsers.length / usersPerPage);

  const indexOfLastDeduction = currentDeductionPage * deductionsPerPage;
  const indexOfFirstDeduction = indexOfLastDeduction - deductionsPerPage;
  const currentDeductions = userDeductions.slice(indexOfFirstDeduction, indexOfLastDeduction);
  const totalDeductionPages = Math.ceil(userDeductions.length / deductionsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextDeductionPage = () => {
    if (currentDeductionPage < totalDeductionPages) {
      setCurrentDeductionPage(currentDeductionPage + 1);
    }
  };

  const prevDeductionPage = () => {
    if (currentDeductionPage > 1) {
      setCurrentDeductionPage(currentDeductionPage - 1);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100 
      }
    }
  };

  const modalVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        duration: 0.5 
      }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      transition: { 
        duration: 0.2 
      }
    }
  };

  return (
    <div className="p-2 md:p-4 space-y-4 max-w-6xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-start items-center mb-6"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFormModalOpen(true)}
          className="btn btn-primary text-sm md:text-base"
        >
          Add New Deduction
        </motion.button>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div className="overflow-x-auto">
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">All User Deductions</h2>
            <div className="text-sm text-gray-500">
              {uniqueUsers.length > 0 ? 
                `Showing ${indexOfFirstUser + 1} - ${Math.min(indexOfLastUser, uniqueUsers.length)} of ${uniqueUsers.length} users` : 
                'No users found'}
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : uniqueUsers.length === 0 ? (
            <motion.p 
              variants={itemVariants} 
              className="p-4 text-center text-gray-500"
            >
              No benefit deductions found.
            </motion.p>
          ) : (
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <motion.tr
                    key={user._id}
                    variants={itemVariants}
                    className="cursor-pointer hover:bg-gray-50 border-b"
                    onClick={() => handleRowClick(user)}
                  >
                    <td className="px-4 py-3">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-3 text-blue-500 font-medium">
                      View Deductions
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {uniqueUsers.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between items-center mt-4"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="btn btn-outline btn-sm" 
            onClick={prevPage} 
            disabled={currentPage === 1}
          >
            Previous
          </motion.button>
          
          <div className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="btn btn-outline btn-sm" 
            onClick={nextPage} 
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </motion.button>
        </motion.div>
      )}

      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden"
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">
                  {users.find((u) => u._id === selectedUser)?.firstName}{" "}
                  {users.find((u) => u._id === selectedUser)?.lastName}'s Deductions
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsUserModalOpen(false)}
                  className="btn btn-sm btn-circle"
                >
                  ✕
                </motion.button>
              </div>
              
              <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                <table className="table w-full">
                  <thead className="sticky top-0 bg-white">
                    <tr>
                      <th className="px-4 py-3">Benefit Name</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userDeductions.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-4 text-gray-500">
                          No deductions found for this user
                        </td>
                      </tr>
                    ) : (
                      currentDeductions.map((deduction) => (
                        <motion.tr 
                          key={deduction._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b"
                        >
                          <td className="px-4 py-3">
                            {deduction.BenefitRequestId?.compensationBenefitId
                              ?.benefitName || "N/A"}
                          </td>
                          <td className="px-4 py-3">₱{deduction.amount}</td>
                          <td className="px-4 py-3">
                            {new Date(deduction.createdAt).toLocaleDateString()}
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {userDeductions.length > 0 && (
                <div className="p-4 border-t flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Showing {userDeductions.length > 0 ? indexOfFirstDeduction + 1 : 0} - {Math.min(indexOfLastDeduction, userDeductions.length)} of {userDeductions.length} deductions
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      className="btn btn-outline btn-sm" 
                      onClick={prevDeductionPage} 
                      disabled={currentDeductionPage === 1}
                    >
                      Previous
                    </motion.button>
                    
                    <div className="text-sm font-medium">
                      Page {currentDeductionPage} of {totalDeductionPages || 1}
                    </div>
                    
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      className="btn btn-outline btn-sm" 
                      onClick={nextDeductionPage} 
                      disabled={currentDeductionPage === totalDeductionPages || totalDeductionPages === 0}
                    >
                      Next
                    </motion.button>
                  </div>
                </div>
              )}
              
              <div className="p-4 border-t flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsUserModalOpen(false)}
                  className="btn btn-primary"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-lg shadow-lg w-full max-w-lg"
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">Add User Deduction</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFormModalOpen(false)}
                  className="btn btn-sm btn-circle"
                >
                  ✕
                </motion.button>
              </div>
              
              <form onSubmit={handleAddDeduction} className="p-4 space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Select User</label>
                  <select
                    className="select select-bordered w-full"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Benefit Request</label>
                  <select
                    className="select select-bordered w-full"
                    value={benefitRequestId}
                    onChange={(e) => setBenefitRequestId(e.target.value)}
                    disabled={!selectedUser}
                  >
                    <option value="">Select a benefit request</option>
                    {allBenefitRequests
                      .filter(
                        (req) =>
                          req.userId === selectedUser &&
                          req.status.toLowerCase() === "approved"
                      )
                      .map((req) => (
                        <option key={req._id} value={req._id}>
                          {req.compensationBenefitId?.benefitName || "Unnamed Benefit"}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Amount</label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="₱0.00"
                    min={150}
                    disabled={!benefitRequestId}
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                        Processing...
                      </span>
                    ) : (
                      "Add Deduction"
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BenefitDeduction;