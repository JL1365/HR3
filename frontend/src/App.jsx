import {Routes,Route} from 'react-router-dom';

import AdminLogin from './public/AdminLogin';
import EmployeeLogin from './public/EmployeeLogin';

function App() {
  

  return (
    <>
      <Routes>
        <Route path='/admin-login' element={<AdminLogin/>}/>
        <Route path='/employee-login' element={<EmployeeLogin/>}/>
      </Routes>
    </>
  )
}

export default App
