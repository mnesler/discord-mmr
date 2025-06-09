import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MatchData {
  match_id: number;
  start_time: number;
  player_score: number;
  rank: number;
  division: number;
  division_tier: number;
}

function MMRHistoryGraph() {
  const [matchData, setMatchData] = useState<MatchData[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<'blake' | 'max'>('blake');
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<MatchData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/${selectedDataset}-mmr.json`);
      const data = await response.json();
      setMatchData(data);
    };
    fetchData();
  }, [selectedDataset]);

  useEffect(() => {
    if (showComparison) {
      const fetchComparisonData = async () => {
        const response = await fetch(`/${selectedDataset === 'blake' ? 'max' : 'blake'}-mmr.json`);
        const data = await response.json();
        setComparisonData(data);
      };
      fetchComparisonData();
    }
  }, [showComparison, selectedDataset]);

  const dates = matchData.map(match => new Date(match.start_time * 1000).toLocaleDateString());
  const scores = matchData.map(match => match.player_score);
  const ranks = matchData.map(match => match.rank);

  const comparisonScores = comparisonData.map(match => match.player_score);
  const comparisonRanks = comparisonData.map(match => match.rank);

  const scoreChartData = {
    labels: dates,
    datasets: [
      {
        label: `${selectedDataset === 'blake' ? 'Blake' : 'Max'} Score`,
        data: scores,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      ...(showComparison ? [{
        label: `${selectedDataset === 'blake' ? 'Max' : 'Blake'} Score`,
        data: comparisonScores,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      }] : []),
    ],
  };

  const rankChartData = {
    labels: dates,
    datasets: [
      {
        label: `${selectedDataset === 'blake' ? 'Blake' : 'Max'} Rank`,
        data: ranks,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      ...(showComparison ? [{
        label: `${selectedDataset === 'blake' ? 'Max' : 'Blake'} Rank`,
        data: comparisonRanks,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      }] : []),
    ],
  };

  const divisionData = {
    labels: ['Division 1', 'Division 2', 'Division 3', 'Division 4', 'Division 5'],
    datasets: [
      {
        label: `${selectedDataset === 'blake' ? 'Blake' : 'Max'} Time in Division`,
        data: [
          matchData.filter(m => m.division === 1).length,
          matchData.filter(m => m.division === 2).length,
          matchData.filter(m => m.division === 3).length,
          matchData.filter(m => m.division === 4).length,
          matchData.filter(m => m.division === 5).length,
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      ...(showComparison ? [{
        label: `${selectedDataset === 'blake' ? 'Max' : 'Blake'} Time in Division`,
        data: [
          comparisonData.filter(m => m.division === 1).length,
          comparisonData.filter(m => m.division === 2).length,
          comparisonData.filter(m => m.division === 3).length,
          comparisonData.filter(m => m.division === 4).length,
          comparisonData.filter(m => m.division === 5).length,
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }] : []),
    ],
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Match History Analysis</h1>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setSelectedDataset('blake')}
          style={{
            padding: '10px 20px',
            backgroundColor: selectedDataset === 'blake' ? '#4CAF50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Blake's Data
        </button>
        <button 
          onClick={() => setSelectedDataset('max')}
          style={{
            padding: '10px 20px',
            backgroundColor: selectedDataset === 'max' ? '#4CAF50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Max's Data
        </button>
        <button 
          onClick={() => setShowComparison(!showComparison)}
          style={{
            padding: '10px 20px',
            backgroundColor: showComparison ? '#2196F3' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {showComparison ? 'Hide Comparison' : 'Show Comparison'}
        </button>
      </div>
      <div style={{ marginBottom: '40px' }}>
        <h2>Player Score Over Time</h2>
        <Line
          data={scoreChartData}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Player Score Progression',
              },
            },
          }}
        />
      </div>
      <div style={{ marginBottom: '40px' }}>
        <h2>Rank Progression</h2>
        <Line
          data={rankChartData}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Rank History',
              },
            },
          }}
        />
      </div>
      <div>
        <h2>Time Spent in Each Division</h2>
        <Bar
          data={divisionData}
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Division Distribution',
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default MMRHistoryGraph;