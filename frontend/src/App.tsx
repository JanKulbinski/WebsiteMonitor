import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import './App.scss';
import NewMonitor from './components/newMonitor/NewMonitor';
import AllMonitors from './components/allMonitors/AllMonitors';
import HomePage from './components/homePage/HomePage'
import Page404 from './components/Page404'
import "react-datetime/css/react-datetime.css";
import Room from './components/room.tsx/Room';
import { Notifications } from 'react-push-notification';

function App() {
  return (
      <Router>
        <Notifications />
        <Switch>
        <Route exact path="/">
            <HomePage/>
          </Route>
          <Route exact path="/new-monitor">
            <NewMonitor/>
          </Route>
          <Route exact path="/all-monitors">
            <AllMonitors/>
          </Route>
          <Route path="/room/:id">
            <Room/>
          </Route>
          <Route>
            <Page404/>
          </Route> 
        </Switch>
      </Router>
  );
}

export default App;
