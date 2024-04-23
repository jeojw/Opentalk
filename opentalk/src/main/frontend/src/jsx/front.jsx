import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Row, Col } from 'react-bootstrap';

const FrontComponent = (props) => {
    const navigate = useNavigate();

    const LinkToLogin = () =>{
        navigate("/opentalk/member/login")
    }

    const LinkToEnroll = () => {
        navigate("/opentalk/member/enroll")
    }

   return (
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
    );
}

export default FrontComponent;