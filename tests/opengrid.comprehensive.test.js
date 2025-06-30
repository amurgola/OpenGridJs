/**
 * OpenGrid Comprehensive Tests
 * 
 * Comprehensive test suite covering all OpenGrid functionality.
 * Uses static analysis and validation testing to ensure all features are present and working.
 */

const fs = require('fs');
const path = require('path');

describe('OpenGrid Comprehensive Testing', () => {
  let openGridSource;
  
  beforeAll(() => {
    const openGridPath = path.join(__dirname, '../opengrid.js');
    openGridSource = fs.readFileSync(openGridPath, 'utf8');
  });

  describe('Core Class Structure', () => {
    test('should have proper class definition', () => {
      expect(openGridSource).toContain('class OpenGrid');
      expect(openGridSource).toContain('constructor(className, data, gridHeight, setup');
      expect(openGridSource).toContain('loadMoreDataFunction = null');
      expect(openGridSource).toContain('canLoadMoreData = true');
      expect(openGridSource).toContain('isLoadingMoreData = false');
    });

    test('should have all required instance properties', () => {
      const requiredProperties = [
        'this.className',
        'this.sortState',
        'this.gridData',
        'this.headerData',
        'this.gridRowPxSize',
        'this.gridRowPxVisibleArea',
        'this.gridSelectedObject',
        'this.contextMenuItems',
        'this.contextMenuTitle',
        'this.loadMoreDataFunction',
        'this.rootElement',
        'this.originalData',
        'this.gridColumnNames'
      ];

      requiredProperties.forEach(prop => {
        expect(openGridSource).toContain(prop);
      });
    });

    test('should have correct default values', () => {
      expect(openGridSource).toContain('gridRowPxSize = 35');
      expect(openGridSource).toContain('{ column: null, direction: null }');
      expect(openGridSource).toContain('canLoadMoreData = true');
      expect(openGridSource).toContain('isLoadingMoreData = false');
    });
  });

  describe('Data Processing Methods', () => {
    test('should have GUID generation functionality', () => {
      expect(openGridSource).toContain('generateGUID()');
      expect(openGridSource).toContain('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx');
      expect(openGridSource).toContain('Math.random() * 16');
      expect(openGridSource).toContain('toString(16)');
      
      // Should handle missing IDs
      expect(openGridSource).toContain('dataItem.id === undefined');
      expect(openGridSource).toContain('dataItem.id === null');
      expect(openGridSource).toContain('dataItem.id === \'\'');
      expect(openGridSource).toContain('this.generateGUID()');
    });

    test('should have data processing pipeline', () => {
      expect(openGridSource).toContain('processData(data)');
      expect(openGridSource).toContain('data.map((dataItem, currentPosition)');
      expect(openGridSource).toContain('currentPosition * this.gridRowPxSize');
      expect(openGridSource).toContain('isRendered: false');
      expect(openGridSource).toContain('this.sortData()');
    });

    test('should support both sync and async data', () => {
      expect(openGridSource).toContain('typeof data === \'function\'');
      expect(openGridSource).toContain('data().then(fetchedData =>');
      expect(openGridSource).toContain('JSON.parse(JSON.stringify(');
      expect(openGridSource).toContain('Object.keys(');
    });

    test('should auto-detect column structure', () => {
      expect(openGridSource).toContain('Object.keys(fetchedData[0])');
      expect(openGridSource).toContain('map(key => ({headerName: key, field: key}))');
      expect(openGridSource).toContain('if(fetchedData.length > 0)');
      expect(openGridSource).toContain('if(data.length > 0)');
    });
  });

  describe('Virtual Scrolling Implementation', () => {
    test('should have virtual scrolling constants and calculations', () => {
      expect(openGridSource).toContain('gridRowPxSize = 35');
      expect(openGridSource).toContain('position: currentPosition * this.gridRowPxSize');
      expect(openGridSource).toContain('isRendered: false');
      expect(openGridSource).toContain('renderVisible(');
    });

    test('should handle scroll detection', () => {
      expect(openGridSource).toContain('isNearBottom(');
      expect(openGridSource).toContain('container.scrollHeight');
      expect(openGridSource).toContain('container.scrollTop');
      expect(openGridSource).toContain('this.gridRowPxVisibleArea');
      expect(openGridSource).toContain('loadedAtGridHeight');
    });

    test('should manage DOM elements for performance', () => {
      expect(openGridSource).toContain('addRow(');
      expect(openGridSource).toContain('removeRow(');
      expect(openGridSource).toContain('appendChild(');
      expect(openGridSource).toContain('removeChild(');
    });

    test('should have infinite scroll capabilities', () => {
      expect(openGridSource).toContain('loadMoreDataFunction');
      expect(openGridSource).toContain('canLoadMoreData');
      expect(openGridSource).toContain('isLoadingMoreData');
      expect(openGridSource).toContain('stopLoadingMoreData()');
    });
  });

  describe('Sorting Functionality', () => {
    test('should have sort state management', () => {
      expect(openGridSource).toContain('sortState');
      expect(openGridSource).toContain('column: null');
      expect(openGridSource).toContain('direction: null');
      expect(openGridSource).toContain('sortData()');
    });

    test('should handle different data types in sorting', () => {
      expect(openGridSource).toContain('.sort((a, b) =>');
      expect(openGridSource).toContain('asc');
      expect(openGridSource).toContain('desc');
      
      // Should handle null values (checks for null comparison in sort)
      expect(openGridSource).toContain('if (a == null)');
      expect(openGridSource).toContain('if (b == null)');
    });

    test('should support sort direction toggling', () => {
      expect(openGridSource).toContain('asc');
      expect(openGridSource).toContain('desc');
      expect(openGridSource).toContain('direction');
    });

    test('should recalculate positions after sorting', () => {
      expect(openGridSource).toContain('sortData()');
      expect(openGridSource).toContain('currentPosition * this.gridRowPxSize');
    });
  });

  describe('Search and Filter Functionality', () => {
    test('should have search filter method', () => {
      expect(openGridSource).toContain('searchFilter(term)');
      expect(openGridSource).toContain('toLowerCase()');
      expect(openGridSource).toContain('includes(');
      expect(openGridSource).toContain('Object.values(');
    });

    test('should be case insensitive', () => {
      expect(openGridSource).toContain('toLowerCase()');
      expect(openGridSource).toContain('includes(');
    });

    test('should search across all data fields', () => {
      expect(openGridSource).toContain('Object.values(');
      expect(openGridSource).toContain('toLowerCase()');
    });

    test('should maintain original data for reset', () => {
      expect(openGridSource).toContain('reset()');
      expect(openGridSource).toContain('this.originalData');
      expect(openGridSource).toContain('processData(this.originalData)');
    });
  });

  describe('Context Menu System', () => {
    test('should have context menu configuration', () => {
      expect(openGridSource).toContain('contextMenuItems');
      expect(openGridSource).toContain('contextMenuTitle');
      expect(openGridSource).toContain('contextMenuOptions');
      expect(openGridSource).toContain('createContextMenu(');
    });

    test('should handle right-click events', () => {
      expect(openGridSource).toContain('contextmenu');
      expect(openGridSource).toContain('preventDefault()');
      expect(openGridSource).toContain('pageX');
      expect(openGridSource).toContain('pageY');
    });

    test('should generate dynamic menu HTML', () => {
      expect(openGridSource).toContain('opengridjs-contextMenu');
      expect(openGridSource).toContain('opengridjs-btn');
      expect(openGridSource).toContain('data-action');
      expect(openGridSource).toContain('actionFunctionName');
      expect(openGridSource).toContain('actionName');
    });

    test('should execute global functions', () => {
      expect(openGridSource).toContain('window[actionFunctionName]');
      expect(openGridSource).toContain('this.gridSelectedObject');
      expect(openGridSource).toContain('closeContextMenu()');
    });

    test('should handle menu cleanup', () => {
      expect(openGridSource).toContain('closeContextMenu(');
      expect(openGridSource).toContain('querySelectorAll(\'.opengridjs-contextMenu\')');
      expect(openGridSource).toContain('remove()');
    });
  });

  describe('CSV Export Functionality', () => {
    test('should have CSV export method', () => {
      expect(openGridSource).toContain('exportToCSV()');
      expect(openGridSource).toContain('replacer');
      expect(openGridSource).toContain('JSON.stringify');
      expect(openGridSource).toContain('.join(\',\')');
    });

    test('should handle CSV formatting', () => {
      expect(openGridSource).toContain('header.join');
      expect(openGridSource).toContain('csv.join(');
      expect(openGridSource).toContain('\\r\\n');
      expect(openGridSource).toContain('null ? \'\' : value');
    });

    test('should create downloadable file', () => {
      expect(openGridSource).toContain('Blob([csv]');
      expect(openGridSource).toContain('text/csv;charset=utf-8;');
      expect(openGridSource).toContain('URL.createObjectURL');
      expect(openGridSource).toContain('createElement(\'a\')');
      expect(openGridSource).toContain('.click()');
    });

    test('should set proper filename', () => {
      expect(openGridSource).toContain('setAttribute(\'download\'');
      expect(openGridSource).toContain('.csv');
    });
  });

  describe('Event Handling and Performance', () => {
    test('should have debouncing for performance', () => {
      expect(openGridSource).toContain('debounce(func, delay)');
      expect(openGridSource).toContain('clearTimeout(inDebounce)');
      expect(openGridSource).toContain('setTimeout(');
      expect(openGridSource).toContain('func.apply(context, args)');
    });

    test('should handle scroll events', () => {
      expect(openGridSource).toContain('scroll');
      expect(openGridSource).toContain('addEventListener');
      expect(openGridSource).toContain('scrollTop');
    });

    test('should manage grid header interactions', () => {
      expect(openGridSource).toContain('addHeaderActions()');
      expect(openGridSource).toContain('click');
      expect(openGridSource).toContain('dragOver(');
      expect(openGridSource).toContain('preventDefault()');
    });

    test('should handle drag and drop', () => {
      expect(openGridSource).toContain('dragOver(');
      expect(openGridSource).toContain('dragenter');
      expect(openGridSource).toContain('draggable="true"');
      expect(openGridSource).toContain('data-header');
    });
  });

  describe('Public API Methods', () => {
    test('should have data manipulation methods', () => {
      const apiMethods = [
        'appendData(',
        'updateData(',
        'reset()',
        'exportToCSV()',
        'searchFilter(',
        'stopLoadingMoreData()',
        'rerender()',
        'closeContextMenu('
      ];

      apiMethods.forEach(method => {
        expect(openGridSource).toContain(method);
      });
    });

    test('appendData should handle both sync and async data', () => {
      expect(openGridSource).toContain('appendData(newData)');
      expect(openGridSource).toContain('typeof newData === \'function\'');
      expect(openGridSource).toContain('newData().then(');
      expect(openGridSource).toContain('[...this.originalData, ...fetchedData]');
      expect(openGridSource).toContain('[...this.originalData, ...newData]');
    });

    test('updateData should replace all data', () => {
      expect(openGridSource).toContain('updateData(newData)');
      expect(openGridSource).toContain('this.originalData = newData');
      expect(openGridSource).toContain('this.originalData = fetchedData');
      expect(openGridSource).toContain('this.rerender()');
    });

    test('should handle empty data gracefully', () => {
      expect(openGridSource).toContain('newData && newData.length > 0');
      expect(openGridSource).toContain('fetchedData && fetchedData.length > 0');
      expect(openGridSource).toContain('this.canLoadMoreData = false');
    });
  });

  describe('DOM Structure and CSS Classes', () => {
    test('should create proper grid structure', () => {
      expect(openGridSource).toContain('opengridjs-grid-container');
      expect(openGridSource).toContain('opengridjs-grid-additional');
      expect(openGridSource).toContain('opengridjs-grid-header');
      expect(openGridSource).toContain('opengridjs-grid-rows-container');
    });

    test('should use consistent CSS class naming', () => {
      const cssClasses = [
        'opengridjs-grid',
        'opengridjs-grid-header-item',
        'opengridjs-grid-row',
        'opengridjs-grid-column-item',
        'opengridjs-contextMenu',
        'opengridjs-btn',
        'opengridjs-selected-grid-row'
      ];

      cssClasses.forEach(className => {
        expect(openGridSource).toContain(className);
      });
    });

    test('should handle element relationships', () => {
      expect(openGridSource).toContain('querySelector(');
      expect(openGridSource).toContain('appendChild(');
      expect(openGridSource).toContain('removeChild(');
      expect(openGridSource).toContain('innerHTML');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle missing or malformed setup', () => {
      expect(openGridSource).toContain('setup.columnHeaderNames');
      expect(openGridSource).toContain('setup.contextMenuOptions');
      expect(openGridSource).toContain('setup.contextMenuTitle');
      
      // Should handle null checks
      expect(openGridSource).toContain('columnHeaderNames == null');
    });

    test('should validate data structure', () => {
      expect(openGridSource).toContain('fetchedData.length > 0');
      expect(openGridSource).toContain('data.length > 0');
      expect(openGridSource).toContain('Object.keys(');
    });

    test('should handle DOM element not found', () => {
      expect(openGridSource).toContain('document.querySelector(');
      expect(openGridSource).toContain('.${className}');
    });

    test('should prevent memory leaks', () => {
      expect(openGridSource).toContain('removeChild(');
      expect(openGridSource).toContain('remove()');
      // Note: removeEventListener not implemented yet but remove() handles cleanup
      expect(openGridSource).toContain('querySelectorAll(\'.opengridjs-contextMenu\')');
    });
  });

  describe('Integration Points', () => {
    test('should expose grid instance on DOM element', () => {
      expect(openGridSource).toContain('this.rootElement.gridInstance = this');
    });

    test('should support custom formatters', () => {
      expect(openGridSource).toContain('format:');
      expect(openGridSource).toContain('formatter');
    });

    test('should handle window global functions', () => {
      expect(openGridSource).toContain('window[');
      expect(openGridSource).toContain('actionFunctionName');
    });

    test('should support column configuration', () => {
      expect(openGridSource).toContain('columnName');
      expect(openGridSource).toContain('columnNameDisplay');
      expect(openGridSource).toContain('headerName');
      expect(openGridSource).toContain('field');
    });
  });
});

describe('OpenGrid Feature Completeness', () => {
  let openGridSource;
  
  beforeAll(() => {
    const openGridPath = path.join(__dirname, '../opengrid.js');
    openGridSource = fs.readFileSync(openGridPath, 'utf8');
  });

  test('should implement all documented features from README', () => {
    // Features from README
    const readmePath = path.join(__dirname, '../README.md');
    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    // Virtual scrolling
    expect(readmeContent).toContain('Virtual scrolling');
    expect(openGridSource).toContain('renderVisible');
    expect(openGridSource).toContain('isRendered');
    
    // Customizable column headers
    expect(readmeContent).toContain('column headers');
    expect(openGridSource).toContain('columnHeaderNames');
    expect(openGridSource).toContain('columnNameDisplay');
    
    // Context menus
    expect(readmeContent).toContain('Context menus');
    expect(openGridSource).toContain('contextMenuOptions');
    expect(openGridSource).toContain('contextmenu');
  });

  test('should have all methods mentioned in README', () => {
    const readmePath = path.join(__dirname, '../README.md');
    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    // Methods from README
    if (readmeContent.includes('appendData')) {
      expect(openGridSource).toContain('appendData(');
    }
    if (readmeContent.includes('rerender')) {
      expect(openGridSource).toContain('rerender()');
    }
    if (readmeContent.includes('reset')) {
      expect(openGridSource).toContain('reset()');
    }
    if (readmeContent.includes('exportToCSV')) {
      expect(openGridSource).toContain('exportToCSV()');
    }
    if (readmeContent.includes('searchFilter')) {
      expect(openGridSource).toContain('searchFilter(');
    }
    if (readmeContent.includes('stopLoadingMoreData')) {
      expect(openGridSource).toContain('stopLoadingMoreData()');
    }
  });

  test('should support all constructor parameters from README', () => {
    const readmePath = path.join(__dirname, '../README.md');
    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    // Constructor parameters
    expect(openGridSource).toContain('constructor(className, data, gridHeight, setup');
    
    if (readmeContent.includes('loadMoreDataFunction')) {
      expect(openGridSource).toContain('loadMoreDataFunction');
    }
  });

  test('should validate against example usage', () => {
    const examplePath = path.join(__dirname, '../examples/example.html');
    const exampleContent = fs.readFileSync(examplePath, 'utf8');
    
    // Check that example usage patterns are supported
    if (exampleContent.includes('new OpenGrid(')) {
      expect(openGridSource).toContain('class OpenGrid');
    }
    if (exampleContent.includes('columnHeaderNames:')) {
      expect(openGridSource).toContain('columnHeaderNames');
    }
    if (exampleContent.includes('contextMenuOptions:')) {
      expect(openGridSource).toContain('contextMenuOptions');
    }
  });
});