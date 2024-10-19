const fs = require('fs');

// Чтение текстового файла
fs.readFile('groupedData.txt', 'utf-8', (err, data) => {
  if (err) {
    console.error('Ошибка при чтении файла:', err);
    return;
  }

  const lines = data.split('\n');
  const groupsData = {};  // Объект для всех групп

  let currentGroupLabel = '';
  let lineCount = 0;

  const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

  // Нежелательные строки для игнорирования
  const unwantedLines = [
    "Дисциплина, Здание, АУД.1, АУД.2, Вид, Вед. каф, Должн., Преподаватель, ,",
    "1241105, 13.03.03, 20, , , , , ААДиД, ,"
  ];

  // Обрабатываем строки файла
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Проверяем, начинается ли строка с "group"
    if (/^group\d+:/.test(line)) {
      currentGroupLabel = lines[i + 1]?.split(',')[0].trim() || 'unknown';  // Получаем номер группы

      // Инициализация группы как объекта с днями недели
      groupsData[currentGroupLabel] = {
        Понедельник: [],
        Вторник: [],
        Среда: [],
        Четверг: [],
        Пятница: [],
        Суббота: []
      };

      // Пропускаем строку сразу после "group"
      i++;
      lineCount = 0; // Сбрасываем счетчик строк
      continue; // Переходим к следующей итерации цикла
    } 
    
    // Проверяем строки, которые начинаются с "row"
    else if (/^row\d+:/.test(line)) {
      // Убираем префикс "rowX: " и лишние пробелы
      const cleanedLine = line.replace(/^row\d+:\s*/, '').trim();

      // Проверяем, является ли строка нежелательной или пустой
      if (unwantedLines.includes(cleanedLine) || cleanedLine === '') {
        continue; // Пропускаем нежелательные строки
      }

      // Увеличиваем счетчик строк
      lineCount++;

      // Записываем первую строку расписания для понедельника
      if (lineCount === 1) {
        groupsData[currentGroupLabel]['Понедельник'].push(cleanedLine);
      } 
      // Записываем строки для других дней
      else {
        const dayIndex = Math.floor((lineCount - 2) / 14) % daysOfWeek.length;
        const currentDay = daysOfWeek[dayIndex];

        // Добавляем записи в соответствующий день
        if (currentDay && cleanedLine) {
          groupsData[currentGroupLabel][currentDay].push(cleanedLine);
        }
      }
    }
  }

  // Записываем итоговый объект в JSON файл
  fs.writeFile('groupsData.json', JSON.stringify(groupsData, null, 2), (err) => {
    if (err) {
      console.error('Ошибка при записи файла:', err);
    } else {
      console.log('Данные успешно записаны в groupsData.json');
    }
  });
});
