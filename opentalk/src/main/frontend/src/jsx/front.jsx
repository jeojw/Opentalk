import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import { themeContext } from './themeContext';

const Desktop = ({ children }) => {
    const isDesktop = useMediaQuery({ minWidth: 768 })
    return isDesktop ? children : null
}
const Mobile = ({ children }) => {
    const isMobile = useMediaQuery({ maxWidth: 767 })
    return isMobile ? children : null
}

const FrontComponent = () => {
    const { theme } = useContext(themeContext);

    const navigate = useNavigate();

    useEffect(()=>{
        if (localStorage.getItem("token")){
            navigate("/opentalk/main");
        }
    },[])

    const LinkToLogin = () =>{
        navigate("/opentalk/login")
    }

    const LinkToEnroll = () => {
        navigate("/opentalk/enroll")
    }

   return (
    <div>
        <Desktop>
            <Container style={{minHeight: '100vh'}} >
                <Row style={{position:"relative", bottom:"-5px"}}>
                    <Col md={{ span: 10, offset: 1 }} className="border-3 rounded-4 p-5" style={{backgroundColor: theme === 'light' ? "#7B7B7B" : "#595959"}}>
                        <div className='text-center'>
                            <h2 style={{color:"white"}}>오픈톡방에 오신 것을 환영합니다!</h2>
                        </div>
                        <br></br>
                        <div className="d-flex justify-content-between gap-1">
                            <Button
                                className='custom-button' 
                                variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"}
                                type="button" 
                                onClick={LinkToLogin} 
                                style={{fontSize: '20px', 
                                    padding: '10px 100px', 
                                    backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                    color:theme === 'light' ? "#000000" : "#FFFFFF"
                                }}><strong>로그인</strong></Button>
                            <Button 
                                className='custom-button'
                                variant={theme === 'light' ? "#CDCDCD" : "#A0A0A0"} 
                                type="button" 
                                onClick={LinkToEnroll} 
                                style={{fontSize: '20px', 
                                    padding: '10px 100px', 
                                    backgroundColor:theme === 'light' ? "#CDCDCD" : "#A0A0A0",
                                    color:theme === 'light' ? "#000000" : "#FFFFFF"
                                }}><strong>회원가입</strong></Button>
                        </div> 
                    </Col>
                </Row>
            </Container>
        </Desktop>
        <Mobile>
            <Container style={{minHeight: '100vh'}} >
                <Row style={{position:"relative", bottom:"-5px"}}>
                    <Col md={{ span: 10, offset: 1 }} className="border-#7B7B7B border-3 rounded-3 p-5" style={{backgroundColor:"#7B7B7B"}}>
                        <div className='text-center'>
                            <h2 style={{color:"white"}}>오픈톡방에 오신 것을 환영합니다!</h2>
                        </div>
                        <br></br>
                        <div className="d-grid gap-1">
                            <Button variant='#CDCDCD' type="button" onClick={LinkToLogin} 
                            style={{fontSize: '15px', 
                            padding: '10px 100px', 
                            backgroundColor:"#CDCDCD",
                            borderTopLeftRadius: "25px",
                            borderBottomLeftRadius: "25px",
                            borderTopRightRadius: "25px",
                            borderBottomRightRadius: "25px",
                            width: "100%"}}><strong>로그인</strong></Button>
                            <br></br>
                            <Button variant='#CDCDCD' type="button" onClick={LinkToEnroll} 
                            style={{fontSize: '15px', 
                            padding: '10px 100px', 
                            backgroundColor:"#CDCDCD",
                            borderTopLeftRadius: "25px",
                            borderBottomLeftRadius: "25px",
                            borderTopRightRadius: "25px",
                            borderBottomRightRadius: "25px",
                            width: "100%"}}><strong>회원가입</strong></Button>
                        </div> 
                    </Col>
                </Row>
            </Container>
        </Mobile>
    </div>
    
    );
}

export default FrontComponent;