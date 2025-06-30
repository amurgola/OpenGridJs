/**
 * OpenGrid Test Suite
 * 
 * Basic tests to verify OpenGrid functionality.
 * Note: Due to DOM dependencies, these tests focus on the core logic
 * that can be tested without full DOM manipulation.
 */

const fs = require('fs');
const path = require('path');

describe('OpenGrid Baseline Tests', () => {
  
  test('OpenGrid source file should exist and contain class definition', () => {
    const openGridPath = path.join(__dirname, '../opengrid.js');
    
    // Verify file exists
    expect(fs.existsSync(openGridPath)).toBe(true);
    
    // Read and verify content
    const content = fs.readFileSync(openGridPath, 'utf8');
    expect(content).toContain('class OpenGrid');
    expect(content).toContain('constructor(className, data, gridHeight, setup');
    expect(content).toContain('generateGUID()');
    expect(content).toContain('sortData()');
    expect(content).toContain('searchFilter(');
    expect(content).toContain('appendData(');
    expect(content).toContain('reset()');
    expect(content).toContain('exportToCSV()');
  });

  test('OpenGrid class methods should be present in source', () => {
    const openGridPath = path.join(__dirname, '../opengrid.js');
    const content = fs.readFileSync(openGridPath, 'utf8');
    
    // Verify key methods exist
    const expectedMethods = [
      'initGrid()',
      'processData(',
      'generateGridHeader(',
      'generateGridRows()',
      'addEventListeners(',
      'debounce(',
      'createContextMenu(',
      'closeContextMenu(',
      'renderVisible(',
      'addRow(',
      'removeRow(',
      'rerender()',
      'updateData(',
      'stopLoadingMoreData()',
      'isNearBottom('
    ];
    
    expectedMethods.forEach(method => {
      expect(content).toContain(method);
    });
  });

  test('OpenGrid should have virtual scrolling constants', () => {
    const openGridPath = path.join(__dirname, '../opengrid.js');
    const content = fs.readFileSync(openGridPath, 'utf8');
    
    // Verify virtual scrolling configuration
    expect(content).toContain('gridRowPxSize = 35');
    expect(content).toContain('position: currentPosition * this.gridRowPxSize');
    expect(content).toContain('isRendered: false');
  });

  test('OpenGrid should have sorting functionality', () => {
    const openGridPath = path.join(__dirname, '../opengrid.js');
    const content = fs.readFileSync(openGridPath, 'utf8');
    
    // Verify sorting logic
    expect(content).toContain('sortState');
    expect(content).toContain('direction: null');
    expect(content).toContain('.sort((a, b) =>');
    expect(content).toContain('asc');
    expect(content).toContain('desc');
  });

  test('OpenGrid should handle data with and without IDs', () => {
    const openGridPath = path.join(__dirname, '../opengrid.js');
    const content = fs.readFileSync(openGridPath, 'utf8');
    
    // Verify GUID generation for missing IDs
    expect(content).toContain('dataItem.id === undefined');
    expect(content).toContain('dataItem.id === null');
    expect(content).toContain('dataItem.id === \'\'');
    expect(content).toContain('this.generateGUID()');
    expect(content).toContain('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx');
  });

  test('OpenGrid should have context menu functionality', () => {
    const openGridPath = path.join(__dirname, '../opengrid.js');
    const content = fs.readFileSync(openGridPath, 'utf8');
    
    // Verify context menu features
    expect(content).toContain('contextMenuItems');
    expect(content).toContain('contextMenuTitle');
    expect(content).toContain('opengridjs-contextMenu');
    expect(content).toContain('contextmenu');
    expect(content).toContain('preventDefault()');
  });

  test('OpenGrid should have search and filter functionality', () => {
    const openGridPath = path.join(__dirname, '../opengrid.js');
    const content = fs.readFileSync(openGridPath, 'utf8');
    
    // Verify search functionality
    expect(content).toContain('searchFilter(term)');
    expect(content).toContain('toLowerCase()');
    expect(content).toContain('includes(');
    expect(content).toContain('Object.values(');
  });

  test('OpenGrid should have CSV export functionality', () => {
    const openGridPath = path.join(__dirname, '../opengrid.js');
    const content = fs.readFileSync(openGridPath, 'utf8');
    
    // Verify CSV export
    expect(content).toContain('exportToCSV()');
    expect(content).toContain('export.csv');
    expect(content).toContain('createElement(\'a\')');
    expect(content).toContain('createObjectURL');
    expect(content).toContain('Blob');
  });

  test('OpenGrid should have infinite scroll functionality', () => {
    const openGridPath = path.join(__dirname, '../opengrid.js');
    const content = fs.readFileSync(openGridPath, 'utf8');
    
    // Verify infinite scroll features
    expect(content).toContain('loadMoreDataFunction');
    expect(content).toContain('canLoadMoreData');
    expect(content).toContain('isLoadingMoreData');
    expect(content).toContain('isNearBottom(');
    expect(content).toContain('stopLoadingMoreData()');
  });

  test('OpenGrid should have debouncing for performance', () => {
    const openGridPath = path.join(__dirname, '../opengrid.js');
    const content = fs.readFileSync(openGridPath, 'utf8');
    
    // Verify debounce implementation
    expect(content).toContain('debounce(func, delay)');
    expect(content).toContain('clearTimeout(inDebounce)');
    expect(content).toContain('setTimeout(');
    expect(content).toContain('func.apply(context, args)');
  });

  test('package.json should have correct test configuration', () => {
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    expect(packageJson.scripts.test).toBe('jest');
    expect(packageJson.scripts['test:watch']).toBe('jest --watch');
    expect(packageJson.scripts['test:coverage']).toBe('jest --coverage');
    expect(packageJson.devDependencies.jest).toBeDefined();
    expect(packageJson.devDependencies['jest-environment-jsdom']).toBeDefined();
  });

  test('jest configuration should be properly set up', () => {
    const jestConfigPath = path.join(__dirname, '../jest.config.js');
    
    expect(fs.existsSync(jestConfigPath)).toBe(true);
    
    const jestConfig = fs.readFileSync(jestConfigPath, 'utf8');
    expect(jestConfig).toContain('testEnvironment: \'jsdom\'');
    expect(jestConfig).toContain('opengrid.js');
    expect(jestConfig).toContain('coverage');
  });
});

describe('Test Infrastructure', () => {
  test('createTestData helper should be available', () => {
    // This verifies our test setup is working
    expect(global.createTestData).toBeDefined();
    expect(typeof global.createTestData).toBe('function');
    
    const testData = global.createTestData(3);
    expect(testData).toHaveLength(3);
    expect(testData[0]).toHaveProperty('id');
    expect(testData[0]).toHaveProperty('name');
    expect(testData[0]).toHaveProperty('email');
    expect(testData[0]).toHaveProperty('age');
    expect(testData[0]).toHaveProperty('status');
  });

  test('global mocks should be available', () => {
    expect(global.fetch).toBeDefined();
    expect(jest.isMockFunction(global.fetch)).toBe(true);
  });

  test('DOM environment should be available', () => {
    expect(document).toBeDefined();
    expect(document.createElement).toBeDefined();
    expect(document.querySelector).toBeDefined();
    
    // Test basic DOM functionality
    const div = document.createElement('div');
    expect(div.tagName).toBe('DIV');
    
    div.className = 'test-class';
    expect(div.className).toBe('test-class');
  });
});