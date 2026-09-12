# UtilityHub - Enterprise Engineering & Data Platform

[![Deploy to GitHub Pages](https://github.com/SoumyaSrd007/helper/actions/workflows/deploy.yml/badge.svg)](https://github.com/SoumyaSrd007/helper/actions/workflows/deploy.yml)

🌐 **Live Application URL**: [https://soumyasrd007.github.io/helper/](https://soumyasrd007.github.io/helper/)

A high-performance web platform for engineers, data analysts, QA teams, and developers featuring large-scale spreadsheet virtualization, data manipulation, SQL query generation, and API tooling.

---

## 🚀 Key Features

### 📊 Excel Tabular Viewer & Multi-Sheet Studio
- **100,000+ (1 Lakh+) Record Virtual Scrolling**: Native 60fps virtualization window rendering that seamlessly scrolls through massive datasets without browser lag or DOM overload.
- **Dynamic Multi-Sheet Tabs**: Automatically extracts all sheets from uploaded `.xlsx`, `.xls`, or `.csv` workbooks, rendering interactive tabs with per-sheet row counts and empty column indicators.
- **Intelligent Null Column Remover**: Detects columns where 100% of cells are empty, null, undefined, or blank whitespace. Provides a 1-click toggle to hide empty columns in the table view.
- **Multiple Download Capabilities**:
  - 📥 **Cleaned Excel (.xlsx)**: Strips all-null columns from the active sheet.
  - 📥 **Cleaned Full Workbook (.xlsx)**: Preserves all workbook tabs while removing empty columns across each individual sheet.
  - 📥 **Cleaned CSV (.csv)**: Export current sheet as CSV without null columns.
  - 📥 **Cleaned JSON (.json)**: Export as JSON array of objects omitting empty properties.
  - 📥 **Filtered Rows Only**: Export only the rows matching search filters.
  - 📥 **Raw / Original Exports**: Unmodified exports with all original columns intact.
- **Interactive Tools**: Global multi-column search, column sorting, schema drawer with data type detection & fill rates, jump-to-row navigation, and cell inspection modal.
- **Demo Dataset**: 1-click generation of a 100,000-row multi-sheet demo workbook with empty columns to test immediately.

### 🛠️ Additional Built-in Utilities
- **Column Extractor**: Extract comma-separated strings/numbers or isolate specific column subsets.
- **Duplicate Remover**: Identify and eliminate duplicate records with configurable column keys.
- **Excel Spreadsheet Compare**: Diff two workbooks and highlight added, modified, or deleted rows.
- **CSV to JSON Converter**: Convert tabular files into clean nested or flat JSON.
- **SQL Generators**: IN-clause builder, Bulk INSERT generator, and UPDATE statement generator.
- **Text & API Tools**: JSON formatter, Regex tester, Base64 encoder/decoder, JWT inspector, cURL generator, Swagger OpenAPI viewer.

---

## 💻 Tech Stack
- **Framework**: React 19 + TypeScript + Vite 8
- **UI & Icons**: Material UI v9 (`@mui/material`), Material Icons (`@mui/icons-material`)
- **Styling**: SCSS Design System with theme switching
- **Data Engine**: XLSX (`xlsx`), FileSaver (`file-saver`)
- **State Management**: Redux Toolkit
- **CI/CD & Hosting**: GitHub Actions + GitHub Pages

---

## 🛠️ Local Development

```bash
# Clone repository
git clone https://github.com/SoumyaSrd007/helper.git
cd helper

# Install dependencies
npm install

# Start local development server
npm run dev

# Run unit tests
npm test

# Build for production
npm run build
```
