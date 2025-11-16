/**
 * Test Suite 2.1: Constructor & Initialization
 * Phase 2 - Core Functionality Tests
 *
 * Coverage targets:
 * - Lines 7-60 (constructor)
 * - Lines 72-78 (GUID generation)
 * - Lines 80-101 (initGrid, processData)
 */

const OpenGrid = require('../src/opengrid.js');

describe('OpenGrid Constructor & Initialization', () => {
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

    describe('Constructor with Sync Data', () => {
        test('should initialize with sync array data', () => {
            const data = [
                { id: 1, name: 'Alice', age: 30 },
                { id: 2, name: 'Bob', age: 25 }
            ];

            const grid = new OpenGrid('test-grid', data, 400);

            expect(grid.className).toBe('test-grid');
            expect(grid.gridRowPxSize).toBe(35);
            expect(grid.gridRowPxVisibleArea).toBe(400);
            expect(grid.originalData).toEqual(data);
            expect(grid.gridData.length).toBe(2);
        });

        test('should initialize with empty array', () => {
            const grid = new OpenGrid('test-grid', [], 400);

            expect(grid.gridData).toEqual([]);
            expect(grid.originalData).toEqual([]);
            expect(grid.gridColumnNames).toBeUndefined();
        });

        test('should initialize with single row', () => {
            const data = [{ id: 1, name: 'Single' }];

            const grid = new OpenGrid('test-grid', data, 400);

            expect(grid.gridData.length).toBe(1);
            expect(grid.gridData[0].data).toEqual(data[0]);
        });

        test('should auto-detect column names from data', () => {
            const data = [
                { id: 1, name: 'Alice', email: 'alice@example.com', active: true }
            ];

            const grid = new OpenGrid('test-grid', data, 400);

            expect(grid.gridColumnNames).toHaveLength(4);
            expect(grid.gridColumnNames[0]).toEqual({ headerName: 'id', field: 'id' });
            expect(grid.gridColumnNames[1]).toEqual({ headerName: 'name', field: 'name' });
            expect(grid.gridColumnNames[2]).toEqual({ headerName: 'email', field: 'email' });
            expect(grid.gridColumnNames[3]).toEqual({ headerName: 'active', field: 'active' });
        });
    });

    describe('Constructor with Async Data', () => {
        test('should initialize with async Promise data', async () => {
            const asyncData = () => Promise.resolve([
                { id: 1, name: 'Async User 1' },
                { id: 2, name: 'Async User 2' }
            ]);

            const grid = new OpenGrid('test-grid', asyncData, 400);

            // Wait for async initialization
            await new Promise(resolve => setTimeout(resolve, 50));

            expect(grid.originalData).toHaveLength(2);
            expect(grid.gridData).toHaveLength(2);
            expect(grid.gridData[0].data.name).toBe('Async User 1');
        });

        test('should handle async data with auto-resize', async () => {
            const asyncData = () => Promise.resolve([
                { id: 1, col1: 'A', col2: 'B' }
            ]);

            const grid = new OpenGrid('test-grid', asyncData, 400);

            // Wait for async init + setTimeout for auto-resize
            await new Promise(resolve => setTimeout(resolve, 50));

            expect(grid.gridData).toHaveLength(1);
        });
    });

    describe('Constructor with Custom Setup', () => {
        test('should initialize with custom context menu options', () => {
            const data = [{ id: 1, name: 'Test' }];
            const setup = {
                contextMenuOptions: [
                    { actionName: 'Custom Action', actionFunctionName: 'customFunc', className: 'custom' }
                ]
            };

            const grid = new OpenGrid('test-grid', data, 400, setup);

            expect(grid.contextMenuItems).toEqual(setup.contextMenuOptions);
        });

        test('should initialize with custom context menu title', () => {
            const data = [{ id: 1, name: 'Test' }];
            const setup = {
                contextMenuTitle: 'Custom Menu Title'
            };

            const grid = new OpenGrid('test-grid', data, 400, setup);

            expect(grid.contextMenuTitle).toBe('Custom Menu Title');
        });

        test('should initialize with custom column header names', () => {
            const data = [{ id: 1, firstName: 'John', lastName: 'Doe' }];
            const setup = {
                columnHeaderNames: [
                    { columnName: 'id', columnNameDisplay: 'ID', columnWidth: '50px' },
                    { columnName: 'firstName', columnNameDisplay: 'First Name', columnWidth: '150px' },
                    { columnName: 'lastName', columnNameDisplay: 'Last Name', columnWidth: '150px' }
                ]
            };

            const grid = new OpenGrid('test-grid', data, 400, setup);

            expect(grid.headerData).toHaveLength(3);
            expect(grid.headerData[0].headerName).toBe('ID');
            expect(grid.headerData[1].headerName).toBe('First Name');
        });

        test('should initialize with loadMoreDataFunction', () => {
            const data = [{ id: 1, name: 'Test' }];
            const loadMoreFunc = jest.fn();

            const grid = new OpenGrid('test-grid', data, 400, {}, loadMoreFunc);

            expect(grid.loadMoreDataFunction).toBe(loadMoreFunc);
            expect(grid.canLoadMoreData).toBe(true);
            expect(grid.isLoadingMoreData).toBe(false);
        });
    });

    describe('GUID Generation', () => {
        test('should generate GUID for rows with missing id', () => {
            const data = [
                { name: 'No ID 1' },
                { name: 'No ID 2' }
            ];

            const grid = new OpenGrid('test-grid', data, 400);

            expect(grid.gridData[0].data.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
            expect(grid.gridData[1].data.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
            expect(grid.gridData[0].data.id).not.toBe(grid.gridData[1].data.id);
        });

        test('should generate GUID for rows with null id', () => {
            const data = [{ id: null, name: 'Null ID' }];

            const grid = new OpenGrid('test-grid', data, 400);

            expect(grid.gridData[0].data.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        });

        test('should generate GUID for rows with empty string id', () => {
            const data = [{ id: '', name: 'Empty ID' }];

            const grid = new OpenGrid('test-grid', data, 400);

            expect(grid.gridData[0].data.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        });

        test('should preserve existing valid ids', () => {
            const data = [
                { id: 'custom-id-1', name: 'Custom 1' },
                { id: 999, name: 'Custom 2' }
            ];

            const grid = new OpenGrid('test-grid', data, 400);

            expect(grid.gridData[0].data.id).toBe('custom-id-1');
            expect(grid.gridData[1].data.id).toBe(999);
        });
    });

    describe('Grid Instance Binding', () => {
        test('should bind grid instance to root element', () => {
            const data = [{ id: 1, name: 'Test' }];

            const grid = new OpenGrid('test-grid', data, 400);

            expect(container.gridInstance).toBe(grid);
            expect(container.classList.contains('opengridjs-grid')).toBe(true);
        });

        test('should create grid structure with proper class names', () => {
            const data = [{ id: 1, name: 'Test' }];

            const grid = new OpenGrid('test-grid', data, 400);

            expect(container.classList.contains('opengridjs-grid-container')).toBe(true);
            expect(container.querySelector('.opengridjs-grid-additional')).toBeTruthy();
            expect(container.querySelector('.opengridjs-grid-header')).toBeTruthy();
            expect(container.querySelector('.opengridjs-grid-rows-container')).toBeTruthy();
        });
    });
});
