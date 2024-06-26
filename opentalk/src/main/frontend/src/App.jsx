import { BrowserView, MobileView } from 'react-device-detect';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import React, { useEffect, useContext, useState } from 'react';
import { Button, Dropdown, DropdownItem } from 'react-bootstrap';
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
import './css/UI.css'
import './css/CustomPagination.css'
import { themeContext } from './jsx/themeContext';
import { alarmContext } from './jsx/alarmContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { ReactNotifications } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css'
import { soundContext } from './jsx/soundContext';

const App = () => {
  const { alarms, setAlarms } = useContext(alarmContext);
  const {volume, setMute, setSound} = useContext(soundContext);
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");
  const [member, setMember] = useState();

  const setMobileHeight = () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`)
  }

  useEffect(() => {
    const fetchMyInfo = async () => {
        if (token){
            await axios.get('/api/opentalk/member/me', {
                headers: {
                    Authorization: token,
                }
            }).then((res) => {
                if (res.status === 200){
                    setMember(res.data);
                }
            }).catch((error) => console.log(error));
        }
    }    
    fetchMyInfo();
}, [token]);

  const { data: allAlarmMessage, isLoading: alarmIsLoading, isError: alarmIsError, isFetching: alarmIsFetching, isFetched: alarmIsFetched } = useQuery({
    queryKey:['allAlarmMessage'],
    queryFn: async () => {
        try{
            const alarmResponse = await axios.get(`/api/opentalk/member/allAlarmMessages/${member?.memberNickName}`);
            return alarmResponse.data;
        } catch(error){
            console.log(error);
        }
    },
    cacheTime: 30000,
    staleTime: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
})

  useEffect(() => {
    if (allAlarmMessage && !alarmIsLoading && !alarmIsError && !alarmIsFetching && alarmIsFetched){
      setAlarms(allAlarmMessage);
    };
  }, [allAlarmMessage, alarmIsLoading, alarmIsError, alarmIsFetching, alarmIsFetched]);

  const { mutate: mutateDeleteMessaage } = useMutation(async({messageId}) => {
    const deleteUrl = "/api/opentalk/member/deleteAlarmMessage";
    const data = new FormData();
    data.append("messageId", messageId);
    try{
      const res = await axios.post(deleteUrl, data);
      if (res.status === 200){
        queryClient.invalidateQueries('allAlarmMessage');
      }
    } catch(error){
      console.log(error);
    }
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries('allAlarmMessage');
    }
  })

  const deleteMessage = ({messageId}) =>{
    mutateDeleteMessaage({messageId:messageId});
  }

  useEffect(() => {
    setMobileHeight();
  });

  const {theme, changeTheme} = useContext(themeContext);

  return (
    <div>
      <ReactNotifications />
      <h1 
        className='border border-2'
        style={{position:'relative', 
                marginBottom:'0px',
                color: theme === 'light' ? '#000000' : "#FFFFFF", 
                backgroundColor:  theme === 'light' ? '#7B7B7B' : '#595959', 
                width:'100%', 
                height:'60px'}}>
      <strong>
        <div id="opentalkTitle" onClick={() => window.location.href = '/opentalk'} style={{cursor:'pointer'}}>
          OpenTalk
        </div>
      </strong>
      {token !== null && (
      volume === 1 ? (
        <Button className='custom-button' 
        variant={theme === 'light' ? '#CDCDCD' : '#A0A0A0'}
        style={{ backgroundColor:theme === 'light' ? '#CDCDCD' : '#A0A0A0',
                color:theme === 'light' ? '#000000' : '#FFFFFF',
                position:'absolute',
                bottom: '10px',
                right: '150px'}}  
        onClick={setMute}><img alt="소리 이미지" src={`${process.env.PUBLIC_URL}/${theme === "light" ? "speaker_on_lightmode.png" : "speaker_on_darkmode.png"}`} 
        width={30}
        style={{position:"relative", bottom:"3px"}}
        ></img>
        </Button>
      ) : (
        <Button className='custom-button' 
        variant={theme === 'light' ? '#CDCDCD' : '#A0A0A0'}
        style={{ backgroundColor:theme === 'light' ? '#CDCDCD' : '#A0A0A0',
                color:theme === 'light' ? '#000000' : '#FFFFFF',
                position:'absolute',
                bottom: '10px',
                right: '150px'}}  
        onClick={setSound}><img alt="음소거 이미지" src={`${process.env.PUBLIC_URL}/${theme === "light" ? "speaker_off_lightmode.png" : "speaker_off_darkmode.png"}`} 
        width={30}
        style={{position:"relative", bottom:"3px"}}
        ></img></Button>
      ))}
      {token !== null && (
        <Dropdown style={{
          position:'absolute',
          bottom: '10px',
          right: '87px'
        }}>
          <Dropdown.Toggle
          className='custom-ui'
          variant={theme === 'light' ? "#FFFFFF" : "#121212"} style={{
          backgroundColor:theme === 'light' ? "#FFFFFF" : "#121212",
          color:theme === 'light' ? "#000000" : '#FFFFFF',
        }}>
          {alarms.length !== 0 ? (
            <img alt="알림 이미지" src={`${process.env.PUBLIC_URL}/${theme === "light" ? "alarm_light.png" : "alarm_dark.png"}`} 
            width={17} style={{position:"relative"}}></img>
          ) : (
            <img alt="알림 이미지" src={`${process.env.PUBLIC_URL}/${theme === "light" ? "alarm_none_light.png" : "alarm_none_dark.png"}`}  
            width={17} style={{position:"relative"}}></img>
          )}
          </Dropdown.Toggle>
          <Dropdown.Menu>
          {alarms.map((_message) => {
            return (
              <DropdownItem>
                <strong>{_message.alarmMessage}</strong>
                <><hr />
                <br></br>
                <br></br>
                <Button
                className='custom-button'
                variant='dark'
                onClick={() => deleteMessage({messageId:_message.messageId})}
                style={{
                  position: 'absolute',
                  bottom: '15px',
                  right: '10px'
                }}>확인</Button></>
              </DropdownItem>
            )
          })}
          </Dropdown.Menu>
        </Dropdown>
      )}
      {theme === 'light' ? (
        <img alt='다크모드OFF' src={`${process.env.PUBLIC_URL}/darkmode_OFF.png`} width={75} style={{position:'absolute',
        bottom: '12px',
        right: '5px'}}onClick={() => {
        if (theme === 'light'){
          changeTheme('dark');
        }
        else{
          changeTheme('light');
        }
        }}></img>
      ) : (
        <img alt='다크모드ON' src={`${process.env.PUBLIC_URL}/darkmode_ON.png`} width={75} style={{position:'absolute',
        bottom: '12px',
        right: '5px'}}onClick={() => {
        if (theme === 'light'){
          changeTheme('dark');
        }
        else{
          changeTheme('light');
        }
        }}></img>
      )}
      </h1>
      <Router>
        <div>
          <BrowserView style={{backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212'}}>
            <Routes>
              <Route path="/" element={<Navigate to="/opentalk" />} />
              <Route path="/opentalk/profile" element={<Profile/>}></Route>
              <Route path="/opentalk/room/:room_Id" element={<Room/>}></Route>
              <Route path ="/opentalk/authId" element={<AuthId/>}></Route>
              <Route path = "/opentalk/changePw" element={<ChangePw/>}></Route>
              <Route path = "/opentalk/findId" element={<FindId/>}></Route>
              <Route path = "/opentalk/findPw" element={<FindPw/>}></Route>
              <Route path = "/opentalk/login" element={<Login/>}></Route>
              <Route path = "/opentalk" element={<Front/>}></Route>
              <Route path = "/opentalk/enroll" element={<Enroll/>}></Route>
              <Route path = "/opentalk/main" element={<Main/>}></Route>
            </Routes>
          </BrowserView>
          <MobileView style={{backgroundColor:theme === 'light' ? '#FFFFFF' : '#121212'}}>
            <Routes>
              <Route path="/" element={<Navigate to="/opentalk" />} />
              <Route path="/opentalk/profile" element={<ProfileMobile/>}></Route>
              <Route path="/opentalk/room/:room_Id" element={<RoomMobile/>}></Route>
              <Route path ="/opentalk/authId" element={<AuthIdMobile/>}></Route>
              <Route path = "/opentalk/changePw" element={<ChangePwMobile/>}></Route>
              <Route path = "/opentalk/findId" element={<FindIdMobile/>}></Route>
              <Route path = "/opentalk/findPw" element={<FindPwMobile/>}></Route>
              <Route path = "/opentalk/login" element={<LoginMobile/>}></Route>
              <Route path = "/opentalk" element={<FrontMobile/>}></Route>
              <Route path = "/opentalk/enroll" element={<EnrollMobile/>}></Route>
              <Route path = "/opentalk/main" element={<MainMobile/>}></Route>
            </Routes>
          </MobileView>
        </div>
      </Router>
    </div>
    
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