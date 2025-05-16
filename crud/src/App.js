import React from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import CreateProject from './Components/Projects/CreateProject';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/createproject" element={<CreateProject />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
