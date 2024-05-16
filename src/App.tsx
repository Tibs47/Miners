import data from './assets/data/miners.json';
import './App.css';
import { useState } from 'react';

interface Miner {
  TH5s?: number;
  THAvg?: number;
  tB?: number;
  freq?: number;
  w?: number;
  s?: number;
  pdu: number;
  port: number;
}

interface MinersByPDU {
  [key: string]: Miner[];
}

function hasValidData(miner: Miner): boolean {
  // Check if any of the optional properties are defined
  return (
    miner.TH5s !== undefined ||
    miner.THAvg !== undefined ||
    miner.tB !== undefined ||
    miner.freq !== undefined ||
    miner.w !== undefined ||
    miner.s !== undefined
  );
}

function statusSetter(status: any): string {
  switch(status){
    case 10: return 'OK';
    case 20: return 'Hashrate loss';
    case 30: return 'Warning';
    case 40: return 'Minor issue';
    case 50: return 'Major issue';
    case 60: return 'Critical state';
    default: return 'no status';
  }
}

function colorSetter(status: any): any {
  let backgroundColor = '#000000';
  switch(status){
  case 10: backgroundColor = '#50C804'; break;
  case 20: backgroundColor = '#7499FF'; break;
  case 30: backgroundColor = '#FFC859'; break;
  case 40: backgroundColor = '#FFBF00'; break;
  case 50: backgroundColor = '#E97659'; break;
  case 60: backgroundColor = '#EF1818'; break;
  default: backgroundColor = '#000000'; break;
  }
  return {backgroundColor};
}

function App() {
  const [selectedMiner, setSelectedMiner] = useState<Miner | null>(null);


  const handleMinerClick = (miner: Miner) => {
    setSelectedMiner(miner);
  };

  const minersByPDU: MinersByPDU = {};

  data[19]?.values.forEach(miner => {
    if (!minersByPDU[miner.pdu]) {
      minersByPDU[miner.pdu] = [];
    }
    minersByPDU[miner.pdu].push(miner);
  });

  return (
    <>
      <div className='container'> 
        <div className='title-flex'>
          <h1 className='title'>{data[19].name}</h1>
          <h1 className='graph-icon'> GRAPHS... </h1>
        </div>
          <div className='pdu-list'>
            {Object.entries(minersByPDU).map(([pdu, miners]) => (
              <div key={pdu} className='pdu'>
                <h2>PDU {pdu}</h2>
                <div className="miner-list">
                  {miners.map((miner, index) => (
                      hasValidData(miner) ? (
                        <div style={colorSetter(miner.s)} className="miner-port" key={index} onClick={() => handleMinerClick(miner)}>
                          {miner.port}
                        </div>
                      ) : null
                  ))}
                </div>
              </div>
            ))}
          </div>
      </div>
      {selectedMiner && (
        <div className='popup-holder'>
          <div className="popup">
            <h2 className='miner-name'>Miner Details</h2>
            <div className='miner-data'>
              <div> <b>PDU:</b> {selectedMiner.pdu}</div>
              <div> <b>Port:</b> {selectedMiner.port}</div>
              <div> <b>Hashrate 5s:</b> {selectedMiner.TH5s} h/s</div>
              <div> <b>Hashrate 1h:</b> {selectedMiner.THAvg} h/s</div>
              <div> <b>Frequency:</b> {selectedMiner.freq} MHz</div>
              <div> <b>Status:</b> {statusSetter(selectedMiner.s)} </div>
              <div> <b>Temperature:</b> {selectedMiner.tB} &deg;C</div>
              <div> <b>Power:</b> {selectedMiner.w} W</div>
            </div>
            <h2>
              <button onClick={() => setSelectedMiner(null)}>Close</button>
            </h2>
          </div>
        </div>
      )}
    </>
  );
}

export default App;