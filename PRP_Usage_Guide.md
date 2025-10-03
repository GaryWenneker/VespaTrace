# PRP File Generation & Usage in VS Code

## 🚀 Quick Start

### Method 1: Using Snippets (Fastest)
1. Open any `.md` file in VS Code
2. Type one of these snippet prefixes:
   - `prp-story` → Complete user story with acceptance criteria
   - `prp-epic` → Full epic with multiple stories
   - `prp-tech` → Technical/non-functional requirements
   - `prp-section` → Complete PRD section
   - `prp-ac` → Acceptance criteria block

3. Press `Tab` to expand and fill in the placeholders

### Method 2: Using VS Code Tasks
1. Press `Ctrl+Shift+P` (Command Palette)
2. Type "Tasks: Run Task"
3. Select "Generate PRP File"
4. Fill in the prompts:
   - Feature name
   - User type
   - Priority level
5. File will be auto-generated and opened

### Method 3: Using PowerShell Script Directly
```powershell
# Navigate to your project
cd c:\gary\VespaTrace

# Generate a PRP file
.\scripts\Generate-PRP.ps1 -FeatureName "User Login" -UserType "customer" -Priority "High"
```

## 📁 File Organization

```
VespaTrace/
├── requirements/
│   ├── PRD_Template.md          # Master template
│   ├── PRP_User_Login.md        # Generated PRP files
│   └── PRP_Dashboard.md         # More PRP files
├── .vscode/
│   ├── prp-snippets.code-snippets  # Custom snippets
│   ├── tasks.json               # VS Code tasks
│   └── extensions.json          # Recommended extensions
└── scripts/
    └── Generate-PRP.ps1         # PowerShell generator
```

## 🎯 PRP Workflow

### 1. **Initial Creation**
- Use tasks or scripts to generate base PRP file
- Fill in high-level requirements

### 2. **Refinement with Copilot**
Ask me questions like:
- "Help me break down this epic into user stories"
- "Generate acceptance criteria for file upload feature"
- "Create edge cases for user authentication"

### 3. **Integration with Development**
- Link PRP files to code with comments:
  ```javascript
  // Implements: PRP_User_Login.md - FR-001
  function authenticateUser() { ... }
  ```

### 4. **Review and Updates**
- Use VS Code's markdown preview
- Track completion with checkboxes
- Update as requirements evolve

## 🔥 Pro Tips

1. **Use with Copilot Chat**: Ask me to generate specific sections
2. **Link to Issues**: Reference GitHub/Azure DevOps issues in PRPs
3. **Version Control**: Commit PRP files to track requirement evolution
4. **Team Collaboration**: Use VS Code Live Share for collaborative editing
5. **Automation**: Set up GitHub Actions to validate PRP format

## 🛠 Advanced Features

### Custom Snippet Creation
Add your own snippets to `.vscode/prp-snippets.code-snippets`

### Integration with Issue Trackers
Link PRPs to:
- GitHub Issues
- Azure DevOps Work Items  
- Jira Stories

### Automated Validation
Create scripts to validate PRP format and completeness

---

**Next Steps:**
1. Try generating your first PRP file using Method 2
2. Use snippets to add more requirements
3. Ask me to help refine specific sections