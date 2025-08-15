/**
 * Tests for multiple grid instances and right-click filter menu functionality
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

describe('Multiple Grid Instances and Right-click Features', () => {
    let container1, container2;
    let testData1, testData2;
    let grid1, grid2;

    beforeEach(() => {
        // Create two grid containers
        container1 = document.createElement('div');
        container1.className = 'grid-1';
        document.body.appendChild(container1);

        container2 = document.createElement('div');
        container2.className = 'grid-2';
        document.body.appendChild(container2);

        testData1 = [
            { id: 1, name: 'Alice', role: 'Developer' },
            { id: 2, name: 'Bob', role: 'Designer' },
        ];

        testData2 = [
            { id: 3, name: 'Charlie', department: 'Sales' },
            { id: 4, name: 'David', department: 'Marketing' },
        ];

        grid1 = new OpenGrid('grid-1', testData1, 400);
        grid2 = new OpenGrid('grid-2', testData2, 400);
    });

    afterEach(() => {
        document.body.removeChild(container1);
        document.body.removeChild(container2);
    });

    test('should create independent grid instances', () => {
        expect(grid1).toBeDefined();
        expect(grid2).toBeDefined();
        expect(grid1.rootElement).toBe(container1);
        expect(grid2.rootElement).toBe(container2);
        expect(grid1.gridData.length).toBe(2);
        expect(grid2.gridData.length).toBe(2);
    });

    test('should scope context menus to correct grid instance', () => {
        const contextMenuOptions = [
            { actionName: 'Edit', actionFunctionName: 'editRow', className: 'edit-btn' }
        ];

        // Create grids with context menus
        grid1 = new OpenGrid('grid-1', testData1, 400, { contextMenuOptions });
        grid2 = new OpenGrid('grid-2', testData2, 400, { contextMenuOptions });

        // Get rows from each grid
        const grid1Rows = container1.querySelectorAll('.opengridjs-grid-row');
        const grid2Rows = container2.querySelectorAll('.opengridjs-grid-row');

        expect(grid1Rows.length).toBeGreaterThan(0);
        expect(grid2Rows.length).toBeGreaterThan(0);

        // Simulate right-click on grid2 row
        const grid2Row = grid2Rows[0];
        const contextMenuEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: 100,
            clientY: 100
        });

        grid2Row.dispatchEvent(contextMenuEvent);

        // Context menu should appear only in grid2
        const grid1ContextMenus = container1.querySelectorAll('.opengridjs-contextMenu');
        const grid2ContextMenus = container2.querySelectorAll('.opengridjs-contextMenu');

        expect(grid1ContextMenus.length).toBe(0);
        expect(grid2ContextMenus.length).toBe(1);
    });

    test('should scope filter menus to correct grid instance', () => {
        // Get filter buttons from each grid
        const grid1FilterButtons = container1.querySelectorAll('.opengridjs-filter-button');
        const grid2FilterButtons = container2.querySelectorAll('.opengridjs-filter-button');

        expect(grid1FilterButtons.length).toBeGreaterThan(0);
        expect(grid2FilterButtons.length).toBeGreaterThan(0);

        // Click filter button in grid2
        const grid2FilterButton = grid2FilterButtons[0];
        grid2FilterButton.click();

        // Filter menu should appear only in grid2
        const grid1FilterMenus = container1.querySelectorAll('.opengridjs-filter-menu');
        const grid2FilterMenus = container2.querySelectorAll('.opengridjs-filter-menu');

        expect(grid1FilterMenus.length).toBe(0);
        expect(grid2FilterMenus.length).toBe(1);
    });

    test('should open filter menu on header right-click', () => {
        // Get header items from grid1
        const headerItems = container1.querySelectorAll('.opengridjs-grid-header-item');
        expect(headerItems.length).toBeGreaterThan(0);

        const headerItem = headerItems[0]; // First column header

        // Simulate right-click on header
        const contextMenuEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: 100,
            clientY: 100
        });

        headerItem.dispatchEvent(contextMenuEvent);

        // Filter menu should appear
        const filterMenus = container1.querySelectorAll('.opengridjs-filter-menu');
        expect(filterMenus.length).toBe(1);

        // Menu should be for the correct column
        const filterMenu = filterMenus[0];
        const column = headerItem.getAttribute('data-header');
        expect(filterMenu.getAttribute('data-column')).toBe(column);
    });

    test('should close filter menu when clicking outside (scoped to grid)', (done) => {
        // Open filter menu in grid1
        const grid1FilterButton = container1.querySelector('.opengridjs-filter-button');
        grid1FilterButton.click();

        // Wait for event listeners to be attached
        setTimeout(() => {
            // Verify menu is open
            let filterMenus = container1.querySelectorAll('.opengridjs-filter-menu');
            expect(filterMenus.length).toBe(1);

            // Click outside (on document)
            const outsideClickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true
            });

            document.dispatchEvent(outsideClickEvent);

            // Filter menu should now be closed
            filterMenus = container1.querySelectorAll('.opengridjs-filter-menu');
            expect(filterMenus.length).toBe(0);
            done();
        }, 10);
    });

    test('should not interfere between multiple grid operations', () => {
        // Open filter menu in grid1
        const grid1FilterButton = container1.querySelector('.opengridjs-filter-button');
        grid1FilterButton.click();

        // Open filter menu in grid2  
        const grid2FilterButton = container2.querySelector('.opengridjs-filter-button');
        grid2FilterButton.click();

        // Both grids should have their own filter menus
        const grid1FilterMenus = container1.querySelectorAll('.opengridjs-filter-menu');
        const grid2FilterMenus = container2.querySelectorAll('.opengridjs-filter-menu');

        expect(grid1FilterMenus.length).toBe(1);
        expect(grid2FilterMenus.length).toBe(1);

        // Close grid1 filter menu by clicking its cancel button
        const grid1CancelButton = grid1FilterMenus[0].querySelector('.opengridjs-filter-cancel');
        grid1CancelButton.click();

        // Only grid1 menu should be closed
        const grid1FilterMenusAfter = container1.querySelectorAll('.opengridjs-filter-menu');
        const grid2FilterMenusAfter = container2.querySelectorAll('.opengridjs-filter-menu');

        expect(grid1FilterMenusAfter.length).toBe(0);
        expect(grid2FilterMenusAfter.length).toBe(1);
    });
});