import GrossSalary from "./GrossSalary"
import MyPayrollHistory from "./MyPayrollHistory"
import NetSalary from "./NetSalary"

function MySalaryInfo () {
    return (
        <div>
            <GrossSalary />
            <NetSalary />
            <MyPayrollHistory />
        </div>
    )
}

export default MySalaryInfo