import { useEffect } from 'react';
import { useAttendanceStore } from '../../store/attendanceStore';
import AddEmployeeCompensation from './AddEmployeeCompensation';

function Attendance() {
    const { attendanceData, leaveData, fetchAttendanceData, fetchLeaveData } = useAttendanceStore();

    useEffect(() => {
        fetchAttendanceData();
        fetchLeaveData();
    }, [fetchAttendanceData, fetchLeaveData]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold mb-4">Attendance Records</h1>
            <div className="overflow-x-auto">
                <table className="table-auto w-full border border-gray-300">
                    <thead className="bg-gray-200">
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Position</th>
                            <th>Time In</th>
                            <th>Time Out</th>
                            <th>Total Hours</th>
                            <th>Overtime Hours</th>
                            <th>Entry Type</th>
                            <th>Is Holiday</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceData && attendanceData.map(record => (
                            <tr key={record._id} className="border-t">
                                <td>{record.employee_firstname}</td>
                                <td>{record.employee_lastname}</td>
                                <td>{record.position}</td>
                                <td>{record.time_in ? new Date(record.time_in).toLocaleString() : '—'}</td>
                                <td>{record.time_out ? new Date(record.time_out).toLocaleString() : '—'}</td>
                                <td>{record.total_hours}</td>
                                <td>{record.overtime_hours}</td>
                                <td>{record.entry_type}</td>
                                <td>{record.isHoliday ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h1 className="text-2xl font-semibold mt-8 mb-4">Leave Records</h1>
            <table className="table-auto w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 border">Name</th>
                        <th className="px-4 py-2 border">Department</th>
                        <th className="px-4 py-2 border">Leave Type</th>
                        <th className="px-4 py-2 border">Start Date</th>
                        <th className="px-4 py-2 border">End Date</th>
                        <th className="px-4 py-2 border">Reason</th>
                        <th className="px-4 py-2 border">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {leaveData && leaveData.map((leave) => (
                        <tr key={leave.leave_id}>
                            <td className="px-4 py-2 border">{leave.employee_firstname} {leave.employee_lastname}</td>
                            <td className="px-4 py-2 border">{leave.employee_department}</td>
                            <td className="px-4 py-2 border">{leave.leave_type}</td>
                            <td className="px-4 py-2 border">{new Date(leave.start_date).toLocaleDateString()}</td>
                            <td className="px-4 py-2 border">{new Date(leave.end_date).toLocaleDateString()}</td>
                            <td className="px-4 py-2 border">{leave.reason}</td>
                            <td className="px-4 py-2 border">{leave.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <AddEmployeeCompensation />
        </div>
    );
}

export default Attendance;
