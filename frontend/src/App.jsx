import {Routes,Route} from 'react-router-dom';

import AdminLogin from './public/AdminLogin';
import EmployeeLogin from './public/EmployeeLogin';

import AdminDashboard from './private/admin/AdminDashboard';
import EmployeeDashboard from './private/employee/EmployeeDashboard';

function App() {
  

  return (
    <>
      <Routes>
        <Route path='/admin-login' element={<AdminLogin/>}/>
        <Route path='/employee-login' element={<EmployeeLogin/>}/>

        <Route path='/admin-dashboard' element={<AdminDashboard/>}/>
        <Route path='/employee-dashboard' element={<EmployeeDashboard/>}/>

      </Routes>
    </>
  )
}

export default App
