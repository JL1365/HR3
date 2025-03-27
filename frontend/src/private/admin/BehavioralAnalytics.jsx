import LeavesAndAttendance from "./LeavesAndAttendance"
import LoginActivity from "./LoginActivity"
import PageVisits from "./PageVisits"

function BehavioralAnalytics () {
    return (
        <div>
            <LoginActivity />
            <PageVisits />
            <LeavesAndAttendance />
        </div>
    )
}

export default BehavioralAnalytics