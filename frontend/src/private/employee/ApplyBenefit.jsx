import React, { useEffect, useState } from 'react';
import { useBenefitRequestStore } from '../../store/benefitRequestStore';
import { useCompensationBenefitStore } from '../../store/compensationBenefitStore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import usePageTracking from '../../hooks/usePageTracking';

function ApplyBenefit() {
    usePageTracking('Apply Benefit');
    const { myApplyRequests, fetchMyApplyRequests, applyBenefit, error } = useBenefitRequestStore();
    const { benefits, fetchBenefits, loading } = useCompensationBenefitStore();

    const [currentPage, setCurrentPage] = useState(1);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // Add local state for loading
    const requestsPerPage = 10;
    const indexOfLastRequest = currentPage * requestsPerPage;
    const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
    const currentRequests = myApplyRequests.slice(indexOfFirstRequest, indexOfLastRequest);

    useEffect(() => {
        fetchMyApplyRequests();
        fetchBenefits();
    }, [fetchMyApplyRequests, fetchBenefits]);

    const handleApply = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const selectedBenefitId = formData.get("compensationBenefitId");
        const frontIdFile = formData.get("frontId");
        const backIdFile = formData.get("backId");

        if (!selectedBenefitId) {
            toast.error("Please select a benefit.");
            return;
        }

        const selectedBenefit = benefits.find(benefit => benefit._id === selectedBenefitId);
        if (!selectedBenefit) {
            toast.error("Selected benefit is invalid.");
            return;
        }

        const existingRequest = myApplyRequests.find(
            request => request.compensationBenefitId?._id === selectedBenefitId
        );

        if (existingRequest) {
            if (existingRequest.status === "Pending") {
                toast.error("You already have a pending request for this benefit.");
                return;
            }
            if (existingRequest.status === "Approved") {
                toast.error("You are already approved for this benefit.");
                return;
            }
        }

        if (selectedBenefit.isNeedRequest) {
            if (!frontIdFile || !backIdFile) {
                toast.error("Please upload both front and back ID images.");
                return;
            }
        }

        setIsSubmitting(true); // Set loading to true
        applyBenefit(formData)
            .then(() => {
                toast.success("Benefit applied successfully!");
                setIsApplyModalOpen(false);
            })
            .catch((err) => {
                const errorMessage = err.response?.data?.message || 
                                     err.message || 
                                     "Failed to apply for the benefit!";
                toast.error(errorMessage);
            })
            .finally(() => {
                setIsSubmitting(false); // Set loading to false
            });
    };

    const nextPage = () => {
        if (indexOfLastRequest < myApplyRequests.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
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
                onClick={() => setIsApplyModalOpen(true)}
            >
                Apply for Benefit
            </motion.button>
            {loading && (
                <div className="flex justify-center items-center my-4">
                    <div className="loading loading-spinner loading-lg text-primary"></div>
                </div>
            )}
            {isApplyModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">Apply for Benefit</h2>
                        <form onSubmit={handleApply}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Benefit</label>
                                <select name="compensationBenefitId" required className="input input-bordered w-full mt-1">
                                    <option value="">Select Benefit</option>
                                    {benefits
                                        .filter(benefit => benefit.isNeedRequest && benefit.isAvailable)
                                        .map(benefit => (
                                            <option key={benefit._id} value={benefit._id}>
                                                {benefit.benefitName}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Front ID</label>
                                <input type="file" name="frontId" required className="input input-bordered w-full mt-1" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Back ID</label>
                                <input type="file" name="backId" required className="input input-bordered w-full mt-1" />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsApplyModalOpen(false)}
                                    className="btn btn-secondary mr-2"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                {isSubmitting ? ( // Use isSubmitting for the loading state
                      <span className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                        Processing...
                      </span>
                    ) : (
                      "Apply"
                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <h2>My Applications</h2>
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="overflow-x-auto">
                    <table className="table-auto w-full pb-5 text-sm">
                        <thead className="bg-white text-gray-500 border-b">
                            <tr>
                                <th className="p-3 text-left">Benefit Name</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Comment</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white text-neutral-500 border-b">
                            {currentRequests.length > 0 ? (
                                currentRequests.map((request) => (
                                    <tr key={request._id}>
                                        <td className="p-3 border-b">
                                            {request.compensationBenefitId?.benefitName || 'N/A'}
                                        </td>
                                        <td className="p-3 border-b">
                                            {request.status}
                                        </td>
                                        <td className="p-3 border-b">
                                            {request.comment}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" className="text-center text-gray-500 py-4">
                                        No applications found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
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
                <span className="text-gray-700 text-xs md:text-sm">Page {currentPage}</span>
                <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary text-xs md:text-sm" 
                    onClick={nextPage} 
                    disabled={indexOfLastRequest >= myApplyRequests.length}
                >
                    Next
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

export default ApplyBenefit;
