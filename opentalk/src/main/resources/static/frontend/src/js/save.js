import React, {useState} from 'react';

const [idValue, setId] = useState('');
const [nickNameValue, setNickName] = useState('');
const [emailValue, setEmail] = useState('');

const saveMemberId = e => {
    setId(e.target.value);
}

const saveMemberNickName = e =>{
    setNickName(e.target.value);
}

const saveMemberEmail = e => {
    setEmail(e.target.value);
}

export default save;