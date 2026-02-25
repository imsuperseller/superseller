
/***** CONFIG *****/
const MONDAY_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ2MTU0NDU3MywiYWFpIjoxMSwidWlkIjo2NzM4Mzk1MywiaWFkIjoiMjAyNS0wMS0yMlQxNToxOTo0Mi4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjU5OTE4OTMsInJnbiI6InVzZTEifQ.mLJfk99Toj8CPxybC2_ihHCxEQu9jq0NHF6nNyOHc3E';
const BOARD_ID = 9021789808;                 // יעד: הלוח הראשי
const GROUP_TITLE = 'Google sheet info';     // יעד: שם הקבוצה בלוח
const CUSTOMERS_BOARD_ID = 8997810127;
const NURSES_BOARD_ID   = 9005732541;

const SHEET_NAME = 'דוח למאנדיי';

// Allowed labels for תשלום בפועל (color_mkqppcpp)
const PAYMENT_STATUS_LABELS = ['בקרה', 'שולם', 'לא נגבה', 'שולם - מזומן', 'חיוב ידני'];
// Allowed labels for יום בשבוע (color_mkqam4f2) - from Monday.com settings
const WEEKDAY_LABELS = ['ד', 'ה', 'ו', 'ב', 'ש', 'א', 'ג'];
// Allowed labels for שנה (color_mktd445d) - from Monday.com settings
const YEAR_LABELS = ['2026', '2025', '2024'];

// Age validation settings
const MIN_VALID_AGE = 0;  // Allow 0 (newborns)
const MAX_VALID_AGE = 120; // Maximum realistic age
const SUSPICIOUS_AGE = 1;  // Age that might need verification

/***** MAIN *****/
function syncSheetToMonday() {
  try {
    Logger.log('Starting sync process...');
    Logger.log('SHEET_NAME constant value: ' + SHEET_NAME);

    const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error(`Sheet "${SHEET_NAME}" not found`);

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows    = data.slice(1);

    Logger.log(`Found ${rows.length} rows to process`);
    Logger.log(`Headers: ${headers.join(', ')}`);

    // Resolve target group ID by title (fail-fast if missing)
    const targetGroupId = getGroupIdOrThrow(BOARD_ID, GROUP_TITLE);
    Logger.log(`Resolved group "${GROUP_TITLE}" => id: ${targetGroupId}`);

    // Lookups
    const customers = getBoardItems(CUSTOMERS_BOARD_ID);
    const nurses    = getBoardItems(NURSES_BOARD_ID);
    Logger.log(`Found ${customers.length} customers and ${nurses.length} nurses`);

    // Existing items (for duplicate detection by order number)
    const existingItems = getBoardItems(BOARD_ID);
    const orderNumberToItemId = {};
    existingItems.forEach(item => {
      if (item.column_values) {
        const orderNumberCol = item.column_values.find(
          col => col.id === 'text_mksqd4m0' && col.text && col.text !== ''
        );
        if (orderNumberCol) {
          orderNumberToItemId[orderNumberCol.text] = item.id;
        }
      }
    });

    let successCount = 0;
    let errorCount   = 0;

    rows.forEach((row, idx) => {
      try {
        const rowObj = {};
        headers.forEach((h, i) => (rowObj[h] = (row[i] !== undefined && row[i] !== null && row[i] !== '') ? row[i] : 'ללא מידע'));

        // Skip rows where סוג טיפול is '0'
        const treatmentType = rowObj['סוג טיפול'] || rowObj['Treatment Type'] || 'ללא מידע';
        if (String(treatmentType).trim() === '0') {
          Logger.log(`Skipping row ${idx + 1} because סוג טיפול is '0'`);
          return;
        }

        // Extract (Heb/Eng + tolerating header typos)
        const clientName  = rowObj['לקוח'] || rowObj['Client'] || 'ללא מידע';
        const orderName   = clientName; // item name = client only (as per your logic)
        const nurseName   = rowObj['אחות'] || rowObj['Nurse'] || 'ללא מידע';
        const month       = rowObj['חודש'] || rowObj['Month'] || 'ללא מידע';

        const orderDate   = formatDate(rowObj['תאריך'] || rowObj['תאריך הזמנה'] || rowObj['Order Date']);
        const patient     = rowObj['מטופל'] || rowObj['Patient'] || 'ללא מידע';

        const checkInDate  = formatDate(rowObj['צק אין']      || rowObj['תאריך צק אין']      || rowObj['Check In Date']);
        const checkOutDate = formatDate(rowObj['צק אאוט']     || rowObj['תאריך צק אאוט']     || rowObj['Check Out Date']);

        const orderDuration = rowObj['משך הזמנה'] || rowObj['Order Duration'] || 'ללא מידע';
        const payment       = parseNumber(rowObj['תשלום'] || rowObj['Payment']);

        // not mapped yet but kept for possible future use:
        const nursePayment  = parseNumber(rowObj['תשלום לאחות'] || rowObj['Nurse Payment']);
        const netIncome     = parseNumber(rowObj['הכנסה נט']    || rowObj['Net Income']);

        const notes      = rowObj['הערות'] || rowObj['Notes'] || 'ללא מידע';

        let actualPaymentStatus = (rowObj['תשלום בפועל'] || rowObj['Actual Payment'] || '').toString().trim();
        const residence = rowObj['מקום מגורים'] || rowObj['Residence'] || 'ללא מידע';

        let region = (rowObj['מחוז'] || rowObj['Region'] || 'ללא מידע').toString().trim();
        if (region === '') region = 'ללא מידע';

        // FIXED: Age validation and cleaning
        const rawPatientAge = rowObj['גיל מטופל'] || rowObj['Patient Age'];
        const patientAge = validateAndCleanAge(rawPatientAge, patient, idx + 1);

        // NEW: Calculate weekday from date
        const dateForWeekday = rowObj['תאריך'] || rowObj['תאריך הזמנה'] || rowObj['Order Date'];
        const weekDay = calculateHebrewWeekday(dateForWeekday);

        const orderStatus = rowObj['סטטוס'] || rowObj['Status'] || 'Working on it';

        // New fields: tolerate both correct + typo header
        const fourDigits  = rowObj['4 ספרות'] || rowObj['Four Digits'] || '';
        const orderNumber = String(
          rowObj['מספר הזמנה'] || rowObj['מסpר הזמנה'] || rowObj['Order Number'] || ''
        );

        // FIXED: Year field with proper string conversion
        const yearValue = rowObj['שנה'] || rowObj['Year'] || '';
        const year = yearValue.toString().trim(); // Ensure it's a string

        // IDs from lookup boards
        const customerId = findItemIdByName(customers, patient);
        const nurseId    = findItemIdByName(nurses, nurseName);

        // Prefer to show a "time" even when given a full datetime string:
        const timeFromEitherCheck = formatTime(
          rowObj['צק אאוט'] || rowObj['תאריך צק אאוט'] || rowObj['Check Out Date'] ||
          rowObj['צק אין']  || rowObj['תאריך צק אין']  || rowObj['Check In Date']
        );

        // FIXED: Check out with date and time
        const checkOutDateTime = formatDateTime(rowObj['צק אאוט'] || rowObj['תאריך צק אאוט'] || rowObj['Check Out Date']);

        const columnValues = {
          color_mkqe6tr7: { label: orderStatus },            // סטטוס הזמנה
          status:         { label: month },                  // חודש
          text_mkrvvskv:  orderDate,                         // תאריך הזמנה
          text_mkqa8gn7:  patient,                           // מטופל
          text_mkqaez78:  nurseName,                         // אחות
          color_mkqayybh: { label: treatmentType },          // סוג טיפול
          text_mkrvxt8f:  checkInDate || orderDate,          // תאריך צ'ק אין (נופל חזרה לתאריך הזמנה אם חסר)
          text_mktdxhvb:  checkOutDateTime,                  // check out - FIXED: now includes date and time
          text_mkrv3x0n:  timeFromEitherCheck,               // זמן (מחלץ HH:mm מכל פורמט)
          text_mkqayhnj:  orderDuration,                     // משך הזמנה
          numeric_mkqa8924: payment,                         // תשלום
          text_mkqa5hdc:    notes,                           // הערות
          text_mkqa4ecf:    residence,                       // מקום מגורים
          numeric_mkqa4enf: patientAge,                      // גיל מטופל - FIXED: validated and cleaned
          text_mkrva3zt:    nurseId ? nurseId : '',          // Nurse ID (כטקסט)
          numeric_mksqcqvg: parseNumber(fourDigits),         // 4 ספרות
          text_mksqd4m0:    orderNumber,                     // מספר הזמנה
        };

        // FIXED: Add year field only if it's a valid label
        if (YEAR_LABELS.includes(year)) {
          columnValues.color_mktd445d = { label: year };
          Logger.log(`✅ Adding year field: ${year}`);
        } else {
          Logger.log(`⚠️ Skipping year field: "${year}" not in valid labels: ${YEAR_LABELS.join(', ')}`);
        }

        if (PAYMENT_STATUS_LABELS.includes(actualPaymentStatus)) {
          columnValues.color_mkqppcpp = { label: actualPaymentStatus };
        }
        
        // FIXED: Add weekday field (calculated from date)
        if (WEEKDAY_LABELS.includes(weekDay)) {
          columnValues.color_mkqam4f2 = { label: weekDay };
          Logger.log(`✅ Adding weekday field (calculated): ${weekDay}`);
        } else if (weekDay && weekDay !== '') {
          Logger.log(`⚠️ Skipping weekday field: "${weekDay}" not in valid labels: ${WEEKDAY_LABELS.join(', ')}`);
        }
        
        columnValues.color_mkqaa2nm = { label: (region && region !== 'ללא מידע') ? region : 'ללא מידע' };

        // Prune empties
        Object.keys(columnValues).forEach(k => {
          const v = columnValues[k];
          if (v === undefined || v === null || v === '' || (typeof v === 'object' && v.label === '')) {
            delete columnValues[k];
          }
        });

        Logger.log(`Processing row ${idx + 1}: ${JSON.stringify(columnValues)}`);

        // Dedupe by order number (delete pre-existing)
        if (orderNumber && orderNumberToItemId[orderNumber]) {
          Logger.log(`🗑️ Duplicate found for order number ${orderNumber}, deleting item ID: ${orderNumberToItemId[orderNumber]}`);
          deleteMondayItem(orderNumberToItemId[orderNumber]);
        }

        const itemId = createMondayItem(orderName, targetGroupId);
        updateMondayItem(itemId, columnValues);
        successCount++;
        Logger.log(`✅ Successfully processed row ${idx + 1}: Order ${orderName}, Customer ${patient}, Nurse ${nurseName}`);

      } catch (e) {
        errorCount++;
        Logger.log(`❌ Error processing row ${idx + 1}: ${e.message}`);
      }
    });

    Logger.log(`\n📊 Sync Summary:`);
    Logger.log(`✅ Successful: ${successCount}`);
    Logger.log(`❌ Errors: ${errorCount}`);
    Logger.log(`📈 Total processed: ${rows.length}`);
  } catch (e) {
    Logger.log(`❌ Fatal error in syncSheetToMonday: ${e.message}`);
    throw e;
  }
}

/***** NEW FUNCTION: Age Validation and Cleaning *****/
function validateAndCleanAge(rawAge, patientName, rowNumber) {
  if (!rawAge || rawAge === 'ללא מידע') {
    Logger.log(`Row ${rowNumber}: No age data for patient "${patientName}"`);
    return 0;
  }
  
  const age = parseNumber(rawAge);
  
  // Log the original age for debugging
  Logger.log(`Row ${rowNumber}: Patient "${patientName}" - Original age: ${rawAge} (parsed: ${age})`);
  
  // Validate age range
  if (age < MIN_VALID_AGE) {
    Logger.log(`⚠️ Row ${rowNumber}: Age ${age} is below minimum (${MIN_VALID_AGE}) for patient "${patientName}" - setting to 0`);
    return 0;
  }
  
  if (age > MAX_VALID_AGE) {
    Logger.log(`⚠️ Row ${rowNumber}: Age ${age} is above maximum (${MAX_VALID_AGE}) for patient "${patientName}" - setting to 0`);
    return 0;
  }
  
  // Special handling for suspicious age of 1
  if (age === SUSPICIOUS_AGE) {
    Logger.log(`⚠️ Row ${rowNumber}: Age is ${age} for patient "${patientName}" - this might be an infant or data error`);
    Logger.log(`   Keeping age as ${age} but please verify this is correct`);
  }
  
  // Log successful validation
  if (age > 0) {
    Logger.log(`✅ Row ${rowNumber}: Valid age ${age} for patient "${patientName}"`);
  }
  
  return age;
}

/***** NEW FUNCTION: Calculate Hebrew Weekday *****/
function calculateHebrewWeekday(dateValue) {
  if (!dateValue || dateValue === 'ללא מידע') return '';
  
  try {
    let date;
    
    // Handle different date formats
    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'string') {
      // Try to parse DD/MM/YYYY format
      const match = dateValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // Month is 0-indexed
        const year = parseInt(match[3], 10);
        date = new Date(year, month, day);
      } else {
        // Try native date parsing
        date = new Date(dateValue);
      }
    } else if (typeof dateValue === 'number') {
      date = new Date(dateValue);
    } else {
      return '';
    }
    
    if (isNaN(date.getTime())) {
      Logger.log(`Could not parse date for weekday calculation: ${dateValue}`);
      return '';
    }
    
    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = date.getDay();
    
    // Convert to Hebrew weekday labels
    const hebrewWeekdays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
    const hebrewWeekday = hebrewWeekdays[dayOfWeek];
    
    Logger.log(`Calculated weekday for ${dateValue}: ${hebrewWeekday} (day ${dayOfWeek})`);
    return hebrewWeekday;
    
  } catch (e) {
    Logger.log(`Error calculating weekday for ${dateValue}: ${e.message}`);
    return '';
  }
}

/***** MONDAY HELPERS *****/
function graphql(query) {
  const url = 'https://api.monday.com/v2';
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: MONDAY_API_KEY },
    payload: JSON.stringify({ query }),
    muteHttpExceptions: true,
  };
  const res  = UrlFetchApp.fetch(url, options);
  const body = res.getContentText();
  const code = res.getResponseCode();
  if (code !== 200) throw new Error(`HTTP ${code}: ${body}`);
  const parsed = JSON.parse(body);
  if (parsed.errors) throw new Error(`GraphQL error: ${JSON.stringify(parsed.errors)}`);
  return parsed.data;
}

function getBoardItems(boardId) {
  try {
    Logger.log(`Fetching items for board ${boardId}...`);
    const data = graphql(`
      query {
        boards(ids: ${boardId}) {
          items_page(limit: 100) {
            items { id name column_values { id text } }
          }
        }
      }
    `);
    const items = (((data||{}).boards||[])[0]||{}).items_page?.items || [];
    Logger.log(`Found ${items.length} items in board ${boardId}`);
    return items;
  } catch (e) {
    Logger.log('getBoardItems: ' + e.message);
    return [];
  }
}

function getGroupIdOrThrow(boardId, groupTitle) {
  const data = graphql(`
    query {
      boards(ids: ${boardId}) {
        id
        name
        groups { id title }
      }
    }
  `);
  const board = (data.boards || [])[0];
  if (!board) throw new Error(`Board ${boardId} not found`);
  const grp = (board.groups || []).find(g => g.title === groupTitle);
  if (!grp) {
    const titles = (board.groups || []).map(g => g.title).join(', ');
    throw new Error(`Group "${groupTitle}" not found on board "${board.name}". Available: [${titles}]`);
  }
  return grp.id; // e.g., "new_group12345"
}

function findItemIdByName(items, name) {
  if (!Array.isArray(items) || !name) return null;
  const cleanName = String(name).trim();
  if (!cleanName) return null;
  const item = items.find(i => i.name && i.name.trim() === cleanName);
  return item ? item.id : null;
}

function createMondayItem(itemName, groupId) {
  const mutation = `
    mutation {
      create_item(board_id: ${BOARD_ID}, group_id: "${groupId}", item_name: "${escapeQuotes(itemName)}") { id }
    }
  `;
  Logger.log(`Creating item in group "${groupId}": ${itemName}`);
  const data = graphql(mutation);
  const itemId = data.create_item?.id;
  if (!itemId) throw new Error('Failed to create item');
  Logger.log(`✅ Created item with ID: ${itemId}`);
  return itemId;
}

function updateMondayItem(itemId, columnValues) {
  const mutation = `
    mutation {
      change_multiple_column_values(
        item_id: ${itemId},
        board_id: ${BOARD_ID},
        column_values: "${escapeJson(columnValues)}"
      ) { id }
    }
  `;
  Logger.log(`Updating item ${itemId} with values: ${JSON.stringify(columnValues)}`);
  const data = graphql(mutation);
  if (!data.change_multiple_column_values?.id) {
    throw new Error('Failed to update item');
  }
  Logger.log(`✅ Successfully updated item ${itemId}`);
}

function deleteMondayItem(itemId) {
  try {
    const mutation = `
      mutation { delete_item (item_id: ${itemId}) { id } }
    `;
    Logger.log(`Deleting item ID: ${itemId}`);
    graphql(mutation);
  } catch (e) {
    Logger.log(`❌ Error deleting item ${itemId}: ${e.message}`);
  }
}

/***** PARSERS & UTILS *****/
function formatDate(val) {
  if (!val || val === 'ללא מידע') return '';
  if (val instanceof Date) return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');

  if (typeof val === 'string') {
    // Try ISO or native parse
    let d = new Date(val);
    if (!isNaN(d)) return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');

    // DD/MM/YYYY
    const m1 = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/);
    if (m1) {
      const day = parseInt(m1[1],10);
      const mon = parseInt(m1[2],10)-1;
      const yr  = parseInt(m1[3],10);
      d = new Date(yr, mon, day);
      if (!isNaN(d)) return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    }

    // MM/DD/YYYY
    const m2 = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/);
    if (m2) {
      const mon = parseInt(m2[1],10)-1;
      const day = parseInt(m2[2],10);
      const yr  = parseInt(m2[3],10);
      d = new Date(yr, mon, day);
      if (!isNaN(d)) return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    }
  }

  if (typeof val === 'number') {
    const d = new Date(val);
    if (!isNaN(d)) return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  Logger.log(`Could not parse date: ${val} (type: ${typeof val})`);
  return '';
}

// NEW FUNCTION: Format date and time together
function formatDateTime(val) {
  if (!val || val === 'ללא מידע') return '';
  if (val instanceof Date) return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');

  if (typeof val === 'string') {
    // Try ISO or native parse
    let d = new Date(val);
    if (!isNaN(d)) return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');

    // DD/MM/YYYY HH:MM
    const m1 = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::\d{2})?)?$/);
    if (m1) {
      const day = parseInt(m1[1],10);
      const mon = parseInt(m1[2],10)-1;
      const yr  = parseInt(m1[3],10);
      const hour = m1[4] ? parseInt(m1[4],10) : 0;
      const min = m1[5] ? parseInt(m1[5],10) : 0;
      d = new Date(yr, mon, day, hour, min);
      if (!isNaN(d)) return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
    }

    // MM/DD/YYYY HH:MM
    const m2 = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::\d{2})?)?$/);
    if (m2) {
      const mon = parseInt(m2[1],10)-1;
      const day = parseInt(m2[2],10);
      const yr  = parseInt(m2[3],10);
      const hour = m2[4] ? parseInt(m2[4],10) : 0;
      const min = m2[5] ? parseInt(m2[5],10) : 0;
      d = new Date(yr, mon, day, hour, min);
      if (!isNaN(d)) return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
    }
  }

  if (typeof val === 'number') {
    const d = new Date(val);
    if (!isNaN(d)) return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  }

  Logger.log(`Could not parse datetime: ${val} (type: ${typeof val})`);
  return '';
}

function formatTime(val) {
  if (!val || val === 'ללא מידע') return '';

  if (val instanceof Date) return Utilities.formatDate(val, Session.getScriptTimeZone(), 'HH:mm');

  if (typeof val === 'string') {
    // If a time like HH:mm or HH:mm:ss exists in the string, extract it.
    const m = val.match(/(\d{1,2}):(\d{2})(?::\d{2})?/);
    if (m) {
      const hh = ('0' + m[1]).slice(-2);
      const mm = m[2];
      return `${hh}:${mm}`;
    }
    // Try native date parse
    const d = new Date(val);
    if (!isNaN(d)) return Utilities.formatDate(d, Session.getScriptTimeZone(), 'HH:mm');
  }

  if (typeof val === 'number') {
    const d = new Date(val);
    if (!isNaN(d)) return Utilities.formatDate(d, Session.getScriptTimeZone(), 'HH:mm');
  }

  Logger.log(`Could not parse time: ${val} (type: ${typeof val})`);
  return '';
}

function parseNumber(val) {
  if (val === null || val === undefined || val === 'ללא מידע') return 0;
  const cleanVal = val.toString().replace(/[^\d.-]/g, '');
  const n = Number(cleanVal);
  return isNaN(n) ? 0 : n;
}

function escapeQuotes(str) { return str ? str.replace(/"/g, '\\"') : ''; }
function escapeJson(json)  { return JSON.stringify(json).replace(/"/g, '\\"'); }

/***** DIAGNOSTICS *****/
function testMondayConnection() {
  try {
    Logger.log('Testing Monday.com API connection...');
    const customers = getBoardItems(CUSTOMERS_BOARD_ID);
    Logger.log(`✅ Connection successful! Found ${customers.length} customers`);
    return true;
  } catch (e) {
    Logger.log(`❌ Connection failed: ${e.message}`);
    return false;
  }
}

function getBoardSchema() {
  try {
    const data = graphql(`
      query {
        boards(ids: ${BOARD_ID}) {
          id name
          columns { id title type }
        }
      }
    `);
    Logger.log('Board schema: ' + JSON.stringify(data, null, 2));
    return data;
  } catch (e) {
    Logger.log('Error getting board schema: ' + e.message);
    return null;
  }
}

function getBoardGroups() {
  try {
    const data = graphql(`
      query {
        boards(ids: ${BOARD_ID}) {
          id name
          groups { id title }
        }
      }
    `);
    Logger.log('Board groups: ' + JSON.stringify(data, null, 2));
    return data;
  } catch (e) {
    Logger.log('Error getting board groups: ' + e.message);
    return null;
  }
}

