import React, {useEffect, useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './js/login'
import Front from './js/front'
import Enroll from './js/enroll'
import Main from './js/main'
import FindId from './js/findId'
import FindPw from './js/findPw'
import ChangePw from './js/changePw'
import AuthId from './js/authId'
import Room from './js/room'

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="opentalk/room/:room_Id" element={<Room/>}></Route>
          <Route path ="opentalk/member/authId" element={<AuthId/>}></Route>
          <Route path = "opentalk/member/changePw" element={<ChangePw/>}></Route>
          <Route path = "opentalk/member/findId" element={<FindId/>}></Route>
          <Route path = "opentalk/member/findPw" element={<FindPw/>}></Route>
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
