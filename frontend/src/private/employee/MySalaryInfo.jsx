import usePageTracking from "../../hooks/usePageTracking"
import GrossSalary from "./GrossSalary"
import MyPayrollHistory from "./MyPayrollHistory"
import NetSalary from "./NetSalary"

function MySalaryInfo () {
    usePageTracking("My Salary Info")
    return (
        <div>
            <GrossSalary />
            <NetSalary />
            <MyPayrollHistory />
        </div>
    )
}

export default MySalaryInfo