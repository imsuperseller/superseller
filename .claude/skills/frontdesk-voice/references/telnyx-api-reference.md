# Telnyx API Reference (Level 2)

> Loaded when working on assistant config, API calls, or voice/model selection.
> For critical rules and architecture, see SKILL.md (Level 1).

## API Patterns

### Update Assistant
```bash
curl -X PATCH -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"instructions":"...","greeting":"...","model":"meta-llama/Llama-3.3-70B-Instruct"}' \
  "https://api.telnyx.com/v2/ai/assistants/assistant-f2838322-edfa-4c22-9997-ca53b151175f"
```

### Make Outbound Call
```bash
curl -X POST -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"From":"+14699299314","To":"+14695885133","AIAssistantId":"assistant-f2838322-edfa-4c22-9997-ca53b151175f"}' \
  "https://api.telnyx.com/v2/texml/ai_calls/2860769989730764458"
```

### List Conversations (use Python — curl breaks on `page[size]` brackets)
```python
import urllib.request, json
headers = {'Authorization': 'Bearer <TELNYX_API_KEY>'}
req = urllib.request.Request('https://api.telnyx.com/v2/ai/conversations?page%5Bsize%5D=50', headers=headers)
resp = urllib.request.urlopen(req)
data = json.loads(resp.read().decode())
```

### Get Conversation Messages
```
GET /v2/ai/conversations/{id}/messages
```
Returns: `{data: [{role, text, tool_calls, created_at, sent_at}...], meta: {total_results}}`

## Available Telnyx Tool Types
| Type | Purpose | Notes |
|------|---------|-------|
| `transfer` | Route calls to humans | Requires `from`, `targets[].to`, supports warm transfer |
| `hangup` | End calls | **Don't use** — too aggressive |
| `webhook` | Call external APIs | For web research, CRM integration |
| `handoff` | Multi-assistant routing | `unified` or `distinct` voice modes |
| `send_message` | Send SMS during call | |
| `retrieval` | RAG from Telnyx Cloud Storage | Upload docs to buckets |
| `send_dtmf` | IVR interaction | |
| `skip_turn` | Defer response | |
| `refer` | SIP referral | |

## Available Models (Telnyx-hosted)
`meta-llama/Llama-3.3-70B-Instruct`, `Qwen/Qwen3-235B-A22B`, `deepseek-ai/DeepSeek-R1`, `anthropic/claude-sonnet-4-20250514`, `anthropic/claude-haiku-4-5`, `google/gemini-2.5-flash`, `openai/gpt-4`, and more.

## Available Voices
- **KokoroTTS** (recommended): `Telnyx.KokoroTTS.af_heart`, `af`, etc. — fast, multilingual
- **Natural**: `Telnyx.Natural.abbie`, etc. — better pronunciation
- **NaturalHD**: `Telnyx.NaturalHD.*` — **BROKEN, causes silent failure**
- **Third-party**: ElevenLabs (needs api_key_ref), AWS Polly, Azure Neural, MiniMax, ResembleAI

## Conversation Data Structure
```typescript
interface TelnyxConversation {
    id: string;
    name: string; // "Voice Assistant Conversation"
    created_at: string;
    last_message_at: string | null; // null = AI never spoke
    number_of_messages: number; // counts user msgs only
    metadata: {
        to?: string; // called number
        from?: string; // caller number
        assistant_id?: string;
        call_control_id?: string;
        telnyx_end_user_target?: string; // caller
        telnyx_agent_target?: string; // AI number
        telnyx_conversation_channel?: string; // "phone_call"
        assistant_version_id?: string;
    } | null;
}
```
