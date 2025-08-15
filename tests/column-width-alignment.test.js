/**
 * Tests for column width alignment between headers and cells
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

describe('Column Width Alignment', () => {
    let container;
    let testData;

    beforeEach(() => {
        container = document.createElement('div');
        container.className = 'test-grid';
        document.body.appendChild(container);

        testData = [
            { id: 1, name: 'Alice Smith', department: 'Engineering', salary: 80000 },
            { id: 2, name: 'Bob Johnson', department: 'Sales', salary: 60000 },
            { id: 3, name: 'Charlie Brown', department: 'Engineering', salary: 90000 },
        ];
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    test('header and cell widths should match with percentage widths', () => {
        const grid = new OpenGrid('test-grid', testData, 400);
        
        // Get header items and first row's column items
        const headerItems = container.querySelectorAll('.opengridjs-grid-header-item');
        const firstRow = container.querySelector('.opengridjs-grid-row');
        const columnItems = firstRow.querySelectorAll('.opengridjs-grid-column-item');
        
        expect(headerItems.length).toBe(columnItems.length);
        
        // Check that each header and corresponding column have the same width style
        headerItems.forEach((header, index) => {
            const column = columnItems[index];
            
            console.log(`Column ${index}:`);
            console.log(`  Header style: ${header.style.cssText}`);
            console.log(`  Column style: ${column.style.cssText}`);
            
            // Both should have the same width value
            expect(header.style.width).toBe(column.style.width);
            expect(header.style.flexGrow).toBe(column.style.flexGrow);
            expect(header.style.flexShrink).toBe(column.style.flexShrink);
        });
    });

    test('header and cell widths should match with custom pixel widths', () => {
        const setup = {
            columnHeaderNames: [
                { columnName: 'id', columnNameDisplay: 'ID', columnWidth: '60px' },
                { columnName: 'name', columnNameDisplay: 'Name', columnWidth: '200px' },
                { columnName: 'department', columnNameDisplay: 'Department', columnWidth: '150px' },
                { columnName: 'salary', columnNameDisplay: 'Salary', columnWidth: '120px' }
            ]
        };
        
        const grid = new OpenGrid('test-grid', testData, 400, setup);
        
        const headerItems = container.querySelectorAll('.opengridjs-grid-header-item');
        const firstRow = container.querySelector('.opengridjs-grid-row');
        const columnItems = firstRow.querySelectorAll('.opengridjs-grid-column-item');
        
        expect(headerItems.length).toBe(4);
        expect(columnItems.length).toBe(4);
        
        const expectedWidths = ['60px', '200px', '150px', '120px'];
        
        headerItems.forEach((header, index) => {
            const column = columnItems[index];
            
            console.log(`Column ${index} (${expectedWidths[index]}):`);
            console.log(`  Header style: ${header.style.cssText}`);
            console.log(`  Column style: ${column.style.cssText}`);
            
            // Both should contain the expected width
            expect(header.style.cssText).toContain(`min-width: ${expectedWidths[index]}`);
            expect(column.style.cssText).toContain(`min-width: ${expectedWidths[index]}`);
            
            // Both should have flex-grow and flex-shrink set to 0
            expect(header.style.flexGrow).toBe('0');
            expect(header.style.flexShrink).toBe('0');
            expect(column.style.flexGrow).toBe('0');
            expect(column.style.flexShrink).toBe('0');
        });
    });

    test('column widths should remain aligned after resizing', () => {
        const setup = {
            columnHeaderNames: [
                { columnName: 'id', columnNameDisplay: 'ID', columnWidth: '60px' },
                { columnName: 'name', columnNameDisplay: 'Name', columnWidth: '200px' },
                { columnName: 'department', columnNameDisplay: 'Department' },
                { columnName: 'salary', columnNameDisplay: 'Salary' }
            ]
        };
        
        const grid = new OpenGrid('test-grid', testData, 400, setup);
        
        // Simulate column resize by updating header data
        grid.headerData[1].width = 'min-width: 300px';
        grid.updateColumnWidths();
        
        const headerItems = container.querySelectorAll('.opengridjs-grid-header-item');
        const firstRow = container.querySelector('.opengridjs-grid-row');
        const columnItems = firstRow.querySelectorAll('.opengridjs-grid-column-item');
        
        // Check that the second column (name) has been updated
        const nameHeader = headerItems[1];
        const nameColumn = columnItems[1];
        
        console.log('After resize:');
        console.log(`  Header style: ${nameHeader.style.cssText}`);
        console.log(`  Column style: ${nameColumn.style.cssText}`);
        
        // Both should have the new width
        expect(nameColumn.style.cssText).toContain('min-width: 300px');
    });

    test('getColumnStyle should return consistent styles', () => {
        const grid = new OpenGrid('test-grid', testData, 400);
        
        // Test percentage width
        const percentHeader = { width: 'width:25%' };
        const percentStyle = grid.getColumnStyle(percentHeader);
        expect(percentStyle).toBe('width:25%; flex-grow: 0; flex-shrink: 0; box-sizing: border-box;');
        
        // Test pixel width
        const pixelHeader = { width: 'min-width: 200px' };
        const pixelStyle = grid.getColumnStyle(pixelHeader);
        expect(pixelStyle).toBe('min-width: 200px; flex-grow: 0; flex-shrink: 0; box-sizing: border-box;');
        
        // Test width property
        const widthHeader = { width: 'width: 150px' };
        const widthStyle = grid.getColumnStyle(widthHeader);
        expect(widthStyle).toBe('width: 150px; flex-grow: 0; flex-shrink: 0; box-sizing: border-box;');
    });

    test('column alignment should work with filters applied', () => {
        const setup = {
            columnHeaderNames: [
                { columnName: 'id', columnNameDisplay: 'ID', columnWidth: '60px' },
                { columnName: 'name', columnNameDisplay: 'Name', columnWidth: '200px' },
                { columnName: 'department', columnNameDisplay: 'Department', columnWidth: '150px' },
                { columnName: 'salary', columnNameDisplay: 'Salary', columnWidth: '120px' }
            ]
        };
        
        const grid = new OpenGrid('test-grid', testData, 400, setup);
        
        // Apply filter
        grid.columnFilters = { department: new Set(['Engineering']) };
        grid.applyAllFilters();
        
        // Check that filtered rows still have proper column alignment
        const headerItems = container.querySelectorAll('.opengridjs-grid-header-item');
        const visibleRows = container.querySelectorAll('.opengridjs-grid-row');
        
        visibleRows.forEach(row => {
            const columnItems = row.querySelectorAll('.opengridjs-grid-column-item');
            
            headerItems.forEach((header, index) => {
                const column = columnItems[index];
                if (column) {
                    // Check that styles are still consistent
                    expect(header.style.cssText).toContain('min-width:');
                    expect(column.style.cssText).toContain('min-width:');
                    expect(header.style.flexGrow).toBe(column.style.flexGrow);
                    expect(header.style.flexShrink).toBe(column.style.flexShrink);
                }
            });
        });
    });
});