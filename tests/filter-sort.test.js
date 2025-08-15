/**
 * Tests for sorting with filters active
 */

// Load the OpenGrid JavaScript file
const fs = require('fs');
const path = require('path');

// Load OpenGrid class into global scope for Jest
beforeAll(() => {
    const openGridSource = fs.readFileSync(path.join(__dirname, '../src/opengrid.js'), 'utf8');
    // Create a function wrapper and execute it to define OpenGrid globally
    const wrapper = new Function(openGridSource + '; window.OpenGrid = OpenGrid;');
    wrapper();
});

describe('OpenGrid Filter and Sort Integration', () => {
    let container;
    let testData;

    beforeEach(() => {
        // Set up DOM container
        container = document.createElement('div');
        container.className = 'test-grid';
        document.body.appendChild(container);

        // Create test data
        testData = [
            { id: 1, name: 'Alice', department: 'Engineering', salary: 80000 },
            { id: 2, name: 'Bob', department: 'Sales', salary: 60000 },
            { id: 3, name: 'Charlie', department: 'Engineering', salary: 90000 },
            { id: 4, name: 'Diana', department: 'HR', salary: 70000 },
            { id: 5, name: 'Eve', department: 'Sales', salary: 65000 },
            { id: 6, name: 'Frank', department: 'Engineering', salary: 85000 },
        ];
    });

    afterEach(() => {
        // Clean up
        document.body.removeChild(container);
    });

    test('should maintain filter when sorting is applied', () => {
        const grid = new OpenGrid('test-grid', testData, 400);
        
        // Apply department filter for Engineering only
        grid.columnFilters = {
            department: new Set(['Engineering'])
        };
        grid.applyAllFilters();
        
        // Should have 3 Engineering entries
        expect(grid.gridData.length).toBe(3);
        
        // Apply sort by name ascending
        const nameHeader = container.querySelector('[data-header="name"]');
        nameHeader.click();
        
        // Should still have 3 entries (filter maintained)
        expect(grid.gridData.length).toBe(3);
        
        // Check that data is both filtered and sorted
        const names = grid.gridData.map(item => item.data.name);
        expect(names).toEqual(['Alice', 'Charlie', 'Frank']);
        
        // All should be Engineering
        grid.gridData.forEach(item => {
            expect(item.data.department).toBe('Engineering');
        });
    });

    test('should maintain sort when filter is applied', () => {
        const grid = new OpenGrid('test-grid', testData, 400);
        
        // First apply sort by salary descending
        const salaryHeader = container.querySelector('[data-header="salary"]');
        salaryHeader.click(); // ascending
        salaryHeader.click(); // descending
        
        // Check initial sort
        let salaries = grid.gridData.map(item => item.data.salary);
        expect(salaries[0]).toBe(90000); // Charlie has highest salary
        
        // Now apply filter for Sales and Engineering
        grid.columnFilters = {
            department: new Set(['Sales', 'Engineering'])
        };
        grid.applyAllFilters();
        
        // Should exclude HR (Diana)
        expect(grid.gridData.length).toBe(5);
        
        // Check that sort is maintained
        salaries = grid.gridData.map(item => item.data.salary);
        expect(salaries).toEqual([90000, 85000, 80000, 65000, 60000]);
    });

    test('should handle multiple filters with sorting', () => {
        const grid = new OpenGrid('test-grid', testData, 400);
        
        // Apply multiple filters
        grid.columnFilters = {
            department: new Set(['Engineering', 'Sales'])
        };
        grid.applyAllFilters();
        
        // Apply sort by name
        const nameHeader = container.querySelector('[data-header="name"]');
        nameHeader.click();
        
        // Should have 5 entries (3 Engineering + 2 Sales)
        expect(grid.gridData.length).toBe(5);
        
        // Check sort order
        const names = grid.gridData.map(item => item.data.name);
        expect(names).toEqual(['Alice', 'Bob', 'Charlie', 'Eve', 'Frank']);
    });

    test('should maintain sort when filters are cleared', () => {
        const grid = new OpenGrid('test-grid', testData, 400);
        
        // Apply sort
        const nameHeader = container.querySelector('[data-header="name"]');
        nameHeader.click();
        
        // Apply filter
        grid.columnFilters = {
            department: new Set(['Engineering'])
        };
        grid.applyAllFilters();
        
        expect(grid.gridData.length).toBe(3);
        
        // Clear filters
        grid.clearAllFilters();
        
        // Should have all data back
        expect(grid.gridData.length).toBe(6);
        
        // Sort should still be applied
        const names = grid.gridData.map(item => item.data.name);
        expect(names).toEqual(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']);
    });

    test('should handle changing sort direction with filters active', () => {
        const grid = new OpenGrid('test-grid', testData, 400);
        
        // Apply filter
        grid.columnFilters = {
            department: new Set(['Engineering'])
        };
        grid.applyAllFilters();
        
        // Apply ascending sort
        const salaryHeader = container.querySelector('[data-header="salary"]');
        salaryHeader.click();
        
        let salaries = grid.gridData.map(item => item.data.salary);
        expect(salaries).toEqual([80000, 85000, 90000]);
        
        // Change to descending
        salaryHeader.click();
        
        salaries = grid.gridData.map(item => item.data.salary);
        expect(salaries).toEqual([90000, 85000, 80000]);
        
        // Filter should still be active
        expect(grid.gridData.length).toBe(3);
        grid.gridData.forEach(item => {
            expect(item.data.department).toBe('Engineering');
        });
    });

    test('should handle sorting different columns with filters', () => {
        const grid = new OpenGrid('test-grid', testData, 400);
        
        // Apply filter
        grid.columnFilters = {
            department: new Set(['Engineering', 'Sales'])
        };
        grid.applyAllFilters();
        
        // Sort by name
        let nameHeader = container.querySelector('[data-header="name"]');
        nameHeader.click();
        
        let names = grid.gridData.map(item => item.data.name);
        expect(names[0]).toBe('Alice');
        
        // Sort by salary instead
        const salaryHeader = container.querySelector('[data-header="salary"]');
        salaryHeader.click();
        
        let salaries = grid.gridData.map(item => item.data.salary);
        expect(salaries).toEqual([60000, 65000, 80000, 85000, 90000]);
        
        // Filter should still be active
        expect(grid.gridData.length).toBe(5);
    });
});