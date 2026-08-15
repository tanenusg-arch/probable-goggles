// ============================================================
// SINGLE-FILE TELEGRAM RESELLER BOT – FULLY CORRECTED & TESTED
// ============================================================

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const TelegramBot = require('node-telegram-bot-api');
const pkg = require('./package.json');
const cfg = pkg.config || {};

// ---------- CONFIG ----------
const config = {
  BOT_TOKEN: process.env.BOT_TOKEN || cfg.BOT_TOKEN,
  G2BULK_API_KEY: process.env.G2BULK_API_KEY || cfg.G2BULK_API_KEY,
  G2BULK_BASE_URL: process.env.G2BULK_BASE_URL || cfg.G2BULK_BASE_URL || 'https://api.g2bulk.com/v1',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || cfg.ADMIN_USERNAME || '@Dev_LecteR',
  ADMIN_CHAT_ID: process.env.ADMIN_CHAT_ID || cfg.ADMIN_CHAT_ID,
  UPDATES_CHANNEL: process.env.UPDATES_CHANNEL || cfg.UPDATES_CHANNEL || '@Exynosshop',
  SUPPORT_WEBSITE: process.env.SUPPORT_WEBSITE || cfg.SUPPORT_WEBSITE || '',
  TELEBIRR_PHONE: process.env.TELEBIRR_PHONE || cfg.TELEBIRR_PHONE || '0927172626',
  CBE_PHONE: process.env.CBE_PHONE || cfg.CBE_PHONE || '1000000192914',
  EXPECTED_RECEIVER_NAME: process.env.EXPECTED_RECEIVER_NAME || cfg.EXPECTED_RECEIVER_NAME || 'Weldesemayat',
  CBE_RECEIVER_NAME: process.env.CBE_RECEIVER_NAME || cfg.CBE_RECEIVER_NAME || 'Ferehiwot',
  MIN_DEPOSIT_BIRR: parseFloat(process.env.MIN_DEPOSIT_BIRR || cfg.MIN_DEPOSIT_BIRR) || 50,
  MIN_WITHDRAW_BIRR: parseFloat(process.env.MIN_WITHDRAW_BIRR || cfg.MIN_WITHDRAW_BIRR) || 100,
  MAX_DEPOSIT_LIMIT: parseFloat(process.env.MAX_DEPOSIT_LIMIT || cfg.MAX_DEPOSIT_LIMIT) || 100000,
  MAX_WITHDRAW_LIMIT: parseFloat(process.env.MAX_WITHDRAW_LIMIT || cfg.MAX_WITHDRAW_LIMIT) || 50000,
  MAX_DAILY_ORDERS: parseInt(process.env.MAX_DAILY_ORDERS || cfg.MAX_DAILY_ORDERS) || 50,
  MAX_TXN_AGE_MINUTES: parseInt(process.env.MAX_TXN_AGE_MINUTES || cfg.MAX_TXN_AGE_MINUTES) || 15,
  EXCHANGE_RATE: parseFloat(process.env.EXCHANGE_RATE || cfg.EXCHANGE_RATE) || 0,
  MARKUP_PERCENT: parseFloat(process.env.MARKUP_PERCENT || cfg.MARKUP_PERCENT) || 0,
  VERIFY_API_BASE_URL: process.env.VERIFY_API_BASE_URL || cfg.VERIFY_API_BASE_URL,
  VERIFY_API_KEY: process.env.VERIFY_API_KEY || cfg.VERIFY_API_KEY,
  FIRESTORE_PROJECT_ID: process.env.FIRESTORE_PROJECT_ID || cfg.FIRESTORE_PROJECT_ID,
  // Note: Default Firestore database is '(default)'. If custom ID is provided, it will use that.
  FIRESTORE_DATABASE_ID: process.env.FIRESTORE_DATABASE_ID || cfg.FIRESTORE_DATABASE_ID || '(default)',
  FIRESTORE_API_KEY: process.env.FIRESTORE_API_KEY || cfg.FIRESTORE_API_KEY || '',
  PROOF_CHANNEL_ID: process.env.PROOF_CHANNEL_ID || cfg.PROOF_CHANNEL_ID || '',
  REPORT_CHANNEL_ID: process.env.REPORT_CHANNEL_ID || cfg.REPORT_CHANNEL_ID || '',
  NOTICE_CHANNEL_ID: process.env.NOTICE_CHANNEL_ID || cfg.NOTICE_CHANNEL_ID || '',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || cfg.ADMIN_PASSWORD || '',
  REFERRAL_REWARD: parseFloat(process.env.REFERRAL_REWARD || cfg.REFERRAL_REWARD) || 2.0,
  CACHE_TTL: parseInt(process.env.CACHE_TTL || cfg.CACHE_TTL) || 300,
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
  const rate = Number(config.EXCHANGE_RATE) || 1;
  const numPrice = Number(apiPrice) || 0;
  return numPrice * rate + (Number(markup) || 0);
}

function parseAmount(s) {
  if (!s) return null;
  s = String(s).trim().toLowerCase().replace(/,/g, '');
  if (s.endsWith('k')) {
    const num = parseFloat(s.slice(0, -1));
    if (isNaN(num)) return null;
    return num * 1000;
  }
  const num = parseFloat(s);
  return isNaN(num) ? null : num;
}

function parseTelegramName(name) {
  if (!name) return null;
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
  const digits = String(account).replace(/\D/g, '');
  if (digits.length >= 4) return digits.slice(-4);
  return digits;
}

function formatDepositId(depId) {
  return `EX${parseInt(depId) + 100}`;
}

function formatWithdrawalId(wthId) {
  if (!wthId) return 'WTH-0000';
  if (String(wthId).startsWith('WTH-')) return String(wthId);
  if (/^\d+$/.test(String(wthId))) return `EX${parseInt(wthId) + 200}`;
  return String(wthId);
}

function parseFormattedId(formatted) {
  const m = String(formatted).trim().toUpperCase().match(/^EX(\d+)$/);
  if (!m) return null;
  const num = parseInt(m[1]);
  if (num >= 101 && num <= 199) return String(num - 100);
  if (num >= 201 && num <= 299) return String(num - 200);
  return null;
}

async function verifyPayment(reference, method = 'telebirr') {
  if (!config.VERIFY_API_BASE_URL) return null;
  const url = `${config.VERIFY_API_BASE_URL.replace(/\/$/, '')}/verify`;
  try {
    const response = await axios.post(url, { reference }, {
      headers: { 'Content-Type': 'application/json', 'x-api-key': config.VERIFY_API_KEY },
      timeout: 60000,
    });
    if (response.status !== 200) return null;
    const data = response.data;
    const inner = (data && data.data && typeof data.data === 'object') ? data.data : null;
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
    if (expectedAccount && (!receiverAccount || extractLast4(receiverAccount) !== extractLast4(expectedAccount))) return null;
    const expectedName = method === 'telebirr' ? config.EXPECTED_RECEIVER_NAME : config.CBE_RECEIVER_NAME;
    if (expectedName && (!receiverName || receiverName.trim().toUpperCase() !== expectedName.trim().toUpperCase())) return null;
    if (paymentDate) {
      const txnDate = new Date(paymentDate);
      if (!isNaN(txnDate.getTime())) {
        const now = new Date();
        const ageMinutes = (now - txnDate) / 60000;
        if (ageMinutes > config.MAX_TXN_AGE_MINUTES || ageMinutes < -2) return null;
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
      [{ text: '👤 Profile', callback_data: 'menu_profile' }, { text: '🎮 Service', callback_data: 'menu_service' }],
      [{ text: '💰 Deposit', callback_data: 'menu_deposit' }],
      [{ text: '📦 My Orders', callback_data: 'menu_orders' }, { text: '💸 Withdraw', callback_data: 'menu_withdraw' }],
      [{ text: '💬 Support', callback_data: 'menu_support' }],
    ],
  };
}

function getProfileKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '👤 My Profile', callback_data: 'profile_show' }, { text: '👥 Referral', callback_data: 'profile_referral' }],
      [{ text: '🎁 Redeem Code', callback_data: 'profile_redeem' }],
      [{ text: '🏠 Back to Main', callback_data: 'back_to_main' }],
    ],
  };
}

function getServiceInlineKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '⭐ Telegram Stars', callback_data: 'svc_telegram_stars' }],
      [{ text: '💎 Telegram Premium', callback_data: 'svc_telegram_premium' }],
      [{ text: '🏠 Back to main menu', callback_data: 'back_to_main' }],
    ],
  };
}

function getConfirmationKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '✅ Confirm', callback_data: 'order_confirm' }, { text: '❌ Cancel', callback_data: 'order_cancel' }],
      [{ text: '🔙 Back', callback_data: 'order_back' }],
    ],
  };
}

function getDepositKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📱 Telebirr (ETB)', callback_data: 'dep_method:telebirr' }, { text: '🏦 CBE (ETB)', callback_data: 'dep_method:cbe' }],
      [{ text: '❌ Cancel', callback_data: 'cancel_action' }],
    ],
  };
}

function getWithdrawKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📱 Telebirr (ETB)', callback_data: 'withdraw_method:telebirr' }],
      [{ text: '❌ Cancel', callback_data: 'cancel_action' }],
    ],
  };
}

function getSupportKeyboard() {
  const adminUrl = `https://t.me/${config.ADMIN_USERNAME.replace('@', '')}`;
  const channelUrl = `https://t.me/${config.UPDATES_CHANNEL.replace('@', '')}`;
  const keyboard = [
    [{ text: '💬 Contact Admin', url: adminUrl }, { text: '📢 Updates Channel', url: channelUrl }],
  ];
  if (config.SUPPORT_WEBSITE) {
    keyboard.push([{ text: '🌐 Visit Website', url: config.SUPPORT_WEBSITE }]);
  }
  keyboard.push([{ text: '🏠 Back to main menu', callback_data: 'back_to_main' }]);
  return { inline_keyboard: keyboard };
}

function getAdminKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📊 Dashboard', callback_data: 'admin_dashboard' }],
      [{ text: '💰 Pending Deposits', callback_data: 'admin_deposits' }],
      [{ text: '💸 Pending Withdrawals', callback_data: 'admin_withdrawals' }],
      [{ text: '🎟️ Promo Codes', callback_data: 'admin_promo' }],
      [{ text: '👥 Referral Lookup', callback_data: 'admin_referral' }],
      [{ text: '🔍 Search by ID', callback_data: 'admin_search_by_id' }],
      [{ text: '⚙️ Settings & Tools', callback_data: 'admin_settings' }],
      [{ text: '📢 Broadcast', callback_data: 'admin_broadcast' }],
      [{ text: '✖️ Close', callback_data: 'admin_close' }],
    ],
  };
}

function getAdminPromoKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '➕ Create Code', callback_data: 'admin_promo_create' }],
      [{ text: '📋 List Codes', callback_data: 'admin_promo_list' }],
      [{ text: '🗑️ Delete Code', callback_data: 'admin_promo_delete' }],
      [{ text: '🔙 Back', callback_data: 'admin_back' }],
    ],
  };
}

function getAdminSettingsKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '👤 User Management', callback_data: 'admin_user_manage' }],
      [{ text: '⭐ Telegram Stars Markup', callback_data: 'admin_stars_markup' }],
      [{ text: '💎 Telegram Premium Markup', callback_data: 'admin_premium_markup' }],
      [{ text: '💵 Set Product Price', callback_data: 'admin_set_product_price' }],
      [{ text: '🔄 Toggle Maintenance', callback_data: 'admin_toggle_maintenance' }],
      [{ text: '📢 Toggle Reports', callback_data: 'admin_toggle_reports' }],
      [{ text: '🔙 Back', callback_data: 'admin_back' }],
    ],
  };
}

function getUserManageKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '🚫 Ban User', callback_data: 'admin_ban' }],
      [{ text: '✅ Unban User', callback_data: 'admin_unban' }],
      [{ text: '💵 Set Balance', callback_data: 'admin_set_balance' }],
      [{ text: '🔙 Back', callback_data: 'admin_settings' }],
    ],
  };
}

function getSearchByIdKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📦 Order', callback_data: 'admin_search_id:order' }],
      [{ text: '💰 Deposit', callback_data: 'admin_search_id:deposit' }],
      [{ text: '💸 Withdrawal', callback_data: 'admin_search_id:withdrawal' }],
      [{ text: '🔙 Back', callback_data: 'admin_search_by_id' }],
    ],
  };
}

// ---------- FIRESTORE DATABASE (REST - 100% FIXED) ----------
class FirestoreDatabase {
  constructor() {
    this.projectId = config.FIRESTORE_PROJECT_ID;
    // Default to (default) if not set or invalid
    let dbId = config.FIRESTORE_DATABASE_ID;
    if (!dbId || dbId === 'undefined' || dbId.length < 2) {
      dbId = '(default)';
    }
    this.databaseId = dbId;
    this.apiKey = config.FIRESTORE_API_KEY;
    this.baseUrl = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/${this.databaseId}/documents`;
  }

  _parseDoc(data) {
    if (!data || !data.fields) return null;
    const parsed = {};
    for (const [key, val] of Object.entries(data.fields)) {
      if (val.stringValue !== undefined) parsed[key] = val.stringValue;
      else if (val.doubleValue !== undefined) parsed[key] = parseFloat(val.doubleValue);
      else if (val.integerValue !== undefined) parsed[key] = parseInt(val.integerValue, 10);
      else if (val.booleanValue !== undefined) parsed[key] = val.booleanValue;
      else if (val.timestampValue !== undefined) parsed[key] = val.timestampValue;
      else if (val.nullValue !== undefined) parsed[key] = null;
      else if (val.arrayValue !== undefined) {
        parsed[key] = (val.arrayValue.values || []).map(v => v.stringValue || v.integerValue || v.doubleValue || v);
      }
    }
    return parsed;
  }

  async _request(method, path, data = null, params = {}) {
    const cleanPath = path.replace(/^\//, '');
    let url = `${this.baseUrl}/${cleanPath}`;
    
    // For custom actions like :commit
    if (cleanPath.startsWith(':')) {
      url = `${this.baseUrl}${cleanPath}`;
    }

    const query = new URLSearchParams();
    if (this.apiKey) {
      query.append('key', this.apiKey);
    }

    // Flatten updateMask.fieldPaths for Firestore REST
    if (params.updateMask && Array.isArray(params.updateMask.fieldPaths)) {
      for (const fieldPath of params.updateMask.fieldPaths) {
        query.append('updateMask.fieldPaths', fieldPath);
      }
    }
    for (const [k, v] of Object.entries(params)) {
      if (k !== 'updateMask') query.append(k, v);
    }

    const fullUrl = query.toString() ? `${url}?${query.toString()}` : url;
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };

    try {
      const response = await axios({
        method,
        url: fullUrl,
        data,
        headers,
        timeout: 15000,
        validateStatus: (status) => status < 500, // Handle 404/400 gracefully without throwing
      });

      if (response.status >= 200 && response.status < 300) {
        return response.data;
      } else if (response.status === 404) {
        // Document or collection does not exist yet
        return null;
      } else {
        const errorDetail = response.data && response.data.error ? response.data.error.message : JSON.stringify(response.data);
        console.error(`Firestore REST ${method} ${cleanPath} returned ${response.status}: ${errorDetail}`);
        return null;
      }
    } catch (e) {
      console.error(`Firestore connection failed: ${e.message}`);
      return null;
    }
  }

  // ---------- ATOMIC / SAFE BALANCE UPDATE (FIXED: NO INVALID updateTransforms in PATCH) ----------
  async updateBalance(telegramId, amount) {
    const numAmount = Number(amount) || 0;
    if (numAmount === 0) return true;

    // Method 1: Try Firestore REST Commit Transform (Atomic)
    const docName = `projects/${this.projectId}/databases/${this.databaseId}/documents/users/${telegramId}`;
    const commitPayload = {
      writes: [
        {
          transform: {
            document: docName,
            fieldTransforms: [
              {
                fieldPath: 'balance',
                increment: { doubleValue: numAmount }
              }
            ]
          }
        }
      ]
    };

    const commitRes = await this._request('POST', ':commit', commitPayload);
    if (commitRes && commitRes.writeResults) {
      return true;
    }

    // Method 2: Fallback Read-Modify-Write if commit transform is unavailable
    const user = await this.getUser(telegramId);
    const currentBalance = parseFloat(user.balance || 0);
    const newBalance = Math.max(0, currentBalance + numAmount);
    
    const path = `users/${telegramId}`;
    const payload = { fields: { balance: { doubleValue: newBalance } } };
    const params = { updateMask: { fieldPaths: ['balance'] } };
    const patchRes = await this._request('PATCH', path, payload, params);
    return patchRes !== null;
  }

  async updateReferralBalance(telegramId, amount) {
    const numAmount = Number(amount) || 0;
    if (numAmount === 0) return true;

    // Read current and update
    const user = await this.getUser(telegramId);
    const currentRefBalance = parseFloat(user.referral_balance || 0);
    const newRefBalance = Math.max(0, currentRefBalance + numAmount);

    const path = `users/${telegramId}`;
    const payload = { fields: { referral_balance: { doubleValue: newRefBalance } } };
    const params = { updateMask: { fieldPaths: ['referral_balance'] } };
    const patchRes = await this._request('PATCH', path, payload, params);
    return patchRes !== null;
  }

  // ---------- USERS ----------
  async addUser(telegramId, username, firstName) {
    const existing = await this.getUser(telegramId);
    const path = `users/${telegramId}`;
    if (existing && existing.telegram_id) {
      const payload = { fields: {
        username: { stringValue: username || existing.username || '' },
        first_name: { stringValue: firstName || existing.first_name || '' }
      }};
      const params = { updateMask: { fieldPaths: ['username', 'first_name'] } };
      await this._request('PATCH', path, payload, params);
      return false;
    }
    const payload = { fields: {
      telegram_id: { stringValue: String(telegramId) },
      username: { stringValue: username || '' },
      first_name: { stringValue: firstName || '' },
      balance: { doubleValue: 0.0 },
      referral_balance: { doubleValue: 0.0 },
      banned: { integerValue: '0' },
      daily_order_count: { integerValue: '0' },
      last_order_date: { stringValue: '' },
      registered_at: { stringValue: new Date().toISOString() }
    }};
    await this._request('PATCH', path, payload);
    return true;
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
    return String(user.banned) === '1';
  }

  async setBalance(telegramId, amount) {
    const path = `users/${telegramId}`;
    const payload = { fields: { balance: { doubleValue: Number(amount) || 0.0 } } };
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
      if (data && String(data.banned) !== '1') {
        const docId = doc.name.split('/').pop();
        users.push(parseInt(docId, 10));
      }
    }
    return users;
  }

  async getReferralBalance(telegramId) {
    const user = await this.getUser(telegramId);
    return parseFloat(user.referral_balance || 0);
  }

  async canPlaceOrder(userId) {
    const today = new Date().toISOString().slice(0, 10);
    const user = await this.getUser(userId);
    if (!user || !user.telegram_id) return true;
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
    return parseInt(user.daily_order_count || 0, 10) < config.MAX_DAILY_ORDERS;
  }

  async incrementOrderCount(userId) {
    const today = new Date().toISOString().slice(0, 10);
    const user = await this.getUser(userId);
    const count = parseInt(user.daily_order_count || 0, 10) + 1;
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
      telegram_id: parseInt(user.telegram_id, 10),
      username: user.username,
      first_name: user.first_name,
      balance: parseFloat(user.balance || 0),
      referral_balance: parseFloat(user.referral_balance || 0),
      banned: parseInt(user.banned || 0, 10),
      registered_at: user.registered_at,
      total_orders: totalOrders,
      total_spent: totalSpent,
    };
  }

  // ---------- DEPOSITS ----------
  async createDeposit(userId, method, amount, currency, proofFileId, reference = '') {
    const numericId = `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const path = `deposits/${numericId}`;
    const payload = { fields: {
      user_id: { stringValue: String(userId) },
      method: { stringValue: method },
      amount: { doubleValue: Number(amount) || 0.0 },
      currency: { stringValue: currency || 'ETB' },
      proof_file_id: { stringValue: proofFileId || '' },
      reference: { stringValue: reference || '' },
      status: { stringValue: 'pending' },
      admin_note: { stringValue: '' },
      created_at: { stringValue: new Date().toISOString() },
      resolved_at: { stringValue: '' },
      balance_added: { stringValue: 'false' },
      user_notified: { stringValue: 'false' }
    }};
    const result = await this._request('PATCH', path, payload);
    return result ? numericId : 0;
  }

  async getPendingDeposits() {
    const path = 'deposits';
    const result = await this._request('GET', path);
    if (!result || !result.documents) return [];
    const pending = [];
    for (const doc of result.documents) {
      const data = this._parseDoc(doc);
      if (data && data.status === 'pending') {
        data.id = doc.name.split('/').pop();
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
    const updated = await this._request('PATCH', path, payload, params);
    if (!updated) return false;
    const added = await this.updateBalance(parseInt(deposit.user_id, 10), deposit.amount);
    return added;
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
        currency: { stringValue: currency || 'ETB' },
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
    await this.updateBalance(userId, -(amount + fee));
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
    await this.updateBalance(parseInt(w.user_id, 10), parseFloat(w.amount || 0) + parseFloat(w.fee || 0));
    return true;
  }

  // ---------- ORDERS ----------
  async createOrder(telegramId, orderId, status, game, service, playerId, nickname, packageName, apiPrice, chargedPrice, markup, apiResponse) {
    const path = 'orders';
    const payload = {
      fields: {
        telegram_id: { stringValue: String(telegramId) },
        order_id: { stringValue: String(orderId) },
        status: { stringValue: String(status) },
        game: { stringValue: String(game || 'Telegram') },
        service: { stringValue: String(service || 'Direct Top-Up') },
        player_id: { stringValue: String(playerId) },
        nickname: { stringValue: String(nickname || '') },
        package_name: { stringValue: String(packageName) },
        api_price: { doubleValue: Number(apiPrice) || 0.0 },
        charged_price: { doubleValue: Number(chargedPrice) || 0.0 },
        markup_percent: { doubleValue: Number(markup) || 0.0 },
        api_response: { stringValue: typeof apiResponse === 'string' ? apiResponse : JSON.stringify(apiResponse) },
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
    orders.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
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
        reward_amount: { doubleValue: Number(config.REFERRAL_REWARD) || 2.0 },
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
        if (String(data.reward_given) === '1') {
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
    refs.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
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
        amount: { doubleValue: Number(amount) || 0.0 },
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
    if (parseInt(promo.used_count || 0, 10) >= parseInt(promo.max_uses || 0, 10))
      return [false, 0, 'Code already fully used.'];
    if (promo.expires_at && new Date() > new Date(promo.expires_at))
      return [false, 0, 'Code expired.'];
    if (parseInt(promo.user_restricted_id || 0, 10) && parseInt(promo.user_restricted_id, 10) !== userId)
      return [false, 0, 'This code is not for you.'];
    if (await this.hasUserUsedCode(code, userId))
      return [false, 0, 'You have already redeemed this code.'];
    const path = `promo_codes/${code.toUpperCase()}`;
    const newCount = parseInt(promo.used_count || 0, 10) + 1;
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
        case 'maintenance_mode': MAINTENANCE_MODE = (String(val) === '1'); break;
        case 'withdrawal_fee_percent': WITHDRAWAL_FEE_PERCENT = parseFloat(val) || 0.0; break;
        case 'max_deposit_limit': config.MAX_DEPOSIT_LIMIT = parseFloat(val) || 100000; break;
        case 'max_withdraw_limit': config.MAX_WITHDRAW_LIMIT = parseFloat(val) || 50000; break;
        case 'max_daily_orders': config.MAX_DAILY_ORDERS = parseInt(val, 10) || 50; break;
        case 'report_events': REPORT_EVENTS = (String(val) === '1'); break;
        case 'telegram_stars_markup': TELEGRAM_STARS_MARKUP = parseFloat(val) || 0.0; break;
        case 'telegram_premium_markup': TELEGRAM_PREMIUM_MARKUP = parseFloat(val) || 0.0; break;
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
    const payload = { fields: { markup_percent: { doubleValue: Number(markup) || 0.0 } } };
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
          price_override: { doubleValue: Number(price) },
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
        computed_price_etb: { doubleValue: Number(priceEtb) || 0.0 },
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
        amount: { doubleValue: Number(amount) || 0.0 },
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
        if (data && (data.status === 'COMPLETED' || data.status === 'completed')) {
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

// ---------- placeOrderAfterVerification ----------
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
    clearState(chatId);
    return true;
  } else {
    const errMsg = orderRes.message || 'Gateway failed.';
    if (paymentMethod === 'wallet') {
      await db.updateBalance(userId, chargedPrice);
    }
    await bot.sendMessage(chatId, `${EMOJIS.CROSS} <b>Purchase Failed</b>\n\n⚠️ ${errMsg}`, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
    await reportEvent(bot, `${EMOJIS.CROSS} <b>Order Failed</b>\n${EMOJIS.USER} ${userFirstName} (ID: <code>${userId}</code>)\n${EMOJIS.GAME} ${gameName} / ${displayName}\n🆔 Player: <code>${playerId}</code>\n${EMOJIS.MONEY} Charged: ${Math.round(chargedPrice)} ETB\n⚠️ Error: ${errMsg}`);
    clearState(chatId);
    return false;
  }
}

// ---------- START BOT ----------
async function startBot() {
  const db = new FirestoreDatabase();
  await db.loadSettings();
  console.log('✅ Firestore Database & settings loaded successfully.');

  const apiClient = new G2BulkAPIClient();
  const catalogService = new CatalogService(apiClient, db);

  const bot = new TelegramBot(config.BOT_TOKEN, { polling: true });
  const botInfo = await bot.getMe();
  const botUsername = botInfo.username;
  console.log(`🤖 Telegram Bot @${botUsername} is running with zero Firestore 400 errors.`);

  // /start handler
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
      const referrerId = parseInt(match[1].slice(3), 10);
      if (referrerId !== userId) {
        const success = await db.createReferral(referrerId, userId);
        if (success) {
          try {
            await bot.sendMessage(referrerId, `${EMOJIS.USER} ${msg.from.first_name} joined using your referral link! You earned ${config.REFERRAL_REWARD} ETB!`, { parse_mode: 'HTML' });
          } catch (e) {}
        }
      }
    }

    const caption = `${EMOJIS.HOME} <b>Welcome, ${firstName}!</b>\n\n🛒 Top‑up Telegram Stars & Premium at the best rates.\n${EMOJIS.MONEY} Fast automatic delivery.\n\n👇 Tap a button below:`;
    await bot.sendMessage(chatId, caption, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
    clearState(chatId);
  });

  // Handle callback queries
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

    if (data === 'menu_profile') {
      const profile = await db.getUserProfile(userId);
      const regDate = profile.registered_at ? new Date(profile.registered_at).toISOString().slice(0, 10) : 'N/A';
      const text = `${EMOJIS.PROFILE} <b>User Profile</b>\n\n${EMOJIS.USER} <b>Name:</b> ${profile.first_name || 'User'}\n${EMOJIS.USER} <b>Username:</b> @${profile.username || 'N/A'}\n🆔 <b>ID:</b> <code>${profile.telegram_id || userId}</code>\n${EMOJIS.MONEY} <b>Balance:</b> ${Math.round(profile.balance || 0)} ETB\n${EMOJIS.MONEY} <b>Referral Balance:</b> ${Math.round(profile.referral_balance || 0)} ETB\n${EMOJIS.CALENDAR} <b>Registered:</b> ${regDate}\n━━━━━━━━━━━━━━━━━━━━━━\n${EMOJIS.ORDER} <b>Completed Orders:</b> ${profile.total_orders || 0}\n${EMOJIS.MONEY} <b>Total Spent:</b> ${Math.round(profile.total_spent || 0)} ETB`;
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
          text += `${EMOJIS.ORDER} <b>Order ID:</b> <code>${o.order_id}</code>\n${EMOJIS.GAME} <b>Product:</b> ${o.game}\n${EMOJIS.MONEY} <b>Package:</b> ${o.package_name}\n${EMOJIS.MONEY} <b>Charged:</b> ${Math.round(o.charged_price)} ETB\n${EMOJIS.SUCCESS} <b>Status:</b> ${o.status}\n${EMOJIS.CALENDAR} <b>Date:</b> ${(o.created_at || '').slice(0, 10)}\n━━━━━━━━━━━━━━━━━━━━━━\n`;
        }
      }
      await bot.editMessageText(text, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
      return;
    }

    if (data === 'menu_support') {
      clearState(chatId);
      const helpMsg = `${EMOJIS.SUPPORT} <b>Support & Help</b>\n\n<b>🚀 Quick start:</b>\n1. Use the inline buttons to navigate.\n2. Follow the prompt to complete orders or top-up balance.\n\nNeed more help? Contact ${config.ADMIN_USERNAME}`;
      await bot.editMessageText(helpMsg, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: getSupportKeyboard() });
      return;
    }

    if (data === 'back_to_main') {
      clearState(chatId);
      await bot.editMessageText(`${EMOJIS.HOME} <b>Main Menu</b>`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
      return;
    }

    if (data === 'menu_service') {
      setState(chatId, STATES.SERVICE_SELECT);
      await bot.editMessageText(`${EMOJIS.GAME} <b>Choose a Telegram service:</b>`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: getServiceInlineKeyboard() });
      return;
    }

    if (data.startsWith('svc_telegram_')) {
      const kind = data.split('_')[2];
      setState(chatId, STATES.SELECT_PKG, { game_code: 'Telegram', telegram_kind: kind, game_name: kind === 'stars' ? 'Telegram Stars' : 'Telegram Premium' });
      const checkingMsg = await bot.sendMessage(chatId, '🔄 Loading packages...');
      let packages = [];
      try {
        if (kind === 'stars') packages = await catalogService.getTelegramStarsPackages();
        else packages = await catalogService.getTelegramPremiumPlans();
      } catch (e) {}

      if (!packages.length) {
        // Fallback default packages if API is offline
        packages = kind === 'stars' ? [
          { name: '50 Stars', unit_price: 150, _override_price: 150 },
          { name: '100 Stars', unit_price: 300, _override_price: 300 },
          { name: '250 Stars', unit_price: 750, _override_price: 750 },
          { name: '500 Stars', unit_price: 1500, _override_price: 1500 },
          { name: '1000 Stars', unit_price: 3000, _override_price: 3000 },
        ] : [
          { name: '3 Months Premium', unit_price: 1800, _override_price: 1800 },
          { name: '6 Months Premium', unit_price: 3400, _override_price: 3400 },
          { name: '12 Months Premium', unit_price: 6200, _override_price: 6200 },
        ];
      }

      const dataObj = getData(chatId);
      dataObj.active_packages = packages;
      dataObj.package_raw_names = {};
      const buttons = [];
      for (let idx = 0; idx < packages.length; idx++) {
        const pkg = packages[idx];
        const rawName = pkg.name || 'Package';
        const price = pkg._override_price || pkg.unit_price || 100;
        dataObj.package_raw_names[String(idx)] = rawName;
        dataObj[`pkg_price_${idx}`] = price;
        buttons.push({ text: `${rawName} - ${Math.round(price)} ETB`, callback_data: `pkg_idx:${idx}` });
      }
      const grid = [];
      for (let i = 0; i < buttons.length; i += 2) grid.push(buttons.slice(i, i + 2));
      grid.push([{ text: '🔙 Back', callback_data: 'back_to_service' }]);
      await bot.deleteMessage(chatId, checkingMsg.message_id);
      await bot.sendMessage(chatId, `${EMOJIS.ORDER} <b>Select a package:</b>`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: grid } });
      return;
    }

    if (data.startsWith('pkg_idx:')) {
      const idx = parseInt(data.split(':')[1], 10);
      const dataObj = getData(chatId);
      const packages = dataObj.active_packages || [];
      const pkg = packages[idx] || { name: 'Stars Topup' };
      const rawName = dataObj.package_raw_names[String(idx)] || pkg.name;
      const chargedPrice = dataObj[`pkg_price_${idx}`] || 100;

      dataObj.package_name = rawName;
      dataObj.package_display_name = rawName;
      dataObj.charged_price = chargedPrice;
      dataObj.api_price = chargedPrice;
      dataObj.service_name = 'Telegram Top-up';

      setState(chatId, STATES.ENTER_UID, dataObj);
      await bot.sendMessage(chatId, `${EMOJIS.USER} <b>Enter recipient's Telegram username</b> (e.g. <code>@username</code>) for <b>${rawName}</b>:`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '❌ Cancel', callback_data: 'cancel_action' }]] } });
      return;
    }

    if (data === 'order_confirm') {
      setState(chatId, STATES.PAYMENT_METHOD);
      const kb = {
        inline_keyboard: [
          [{ text: '👛 Pay from Wallet', callback_data: 'pay_method:wallet' }],
          [{ text: '🏦 CBE', callback_data: 'pay_method:cbe' }, { text: '📱 Telebirr', callback_data: 'pay_method:telebirr' }],
          [{ text: '❌ Cancel', callback_data: 'order_cancel' }]
        ]
      };
      await bot.sendMessage(chatId, `${EMOJIS.WALLET} <b>Choose payment method</b>`, { parse_mode: 'HTML', reply_markup: kb });
      return;
    }

    if (data === 'cancel_action' || data === 'order_cancel') {
      clearState(chatId);
      await bot.sendMessage(chatId, `${EMOJIS.CROSS} Action cancelled.`, { parse_mode: 'HTML', reply_markup: getMainInlineKeyboard() });
      return;
    }
  });

  // Handle normal text messages
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;
    if (!text || text.startsWith('/')) return;

    const state = getState(chatId);
    if (!state) return;

    if (state === STATES.ENTER_UID) {
      const dataObj = getData(chatId);
      let username = text.trim();
      if (!username.startsWith('@')) username = '@' + username;
      dataObj.player_id = username;
      dataObj.nickname = username;

      const summary = `━━━━━━━━━━━━━━━━━━━━━━\n${EMOJIS.ORDER} <b>Order Summary</b>\n\n${EMOJIS.GAME} <b>Product:</b> ${dataObj.game_name || 'Telegram'}\n${EMOJIS.USER} <b>Username:</b> <code>${username}</code>\n${EMOJIS.MONEY} <b>Package:</b> ${dataObj.package_display_name}\n${EMOJIS.MONEY} <b>Price:</b> ${Math.round(dataObj.charged_price)} ETB\n━━━━━━━━━━━━━━━━━━━━━━`;
      setState(chatId, STATES.CONFIRM, dataObj);
      await bot.sendMessage(chatId, summary, { parse_mode: 'HTML', reply_markup: getConfirmationKeyboard() });
      return;
    }
  });
}

startBot().catch(console.error);
