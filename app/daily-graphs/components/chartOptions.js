// Chart options and configurations

export const getChartOptions = (theme) => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
        color: theme === 'dark' ? '#ffffff' : '#374151',
        font: {
          size: 12,
          weight: '500'
        }
      }
    },
    tooltip: {
      backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.8)',
      titleColor: theme === 'dark' ? '#ffffff' : '#000000',
      bodyColor: theme === 'dark' ? '#ffffff' : '#000000',
      borderColor: theme === 'dark' ? 'rgba(139, 69, 255, 0.5)' : '#d1d5db',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            if (label.includes('Spend')) {
              label += '₹' + Math.round(context.parsed.y).toLocaleString();
            } else if (label.includes('CTR') || label.includes('CPC') || label.includes('CPM')) {
              label += context.parsed.y.toFixed(2);
            } else {
              label += context.parsed.y.toLocaleString();
            }
          }
          return label;
        }
      }
    },
    title: {
      display: true,
      text: 'Daily Performance Metrics',
      color: theme === 'dark' ? '#ffffff' : '#374151',
      font: {
        size: 14,
        weight: 'bold'
      }
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: theme === 'dark' ? 'rgba(139, 69, 255, 0.15)' : 'rgba(156, 163, 175, 0.2)',
      },
      ticks: {
        color: theme === 'dark' ? '#ffffff' : '#6b7280',
        font: {
          size: 11
        }
      }
    },
    x: {
      grid: {
        color: theme === 'dark' ? 'rgba(139, 69, 255, 0.15)' : 'rgba(156, 163, 175, 0.2)',
      },
      ticks: {
        color: theme === 'dark' ? '#ffffff' : '#6b7280',
        font: {
          size: 11
        }
      }
    }
  },
});

export const getDualAxisChartOptions = (theme) => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.8)',
      titleColor: theme === 'dark' ? '#ffffff' : '#000000',
      bodyColor: theme === 'dark' ? '#ffffff' : '#000000',
      borderColor: theme === 'dark' ? 'rgba(139, 69, 255, 0.5)' : '#d1d5db',
      borderWidth: 1,
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Date',
        color: theme === 'dark' ? '#ffffff' : '#6b7280',
        font: {
          size: 12,
          weight: 'bold'
        }
      },
      grid: {
        color: theme === 'dark' ? 'rgba(139, 69, 255, 0.15)' : 'rgba(156, 163, 175, 0.2)',
      },
      ticks: {
        color: theme === 'dark' ? '#ffffff' : '#6b7280',
        font: {
          size: 11
        }
      }
    },
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'Spend (₹)',
        color: 'rgb(239, 68, 68)',
        font: {
          size: 12,
          weight: 'bold'
        }
      },
      grid: {
        color: theme === 'dark' ? 'rgba(139, 69, 255, 0.15)' : 'rgba(156, 163, 175, 0.2)',
      },
      ticks: {
        color: theme === 'dark' ? '#ffffff' : '#6b7280',
        font: {
          size: 11
        },
        callback: function(value) {
          return '₹' + value.toLocaleString();
        }
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: {
        display: true,
        text: 'Purchases',
        color: 'rgb(34, 197, 94)',
        font: {
          size: 12,
          weight: 'bold'
        }
      },
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        color: theme === 'dark' ? '#ffffff' : '#6b7280',
        font: {
          size: 11
        }
      }
    },
  },
});

export const getScatterChartOptions = (theme) => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'point',
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.8)',
      titleColor: theme === 'dark' ? '#ffffff' : '#000000',
      bodyColor: theme === 'dark' ? '#ffffff' : '#000000',
      borderColor: theme === 'dark' ? 'rgba(139, 69, 255, 0.5)' : '#d1d5db',
      borderWidth: 1,
      callbacks: {
        title: function(context) {
          const point = context[0];
          return point.raw.label || 'Data Point';
        },
        label: function(context) {
          return [
            `Spend: ₹${context.parsed.x.toLocaleString()}`,
            `Purchases: ${context.parsed.y}`
          ];
        }
      }
    }
  },
  scales: {
    x: {
      type: 'linear',
      display: true,
      title: {
        display: true,
        text: 'Spend (₹)',
        color: theme === 'dark' ? '#ffffff' : '#6b7280',
        font: {
          size: 11,
          weight: 'bold'
        }
      },
      grid: {
        color: theme === 'dark' ? 'rgba(139, 69, 255, 0.15)' : 'rgba(156, 163, 175, 0.2)',
      },
      ticks: {
        color: theme === 'dark' ? '#ffffff' : '#6b7280',
        font: {
          size: 10
        },
        callback: function(value) {
          return '₹' + (value >= 1000 ? (value/1000).toFixed(0) + 'k' : value);
        }
      }
    },
    y: {
      type: 'linear',
      display: true,
      title: {
        display: true,
        text: 'Purchases',
        color: theme === 'dark' ? '#ffffff' : '#6b7280',
        font: {
          size: 11,
          weight: 'bold'
        }
      },
      grid: {
        color: theme === 'dark' ? 'rgba(139, 69, 255, 0.15)' : 'rgba(156, 163, 175, 0.2)',
      },
      ticks: {
        color: theme === 'dark' ? '#ffffff' : '#6b7280',
        font: {
          size: 10
        }
      }
    },
  },
});

export const getBarWithLineChartOptions = (theme) => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.8)',
      titleColor: theme === 'dark' ? '#ffffff' : '#000000',
      bodyColor: theme === 'dark' ? '#ffffff' : '#000000',
      borderColor: theme === 'dark' ? 'rgba(139, 69, 255, 0.5)' : '#d1d5db',
      borderWidth: 1,
      callbacks: {
        label: function(context) {
          const datasetLabel = context.dataset.label;
          const value = context.parsed.y;
          if (datasetLabel === 'Daily Clicks') {
            return `Clicks: ${value.toLocaleString()}`;
          } else {
            return `CTR: ${value.toFixed(2)}%`;
          }
        }
      }
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Date',
        color: theme === 'dark' ? '#ffffff' : '#6b7280',
        font: {
          size: 11,
          weight: 'bold'
        }
      },
      grid: {
        color: theme === 'dark' ? 'rgba(139, 69, 255, 0.15)' : 'rgba(156, 163, 175, 0.2)',
      },
      ticks: {
        color: theme === 'dark' ? '#ffffff' : '#6b7280',
        font: {
          size: 10
        }
      }
    },
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'CTR (%)',
        color: 'rgb(239, 68, 68)',
        font: {
          size: 11,
          weight: 'bold'
        }
      },
      grid: {
        color: theme === 'dark' ? 'rgba(139, 69, 255, 0.15)' : 'rgba(156, 163, 175, 0.2)',
      },
      ticks: {
        color: theme === 'dark' ? '#ffffff' : '#6b7280',
        font: {
          size: 10
        },
        callback: function(value) {
          return value.toFixed(1) + '%';
        }
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: {
        display: true,
        text: 'Clicks',
        color: 'rgb(34, 197, 94)',
        font: {
          size: 11,
          weight: 'bold'
        }
      },
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        color: theme === 'dark' ? '#ffffff' : '#6b7280',
        font: {
          size: 10
        },
        callback: function(value) {
          return value >= 1000 ? (value/1000).toFixed(0) + 'k' : value.toString();
        }
      }
    },
  },
});

export const getPieChartOptions = (theme) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.8)',
      titleColor: theme === 'dark' ? '#ffffff' : '#000000',
      bodyColor: theme === 'dark' ? '#ffffff' : '#000000',
      borderColor: theme === 'dark' ? 'rgba(139, 69, 255, 0.5)' : '#d1d5db',
      borderWidth: 1,
    }
  },
});