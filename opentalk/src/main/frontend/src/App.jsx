import { BrowserView, MobileView } from 'react-device-detect';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
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
  const setMobileHeight = () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`)
  }

  useEffect(() => {
      setMobileHeight();
  });
  return (
    <Router>
      <div>
        <BrowserView>
          <Routes>
            <Route path="/opentalk/profile" element={<Profile/>}></Route>
            <Route path="/opentalk/room/:room_Id" element={<Room/>}></Route>
            <Route path ="/opentalk/authId" element={<AuthId/>}></Route>
            <Route path = "/opentalk/changePw" element={<ChangePw/>}></Route>
            <Route path = "/opentalk/findId" element={<FindId/>}></Route>
            <Route path = "/opentalk/findPw" element={<FindPw/>}></Route>
            <Route path = "/opentalk/login" element={<Login/>}></Route>
            <Route path = "/" element={<Front/>}></Route>
            <Route path = "/opentalk/enroll" element={<Enroll/>}></Route>
            <Route path = "/opentalk/main" element={<Main/>}></Route>
          </Routes>
        </BrowserView>
        <MobileView>
          <Routes>
            <Route path="/opentalk/profile" element={<ProfileMobile/>}></Route>
            <Route path="/opentalk/room/:room_Id" element={<RoomMobile/>}></Route>
            <Route path ="/opentalk/authId" element={<AuthIdMobile/>}></Route>
            <Route path = "/opentalk/changePw" element={<ChangePwMobile/>}></Route>
            <Route path = "/opentalk/findId" element={<FindIdMobile/>}></Route>
            <Route path = "/opentalk/findPw" element={<FindPwMobile/>}></Route>
            <Route path = "/opentalk/login" element={<LoginMobile/>}></Route>
            <Route path = "/" element={<FrontMobile/>}></Route>
            <Route path = "/opentalk/enroll" element={<EnrollMobile/>}></Route>
            <Route path = "/opentalk/main" element={<MainMobile/>}></Route>
          </Routes>
        </MobileView>
      </div>
    </Router>
  );
}

const ProfileMobile = () => <Profile />;
const RoomMobile = () => <Room />;
const AuthIdMobile = () => <AuthId />;
const ChangePwMobile = () => <ChangePw />;
const FindIdMobile = () => <FindId />;
const FindPwMobile = () => <FindPw />;
const LoginMobile = () => <Login />;
const FrontMobile = () => <Front />;
const EnrollMobile = () => <Enroll />;
const MainMobile = () => <Main />;

export default App;
