import React, {useEffect, useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './js/login'
import Front from './js/front'
import Enroll from './js/enroll'
import Main from './js/main'

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path = "opentalk/member/login" element={<Login/>}></Route>
          <Route path = "opentalk/front" element={<Front/>}></Route>
          <Route path = "opentalk/member/enroll" element={<Enroll/>}></Route>
          <Route path = "opentalk/main" element={<Main/>}></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
