# DevOrbit — Local AI & Ollama Configuration

DevOrbit includes **Orbit AI**, a completely private, on-device AI engineering studio. It allows developers to converse, analyze code, and generate refactoring suggestions with zero cloud leakage.

---

## 1. Zero Cloud Telemetry & Data Privacy Guarantee

- **No Remote Calls**: Orbit AI never connects to OpenAI, Anthropic, Google, or any cloud API for inference.
- **Local Network Boundary**: All inference requests are routed strictly to `http://127.0.0.1:11434` on localhost.
- **Isolated User Context**: Conversations are persisted in local SQLite with user ownership constraints. No telemetry or prompt indexing occurs.

---

## 2. Ollama Installation & Setup

### Step 1: Install Ollama
On Linux:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```
On macOS:
Download and install the native application from [https://ollama.ai](https://ollama.ai).

### Step 2: Download Recommended Coding Models
For fast local code completion and architectural advice, we recommend models from the DeepSeek or Qwen families:

```bash
# Recommended for standard machines (4-8 GB VRAM or 16 GB unified RAM):
ollama run deepseek-coder

# Alternative high-performance coding model:
ollama run qwen2.5-coder
```

### Step 3: Verify Model Availability
```bash
curl -s http://127.0.0.1:11434/api/tags | jq .
```
You should see `deepseek-coder:latest` in the returned models array.

---

## 3. Honest Deterministic Fallback Mode

DevOrbit strictly adheres to honest AI reporting:
- If Ollama is not installed or the daemon is offline, Orbit AI **never fakes an LLM response**.
- Instead, the UI explicitly displays:
  ```text
  ● Offline (Rule Engine Active)
  [Local Ollama is offline. Responses will use the DevOrbit Deterministic Engine.]
  ```
- The deterministic engine provides rule-based code inspection, static analysis tips, and SM-2 problem recommendations without pretending to be a neural network.
- As soon as you run `ollama serve`, DevOrbit's live probe detects the daemon and seamlessly activates streaming neural generation.

---

## 4. Chat Endpoints & API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/ai/status` | GET | Probes Ollama connectivity and reports active engine mode. |
| `/api/v1/ai/models` | GET | Queries `/api/tags` on Ollama to enumerate downloaded models. |
| `/api/v1/ai/chat` | POST | Dispatches a prompt with conversation history. Streams output when supported. |
| `/api/v1/ai/conversations` | GET | Lists all saved conversations for the authenticated user. |
| `/api/v1/ai/conversations/:id` | GET | Retrieves full message history for a specific conversation. |
| `/api/v1/ai/conversations/:id` | PATCH | Renames a conversation title. |
| `/api/v1/ai/conversations/:id` | DELETE | Deletes a conversation and its messages. |
