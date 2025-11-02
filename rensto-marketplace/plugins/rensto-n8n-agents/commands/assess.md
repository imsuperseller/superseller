# Assess Command

## Purpose
Assess and review n8n workflows for quality, performance, and compliance.

## Usage
```
/assess [workflow-id] [assessment-type] [criteria]
```

## Parameters
- **workflow-id**: n8n workflow ID to assess
- **assessment-type**: Type of assessment (quality, performance, security, etc.)
- **criteria**: Specific criteria to evaluate

## Examples
```
/assess GRlA3iuB7A8y8xFJ quality "error handling and data validation"
/assess 12345 performance "execution time and resource usage"
/assess 67890 security "credential management and data protection"
```

## Assessment Types
- **Quality**: Code quality, error handling, documentation
- **Performance**: Execution speed, resource usage, scalability
- **Security**: Credential management, data protection, access control
- **Compliance**: Adherence to best practices and standards
- **Maintainability**: Code clarity, documentation, debugging ease

## Process
1. **Workflow Analysis**: Examine workflow structure and configuration
2. **Criteria Evaluation**: Assess against specific criteria
3. **Issue Identification**: Find problems and improvement opportunities
4. **Recommendation Generation**: Suggest fixes and optimizations
5. **Report Creation**: Document findings and recommendations

## Output
- **Assessment Score**: Overall quality rating
- **Issue List**: Specific problems found
- **Recommendations**: Suggested improvements
- **Priority Matrix**: Issues ranked by importance
- **Action Plan**: Step-by-step improvement plan
