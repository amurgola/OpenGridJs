/**
 * Tests for the column filtering feature
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

describe('OpenGrid Column Filtering', () => {
    let container;
    let testData;

    beforeEach(() => {
        // Set up DOM container
        container = document.createElement('div');
        container.className = 'test-grid';
        document.body.appendChild(container);

        // Create test data with various data types
        testData = [
            { id: 1, name: 'Alice', department: 'Engineering', age: 30, active: true },
            { id: 2, name: 'Bob', department: 'Sales', age: 25, active: false },
            { id: 3, name: 'Charlie', department: 'Engineering', age: 35, active: true },
            { id: 4, name: 'Diana', department: 'HR', age: 28, active: true },
            { id: 5, name: 'Eve', department: 'Sales', age: 32, active: false },
            { id: 6, name: 'Frank', department: 'Engineering', age: 29, active: true },
            { id: 7, name: 'Grace', department: 'HR', age: 26, active: false },
            { id: 8, name: 'Henry', department: 'Sales', age: 31, active: true }
        ];
    });

    afterEach(() => {
        // Clean up
        document.body.removeChild(container);
    });

    describe('Filter Button Rendering', () => {
        test('should render filter button in each column header', () => {
            const grid = new OpenGrid('test-grid', testData, 400);
            
            const filterButtons = container.querySelectorAll('.opengridjs-filter-button');
            const headers = container.querySelectorAll('.opengridjs-grid-header-item');
            
            expect(filterButtons.length).toBe(headers.length);
            expect(filterButtons.length).toBeGreaterThan(0);
        });

        test('should have correct data-column attribute on filter buttons', () => {
            const grid = new OpenGrid('test-grid', testData, 400);
            
            const filterButtons = container.querySelectorAll('.opengridjs-filter-button');
            const columnNames = Object.keys(testData[0]);
            
            filterButtons.forEach((button, index) => {
                expect(button.getAttribute('data-column')).toBe(columnNames[index]);
            });
        });
    });

    describe('Filter Menu Display', () => {
        test('should show filter menu when filter button is clicked', () => {
            const grid = new OpenGrid('test-grid', testData, 400);
            
            const filterButton = container.querySelector('.opengridjs-filter-button');
            filterButton.click();
            
            const filterMenu = document.querySelector('.opengridjs-filter-menu');
            expect(filterMenu).toBeTruthy();
        });

        test('should close filter menu when clicking same button again', () => {
            const grid = new OpenGrid('test-grid', testData, 400);
            
            const filterButton = container.querySelector('.opengridjs-filter-button');
            filterButton.click();
            
            let filterMenu = document.querySelector('.opengridjs-filter-menu');
            expect(filterMenu).toBeTruthy();
            
            filterButton.click();
            filterMenu = document.querySelector('.opengridjs-filter-menu');
            expect(filterMenu).toBeFalsy();
        });

        test('should close existing menu when opening a different column filter', () => {
            const grid = new OpenGrid('test-grid', testData, 400);
            
            const filterButtons = container.querySelectorAll('.opengridjs-filter-button');
            filterButtons[0].click();
            
            let filterMenu = document.querySelector('.opengridjs-filter-menu');
            expect(filterMenu.getAttribute('data-column')).toBe('id');
            
            filterButtons[1].click();
            filterMenu = document.querySelector('.opengridjs-filter-menu');
            expect(filterMenu.getAttribute('data-column')).toBe('name');
            
            const allMenus = document.querySelectorAll('.opengridjs-filter-menu');
            expect(allMenus.length).toBe(1);
        });
    });

    describe('Unique Values Display', () => {
        test('should display all unique values for a column', () => {
            const grid = new OpenGrid('test-grid', testData, 400);
            
            const departmentButton = container.querySelector('[data-column="department"]');
            departmentButton.click();
            
            const filterOptions = document.querySelectorAll('.opengridjs-filter-option span');
            const uniqueDepartments = ['Engineering', 'HR', 'Sales'];
            
            const displayedValues = Array.from(filterOptions).map(span => span.textContent);
            uniqueDepartments.forEach(dept => {
                expect(displayedValues).toContain(dept);
            });
        });

        test('should handle null and undefined values', () => {
            const dataWithNulls = [
                { id: 1, name: 'Alice', value: null },
                { id: 2, name: 'Bob', value: undefined },
                { id: 3, name: 'Charlie', value: '' },
                { id: 4, name: 'Diana', value: 'test' }
            ];
            
            const grid = new OpenGrid('test-grid', dataWithNulls, 400);
            
            const valueButton = container.querySelector('[data-column="value"]');
            valueButton.click();
            
            const filterOptions = document.querySelectorAll('.opengridjs-filter-option span');
            const displayedValues = Array.from(filterOptions).map(span => span.textContent);
            
            expect(displayedValues).toContain('(Empty)');
            expect(displayedValues).toContain('test');
        });
    });

    describe('Select All / Clear All', () => {
        test('should select all checkboxes when Select All is clicked', () => {
            const grid = new OpenGrid('test-grid', testData, 400);
            
            const filterButton = container.querySelector('.opengridjs-filter-button');
            filterButton.click();
            
            const selectAllBtn = document.querySelector('.opengridjs-filter-select-all');
            const checkboxes = document.querySelectorAll('.opengridjs-filter-option input[type="checkbox"]');
            
            // First uncheck some
            checkboxes[0].checked = false;
            checkboxes[1].checked = false;
            
            selectAllBtn.click();
            
            checkboxes.forEach(checkbox => {
                expect(checkbox.checked).toBe(true);
            });
        });

        test('should clear all checkboxes when Clear All is clicked', () => {
            const grid = new OpenGrid('test-grid', testData, 400);
            
            const filterButton = container.querySelector('.opengridjs-filter-button');
            filterButton.click();
            
            const clearAllBtn = document.querySelector('.opengridjs-filter-clear-all');
            const checkboxes = document.querySelectorAll('.opengridjs-filter-option input[type="checkbox"]');
            
            clearAllBtn.click();
            
            checkboxes.forEach(checkbox => {
                expect(checkbox.checked).toBe(false);
            });
        });
    });

    describe('Search Within Filter', () => {
        test('should filter options based on search input', () => {
            const grid = new OpenGrid('test-grid', testData, 400);
            
            const nameButton = container.querySelector('[data-column="name"]');
            nameButton.click();
            
            const searchInput = document.querySelector('.opengridjs-filter-search-input');
            const options = document.querySelectorAll('.opengridjs-filter-option');
            
            // Simulate typing "a" in search
            searchInput.value = 'a';
            searchInput.dispatchEvent(new Event('input'));
            
            // Check which options are visible
            options.forEach(option => {
                const text = option.querySelector('span').textContent.toLowerCase();
                if (text.includes('a')) {
                    expect(option.style.display).not.toBe('none');
                } else {
                    expect(option.style.display).toBe('none');
                }
            });
        });
    });

    describe('Filter Application', () => {
        test('should filter grid data when filter is applied', () => {
            const grid = new OpenGrid('test-grid', testData, 400);
            
            const departmentButton = container.querySelector('[data-column="department"]');
            departmentButton.click();
            
            // Uncheck all except Engineering
            const checkboxes = document.querySelectorAll('.opengridjs-filter-option input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                const label = checkbox.parentElement.querySelector('span').textContent;
                checkbox.checked = label === 'Engineering';
            });
            
            const applyBtn = document.querySelector('.opengridjs-filter-apply');
            applyBtn.click();
            
            // Check that grid data is filtered
            expect(grid.gridData.length).toBe(3); // Only Engineering entries
            grid.gridData.forEach(item => {
                expect(item.data.department).toBe('Engineering');
            });
        });

        test('should handle multiple column filters simultaneously', () => {
            const grid = new OpenGrid('test-grid', testData, 400);
            
            // Apply department filter
            let filterButton = container.querySelector('[data-column="department"]');
            filterButton.click();
            
            let checkboxes = document.querySelectorAll('.opengridjs-filter-option input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                const label = checkbox.parentElement.querySelector('span').textContent;
                checkbox.checked = label === 'Sales' || label === 'Engineering';
            });
            
            let applyBtn = document.querySelector('.opengridjs-filter-apply');
            applyBtn.click();
            
            // Apply active filter
            filterButton = container.querySelector('[data-column="active"]');
            filterButton.click();
            
            checkboxes = document.querySelectorAll('.opengridjs-filter-option input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                const label = checkbox.parentElement.querySelector('span').textContent;
                checkbox.checked = label === 'true';
            });
            
            applyBtn = document.querySelector('.opengridjs-filter-apply');
            applyBtn.click();
            
            // Check combined filter result
            grid.gridData.forEach(item => {
                expect(['Sales', 'Engineering']).toContain(item.data.department);
                expect(item.data.active).toBe(true);
            });
        });

        test('should remove filter when all values are selected', () => {
            const grid = new OpenGrid('test-grid', testData, 400);
            
            // First apply a filter
            const departmentButton = container.querySelector('[data-column="department"]');
            departmentButton.click();
            
            const clearAllBtn = document.querySelector('.opengridjs-filter-clear-all');
            clearAllBtn.click();
            
            // Check only Engineering
            const checkboxes = document.querySelectorAll('.opengridjs-filter-option input[type="checkbox"]');
            checkboxes[0].checked = true;
            
            let applyBtn = document.querySelector('.opengridjs-filter-apply');
            applyBtn.click();
            
            expect(grid.columnFilters['department']).toBeDefined();
            
            // Now select all values again
            departmentButton.click();
            const selectAllBtn = document.querySelector('.opengridjs-filter-select-all');
            selectAllBtn.click();
            
            applyBtn = document.querySelector('.opengridjs-filter-apply');
            applyBtn.click();
            
            // Filter should be removed
            expect(grid.columnFilters['department']).toBeUndefined();
            expect(grid.gridData.length).toBe(testData.length);
        });
    });

    describe('Visual Indicators', () => {
        test('should show active filter indicator when filter is applied', () => {
            const grid = new OpenGrid('test-grid', testData, 400);
            
            const departmentButton = container.querySelector('[data-column="department"]');
            departmentButton.click();
            
            // Apply a filter
            const checkboxes = document.querySelectorAll('.opengridjs-filter-option input[type="checkbox"]');
            checkboxes[0].checked = false;
            
            const applyBtn = document.querySelector('.opengridjs-filter-apply');
            applyBtn.click();
            
            // Check for active class
            expect(departmentButton.classList.contains('opengridjs-filter-active')).toBe(true);
        });

        test('should remove active indicator when filter is cleared', () => {
            const grid = new OpenGrid('test-grid', testData, 400);
            
            const departmentButton = container.querySelector('[data-column="department"]');
            
            // Apply a filter first
            departmentButton.click();
            const checkboxes = document.querySelectorAll('.opengridjs-filter-option input[type="checkbox"]');
            checkboxes[0].checked = false;
            let applyBtn = document.querySelector('.opengridjs-filter-apply');
            applyBtn.click();
            
            expect(departmentButton.classList.contains('opengridjs-filter-active')).toBe(true);
            
            // Clear the filter
            grid.clearAllFilters();
            
            expect(departmentButton.classList.contains('opengridjs-filter-active')).toBe(false);
        });
    });

    describe('Public API Methods', () => {
        test('clearAllFilters should remove all active filters', () => {
            const grid = new OpenGrid('test-grid', testData, 400);
            
            // Apply multiple filters
            grid.columnFilters = {
                department: new Set(['Engineering']),
                active: new Set([true])
            };
            grid.applyAllFilters();
            
            expect(Object.keys(grid.columnFilters).length).toBe(2);
            
            grid.clearAllFilters();
            
            expect(Object.keys(grid.columnFilters).length).toBe(0);
            expect(grid.gridData.length).toBe(testData.length);
        });

        test('should preserve other functionality like sorting with filters', () => {
            const grid = new OpenGrid('test-grid', testData, 400);
            
            // Apply a filter
            const departmentButton = container.querySelector('[data-column="department"]');
            departmentButton.click();
            
            const checkboxes = document.querySelectorAll('.opengridjs-filter-option input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                const label = checkbox.parentElement.querySelector('span').textContent;
                checkbox.checked = label === 'Engineering';
            });
            
            const applyBtn = document.querySelector('.opengridjs-filter-apply');
            applyBtn.click();
            
            // Apply sorting
            const nameHeader = container.querySelector('[data-header="name"]');
            nameHeader.click();
            
            // Check that data is both filtered and sorted
            expect(grid.gridData.length).toBe(3);
            const names = grid.gridData.map(item => item.data.name);
            expect(names).toEqual(['Alice', 'Charlie', 'Frank']);
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty dataset', () => {
            const grid = new OpenGrid('test-grid', [], 400);
            
            // Should not throw error
            expect(() => {
                const filterButtons = container.querySelectorAll('.opengridjs-filter-button');
                if (filterButtons[0]) {
                    filterButtons[0].click();
                }
            }).not.toThrow();
        });

        test('should handle columns with all same values', () => {
            const sameValueData = [
                { id: 1, status: 'active' },
                { id: 2, status: 'active' },
                { id: 3, status: 'active' }
            ];
            
            const grid = new OpenGrid('test-grid', sameValueData, 400);
            
            const statusButton = container.querySelector('[data-column="status"]');
            statusButton.click();
            
            const options = document.querySelectorAll('.opengridjs-filter-option');
            expect(options.length).toBe(1);
        });
    });
});