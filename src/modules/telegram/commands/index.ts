/**
 * Telegram bot commands
 */
export const START_COMMAND = {
  COMMAND: '/start',
  REGEXP: /\/start$/,
  BTN: '',
};
export const NICKNAME_COMMAND_PRIVATE = {
  SESSION: 'nickname',
  COMMAND: '/nickname',
  REGEXP: /\/nickname$/,
  BTN: '🧑‍💻 Оновити nickname Fifa Mobile',
};
export const NICKNAME_COMMAND_PUBLIC = {
  SESSION: 'nickname',
  COMMAND: '/nickname@NezlamniFifaBot',
  REGEXP: /\/nickname@NezlamniFifaBot$/,
  BTN: '🧑‍💻 Оновити nickname Fifa Mobile',
};
export const NATION_COMMAND_PRIVATE = {
  SESSION: 'nation',
  COMMAND: '/nation',
  REGEXP: /\/nation$/,
  BTN: '🇺🇦 Збірна для ЧС',
};
export const NATION_COMMAND_PUBLIC = {
  SESSION: 'nation',
  COMMAND: '/nation@NezlamniFifaBot',
  REGEXP: /\/nation@NezlamniFifaBot$/,
  BTN: '🇺🇦 Збірна для ЧС',
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
export const GOAL_COMMAND_PRIVATE = {
  SESSION: 'goal',
  COMMAND: '/goal',
  REGEXP: /\/goal$/,
  BTN: '⚽️ Відправити гол',
};
export const GOAL_COMMAND_PUBLIC = {
  SESSION: 'goal',
  COMMAND: '/goal@NezlamniFifaBot',
  REGEXP: /\/goal@NezlamniFifaBot$/,
  BTN: '⚽️ Відправити гол',
};
export const INVITE_GROUP_PUBLIC = {
  COMMAND: '/invite_player@NezlamniFifaBot',
  REGEXP: /\/invite_player@NezlamniFifaBot$/,
  BTN: '🤝️ Запросити гравця',
};

export const INVITE_GROUP_PRIVATE = {
  COMMAND: '/invite_player',
  REGEXP: /\/invite_player$/,
  BTN: '🤝️ Запросити гравця',
};

export const GOAL_POLL_COMMAND_PRIVATE = {
  COMMAND: '/goal_poll_moder',
  REGEXP: /\/goal_poll_moder$/,
  BTN: '📊️ Розпочати голосування ⚽ (модер)',
};

export const REMOVE_PLAYER_COMMAND_PRIVATE = {
  SESSION: 'remove_player_moder',
  COMMAND: '/remove_player_moder',
  REGEXP: /\/remove_player_moder$/,
  BTN: '🟥 Видалити гравця (модер)',
};

export const RULES_GROUP_PRIVATE = {
  COMMAND: '/rules',
  REGEXP: /\/rules$/,
  BTN: '👮‍ Правила',
};

export const RULES_GROUP_PUBLIC = {
  COMMAND: '/rules@NezlamniFifaBot',
  REGEXP: /\/rules@NezlamniFifaBot$/,
  BTN: '👮‍ Правила',
};
