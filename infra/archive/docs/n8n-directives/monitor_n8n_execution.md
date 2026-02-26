# Directive: Monitor n8n Execution

## Goal
Track the status, progress, and result of a specific n8n workflow execution.

## Inputs
- **Execution ID**: The numeric or alphanumeric ID of the execution (e.g., `142956`).
- **Instance**: The n8n instance name (default: `superseller`).

## Procedure

### 1. Check Status (Observation)
- **Get Execution Details**: Retrieve the full execution data.
    - Tool: `n8n_get_execution(id=EXECUTION_ID, instance=INSTANCE)`
- **Determine State**:
    - **Running**: Identify the last executed node.
    - **Waiting**: Check what it is waiting for (Webhook, Wait node).
    - **Success**: Identify the final output.
    - **Error**: Identify the error message and the node that failed.

### 2. Live Monitoring (Experiment)
- If the execution is **Running** or **Waiting**:
    - Wait for a short interval (e.g., 5-10 seconds) if doing a live loop, or just report current status if one-off.
    - Re-check status.

### 3. Report (Output)
- Provide a summary of:
    - Current Status (Running/Success/Error)
    - Start Time / Duration
    - Current/Last Node
    - Any errors or warnings.

## Outputs
- **Status Update**: Markdown summary of the execution state.
