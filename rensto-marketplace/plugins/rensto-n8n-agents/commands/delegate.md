# Delegate Command

## Purpose
Delegate workflow implementation tasks to specialized agents.

## Usage
```
/delegate [task] [agent] [parameters]
```

## Parameters
- **task**: Specific task to delegate (build, test, deploy, etc.)
- **agent**: Which agent to use (architect, implementation, debug)
- **parameters**: Task-specific parameters

## Examples
```
/delegate build implementation "lead-gen workflow for tax4us"
/delegate test debug "workflow ID GRlA3iuB7A8y8xFJ"
/delegate deploy implementation "stripe integration to rensto vps"
```

## Available Agents
- **architect**: Design workflow architecture
- **implementation**: Build and configure workflows
- **debug**: Diagnose and fix issues

## Process
1. **Task Analysis**: Understand what needs to be done
2. **Agent Selection**: Choose the appropriate specialist
3. **Parameter Setup**: Configure task parameters
4. **Execution**: Run the delegated task
5. **Validation**: Verify task completion
6. **Reporting**: Provide status and results

## Output
- **Task Status**: Current progress and completion status
- **Results**: What was accomplished
- **Issues**: Any problems encountered
- **Next Steps**: Recommended follow-up actions
- **Documentation**: Updated workflow documentation
