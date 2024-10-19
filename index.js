const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const moment = require('moment');

// Установите свой токен от бота
const token = '7341331472:AAE020vzgHQ3Go0jqe7wJS_k9KQx7GZUnuU';

const bot = new TelegramBot(token, { polling: true });

// Загружаем JSON с расписанием
const scheduleData = JSON.parse(fs.readFileSync('groupsData.json', 'utf-8'));

// Массив с временем начала пар
const lessonTimes = [
  '08:00 - 09:30',
  '09:40 - 11:10',
  '11:50 - 13:20',
  '13:30 - 15:00',
  '15:40 - 17:10',
  '17:20 - 18:50',
  '19:00 - 20:30'
];

// Обработка команды "/start"
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Привет! Введите номер группы, чтобы получить расписание.');
});

// Обработка ввода номера группы
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const numberGroup = msg.text.trim();
  const groupNumber = `row1: ${numberGroup}`;

  // Проверяем, существует ли группа
  if (scheduleData[groupNumber]) {
    // Загружаем номер недели
    let weekCounter = JSON.parse(fs.readFileSync('weekCounter.json', 'utf-8'));
    const isUpperWeek = weekCounter === 0; // Верхняя неделя, если 0, нижняя — если 1

    const correctDay = moment().locale('ru').format('dddd'); // Текущий день недели на русском
    const currentDay = correctDay[0].toUpperCase() + correctDay.slice(1);

    if (currentDay === 'Воскресенье') {
      bot.sendMessage(chatId, 'Сегодня воскресенье, пар нет.');
    } else {
      const groupSchedule = scheduleData[groupNumber][currentDay];

      if (groupSchedule && groupSchedule.length > 0) {
        let scheduleMessage = `Расписание на ${currentDay} для группы ${numberGroup} (Неделя: ${isUpperWeek ? 'Верхняя' : 'Нижняя'}):\n\n`;
        let hasClasses = false; // Флаг для отслеживания наличия занятий

        groupSchedule.forEach((subject, index) => {
          // Добавляем только нечетные или четные пары в зависимости от недели
          if ((isUpperWeek && (index % 2 === 0)) || (!isUpperWeek && (index % 2 !== 0))) {
            if (subject.replace(/,/g, '').trim() !== '') { // Проверка на пустую строку
              const lessonNumber = Math.floor(index / 2) + 1;
              const timeSlot = lessonTimes[lessonNumber - 1];
              scheduleMessage += `${lessonNumber}. ${timeSlot} - ${subject}\n`;
              hasClasses = true; // Устанавливаем флаг, если есть занятия
            }
          }
        });

        if (hasClasses) {
          bot.sendMessage(chatId, scheduleMessage);
        } else {
          bot.sendMessage(chatId, 'Занятия нету');
        }
      } else {
        bot.sendMessage(chatId, `На сегодня (${currentDay}) пар нет.`);
      }
    }
  } else {
    bot.sendMessage(chatId, 'Группа с таким номером не найдена. Пожалуйста, попробуйте снова.');
  }
});
