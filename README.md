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

Include the `opengridjs.js` and `opengridjs.css` files in your HTML file, then use the below as an example of how to use the grid. The setup object is optional and can be used to customize the grid. The setup object can be used to define the column headers, context menu, and context menu actions.

```javascript
<!DOCTYPE html>
<html lang="en">
    <head>
        <link rel="stylesheet" href="https://unpkg.com/opengridjs/opengridjs.css">
        <script src="https://unpkg.com/opengridjs/opengridjs.js"></script>
    </head>
    <body>
        <div class="grid"></div>
        <script>
            const setup = {
                columnHeaderNames: [
                    {
                        columnName: "name",
                        columnNameDisplay: "Full Name",
                    },
                    { columnName: "phoneNumber" },
                ],
                contextMenuTitle: "Context Title",
                contextMenuOptions: [
                    {
                        actionName: "Example",
                        actionFunctionName: "exampleRow",
                        className: "example-row",
                    },
                ],
            };
    
            fetch("https://lumabyte.com/api/generateMockRandomPeople?count=1000")
                .then((response) => response.json())
                .then((data) => {
                    initGrid(data);
            });
    
            function initGrid(data) {
                var grid = new Opengridjs("grid", data, 350, setup);
            }
    
            function exampleRow(row) {
                alert("Example row " + row.email);
            }
        </script>
    </body>
</html>
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
- [X] ~~Color options to control on a row by row level~~ Added formatter
- [ ] Reloadable Data
- [ ] Drag to move columns
- [ ] Drag to make columns larger
- [ ] Render child json data
- [ ] Ability to export to excel

## License

Opengridjs is released under the MIT License.
