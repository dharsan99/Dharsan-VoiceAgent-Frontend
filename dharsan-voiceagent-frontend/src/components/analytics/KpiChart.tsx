import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface KpiDataPoint {
  timestamp: string;
  averageLatency: number;
  jitter: number;
  packetLoss: number;
  bufferSize: number;
  jitterBufferDelay: number;
}

interface KpiChartProps {
  kpiData: KpiDataPoint[];
}

export const KpiChart: React.FC<KpiChartProps> = ({ kpiData }) => {
  if (!kpiData || kpiData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-800/50 rounded-lg border border-gray-700/50">
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700/50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">No Performance Data</p>
          <p className="text-sm">Start a conversation to see real-time metrics</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: kpiData.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Latency (ms)',
        data: kpiData.map(d => d.averageLatency),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Jitter (ms)',
        data: kpiData.map(d => d.jitter),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Buffer Size',
        data: kpiData.map(d => d.bufferSize),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { 
          color: '#d1d5db',
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'normal' as const
          }
        }
      },
      title: {
        display: true,
        text: 'Real-Time Network Performance Metrics',
        color: '#f9fafb',
        font: {
          size: 16,
          weight: 'bold' as const
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        titleColor: '#f9fafb',
        bodyColor: '#d1d5db',
        borderColor: '#4b5563',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      x: { 
        ticks: { 
          color: '#9ca3af',
          maxRotation: 45,
          font: {
            size: 11
          }
        }, 
        grid: { 
          color: 'rgba(75, 85, 99, 0.3)',
          drawBorder: false
        },
        border: {
          color: '#4b5563'
        }
      },
      y: { 
        ticks: { 
          color: '#9ca3af',
          font: {
            size: 11
          }
        }, 
        grid: { 
          color: 'rgba(75, 85, 99, 0.3)',
          drawBorder: false
        },
        border: {
          color: '#4b5563'
        },
        beginAtZero: true
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      point: {
        hoverBackgroundColor: '#ffffff',
        hoverBorderColor: '#000000',
        hoverBorderWidth: 3,
      }
    },
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-3 sm:p-6">
      <div className="h-64 sm:h-80">
        <Line options={options} data={chartData} />
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
        <div className="bg-gray-700/50 rounded-lg p-2 sm:p-3 text-center">
          <div className="text-lg sm:text-2xl font-bold text-green-400">
            {kpiData.length > 0 ? kpiData[kpiData.length - 1].averageLatency.toFixed(1) : '0'}ms
          </div>
          <div className="text-xs sm:text-sm text-gray-400">Current Latency</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 sm:p-3 text-center">
          <div className="text-lg sm:text-2xl font-bold text-yellow-400">
            {kpiData.length > 0 ? kpiData[kpiData.length - 1].jitter.toFixed(1) : '0'}ms
          </div>
          <div className="text-xs sm:text-sm text-gray-400">Current Jitter</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 sm:p-3 text-center">
          <div className="text-lg sm:text-2xl font-bold text-blue-400">
            {kpiData.length > 0 ? kpiData[kpiData.length - 1].bufferSize : '0'}
          </div>
          <div className="text-xs sm:text-sm text-gray-400">Buffer Size</div>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-2 sm:p-3 text-center">
          <div className="text-lg sm:text-2xl font-bold text-purple-400">
            {kpiData.length}
          </div>
          <div className="text-xs sm:text-sm text-gray-400">Data Points</div>
        </div>
      </div>
    </div>
  );
}; 