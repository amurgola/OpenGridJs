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
<link rel="stylesheet" href="https://unpkg.com/opengridjs@latest/opengrid.min.css">
<script src="https://unpkg.com/opengridjs@latest/opengrid.min.js"></script>
```
    
## Usage

Include the `opengrid.js` and `opengrid.css` files in your HTML file, then use the below as an example of how to use the grid. The setup object is optional and can be used to customize the grid. The setup object can be used to define the column headers, context menu, and context menu actions.

## Demo
![](https://github.com/amurgola/OpenGridJs/blob/main/Demo.gif)

```javascript
<!DOCTYPE html>
<html lang="en">
    <head>
        <link rel="stylesheet" href="https://unpkg.com/opengridjs/opengrid.css">
        <script src="https://unpkg.com/opengridjs/opengrid.min.js"></script>
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
                        {
                            columnName: "email",
                            columnNameDisplay: "Email",
                            format: function (value) {
                                return "<a href='mailto:" + value + "'>" + value + "</a>";
                            },
                        },
                    ],
                    contextMenuTitle: "Context Title",
                    contextMenuOptions: [
                        {
                            actionName: "Example",
                            actionFunctionName: "exampleRow",
                            className: "example-row",
                        }
                    ],
                };
            
                function loadDemoData() {
                    return fetch("https://lumabyte.com/api/generateMockRandomPeople?count=100")
                        .then((response) => response.json());
                }
            
                var grid = new OpenGrid("grid", loadDemoData, 350, setup, loadMore);
            
                function loadMore() {
                    grid.appendData(loadDemoData);
                }
            
                function exampleRow(row) {
                    alert("Example row " + row.email);
                }
            </script>
        </body>
</html>
```

#### Constructor Parameters
- `className`: The class name of the container where the grid will be rendered.
- `data`: The initial set of data to be displayed. This can be an array of objects or a function returning a promise for asynchronous data loading.
- `gridHeight`: The height of the grid in pixels.
- `setup`: An object containing configurations such as column headers and context menu settings.
- `loadMoreDataFunction`: An optional function that will be called to load more data (useful for implementing infinite scrolling).

#### Setup Object
The setup object allows you to customize the grid's appearance and behavior. It supports the following properties:

- `columnHeaderNames`: An array of objects defining the columns of the grid. Each object can specify columnName, columnNameDisplay, and format (a function to format the cell value).
- `contextMenuTitle`: A string defining the title of the context menu.
- `contextMenuOptions`: An array of objects defining the context menu options. Each option can specify actionName, actionFunctionName, and className.

#### Methods
The setup object allows you to customize the grid's appearance and behavior. It supports the following properties:

- `appendData(data)`: Appends new data to the grid.
- `rerender()`: Rerenders the grid. Useful if the data or configuration changes.
- `reset()`: Resets the grid to its initial state.
- `exportToCSV()`: Exports the current grid data to a CSV file.
- `searchFilter(term)`: Filters the grid data based on the search term.
- `stopLoadingMoreData()`: Stops the grid from calling the loadMoreDataFunction.


You can find a usage example here: https://codepen.io/amurgola/pen/RweqdMo

## Todo list
- [X] Click to sort columns
- [X] Better column size handling
- [X] Ability to auto define headers based on json context
- [X] More options to define exact column width
- [X] Filter
- [X] Sort visualization
- [x] Ability to export to csv
- [X] ~~Color options to control on a row by row level~~ Added formatter
- [X] Ability to dynamically load data
- [X] Reloadable Data
- [X] Render child json data
- [X] Drag to move columns
- [X] Drag to make columns larger

## License

Opengridjs is released under the MIT License.
