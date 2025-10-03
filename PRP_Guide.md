# VespaTrace - PRP Usage Guide

## What are Product Requirement Prompts (PRP)?

PRP is a structured approach to documenting and communicating product requirements using standardized prompt formats. It helps ensure consistency and completeness in requirement gathering.

## How to Use PRP in VS Code

### 1. **With GitHub Copilot Chat**

You can use me (GitHub Copilot) to generate requirements using PRP patterns:

**Example prompts you can use:**
```
Generate a user story for a login feature
Create acceptance criteria for file upload functionality
Write technical requirements for API integration
```

### 2. **PRP Template Patterns**

#### User Story Pattern:
```
As a [user role]
I want [functionality] 
So that [business value]
```

#### Acceptance Criteria Pattern:
```
Given [initial state/context]
When [action is performed]
Then [expected result]
```

#### Technical Requirement Pattern:
```
System shall [requirement]
Performance: [metric]
Constraints: [limitations]
```

### 3. **VS Code Snippets for PRP**

Create custom snippets (File → Preferences → Configure User Snippets):

```json
{
  "User Story": {
    "prefix": "userstory",
    "body": [
      "**As a** ${1:user type}",
      "**I want** ${2:functionality}",
      "**So that** ${3:benefit}",
      "",
      "**Acceptance Criteria:**",
      "- **Given** ${4:context}",
      "- **When** ${5:action}",
      "- **Then** ${6:outcome}"
    ]
  }
}
```

### 4. **Recommended Extensions**

- **Markdown All in One** - For PRP documentation
- **PlantUML** - For requirement diagrams  
- **Azure DevOps** - For work item integration
- **Jira** - For issue tracking integration

### 5. **Example Workflow**

1. **Start with a prompt**: "Create user stories for user authentication"
2. **Refine with chat**: Ask for acceptance criteria, edge cases
3. **Document in markdown**: Use the PRD template
4. **Link to code**: Use comments to reference requirements

## Getting Started

Try asking me questions like:
- "Generate user stories for [your feature]"
- "Create acceptance criteria for [functionality]" 
- "Write technical requirements for [component]"
- "Help me break down [epic] into smaller stories"

The key is to be specific about what you need and I'll help structure it using PRP best practices!