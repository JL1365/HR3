import { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useBenefitStore } from "../../store/benefitStore";
import { motion } from "framer-motion";

const Documents = () => {
  const {
    uploadedDocuments,
    fetchUploadedDocuments,
    uploadBenefitDocument,
    loading,
    error,
    uploadSuccess,
  } = useBenefitStore();

  const [formData, setFormData] = useState({
    description: "",
    remarks: "",
    documentFile: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [pdfPreview, setPdfPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUploadedDocuments();
  }, []);

  useEffect(() => {
    if (uploadSuccess) {
      toast.success(uploadSuccess);
      resetForm();
      setIsOpenModal(false);
    }
  }, [uploadSuccess]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.documentFile) {
      toast.error("All fields are required.");
      return;
    }
    const formDataObj = new FormData();
    formDataObj.append("description", formData.description);
    formDataObj.append("remarks", formData.remarks);
    formDataObj.append("documentFile", formData.documentFile);
    await uploadBenefitDocument(formDataObj);
  };

  const resetForm = () => {
    setFormData({ description: "", remarks: "", documentFile: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFormData({ ...formData, documentFile: e.target.files[0] });

  const handleDocumentClick = (documentFile) => {
    setPdfPreview(documentFile);
  };

  const handleDownloadClick = (e, documentFile) => {
    e.preventDefault();
    const link = document.createElement('a');
    link.href = documentFile;
    link.download = 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const currentItems = uploadedDocuments.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
  const totalPages = Math.ceil(uploadedDocuments.length / itemsPerPage);
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
        Send Document
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
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Remarks</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white text-neutral-500 border-b">
            {currentItems.length > 0 ? (
              currentItems.map((document) => (
                <tr key={document._id}>
                  <td className="p-3 border-b">{document.description}</td>
                  <td className="p-3 border-b">{document.remarks}</td>
                  <td className="p-3 border-b">
                    {document.documentFile ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDocumentClick(document.documentFile)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View PDF
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleDownloadClick(e, document.documentFile)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                        >
                          Download
                        </motion.button>
                      </div>
                    ) : (
                      <span className="text-gray-500">No Document</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center text-gray-500 py-4">
                  No documents found
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
                <h2 className="text-xl font-bold text-gray-800">Send Document</h2>
                <button 
                  onClick={() => setIsOpenModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <input
                    type="text"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document</label>
                  <input
                    type="file"
                    name="documentFile"
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
        <span className="text-gray-700 text-xs md:text-sm">Page {currentPage}</span>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary text-xs md:text-sm" 
          onClick={() => setCurrentPage(currentPage + 1)} 
          disabled={indexOfLastItem >= uploadedDocuments.length}
        >
          Next
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Documents;