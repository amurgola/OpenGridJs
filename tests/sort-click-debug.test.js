/**
 * Debug test for sorting click events with filters
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

describe('Sort Click Event Debugging', () => {
    let container;
    let testData;
    let grid;

    beforeEach(() => {
        container = document.createElement('div');
        container.className = 'test-grid';
        document.body.appendChild(container);

        testData = [
            { id: 1, name: 'Charlie', department: 'Engineering' },
            { id: 2, name: 'Alice', department: 'Engineering' },
            { id: 3, name: 'Bob', department: 'Engineering' },
        ];

        grid = new OpenGrid('test-grid', testData, 400);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    test('Debug: Check header structure after filter application', () => {
        console.log('=== HEADER STRUCTURE DEBUG ===');
        
        // Apply filter first
        grid.columnFilters = { department: new Set(['Engineering']) };
        grid.applyAllFilters();
        
        // Check header structure
        const headerItem = container.querySelector('[data-header="name"]');
        console.log('Header item HTML:', headerItem.outerHTML);
        
        const headerText = headerItem.querySelector('.opengridjs-header-text');
        const headerActions = headerItem.querySelector('.opengridjs-header-actions');
        const filterButton = headerItem.querySelector('.opengridjs-filter-button');
        const sortIndicator = headerItem.querySelector('.opengridjs-sort-indicator');
        
        console.log('Has header text element:', !!headerText);
        console.log('Has header actions element:', !!headerActions);
        console.log('Has filter button:', !!filterButton);
        console.log('Has sort indicator:', !!sortIndicator);
        
        // Test different click targets
        console.log('\n=== TESTING CLICK TARGETS ===');
        
        // Test clicking different parts of the header
        const targets = [
            { name: 'headerItem', element: headerItem },
            { name: 'headerText', element: headerText },
            { name: 'headerActions', element: headerActions },
            { name: 'sortIndicator', element: sortIndicator }
        ].filter(t => t.element);
        
        targets.forEach(target => {
            console.log(`\nTesting click on: ${target.name}`);
            console.log(`Element data-header:`, target.element.getAttribute('data-header'));
            console.log(`Closest header data-header:`, target.element.closest('.opengridjs-grid-header-item')?.getAttribute('data-header'));
            
            // Simulate what the click handler does
            const header = target.element.getAttribute("data-header") || target.element.closest('.opengridjs-grid-header-item')?.getAttribute("data-header");
            console.log(`Resolved header:`, header);
            
            const headerData = grid.headerData.find(x => x.data == header);
            console.log(`Found headerData:`, !!headerData);
            if (headerData) {
                console.log(`Current sortDirection:`, headerData.sortDirection);
            }
        });
    });

    test('Debug: Manual click event simulation', () => {
        console.log('=== MANUAL CLICK SIMULATION ===');
        
        // Apply filter
        grid.columnFilters = { department: new Set(['Engineering']) };
        grid.applyAllFilters();
        
        console.log('Names before sort:', grid.gridData.map(item => item.data.name));
        
        // Get the header and simulate click manually
        const headerItem = container.querySelector('[data-header="name"]');
        const headerText = headerItem.querySelector('.opengridjs-header-text');
        
        // Create mock event for different targets
        const mockEventOnHeader = {
            target: headerItem,
            stopPropagation: () => {},
            preventDefault: () => {}
        };
        
        const mockEventOnText = {
            target: headerText,
            stopPropagation: () => {},
            preventDefault: () => {}
        };
        
        console.log('\nSimulating click on header item...');
        
        // Manually call the sort logic
        const header = mockEventOnHeader.target.getAttribute("data-header") || mockEventOnHeader.target.closest('.opengridjs-grid-header-item')?.getAttribute("data-header");
        console.log('Resolved header from header click:', header);
        
        if (header) {
            const headerData = grid.headerData.find(x => x.data == header);
            if (headerData) {
                console.log('Found headerData, applying sort...');
                headerData.sortDirection = headerData.sortDirection == null || headerData.sortDirection == 'desc' ? 'asc' : 'desc';
                grid.sortState = { header: header, sortDirection: headerData.sortDirection };
                
                console.log('New sort state:', grid.sortState);
                
                // Apply the sort logic manually
                if (Object.keys(grid.columnFilters).length > 0) {
                    console.log('Filters active, calling applyAllFilters...');
                    grid.applyAllFilters();
                } else {
                    console.log('No filters, calling sortData directly...');
                    grid.sortData();
                    grid.rerender();
                }
                
                console.log('Names after sort:', grid.gridData.map(item => item.data.name));
            }
        }
    });

    test('Debug: Actual DOM click event', () => {
        console.log('=== ACTUAL DOM CLICK EVENT ===');
        
        // Apply filter
        grid.columnFilters = { department: new Set(['Engineering']) };
        grid.applyAllFilters();
        
        console.log('Names before DOM click:', grid.gridData.map(item => item.data.name));
        
        // Try actual DOM click
        const headerItem = container.querySelector('[data-header="name"]');
        console.log('Clicking on header item...');
        headerItem.click();
        
        console.log('Names after DOM click:', grid.gridData.map(item => item.data.name));
        console.log('Sort state after DOM click:', grid.sortState);
        console.log('Grid data length:', grid.gridData.length);
    });
});