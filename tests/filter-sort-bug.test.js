/**
 * Test to reproduce sorting bug while filters are active
 * This test simulates the actual UI workflow a user would follow
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

describe('Sorting Bug with Active Filters - UI Workflow', () => {
    let container;
    let testData;
    let grid;

    beforeEach(() => {
        // Set up DOM container
        container = document.createElement('div');
        container.className = 'test-grid';
        document.body.appendChild(container);

        // Create test data with clear sorting patterns
        testData = [
            { id: 1, name: 'Alice', department: 'Engineering', salary: 80000 },
            { id: 2, name: 'Bob', department: 'Sales', salary: 60000 },
            { id: 3, name: 'Charlie', department: 'Engineering', salary: 90000 },
            { id: 4, name: 'Diana', department: 'HR', salary: 70000 },
            { id: 5, name: 'Eve', department: 'Sales', salary: 65000 },
            { id: 6, name: 'Frank', department: 'Engineering', salary: 85000 },
        ];

        grid = new OpenGrid('test-grid', testData, 400);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    test('BUG REPRODUCTION: Apply filter via UI, then try to sort via UI', () => {
        console.log('=== TESTING UI WORKFLOW ===');
        
        // Step 1: Apply filter via UI (like a user would)
        console.log('Step 1: Applying filter via UI...');
        const departmentButton = container.querySelector('[data-column="department"]');
        departmentButton.click();
        
        // Simulate unchecking HR and Sales, leaving only Engineering
        const checkboxes = document.querySelectorAll('.opengridjs-filter-option input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const label = checkbox.parentElement.querySelector('span').textContent;
            checkbox.checked = label === 'Engineering';
        });
        
        const applyBtn = document.querySelector('.opengridjs-filter-apply');
        applyBtn.click();
        
        console.log('Filter applied. Visible rows:', grid.gridData.length);
        console.log('Names after filter:', grid.gridData.map(item => item.data.name));
        
        // Verify filter worked
        expect(grid.gridData.length).toBe(3);
        expect(grid.gridData.map(item => item.data.name)).toEqual(['Alice', 'Charlie', 'Frank']);
        
        // Step 2: Try to sort by name via UI (like a user would)
        console.log('Step 2: Attempting to sort by name via UI...');
        const nameHeader = container.querySelector('[data-header="name"]');
        
        console.log('Before sort click - Names:', grid.gridData.map(item => item.data.name));
        nameHeader.click();
        console.log('After sort click - Names:', grid.gridData.map(item => item.data.name));
        
        // Check if sorting worked while filter is active
        const namesAfterSort = grid.gridData.map(item => item.data.name);
        console.log('Expected sorted order:', ['Alice', 'Charlie', 'Frank']);
        console.log('Actual order after sort:', namesAfterSort);
        
        // This should pass if sorting works with filters
        expect(namesAfterSort).toEqual(['Alice', 'Charlie', 'Frank']); // Already in order, but testing mechanism
        expect(grid.gridData.length).toBe(3); // Filter should still be active
        
        // Try sorting in descending order
        console.log('Step 3: Attempting descending sort...');
        nameHeader.click();
        const namesDescending = grid.gridData.map(item => item.data.name);
        console.log('Expected descending order:', ['Frank', 'Charlie', 'Alice']);
        console.log('Actual descending order:', namesDescending);
        
        expect(namesDescending).toEqual(['Frank', 'Charlie', 'Alice']);
        expect(grid.gridData.length).toBe(3); // Filter should still be active
    });

    test('BUG REPRODUCTION: Sort by salary while department filter is active', () => {
        console.log('=== TESTING SALARY SORT WITH FILTER ===');
        
        // Apply Engineering filter
        const departmentButton = container.querySelector('[data-column="department"]');
        departmentButton.click();
        
        const checkboxes = document.querySelectorAll('.opengridjs-filter-option input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const label = checkbox.parentElement.querySelector('span').textContent;
            checkbox.checked = label === 'Engineering';
        });
        
        const applyBtn = document.querySelector('.opengridjs-filter-apply');
        applyBtn.click();
        
        console.log('Engineering salaries before sort:', grid.gridData.map(item => item.data.salary));
        
        // Try to sort by salary
        const salaryHeader = container.querySelector('[data-header="salary"]');
        salaryHeader.click(); // Ascending
        
        const salariesAsc = grid.gridData.map(item => item.data.salary);
        console.log('Expected ascending salaries:', [80000, 85000, 90000]);
        console.log('Actual ascending salaries:', salariesAsc);
        
        expect(salariesAsc).toEqual([80000, 85000, 90000]);
        expect(grid.gridData.length).toBe(3);
        
        // Try descending
        salaryHeader.click();
        const salariesDesc = grid.gridData.map(item => item.data.salary);
        console.log('Expected descending salaries:', [90000, 85000, 80000]);
        console.log('Actual descending salaries:', salariesDesc);
        
        expect(salariesDesc).toEqual([90000, 85000, 80000]);
        expect(grid.gridData.length).toBe(3);
    });

    test('DIAGNOSTIC: Check state after each operation', () => {
        console.log('=== DIAGNOSTIC TEST ===');
        
        // Initial state
        console.log('Initial gridData count:', grid.gridData.length);
        console.log('Initial columnFilters:', Object.keys(grid.columnFilters));
        console.log('Initial sortState:', grid.sortState);
        
        // Apply filter
        grid.columnFilters = { department: new Set(['Engineering']) };
        grid.applyAllFilters();
        
        console.log('After filter - gridData count:', grid.gridData.length);
        console.log('After filter - columnFilters:', Object.keys(grid.columnFilters));
        console.log('After filter - sortState:', grid.sortState);
        console.log('After filter - filteredData length:', grid.filteredData ? grid.filteredData.length : 'null');
        
        // Try to sort
        grid.sortState = { header: 'name', sortDirection: 'asc' };
        grid.sortData();
        
        console.log('After sortData() - gridData count:', grid.gridData.length);
        console.log('After sortData() - names:', grid.gridData.map(item => item.data.name));
        
        // This will help us see what's happening
        expect(grid.gridData.length).toBe(3);
    });
});