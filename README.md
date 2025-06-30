# OpenGridJs

A lightweight, high-performance JavaScript grid framework for modern web applications. OpenGridJs delivers fast, responsive data grids with virtual scrolling, advanced column management, and extensive customization options.

[![npm version](https://img.shields.io/npm/v/opengridjs.svg)](https://www.npmjs.com/package/opengridjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

### Performance & Scalability
- **Virtual Scrolling**: Efficiently handles large datasets by rendering only visible rows
- **Lightweight**: Minimal footprint with no external dependencies
- **Optimized Rendering**: Smart DOM updates for smooth scrolling and interactions

### Column Management
- **Auto-Detection**: Automatically generates columns from data structure
- **Custom Headers**: Define custom column names, display names, and formatting
- **Drag & Drop Reordering**: Intuitive column reordering via drag and drop
- **Resizable Columns**: Interactive column resizing with visual feedback
- **Flexible Widths**: Support for both percentage and pixel-based column sizing

### Data Handling
- **Asynchronous Loading**: Promise-based data loading with loading states
- **Infinite Scrolling**: Load more data automatically as users scroll
- **Dynamic Updates**: Append, filter, and refresh data without full re-renders
- **GUID Generation**: Automatic ID assignment for data items without identifiers

### User Interactions
- **Sorting**: Click-to-sort columns with visual indicators
- **Filtering**: Built-in search and filter capabilities
- **Context Menus**: Configurable right-click context menus
- **CSV Export**: Export grid data to CSV format
- **Row Selection**: Single and multi-row selection support

### Developer Experience
- **TypeScript Ready**: Full TypeScript support with type definitions
- **Modern Browsers**: Compatible with all modern browsers
- **Easy Integration**: Simple API with minimal setup required
- **Extensible**: Flexible configuration and customization options

## 📦 Installation

### NPM
```bash
npm install opengridjs
```

### CDN
```html
<link rel="stylesheet" href="https://unpkg.com/opengridjs@latest/opengrid.min.css">
<script src="https://unpkg.com/opengridjs@latest/opengrid.min.js"></script>
```

### Direct Download
Download the latest release from the [GitHub releases page](https://github.com/amurgola/OpenGridJs/releases).

## 🚀 Quick Start

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="stylesheet" href="https://unpkg.com/opengridjs/opengrid.min.css">
    <script src="https://unpkg.com/opengridjs/opengrid.min.js"></script>
</head>
<body>
    <div id="myGrid"></div>
    
    <script>
        // Sample data
        const sampleData = [
            { id: 1, name: "John Doe", email: "john@example.com", age: 30 },
            { id: 2, name: "Jane Smith", email: "jane@example.com", age: 25 },
            { id: 3, name: "Bob Johnson", email: "bob@example.com", age: 35 }
        ];

        // Initialize grid
        const grid = new OpenGrid("myGrid", sampleData, 400);
    </script>
</body>
</html>
```

## 📊 Demo

![OpenGridJs Demo](https://github.com/amurgola/OpenGridJs/blob/main/Demo.gif)

[Live Demo on CodePen](https://codepen.io/amurgola/pen/RweqdMo)

## 🔧 Configuration

### Constructor Parameters

```javascript
new OpenGrid(containerId, data, height, setup, loadMoreFunction)
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `containerId` | string | ✅ | ID of the container element |
| `data` | Array/Function | ✅ | Initial data or async loading function |
| `height` | number | ✅ | Grid height in pixels |
| `setup` | Object | ❌ | Configuration options |
| `loadMoreFunction` | Function | ❌ | Function for infinite scrolling |

### Setup Object

```javascript
const setup = {
    columnHeaderNames: [
        {
            columnName: "name",
            columnNameDisplay: "Full Name",
            columnWidth: "200px", // Optional: specific width
            format: (value) => value.toUpperCase() // Optional: custom formatter
        }
    ],
    contextMenuTitle: "Actions",
    contextMenuOptions: [
        {
            actionName: "Edit",
            actionFunctionName: "editRow",
            className: "edit-action"
        },
        {
            actionName: "Delete", 
            actionFunctionName: "deleteRow",
            className: "delete-action"
        }
    ]
};
```

#### Column Configuration

| Property | Type | Description |
|----------|------|-------------|
| `columnName` | string | Data field name |
| `columnNameDisplay` | string | Display name in header |
| `columnWidth` | string | CSS width value (e.g., "200px", "20%") |
| `format` | function | Custom formatting function |

#### Context Menu Configuration

| Property | Type | Description |
|----------|------|-------------|
| `actionName` | string | Display text for menu item |
| `actionFunctionName` | string | Global function name to call |
| `className` | string | CSS class for styling |

## 🎯 Advanced Usage

### Asynchronous Data Loading

```javascript
async function loadData() {
    const response = await fetch('/api/data');
    return response.json();
}

const grid = new OpenGrid("myGrid", loadData, 400, setup);
```

### Infinite Scrolling

```javascript
async function loadMoreData() {
    const response = await fetch(`/api/data?page=${currentPage++}`);
    const newData = await response.json();
    grid.appendData(newData);
}

const grid = new OpenGrid("myGrid", loadData, 400, setup, loadMoreData);
```

### Custom Formatting

```javascript
const setup = {
    columnHeaderNames: [
        {
            columnName: "price",
            columnNameDisplay: "Price",
            format: (value) => `$${value.toFixed(2)}`
        },
        {
            columnName: "date",
            columnNameDisplay: "Created",
            format: (value) => new Date(value).toLocaleDateString()
        },
        {
            columnName: "email",
            columnNameDisplay: "Email",
            format: (value) => `<a href="mailto:${value}">${value}</a>`
        }
    ]
};
```

## 🛠️ API Reference

### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `appendData(data)` | Array | Add new data to the grid |
| `rerender()` | none | Force grid re-render |
| `reset()` | none | Reset grid to initial state |
| `exportToCSV()` | none | Download grid data as CSV |
| `searchFilter(term)` | string | Filter data by search term |
| `stopLoadingMoreData()` | none | Disable infinite scrolling |

### Usage Examples

```javascript
// Add new data
grid.appendData([
    { id: 4, name: "Alice Brown", email: "alice@example.com", age: 28 }
]);

// Filter data
grid.searchFilter("john");

// Export to CSV
grid.exportToCSV();

// Reset grid
grid.reset();
```

## 🎨 Styling & Theming

OpenGridJs provides extensive CSS customization options:

```css
/* Custom theme example */
.opengridjs-grid {
    --primary-color: #007bff;
    --background-color: #ffffff;
    --border-color: #dee2e6;
    --hover-color: #f8f9fa;
    --selected-color: #e3f2fd;
}

.opengridjs-grid-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.opengridjs-grid-row:hover {
    background-color: var(--hover-color);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

## 🧪 Testing

OpenGridJs includes comprehensive test coverage:

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🏗️ Development

```bash
# Clone repository
git clone https://github.com/amurgola/OpenGridJs.git
cd OpenGridJs

# Install dependencies
npm install

# Run tests
npm test

# Build minified versions
npm run build
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | ≥ 60 |
| Firefox | ≥ 55 |
| Safari | ≥ 12 |
| Edge | ≥ 79 |

## 📄 License

OpenGridJs is released under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with performance and developer experience in mind
- Inspired by modern data grid requirements
- Community feedback and contributions

---

Made with ❤️ by the OpenGridJs team