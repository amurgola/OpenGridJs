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
<link rel="stylesheet" href="https://unpkg.com/opengridjs@1.0.0/opengridjs.css.css">
<script src="https://unpkg.com/opengridjs@1.0.0/opengridjs.js"></script>
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
        { columnName: 'name', columnNameDisplay: 'Full Name' },
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
```
You can find a complete usage example here: https://codepen.io/amurgola/pen/RweqdMo

## Todo list
- [X] Click to sort columns
- [ ] Better column size handling
- [X] Ability to auto define headers based on json context
- [ ] Reloadable Data
- [ ] Filter

## License

Opengridjs is released under the MIT License.
