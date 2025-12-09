// app/test-api/page.js
'use client';
import { useState } from 'react';

export default function TestAPI() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busStop, setBusStop] = useState('83139'); // Example Bus Stop Code

  const fetchBusData = async () => {
    setLoading(true);
    try {
      // Call OUR internal proxy, not LTA directly
      const res = await fetch(`/api/lta/bus-arrival?code=${busStop}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      alert("Failed to fetch");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>LTA API Tester</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          value={busStop} 
          onChange={(e) => setBusStop(e.target.value)}
          placeholder="Bus Stop Code"
          style={{ padding: '10px', marginRight: '10px', color: 'black' }}
        />
        <button 
          onClick={fetchBusData}
          style={{ padding: '10px 20px', background: 'blue', color: 'white' }}
        >
          {loading ? 'Loading...' : 'Check Bus Arrival'}
        </button>
      </div>

      <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '5px', color: 'black' }}>
        <h3>Raw Response:</h3>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>

      {/* Visualizing the "Crowd" Logic for your Hackathon */}
      {data && data.Services && (
        <div style={{ marginTop: '20px' }}>
          <h3>Processed Crowd Info:</h3>
          {data.Services.map((bus) => (
            <div key={bus.ServiceNo} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc' }}>
              <strong>Bus {bus.ServiceNo}</strong><br/>
              Next Bus: {bus.NextBus.EstimatedArrival} <br/>
              Crowd Level: <span style={{ 
                color: bus.NextBus.Load === 'SEA' ? 'green' : 'red', 
                fontWeight: 'bold' 
              }}>
                {bus.NextBus.Load} {/* SEA=Seats Avail, SDA=Standing, LSD=Limited  */}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}