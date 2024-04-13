import React, {useEffect, useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './jsx/login'
import Front from './jsx/front'
import Enroll from './jsx/enroll'
import Main from './jsx/main'
import FindId from './jsx/findId'
import FindPw from './jsx/findPw'
import ChangePw from './jsx/changePw'
import AuthId from './jsx/authId'
import Room from './jsx/room'
import Profile from './jsx/profile'
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
        <Route path="opentalk/profile" element={<Profile/>}></Route>
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
