import data from './assets/data/miners.json';
import './App.css';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

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

interface StatusCount {
  status: string;
  count: number;
  color: string;
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
  const [graphs, setGraphs] = useState <boolean | null> (null);

  const handleMinerClick = (miner: Miner) => {
    setSelectedMiner(miner);
  };

  const minersByPDU: MinersByPDU = {};
  
  const statusCount: StatusCount[] = [
    { status: 'OK', count: 0, color: '#50C804' },
    { status: 'Hashrate loss', count: 0, color: '#7499FF' },
    { status: 'Warning', count: 0, color: '#FFC859' },
    { status: 'Minor issue', count: 0, color: '#FFBF00' },
    { status: 'Major issue', count: 0, color: '#E97659' },
    { status: 'Critical state', count: 0, color: '#EF1818' }
  ];

  data[19]?.values.forEach(miner => {
    if (!minersByPDU[miner.pdu]) {
      minersByPDU[miner.pdu] = [];
    }
    minersByPDU[miner.pdu].push(miner);

    const foundItem = statusCount.find(item => item.status === statusSetter(miner.s));
    if (foundItem) {
      foundItem.count += 1;
    }
  });  

  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: any; payload: StatusCount }>;
    label?: string;
  }

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const count = payload[0].value;

      return (
        <div className="custom-tooltip">
          <p className="label">{`${label} : ${count}`}</p>
        </div>
      );
    }

    return null;
  };


  return (
    <>
      <div className='container'>
        <div className='title-flex'>
          <h1 className='title'>{data[19].name}</h1>
          <h1 className='graph-icon' onClick={() => setGraphs(true)}> GRAPHS </h1>
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
              <div> <b>Hashrate 5s:</b> {selectedMiner.TH5s || 'no data'} h/s</div>
              <div> <b>Hashrate 1h:</b> {selectedMiner.THAvg || 'no data'} h/s</div>
              <div> <b>Frequency:</b> {selectedMiner.freq || 'no data'} MHz</div>
              <div> <b>Status:</b> {statusSetter(selectedMiner.s) || 'no data'} </div>
              <div> <b>Temperature:</b> {selectedMiner.tB || 'no data'} &deg;C</div>
              <div> <b>Power:</b> {selectedMiner.w || 'no data'} W</div>
            </div>
            <h2>
              <button onClick={() => setSelectedMiner(null)}>Close</button>
            </h2>
          </div>
        </div>
      )}

      {graphs && (
        <div className='popup-holder'>
          <div className='popup'>
            <div className='chart-box'>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={statusCount}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                <Legend
                  payload={statusCount.map((entry) => ({
                    value: entry.status,
                    type: 'square',
                    color: entry.color
                  }))}
                />
                <Bar dataKey="count">
                  {statusCount.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            </div>
            <button onClick={() => setGraphs(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;