const dscc = require('@google/dscc');
const viz = require('@google/dscc-scripts/viz/initialViz.js');
import Chart from 'chart.js/auto';

// hex to rgb
function hexToRGB(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha || 1})`;
}

// canvas
const canvasElement = document.createElement('canvas');
const ctx = canvasElement.getContext('2d');
canvasElement.id = 'myViz';
document.body.appendChild(canvasElement);

// update canvas sizes
const updateCanvasSize = () => {
  canvasElement.height = dscc.getHeight();
  canvasElement.width = dscc.getWidth();
};


const fixedColors = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#F0E130',
  '#A133FF', '#33FFF2', '#FF8C33', '#2E8B57', '#FF2F92'
];


// prep data from looker
const prepareData = (message, style) => {
  const competencies = message.fields.metricID.map(field => field.name);

  // fixed color
  const lineColors = [...fixedColors]; //


  while (lineColors.length < message.tables.DEFAULT.length) {
    lineColors.push(...fixedColors);
  }


  const datasets = message.tables.DEFAULT.map((employee, i) => {
    const name = employee.dimID[0];
    const scores = employee.metricID;

    // looker colors
    const colorKey = 'color' + (i + 1);
    let themeColor;

    // if color white use fixed colors
    if (style && style[colorKey] && style[colorKey].value && style[colorKey].value.color) {
      themeColor = style[colorKey].value.color;

      if (themeColor.toLowerCase() === '#ffffff') {
        themeColor = lineColors[i];
      }
    } else {
      // from looker
      themeColor = lineColors[i];
    }

    const fillColor = hexToRGB(themeColor, style.opacity ? style.opacity.value : 0.2);

    return {
      label: name,
      data: scores,
      borderColor: themeColor,
      backgroundColor: fillColor,
      borderWidth: style.width ? style.width.value : 3,
      fill: style.fill ? style.fill.value : true,
      pointBackgroundColor: hexToRGB(themeColor, 0.7),
    };
  });

  return { competencies, datasets };
};


// plot chart
const drawViz = (data) => {
  const { competencies, datasets } = prepareData(data, data.style);


  const styleByConfigId = data.style;

  const lineWidth = styleByConfigId.width ? styleByConfigId.width.value : styleByConfigId.width.defaultValue;
  const fillArea = styleByConfigId.fill ? styleByConfigId.fill.value : true;
  const opacity = styleByConfigId.opacity ? styleByConfigId.opacity.value : styleByConfigId.opacity.defaultValue;


  const yMin = styleByConfigId.ymin ? parseFloat(styleByConfigId.ymin.value) : 0;
  const yMax = styleByConfigId.ymax ? parseFloat(styleByConfigId.ymax.value) : 5;
  const yTicks = styleByConfigId.yticks ? parseInt(styleByConfigId.yticks.value) : 5;
  const yLabels = styleByConfigId.ylabels ? !styleByConfigId.ylabels.value : true;
  const yLines = styleByConfigId.ylines ? !styleByConfigId.ylines.value : true;


  const suggestedMin = styleByConfigId.suggestedMin ? parseFloat(styleByConfigId.suggestedMin.value) : undefined;
  const suggestedMax = styleByConfigId.suggestedMax ? parseFloat(styleByConfigId.suggestedMax.value) : undefined;


  const legendEnabled = styleByConfigId.legend ? !styleByConfigId.legend.value : true;
  const legendPosition = styleByConfigId.legendPosition ? styleByConfigId.legendPosition.value : 'top';


  const fontFamily = styleByConfigId.fontFamily ? styleByConfigId.fontFamily.value : 'Arial';
  const fontSize = styleByConfigId.fontSize ? styleByConfigId.fontSize.value : 12;


  const tooltipsEnabled = styleByConfigId.tooltips ? !styleByConfigId.tooltips.value : true;


  updateCanvasSize();


  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);


  if (window.chartInstance) {
    window.chartInstance.destroy();
  }

  const pointRadius = tooltipsEnabled ? 5 : 0;
  const pointLabelsDisplay = tooltipsEnabled ? true : false;


  window.chartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: competencies,
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          ticks: {
            beginAtZero: false,
            min: yMin,
            max: yMax,
            suggestedMin: yMin,
          suggestedMax: yMax,
            stepSize: yTicks,
            display: yLabels,
          },
          suggestedMin: yMin,
          suggestedMax: yMax,
          angleLines: {
            display: true,
          },
          pointLabels: {
            font: {
              family: fontFamily,
              size: fontSize,
            },
            display: true,
          },
        }
      },
      plugins: {
        tooltip: {
          enabled: tooltipsEnabled,
          callbacks: {
            label: function(tooltipItem) {
              const employeeName = tooltipItem.dataset.label;
              const value = tooltipItem.raw;
              return `${employeeName}: ${value.toFixed(2)}`;
            }
          }
        },
        legend: {
          display: legendEnabled,
          position: legendPosition,
          labels: {
            font: {
              family: fontFamily,
              size: fontSize,
            }
          }
        }
      },
      elements: {
        point: {
          radius: pointRadius
        }
      }
    }
  });
};


const LOCAL = false;
if (LOCAL) {
  drawViz(local.message);
} else {

  dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
}


 

