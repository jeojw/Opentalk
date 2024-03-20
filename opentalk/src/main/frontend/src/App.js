import React, {useState, useEffect} from 'react';

function App() {
  const [message, setMessage]=useState([]);
  useEffect(()=>{
    fetch("/opentalk")
        .then((response)=>{
          return response.json();
        })
        .then((data)=>{
            setMessage(data);
        });
  },[]);
  return (
    <div>
        {message}
        React Root
    </div>
  );
}

export default App;
