/**
 * Test to check if DOM elements actually update when sorting with filters
 */

// Load the OpenGrid JavaScript file
const fs = require('fs');
const path = require('path');

// Load OpenGrid class into global scope for Jest
beforeAll(() => {
    const openGridSource = fs.readFileSync(path.join(__dirname, '../src/opengrid.js'), 'utf8');
    const wrapper = new Function(openGridSource + '; window.OpenGrid = OpenGrid;');
    wrapper();
});

describe('Visual DOM Update Test for Sorting with Filters', () => {
    let container;
    let testData;
    let grid;

    beforeEach(() => {
        container = document.createElement('div');
        container.className = 'test-grid';
        document.body.appendChild(container);

        testData = [
            { id: 1, name: 'Zebra', department: 'Engineering', salary: 80000 },
            { id: 2, name: 'Alpha', department: 'Engineering', salary: 60000 },
            { id: 3, name: 'Beta', department: 'Engineering', salary: 90000 },
            { id: 4, name: 'Delta', department: 'HR', salary: 70000 },
        ];

        grid = new OpenGrid('test-grid', testData, 400);
        
        // Give some time for rendering
        jest.advanceTimersByTime(100);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    test('DOM rows should visually update when sorting with active filter', () => {
        console.log('=== VISUAL DOM UPDATE TEST ===');
        
        // Apply filter for Engineering only
        const departmentButton = container.querySelector('[data-column="department"]');
        departmentButton.click();
        
        const checkboxes = document.querySelectorAll('.opengridjs-filter-option input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const label = checkbox.parentElement.querySelector('span').textContent;
            checkbox.checked = label === 'Engineering';
        });
        
        const applyBtn = document.querySelector('.opengridjs-filter-apply');
        applyBtn.click();
        
        console.log('Filter applied...');
        
        // Get current visible DOM rows
        let domRows = container.querySelectorAll('.opengridjs-grid-row');
        let visibleNames = Array.from(domRows).map(row => {
            const columnItems = row.querySelectorAll('.opengridjs-grid-column-item');
            const nameCell = columnItems[1]; // Index 1 should be the name column (0=id, 1=name, 2=department, 3=salary)
            return nameCell ? nameCell.textContent.trim() : 'NO_TEXT';
        });
        
        console.log('DOM names before sort:', visibleNames);
        console.log('Grid data names before sort:', grid.gridData.map(item => item.data.name));
        
        // Now click to sort by name
        const nameHeader = container.querySelector('[data-header="name"]');
        console.log('Clicking name header to sort...');
        nameHeader.click();
        
        // Allow time for DOM updates
        jest.advanceTimersByTime(100);
        
        // Check DOM after sort
        domRows = container.querySelectorAll('.opengridjs-grid-row');
        visibleNames = Array.from(domRows).map(row => {
            const columnItems = row.querySelectorAll('.opengridjs-grid-column-item');
            const nameCell = columnItems[1]; // Index 1 should be the name column
            return nameCell ? nameCell.textContent.trim() : 'NO_TEXT';
        });
        
        console.log('DOM names after sort:', visibleNames);
        console.log('Grid data names after sort:', grid.gridData.map(item => item.data.name));
        console.log('Sort state:', grid.sortState);
        
        // Verify both internal data and DOM are sorted
        const expectedOrder = ['Alpha', 'Beta', 'Zebra'];
        expect(grid.gridData.map(item => item.data.name)).toEqual(expectedOrder);
        expect(visibleNames).toEqual(expectedOrder);
        
        // Test descending sort
        console.log('\nTesting descending sort...');
        nameHeader.click();
        
        jest.advanceTimersByTime(100);
        
        domRows = container.querySelectorAll('.opengridjs-grid-row');
        visibleNames = Array.from(domRows).map(row => {
            const columnItems = row.querySelectorAll('.opengridjs-grid-column-item');
            const nameCell = columnItems[1]; // Index 1 should be the name column
            return nameCell ? nameCell.textContent.trim() : 'NO_TEXT';
        });
        
        console.log('DOM names after descending sort:', visibleNames);
        console.log('Grid data names after descending sort:', grid.gridData.map(item => item.data.name));
        
        const expectedDescOrder = ['Zebra', 'Beta', 'Alpha'];
        expect(grid.gridData.map(item => item.data.name)).toEqual(expectedDescOrder);
        expect(visibleNames).toEqual(expectedDescOrder);
    });

    test('Check if rerender is actually updating DOM positions', () => {
        console.log('=== DOM POSITION UPDATE TEST ===');
        
        // Apply filter
        grid.columnFilters = { department: new Set(['Engineering']) };
        grid.applyAllFilters();
        
        // Check initial row positions
        let domRows = container.querySelectorAll('.opengridjs-grid-row');
        console.log('Initial DOM rows count:', domRows.length);
        
        domRows.forEach((row, index) => {
            const columnItems = row.querySelectorAll('.opengridjs-grid-column-item');
            const nameCell = columnItems[1]; // Index 1 for name column
            const topStyle = row.style.top;
            console.log(`Row ${index}: name="${nameCell?.textContent}", top="${topStyle}"`);
        });
        
        // Apply sort
        grid.sortState = { header: 'name', sortDirection: 'asc' };
        grid.applyAllFilters();
        
        // Check updated positions
        domRows = container.querySelectorAll('.opengridjs-grid-row');
        console.log('\nAfter sort DOM rows count:', domRows.length);
        
        domRows.forEach((row, index) => {
            const columnItems = row.querySelectorAll('.opengridjs-grid-column-item');
            const nameCell = columnItems[1]; // Index 1 for name column
            const topStyle = row.style.top;
            console.log(`Row ${index}: name="${nameCell?.textContent}", top="${topStyle}"`);
        });
        
        // Verify we have the expected names in order
        const namesInDOM = Array.from(domRows).map(row => {
            const columnItems = row.querySelectorAll('.opengridjs-grid-column-item');
            const nameCell = columnItems[1]; // Index 1 for name column
            return nameCell?.textContent || '';
        });
        
        expect(namesInDOM).toEqual(['Alpha', 'Beta', 'Zebra']);
    });
});