const axios = require('axios');
const csvParser = require('csv-parser');
const { Readable } = require('stream');
const fs = require('fs');

async function getCSV() {
  try {
    const response = await axios.get(
      'https://docs.google.com/spreadsheets/d/1aXfcSn63NthC8wxfawc6zYGVlLDuz82WaTe4EHYQpfw/export?format=csv&gid=0',
      { responseType: 'text' }
    );

    // Создаем поток из строки CSV
    const stream = Readable.from(response.data);

    let allData = {};  // Объект для хранения всех строк и групп
    let groupSize = 10;  // Количество столбцов в группе

    stream
      .pipe(csvParser({ headers: false }))  // Отключаем заголовки
      .on('data', (row) => {
        const values = Object.values(row).slice(3);  // Пропускаем первые 3 столбца
        let groups = {};

        // Обрабатываем значения по 10 столбцов и добавляем группы в объект
        for (let i = 0; i < values.length; i += groupSize) {
          const groupData = values.slice(i, i + groupSize);  // Извлекаем группу столбцов
          if (groupData.length > 0) {  // Проверяем, есть ли данные в группе
            groups[`group${Math.floor(i / groupSize) + 1}`] = groupData;  // Добавляем группу в объект
          }
        }

        // Добавляем строку с группами в основной объект
        allData[`row${Object.keys(allData).length + 1}`] = groups;
      })
      .on('end', () => {
        // Выводим и записываем данные для каждой группы в новом формате
        const fileName = 'groupsOutput.txt';  // Файл для записи данных
        const outputData = [];

        console.log('\nВывод данных для каждой группы:');
        for (const row in allData) {
          console.log(`${row}:`);
          outputData.push(`${row}:`);  // Запись строки в массив данных для файла

          for (const group in allData[row]) {
            console.log(`  ${group}: ${allData[row][group].join(', ')}`);
            outputData.push(`  ${group}: ${allData[row][group].join(', ')}`);  // Запись группы в массив данных для файла
          }
          outputData.push('');  // Добавляем пустую строку для разделения
        }

        // Запись данных в файл
        fs.writeFile(fileName, outputData.join('\n'), (err) => {
          if (err) {
            console.error(`Ошибка при записи файла ${fileName}:`, err);
          } else {
            console.log(`Данные успешно записаны в файл ${fileName}`);
          }
        });

        console.log('\nЧтение и вывод завершены.');
      });
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
  }
}

getCSV();
