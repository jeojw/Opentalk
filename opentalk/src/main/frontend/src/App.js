import React, {useEffect, useState} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './js/login.js'
import Front from './js/front.js'
import Save from './js/save.js'
import Main from './js/main.js'

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path = "/opentalk/login" component={Login}></Route>
          <Route path ="/opentalk/front" component={Front}></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
