import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useBenefitRequestStore } from "../../store/benefitRequestStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function BenefitRequest() {
  const {
    allBenefitRequests,
    fetchAllBenefitRequest,
    loading,
    error,
    clearError,
    updateBenefitRequestStatus,
  } = useBenefitRequestStore();
  const [imageTooltip, setImageTooltip] = useState(null);

  useEffect(() => {
    fetchAllBenefitRequest();
  }, [fetchAllBenefitRequest]);

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getBenefitName = (request) => {
    if (
      request.compensationBenefitId &&
      typeof request.compensationBenefitId === "object"
    ) {
      return (
        request.compensationBenefitId.name ||
        request.compensationBenefitId.benefitName ||
        "N/A"
      );
    }
    if (request.benefitId && typeof request.benefitId === "object") {
      return request.benefitId.name || request.benefitId.benefitName || "N/A";
    }
    return "N/A";
  };
  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await updateBenefitRequestStatus(requestId, { status: newStatus });
      toast.success(`Request ${newStatus} successfully!`);
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const plansPerPage = 10;

  const indexOfLastBenefitRequest = currentPage * plansPerPage;
  const indexOfFirstBenefitRequest = indexOfLastBenefitRequest - plansPerPage;
  const finalizedBenefitRequests = allBenefitRequests.filter(
    (req) => req.status === "Approved" || req.status === "Denied"
  );
  const currentBenefitRequest = finalizedBenefitRequests.slice(
    indexOfFirstBenefitRequest,
    indexOfLastBenefitRequest
  );

  const nextPage = () => {
    if (indexOfLastBenefitRequest < allBenefitRequests.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const pendingRequests = allBenefitRequests.filter(
    (req) => req.status !== "Approved" && req.status !== "Denied"
  );
  const finalizedRequests = allBenefitRequests.filter(
    (req) => req.status === "Approved" || req.status === "Denied"
  );
  const [selectedRequest, setSelectedRequest] = useState(null);
  return (
    <motion.div
      className="p-4 max-w-6xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ToastContainer />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingRequests.map((request) => (
          <div
            key={request._id}
            className="bg-white p-4 shadow rounded-lg border"
          >
            <h3 className="text-lg font-bold">{getBenefitName(request)}</h3>
            <p className="text-sm text-gray-600">
              {request.user?.firstName} {request.user?.lastName}
            </p>
            <p className="text-sm">{formatDate(request.createdAt)}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleUpdateStatus(request._id, "Approved")}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Approve
              </button>
              <button
                onClick={() => handleUpdateStatus(request._id, "Denied")}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Deny
              </button>
              <button
                onClick={() => setSelectedRequest(request)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold">Request Details</h2>
            <p className="text-sm text-gray-600">
              {selectedRequest.user?.firstName} {selectedRequest.user?.lastName}
            </p>
            <p className="text-sm">{formatDate(selectedRequest.createdAt)}</p>
            <div className="mt-4 flex space-x-2">
              {selectedRequest.uploadDocs?.frontId && (
                <a
                  href={selectedRequest.uploadDocs.frontId}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <motion.img
                    src={selectedRequest.uploadDocs.frontId}
                    alt="Front ID"
                    className="w-24 h-16 object-cover border rounded cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  />
                </a>
              )}
              {selectedRequest.uploadDocs?.backId && (
                <a
                  href={selectedRequest.uploadDocs.backId}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <motion.img
                    src={selectedRequest.uploadDocs.backId}
                    alt="Back ID"
                    className="w-24 h-16 object-cover border rounded cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  />
                </a>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() =>
                  handleUpdateStatus(selectedRequest._id, "Approved")
                }
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Approve
              </button>
              <button
                onClick={() =>
                  handleUpdateStatus(selectedRequest._id, "Denied")
                }
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Deny
              </button>
              <button
                onClick={() => setSelectedRequest(null)}
                className="bg-gray-500 text-white px-3 py-1 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <motion.div
          className="flex justify-center p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}

      {error && (
        <motion.div
          className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div className="flex items-center justify-between">
            <p className="text-red-700">{error}</p>
            <motion.button
              onClick={clearError}
              className="px-3 py-1 bg-white text-red-500 rounded shadow-sm hover:bg-red-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Dismiss
            </motion.button>
          </div>
        </motion.div>
      )}

      {!loading && allBenefitRequests?.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow">
          <motion.table
            className="table-auto w-full pb-5 text-sm"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            <thead className="bg-white text-gray-500 border-b">
              <tr>
                <th className="p-3 text-left">Employee Name</th>
                <th className="p-3 text-left">Position</th>
                <th className="p-3 text-left">Benefit Name</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Documents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentBenefitRequest.map((request) => (
                <motion.tr
                  key={request._id}
                  variants={rowVariants}
                  whileHover={{ backgroundColor: "#f9fafb" }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.user?.firstName} {request.user?.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.user?.position || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getBenefitName(request)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <motion.span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : request.status === "Denied"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {request.status}
                    </motion.span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(request.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {request.uploadDocs?.frontId && (
                        <div className="relative">
                          <motion.div
                            className="relative"
                            onHoverStart={() =>
                              setImageTooltip(`${request._id}-front`)
                            }
                            onHoverEnd={() => setImageTooltip(null)}
                          >
                            <a
                              href={request.uploadDocs.frontId}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <motion.img
                                src={request.uploadDocs.frontId}
                                alt="Front ID"
                                className="w-16 h-12 object-cover border rounded cursor-pointer"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              />
                            </a>
                            {imageTooltip === `${request._id}-front` && (
                              <motion.div
                                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                Front ID
                              </motion.div>
                            )}
                          </motion.div>
                        </div>
                      )}
                      {request.uploadDocs?.backId && (
                        <div className="relative">
                          <motion.div
                            className="relative"
                            onHoverStart={() =>
                              setImageTooltip(`${request._id}-back`)
                            }
                            onHoverEnd={() => setImageTooltip(null)}
                          >
                            <a
                              href={request.uploadDocs.backId}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <motion.img
                                src={request.uploadDocs.backId}
                                alt="Back ID"
                                className="w-16 h-12 object-cover border rounded cursor-pointer"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              />
                            </a>
                            {imageTooltip === `${request._id}-back` && (
                              <motion.div
                                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                Back ID
                              </motion.div>
                            )}
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        </div>
      ) : (
        !loading && (
          <motion.div
            className="text-center py-12 bg-gray-50 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-gray-500 text-lg">No benefit requests found.</p>
            <motion.button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchAllBenefitRequest}
            >
              Refresh
            </motion.button>
          </motion.div>
        )
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-between mt-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary text-xs md:text-sm"
          onClick={prevPage}
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
          className="btn btn-primary text-xs md:text-sm"
          onClick={nextPage}
          disabled={indexOfLastBenefitRequest >= allBenefitRequests.length}
        >
          Next
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default BenefitRequest;
