import { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCompensationStore } from "../../store/compensationStore";
import { motion } from "framer-motion";

const Grievance = () => {
  const { grievances, loading, error, fetchGrievances } = useCompensationStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pdfPreview, setPdfPreview] = useState(null);

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

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
  const currentItems = grievances.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(grievances.length / itemsPerPage);

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
      {loading && (
        <div className="flex justify-center items-center my-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="table-auto w-full pb-5 text-sm">
          <thead className="bg-white text-gray-500 border-b">
            <tr>
              <th className="p-3 text-left">Grievance ID</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Document</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white text-neutral-500 border-b">
            {currentItems.length > 0 ? (
              currentItems.map((grievance) => (
                <tr key={grievance._id}>
                  <td className="p-3 border-b">{grievance._id}</td>
                  <td className="p-3 border-b">{grievance.ComplaintDescription}</td>
                  <td className="p-3 border-b">
                    {grievance.File ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDocumentClick(grievance.File)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View PDF
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleDownloadClick(e, grievance.File)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                        >
                          Download
                        </motion.button>
                      </div>
                    ) : (
                      <span className="text-gray-500">No Document</span>
                    )}
                  </td>
                  <td className="p-3 border-b">{grievance.status || "Pending"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 py-4">
                  No grievances found
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
          disabled={indexOfLastItem >= grievances.length}
        >
          Next
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Grievance;
