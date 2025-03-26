import React, { useState, useEffect } from 'react';
import { useViolationStore } from '../../store/violationStore';
import { useAuthStore } from '../../store/authStore';
import { usePenaltyStore } from '../../store/penaltyStore';

function EmployeeViolation() {
  const [formData, setFormData] = useState({
    userId: '',
    penaltyLevel: '',
    violationDate: '',
    sanctions: ''
  });

  const { addEmployeeViolation, fetchAllEmployeeViolations, violations, isLoading, error } = useViolationStore();
  const { users, fetchAllUsers } = useAuthStore();
  const { allPenaltyLevels, fetchAllPenaltyLevels } = usePenaltyStore();

  useEffect(() => {
    fetchAllUsers();
    fetchAllPenaltyLevels();
    fetchAllEmployeeViolations();
  }, [fetchAllUsers, fetchAllPenaltyLevels, fetchAllEmployeeViolations]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addEmployeeViolation(formData);
      alert('Violation added successfully');
    } catch (err) {
      alert('Error adding violation');
    }
  };

  return (
    <div>
      <h2>Add Employee Violation</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>User:</label>
          <select 
            name="userId" 
            value={formData.userId} 
            onChange={handleChange} 
            required
          >
            <option value="">Select User</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Penalty Level:</label>
          <select 
            name="penaltyLevel" 
            value={formData.penaltyLevel} 
            onChange={handleChange} 
            required
          >
            <option value="">Select Penalty Level</option>
            {allPenaltyLevels.map(level => (
              <option key={level._id} value={level._id}>
                {level.penaltyLevel} - {level.violationType}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Violation Date:</label>
          <input 
            type="date" 
            name="violationDate" 
            value={formData.violationDate} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div>
          <label>Sanctions:</label>
          <input 
            type="text" 
            name="sanctions" 
            value={formData.sanctions} 
            onChange={handleChange} 
          />
        </div>
        <button type="submit" disabled={isLoading}>Add Violation</button>
        {error && <p>{error}</p>}
      </form>
      <h2>All Employee Violations</h2>
      <ul>
        {violations.map(violation => (
          <li key={violation._id}>
            {violation.user.firstName} {violation.user.lastName} - 
            {violation.penaltyLevel ? `${violation.penaltyLevel.penaltyLevel} - ${violation.penaltyLevel.violationType}` : 'No Penalty Level'} - 
            {violation.violationDate}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EmployeeViolation;