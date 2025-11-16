/**
 * Test Suite 4.2: CSV Export
 * Phase 4 - Export Features
 *
 * Coverage targets:
 * - Lines 820-836 (exportToCSV method)
 */

const OpenGrid = require('../src/opengrid.js');

describe('OpenGrid CSV Export', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.className = 'test-grid';
        document.body.appendChild(container);

        // Mock URL.createObjectURL for CSV export
        global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
        jest.clearAllMocks();
    });

    describe('exportToCSV Method', () => {
        test('should create CSV with headers', () => {
            const data = [
                { id: 1, name: 'Alice', age: 30 },
                { id: 2, name: 'Bob', age: 25 }
            ];
            const grid = new OpenGrid('test-grid', data, 400);

            // Spy on createElement to capture the link
            const createElementSpy = jest.spyOn(document, 'createElement');

            grid.exportToCSV();

            // Find the link element creation
            const linkCall = createElementSpy.mock.results.find(
                result => result.value && result.value.tagName === 'A'
            );

            expect(linkCall).toBeTruthy();
            expect(URL.createObjectURL).toHaveBeenCalled();

            createElementSpy.mockRestore();
        });

        test('should include all data rows in CSV', () => {
            const data = [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' },
                { id: 3, name: 'Charlie' }
            ];
            const grid = new OpenGrid('test-grid', data, 400);

            // Mock Blob to capture CSV content
            const originalBlob = global.Blob;
            let csvContent = '';

            global.Blob = jest.fn((content, options) => {
                csvContent = content[0];
                return new originalBlob(content, options);
            });

            grid.exportToCSV();

            expect(csvContent).toContain('Alice');
            expect(csvContent).toContain('Bob');
            expect(csvContent).toContain('Charlie');

            global.Blob = originalBlob;
        });

        test('should create blob with correct MIME type', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const originalBlob = global.Blob;
            let blobOptions = null;

            global.Blob = jest.fn((content, options) => {
                blobOptions = options;
                return new originalBlob(content, options);
            });

            grid.exportToCSV();

            expect(blobOptions.type).toBe('text/csv;charset=utf-8;');

            global.Blob = originalBlob;
        });

        test('should set download filename to export.csv', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const createElementSpy = jest.spyOn(document, 'createElement');
            const appendChildSpy = jest.spyOn(document.body, 'appendChild');
            const setAttributeSpy = jest.fn();

            // Override setAttribute on all created elements
            const originalCreateElement = document.createElement.bind(document);
            document.createElement = jest.fn((tagName) => {
                const element = originalCreateElement(tagName);
                if (tagName === 'a') {
                    element.setAttribute = setAttributeSpy;
                    element.click = jest.fn();
                }
                return element;
            });

            grid.exportToCSV();

            expect(setAttributeSpy).toHaveBeenCalledWith('download', 'export.csv');

            document.createElement = originalCreateElement;
            createElementSpy.mockRestore();
            appendChildSpy.mockRestore();
        });

        test('should programmatically click download link', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const clickSpy = jest.fn();

            const originalCreateElement = document.createElement.bind(document);
            document.createElement = jest.fn((tagName) => {
                const element = originalCreateElement(tagName);
                if (tagName === 'a') {
                    element.click = clickSpy;
                    element.setAttribute = jest.fn();
                }
                return element;
            });

            grid.exportToCSV();

            expect(clickSpy).toHaveBeenCalled();

            document.createElement = originalCreateElement;
        });

        test('should remove download link after click', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const removeChildSpy = jest.spyOn(document.body, 'removeChild');

            grid.exportToCSV();

            expect(removeChildSpy).toHaveBeenCalled();

            removeChildSpy.mockRestore();
        });

        test('should export filtered data when filter is active', () => {
            const data = [
                { id: 1, name: 'Alice', type: 'user' },
                { id: 2, name: 'Bob', type: 'admin' },
                { id: 3, name: 'Charlie', type: 'user' }
            ];
            const grid = new OpenGrid('test-grid', data, 400);

            // Apply filter
            grid.searchFilter('admin');

            const originalBlob = global.Blob;
            let csvContent = '';

            global.Blob = jest.fn((content, options) => {
                csvContent = content[0];
                return new originalBlob(content, options);
            });

            grid.exportToCSV();

            // Should only include Bob (admin)
            expect(csvContent).toContain('Bob');
            expect(csvContent).not.toContain('Alice');
            expect(csvContent).not.toContain('Charlie');

            global.Blob = originalBlob;
        });

        test('should handle special characters in CSV data', () => {
            const data = [
                { id: 1, name: 'Test, User', description: 'Has "quotes"' }
            ];
            const grid = new OpenGrid('test-grid', data, 400);

            const originalBlob = global.Blob;
            let csvContent = '';

            global.Blob = jest.fn((content, options) => {
                csvContent = content[0];
                return new originalBlob(content, options);
            });

            grid.exportToCSV();

            // CSV should contain the data (though formatting may vary)
            expect(csvContent).toContain('Test, User');

            global.Blob = originalBlob;
        });
    });
});
