import React from 'react';
import Tone from 'tone';
import axios from 'axios';
import Transport from './transport.jsx';
import FX from './fx.jsx';
var $ = require('jQuery')

class Synth extends React.Component {
  constructor(props) {
    super(props);

    // this.verb = new Tone.JCReverb(0.9).toMaster();
    // this.crusher = new Tone.BitCrusher(4).connect(this.verb);
    this.synth = new Tone.Synth({
      "oscillator": {
        "type": "fmsine4",
        "modulationType": "square",
        "volume": -20
      }
    }).toMaster();
    this.waves = ['sine', 'triangle', 'pulse', 'saw'];
    this.timeDivisions = ['1m', '2n', '4n', '8n', '16n'];

    this.state = {
      scale: ['major', 'minor'],
      keys: [{note: 'C4'}, {note: 'C#4'}, {note: 'D4'}, {note: 'D#4'}, {note: 'E4'}, {note: 'F4'}, {note: 'F#4'}, {note: 'G4',}, {note: 'G#4'}, {note: 'A4'}, {note: 'A#4'}, {note: 'B4'}],
      toggleOn: false,
      currentWave: null,
      recording: false,
      recCount: 0,
      currentRecord: [],
      currentDivision: '16n',
      lastIdx: 0,
      fx: {
          'BitCrusher': [false, 0],
          'Chorus': [false, 0],
          'Distortion': [false, 0],
          'JCReverb': [false, 0],
          'Phaser': [false, 0],
          'PingPongDelay': [false, 0],
          'StereoWidener': [false, 0]
        }
    }
  }

  componentDidMount(){
    // make a get request to get the lastIdx;
    axios.get('http://localhost:3000/api/seq')
      .then(res => {
        // this.setState({
        //   lastIdx: res.id,
        //   recCount: res.id++
        // });
        console.log('get has been called')
      }).catch(err => {
        console.log(err);
      });
  }

  componentDidUpdate() {
  }

  handleMouseKeyboardClick = (e) => {
    let hold = e.target.textContent;
    this.synth.triggerAttackRelease(e.target.textContent, this.state.currentDivision || '8n');
    if (this.state.recording) {
      this.setState({
        currentRecord: [...this.state.currentRecord, hold]
      });
      console.log(this.state.currentRecord);
    }
  };

  handleEffectsToggle = (e) => {
    /* REFACTOR LATER INEFFICIENT */
    let fx = Object.assign({}, this.state.fx);
    fx[e.target.textContent][0] = !this.state.fx[e.target.textContent][0];
    this.setState({fx});
    console.log(this.state.fx);
    // need to pass the val back down to bypass/engage
  };

  handleTimingDivToggle = (e) => {
    this.setState({
      currentDivision: e.target.textContent
    });

  };

  handleRecToggle = (e) => {
    let val = this.state.recCount;
    val++;
    this.setState({
      recording: !this.state.recording,
      recCount: val
    });

    if ( (val !== 0 && val % 2 === 0) && this.state.currentRecord[0] !== undefined ) {
      console.log('RECORDED');
      let data = {
        'idx': this.state.lastIdx++,
        'updated': Date.now(),
        'sequence': this.state.currentRecord
      }
      // REFACTOR TO AXIOS POST REQ
      axios.post('http://localhost:3000/api/seq', data)
        .then((res) => {
          console.log('SUCCESS')
          res.send(JSON.stringify(data));
          // console.log(this.state.currentRecord, 'PRE')
          // console.log('Succesful saved sequence', data)
          // console.log('POST', this.state.currentRecord);
        })
          .catch((err) => {console.log(err)});
    }
  };

  handleClearSeqToggle = (e) => {
    let currentRecord = [];
    this.setState({currentRecord});
  }
  //TEST
  render(){
    let tDivs = this.timeDivisions;
    let keys = this.state.keys;
    let fx = Object.keys(this.state.fx);

    return (
      <container>
          <h2 className="tDivTitle">Time Divisions</h2>
          <div className="timeDivisions">{tDivs.map((tDiv, idx) => <button key={tDiv} onClick={(e) => this.handleTimingDivToggle(e)} style={{
            fontWeight: tDiv === this.state.currentDivision ? 'bold' : 'normal',
            backgroundColor: tDiv === this.state.currentDivision ? 'red' : 'white'
          }}>{tDiv}</button>)}
          </div>
          <button
            onClick={(e) => this.handleRecToggle(e)}
            style={{
              borderWidth: this.state.recording ? 10 : 1,
              borderColor:this.state.recording ? 'red' : 'black',
              alignItems:'center',
              justifyContent:'center',
              width:100,
              height:100,
              backgroundColor:'#fff',
              borderRadius:100,
            }}>REC</button>
            <button onClick={(e) => {this.handleClearSeqToggle(e)}}>CLEAR SEQUENCE</button>
        <Transport currentRecord={this.state.currentRecord} currentDivision={this.state.currentDivision} synth={this.synth}/>
        <div className="keyboard">
          {keys.map(key => <button key={key.note} onClick={(e) => this.handleMouseKeyboardClick(e)}>{key.note}</button>)}
          <div className="effectsBar">
            {fx.map(effect => <button key={effect} style={{backgroundColor: this.state.fx[effect][0] ? 'green' : 'yellow'}} onClick={(e) => this.handleEffectsToggle(e)}>{effect}</button>)}
          </div>
        </div>
        <FX synth={this.synth}/>
      </container>
      )
  }
}

export default Synth;