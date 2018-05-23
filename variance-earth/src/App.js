import React, { Component } from 'react';
import './App.css';
import SatelliteMap from './SatelliteMap.js';
import Intro from './Intro';

class App extends Component {
  render() {
    return (
      <div className="App">
          <Intro/>
          <SatelliteMap/>
      </div>
    );
  }
}

export default App;
