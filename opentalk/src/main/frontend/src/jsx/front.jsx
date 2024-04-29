import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

const Desktop = ({ children }) => {
    const isDesktop = useMediaQuery({ minWidth: 1224 })
    return isDesktop ? children : null
}
const Tablet = ({ children }) => {
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 })
    return isTablet ? children : null
}
const Mobile = ({ children }) => {
    const isMobile = useMediaQuery({ maxWidth: 767 })
    return isMobile ? children : null
}

const FrontComponent = (props) => {
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
            <Container>
                <Row>
                    <Col md={{ span: 10, offset: 1 }} className="border-#7B7B7B border-3 rounded-3 p-5" style={{backgroundColor:"#7B7B7B"}}>
                        <div className='text-center'>
                            <h2 style={{color:"white"}}>오픈톡방에 오신 것을 환영합니다!</h2>
                        </div>
                        <br></br>
                        <div className="d-flex justify-content-between gap-1">
                            <Button variant='#CDCDCD' type="button" onClick={LinkToLogin} 
                            style={{fontSize: '20px', 
                            padding: '10px 100px', 
                            backgroundColor:"#CDCDCD",
                            borderTopLeftRadius: "25px",
                            borderBottomLeftRadius: "25px",
                            borderTopRightRadius: "25px",
                            borderBottomRightRadius: "25px"}}><strong>로그인</strong></Button>
                            <Button variant='#CDCDCD' type="button" onClick={LinkToEnroll} 
                            style={{fontSize: '20px', 
                            padding: '10px 100px', 
                            backgroundColor:"#CDCDCD",
                            borderTopLeftRadius: "25px",
                            borderBottomLeftRadius: "25px",
                            borderTopRightRadius: "25px",
                            borderBottomRightRadius: "25px"}}><strong>회원가입</strong></Button>
                        </div> 
                    </Col>
                </Row>
            </Container>
        </Desktop>
        <Mobile>
            <Container>
                <Row>
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