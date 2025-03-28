import LeavesAndAttendance from "./LeavesAndAttendance"
import LoginActivity from "./LoginActivity"
import PageVisits from "./PageVisits"

function BehavioralAnalytics () {
    return (
        <div className="flex flex-col gap-4 p-2 md:p-4">
            <LoginActivity />
            <PageVisits />
            <LeavesAndAttendance />
        </div>
    )
}

export default BehavioralAnalytics