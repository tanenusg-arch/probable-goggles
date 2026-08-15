// ============================================================
// SINGLE-FILE TELEGRAM RESELLER BOT – FULLY CORRECTED
// ============================================================

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const TelegramBot = require('node-telegram-bot-api');
const pkg = require('./package.json');
const cfg = pkg.config || {};

// ---------- CONFIG ----------
const config = {
  BOT_TOKEN: cfg.BOT_TOKEN,
  G2BULK_API_KEY: cfg.G2BULK_API_KEY,
  G2BULK_BASE_URL: cfg.G2BULK_BASE_URL || 'https://api.g2bulk.com/v1',
  ADMIN_USERNAME: cfg.ADMIN_USERNAME || '@Dev_LecteR',
  ADMIN_CHAT_ID: cfg.ADMIN_CHAT_ID,
  UPDATES_CHANNEL: cfg.UPDATES_CHANNEL || '@Exynosshop',
  SUPPORT_WEBSITE: cfg.SUPPORT_WEBSITE || '',
  TELEBIRR_PHONE: cfg.TELEBIRR_PHONE || '0927172626',
  CBE_PHONE: cfg.CBE_PHONE || '1000000192914',
  EXPECTED_RECEIVER_NAME: cfg.EXPECTED_RECEIVER_NAME || 'Weldesemayat',
  CBE_RECEIVER_NAME: cfg.CBE_RECEIVER_NAME || 'Ferehiwot',
  MIN_DEPOSIT_BIRR: parseFloat(cfg.MIN_DEPOSIT_BIRR) || 50,
  MIN_WITHDRAW_BIRR: parseFloat(cfg.MIN_WITHDRAW_BIRR) || 100,
  MAX_DEPOSIT_LIMIT: parseFloat(cfg.MAX_DEPOSIT_LIMIT) || 100000,
  MAX_WITHDRAW_LIMIT: parseFloat(cfg.MAX_WITHDRAW_LIMIT) || 50000,
  MAX_DAILY_ORDERS: parseInt(cfg.MAX_DAILY_ORDERS) || 50,
  MAX_TXN_AGE_MINUTES: parseInt(cfg.MAX_TXN_AGE_MINUTES) || 15,
  EXCHANGE_RATE: parseFloat(cfg.EXCHANGE_RATE) || 0,
  MARKUP_PERCENT: parseFloat(cfg.MARKUP_PERCENT) || 0,
  VERIFY_API_BASE_URL: cfg.VERIFY_API_BASE_URL,
  VERIFY_API_KEY: cfg.VERIFY_API_KEY,
  FIRESTORE_PROJECT_ID: cfg.FIRESTORE_PROJECT_ID,
  FIRESTORE_DATABASE_ID: cfg.FIRESTORE_DATABASE_ID || 'ai-studio-remixuntitled-f88a34da-8ff4-4244-ac0c-da9284afc9f5',
  FIRESTORE_API_KEY: cfg.FIRESTORE_API_KEY || 'AIzaSyBLNq9vnIB_K5YJhWnaGiSy6KXOzXto_mk',
  PROOF_CHANNEL_ID: cfg.PROOF_CHANNEL_ID || '',
  REPORT_CHANNEL_ID: cfg.REPORT_CHANNEL_ID || '',
  NOTICE_CHANNEL_ID: cfg.REPORT_CHANNEL_ID || '',
  ADMIN_PASSWORD: cfg.ADMIN_PASSWORD || 'EXYNOS39@#$%&*HSSH671S',
  REFERRAL_REWARD: parseFloat(cfg.REFERRAL_REWARD) || 2.0,
  CACHE_TTL: parseInt(cfg.CACHE_TTL) || 300,
};

// Parse ADMIN_CHAT_ID (JSON array or single integer)
let adminChatIds = [];
try {
  const parsed = JSON.parse(config.ADMIN_CHAT_ID);
  if (Array.isArray(parsed)) adminChatIds = parsed.map(Number);
} catch (e) {
  if (config.ADMIN_CHAT_ID) adminChatIds = [parseInt(config.ADMIN_CHAT_ID)];
}
const ADMIN_CHAT_IDS = adminChatIds.filter(id => !isNaN(id));

// Global mutable settings
let MAINTENANCE_MODE = false;
let WITHDRAWAL_FEE_PERCENT = 0.0;
let TELEGRAM_STARS_MARKUP = 0.0;
let TELEGRAM_PREMIUM_MARKUP = 0.0;
let REPORT_EVENTS = true;

// ---------- EMOJI DEFINITIONS ----------
function emojiTag(id, fallback) {
  return `<tg-emoji emoji-id="${id}">${fallback}</tg-emoji>`;
}

const ID_CHECK = '6255591515544882364';
const ID_CROSS = '5298742255912235479';
const ID_CONFIRM = '5857044938755149915';
const ID_CANCEL = '5298742255912235479';
const ID_BACK = '5391090636961099009';
const ID_DEPOSIT = '5987880246865565644';
const ID_WITHDRAW = '5987880246865565644';
const ID_PROFILE = '5904630315946611415';
const ID_ORDER = '5258024802010026053';
const ID_HELP = '5363925144907554991';
const ID_HOME = '5416041192905265756';
const ID_STAR = '5427166463871956800';
const ID_PREMIUM = '5789440723292000849';
const ID_MORE = '5334544901428229844';
const ID_SUPPORT = '5363925144907554991';
const ID_TELEBIRR = '5801043242434699275';
const ID_CBE = '5801043242434699275';
const ID_GAME = '5920332557466997677';
const ID_WALLET = '5256186332669035163';
const ID_SUCCESS = ID_CHECK;
const ID_FAIL = ID_CROSS;
const ID_INFO = ID_HELP;
const ID_WARNING = ID_CROSS;
const ID_USER = ID_PROFILE;
const ID_CALENDAR = ID_BACK;
const ID_MONEY = ID_DEPOSIT;
const ID_SETTINGS = ID_INFO;
const ID_MEGAPHONE = ID_MORE;
const ID_ADD = ID_MORE;
const ID_LIST = ID_ORDER;
const ID_DELETE = ID_CANCEL;
const ID_TOGGLE = ID_INFO;
const ID_BAN = ID_CROSS;
const ID_UNBAN = ID_CHECK;
const ID_SEARCH = ID_ORDER;
const ID_CLOCK = ID_CALENDAR;
const ID_MAIL = ID_SUPPORT;

const EMOJIS = {
  CHECK: emojiTag(ID_CHECK, '✅'),
  CROSS: emojiTag(ID_CROSS, '❌'),
  CONFIRM: emojiTag(ID_CONFIRM, '✔️'),
  CANCEL: emojiTag(ID_CANCEL, '✖️'),
  BACK: emojiTag(ID_BACK, '🔙'),
  DEPOSIT: emojiTag(ID_DEPOSIT, '💰'),
  WITHDRAW: emojiTag(ID_WITHDRAW, '💸'),
  PROFILE: emojiTag(ID_PROFILE, '👤'),
  ORDER: emojiTag(ID_ORDER, '📦'),
  HELP: emojiTag(ID_HELP, '❓'),
  HOME: emojiTag(ID_HOME, '🏠'),
  STAR: emojiTag(ID_STAR, '⭐'),
  PREMIUM: emojiTag(ID_PREMIUM, '💎'),
  TELEBIRR: emojiTag(ID_TELEBIRR, '📱'),
  CBE: emojiTag(ID_CBE, '🏦'),
  GAME: emojiTag(ID_GAME, '🎮'),
  MORE: emojiTag(ID_MORE, '➕'),
  SUPPORT: emojiTag(ID_SUPPORT, '💬'),
  WALLET: emojiTag(ID_WALLET, '👛'),
  SUCCESS: emojiTag(ID_SUCCESS, '✅'),
  FAIL: emojiTag(ID_FAIL, '❌'),
  INFO: emojiTag(ID_INFO, 'ℹ️'),
  WARNING: emojiTag(ID_WARNING, '⚠️'),
  USER: emojiTag(ID_USER, '👤'),
  CALENDAR: emojiTag(ID_CALENDAR, '📅'),
  MONEY: emojiTag(ID_MONEY, '💵'),
  SETTINGS: emojiTag(ID_SETTINGS, '⚙️'),
  MEGAPHONE: emojiTag(ID_MEGAPHONE, '📢'),
  ADD: emojiTag(ID_ADD, '➕'),
  LIST: emojiTag(ID_LIST, '📋'),
  DELETE: emojiTag(ID_DELETE, '🗑️'),
  TOGGLE: emojiTag(ID_TOGGLE, '🔄'),
  BAN: emojiTag(ID_BAN, '🚫'),
  UNBAN: emojiTag(ID_UNBAN, '✅'),
  SEARCH: emojiTag(ID_SEARCH, '🔍'),
  CLOCK: emojiTag(ID_CLOCK, '⏰'),
  MAIL: emojiTag(ID_MAIL, '📧'),
};

// Image URLs
const IMG_TELEGRAM_TOUCH = 'https://img-mom.bitibiti.workers.dev/img/AgACAgQAAxkBAAInfWpKmlCLcezdMoYScI3HGRVS2z4UAAI2Dmsb02pRUhlwplKxlNwaAQADAgADeAADPAQ';
const IMG_TELEGRAM_STARS = 'https://img-mom.bitibiti.workers.dev/img/AgACAgQAAxkBAAIni2pKnmmMdGn_qNJSf66T162DGKjoAAI5Dmsb02pRUsIq2mJ-ggh0AQADAgADeAADPAQ';
const IMG_TELEGRAM_PREMIUM = 'https://img-mom.bitibiti.workers.dev/img/AgACAgQAAxkBAAIngWpKnZ51Qfpw4JLnGx4kpkMQlRH3AAI4Dmsb02pRUv-KNblZPE0tAQADAgADeAADPAQ';
const IMG_TRANSACTION_ID = 'https://i.ibb.co/qMts3xr8/Tb-SINTAYEHU.jpg';
const IMG_CBE_TRANSACTION_ID = 'https://img-mom.bitibiti.workers.dev/img/AgACAgQAAxkBAAIs3mp2IUPoCLWCk0Kyv3rGBw9iGRuWAAKHDGsbM5axUzJRjYwRt86KAQADAgADeQADPQQ';

// ---------- UTILITY FUNCTIONS ----------
function apiPriceToBirr(apiPrice, markup = 0) {
  return apiPrice * config.EXCHANGE_RATE + markup;
}

function parseAmount(s) {
  s = s.trim().toLowerCase().replace(/,/g, '');
  if (s.endsWith('k')) {
    const num = parseFloat(s.slice(0, -1));
    if (isNaN(num)) return null;
    return num * 1000;
  }
  const num = parseFloat(s);
  return isNaN(num) ? null : num;
}

function parseTelegramName(name) {
  const lower = name.toLowerCase();
  const starsMatch = lower.match(/([\d,.]+)\s*stars?/);
  if (starsMatch) {
    const amount = parseAmount(starsMatch[1]);
    if (amount !== null) return { type: 'stars', amount };
  }
  const premiumMatch = lower.match(/([\d,.]+)\s*(?:months?|month|year|yr)\s*premium/);
  if (premiumMatch) {
    let amount = parseAmount(premiumMatch[1]);
    if (amount !== null) {
      if (lower.includes('year') || lower.includes('yr')) amount *= 12;
      return { type: 'premium', amount };
    }
  }
  return null;
}

function formatTelegramDisplay(name, birrPrice) {
  const parsed = parseTelegramName(name);
  if (parsed) {
    if (parsed.type === 'stars') return `${parsed.amount} stars - ${Math.round(birrPrice)}ETB`;
    else if (parsed.type === 'premium') return `${parsed.amount} Months premium - ${Math.round(birrPrice)}ETB`;
  }
  return `${name} - ${Math.round(birrPrice)}ETB`;
}

function getCleanTelegramName(name) {
  const parsed = parseTelegramName(name);
  if (parsed) {
    if (parsed.type === 'stars') return `${parsed.amount} stars`;
    else if (parsed.type === 'premium') return `${parsed.amount} Months premium`;
  }
  return name;
}

function extractLast4(account) {
  if (!account) return '';
  const digits = account.replace(/\D/g, '');
  if (digits.length >= 4) return digits.slice(-4);
  return digits;
}

function formatDepositId(depId) {
  return `EX${depId + 100}`;
}

function formatWithdrawalId(wthId) {
  if (wthId.startsWith('WTH-')) return wthId;
  if (/^\d+$/.test(wthId)) return `EX${parseInt(wthId) + 200}`;
  return wthId;
}

function parseFormattedId(formatted) {
  const m = formatted.trim().toUpperCase().match(/^EX(\d+)$/);
  if (!m) return null;
  const num = parseInt(m[1]);
  if (num >= 101 && num <= 199) return String(num - 100);
  if (num >= 201 && num <= 299) return String(num - 200);
  return null;
}

function generateWithdrawalId() {
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  const numericPart = String(Date.now() % 10000).padStart(4, '0');
  return `WTH-${randomPart}-${numericPart}`;
}

async function verifyPayment(reference, method = 'telebirr') {
  const url = `${config.VERIFY_API_BASE_URL}/verify`;
  try {
    const response = await axios.post(url, { reference }, {
      headers: { 'Content-Type': 'application/json', 'x-api-key': config.VERIFY_API_KEY },
      timeout: 60000,
    });
    if (response.status !== 200) return null;
    const data = response.data;
    const inner = data.data || {};
    let amount = null;
    let receiverName = '';
    let paymentDate = '';
    let txnRef = reference;
    let receiverAccount = '';

    if (inner) {
      const amountStr = inner.settledAmount || inner.amount || inner.Amount;
      if (amountStr) {
        const match = String(amountStr).match(/[\d,.]+/);
        if (match) amount = parseFloat(match[0].replace(/,/g, ''));
      }
      receiverName = inner.receiverName || inner.receiver || '';
      paymentDate = inner.paymentDate || inner.transactionDate || inner.date || '';
      txnRef = inner.transactionNumber || inner.reference || reference;
      receiverAccount = inner.receiverAccount || inner.creditedPartyAccount || inner.receiver;
    } else {
      const amountStr = data.amount || data.Amount || data.settledAmount;
      if (amountStr) {
        const match = String(amountStr).match(/[\d,.]+/);
        if (match) amount = parseFloat(match[0].replace(/,/g, ''));
      }
      receiverName = data.receiver || data.receiverName || '';
      paymentDate = data.date || data.paymentDate || data.transactionDate || '';
      txnRef = data.reference || data.transactionNumber || reference;
      receiverAccount = data.receiverAccount || data.creditedPartyAccount || data.receiver;
    }

    if (amount === null) return null;
    const expectedAccount = method === 'telebirr' ? config.TELEBIRR_PHONE : config.CBE_PHONE;
    if (expectedAccount && receiverAccount) {
      if (extractLast4(receiverAccount) !== extractLast4(expectedAccount)) return null;
    }
    const expectedName = method === 'telebirr' ? config.EXPECTED_RECEIVER_NAME : config.CBE_RECEIVER_NAME;
    if (expectedName && receiverName) {
      if (receiverName.trim().toUpperCase() !== expectedName.trim().toUpperCase()) return null;
    }
    if (paymentDate) {
      const txnDate = new Date(paymentDate);
      if (!isNaN(txnDate)) {
        const now = new Date();
        const ageMinutes = (now - txnDate) / 60000;
        if (ageMinutes > config.MAX_TXN_AGE_MINUTES) return null;
      }
    }
    return {
      amount,
      receiver_name: receiverName,
      payment_date: paymentDate,
      reference: txnRef,
      receiver_account: receiverAccount,
    };
  } catch (e) {
    return null;
  }
}

// ---------- KEYBOARDS ----------
function getMainInlineKeyboard() {
  return {
    inline_keyboard: [
      [{ text: 'Profile', callback_data: 'menu_profile' }, { text: 'Service', callback_data: 'menu_service' }],
      [{ text: 'Deposit', callback_data: 'menu_deposit' }],
      [{ text: 'My Orders', callback_data: 'menu_orders' }, { text: 'Withdraw', callback_data: 'menu_withdraw' }],
      [{ text: 'Support', callback_data: 'menu_support' }],
    ],
  };
}

function getProfileKeyboard() {
  return {
    inline_keyboard: [
      [{ text: 'My Profile', callback_data: 'profile_show' }, { text: 'Referral', callback_data: 'profile_referral' }],
      [{ text: 'Redeem', callback_data: 'profile_redeem' }],
      [{ text: 'Back to Main', callback_data: 'back_to_main' }],
    ],
  };
}

function getServiceInlineKeyboard() {
  return {
    inline_keyboard: [
      [{ text: 'Telegram Stars', callback_data: 'svc_telegram_stars' }],
      [{ text: 'Telegram Premium', callback_data: 'svc_telegram_premium' }],
      [{ text: 'Back to main menu', callback_data: 'back_to_main' }],
    ],
  };
}

function getConfirmationKeyboard() {
  return {
    inline_keyboard: [
      [{ text: 'Confirm', callback_data: 'order_confirm' }, { text: 'Cancel', callback_data: 'order_cancel' }],
      [{ text: 'Back', callback_data: 'order_back' }],
    ],
  };
}

function getDepositKeyboard() {
  return {
    inline_keyboard: [
      [{ text: 'Telebirr (ETB)', callback_data: 'dep_method:telebirr' }, { text: 'CBE (ETB)', callback_data: 'dep_method:cbe' }],
      [{ text: 'Cancel', callback_data: 'cancel_action' }],
    ],
  };
}

function getWithdrawKeyboard() {
  return {
    inline_keyboard: [
      [{ text: 'Telebirr (ETB)', callback_data: 'withdraw_method:telebirr' }],
      [{ text: 'Cancel', callback_data: 'cancel_action' }],
    ],
  };
}

function getSupportKeyboard() {
  const adminUrl = `https://t.me/${config.ADMIN_USERNAME.replace('@', '')}`;
  const channelUrl = `https://t.me/${config.UPDATES_CHANNEL.replace('@', '')}`;
  const keyboard = [
    [{ text: 'Contact Admin', url: adminUrl }, { text: 'Updates Channel', url: channelUrl }],
  ];
  if (config.SUPPORT_WEBSITE) {
    keyboard.push([{ text: 'Visit Website', url: config.SUPPORT_WEBSITE }]);
  }
  keyboard.push([{ text: 'Back to main menu', callback_data: 'back_to_main' }]);
  return { inline_keyboard: keyboard };
}

function getAdminKeyboard() {
  return {
    inline_keyboard: [
      [{ text: 'Dashboard', callback_data: 'admin_dashboard' }],
      [{ text: 'Pending Deposits', callback_data: 'admin_deposits' }],
      [{ text: 'Pending Withdrawals', callback_data: 'admin_withdrawals' }],
      [{ text: 'Promo Codes', callback_data: 'admin_promo' }],
      [{ text: 'Referral Lookup', callback_data: 'admin_referral' }],
      [{ text: 'Search by ID', callback_data: 'admin_search_by_id' }],
      [{ text: 'Settings & Tools', callback_data: 'admin_settings' }],
      [{ text: 'Broadcast', callback_data: 'admin_broadcast' }],
      [{ text: 'Close', callback_data: 'admin_close' }],
    ],
  };
}

function getAdminPromoKeyboard() {
  return {
    inline_keyboard: [
      [{ text: 'Create Code', callback_data: 'admin_promo_create' }],
      [{ text: 'List Codes', callback_data: 'admin_promo_list' }],
      [{ text: 'Delete Code', callback_data: 'admin_promo_delete' }],
      [{ text: 'Back', callback_data: 'admin_back' }],
    ],
  };
}

function getAdminSettingsKeyboard() {
  return {
    inline_keyboard: [
      [{ text: 'User Management', callback_data: 'admin_user_manage' }],
      [{ text: 'Telegram Stars Markup', callback_data: 'admin_stars_markup' }],
      [{ text: 'Telegram Premium Markup', callback_data: 'admin_premium_markup' }],
      [{ text: 'Set Product Price', callback_data: 'admin_set_product_price' }],
      [{ text: 'Toggle Maintenance', callback_data: 'admin_toggle_maintenance' }],
      [{ text: 'Toggle Reports', callback_data: 'admin_toggle_reports' }],
      [{ text: 'Back', callback_data: 'admin_back' }],
    ],
  };
}

function getUserManageKeyboard() {
  return {
    inline_keyboard: [
      [{ text: 'Ban User', callback_data: 'admin_ban' }],
      [{ text: 'Unban User', callback_data: 'admin_unban' }],
      [{ text: 'Set Balance', callback_data: 'admin_set_balance' }],
      [{ text: 'Back', callback_data: 'admin_settings' }],
    ],
  };
}

function getSearchByIdKeyboard() {
  return {
    inline_keyboard: [
      [{ text: 'Order', callback_data: 'admin_search_id:order' }],
      [{ text: 'Deposit', callback_data: 'admin_search_id:deposit' }],
      [{ text: 'Withdrawal', callback_data: 'admin_search_id:withdrawal' }],
      [{ text: 'Back', callback_data: 'admin_search_by_id' }],
    ],
  };
}

// ---------- FIRESTORE DATABASE (REST) ----------
class FirestoreDatabase {
  constructor() {
    this.projectId = config.FIRESTORE_PROJECT_ID;
    this.databaseId = config.FIRESTORE_DATABASE_ID;
    this.apiKey = config.FIRESTORE_API_KEY;
    this.baseUrl = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/${this.databaseId}/documents`;
  }

  _parseDoc(data) {
    if (!data || !data.fields) return null;
    const parsed = {};
    for (const [key, val] of Object.entries(data.fields)) {
      if (val.stringValue !== undefined) parsed[key] = val.stringValue;
      else if (val.doubleValue !== undefined) parsed[key] = parseFloat(val.doubleValue);
      else if (val.integerValue !== undefined) parsed[key] = parseInt(val.integerValue);
      else if (val.booleanValue !== undefined) parsed[key] = val.booleanValue;
      else if (val.timestampValue !== undefined) parsed[key] = val.timestampValue;
      else if (val.nullValue !== undefined) parsed[key] = null;
    }
    return parsed;
  }

  async _request(method, path, data = null, params = {}) {
    const url = `${this.baseUrl}/${path.replace(/^\//, '')}`;
    const query = new URLSearchParams({ key: this.apiKey });

    // Flatten updateMask.fieldPaths
    if (params.updateMask && params.updateMask.fieldPaths) {
      query.append('updateMask.fieldPaths', params.updateMask.fieldPaths.join(','));
    }
    // Add any other top-level params
    for (const [k, v] of Object.entries(params)) {
      if (k !== 'updateMask') query.append(k, v);
    }

    const fullUrl = `${url}?${query.toString()}`;
    const headers = { 'Content-Type': 'application/json' };
    try {
      const response = await axios({
        method,
        url: fullUrl,
        data,
        headers,
        timeout: 15000,
      });
      if (response.status === 200 || response.status === 201) {
        return response.data;
      } else {
        console.error(`Firestore REST error ${response.status}:`, response.data);
        return null;
      }
    } catch (e) {
      console.error(`Firestore request failed: ${e.message}`);
      return null;
    }
  }

  // ---------- USERS ----------
  async addUser(telegramId, username, firstName) {
    const path = `users/${telegramId}`;
    const payload = {
      fields: {
        telegram_id: { stringValue: String(telegramId) },
        username: { stringValue: username || '' },
        first_name: { stringValue: firstName || '' },
        balance: { doubleValue: 0 },
        referral_balance: { doubleValue: 0 },
        banned: { integerValue: '0' },
        daily_order_count: { integerValue: '0' },
        last_order_date: { stringValue: '' },
        registered_at: { stringValue: new Date().toISOString() }
      }
    };
    const params = { updateMask: { fieldPaths: Object.keys(payload.fields) } };
    await this._request('PATCH', path, payload, params);
  }

  async getUser(telegramId) {
    const path = `users/${telegramId}`;
    const result = await this._request('GET', path);
    if (result) return this._parseDoc(result) || {};
    return {};
  }

  async banUser(telegramId) {
    const path = `users/${telegramId}`;
    const payload = { fields: { banned: { integerValue: '1' } } };
    const params = { updateMask: { fieldPaths: ['banned'] } };
    await this._request('PATCH', path, payload, params);
  }

  async unbanUser(telegramId) {
    const path = `users/${telegramId}`;
    const payload = { fields: { banned: { integerValue: '0' } } };
    const params = { updateMask: { fieldPaths: ['banned'] } };
    await this._request('PATCH', path, payload, params);
  }

  async isBanned(telegramId) {
    const user = await this.getUser(telegramId);
    return user.banned === '1';
  }

  async setBalance(telegramId, amount) {
    const path = `users/${telegramId}`;
    const payload = { fields: { balance: { doubleValue: amount } } };
    const params = { updateMask: { fieldPaths: ['balance'] } };
    await this._request('PATCH', path, payload, params);
  }

  async getAllUsers() {
    const path = 'users';
    const result = await this._request('GET', path);
    if (!result || !result.documents) return [];
    const users = [];
    for (const doc of result.documents) {
      const data = this._parseDoc(doc);
      if (data && data.banned === '0') {
        const docId = doc.name.split('/').pop();
        users.push(parseInt(docId));
      }
    }
    return users;
  }

  async updateBalance(telegramId, amount) {
    const user = await this.getUser(telegramId);
    const current = parseFloat(user.balance || 0);
    const newBal = current + amount;
    await this.setBalance(telegramId, newBal);
  }

  async getReferralBalance(telegramId) {
    const user = await this.getUser(telegramId);
    return parseFloat(user.referral_balance || 0);
  }

  async updateReferralBalance(telegramId, amount) {
    const user = await this.getUser(telegramId);
    const current = parseFloat(user.referral_balance || 0);
    const newBal = current + amount;
    const path = `users/${telegramId}`;
    const payload = { fields: { referral_balance: { doubleValue: newBal } } };
    const params = { updateMask: { fieldPaths: ['referral_balance'] } };
    await this._request('PATCH', path, payload, params);
  }

  async canPlaceOrder(userId) {
    const today = new Date().toISOString().slice(0, 10);
    const user = await this.getUser(userId);
    if (!user) return true;
    const lastDate = user.last_order_date || '';
    if (lastDate !== today) {
      const path = `users/${userId}`;
      const payload = {
        fields: {
          daily_order_count: { integerValue: '0' },
          last_order_date: { stringValue: today }
        }
      };
      const params = { updateMask: { fieldPaths: ['daily_order_count', 'last_order_date'] } };
      await this._request('PATCH', path, payload, params);
      return true;
    }
    return parseInt(user.daily_order_count || 0) < config.MAX_DAILY_ORDERS;
  }

  async incrementOrderCount(userId) {
    const today = new Date().toISOString().slice(0, 10);
    const user = await this.getUser(userId);
    const count = parseInt(user.daily_order_count || 0) + 1;
    const path = `users/${userId}`;
    const payload = {
      fields: {
        daily_order_count: { integerValue: String(count) },
        last_order_date: { stringValue: today }
      }
    };
    const params = { updateMask: { fieldPaths: ['daily_order_count', 'last_order_date'] } };
    await this._request('PATCH', path, payload, params);
  }

  async getUsername(telegramId) {
    const user = await this.getUser(telegramId);
    return user.username || null;
  }

  async getUserProfile(telegramId) {
    const user = await this.getUser(telegramId);
    if (!user || !user.telegram_id) return {};
    const orders = await this.getUserOrders(telegramId, 100);
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.charged_price || 0), 0);
    return {
      telegram_id: parseInt(user.telegram_id),
      username: user.username,
      first_name: user.first_name,
      balance: parseFloat(user.balance || 0),
      referral_balance: parseFloat(user.referral_balance || 0),
      banned: parseInt(user.banned || 0),
      registered_at: user.registered_at,
      total_orders: totalOrders,
      total_spent: totalSpent,
    };
  }

  // ---------- DEPOSITS ----------
  async createDeposit(userId, method, amount, currency, proofFileId) {
    const path = 'deposits';
    const payload = {
      fields: {
        user_id: { stringValue: String(userId) },
        method: { stringValue: method },
        amount: { doubleValue: amount },
        currency: { stringValue: currency },
        proof_file_id: { stringValue: proofFileId || '' },
        status: { stringValue: 'pending' },
        admin_note: { stringValue: '' },
        created_at: { stringValue: new Date().toISOString() },
        resolved_at: { stringValue: '' },
        balance_added: { stringValue: 'false' },
        user_notified: { stringValue: 'false' }
      }
    };
    const result = await this._request('POST', path, payload);
    if (result && result.name) {
      const docId = result.name.split('/').pop();
      return parseInt(docId) || 0;
    }
    return 0;
  }

  async getPendingDeposits() {
    const path = 'deposits';
    const result = await this._request('GET', path);
    if (!result || !result.documents) return [];
    const pending = [];
    for (const doc of result.documents) {
      const data = this._parseDoc(doc);
      if (data && data.status === 'pending') {
        data.id = parseInt(doc.name.split('/').pop());
        pending.push(data);
      }
    }
    return pending;
  }

  async getDepositById(depositId) {
    const path = `deposits/${depositId}`;
    const result = await this._request('GET', path);
    if (result) {
      const data = this._parseDoc(result) || {};
      data.id = depositId;
      return data;
    }
    return {};
  }

  async approveDeposit(depositId, adminNote = '') {
    const deposit = await this.getDepositById(depositId);
    if (!deposit || deposit.status !== 'pending') return false;
    const path = `deposits/${depositId}`;
    const payload = {
      fields: {
        status: { stringValue: 'approved' },
        admin_note: { stringValue: adminNote || deposit.admin_note || '' },
        resolved_at: { stringValue: new Date().toISOString() },
        balance_added: { stringValue: 'true' },
        user_notified: { stringValue: 'true' }
      }
    };
    const params = { updateMask: { fieldPaths: ['status', 'admin_note', 'resolved_at', 'balance_added', 'user_notified'] } };
    await this._request('PATCH', path, payload, params);
    await this.updateBalance(parseInt(deposit.user_id), deposit.amount);
    return true;
  }

  async rejectDeposit(depositId, reason = '') {
    const deposit = await this.getDepositById(depositId);
    if (!deposit || deposit.status !== 'pending') return false;
    const path = `deposits/${depositId}`;
    const payload = {
      fields: {
        status: { stringValue: 'rejected' },
        admin_note: { stringValue: reason || deposit.admin_note || '' },
        resolved_at: { stringValue: new Date().toISOString() },
        user_notified: { stringValue: 'true' }
      }
    };
    const params = { updateMask: { fieldPaths: ['status', 'admin_note', 'resolved_at', 'user_notified'] } };
    await this._request('PATCH', path, payload, params);
    return true;
  }

  // ---------- WITHDRAWALS ----------
  generateWithdrawalId() {
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const numericPart = String(Date.now() % 10000).padStart(4, '0');
    return `WTH-${randomPart}-${numericPart}`;
  }

  async createWithdrawal(userId, method, amount, currency, account, nickname, fee = 0) {
    const withdrawalId = this.generateWithdrawalId();
    const path = `withdrawals/${withdrawalId}`;
    const payload = {
      fields: {
        user_id: { stringValue: String(userId) },
        method: { stringValue: method },
        amount: { integerValue: String(Math.round(amount)) },
        currency: { stringValue: currency },
        account: { stringValue: account },
        nickname: { stringValue: nickname },
        fee: { integerValue: String(Math.round(fee)) },
        status: { stringValue: 'PENDING' },
        admin_note: { stringValue: '' },
        admin_notified: { stringValue: 'false' },
        user_notified: { stringValue: 'false' },
        refunded: { stringValue: 'false' },
        created_at: { stringValue: new Date().toISOString() },
        resolved_at: { stringValue: '' }
      }
    };
    await this._request('PATCH', path, payload);
    await this.updateBalance(userId, -amount);
    return withdrawalId;
  }

  async getPendingWithdrawals() {
    const path = 'withdrawals';
    const result = await this._request('GET', path);
    if (!result || !result.documents) return [];
    const pending = [];
    for (const doc of result.documents) {
      const data = this._parseDoc(doc);
      if (data) {
        data.id = doc.name.split('/').pop();
        if (data.status === 'PENDING') pending.push(data);
      }
    }
    return pending;
  }

  async getUnnotifiedPendingWithdrawals() {
    const all = await this.getPendingWithdrawals();
    return all.filter(w => w.admin_notified === 'false');
  }

  async markWithdrawalNotified(withdrawalId) {
    const path = `withdrawals/${withdrawalId}`;
    const payload = { fields: { admin_notified: { stringValue: 'true' } } };
    const params = { updateMask: { fieldPaths: ['admin_notified'] } };
    await this._request('PATCH', path, payload, params);
  }

  async getWithdrawalById(withdrawalId) {
    const path = `withdrawals/${withdrawalId}`;
    const result = await this._request('GET', path);
    if (result) {
      const data = this._parseDoc(result) || {};
      data.id = withdrawalId;
      return data;
    }
    return {};
  }

  async approveWithdrawal(withdrawalId, adminNote = '', adminId = null) {
    const w = await this.getWithdrawalById(withdrawalId);
    if (!w || w.status !== 'PENDING') return false;
    const path = `withdrawals/${withdrawalId}`;
    const fields = {
      status: { stringValue: 'APPROVED' },
      admin_note: { stringValue: adminNote || w.admin_note || '' },
      resolved_at: { stringValue: new Date().toISOString() },
      user_notified: { stringValue: 'true' }
    };
    if (adminId) fields.admin_id = { stringValue: String(adminId) };
    const payload = { fields };
    const params = { updateMask: { fieldPaths: Object.keys(fields) } };
    await this._request('PATCH', path, payload, params);
    return true;
  }

  async rejectWithdrawal(withdrawalId, reason = '', adminId = null) {
    const w = await this.getWithdrawalById(withdrawalId);
    if (!w || w.status !== 'PENDING') return false;
    const path = `withdrawals/${withdrawalId}`;
    const fields = {
      status: { stringValue: 'REJECTED' },
      admin_note: { stringValue: reason || w.admin_note || '' },
      resolved_at: { stringValue: new Date().toISOString() },
      user_notified: { stringValue: 'true' },
      refunded: { stringValue: 'true' }
    };
    if (adminId) fields.admin_id = { stringValue: String(adminId) };
    const payload = { fields };
    const params = { updateMask: { fieldPaths: Object.keys(fields) } };
    await this._request('PATCH', path, payload, params);
    await this.updateBalance(parseInt(w.user_id), parseFloat(w.amount));
    return true;
  }

  // ---------- ORDERS ----------
  async createOrder(telegramId, orderId, status, game, service, playerId, nickname, packageName, apiPrice, chargedPrice, markup, apiResponse) {
    const path = 'orders';
    const payload = {
      fields: {
        telegram_id: { stringValue: String(telegramId) },
        order_id: { stringValue: orderId },
        status: { stringValue: status },
        game: { stringValue: game },
        service: { stringValue: service },
        player_id: { stringValue: playerId },
        nickname: { stringValue: nickname },
        package_name: { stringValue: packageName },
        api_price: { doubleValue: apiPrice },
        charged_price: { doubleValue: chargedPrice },
        markup_percent: { doubleValue: markup },
        api_response: { stringValue: apiResponse },
        created_at: { stringValue: new Date().toISOString() }
      }
    };
    await this._request('POST', path, payload);
  }

  async getUserOrders(telegramId, limit = 5) {
    const path = 'orders';
    const result = await this._request('GET', path);
    if (!result || !result.documents) return [];
    const orders = [];
    for (const doc of result.documents) {
      const data = this._parseDoc(doc);
      if (data && data.telegram_id === String(telegramId)) {
        orders.push(data);
      }
    }
    orders.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || '') * -1);
    return orders.slice(0, limit);
  }

  async getOrderById(orderId) {
    const path = 'orders';
    const result = await this._request('GET', path);
    if (!result || !result.documents) return null;
    for (const doc of result.documents) {
      const data = this._parseDoc(doc);
      if (data && data.order_id === orderId) return data;
    }
    return null;
  }

  async getOrderByNumericId(numericId) {
    const path = `orders/${numericId}`;
    const result = await this._request('GET', path);
    if (result) return this._parseDoc(result) || null;
    return null;
  }

  // ---------- REFERRALS ----------
  async createReferral(referrerId, referredId) {
    const path = `referrals/${referredId}`;
    const existing = await this._request('GET', path);
    if (existing) return false;
    const payload = {
      fields: {
        referrer_id: { stringValue: String(referrerId) },
        referred_id: { stringValue: String(referredId) },
        status: { stringValue: 'completed' },
        reward_given: { integerValue: '1' },
        reward_amount: { doubleValue: config.REFERRAL_REWARD },
        created_at: { stringValue: new Date().toISOString() },
        rewarded_at: { stringValue: new Date().toISOString() }
      }
    };
    await this._request('PATCH', path, payload);
    await this.updateBalance(referrerId, config.REFERRAL_REWARD);
    await this.updateReferralBalance(referrerId, config.REFERRAL_REWARD);
    return true;
  }

  async getReferralStats(userId) {
    const path = 'referrals';
    const result = await this._request('GET', path);
    if (!result || !result.documents) return [0, 0, 0];
    let total = 0, rewarded = 0, totalReward = 0;
    for (const doc of result.documents) {
      const data = this._parseDoc(doc);
      if (data && data.referrer_id === String(userId)) {
        total++;
        if (data.reward_given === '1') {
          rewarded++;
          totalReward += parseFloat(data.reward_amount || 0);
        }
      }
    }
    return [total, rewarded, totalReward];
  }

  async getReferralList(userId, limit = 20) {
    const path = 'referrals';
    const result = await this._request('GET', path);
    if (!result || !result.documents) return [];
    const refs = [];
    for (const doc of result.documents) {
      const data = this._parseDoc(doc);
      if (data && data.referrer_id === String(userId)) {
        refs.push(data);
      }
    }
    refs.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || '') * -1);
    return refs.slice(0, limit);
  }

  // ---------- PROMO CODES ----------
  async createPromoCode(code, amount, maxUses = 1, expiresDays = 365, userRestrictedId = 0) {
    const upper = code.toUpperCase();
    const path = `promo_codes/${upper}`;
    const existing = await this._request('GET', path);
    if (existing) return false;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresDays);
    const payload = {
      fields: {
        amount: { doubleValue: amount },
        max_uses: { integerValue: String(maxUses) },
        used_count: { integerValue: '0' },
        expires_at: { stringValue: expiresAt.toISOString() },
        user_restricted_id: { integerValue: String(userRestrictedId) }
      }
    };
    await this._request('PATCH', path, payload);
    return true;
  }

  async getPromoCode(code) {
    const upper = code.toUpperCase();
    const path = `promo_codes/${upper}`;
    const result = await this._request('GET', path);
    if (result) {
      const data = this._parseDoc(result) || {};
      data.code = upper;
      return data;
    }
    return null;
  }

  async hasUserUsedCode(code, userId) {
    const path = `promo_code_uses/${code.toUpperCase()}_${userId}`;
    const result = await this._request('GET', path);
    return result !== null;
  }

  async recordPromoCodeUse(code, userId) {
    const path = `promo_code_uses/${code.toUpperCase()}_${userId}`;
    const payload = {
      fields: {
        code: { stringValue: code.toUpperCase() },
        user_id: { stringValue: String(userId) },
        used_at: { stringValue: new Date().toISOString() }
      }
    };
    await this._request('PATCH', path, payload);
  }

  async usePromoCode(code, userId) {
    const promo = await this.getPromoCode(code);
    if (!promo) return [false, 0, 'Invalid code.'];
    if (parseInt(promo.used_count || 0) >= parseInt(promo.max_uses || 0))
      return [false, 0, 'Code already fully used.'];
    if (promo.expires_at && new Date() > new Date(promo.expires_at))
      return [false, 0, 'Code expired.'];
    if (parseInt(promo.user_restricted_id || 0) && parseInt(promo.user_restricted_id) !== userId)
      return [false, 0, 'This code is not for you.'];
    if (await this.hasUserUsedCode(code, userId))
      return [false, 0, 'You have already redeemed this code.'];
    const path = `promo_codes/${code.toUpperCase()}`;
    const newCount = parseInt(promo.used_count || 0) + 1;
    const payload = { fields: { used_count: { integerValue: String(newCount) } } };
    const params = { updateMask: { fieldPaths: ['used_count'] } };
    await this._request('PATCH', path, payload, params);
    await this.recordPromoCodeUse(code, userId);
    return [true, parseFloat(promo.amount), ''];
  }

  async deletePromoCode(code) {
    const path = `promo_codes/${code.toUpperCase()}`;
    await this._request('DELETE', path);
  }

  async listPromoCodes() {
    const path = 'promo_codes';
    const result = await this._request('GET', path);
    if (!result || !result.documents) return [];
    const codes = [];
    for (const doc of result.documents) {
      const data = this._parseDoc(doc);
      if (data) {
        data.code = doc.name.split('/').pop();
        codes.push(data);
      }
    }
    return codes;
  }

  // ---------- SETTINGS ----------
  async loadSettings() {
    const path = 'settings';
    const result = await this._request('GET', path);
    if (!result || !result.documents) return;
    for (const doc of result.documents) {
      const data = this._parseDoc(doc);
      if (!data) continue;
      const key = doc.name.split('/').pop();
      const val = data.value;
      switch (key) {
        case 'maintenance_mode': MAINTENANCE_MODE = (val === '1'); break;
        case 'withdrawal_fee_percent': WITHDRAWAL_FEE_PERCENT = parseFloat(val); break;
        case 'max_deposit_limit': config.MAX_DEPOSIT_LIMIT = parseFloat(val); break;
        case 'max_withdraw_limit': config.MAX_WITHDRAW_LIMIT = parseFloat(val); break;
        case 'max_daily_orders': config.MAX_DAILY_ORDERS = parseInt(val); break;
        case 'report_events': REPORT_EVENTS = (val === '1'); break;
        case 'telegram_stars_markup': TELEGRAM_STARS_MARKUP = parseFloat(val); break;
        case 'telegram_premium_markup': TELEGRAM_PREMIUM_MARKUP = parseFloat(val); break;
      }
    }
  }

  async saveSetting(key, value) {
    const path = `settings/${key}`;
    const payload = { fields: { value: { stringValue: String(value) } } };
    await this._request('PATCH', path, payload);
    await this.loadSettings();
  }

  async getTelegramStarsMarkup() { return TELEGRAM_STARS_MARKUP; }
  async getTelegramPremiumMarkup() { return TELEGRAM_PREMIUM_MARKUP; }

  // ---------- GAME CONFIG ----------
  async getGameMarkup(gameCode) {
    const path = `game_config/${gameCode}`;
    const result = await this._request('GET', path);
    if (result) {
      const data = this._parseDoc(result);
      return parseFloat(data.markup_percent || 0);
    }
    return 0;
  }

  async setGameMarkup(gameCode, markup) {
    const path = `game_config/${gameCode}`;
    const payload = { fields: { markup_percent: { doubleValue: markup } } };
    await this._request('PATCH', path, payload);
  }

  // ---------- PRODUCT PRICE OVERRIDES ----------
  async getProductPriceOverride(productId) {
    const path = `product_prices/${productId}`;
    const result = await this._request('GET', path);
    if (result) {
      const data = this._parseDoc(result);
      return data.price_override !== undefined ? parseFloat(data.price_override) : null;
    }
    return null;
  }

  async setProductPriceOverride(productId, price, type = 'stars') {
    const path = `product_prices/${productId}`;
    if (price === null || price <= 0) {
      await this._request('DELETE', path);
    } else {
      const payload = {
        fields: {
          game_code: { stringValue: 'Telegram' },
          type: { stringValue: type },
          price_override: { doubleValue: price },
          updated_at: { stringValue: new Date().toISOString() }
        }
      };
      await this._request('PATCH', path, payload);
    }
  }

  async getAllProductOverrides() {
    const path = 'product_prices';
    const result = await this._request('GET', path);
    if (!result || !result.documents) return [];
    const overrides = [];
    for (const doc of result.documents) {
      const data = this._parseDoc(doc);
      if (data) overrides.push(data);
    }
    return overrides;
  }

  async updateProductPrice(productId, priceEtb, productType = 'stars') {
    const path = `product_prices/${productId}`;
    const payload = {
      fields: {
        game_code: { stringValue: 'Telegram' },
        type: { stringValue: productType },
        computed_price_etb: { doubleValue: priceEtb },
        updated_at: { stringValue: new Date().toISOString() }
      }
    };
    await this._request('PATCH', path, payload);
  }

  // ---------- USED TRANSACTIONS ----------
  async isTransactionUsed(transactionId) {
    const path = `used_transactions/${transactionId.toUpperCase()}`;
    const result = await this._request('GET', path);
    return result !== null;
  }

  async recordTransactionUse(transactionId, userId, amount) {
    const path = `used_transactions/${transactionId.toUpperCase()}`;
    const payload = {
      fields: {
        user_id: { stringValue: String(userId) },
        amount: { doubleValue: amount },
        created_at: { stringValue: new Date().toISOString() }
      }
    };
    await this._request('PATCH', path, payload);
  }

  // ---------- DASHBOARD STATS ----------
  async getDashboardStats() {
    const users = await this.getAllUsers();
    const totalUsers = users.length;

    const depositsSnap = await this._request('GET', 'deposits');
    let totalDeposits = 0, totalDepositAmount = 0, pendingDeposits = 0;
    if (depositsSnap && depositsSnap.documents) {
      for (const doc of depositsSnap.documents) {
        const data = this._parseDoc(doc);
        if (data) {
          if (data.status === 'approved') {
            totalDeposits++;
            totalDepositAmount += parseFloat(data.amount || 0);
          } else if (data.status === 'pending') {
            pendingDeposits++;
          }
        }
      }
    }

    const withdrawalsSnap = await this._request('GET', 'withdrawals');
    let totalWithdrawals = 0, totalWithdrawalAmount = 0, pendingWithdrawals = 0;
    if (withdrawalsSnap && withdrawalsSnap.documents) {
      for (const doc of withdrawalsSnap.documents) {
        const data = this._parseDoc(doc);
        if (data) {
          if (data.status === 'APPROVED') {
            totalWithdrawals++;
            totalWithdrawalAmount += parseFloat(data.amount || 0);
          } else if (data.status === 'PENDING') {
            pendingWithdrawals++;
          }
        }
      }
    }

    const ordersSnap = await this._request('GET', 'orders');
    let totalOrders = 0, revenueToday = 0;
    const today = new Date().toISOString().slice(0, 10);
    if (ordersSnap && ordersSnap.documents) {
      for (const doc of ordersSnap.documents) {
        const data = this._parseDoc(doc);
        if (data && data.status === 'COMPLETED') {
          totalOrders++;
          if (data.created_at && data.created_at.startsWith(today)) {
            revenueToday += parseFloat(data.charged_price || 0);
          }
        }
      }
    }

    return {
      totalUsers,
      totalDeposits,
      totalDepositAmount,
      pendingDeposits,
      totalWithdrawals,
      totalWithdrawalAmount,
      pendingWithdrawals,
      totalOrders,
      revenueToday,
    };
  }

  // ---------- SEARCH ----------
  async searchDeposits(userId = null, dateFrom = null, dateTo = null) {
    const result = await this._request('GET', 'deposits');
    if (!result || !result.documents) return [];
    let rows = [];
    for (const doc of result.documents) {
      const data = this._parseDoc(doc);
      if (data) {
        if (userId !== null && data.user_id !== String(userId)) continue;
        if (dateFrom && data.created_at < dateFrom) continue;
        if (dateTo && data.created_at > dateTo + ' 23:59:59') continue;
        rows.push(data);
      }
    }
    return rows;
  }

  async searchWithdrawals(userId = null, dateFrom = null, dateTo = null) {
    const result = await this._request('GET', 'withdrawals');
    if (!result || !result.documents) return [];
    let rows = [];
    for (const doc of result.documents) {
      const data = this._parseDoc(doc);
      if (data) {
        if (userId !== null && data.user_id !== String(userId)) continue;
        if (dateFrom && data.created_at < dateFrom) continue;
        if (dateTo && data.created_at > dateTo + ' 23:59:59') continue;
        rows.push(data);
      }
    }
    return rows;
  }

  async exportCsv(table, userId = null, dateFrom = null, dateTo = null) {
    let rows;
    if (table === 'deposits') rows = await this.searchDeposits(userId, dateFrom, dateTo);
    else rows = await this.searchWithdrawals(userId, dateFrom, dateTo);
    return rows;
  }
}

// ---------- G2BULK API CLIENT ----------
class G2BulkAPIClient {
  constructor() {
    this.baseURL = config.G2BULK_BASE_URL;
    this.apiKey = config.G2BULK_API_KEY;
    this.cache = new Map();
    this.cacheTTL = config.CACHE_TTL;
  }

  async _request(method, endpoint, data = null, params = null, retries = 3) {
    const url = `${this.baseURL}/${endpoint.replace(/^\//, '')}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (this.apiKey) headers['X-API-Key'] = this.apiKey;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await axios({
          method,
          url,
          headers,
          data,
          params,
          timeout: 15000,
        });
        return response.data;
      } catch (error) {
        if (error.response && error.response.status === 429) {
          const wait = Math.pow(2, attempt) + 1;
          await new Promise(resolve => setTimeout(resolve, wait * 1000));
          continue;
        }
        if (attempt === retries - 1) {
          return { success: false, message: error.message };
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    return { success: false, message: 'Failed to resolve API connection.' };
  }

  _getCached(key) {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiry) return entry.data;
    this.cache.delete(key);
    return null;
  }

  _setCached(key, data) {
    this.cache.set(key, { data, expiry: Date.now() + this.cacheTTL * 1000 });
  }

  async getGames() {
    const cacheKey = 'api_games_list';
    const cached = this._getCached(cacheKey);
    if (cached) return cached;
    const res = await this._request('GET', 'games', null, null, false);
    if (res && res.success !== false) this._setCached(cacheKey, res);
    return res;
  }

  async checkPlayerId(gameCode, playerId) {
    return this._request('POST', 'games/checkPlayerId', { game: gameCode, user_id: playerId });
  }

  async getGameCatalogue(gameCode) {
    const cacheKey = `api_catalogue_${gameCode}`;
    const cached = this._getCached(cacheKey);
    if (cached) return cached;
    const res = await this._request('GET', `games/${gameCode}/catalogue`, null, null, false);
    if (res && res.success !== false) this._setCached(cacheKey, res);
    return res;
  }

  async placeOrder(gameCode, catalogueName, playerId, idempotencyKey = null) {
    const url = `${this.baseURL}/games/${gameCode}/order`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-API-Key': this.apiKey,
    };
    if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;
    const payload = { catalogue_name: catalogueName, player_id: playerId };
    try {
      const response = await axios.post(url, payload, { headers, timeout: 25000 });
      return response.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// ---------- CATALOG SERVICE ----------
class CatalogService {
  constructor(apiClient, db) {
    this.apiClient = apiClient;
    this.db = db;
    this.telegramCode = null;
  }

  async _getTelegramGameCode() {
    if (this.telegramCode) return this.telegramCode;
    const exactCode = 'Telegram';
    try {
      const res = await this.apiClient.getGameCatalogue(exactCode);
      if (res && res.catalogues) {
        this.telegramCode = exactCode;
        return exactCode;
      }
    } catch (e) {}
    const games = await this.apiClient.getGames();
    if (!games || !games.games) return null;
    for (const game of games.games) {
      const name = (game.name || '').toLowerCase();
      const code = (game.code || '').toLowerCase();
      if (name.includes('telegram') || code.includes('telegram') || name.includes('topup')) {
        this.telegramCode = game.code;
        return game.code;
      }
    }
    return null;
  }

  async getTelegramCatalogue() {
    const gameCode = await this._getTelegramGameCode();
    if (!gameCode) return [];
    const res = await this.apiClient.getGameCatalogue(gameCode);
    if (!res || !res.catalogues) return [];
    const items = res.catalogues;
    const annotated = [];
    const starsMarkup = await this.db.getTelegramStarsMarkup();
    const premiumMarkup = await this.db.getTelegramPremiumMarkup();

    for (const it of items) {
      const name = (it.name || '').toLowerCase();
      let kind = null;
      if (name.includes('star')) kind = 'stars';
      else if (name.includes('premium')) kind = 'premium';
      const newItem = { ...it, _kind: kind, _game_code: gameCode };
      const productId = it.id || it.code || it.name;
      if (productId) {
        const override = await this.db.getProductPriceOverride(productId);
        if (override !== null && override !== undefined) {
          newItem._override_price = override;
          await this.db.updateProductPrice(productId, override, kind || 'stars');
        } else {
          if (kind === 'stars') {
            const parsed = parseTelegramName(it.name || '');
            let computed;
            if (parsed && parsed.type === 'stars') {
              computed = parsed.amount * 3;
            } else {
              const apiPrice = it.unit_price || it.price || it.amount || 0;
              computed = apiPriceToBirr(apiPrice, starsMarkup);
            }
            await this.db.updateProductPrice(productId, computed, 'stars');
            newItem._computed_price = computed;
          } else if (kind === 'premium') {
            const apiPrice = it.unit_price || it.price || it.amount || 0;
            const computed = apiPriceToBirr(apiPrice, premiumMarkup);
            await this.db.updateProductPrice(productId, computed, 'premium');
            newItem._computed_price = computed;
          } else {
            const apiPrice = it.unit_price || it.price || it.amount || 0;
            const computed = apiPriceToBirr(apiPrice, 0);
            await this.db.updateProductPrice(productId, computed, 'other');
            newItem._computed_price = computed;
          }
        }
      }
      annotated.push(newItem);
    }
    return annotated;
  }

  async getTelegramStarsPackages() {
    const all = await this.getTelegramCatalogue();
    return all.filter(it => it._kind === 'stars');
  }

  async getTelegramPremiumPlans() {
    const all = await this.getTelegramCatalogue();
    return all.filter(it => it._kind === 'premium');
  }

  async getTelegramStarsMarkup() { return this.db.getTelegramStarsMarkup(); }
  async getTelegramPremiumMarkup() { return this.db.getTelegramPremiumMarkup(); }
}

// ---------- BOT HANDLERS ----------
// State management
const userStates = new Map();
const userData = new Map();
const pendingDecline = new Map();
const verifyAttempts = new Map();

function setState(chatId, state, data = {}) {
  userStates.set(chatId, state);
  if (!userData.has(chatId)) userData.set(chatId, {});
  Object.assign(userData.get(chatId), data);
}

function getState(chatId) { return userStates.get(chatId); }
function getData(chatId) { return userData.get(chatId) || {}; }
function clearState(chatId) {
  userStates.delete(chatId);
  userData.delete(chatId);
  verifyAttempts.delete(chatId);
}

const STATES = {
  SERVICE_SELECT: 1,
  SELECT_PKG: 2,
  ENTER_UID: 3,
  CONFIRM: 4,
  PAYMENT_METHOD: 5,
  PAYMENT_TXN_ID: 6,
  DEPOSIT_AMOUNT: 7,
  DEPOSIT_TXN_ID: 8,
  WITHDRAW_ACCOUNT: 9,
  WITHDRAW_NICKNAME: 10,
  WITHDRAW_AMOUNT: 11,
  WITHDRAW_CONFIRM: 12,
  PROFILE_REDEEM: 13,
  ADMIN_LOGIN: 14,
  ADMIN_MAIN: 15,
  ADMIN_BROADCAST: 16,
  ADMIN_CREATE_CODE: 17,
  ADMIN_DELETE_CODE: 18,
  ADMIN_MANAGE_DEPOSITS: 19,
  ADMIN_MANAGE_WITHDRAWALS: 20,
  ADMIN_REFERRAL_INPUT: 21,
  ADMIN_SEARCH_BY_ID: 22,
  ADMIN_BAN: 23,
  ADMIN_UNBAN: 24,
  ADMIN_SETBALANCE: 25,
  ADMIN_STARS_MARKUP: 26,
  ADMIN_PREMIUM_MARKUP: 27,
  ADMIN_SET_PRICE_TYPE: 28,
  ADMIN_SET_PRICE_SELECT: 29,
  ADMIN_SET_PRICE_INPUT: 30,
};

// Helpers
async function checkChannelMembership(bot, chatId, userId) {
  const channels = [];
  if (config.PROOF_CHANNEL_ID) channels.push({ name: 'Proof Channel', id: config.PROOF_CHANNEL_ID });
  if (config.NOTICE_CHANNEL_ID && config.NOTICE_CHANNEL_ID !== config.PROOF_CHANNEL_ID)
    channels.push({ name: 'Notice Channel', id: config.NOTICE_CHANNEL_ID });
  if (!channels.length) return true;
  const missing = [];
  for (const ch of channels) {
    try {
      const member = await bot.getChatMember(ch.id, userId);
      if (!['member', 'administrator', 'creator'].includes(member.status)) missing.push(ch);
    } catch (e) { missing.push(ch); }
  }
  if (!missing.length) return true;
  let msg = `${EMOJIS.WARNING} <b>You must join the following channels to use this bot:</b>\n\n`;
  for (const ch of missing) {
    let linkText;
    try {
      const invite = await bot.createChatInviteLink(ch.id, { member_limit: 1 });
      linkText = invite.invite_link;
    } catch (e) {
      const chat = await bot.getChat(ch.id);
      linkText = chat.username ? `https://t.me/${chat.username}` : `Channel ID: ${ch.id}`;
    }
    msg += `• <b>${ch.name}</b>: <a href='${linkText}'>Join here</a>\n`;
  }
  msg += '\nAfter joining, restart the bot or type /start again.';
  await bot.sendMessage(chatId, msg, { parse_mode: 'HTML' });
  return false;
}

async function registerUserImplicit(db, userId, username, firstName) {
  if (await db.isBanned(userId)) return false;
  const existing = await db.getUser(userId);
  await db.addUser(userId, username, firstName);
  return !existing || !existing.telegram_id;
}

async function maintenanceCheck(chatId, userId, bot) {
  if (MAINTENANCE_MODE && !ADMIN_CHAT_IDS.includes(userId)) {
    await bot.sendMessage(chatId, `${EMOJIS.WARNING} Bot is under maintenance. Please try again later.`, { parse_mode: 'HTML' });
    return false;
  }
  return true;
}

async function reportEvent(bot, text, parseMode = 'HTML') {
  if (!REPORT_EVENTS || !config.REPORT_CHANNEL_ID) return;
  try {
    await bot.sendMessage(config.REPORT_CHANNEL_ID, text, { parse_mode: parseMode });
  } catch (e) {}
}

// ---------- placeOrderAfterVerification (fixed) ----------
async function placeOrderAfterVerification(bot, db, apiClient, chatId, userId, paymentMethod, txnId = '', verifiedAmount = 0, userFirstName = 'User') {
  const dataObj = getData(chatId);
  const chargedPrice = dataObj.charged_price || 0;

  if (paymentMethod !== 'wallet' && verifiedAmount > 0 && verifiedAmount > chargedPrice) {
    const surplus = verifiedAmount - chargedPrice;
    await db.updateBalance(userId, surplus);
    await bot.sendMessage(chatId, `${EMOJIS.MONEY} <b>Overpayment detected!</b>\nYou sent <b>${Math.round(verifiedAmount)} ETB</b>, but the order only costs <b>${Math.round(chargedPrice)} ETB</b>.\nThe surplus <b>${Math.round(surplus)} ETB</b> has been added to your wallet balance.`, { parse_mode: 'HTML' });
  }

  if (paymentMethod === 'wallet') {
    await db.updateBalance(userId, -chargedPrice);
    const refBal = await db.getReferralBalance(userId);
    if (refBal > 0) {
      const deduct = Math.min(refBal, chargedPrice);
      await db.updateReferralBalance(userId, -deduct);
    }
  }

  const gameCode = dataObj.telegram_game_code || 'Telegram';
  const packageName = dataObj.package_name;
  const displayName = dataObj.package_display_name || packageName;
  const playerId = dataObj.player_id;
  const nickname = dataObj.nickname;
  const apiPrice = dataObj.api_price;
  const gameName = dataObj.game_name;
  const serviceName = dataObj.service_name;
  const markup = dataObj.markup || 0;

  const idempotencyKey = uuidv4();
  let orderRes;
  try {
    orderRes = await apiClient.placeOrder(gameCode, packageName, playerId, idempotencyKey);
  } catch (e) {
    orderRes = { success: false, message: e.message };
  }

  if (orderRes && orderRes.success) {
    const apiOrder = orderRes.order || {};
    const apiOrderId = String(apiOrder.order_id || orderRes.order_id || uuidv4().slice(0, 8));
    let codesDelivered = '';
    if (orderRes.codes) {
      const codesList = Array.isArray(orderRes.codes) ? orderRes.codes : [orderRes.codes];
      codesDelivered = codesList.map(c => `🔑 <code>${c}</code>`).join('\n');
    } else if (orderRes.pin) {
      codesDelivered = `🔑 <code>${orderRes.pin}</code>`;
    } else if (orderRes.code) {
      codesDelivered = `🔑 <code>${orderRes.code}</code>`;
    }

    await db.createOrder(userId, apiOrderId, 'COMPLETED', gameName, serviceName, playerId, nickname, packageName, apiPrice, chargedPrice, markup, JSON.stringify(orderRes));
    await db.incrementOrderCount(userId);

    let successMsg = `${EMOJIS.SUCCESS} <b>Purchase Successful!</b>\n\n${EMOJIS.ORDER} <b>Order ID:</b> <code>${apiOrderId}</code>\n${EMOJIS.USER} <b>Nickname:</b> <code>${nickname}</code>\n${EMOJIS.USER} <b>Username:</b> <code>${playerId}</code>\n${EMOJIS.GAME} <b>Product:</b> ${gameName}\n${EMOJIS.ORDER} <b>Service:</b> ${serviceName}\n${EMOJIS.MONEY} <b>Package:</b> ${displayName}\n${EMOJIS.MONEY} <b>Charged:</b> ${Math.round(chargedPrice)}ETB\n${EMOJIS.CALENDAR} <b>Date:</b> ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC\n${EMOJIS.SUCCESS} <b>Status:</b> Completed`;
    if (codesDelivered) {
      successMsg += `\n\n🎁 <b>Redeem Code:</b>\n${codesDelivered}\n\n_Redeem this code in your Telegram account to activate._`;
    } else {
      successMsg += `\n\n✨ <b>Delivered directly</b> to <code>${playerId}</code>'s Telegram account.`;
    }
    if (paymentMethod !== 'wallet') {
      successMsg += `\n\n${EMOJIS.WALLET} <b>Paid via:</b> ${paymentMethod.toUpperCase()} (Ref: ${txnId})`;
    }
    await bot.sendMessage(chatId, successMsg, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
    await reportEvent(bot, `${EMOJIS.ORDER} <b>New Purchase</b>\n${EMOJIS.USER} ${userFirstName} (ID: <code>${userId}</code>)\n${EMOJIS.GAME} ${gameName}\n${EMOJIS.MONEY} ${displayName} – ${Math.round(chargedPrice)}ETB\n🆔 Order: <code>${apiOrderId}</code>\n${EMOJIS.WALLET} Payment: ${paymentMethod.toUpperCase()}`);
  } else {
    const errMsg = orderRes.message || 'Gateway failed.';
    if (paymentMethod === 'wallet') {
      await db.updateBalance(userId, chargedPrice);
    }
    await bot.sendMessage(chatId, `${EMOJIS.CROSS} <b>Purchase Failed</b>\n\n⚠️ ${errMsg}`, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
    await reportEvent(bot, `${EMOJIS.CROSS} <b>Order Failed</b>\n${EMOJIS.USER} ${userFirstName} (ID: <code>${userId}</code>)\n${EMOJIS.GAME} ${gameName} / ${displayName}\n🆔 Player: <code>${playerId}</code>\n${EMOJIS.MONEY} Charged: ${Math.round(chargedPrice)} ETB\n⚠️ Error: ${errMsg}`);
  }
  clearState(chatId);
}

// ---------- START BOT ----------
async function startBot() {
  const db = new FirestoreDatabase();
  await db.loadSettings();
  console.log('Settings loaded.');

  const apiClient = new G2BulkAPIClient();
  const catalogService = new CatalogService(apiClient, db);

  const bot = new TelegramBot(config.BOT_TOKEN, { polling: true });

  // ------------------- /start -------------------
  bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username;
    const firstName = msg.from.first_name;

    if (!(await maintenanceCheck(chatId, userId, bot))) return;
    if (!(await checkChannelMembership(bot, chatId, userId))) return;
    if (await db.isBanned(userId)) {
      await bot.sendMessage(chatId, `${EMOJIS.CROSS} You are banned.`, { parse_mode: 'HTML' });
      return;
    }
    await registerUserImplicit(db, userId, username, firstName);

    if (match && match[1] && match[1].startsWith('ref')) {
      const referrerId = parseInt(match[1].slice(3));
      if (referrerId !== userId) {
        const success = await db.createReferral(referrerId, userId);
        if (success) {
          try {
            await bot.sendMessage(referrerId, `${EMOJIS.USER} ${msg.from.first_name} joined using your referral link! You earned ${config.REFERRAL_REWARD} ETB!`, { parse_mode: 'HTML' });
          } catch (e) {}
        }
      }
    }

    const caption = `${EMOJIS.HOME} <b>Welcome, ${firstName}!</b>\n\n🛒 Top‑up Telegram Stars & Premium at the best rates.\n${EMOJIS.MONEY} 10% service fee applied.\n\n👇 Tap a colored button below:`;
    const videoUrl = 'https://i.ibb.co/LTvL226/Tmuelzy.jpg';
    try {
      await bot.sendVideo(chatId, videoUrl, { caption, parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
    } catch (e) {
      await bot.sendPhoto(chatId, 'https://i.ibb.co/9HbZmPRm/x.jpg', { caption, parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
    }
    clearState(chatId);
  });

  // ------------------- CALLBACK QUERY -------------------
  bot.on('callback_query', async (callbackQuery) => {
    const { id, from, message, data } = callbackQuery;
    const chatId = message.chat.id;
    const userId = from.id;
    const msgId = message.message_id;

    await bot.answerCallbackQuery(id);

    if (!(await maintenanceCheck(chatId, userId, bot))) return;
    if (!(await checkChannelMembership(bot, chatId, userId))) return;
    if (await db.isBanned(userId)) {
      await bot.answerCallbackQuery(id, { text: 'You are banned.', show_alert: true });
      return;
    }

    // ---- Main menu ----
    if (data === 'menu_profile') {
      const profile = await db.getUserProfile(userId);
      if (!profile || !profile.telegram_id) {
        await bot.sendMessage(chatId, `${EMOJIS.WARNING} Profile sync delayed.`, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
        return;
      }
      const regDate = profile.registered_at ? new Date(profile.registered_at).toISOString().slice(0, 10) : 'N/A';
      const text = `${EMOJIS.PROFILE} <b>User Profile</b>\n\n${EMOJIS.USER} <b>Name:</b> ${profile.first_name}\n${EMOJIS.USER} <b>Username:</b> @${profile.username || 'N/A'}\n🆔 <b>ID:</b> <code>${profile.telegram_id}</code>\n${EMOJIS.MONEY} <b>Balance:</b> ${Math.round(profile.balance)} ETB\n${EMOJIS.MONEY} <b>Referral Balance:</b> ${Math.round(profile.referral_balance)} ETB\n${EMOJIS.CALENDAR} <b>Registered:</b> ${regDate}\n━━━━━━━━━━━━━━━━━━━━━━\n${EMOJIS.ORDER} <b>Completed Orders:</b> ${profile.total_orders}\n${EMOJIS.MONEY} <b>Total Spent:</b> ${Math.round(profile.total_spent)} ETB`;
      await bot.editMessageText(text, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: getProfileKeyboard() });
      return;
    }

    if (data === 'menu_orders') {
      const orders = await db.getUserOrders(userId, 5);
      let text;
      if (!orders.length) text = `${EMOJIS.ORDER} <b>No orders yet.</b>`;
      else {
        text = `${EMOJIS.ORDER} <b>Last 5 Orders:</b>\n\n`;
        for (const o of orders) {
          text += `${EMOJIS.ORDER} <b>Order ID:</b> <code>${o.order_id}</code>\n${EMOJIS.GAME} <b>Product:</b> ${o.game}\n${EMOJIS.MONEY} <b>Package:</b> ${o.package_name}\n${EMOJIS.MONEY} <b>Charged:</b> ${Math.round(o.charged_price)} ETB\n${EMOJIS.SUCCESS} <b>Status:</b> ${o.status}\n${EMOJIS.CALENDAR} <b>Date:</b> ${o.created_at.slice(0, 10)}\n━━━━━━━━━━━━━━━━━━━━━━\n`;
        }
      }
      await bot.editMessageText(text, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
      return;
    }

    if (data === 'menu_support') {
      clearState(chatId);
      const helpMsg = `${EMOJIS.SUPPORT} <b>Support & Help</b>\n\n<b>🚀 Quick start:</b>\n1. Use the <b>inline buttons</b> in the message below the keyboard to navigate.\n2. Most flows guide you step by step — just follow the prompts.\n\n${EMOJIS.MONEY} <b>Deposit (Telebirr / CBE):</b>\n1. Tap <b>Deposit</b> in the main menu.\n2. Choose <b>Telebirr (ETB)</b> or <b>CBE (ETB)</b>.\n3. Enter the amount (min ${config.MIN_DEPOSIT_BIRR} ETB, max ${config.MAX_DEPOSIT_LIMIT} ETB).\n4. Send the money to the number shown.\n5. After paying, <b>type the Transaction ID</b> (Telebirr) or <b>Transaction Link</b> (CBE).\n6. Once verified, the ETB is added to your balance automatically.\n\n${EMOJIS.MONEY} <b>Withdraw (Telebirr):</b>\n1. Tap <b>Withdraw</b> in the main menu.\n2. Enter your Telebirr phone number and a nickname.\n3. Enter the amount (min ${config.MIN_WITHDRAW_BIRR} ETB, max ${config.MAX_WITHDRAW_LIMIT} ETB).\n4. Confirm — admin will review and send the money.\n\n${EMOJIS.STAR} <b>Telegram Services:</b>\n1. Tap <b>Service</b> in the main menu.\n2. Choose <b>Telegram Stars</b> or <b>Telegram Premium</b>.\n3. Pick a package.\n4. Enter your Telegram <b>@username</b> (must start with @).\n5. Choose payment method: <b>Wallet</b> (deduct from balance), <b>CBE</b>, or <b>Telebirr</b>.\n6. For external payments, you'll see the account details and amount to pay, then provide the transaction reference.\n   If you pay more than the order total, the extra is added to your wallet balance.\n\n${EMOJIS.USER} <b>Referral:</b>\nTap Referral in Profile to get your invite link. Each friend earns you ${config.REFERRAL_REWARD} ETB instantly.\n\nNeed more help? Contact @${config.ADMIN_USERNAME}`;
      await bot.editMessageText(helpMsg, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: getSupportKeyboard() });
      return;
    }

    if (data === 'back_to_main') {
      clearState(chatId);
      await bot.editMessageText(`${EMOJIS.HOME} <b>Main Menu</b>`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
      return;
    }

    // ---- Profile sub-menus ----
    if (data === 'profile_referral') {
      const stats = await db.getReferralStats(userId);
      const refLink = `https://t.me/${bot.getMe().username}?start=ref${userId}`;
      const text = `${EMOJIS.USER} <b>Your Referral Stats</b>\n\n${EMOJIS.USER} <b>Your Link:</b> <code>${refLink}</code>\n${EMOJIS.USER} <b>Total Invites:</b> ${stats[0]}\n${EMOJIS.MONEY} <b>Rewarded:</b> ${stats[1]}\n${EMOJIS.MONEY} <b>Total Earned:</b> ${Math.round(stats[2])} ETB\n${EMOJIS.MONEY} <b>Reward per invite:</b> ${config.REFERRAL_REWARD} ETB (instant, not withdrawable)\n\n<i>Share your link. Each new user who joins gives you an instant reward!</i>`;
      const kb = { inline_keyboard: [[{ text: 'Back to Profile', callback_data: 'menu_profile' }]] };
      await bot.editMessageText(text, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: kb });
      return;
    }

    if (data === 'profile_redeem') {
      setState(chatId, STATES.PROFILE_REDEEM);
      const kb = { inline_keyboard: [[{ text: 'Cancel', callback_data: 'cancel_action' }]] };
      await bot.editMessageText(`${EMOJIS.MONEY} <b>Enter your promo code:</b>`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: kb });
      return;
    }

    // ---- Service flow ----
    if (data === 'menu_service') {
      if (!(await maintenanceCheck(chatId, userId, bot))) return;
      setState(chatId, STATES.SERVICE_SELECT);
      await bot.editMessageText(`${EMOJIS.GAME} <b>Choose a Telegram service:</b>`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: getServiceInlineKeyboard() });
      return;
    }

    if (data.startsWith('svc_telegram_')) {
      const kind = data.split('_')[2];
      setState(chatId, STATES.SELECT_PKG, { game_code: 'Telegram', telegram_kind: kind, game_name: kind === 'stars' ? 'Telegram Stars' : 'Telegram Premium', flow_type: 'telegram' });
      const emoji = kind === 'stars' ? EMOJIS.STAR : EMOJIS.PREMIUM;
      await bot.sendMessage(chatId, `${emoji} <b>${getData(chatId).game_name}</b>`, { parse_mode: 'HTML' });

      const checkingMsg = await bot.sendMessage(chatId, '🔄 Loading packages...');
      let packages, markup;
      try {
        if (kind === 'stars') {
          packages = await catalogService.getTelegramStarsPackages();
          markup = await catalogService.getTelegramStarsMarkup();
        } else {
          packages = await catalogService.getTelegramPremiumPlans();
          markup = await catalogService.getTelegramPremiumMarkup();
        }
      } catch (e) {
        await bot.editMessageText(`${EMOJIS.CROSS} Failed to load plans.`, { chat_id: chatId, message_id: checkingMsg.message_id, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Back', callback_data: 'back_to_service' }]] } });
        return;
      }
      if (!packages.length) {
        await bot.editMessageText(`${EMOJIS.CROSS} No plans found.`, { chat_id: chatId, message_id: checkingMsg.message_id, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Back', callback_data: 'back_to_service' }]] } });
        return;
      }
      const dataObj = getData(chatId);
      dataObj.active_packages = packages;
      dataObj.telegram_markup = markup;
      dataObj.telegram_game_code = packages[0]._game_code || 'Telegram';
      dataObj.package_raw_names = {};
      const buttons = [];
      for (let idx = 0; idx < packages.length; idx++) {
        const pkg = packages[idx];
        const rawName = pkg.name || pkg.title || 'Package';
        const override = pkg._override_price;
        let birrPrice;
        if (kind === 'stars' && override == null) {
          const parsed = parseTelegramName(rawName);
          if (parsed && parsed.type === 'stars') birrPrice = parsed.amount * 3;
          else {
            const apiPrice = pkg.unit_price || pkg.price || pkg.amount || 0;
            birrPrice = apiPriceToBirr(apiPrice, markup);
          }
        } else {
          if (override != null) birrPrice = override;
          else {
            const apiPrice = pkg.unit_price || pkg.price || pkg.amount || 0;
            birrPrice = apiPriceToBirr(apiPrice, markup);
          }
        }
        dataObj.package_raw_names[String(idx)] = rawName;
        const displayText = formatTelegramDisplay(rawName, birrPrice);
        dataObj[`pkg_price_${idx}`] = birrPrice;
        buttons.push({ text: displayText, callback_data: `pkg_idx:${idx}` });
      }
      let grid = [];
      if (kind === 'premium') {
        for (const btn of buttons) grid.push([btn]);
      } else {
        for (let i = 0; i < buttons.length; i += 2) grid.push(buttons.slice(i, i + 2));
      }
      grid.push([{ text: 'Back', callback_data: 'back_to_service' }]);
      await bot.deleteMessage(chatId, checkingMsg.message_id);
      await bot.sendMessage(chatId, `${EMOJIS.ORDER} <b>Select a package:</b>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: grid } });
      return;
    }

    if (data.startsWith('pkg_idx:')) {
      const idx = parseInt(data.split(':')[1]);
      const dataObj = getData(chatId);
      const packages = dataObj.active_packages;
      if (!packages || idx >= packages.length) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Package unavailable.`, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
        return;
      }
      const pkg = packages[idx];
      const rawName = dataObj.package_raw_names[String(idx)] || pkg.name || pkg.title || 'Item';
      const apiPrice = pkg.unit_price || pkg.price || pkg.amount || 0;
      const markup = dataObj.telegram_markup || 0;
      const chargedPrice = dataObj[`pkg_price_${idx}`] || apiPriceToBirr(apiPrice, markup);
      const cleanName = getCleanTelegramName(rawName);

      dataObj.selected_pkg_id = pkg.id || pkg.code;
      dataObj.package_name = rawName;
      dataObj.package_display_name = cleanName;
      dataObj.api_price = parseFloat(apiPrice);
      dataObj.charged_price = chargedPrice;
      dataObj.markup = markup;
      dataObj.service_name = pkg.service || 'Direct Top-Up';

      setState(chatId, STATES.ENTER_UID, dataObj);
      const cancelKb = { inline_keyboard: [[{ text: 'Cancel', callback_data: 'cancel_action' }]] };
      await bot.editMessageText(`${EMOJIS.USER} <b>Enter recipient's Telegram username</b> (with @) for <b>${cleanName}</b>:\n<i>The API will verify it and return their Telegram name.</i>`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: cancelKb });
      return;
    }

    if (data === 'back_to_service') {
      setState(chatId, STATES.SERVICE_SELECT);
      await bot.editMessageText(`${EMOJIS.GAME} <b>Choose a Telegram service:</b>`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: getServiceInlineKeyboard() });
      return;
    }

    // ---- Order confirmation ----
    if (data === 'order_confirm') {
      setState(chatId, STATES.PAYMENT_METHOD);
      const kb = {
        inline_keyboard: [
          [{ text: 'Pay from Wallet', callback_data: 'pay_method:wallet' }],
          [{ text: 'CBE', callback_data: 'pay_method:cbe' }, { text: 'Telebirr', callback_data: 'pay_method:telebirr' }],
          [{ text: 'Cancel', callback_data: 'order_cancel' }]
        ]
      };
      await bot.editMessageText(`${EMOJIS.WALLET} <b>Choose a payment method</b>`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: kb });
      return;
    }

    if (data === 'order_cancel') {
      const dataObj = getData(chatId);
      const pkg = dataObj.package_display_name || dataObj.package_name || '?';
      const price = dataObj.charged_price || 0;
      clearState(chatId);
      await bot.sendMessage(chatId, `${EMOJIS.CROSS} Order cancelled.`, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
      await bot.deleteMessage(chatId, msgId);
      await reportEvent(bot, `${EMOJIS.CROSS} <b>Order Cancelled</b> (user)\n${EMOJIS.USER} ${from.first_name} (ID: <code>${userId}</code>)\n${EMOJIS.ORDER} ${pkg}\n${EMOJIS.MONEY} ${Math.round(price)} ETB`);
      return;
    }

    if (data === 'order_back') {
      const dataObj = getData(chatId);
      const pkg = dataObj.package_display_name || dataObj.package_name || 'package';
      setState(chatId, STATES.ENTER_UID, dataObj);
      const cancelKb = { inline_keyboard: [[{ text: 'Cancel', callback_data: 'cancel_action' }]] };
      await bot.editMessageText(`${EMOJIS.USER} Enter recipient's username for ${pkg}:`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: cancelKb });
      return;
    }

    // ---- Payment method ----
    if (data.startsWith('pay_method:')) {
      const method = data.split(':')[1];
      const dataObj = getData(chatId);
      dataObj.pay_method = method;

      if (method === 'wallet') {
        const profile = await db.getUserProfile(userId);
        const balance = profile.balance || 0;
        const chargedPrice = dataObj.charged_price || 0;
        if (balance < chargedPrice) {
          await bot.sendMessage(chatId, `${EMOJIS.CROSS} <b>Insufficient Balance</b>\nRequired: ${Math.round(chargedPrice)}ETB\nYour Balance: ${Math.round(balance)}ETB`, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
          await bot.deleteMessage(chatId, msgId);
          clearState(chatId);
          return;
        }
        if (!(await db.canPlaceOrder(userId))) {
          await bot.sendMessage(chatId, `${EMOJIS.CROSS} You have reached the daily order limit.`, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
          await bot.deleteMessage(chatId, msgId);
          clearState(chatId);
          return;
        }
        await bot.editMessageText('⏳ Processing order...', { chat_id: chatId, message_id: msgId, parse_mode: 'HTML' });
        await placeOrderAfterVerification(bot, db, apiClient, chatId, userId, 'wallet', '', 0, from.first_name);
        return;
      } else {
        const chargedPrice = dataObj.charged_price || 0;
        let accountName, accountNumber, instructions, example, image;
        if (method === 'cbe') {
          accountName = config.CBE_RECEIVER_NAME;
          accountNumber = config.CBE_PHONE;
          instructions = 'After the payment, reply with the <b>Transaction Link</b> (URL) from your CBE payment.';
          example = 'Example: <code>https://... </code>';
          image = IMG_CBE_TRANSACTION_ID;
        } else {
          accountName = config.EXPECTED_RECEIVER_NAME;
          accountNumber = config.TELEBIRR_PHONE;
          instructions = 'After the payment, reply with the <b>Transaction ID</b>.';
          example = 'Example: <code>DG56K96NIK</code>';
          image = IMG_TRANSACTION_ID;
        }
        const caption = `${EMOJIS.WALLET} <b>Pay ${Math.round(chargedPrice)} ETB via ${method.toUpperCase()}</b>\n\nSend <b>${Math.round(chargedPrice)} ETB</b> to:\nName: <b>${accountName}</b>\nNumber: <code>${accountNumber}</code>\n\n${instructions}\n${example}`;
        const cancelKb = { inline_keyboard: [[{ text: 'Cancel', callback_data: 'order_cancel' }]] };
        await bot.deleteMessage(chatId, msgId);
        await bot.sendPhoto(chatId, image, { caption, parse_mode: 'HTML', reply_markup: cancelKb });
        setState(chatId, STATES.PAYMENT_TXN_ID, dataObj);
        return;
      }
    }

    // ---- Deposit flow ----
    if (data === 'menu_deposit') {
      if (!(await maintenanceCheck(chatId, userId, bot))) return;
      if (!(await checkChannelMembership(bot, chatId, userId))) return;
      await registerUserImplicit(db, userId, from.username, from.first_name);
      setState(chatId, STATES.DEPOSIT_AMOUNT);
      await bot.editMessageText(`${EMOJIS.DEPOSIT} <b>Choose a deposit method</b>\n\nSelect how you'd like to add funds to your balance.`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: getDepositKeyboard() });
      return;
    }

    if (data.startsWith('dep_method:')) {
      const method = data.split(':')[1];
      const dataObj = getData(chatId);
      dataObj.dep_method = method;
      const text = method === 'cbe'
        ? `${EMOJIS.CBE} <b>Deposit via CBE</b>\n\nPlease enter the amount (in ETB) you wish to deposit.\nMinimum: <b>${config.MIN_DEPOSIT_BIRR} ETB</b>\nMaximum: <b>${config.MAX_DEPOSIT_LIMIT} ETB</b>`
        : `${EMOJIS.DEPOSIT} <b>Deposit via Telebirr</b>\n\nPlease enter the amount (in ETB) you wish to deposit.\nMinimum: <b>${config.MIN_DEPOSIT_BIRR} ETB</b>\nMaximum: <b>${config.MAX_DEPOSIT_LIMIT} ETB</b>`;
      const cancelKb = { inline_keyboard: [[{ text: 'Cancel', callback_data: 'cancel_action' }]] };
      setState(chatId, STATES.DEPOSIT_AMOUNT, dataObj);
      await bot.editMessageText(text, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: cancelKb });
      return;
    }

    // ---- Withdraw flow ----
    if (data === 'menu_withdraw') {
      if (!(await maintenanceCheck(chatId, userId, bot))) return;
      if (!(await checkChannelMembership(bot, chatId, userId))) return;
      await registerUserImplicit(db, userId, from.username, from.first_name);
      const profile = await db.getUserProfile(userId);
      const available = (profile.balance || 0) - (profile.referral_balance || 0);
      if (available < config.MIN_WITHDRAW_BIRR) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Minimum withdrawal is ${config.MIN_WITHDRAW_BIRR} ETB.\nYour withdrawable balance (non-referral) is ${Math.round(available)} ETB.`, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
        await bot.deleteMessage(chatId, msgId);
        clearState(chatId);
        return;
      }
      const cancelKb = { inline_keyboard: [[{ text: 'Cancel', callback_data: 'cancel_action' }]] };
      setState(chatId, STATES.WITHDRAW_ACCOUNT);
      await bot.editMessageText(`${EMOJIS.TELEBIRR} <b>Enter your Telebirr account number / phone:</b>\n(e.g., 0967197797)`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: cancelKb });
      return;
    }

    // ---- Withdraw confirm/cancel ----
    if (data === 'withdraw_confirm') {
      const dataObj = getData(chatId);
      const amount = dataObj.withdraw_amount;
      const fee = dataObj.withdraw_fee || 0;
      const account = dataObj.withdraw_account;
      const nickname = dataObj.withdraw_nickname || 'N/A';
      const profile = await db.getUserProfile(userId);
      const available = (profile.balance || 0) - (profile.referral_balance || 0);
      if ((amount + fee) > available) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Balance changed.`, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
        await bot.deleteMessage(chatId, msgId);
        clearState(chatId);
        return;
      }
      const wId = await db.createWithdrawal(userId, 'telebirr', amount, 'ETB', account, nickname, fee);
      const caption = `${EMOJIS.WITHDRAW} <b>New Withdrawal Request</b>\n${EMOJIS.USER} User: ${from.first_name}\n${EMOJIS.TELEBIRR} Account: ${account}\n${EMOJIS.USER} Nickname: ${nickname}\n${EMOJIS.MONEY} Amount: ${Math.round(amount)} ETB\n${EMOJIS.MONEY} Fee: ${Math.round(fee)} ETB\n🆔 Withdrawal ID: <code>${formatWithdrawalId(wId)}</code>`;
      const adminKb = {
        inline_keyboard: [
          [{ text: 'Approve', callback_data: `admin_approve_wth:${wId}` }, { text: 'Decline', callback_data: `admin_decline_wth:${wId}` }]
        ]
      };
      for (const adminId of ADMIN_CHAT_IDS) {
        try { await bot.sendMessage(adminId, caption, { parse_mode: 'HTML', reply_markup: adminKb }); } catch (e) {}
      }
      await bot.sendMessage(chatId, `${EMOJIS.SUCCESS} Withdrawal request submitted!\nAmount: ${Math.round(amount)} ETB to ${account}`, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
      await bot.deleteMessage(chatId, msgId);
      await reportEvent(bot, `${EMOJIS.WITHDRAW} <b>New Withdrawal Request</b>\n${EMOJIS.USER} ${from.first_name} (ID: <code>${userId}</code>)\n${EMOJIS.MONEY} Amount: ${Math.round(amount)} ETB\n${EMOJIS.TELEBIRR} Account: ${account}\n🆔 Withdrawal ID: <code>${formatWithdrawalId(wId)}</code>`);
      clearState(chatId);
      return;
    }

    if (data === 'withdraw_cancel') {
      clearState(chatId);
      await bot.sendMessage(chatId, `${EMOJIS.CROSS} Withdrawal cancelled.`, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
      await bot.deleteMessage(chatId, msgId);
      return;
    }

    // ---- Cancel action ----
    if (data === 'cancel_action') {
      clearState(chatId);
      await bot.sendMessage(chatId, `${EMOJIS.CROSS} Action cancelled.`, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
      await bot.deleteMessage(chatId, msgId);
      return;
    }

    // ---- ADMIN CALLBACKS ----
    if (data.startsWith('admin_')) {
      if (!ADMIN_CHAT_IDS.includes(userId)) {
        await bot.answerCallbackQuery(id, { text: 'Unauthorized.', show_alert: true });
        return;
      }

      // Approve deposit
      if (data.startsWith('admin_approve_dep:')) {
        const depositId = parseInt(data.split(':')[1]);
        const success = await db.approveDeposit(depositId);
        if (success) {
          const dep = await db.getDepositById(depositId);
          await bot.sendMessage(parseInt(dep.user_id), `${EMOJIS.SUCCESS} Deposit of ${Math.round(dep.amount)} ETB approved!`, { parse_mode: 'HTML' });
          await bot.editMessageText(`${EMOJIS.SUCCESS} Deposit ${formatDepositId(depositId)} approved.`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML' });
          await reportEvent(bot, `${EMOJIS.SUCCESS} <b>Deposit Approved</b>\n${EMOJIS.USER} User ID: <code>${dep.user_id}</code>\n${EMOJIS.MONEY} Amount: ${Math.round(dep.amount)} ${dep.currency || 'ETB'}\n${EMOJIS.TELEBIRR} Method: ${dep.method || '?'}\n🆔 Deposit: <code>${formatDepositId(depositId)}</code>\n${EMOJIS.USER} By admin: ${from.first_name}`);
        } else {
          await bot.answerCallbackQuery(id, { text: 'Deposit not found or already processed.', show_alert: true });
        }
        return;
      }

      // Decline deposit
      if (data.startsWith('admin_decline_dep:')) {
        const depositId = parseInt(data.split(':')[1]);
        pendingDecline.set(`dep_${depositId}`, true);
        await bot.sendMessage(chatId, `${EMOJIS.INFO} Reply with the reason for declining deposit ${formatDepositId(depositId)}:`, { parse_mode: 'HTML' });
        await bot.editMessageReplyMarkup({ chat_id: chatId, message_id: msgId, reply_markup: null });
        await reportEvent(bot, `${EMOJIS.CROSS} <b>Deposit Declined</b> (pending reason)\n🆔 Deposit: <code>${formatDepositId(depositId)}</code>\n${EMOJIS.USER} By admin: ${from.first_name}`);
        return;
      }

      // Approve withdrawal
      if (data.startsWith('admin_approve_wth:')) {
        const wId = data.split(':')[1];
        const success = await db.approveWithdrawal(wId, '', userId);
        if (success) {
          const w = await db.getWithdrawalById(wId);
          await bot.sendMessage(parseInt(w.user_id), `${EMOJIS.SUCCESS} Withdrawal of ${Math.round(w.amount)} ETB to ${w.account} approved!`, { parse_mode: 'HTML' });
          await bot.editMessageText(`${EMOJIS.SUCCESS} Withdrawal ${formatWithdrawalId(wId)} approved.`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML' });
          await reportEvent(bot, `${EMOJIS.SUCCESS} <b>Withdrawal Approved</b>\n${EMOJIS.USER} User ID: <code>${w.user_id}</code>\n${EMOJIS.MONEY} Amount: ${Math.round(w.amount)} ETB\n${EMOJIS.TELEBIRR} Account: ${w.account}\n🆔 Withdrawal: <code>${formatWithdrawalId(wId)}</code>\n${EMOJIS.USER} By admin: ${from.first_name} (ID: <code>${userId}</code>)`);
        } else {
          await bot.answerCallbackQuery(id, { text: 'Withdrawal not found or already processed.', show_alert: true });
        }
        return;
      }

      // Decline withdrawal
      if (data.startsWith('admin_decline_wth:')) {
        const wId = data.split(':')[1];
        pendingDecline.set(`wth_${wId}`, true);
        await bot.sendMessage(chatId, `${EMOJIS.INFO} Reply with the reason for declining withdrawal ${formatWithdrawalId(wId)}:`, { parse_mode: 'HTML' });
        await bot.editMessageReplyMarkup({ chat_id: chatId, message_id: msgId, reply_markup: null });
        await reportEvent(bot, `${EMOJIS.CROSS} <b>Withdrawal Declined</b> (pending reason)\n🆔 Withdrawal: <code>${formatWithdrawalId(wId)}</code>\n${EMOJIS.USER} By admin: ${from.first_name} (ID: <code>${userId}</code>)`);
        return;
      }

      // Dashboard
      if (data === 'admin_dashboard') {
        const stats = await db.getDashboardStats();
        const text = `${EMOJIS.INFO} <b>Dashboard</b>\n\n${EMOJIS.USER} Total Users: ${stats.totalUsers}\n${EMOJIS.MONEY} Total Deposits: ${stats.totalDeposits} (Amount: ${Math.round(stats.totalDepositAmount)} ETB)\n${EMOJIS.CLOCK} Pending Deposits: ${stats.pendingDeposits}\n${EMOJIS.MONEY} Total Withdrawals: ${stats.totalWithdrawals} (Amount: ${Math.round(stats.totalWithdrawalAmount)} ETB)\n${EMOJIS.CLOCK} Pending Withdrawals: ${stats.pendingWithdrawals}\n${EMOJIS.ORDER} Total Orders: ${stats.totalOrders}\n${EMOJIS.MONEY} Today's Revenue: ${Math.round(stats.revenueToday)} ETB\n${EMOJIS.INFO} Maintenance: ${MAINTENANCE_MODE ? 'ON' : 'OFF'}`;
        await bot.editMessageText(text, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: getAdminKeyboard() });
        return;
      }

      // Pending deposits
      if (data === 'admin_deposits') {
        const pending = await db.getPendingDeposits();
        if (!pending.length) {
          await bot.editMessageText(`${EMOJIS.INFO} No pending deposits.`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: getAdminKeyboard() });
          return;
        }
        let text = `${EMOJIS.MONEY} <b>Pending Deposits</b>\n\n`;
        for (const dep of pending) {
          text += `🆔 <code>${formatDepositId(dep.id)}</code> | User: ${dep.user_id}\nAmount: ${Math.round(dep.amount)} ETB | Method: ${dep.method}\nDate: ${dep.created_at.slice(0, 10)}\n\n`;
        }
        const keyboard = {
          inline_keyboard: pending.map(dep => [
            { text: `Approve ${formatDepositId(dep.id)}`, callback_data: `admin_approve_dep:${dep.id}` },
            { text: `Decline ${formatDepositId(dep.id)}`, callback_data: `admin_decline_dep:${dep.id}` }
          ]).concat([[{ text: 'Back', callback_data: 'admin_back' }]])
        };
        await bot.editMessageText(text, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: keyboard });
        return;
      }

      // Pending withdrawals
      if (data === 'admin_withdrawals') {
        const pending = await db.getPendingWithdrawals();
        if (!pending.length) {
          await bot.editMessageText(`${EMOJIS.INFO} No pending withdrawals.`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: getAdminKeyboard() });
          return;
        }
        let text = `${EMOJIS.MONEY} <b>Pending Withdrawals</b>\n\n`;
        for (const w of pending) {
          text += `🆔 <code>${formatWithdrawalId(w.id)}</code> | User: ${w.user_id}\nAmount: ${Math.round(w.amount)} ETB | Account: ${w.account}\nNickname: ${w.nickname} | Fee: ${Math.round(w.fee || 0)} ETB\nDate: ${w.created_at.slice(0, 10)}\n\n`;
        }
        const keyboard = {
          inline_keyboard: pending.map(w => [
            { text: `Approve ${formatWithdrawalId(w.id)}`, callback_data: `admin_approve_wth:${w.id}` },
            { text: `Decline ${formatWithdrawalId(w.id)}`, callback_data: `admin_decline_wth:${w.id}` }
          ]).concat([[{ text: 'Back', callback_data: 'admin_back' }]])
        };
        await bot.editMessageText(text, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: keyboard });
        return;
      }

      // Promo management
      if (data === 'admin_promo') {
        await bot.editMessageText(`${EMOJIS.MONEY} <b>Promo Codes Management</b>`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: getAdminPromoKeyboard() });
        return;
      }
      if (data === 'admin_promo_create') {
        await bot.editMessageText(`${EMOJIS.ADD} <b>Create Promo Code</b>\n\nFormat: <code>/gencode amount [max_uses] [code]</code>`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Back', callback_data: 'admin_back' }]] } });
        setState(chatId, STATES.ADMIN_CREATE_CODE);
        return;
      }
      if (data === 'admin_promo_list') {
        const codes = await db.listPromoCodes();
        let text;
        if (!codes.length) text = `${EMOJIS.INFO} No active promo codes.`;
        else {
          text = `${EMOJIS.MONEY} <b>Active Promo Codes</b>\n\n`;
          for (const c of codes) {
            text += `<code>${c.code}</code>: ${Math.round(c.amount)} ETB | ${c.used_count}/${c.max_uses} used\n`;
          }
        }
        await bot.editMessageText(text, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Back', callback_data: 'admin_back' }]] } });
        return;
      }
      if (data === 'admin_promo_delete') {
        await bot.editMessageText(`${EMOJIS.DELETE} <b>Delete Promo Code</b>\n\nReply with the code (or use /delcode):`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Back', callback_data: 'admin_back' }]] } });
        setState(chatId, STATES.ADMIN_DELETE_CODE);
        return;
      }

      // Broadcast
      if (data === 'admin_broadcast') {
        await bot.editMessageText(`${EMOJIS.MEGAPHONE} <b>Broadcast Message</b>\n\nReply with the message you want to send to all users:`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Back', callback_data: 'admin_back' }]] } });
        setState(chatId, STATES.ADMIN_BROADCAST);
        return;
      }

      // Referral lookup
      if (data === 'admin_referral') {
        await bot.editMessageText(`${EMOJIS.USER} <b>Referral Lookup</b>\n\nEnter the user's Telegram ID:`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Back', callback_data: 'admin_back' }]] } });
        setState(chatId, STATES.ADMIN_REFERRAL_INPUT);
        return;
      }

      // Search by ID
      if (data === 'admin_search_by_id') {
        await bot.editMessageText(`${EMOJIS.SEARCH} <b>Search by ID</b>\n\nSelect the type:`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: getSearchByIdKeyboard() });
        setState(chatId, STATES.ADMIN_SEARCH_BY_ID);
        return;
      }
      if (data.startsWith('admin_search_id:')) {
        const type = data.split(':')[1];
        const dataObj = getData(chatId);
        dataObj.admin_search_type = type;
        setState(chatId, STATES.ADMIN_SEARCH_BY_ID, dataObj);
        await bot.editMessageText(`${EMOJIS.SEARCH} <b>Search ${type.charAt(0).toUpperCase() + type.slice(1)}</b>\n\nEnter the ID (any format):`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Back', callback_data: 'admin_search_by_id' }]] } });
        return;
      }

      // Settings
      if (data === 'admin_settings') {
        await bot.editMessageText(`${EMOJIS.SETTINGS} <b>Settings & Tools</b>`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: getAdminSettingsKeyboard() });
        return;
      }
      if (data === 'admin_user_manage') {
        await bot.editMessageText(`${EMOJIS.USER} <b>User Management</b>`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: getUserManageKeyboard() });
        return;
      }
      if (data === 'admin_ban') {
        await bot.editMessageText(`${EMOJIS.BAN} <b>Ban User</b>\n\nEnter the user's Telegram ID:`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Back', callback_data: 'admin_user_manage' }]] } });
        setState(chatId, STATES.ADMIN_BAN);
        return;
      }
      if (data === 'admin_unban') {
        await bot.editMessageText(`${EMOJIS.UNBAN} <b>Unban User</b>\n\nEnter the user's Telegram ID:`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Back', callback_data: 'admin_user_manage' }]] } });
        setState(chatId, STATES.ADMIN_UNBAN);
        return;
      }
      if (data === 'admin_set_balance') {
        await bot.editMessageText(`${EMOJIS.MONEY} <b>Set Balance</b>\n\nEnter: <code>user_id amount</code>`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Back', callback_data: 'admin_user_manage' }]] } });
        setState(chatId, STATES.ADMIN_SETBALANCE);
        return;
      }
      if (data === 'admin_set_product_price') {
        const kb = {
          inline_keyboard: [
            [{ text: 'Telegram Stars', callback_data: 'admin_price_type:stars' }],
            [{ text: 'Telegram Premium', callback_data: 'admin_price_type:premium' }],
            [{ text: 'Back', callback_data: 'admin_back' }]
          ]
        };
        await bot.editMessageText('Select product type to set price:', { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: kb });
        setState(chatId, STATES.ADMIN_SET_PRICE_TYPE);
        return;
      }
      if (data.startsWith('admin_price_type:')) {
        const ptype = data.split(':')[1];
        const dataObj = getData(chatId);
        dataObj.admin_price_type = ptype;
        let packages;
        if (ptype === 'stars') packages = await catalogService.getTelegramStarsPackages();
        else packages = await catalogService.getTelegramPremiumPlans();
        if (!packages.length) {
          await bot.editMessageText('No packages found.', { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Back', callback_data: 'admin_back' }]] } });
          return;
        }
        const buttons = packages.map(pkg => {
          const name = pkg.name || pkg.title || 'Package';
          const price = pkg._override_price || apiPriceToBirr(pkg.unit_price || pkg.price || pkg.amount || 0, ptype === 'stars' ? TELEGRAM_STARS_MARKUP : TELEGRAM_PREMIUM_MARKUP);
          const productId = pkg.id || pkg.code || pkg.name;
          return { text: `${name} - ${Math.round(price)} ETB`, callback_data: `admin_price_select:${productId}` };
        });
        buttons.push({ text: 'Back', callback_data: 'admin_back' });
        const grid = buttons.map(btn => [btn]);
        await bot.editMessageText('Select package to set price:', { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: grid } });
        setState(chatId, STATES.ADMIN_SET_PRICE_SELECT, dataObj);
        return;
      }
      if (data.startsWith('admin_price_select:')) {
        const productId = data.split(':')[1];
        const dataObj = getData(chatId);
        dataObj.admin_price_product_id = productId;
        await bot.editMessageText('Enter new price in ETB for this product (or 0 to remove override):', { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Cancel', callback_data: 'admin_back' }]] } });
        setState(chatId, STATES.ADMIN_SET_PRICE_INPUT, dataObj);
        return;
      }
      if (data === 'admin_toggle_maintenance') {
        const newVal = !MAINTENANCE_MODE;
        MAINTENANCE_MODE = newVal;
        await db.saveSetting('maintenance_mode', newVal ? '1' : '0');
        await bot.sendMessage(chatId, `${EMOJIS.TOGGLE} Maintenance mode has been ${newVal ? 'ENABLED' : 'DISABLED'}.`, { parse_mode: 'HTML', reply_markup: getAdminSettingsKeyboard() });
        await bot.deleteMessage(chatId, msgId);
        return;
      }
      if (data === 'admin_toggle_reports') {
        const newVal = !REPORT_EVENTS;
        REPORT_EVENTS = newVal;
        await db.saveSetting('report_events', newVal ? '1' : '0');
        await bot.sendMessage(chatId, `${EMOJIS.TOGGLE} Reports have been ${newVal ? 'ENABLED' : 'DISABLED'}.`, { parse_mode: 'HTML', reply_markup: getAdminSettingsKeyboard() });
        await bot.deleteMessage(chatId, msgId);
        return;
      }
      if (data === 'admin_stars_markup') {
        await bot.editMessageText(`${EMOJIS.STAR} <b>Set Telegram Stars Markup</b>\n\nCurrent: <b>${Math.round(TELEGRAM_STARS_MARKUP)} ETB</b>\nEnter the fixed markup amount in ETB (e.g., 10) that will be added to the base price.`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Back', callback_data: 'admin_settings' }]] } });
        setState(chatId, STATES.ADMIN_STARS_MARKUP);
        return;
      }
      if (data === 'admin_premium_markup') {
        await bot.editMessageText(`${EMOJIS.PREMIUM} <b>Set Telegram Premium Markup</b>\n\nCurrent: <b>${Math.round(TELEGRAM_PREMIUM_MARKUP)} ETB</b>\nEnter the fixed markup amount in ETB (e.g., 10) that will be added to the base price.`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Back', callback_data: 'admin_settings' }]] } });
        setState(chatId, STATES.ADMIN_PREMIUM_MARKUP);
        return;
      }
      if (data === 'admin_back') {
        await bot.editMessageText(`${EMOJIS.INFO} <b>Admin Panel</b>`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: getAdminKeyboard() });
        setState(chatId, STATES.ADMIN_MAIN);
        return;
      }
      if (data === 'admin_close') {
        await bot.deleteMessage(chatId, msgId);
        clearState(chatId);
        return;
      }
    }
  });

  // ------------------- MESSAGE HANDLER -------------------
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;
    if (text && text.startsWith('/')) return;

    const state = getState(chatId);
    if (!state) return;

    if (!(await maintenanceCheck(chatId, userId, bot))) { clearState(chatId); return; }
    if (await db.isBanned(userId)) {
      await bot.sendMessage(chatId, `${EMOJIS.CROSS} You are banned.`, { parse_mode: 'HTML' });
      clearState(chatId);
      return;
    }

    // ---- ENTER UID ----
    if (state === STATES.ENTER_UID) {
      const dataObj = getData(chatId);
      let input = text.trim();
      if (!input.startsWith('@') && input.length < 4) {
        await bot.sendMessage(chatId, `${EMOJIS.WARNING} Invalid username. Must start with @.`, { parse_mode: 'HTML' });
        return;
      }
      dataObj.player_id = input;
      dataObj.nickname = input;
      const checkingMsg = await bot.sendMessage(chatId, '🔍 Resolving Telegram username...', { parse_mode: 'HTML' });
      let resolvedName = null;
      const gameCode = dataObj.telegram_game_code || 'Telegram';
      try {
        const tgCheck = await apiClient.checkPlayerId(gameCode, input);
        if (tgCheck && (tgCheck.valid === true || tgCheck.success === true)) {
          resolvedName = tgCheck.name || tgCheck.nickname || tgCheck.first_name || (tgCheck.user && tgCheck.user.name) || input.replace(/^@/, '');
        } else {
          await bot.editMessageText(`${EMOJIS.CROSS} ${tgCheck.message || 'Invalid username.'}\n\nPlease enter a valid username.`, { chat_id: chatId, message_id: checkingMsg.message_id, parse_mode: 'HTML' });
          return;
        }
      } catch (e) {
        resolvedName = input.replace(/^@/, '');
      }
      if (resolvedName) dataObj.nickname = resolvedName;
      await bot.deleteMessage(chatId, checkingMsg.message_id);
      const summary = `━━━━━━━━━━━━━━━━━━━━━━\n${EMOJIS.ORDER} <b>Order Summary</b>\n\n${EMOJIS.GAME} <b>Product:</b> ${dataObj.game_name}\n${EMOJIS.ORDER} <b>Service:</b> ${dataObj.service_name}\n${EMOJIS.USER} <b>Name:</b> ${resolvedName || 'Unknown'}\n${EMOJIS.USER} <b>Username:</b> ${input}\n${EMOJIS.MONEY} <b>Package:</b> ${dataObj.package_display_name || dataObj.package_name}\n${EMOJIS.MONEY} <b>Price:</b> ${Math.round(dataObj.charged_price)}ETB\n━━━━━━━━━━━━━━━━━━━━━━`;
      setState(chatId, STATES.CONFIRM, dataObj);
      await bot.sendMessage(chatId, summary, { parse_mode: 'HTML', reply_markup: getConfirmationKeyboard() });
      return;
    }

    // ---- PAYMENT TXN ID ----
    if (state === STATES.PAYMENT_TXN_ID) {
      const dataObj = getData(chatId);
      const method = dataObj.pay_method;
      const reference = text.trim();
      if (!reference) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Please enter a valid reference.`, { parse_mode: 'HTML' });
        return;
      }
      if (await db.isTransactionUsed(reference)) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} This reference has already been used.`, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
        clearState(chatId);
        return;
      }
      const verifyingMsg = await bot.sendMessage(chatId, '⏳ Verifying your payment...');
      const result = await verifyPayment(reference, method);
      if (result) {
        const verifiedAmount = result.amount;
        const chargedPrice = dataObj.charged_price || 0;
        if (verifiedAmount < chargedPrice) {
          await bot.editMessageText(`${EMOJIS.CROSS} Payment amount (${Math.round(verifiedAmount)} ETB) is less than the order total (${Math.round(chargedPrice)} ETB).`, { chat_id: chatId, message_id: verifyingMsg.message_id, parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
          clearState(chatId);
          return;
        }
        await db.recordTransactionUse(reference, userId, verifiedAmount);
        await bot.deleteMessage(chatId, verifyingMsg.message_id);
        await placeOrderAfterVerification(bot, db, apiClient, chatId, userId, method, reference, verifiedAmount, msg.from.first_name);
        return;
      } else {
        await bot.deleteMessage(chatId, verifyingMsg.message_id);
        const attempts = (verifyAttempts.get(userId) || 0) + 1;
        verifyAttempts.set(userId, attempts);
        if (attempts >= 3) {
          verifyAttempts.delete(userId);
          await bot.sendMessage(chatId, `${EMOJIS.CROSS} Verification failed after 3 attempts. Please try again later or contact support.`, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
          clearState(chatId);
          return;
        } else {
          await bot.sendMessage(chatId, `${EMOJIS.CROSS} Not found. ${3 - attempts} tries left.\nRe‑enter the reference.`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Cancel', callback_data: 'order_cancel' }]] } });
          setState(chatId, STATES.PAYMENT_TXN_ID, dataObj);
          return;
        }
      }
    }

    // ---- DEPOSIT AMOUNT ----
    if (state === STATES.DEPOSIT_AMOUNT) {
      const dataObj = getData(chatId);
      let amount;
      try { amount = parseFloat(text.trim()); } catch (e) { amount = NaN; }
      if (isNaN(amount) || amount < config.MIN_DEPOSIT_BIRR || amount > config.MAX_DEPOSIT_LIMIT) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Invalid amount. Min ${config.MIN_DEPOSIT_BIRR}, Max ${config.MAX_DEPOSIT_LIMIT}.`, { parse_mode: 'HTML' });
        return;
      }
      dataObj.intended_amount = amount;
      const method = dataObj.dep_method || 'telebirr';
      let caption, image;
      if (method === 'cbe') {
        caption = `${EMOJIS.CBE} <b>Send ${Math.round(amount)} ETB to:</b>\nAccount: <b>CBE</b>\nNumber: <code>${config.CBE_PHONE}</code>\nName: <b>${config.CBE_RECEIVER_NAME}</b>\n\nAfter the payment, reply with the <b>Transaction Link</b> (URL) from your CBE payment.\nExample: <code>https://... </code>`;
        image = IMG_CBE_TRANSACTION_ID;
      } else {
        caption = `${EMOJIS.TELEBIRR} <b>Send ${Math.round(amount)} ETB to:</b>\nName: <b>${config.EXPECTED_RECEIVER_NAME}</b>\nNumber: <code>${config.TELEBIRR_PHONE}</code>\n\nAfter the payment, reply with the <b>Transaction ID</b>.\nExample: <code>DG56K96NIK</code>`;
        image = IMG_TRANSACTION_ID;
      }
      const cancelKb = { inline_keyboard: [[{ text: 'Cancel', callback_data: 'cancel_action' }]] };
      setState(chatId, STATES.DEPOSIT_TXN_ID, dataObj);
      await bot.sendPhoto(chatId, image, { caption, parse_mode: 'HTML', reply_markup: cancelKb });
      return;
    }

    // ---- DEPOSIT TXN ID ----
    if (state === STATES.DEPOSIT_TXN_ID) {
      const dataObj = getData(chatId);
      const method = dataObj.dep_method || 'telebirr';
      const reference = text.trim();
      if (!reference) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Please enter a valid reference.`, { parse_mode: 'HTML' });
        return;
      }
      if (await db.isTransactionUsed(reference)) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} This reference has already been used.`, { parse_mode: 'HTML' });
        clearState(chatId);
        return;
      }
      const verifyingMsg = await bot.sendMessage(chatId, '⏳ Verifying your payment...');
      const result = await verifyPayment(reference, method);
      if (result) {
        const amount = result.amount;
        const intended = dataObj.intended_amount || amount;
        if (amount < config.MIN_DEPOSIT_BIRR) {
          await bot.editMessageText(`${EMOJIS.CROSS} Amount too low.`, { chat_id: chatId, message_id: verifyingMsg.message_id, parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
          clearState(chatId);
          return;
        }
        const depositId = await db.createDeposit(userId, method, amount, 'ETB', '');
        await db.approveDeposit(depositId, `Auto-approved Ref: ${reference}`);
        await db.recordTransactionUse(reference, userId, amount);
        verifyAttempts.delete(userId);
        await bot.editMessageText(`${EMOJIS.SUCCESS} Payment verified! <b>${Math.round(amount)} ETB</b> added.`, { chat_id: chatId, message_id: verifyingMsg.message_id, parse_mode: 'HTML' });
        if (amount > intended) {
          await bot.sendMessage(chatId, `${EMOJIS.WARNING} You deposited more than you specified (<b>${Math.round(intended)} ETB</b>). The extra <b>${Math.round(amount - intended)} ETB</b> has also been added to your balance. If this was a mistake, please withdraw or contact admin.`, { parse_mode: 'HTML' });
        }
        await bot.sendMessage(chatId, '📸 You may send a screenshot for records.', { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
        for (const adminId of ADMIN_CHAT_IDS) {
          try {
            await bot.sendMessage(adminId, `${EMOJIS.MONEY} <b>Auto‑Approved Deposit</b>\n${EMOJIS.USER} User: ${msg.from.first_name} (ID: <code>${userId}</code>)\n${EMOJIS.MONEY} Amount: <b>${Math.round(amount)} ETB</b>\n🔢 Ref: <code>${reference}</code>\n${EMOJIS.CALENDAR} ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`, { parse_mode: 'HTML' });
          } catch (e) {}
        }
        await reportEvent(bot, `${EMOJIS.MONEY} <b>Deposit (Auto)</b>\n${EMOJIS.USER} ${msg.from.first_name} (ID: <code>${userId}</code>)\n${EMOJIS.MONEY} Amount: ${Math.round(amount)} ETB\n🔢 Ref: <code>${reference}</code>`);
        clearState(chatId);
        return;
      } else {
        await bot.deleteMessage(chatId, verifyingMsg.message_id);
        const attempts = (verifyAttempts.get(userId) || 0) + 1;
        verifyAttempts.set(userId, attempts);
        if (attempts >= 3) {
          verifyAttempts.delete(userId);
          await bot.sendMessage(chatId, `${EMOJIS.CROSS} Could not verify automatically after 3 tries. Please double‑check the reference and try again later, or contact support.`, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
          clearState(chatId);
          return;
        } else {
          await bot.sendMessage(chatId, `${EMOJIS.CROSS} Not found. ${3 - attempts} tries left.\nRe‑enter the reference.`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Cancel', callback_data: 'cancel_action' }]] } });
          setState(chatId, STATES.DEPOSIT_TXN_ID, dataObj);
          return;
        }
      }
    }

    // ---- WITHDRAW ACCOUNT ----
    if (state === STATES.WITHDRAW_ACCOUNT) {
      const account = text.trim();
      if (!account) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Please enter a valid account.`, { parse_mode: 'HTML' });
        return;
      }
      const dataObj = getData(chatId);
      dataObj.withdraw_account = account;
      setState(chatId, STATES.WITHDRAW_NICKNAME, dataObj);
      const cancelKb = { inline_keyboard: [[{ text: 'Cancel', callback_data: 'cancel_action' }]] };
      await bot.sendMessage(chatId, `${EMOJIS.USER} <b>Enter your nickname (shown to admin):</b>`, { parse_mode: 'HTML', reply_markup: cancelKb });
      return;
    }

    // ---- WITHDRAW NICKNAME ----
    if (state === STATES.WITHDRAW_NICKNAME) {
      const nickname = text.trim();
      if (!nickname) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Please enter your nickname.`, { parse_mode: 'HTML' });
        return;
      }
      const dataObj = getData(chatId);
      dataObj.withdraw_nickname = nickname;
      const profile = await db.getUserProfile(userId);
      const available = (profile.balance || 0) - (profile.referral_balance || 0);
      setState(chatId, STATES.WITHDRAW_AMOUNT, dataObj);
      const cancelKb = { inline_keyboard: [[{ text: 'Cancel', callback_data: 'cancel_action' }]] };
      await bot.sendMessage(chatId, `${EMOJIS.WITHDRAW} <b>Withdraw via Telebirr</b>\nWithdrawable balance: ${Math.round(available)} ETB\nMinimum: ${config.MIN_WITHDRAW_BIRR} ETB\nFee: ${WITHDRAWAL_FEE_PERCENT * 100:.1f}%\nEnter the amount to withdraw:`, { parse_mode: 'HTML', reply_markup: cancelKb });
      return;
    }

    // ---- WITHDRAW AMOUNT ----
    if (state === STATES.WITHDRAW_AMOUNT) {
      let amount;
      try { amount = parseFloat(text.trim()); } catch (e) { amount = NaN; }
      if (isNaN(amount) || amount < config.MIN_WITHDRAW_BIRR || amount > config.MAX_WITHDRAW_LIMIT) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Invalid amount. Min ${config.MIN_WITHDRAW_BIRR}, Max ${config.MAX_WITHDRAW_LIMIT}.`, { parse_mode: 'HTML' });
        return;
      }
      const dataObj = getData(chatId);
      const profile = await db.getUserProfile(userId);
      const available = (profile.balance || 0) - (profile.referral_balance || 0);
      const fee = amount * WITHDRAWAL_FEE_PERCENT;
      const totalNeeded = amount + fee;
      if (totalNeeded > available) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Insufficient withdrawable balance (need ${Math.round(totalNeeded)} with fee).`, { parse_mode: 'HTML' });
        return;
      }
      dataObj.withdraw_amount = amount;
      dataObj.withdraw_fee = fee;
      dataObj.withdraw_method = 'telebirr';
      setState(chatId, STATES.WITHDRAW_CONFIRM, dataObj);
      await bot.sendMessage(chatId, `<b>Confirm withdrawal of ${Math.round(amount)} ETB (fee ${Math.round(fee)} ETB) to ${dataObj.withdraw_account}</b>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Confirm', callback_data: 'withdraw_confirm' }, { text: 'Cancel', callback_data: 'withdraw_cancel' }]] } });
      return;
    }

    // ---- PROFILE REDEEM ----
    if (state === STATES.PROFILE_REDEEM) {
      const code = text.trim().toUpperCase();
      const [success, amount, msgText] = await db.usePromoCode(code, userId);
      if (!success) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} ${msgText}`, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
        clearState(chatId);
        return;
      }
      await db.updateBalance(userId, amount);
      await bot.sendMessage(chatId, `${EMOJIS.SUCCESS} Promo code accepted! <b>${Math.round(amount)} ETB</b> added to your balance.`, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
      await reportEvent(bot, `${EMOJIS.MONEY} <b>Promo Code Redeemed</b>\n${EMOJIS.USER} ${msg.from.first_name} (ID: <code>${userId}</code>)\n${EMOJIS.INFO} Code: <code>${code}</code>\n${EMOJIS.MONEY} Amount added: ${Math.round(amount)} ETB`);
      clearState(chatId);
      return;
    }

    // ---- ADMIN DECLINE REASON (reply) ----
    if (msg.reply_to_message && ADMIN_CHAT_IDS.includes(userId)) {
      if (pendingDecline.size) {
        const key = pendingDecline.keys().next().value;
        const reason = text || 'No reason given';
        if (key.startsWith('dep_')) {
          const depositId = parseInt(key.replace('dep_', ''));
          const success = await db.rejectDeposit(depositId, reason);
          if (success) {
            const dep = await db.getDepositById(depositId);
            await bot.sendMessage(parseInt(dep.user_id), `${EMOJIS.CROSS} Deposit rejected: ${reason}`, { parse_mode: 'HTML' });
            await bot.sendMessage(chatId, `${EMOJIS.CROSS} Deposit rejected.`, { parse_mode: 'HTML' });
          } else {
            await bot.sendMessage(chatId, 'Failed.');
          }
        } else if (key.startsWith('wth_')) {
          const wId = key.replace('wth_', '');
          const success = await db.rejectWithdrawal(wId, reason, userId);
          if (success) {
            const w = await db.getWithdrawalById(wId);
            await bot.sendMessage(parseInt(w.user_id), `${EMOJIS.CROSS} Withdrawal of ${Math.round(w.amount)} ETB rejected: ${reason}`, { parse_mode: 'HTML' });
            await bot.sendMessage(chatId, `${EMOJIS.CROSS} Withdrawal rejected.`, { parse_mode: 'HTML' });
          } else {
            await bot.sendMessage(chatId, 'Failed.');
          }
        }
        pendingDecline.delete(key);
      }
    }

    // ---- ADMIN STATE HANDLERS ----
    if (state === STATES.ADMIN_LOGIN) {
      if (text === config.ADMIN_PASSWORD) {
        setState(chatId, STATES.ADMIN_MAIN);
        await bot.sendMessage(chatId, `${EMOJIS.SUCCESS} Access granted.`, { parse_mode: 'HTML', reply_markup: getAdminKeyboard() });
      } else {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Incorrect password. Try again or /cancel.`, { parse_mode: 'HTML' });
      }
      return;
    }

    if (state === STATES.ADMIN_BROADCAST) {
      if (text.toLowerCase() === 'cancel' || text.toLowerCase() === 'back') {
        clearState(chatId);
        await bot.sendMessage(chatId, `${EMOJIS.CANCEL} Cancelled.`, { parse_mode: 'HTML', reply_markup: getAdminKeyboard() });
        return;
      }
      const users = await db.getAllUsers();
      let success = 0;
      for (const uid of users) {
        try {
          await bot.sendMessage(uid, text);
          success++;
        } catch (e) {}
      }
      await bot.sendMessage(chatId, `${EMOJIS.SUCCESS} Broadcast sent to ${success}/${users.length} users.`, { parse_mode: 'HTML', reply_markup: getAdminKeyboard() });
      await reportEvent(bot, `${EMOJIS.MEGAPHONE} <b>Broadcast Sent</b>\n${EMOJIS.MAIL} Delivered: ${success}/${users.length}\n${EMOJIS.USER} By admin: ${msg.from.first_name} (ID: <code>${userId}</code>)\n\n<b>Message:</b>\n${text.slice(0, 600)}`);
      clearState(chatId);
      return;
    }

    if (state === STATES.ADMIN_CREATE_CODE) {
      const args = text.trim().split(' ');
      if (args.length < 1) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Invalid format.`, { parse_mode: 'HTML', reply_markup: getAdminKeyboard() });
        clearState(chatId);
        return;
      }
      const amount = parseFloat(args[0]);
      if (isNaN(amount)) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Invalid amount.`, { parse_mode: 'HTML' });
        return;
      }
      const maxUses = args.length > 1 ? parseInt(args[1]) : 1;
      const code = args.length > 2 ? args[2].toUpperCase() : uuidv4().slice(0, 8).toUpperCase();
      const success = await db.createPromoCode(code, amount, maxUses);
      if (success) {
        await bot.sendMessage(chatId, `${EMOJIS.SUCCESS} Code <b>${code}</b> created for ${Math.round(amount)} ETB, uses: ${maxUses}`, { parse_mode: 'HTML', reply_markup: getAdminKeyboard() });
        await reportEvent(bot, `${EMOJIS.MONEY} <b>Promo Code Created</b>\n${EMOJIS.INFO} Code: <code>${code}</code>\n${EMOJIS.MONEY} Amount: ${Math.round(amount)} ETB\n${EMOJIS.INFO} Max uses: ${maxUses}\n${EMOJIS.USER} By admin: ${msg.from.first_name}`);
      } else {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Code already exists.`, { parse_mode: 'HTML', reply_markup: getAdminKeyboard() });
      }
      clearState(chatId);
      return;
    }

    if (state === STATES.ADMIN_DELETE_CODE) {
      const code = text.trim().toUpperCase();
      await db.deletePromoCode(code);
      await bot.sendMessage(chatId, `${EMOJIS.SUCCESS} Code <b>${code}</b> deleted.`, { parse_mode: 'HTML', reply_markup: getAdminKeyboard() });
      await reportEvent(bot, `${EMOJIS.MONEY} <b>Promo Code Deleted</b>\n${EMOJIS.INFO} Code: <code>${code}</code>\n${EMOJIS.USER} By admin: ${msg.from.first_name}`);
      clearState(chatId);
      return;
    }

    if (state === STATES.ADMIN_REFERRAL_INPUT) {
      if (text.toLowerCase() === 'cancel' || text.toLowerCase() === 'back') {
        clearState(chatId);
        await bot.sendMessage(chatId, `${EMOJIS.CANCEL} Cancelled.`, { parse_mode: 'HTML', reply_markup: getAdminKeyboard() });
        return;
      }
      const targetId = parseInt(text);
      if (isNaN(targetId)) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Invalid ID.`, { parse_mode: 'HTML' });
        return;
      }
      const stats = await db.getReferralStats(targetId);
      const referrals = await db.getReferralList(targetId);
      let msgText = `${EMOJIS.INFO} <b>Referral Stats for ID <code>${targetId}</code></b>\n\n${EMOJIS.USER} Total invited: <b>${stats[0]}</b>\n${EMOJIS.MONEY} Rewarded: <b>${stats[1]}</b>\n${EMOJIS.MONEY} Total earned: <b>${Math.round(stats[2])} ETB</b>\n\n`;
      if (referrals.length) {
        msgText += '<b>Recent invites:</b>\n';
        for (const r of referrals) {
          const icon = r.reward_given ? EMOJIS.SUCCESS : EMOJIS.CLOCK;
          msgText += `  ${icon} <code>${r.referred_id}</code> (${r.status}) – ${r.created_at.slice(0, 10)}\n`;
        }
      } else {
        msgText += '<i>No invites yet.</i>';
      }
      await bot.sendMessage(chatId, msgText, { parse_mode: 'HTML' });
      clearState(chatId);
      return;
    }

    if (state === STATES.ADMIN_SEARCH_BY_ID) {
      const dataObj = getData(chatId);
      const searchType = dataObj.admin_search_type;
      if (!searchType) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Please select a type first.`, { parse_mode: 'HTML' });
        clearState(chatId);
        return;
      }
      let result;
      if (searchType === 'order') {
        let order;
        if (/^\d+$/.test(text)) order = await db.getOrderByNumericId(parseInt(text));
        if (!order) order = await db.getOrderById(text);
        if (order) {
          const username = await db.getUsername(order.telegram_id) || 'Unknown';
          result = `${EMOJIS.ORDER} <b>Order Details</b>\n\n🆔 Order ID: <code>${order.order_id}</code>\n${EMOJIS.USER} User: <code>${order.telegram_id}</code> (@${username})\n${EMOJIS.GAME} Game: ${order.game}\n${EMOJIS.ORDER} Package: ${order.package_name}\n${EMOJIS.MONEY} Charged: ${Math.round(order.charged_price)} ETB\n${EMOJIS.SUCCESS} Status: ${order.status}\n${EMOJIS.CALENDAR} Created: ${order.created_at}`;
        } else {
          result = `${EMOJIS.CROSS} Order not found.`;
        }
      } else if (searchType === 'deposit') {
        let deposit = null;
        if (/^\d+$/.test(text)) deposit = await db.getDepositById(parseInt(text));
        if (deposit) {
          const username = await db.getUsername(deposit.user_id) || 'Unknown';
          result = `${EMOJIS.MONEY} <b>Deposit Details</b>\n\n🆔 Deposit ID: <code>${formatDepositId(deposit.id)}</code>\n${EMOJIS.USER} User: <code>${deposit.user_id}</code> (@${username})\n${EMOJIS.MONEY} Amount: ${Math.round(deposit.amount)} ${deposit.currency}\n${EMOJIS.TELEBIRR} Method: ${deposit.method}\n${EMOJIS.SUCCESS} Status: ${deposit.status}\n${EMOJIS.CALENDAR} Created: ${deposit.created_at}\n${EMOJIS.INFO} Admin Note: ${deposit.admin_note || 'N/A'}`;
        } else {
          result = `${EMOJIS.CROSS} Deposit not found.`;
        }
      } else if (searchType === 'withdrawal') {
        let withdrawal = await db.getWithdrawalById(text);
        if (!withdrawal && text.toUpperCase().startsWith('EX')) {
          const parsed = parseFormattedId(text);
          if (parsed) withdrawal = await db.getWithdrawalById(parsed);
        }
        if (!withdrawal && /^\d+$/.test(text)) withdrawal = await db.getWithdrawalById(`WTH-${text}`);
        if (withdrawal) {
          const username = await db.getUsername(withdrawal.user_id) || 'Unknown';
          result = `${EMOJIS.MONEY} <b>Withdrawal Details</b>\n\n🆔 Withdrawal ID: <code>${formatWithdrawalId(withdrawal.id)}</code>\n${EMOJIS.USER} User: <code>${withdrawal.user_id}</code> (@${username})\n${EMOJIS.MONEY} Amount: ${Math.round(withdrawal.amount)} ${withdrawal.currency}\n${EMOJIS.TELEBIRR} Account: ${withdrawal.account}\n${EMOJIS.USER} Nickname: ${withdrawal.nickname}\n${EMOJIS.MONEY} Fee: ${Math.round(withdrawal.fee || 0)} ETB\n${EMOJIS.SUCCESS} Status: ${withdrawal.status}\n${EMOJIS.CALENDAR} Created: ${withdrawal.created_at}\n${EMOJIS.INFO} Admin Note: ${withdrawal.admin_note || 'N/A'}`;
        } else {
          result = `${EMOJIS.CROSS} Withdrawal not found.`;
        }
      } else {
        result = `${EMOJIS.CROSS} Invalid search type.`;
      }
      await bot.sendMessage(chatId, result, { parse_mode: 'HTML' });
      clearState(chatId);
      return;
    }

    if (state === STATES.ADMIN_BAN) {
      const uid = parseInt(text);
      if (isNaN(uid)) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Invalid ID.`, { parse_mode: 'HTML' });
        return;
      }
      await db.banUser(uid);
      await bot.sendMessage(chatId, `${EMOJIS.BAN} User <code>${uid}</code> banned.`, { parse_mode: 'HTML' });
      await reportEvent(bot, `${EMOJIS.BAN} <b>User Banned</b>\n${EMOJIS.USER} User ID: <code>${uid}</code>\n${EMOJIS.USER} By admin: ${msg.from.first_name} (ID: <code>${userId}</code>)`);
      clearState(chatId);
      return;
    }

    if (state === STATES.ADMIN_UNBAN) {
      const uid = parseInt(text);
      if (isNaN(uid)) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Invalid ID.`, { parse_mode: 'HTML' });
        return;
      }
      await db.unbanUser(uid);
      await bot.sendMessage(chatId, `${EMOJIS.UNBAN} User <code>${uid}</code> unbanned.`, { parse_mode: 'HTML' });
      await reportEvent(bot, `${EMOJIS.UNBAN} <b>User Unbanned</b>\n${EMOJIS.USER} User ID: <code>${uid}</code>\n${EMOJIS.USER} By admin: ${msg.from.first_name} (ID: <code>${userId}</code>)`);
      clearState(chatId);
      return;
    }

    if (state === STATES.ADMIN_SETBALANCE) {
      const parts = text.trim().split(' ');
      if (parts.length !== 2) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Format: user_id amount`, { parse_mode: 'HTML' });
        return;
      }
      const uid = parseInt(parts[0]);
      const amount = parseFloat(parts[1]);
      if (isNaN(uid) || isNaN(amount)) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Invalid numbers.`, { parse_mode: 'HTML' });
        return;
      }
      await db.setBalance(uid, amount);
      await bot.sendMessage(chatId, `${EMOJIS.MONEY} Balance of <code>${uid}</code> set to <b>${Math.round(amount)} ETB</b>.`, { parse_mode: 'HTML' });
      await reportEvent(bot, `${EMOJIS.MONEY} <b>Balance Set by Admin</b>\n${EMOJIS.USER} User ID: <code>${uid}</code>\n${EMOJIS.MONEY} New balance: <b>${Math.round(amount)} ETB</b>\n${EMOJIS.USER} By admin: ${msg.from.first_name} (ID: <code>${userId}</code>)`);
      clearState(chatId);
      return;
    }

    if (state === STATES.ADMIN_STARS_MARKUP) {
      const amount = parseFloat(text);
      if (isNaN(amount) || amount < 0) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Invalid amount. Must be 0 or greater.`, { parse_mode: 'HTML' });
        return;
      }
      TELEGRAM_STARS_MARKUP = amount;
      await db.saveSetting('telegram_stars_markup', String(amount));
      await bot.sendMessage(chatId, `${EMOJIS.SUCCESS} Telegram Stars markup set to <b>${Math.round(amount)} ETB</b>.`, { parse_mode: 'HTML' });
      clearState(chatId);
      return;
    }

    if (state === STATES.ADMIN_PREMIUM_MARKUP) {
      const amount = parseFloat(text);
      if (isNaN(amount) || amount < 0) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Invalid amount. Must be 0 or greater.`, { parse_mode: 'HTML' });
        return;
      }
      TELEGRAM_PREMIUM_MARKUP = amount;
      await db.saveSetting('telegram_premium_markup', String(amount));
      await bot.sendMessage(chatId, `${EMOJIS.SUCCESS} Telegram Premium markup set to <b>${Math.round(amount)} ETB</b>.`, { parse_mode: 'HTML' });
      clearState(chatId);
      return;
    }

    if (state === STATES.ADMIN_SET_PRICE_INPUT) {
      const dataObj = getData(chatId);
      const productId = dataObj.admin_price_product_id;
      const ptype = dataObj.admin_price_type || 'stars';
      const price = parseFloat(text);
      if (isNaN(price)) {
        await bot.sendMessage(chatId, `${EMOJIS.CROSS} Invalid number.`, { parse_mode: 'HTML' });
        return;
      }
      if (price <= 0) {
        await db.setProductPriceOverride(productId, null, ptype);
        await bot.sendMessage(chatId, `${EMOJIS.SUCCESS} Price override removed for product.`, { parse_mode: 'HTML' });
      } else {
        await db.setProductPriceOverride(productId, price, ptype);
        await bot.sendMessage(chatId, `${EMOJIS.SUCCESS} Price set to ${Math.round(price)} ETB for product.`, { parse_mode: 'HTML' });
      }
      await bot.sendMessage(chatId, 'Returning to admin panel.', { reply_markup: getAdminKeyboard() });
      clearState(chatId);
      return;
    }
  });

  // ------------------- ADMIN COMMANDS -------------------
  bot.onText(/\/admin/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    if (!ADMIN_CHAT_IDS.includes(userId)) {
      await bot.sendMessage(chatId, `${EMOJIS.CROSS} Unauthorized.`, { parse_mode: 'HTML' });
      return;
    }
    setState(chatId, STATES.ADMIN_LOGIN);
    await bot.sendMessage(chatId, '🔐 Enter admin password:');
  });

  bot.onText(/\/broadcast (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    if (!ADMIN_CHAT_IDS.includes(userId)) return;
    const text = match[1];
    if (!text) {
      await bot.sendMessage(chatId, 'Usage: /broadcast <message>');
      return;
    }
    const users = await db.getAllUsers();
    let success = 0;
    for (const uid of users) {
      try {
        await bot.sendMessage(uid, text);
        success++;
      } catch (e) {}
    }
    await bot.sendMessage(chatId, `${EMOJIS.SUCCESS} Broadcast sent to ${success}/${users.length} users.`, { parse_mode: 'HTML' });
  });

  bot.onText(/\/gencode (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    if (!ADMIN_CHAT_IDS.includes(userId)) return;
    const args = match[1].split(' ');
    if (args.length < 1) {
      await bot.sendMessage(chatId, 'Usage: /gencode <amount> [max_uses] [code]');
      return;
    }
    const amount = parseFloat(args[0]);
    if (isNaN(amount)) {
      await bot.sendMessage(chatId, `${EMOJIS.CROSS} Invalid amount.`, { parse_mode: 'HTML' });
      return;
    }
    const maxUses = args.length > 1 ? parseInt(args[1]) : 1;
    const code = args.length > 2 ? args[2].toUpperCase() : uuidv4().slice(0, 8).toUpperCase();
    const success = await db.createPromoCode(code, amount, maxUses);
    if (success) {
      await bot.sendMessage(chatId, `${EMOJIS.SUCCESS} Code <b>${code}</b> created for ${Math.round(amount)} ETB, uses: ${maxUses}`, { parse_mode: 'HTML' });
    } else {
      await bot.sendMessage(chatId, `${EMOJIS.CROSS} Code already exists.`, { parse_mode: 'HTML' });
    }
  });

  bot.onText(/\/listcodes/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    if (!ADMIN_CHAT_IDS.includes(userId)) return;
    const codes = await db.listPromoCodes();
    if (!codes.length) {
      await bot.sendMessage(chatId, `${EMOJIS.INFO} No promo codes found.`, { parse_mode: 'HTML' });
      return;
    }
    let text = `${EMOJIS.MONEY} <b>Active Promo Codes</b>\n\n`;
    for (const c of codes) {
      text += `<code>${c.code}</code>: ${Math.round(c.amount)} ETB | ${c.used_count}/${c.max_uses} used\n`;
    }
    await bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
  });

  bot.onText(/\/delcode (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    if (!ADMIN_CHAT_IDS.includes(userId)) return;
    const code = match[1].toUpperCase();
    await db.deletePromoCode(code);
    await bot.sendMessage(chatId, `${EMOJIS.SUCCESS} Code <b>${code}</b> deleted.`, { parse_mode: 'HTML' });
  });

  bot.onText(/\/refer (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    if (!ADMIN_CHAT_IDS.includes(userId)) return;
    const targetId = parseInt(match[1]);
    if (isNaN(targetId)) {
      await bot.sendMessage(chatId, `${EMOJIS.CROSS} Invalid ID.`, { parse_mode: 'HTML' });
      return;
    }
    const stats = await db.getReferralStats(targetId);
    const referrals = await db.getReferralList(targetId);
    let text = `${EMOJIS.INFO} <b>Referral Stats for ID <code>${targetId}</code></b>\n\n${EMOJIS.USER} Total invited: <b>${stats[0]}</b>\n${EMOJIS.MONEY} Rewarded: <b>${stats[1]}</b>\n${EMOJIS.MONEY} Total earned: <b>${Math.round(stats[2])} ETB</b>\n\n`;
    if (referrals.length) {
      text += '<b>Recent invites:</b>\n';
      for (const r of referrals) {
        const icon = r.reward_given ? EMOJIS.SUCCESS : EMOJIS.CLOCK;
        text += `  ${icon} <code>${r.referred_id}</code> (${r.status}) – ${r.created_at.slice(0, 10)}\n`;
      }
    } else {
      text += '<i>No invites yet.</i>';
    }
    await bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
  });

  // ------------------- BACKGROUND MONITOR -------------------
  async function monitorPendingWithdrawals() {
    while (true) {
      try {
        const pending = await db.getUnnotifiedPendingWithdrawals();
        for (const w of pending) {
          const wId = w.id;
          const user_id = parseInt(w.user_id);
          const amount = w.amount;
          const account = w.account;
          const nickname = w.nickname;
          const fee = w.fee || 0;
          const displayId = w.withdrawal_id || wId;
          const caption = `${EMOJIS.WITHDRAW} <b>New Withdrawal Request</b>\n${EMOJIS.USER} User ID: <code>${user_id}</code>\n${EMOJIS.TELEBIRR} Account: ${account}\n${EMOJIS.USER} Nickname: ${nickname}\n${EMOJIS.MONEY} Amount: ${Math.round(amount)} ETB\n${EMOJIS.MONEY} Fee: ${Math.round(fee)} ETB\n🆔 Withdrawal ID: <code>${formatWithdrawalId(displayId)}</code>\n🔔 <i>This withdrawal was created from the website.</i>`;
          const adminKb = {
            inline_keyboard: [
              [{ text: 'Approve', callback_data: `admin_approve_wth:${wId}` }, { text: 'Decline', callback_data: `admin_decline_wth:${wId}` }]
            ]
          };
          for (const adminId of ADMIN_CHAT_IDS) {
            try {
              await bot.sendMessage(adminId, caption, { parse_mode: 'HTML', reply_markup: adminKb });
            } catch (e) {}
          }
          await db.markWithdrawalNotified(wId);
          if (REPORT_EVENTS && config.REPORT_CHANNEL_ID) {
            try {
              await bot.sendMessage(config.REPORT_CHANNEL_ID, `${EMOJIS.WITHDRAW} <b>New Withdrawal (Website)</b>\n${EMOJIS.USER} User ID: <code>${user_id}</code>\n${EMOJIS.MONEY} Amount: ${Math.round(amount)} ETB\n🆔 ID: <code>${formatWithdrawalId(displayId)}</code>`, { parse_mode: 'HTML' });
            } catch (e) {}
          }
        }
      } catch (e) {
        console.error('Monitor error:', e);
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  monitorPendingWithdrawals();
  console.log('Bot is running...');
}

// ---------- START ----------
startBot().catch(console.error);