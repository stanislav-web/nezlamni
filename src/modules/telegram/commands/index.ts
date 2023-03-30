/**
 * Telegram bot commands
 */
export const START_COMMAND = {
  COMMAND: '/start',
  REGEXP: /\/start$/,
  BTN: '',
};
export const NICKNAME_COMMAND_PUBLIC = {
  COMMAND: '/nickname',
  REGEXP: /\/nickname$/,
  BTN: '🧑‍💻 Оновити nickname Fifa Mobile',
};
export const NICKNAME_COMMAND_PRIVATE = {
  COMMAND: '/nickname@NezlamniFifaBot',
  REGEXP: /\/nickname@NezlamniFifaBot$/,
  BTN: '🧑‍💻 Оновити nickname Fifa Mobile',
};
export const PLAYERS_LIST_COMMAND_PRIVATE = {
  COMMAND: '/players',
  REGEXP: /\/players$/,
  BTN: '🤼‍ Наші гравці',
};

export const PLAYERS_LIST_COMMAND_PUBLIC = {
  COMMAND: '/players@NezlamniFifaBot',
  REGEXP: /\/players@NezlamniFifaBot$/,
  BTN: '🤼‍ Наші гравці',
};

export const CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PUBLIC = {
  COMMAND: '/schedule@NezlamniFifaBot',
  REGEXP: /\/schedule@NezlamniFifaBot$/,
  BTN: '📅 Розклад ігор',
};

export const CHANNEL_GAMES_SCHEDULE_LINK_COMMAND_PRIVATE = {
  COMMAND: '/schedule',
  REGEXP: /\/schedule$/,
  BTN: '📅 Розклад ігор',
};
