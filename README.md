# OpenGridJs
 
Opengrid.js is an open-source lightweight JavaScript grid framework that allows you to create fast and easy-to-use data grids in your web application. It supports virtual scrolling, custom column headers, and context menus.

## Features

- Virtual scrolling for optimized rendering and performance
- Customizable column headers
- Context menus with configurable actions
- Lightweight and easy to integrate
- Compatible with modern browsers

## Installation
## NPM
To install via NPM, use the following command:

```bash 
npm i opengridjs
```

## CDN
To use via CDN, include the following URLs in your HTML file:

```html 
<link rel="stylesheet" href="https://unpkg.com/opengridjs@latest/opengridjs.css">
<script src="https://unpkg.com/opengridjs@latest/opengridjs.js"></script>
```
    
## Usage

First, include the `opengridjs.js` and `opengridjs.css` files in your HTML file.

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Opengridjs Example</title>
    <link rel="stylesheet" href="opengridjs.css">
</head>
<body>
    <div class="grid"></div>
    
    <br/>
    <input type="text" id="filterInput" placeholder="Filter...">
    <button onclick="grid.exportToCSV()">Export Csv</button>
    <script src="opengridjs.js"></script>
    <script>
        // Your script here
    </script>
</body>
</html>
```

Then, initialize the grid with your desired configuration:

```javascript
const data = [
    {id: 1, name: "John Doe", age: 30},
    {id: 2, name: "Jane Doe", age: 28},
    {id: 3, name: "Alice", age: 24},
    // ...
];

const setup = {
    columnHeaderNames: [
        { columnName: 'id' },
        { columnName: 'name', columnNameDisplay: 'Full Name', columnWidth: 200 },
        { columnName: 'age' }
    ],
    contextMenuTitle: "Context Title",
    contextMenuOptions: [
        {
            actionName: "Edit",
            actionFunctionName: "editRow",
            className: "edit-row"
        },
        {
            actionName: "Delete",
            actionFunctionName: "deleteRow",
            className: "delete-row"
        }
    ]
};

const grid = new Opengridjs("grid", data, 350, setup);

// Implement your custom functions like editRow and deleteRow
function editRow(row) {
    // Edit row logic
}

function deleteRow(row) {
    // Delete row logic
}

document.getElementById('filterInput').addEventListener('input', function(event) {
    let searchTerm = event.target.value;
    if(searchTerm) {
        grid.searchFilter(searchTerm);
    } else {
        grid.reset();
    }
});
```
You can find a complete usage example here: https://codepen.io/amurgola/pen/RweqdMo

## Todo list
- [X] Click to sort columns
- [X] Better column size handling
- [X] Ability to auto define headers based on json context
- [X] More options to define exact column width
- [X] Filter
- [X] Sort visualization
- [x] Ability to export to csv
- [ ] Reloadable Data
- [ ] Drag to move columns
- [ ] Drag to make columns larger
- [ ] Color options to control on a row by row level
- [ ] Render child json data
- [ ] Ability to export to excel

## License

Opengridjs is released under the MIT License.
