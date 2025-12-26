# How to Get Your Telegram Chat ID

## Method 1: Use @userinfobot (Easiest)

1. Open Telegram
2. Search for `@userinfobot` or `@getidsbot`
3. Start a conversation with the bot
4. Send any message (e.g., `/start`)
5. The bot will reply with your **Chat ID** (a number like `123456789`)

**Example Response:**
```
Your user ID: 123456789
Your chat ID: 123456789
```

## Method 2: Use @getidsbot

1. Open Telegram
2. Search for `@getidsbot`
3. Start a conversation
4. Send `/start`
5. The bot will show your Chat ID

## Method 3: Check Telegram Bot API (For Group Chats)

If you need a **group chat ID**:

1. Add your bot to the group
2. Send a message in the group
3. Call Telegram API: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Look for `"chat":{"id":-123456789}` in the response (negative number = group)

## Method 4: Use n8n Telegram Node

1. In n8n, create a test workflow with a Telegram trigger node
2. Configure it with your bot token
3. Send a message to your bot
4. The execution will show the chat ID in the output data

## Setting Chat ID in n8n Workflow

Once you have your Chat ID:

1. **Option A: Environment Variable** (Recommended)
   - In n8n settings, add environment variable: `TELEGRAM_CHAT_ID=123456789`
   - Use `{{$env.TELEGRAM_CHAT_ID}}` in the Telegram node

2. **Option B: Direct in Node**
   - In the Telegram node, set `chatId` to your Chat ID directly: `123456789`

3. **Option C: Workflow Variable**
   - In workflow settings, add variable: `TELEGRAM_CHAT_ID`
   - Use `{{$workflow.variables.TELEGRAM_CHAT_ID}}` in the node

## For Your Current Workflow

The workflow uses `{{TELEGRAM_CHAT_ID}}` which expects:
- An environment variable named `TELEGRAM_CHAT_ID`, OR
- A workflow variable named `TELEGRAM_CHAT_ID`

**Quick Fix:**
1. Get your Chat ID using Method 1 above
2. In n8n, go to Settings → Environment Variables
3. Add: `TELEGRAM_CHAT_ID` = `your_chat_id_number`
4. Restart n8n or the workflow will pick it up automatically

## Verify It Works

After setting the Chat ID:
1. Send a test lead to the webhook
2. Check Telegram - you should receive the alert message
3. If it still fails, verify:
   - Bot token is correct
   - Chat ID is correct (no spaces, just the number)
   - You've started a conversation with the bot at least once

