const dscc = require('@google/dscc');
const viz = require('@google/dscc-scripts/viz/initialViz.js');
import Chart from 'chart.js/auto';
const local = require('./localMessage');

const DSCC_IS_LOCAL = false;

// Флаг для локальной отладки
const LOCAL = false;

// Создаем canvas для отображения графика
const canvasElement = document.createElement('canvas');
const ctx = canvasElement.getContext('2d');
canvasElement.id = 'myViz';
document.body.appendChild(canvasElement);

// Функция для обновления размера канваса
const updateCanvasSize = () => {
  canvasElement.height = dscc.getHeight();
  canvasElement.width = dscc.getWidth();
};

// Функция для подготовки данных
const prepareData = (message) => {
  // Извлекаем компетенции (названия метрик)
  const competencies = message.fields.metricID.map(field => field.name);

  // Массив для данных сотрудников
  const datasets = message.tables.DEFAULT.map(employee => {
    const name = employee.dimID[0];  // Имя сотрудника
    const scores = employee.metricID;  // Оценки сотрудника

    return {
      label: name,  // Название для линии на графике
      data: scores,  // Оценки сотрудника по компетенциям
      backgroundColor: getRandomColor(0.2),  // Прозрачный цвет для заливки области (альфа = 0.2)
      borderColor: getRandomColor(0.5),  // Прозрачный цвет для границы (альфа = 0.5)
      borderWidth: 2,
      pointBackgroundColor: getRandomColor(0.7),  // Прозрачный цвет для точек (альфа = 0.7)
      fill: true,  // Заполнение области
    };
  });

  return { competencies, datasets };
};

// Функция для генерации случайного цвета с прозрачностью
const getRandomColor = (alpha = 1) => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  // Возвращаем цвет в формате RGBA
  return `rgba(${parseInt(color.substr(1, 2), 16)}, ${parseInt(color.substr(3, 2), 16)}, ${parseInt(color.substr(5, 2), 16)}, ${alpha})`;
};

// Функция для отрисовки графика
const drawViz = (data) => {
  const { competencies, datasets } = prepareData(data);

  // Отладка: выводим данные для проверки
  console.log('Competencies: ', competencies);
  console.log('Datasets: ', datasets);

  // Обновляем размеры канваса
  updateCanvasSize();

  // Очищаем canvas перед отрисовкой нового графика
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Удаляем старый график, если он существует
  if (window.chartInstance) {
    window.chartInstance.destroy();
  }

  // Создаем и отрисовываем график
  window.chartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: competencies,  // Компетенции по оси X
      datasets: datasets,    // Данные для каждого сотрудника
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          ticks: {
            beginAtZero: false,  // Начинаем не с нуля, чтобы уместить данные
            min: 0,              // Минимум 0
            max: 5,              // Максимум 5
            stepSize: 0.5,       // Шаг шкалы
          },
          suggestedMin: 0,       // Рекомендуемое минимальное значение
          suggestedMax: 5,       // Рекомендуемое максимальное значение
          angleLines: {
            display: true,        // Включаем угловые линии
          },
          pointLabels: {
            fontSize: 12,         // Размер шрифта на точках
          },
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              const employeeName = tooltipItem.dataset.label;
              const value = tooltipItem.raw;
              if (typeof value === 'number') {
                return `${employeeName}: ${value.toFixed(2)}`;  // Показываем имя и оценку сотрудника
              } else {
                return `${employeeName}: ${value}`;
              }
            }
          }
        }
      }
    }
  });
  
};

// Локальный рендер (если LOCAL = true)
if (LOCAL) {
  // Локальный рендер с искусственными данными
  console.log('Using artificial data for local render');
  drawViz(local.message);  // Используем данные из localMessage.js
} else {
  // Подписка на данные в реальном времени из DSCC (если не в локальной среде)
  dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
  console.log('Subscribed to real-time data');
}
