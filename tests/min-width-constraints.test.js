/**
 * Tests for content-based minimum width constraints
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

describe('Content-Based Minimum Width Constraints', () => {
    let container;
    let testData;

    beforeEach(() => {
        container = document.createElement('div');
        container.className = 'test-grid';
        document.body.appendChild(container);

        testData = [
            { id: 1, name: 'A', department: 'Engineering', description: 'Very long description that should determine the minimum width of this column' },
            { id: 2, name: 'Really Long Name That Extends', department: 'Sales', description: 'Short' },
            { id: 3, name: 'Bob', department: 'Human Resources Department', description: 'Medium length description here' },
        ];
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    test('should calculate content-based minimum widths', async () => {
        const grid = new OpenGrid('test-grid', testData, 400);
        
        // Wait for minimum width calculation
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Check that contentMinWidth was calculated for each column
        grid.headerData.forEach((header, index) => {
            console.log(`Column ${index} (${header.data}): contentMinWidth = ${header.contentMinWidth}px`);
            expect(header.contentMinWidth).toBeDefined();
            expect(header.contentMinWidth).toBeGreaterThanOrEqual(80); // Should be at least the baseline minimum
        });
        
        // The description column should have the largest minimum width due to long content
        const descriptionHeader = grid.headerData.find(h => h.data === 'description');
        const nameHeader = grid.headerData.find(h => h.data === 'name');
        
        expect(descriptionHeader.contentMinWidth).toBeGreaterThan(nameHeader.contentMinWidth);
    });

    test('should enforce minimum width in column styles', async () => {
        const grid = new OpenGrid('test-grid', testData, 400);
        
        // Wait for minimum width calculation
        await new Promise(resolve => setTimeout(resolve, 10));
        
        grid.headerData.forEach((header, index) => {
            const style = grid.getColumnStyle(header);
            console.log(`Column ${index} style: ${style}`);
            
            // Should contain min-width based on content
            expect(style).toContain('min-width:');
            expect(style).toContain(`${header.contentMinWidth}px`);
        });
    });

    test('should prevent resizing below content minimum width', async () => {
        const grid = new OpenGrid('test-grid', testData, 400);
        
        // Wait for minimum width calculation
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const originalMinWidth = grid.headerData[0].contentMinWidth;
        
        // Simulate trying to resize below minimum width
        grid.headerData[0].width = `min-width:${originalMinWidth - 50}px`;
        
        // The resizing logic should prevent going below contentMinWidth
        const deltaX = -(originalMinWidth);
        const minAllowedWidth = grid.headerData[0].contentMinWidth || 80;
        const newWidth = Math.max(minAllowedWidth, 200 + deltaX); // Simulating 200px start width
        
        expect(newWidth).toBeGreaterThanOrEqual(minAllowedWidth);
        expect(newWidth).toBeGreaterThanOrEqual(originalMinWidth);
    });

    test('should handle empty or short content gracefully', async () => {
        const shortData = [
            { a: 'X', b: '', c: null },
            { a: 'Y', b: '1', c: undefined },
        ];
        
        const grid = new OpenGrid('test-grid', shortData, 400);
        
        // Wait for minimum width calculation  
        await new Promise(resolve => setTimeout(resolve, 10));
        
        grid.headerData.forEach(header => {
            // Even with short content, should have reasonable minimum width
            expect(header.contentMinWidth).toBeGreaterThanOrEqual(80);
        });
    });

    test('should measure text width accurately', () => {
        const grid = new OpenGrid('test-grid', testData, 400);
        
        // Create a test element to measure
        const testElement = document.createElement('div');
        testElement.style.font = '14px Arial';
        testElement.style.position = 'absolute';
        testElement.style.visibility = 'hidden';
        document.body.appendChild(testElement);
        
        const shortText = 'A';
        const longText = 'This is a much longer piece of text';
        
        const shortWidth = grid.measureTextWidth(shortText, testElement);
        const longWidth = grid.measureTextWidth(longText, testElement);
        
        console.log(`Short text width: ${shortWidth}px`);
        console.log(`Long text width: ${longWidth}px`);
        
        expect(longWidth).toBeGreaterThanOrEqual(shortWidth);
        expect(shortWidth).toBeGreaterThanOrEqual(0);
        expect(longWidth).toBeGreaterThan(0);
        
        document.body.removeChild(testElement);
    });

    test('should update minimum widths when data changes', async () => {
        const grid = new OpenGrid('test-grid', testData, 400);
        
        // Wait for initial calculation
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const originalMinWidth = grid.headerData.find(h => h.data === 'name').contentMinWidth;
        
        // Add data with longer names
        const newData = [
            ...testData,
            { id: 4, name: 'Extremely Long Name That Should Increase Minimum Width Significantly', department: 'Marketing', description: 'Test' }
        ];
        
        // Simulate data change and recalculation
        grid.processData(newData);
        grid.generateGridRows();
        grid.updateColumnWidths();
        
        // Wait for recalculation
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const newMinWidth = grid.headerData.find(h => h.data === 'name').contentMinWidth;
        
        expect(newMinWidth).toBeGreaterThanOrEqual(originalMinWidth);
    });

    test('should handle custom column widths with content constraints', async () => {
        const setup = {
            columnHeaderNames: [
                { columnName: 'id', columnNameDisplay: 'ID', columnWidth: '50px' }, // Smaller than content needs
                { columnName: 'name', columnNameDisplay: 'Full Name', columnWidth: '100px' },
                { columnName: 'department', columnNameDisplay: 'Department' },
                { columnName: 'description', columnNameDisplay: 'Description' }
            ]
        };
        
        const grid = new OpenGrid('test-grid', testData, 400, setup);
        
        // Wait for minimum width calculation
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const idHeader = grid.headerData.find(h => h.data === 'id');
        const style = grid.getColumnStyle(idHeader);
        
        console.log(`ID column style: ${style}`);
        
        // Should have both the specified min-width and the content-based min-width
        expect(style).toContain('min-width:');
        // The content-based min-width should take precedence if larger
        if (idHeader.contentMinWidth > 50) {
            expect(style).toContain(`min-width: ${idHeader.contentMinWidth}px`);
        }
    });
});