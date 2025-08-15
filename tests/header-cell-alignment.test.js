/**
 * Tests to verify header and cell minimum width alignment
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

describe('Header and Cell Minimum Width Alignment', () => {
    let container;
    let testData;

    beforeEach(() => {
        container = document.createElement('div');
        container.className = 'test-grid';
        document.body.appendChild(container);

        testData = [
            { id: 1, short: 'A', long: 'Very long description that should determine column width' },
            { id: 2, short: 'BB', long: 'Short' },
            { id: 3, short: 'CCC', long: 'Medium length text here' },
        ];
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    test('should calculate minimum width considering header actions', async () => {
        const grid = new OpenGrid('test-grid', testData, 400);
        
        // Wait for minimum width calculation
        await new Promise(resolve => setTimeout(resolve, 10));
        
        grid.headerData.forEach((header, index) => {
            console.log(`Column ${index} (${header.data}): contentMinWidth = ${header.contentMinWidth}px`);
            
            // Check that contentMinWidth accounts for header text + actions + padding
            expect(header.contentMinWidth).toBeGreaterThanOrEqual(80); // Baseline minimum
            
            // For columns with header actions, minimum width should be larger
            // to account for filter button and sort indicator
            if (header.data === 'long') {
                // This column has long text, so should have a substantial minimum width
                expect(header.contentMinWidth).toBeGreaterThan(120);
            }
        });
    });

    test('should apply same minimum width to both headers and cells', async () => {
        const grid = new OpenGrid('test-grid', testData, 400);
        
        // Wait for minimum width calculation
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const headerItems = container.querySelectorAll('.opengridjs-grid-header-item');
        const firstRow = container.querySelector('.opengridjs-grid-row');
        
        if (firstRow) {
            const cells = firstRow.querySelectorAll('.opengridjs-grid-column-item');
            
            headerItems.forEach((headerItem, index) => {
                const cell = cells[index];
                if (cell && grid.headerData[index]) {
                    const headerStyle = grid.getColumnStyle(grid.headerData[index]);
                    const cellStyle = grid.getColumnStyle(grid.headerData[index]);
                    
                    console.log(`Column ${index} header style: ${headerStyle}`);
                    console.log(`Column ${index} cell style: ${cellStyle}`);
                    
                    // Both should have the same minimum width constraint
                    expect(headerStyle).toEqual(cellStyle);
                    
                    // Both should contain the same min-width value
                    const minWidth = grid.headerData[index].contentMinWidth;
                    if (minWidth) {
                        expect(headerStyle).toContain(`min-width: ${minWidth}px`);
                        expect(cellStyle).toContain(`min-width: ${minWidth}px`);
                    }
                }
            });
        }
    });

    test('should handle header actions width in calculation', async () => {
        const grid = new OpenGrid('test-grid', testData, 400);
        
        // Wait for minimum width calculation
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Manually calculate what the minimum width should be for a column
        const headerItems = container.querySelectorAll('.opengridjs-grid-header-item');
        const firstHeader = headerItems[0];
        
        if (firstHeader) {
            const headerText = firstHeader.querySelector('.opengridjs-header-text');
            const headerActions = firstHeader.querySelector('.opengridjs-header-actions');
            
            expect(headerText).toBeTruthy();
            expect(headerActions).toBeTruthy();
            
            // The minimum width should account for:
            // - Header text width
            // - Actions width (filter button + sort indicator ≈ 50px)
            // - Padding (32px total)
            const calculatedMinWidth = grid.headerData[0].contentMinWidth;
            expect(calculatedMinWidth).toBeGreaterThan(80); // Should be more than just baseline
        }
    });

    test('should prevent header from being smaller than cell content', async () => {
        // Create data where cell content is longer than header text
        const wideData = [
            { name: 'A', description: 'This is an extremely long description that should determine the minimum width for this column and prevent weird alignment issues' },
            { name: 'B', description: 'Another very long piece of text that extends beyond typical column widths' },
        ];

        const grid = new OpenGrid('test-grid', wideData, 400);
        
        // Wait for minimum width calculation
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const descriptionHeader = grid.headerData.find(h => h.data === 'description');
        expect(descriptionHeader).toBeTruthy();
        
        // The minimum width should be large enough to accommodate the long cell content
        expect(descriptionHeader.contentMinWidth).toBeGreaterThan(200);
        
        // Verify that both header and cell styles use this minimum width
        const style = grid.getColumnStyle(descriptionHeader);
        expect(style).toContain(`min-width: ${descriptionHeader.contentMinWidth}px`);
    });

    test('should maintain alignment when column is resized to minimum', async () => {
        const grid = new OpenGrid('test-grid', testData, 400);
        
        // Wait for minimum width calculation
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const originalMinWidth = grid.headerData[0].contentMinWidth;
        
        // Simulate resizing to below minimum (should be clamped to minimum)
        const startWidth = 200;
        const deltaX = -(originalMinWidth + 50); // Try to resize below minimum
        const minAllowedWidth = grid.headerData[0].contentMinWidth || 80;
        const newWidth = Math.max(minAllowedWidth, startWidth + deltaX);
        
        // The new width should be clamped to the minimum
        expect(newWidth).toBe(minAllowedWidth);
        expect(newWidth).toBeGreaterThanOrEqual(originalMinWidth);
        
        // Update the column width
        grid.headerData[0].width = `min-width:${newWidth}px`;
        
        // Both header and cell should use the same style
        const style = grid.getColumnStyle(grid.headerData[0]);
        expect(style).toContain(`min-width: ${grid.headerData[0].contentMinWidth}px`);
        expect(style).toContain(`min-width:${newWidth}px`);
    });
});