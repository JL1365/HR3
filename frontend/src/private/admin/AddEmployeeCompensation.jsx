import React, { useState, useEffect } from 'react';
import { useSalaryRequestStore } from '../../store/salaryRequestStore';
import { useAuthStore } from '../../store/authStore';
import { useCompensationBenefitStore } from '../../store/compensationBenefitStore';

function AddEmployeeCompensation() {
  const { addEmployeeCompensation, error } = useSalaryRequestStore();
  const { users, fetchAllUsers } = useAuthStore();
  const { benefits, fetchBenefits } = useCompensationBenefitStore();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    employeeId: '',
    benefit: '',
    benefitType: '',
    daysLeave: 0,
    deductionAmount: 0,
  });

  useEffect(() => {
    fetchAllUsers();
    fetchBenefits();
  }, [fetchAllUsers, fetchBenefits]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Reset success message when form changes
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await addEmployeeCompensation(formData);
      setSuccessMessage('Employee compensation added successfully');
      
      // Reset form
      setFormData({
        employeeId: '',
        benefit: '',
        benefitType: '',
        daysLeave: 0,
        deductionAmount: 0,
      });
    } catch (err) {
      // Error will be handled by the store
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBenefits = benefits.filter(benefit => {
    if (formData.benefitType === "Paid Benefit") {
      return benefit.benefitType === "Paid Benefit" && !benefit.isNeedRequest;
    } else if (formData.benefitType === "Deduction") {
      return benefit.benefitType === "Deduction";
    }
    return false;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Add Employee Compensation</h2>
      </div>

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          <p>{successMessage}</p>
        </div>
      )}


      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee
            </label>
            <select 
              name="employeeId" 
              value={formData.employeeId}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select Employee</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Benefit Type
            </label>
            <select 
              name="benefitType" 
              value={formData.benefitType}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select Benefit Type</option>
              <option value="Paid Benefit">Paid Benefit</option>
              <option value="Deduction">Deduction</option>
            </select>
          </div>
        </div>

        {formData.benefitType && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Benefit
            </label>
            <select 
              name="benefit" 
              value={formData.benefit}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select Benefit</option>
              {filteredBenefits.map(benefit => (
                <option key={benefit._id} value={benefit._id}>
                  {benefit.benefitName}
                </option>
              ))}
            </select>
          </div>
        )}

        {formData.benefitType === "Paid Benefit" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Days Leave
            </label>
            <input 
              type="number" 
              name="daysLeave" 
              value={formData.daysLeave}
              onChange={handleChange}
              min="0"
              step="0.5"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        )}

        {formData.benefitType === "Deduction" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deduction Amount
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₱</span>
              </div>
              <input 
                type="number" 
                name="deductionAmount" 
                value={formData.deductionAmount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="block w-full pl-7 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => {
              setFormData({
                employeeId: '',
                benefit: '',
                benefitType: '',
                daysLeave: 0,
                deductionAmount: 0,
              });
              setSuccessMessage('');
            }}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Processing...' : 'Add Compensation'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEmployeeCompensation;