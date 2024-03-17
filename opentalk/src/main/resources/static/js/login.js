function Login(){
    var inputId = document.getElementById('memberId').value;
    var inputPw = document.getElementById('memberPassword').value;

    if (inputId == null){
        alert("아이디를 입력하시오.");
        return "location.href='/member/login'"
    }
    else if (inputPw == null){
        alert("비밀번호를 입력하시오.");
        return "location.href='/member/login'"
    }
    else{
        return "location.href='/member/main'";
    }
}