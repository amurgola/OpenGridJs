/**
 * Test Suite 2.3: Virtual Scrolling
 * Phase 2 - Core Functionality Tests
 *
 * Coverage targets:
 * - Lines 504-523 (renderVisible)
 * - Lines 525-562 (addRow, removeRow)
 * - Lines 847-854 (isNearBottom)
 * - Scroll position calculations
 */

const OpenGrid = require('../src/opengrid.js');

describe('OpenGrid Virtual Scrolling', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.className = 'test-grid';
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    });

    describe('renderVisible Method', () => {
        test('should render only visible rows initially', () => {
            // Create 100 rows, but only ~11 can fit in 400px viewport (35px per row)
            const data = Array.from({ length: 100 }, (_, i) => ({
                id: i,
                name: `Row ${i}`
            }));

            const grid = new OpenGrid('test-grid', data, 400);

            const renderedRows = container.querySelectorAll('.opengridjs-grid-row');
            // Should render visible items + buffer
            expect(renderedRows.length).toBeLessThan(100);
            expect(renderedRows.length).toBeGreaterThan(0);
        });

        test('should set correct row positions using top style', () => {
            const data = Array.from({ length: 5 }, (_, i) => ({ id: i }));

            const grid = new OpenGrid('test-grid', data, 400);

            const rows = container.querySelectorAll('.opengridjs-grid-row');
            expect(rows[0].style.top).toBe('0px');
            expect(rows[1].style.top).toBe('35px');
            expect(rows[2].style.top).toBe('70px');
        });

        test('should update isRendered flag when row is added', () => {
            const data = [{ id: 1, name: 'Test' }];

            const grid = new OpenGrid('test-grid', data, 400);

            // Find the item that's been rendered
            const renderedItems = grid.gridData.filter(item => item.isRendered);
            expect(renderedItems.length).toBeGreaterThan(0);
        });
    });

    describe('addRow Method', () => {
        test('should add row to DOM with correct data-id', () => {
            const data = [{ id: 'test-123', name: 'Test Row' }];

            const grid = new OpenGrid('test-grid', data, 400);

            const row = container.querySelector('.opengridjs-grid-row');
            expect(row.getAttribute('data-id')).toBe('test-123');
        });

        test('should create correct number of column items', () => {
            const data = [{
                id: 1,
                col1: 'A',
                col2: 'B',
                col3: 'C'
            }];

            const grid = new OpenGrid('test-grid', data, 400);

            const columns = container.querySelectorAll('.opengridjs-grid-column-item');
            expect(columns.length).toBe(4); // id + 3 columns
        });

        test('should apply row class name based on position', () => {
            const data = [
                { id: 1, name: 'Row 1' },
                { id: 2, name: 'Row 2' }
            ];

            const grid = new OpenGrid('test-grid', data, 400);

            const row1 = container.querySelector('.opengridjs-grid-row-0');
            const row2 = container.querySelector('.opengridjs-grid-row-35');

            expect(row1).toBeTruthy();
            expect(row2).toBeTruthy();
        });
    });

    describe('removeRow Method', () => {
        test('should remove row from DOM', () => {
            const data = Array.from({ length: 50 }, (_, i) => ({ id: i }));

            const grid = new OpenGrid('test-grid', data, 400);

            const gridRowsContainer = container.querySelector('.opengridjs-grid-rows-container');
            const initialRows = container.querySelectorAll('.opengridjs-grid-row').length;

            // Scroll down to trigger removal of top rows
            gridRowsContainer.scrollTop = 500;
            grid.rerender();

            const rowsAfterScroll = container.querySelectorAll('.opengridjs-grid-row').length;

            // Virtual scrolling should maintain similar number of rows
            expect(rowsAfterScroll).toBeGreaterThan(0);
            expect(rowsAfterScroll).toBeLessThan(50);
        });

        test('should set isRendered to false when row is removed', () => {
            const data = Array.from({ length: 50 }, (_, i) => ({ id: i }));

            const grid = new OpenGrid('test-grid', data, 400);

            // All items outside viewport should have isRendered = false
            const unrenderedItems = grid.gridData.filter(item => !item.isRendered);
            expect(unrenderedItems.length).toBeGreaterThan(0);
        });
    });

    describe('isNearBottom Method', () => {
        test('should return false when not at bottom', () => {
            const data = Array.from({ length: 100 }, (_, i) => ({ id: i }));

            const grid = new OpenGrid('test-grid', data, 400);

            const gridRowsContainer = container.querySelector('.opengridjs-grid-rows-container');
            gridRowsContainer.scrollTop = 0;

            const result = grid.isNearBottom(gridRowsContainer);

            expect(result).toBe(false);
        });

        test('should track loaded positions in loadedAtGridHeight', () => {
            const data = Array.from({ length: 10 }, (_, i) => ({ id: i }));
            let loadMoreCalled = false;
            const loadMoreFunc = () => {
                loadMoreCalled = true;
            };

            const grid = new OpenGrid('test-grid', data, 400, {}, loadMoreFunc);

            expect(grid.loadedAtGridHeight).toBeDefined();
            expect(Array.isArray(grid.loadedAtGridHeight)).toBe(true);
        });
    });

    describe('Grid Rows Container', () => {
        test('should set correct height on rows container', () => {
            const data = Array.from({ length: 10 }, (_, i) => ({ id: i }));

            const grid = new OpenGrid('test-grid', data, 400);

            const gridRowsContainer = container.querySelector('.opengridjs-grid-rows-container');
            expect(gridRowsContainer.style.height).toBe('400px');
        });

        test('should calculate total content height correctly', () => {
            const data = Array.from({ length: 20 }, (_, i) => ({ id: i }));

            const grid = new OpenGrid('test-grid', data, 400);

            const gridRows = container.querySelector('.opengridjs-grid-rows');
            // 20 rows * 35px = 700px
            expect(gridRows.style.height).toBe('700px');
        });
    });
});
