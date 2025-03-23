import { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useIntegrationStore } from "../../store/integrationStore";
import { motion } from "framer-motion";

const BudgetRequest = () => {
  const [formData, setFormData] = useState({
    totalBudget: "",
    category: "",
    reason: "",
    documents: null,
  });

  const { budgetRequests, loading, error, fetchBudgetRequests, submitBudgetRequest } = useIntegrationStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchBudgetRequests();
  }, [fetchBudgetRequests]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, documents: e.target.files[0] });
  };

  const resetForm = () => {
    setFormData({ totalBudget: "", category: "", reason: "", documents: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.totalBudget || !formData.category || !formData.reason || !formData.documents) {
      toast.error("All fields are required.");
      return;
    }

    if (formData.category !== "Operational Expenses") {
      toast.error("HR3 must use category: 'Operational Expenses'.");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("department", "HR3");
    formDataObj.append("totalBudget", formData.totalBudget);
    formDataObj.append("category", formData.category);
    formDataObj.append("reason", formData.reason);
    formDataObj.append("documents", formData.documents);

    const token = localStorage.getItem("token");
    const result = await submitBudgetRequest(formDataObj, token);

    if (result.success) {
      toast.success("Budget request submitted successfully!");
      resetForm();
      fetchBudgetRequests();
      setIsOpenModal(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleDocumentClick = (documentUrl) => {
    setPdfPreview(documentUrl);
  };

  const handleDownloadClick = (e, documentUrl) => {
    e.preventDefault();
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = budgetRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(budgetRequests.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-2 md:p-4"
    >
      <ToastContainer autoClose={3000} />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full md:w-auto"
        onClick={() => setIsOpenModal(true)}
      >
        Create Budget Request
      </motion.button>
      {loading && (
        <div className="flex justify-center items-center my-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="table-auto w-full pb-5 text-sm">
          <thead className="bg-white text-gray-500 border-b">
            <tr>
              <th className="p-3 text-left">Total Budget</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Document</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Comment</th>
            </tr>
          </thead>
          <tbody className="bg-white text-neutral-500 border-b">
            {currentItems.length > 0 ? (
              currentItems.map((request) => (
                <tr key={request._id}>
                  <td className="p-3 border-b">₱{request.totalBudget}</td>
                  <td className="p-3 border-b">{request.category}</td>
                  <td className="p-3 border-b">{request.reason}</td>
                  <td className="p-3 border-b">
                    {request.documents ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDocumentClick(request.documents)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View PDF
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleDownloadClick(e, request.documents)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                        >
                          Download
                        </motion.button>
                      </div>
                    ) : (
                      <span className="text-gray-500">No Document</span>
                    )}
                  </td>
                  <td className="p-3 border-b">{request.status || "Pending"}</td>
                  <td className="p-3 border-b">{request.comment || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-4">
                  No budget requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pdfPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">PDF Preview</h2>
                <button 
                  onClick={() => setPdfPreview(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <iframe
                src={pdfPreview}
                className="w-full h-96 border rounded"
                title="PDF Preview"
              ></iframe>
            </div>
          </div>
        </div>
      )}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Create Budget Request</h2>
                <button 
                  onClick={() => setIsOpenModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Operational Expenses">Operational Expenses</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget</label>
                  <input
                    type="number"
                    name="totalBudget"
                    value={formData.totalBudget}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Documents</label>
                  <input
                    type="file"
                    name="documents"
                    accept=".pdf"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsOpenModal(false)} 
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
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
          onClick={() => setCurrentPage(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          Previous
        </motion.button>
        <span className="text-gray-700 text-xs md:text-sm">Page {currentPage} of {totalPages}</span>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary text-xs md:text-sm" 
          onClick={() => setCurrentPage(currentPage + 1)} 
          disabled={indexOfLastItem >= budgetRequests.length}
        >
          Next
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default BudgetRequest;