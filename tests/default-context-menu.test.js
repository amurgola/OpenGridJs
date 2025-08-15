/**
 * Tests for default context menu functionality including Copy Row and Export to CSV
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

describe('Default Context Menu', () => {
    let container;
    let testData;
    let grid;

    beforeEach(() => {
        container = document.createElement('div');
        container.className = 'test-grid';
        document.body.appendChild(container);

        testData = [
            { id: 1, name: 'Alice', role: 'Developer', email: 'alice@example.com' },
            { id: 2, name: 'Bob', role: 'Designer', email: 'bob@example.com' },
            { id: 3, name: 'Charlie', role: 'Manager', email: 'charlie@example.com' }
        ];

        // Create grid without context menu options (should create default)
        grid = new OpenGrid('test-grid', testData, 400);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    test('should create default context menu when none provided', () => {
        const gridRows = container.querySelectorAll('.opengridjs-grid-row');
        expect(gridRows.length).toBeGreaterThan(0);

        // Simulate right-click on first row
        const firstRow = gridRows[0];
        const contextMenuEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: 100,
            clientY: 100
        });

        firstRow.dispatchEvent(contextMenuEvent);

        // Check if context menu appears
        const contextMenu = container.querySelector('.opengridjs-contextMenu');
        expect(contextMenu).toBeTruthy();

        // Check if default options are present
        const menuButtons = contextMenu.querySelectorAll('.opengridjs-context-menu-button');
        expect(menuButtons.length).toBe(2);

        const buttonTexts = Array.from(menuButtons).map(btn => btn.textContent);
        expect(buttonTexts).toContain('Copy Row');
        expect(buttonTexts).toContain('Export to CSV');
    });

    test('should mark built-in functions correctly', () => {
        const gridRows = container.querySelectorAll('.opengridjs-grid-row');
        const firstRow = gridRows[0];
        
        const contextMenuEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: 100,
            clientY: 100
        });

        firstRow.dispatchEvent(contextMenuEvent);

        const menuButtons = container.querySelectorAll('.opengridjs-context-menu-button');
        
        menuButtons.forEach(button => {
            const isBuiltIn = button.getAttribute('data-built-in');
            expect(isBuiltIn).toBe('true');
        });
    });

    test('should have proper CSS classes for default menu items', () => {
        const gridRows = container.querySelectorAll('.opengridjs-grid-row');
        const firstRow = gridRows[0];
        
        const contextMenuEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: 100,
            clientY: 100
        });

        firstRow.dispatchEvent(contextMenuEvent);

        const copyButton = container.querySelector('.opengridjs-copy-row');
        const exportButton = container.querySelector('.opengridjs-export-csv');

        expect(copyButton).toBeTruthy();
        expect(exportButton).toBeTruthy();
        expect(copyButton.getAttribute('data-action')).toBe('copyRow');
        expect(exportButton.getAttribute('data-action')).toBe('exportToCSV');
    });

    test('should use "Actions" as default title when none provided', () => {
        const gridRows = container.querySelectorAll('.opengridjs-grid-row');
        const firstRow = gridRows[0];
        
        const contextMenuEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: 100,
            clientY: 100
        });

        firstRow.dispatchEvent(contextMenuEvent);

        const title = container.querySelector('.opengridjs-title');
        expect(title).toBeTruthy();
        expect(title.textContent).toBe('Actions');
    });

    test('should handle copy row functionality', async () => {
        // Mock clipboard API and secure context
        const mockWriteText = jest.fn().mockResolvedValue();
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: mockWriteText
            },
            writable: true
        });
        Object.defineProperty(window, 'isSecureContext', {
            value: true,
            writable: true
        });

        const testRowData = { id: 1, name: 'Alice', role: 'Developer' };
        
        // Test copyRow method directly
        await grid.copyRow(testRowData);

        expect(mockWriteText).toHaveBeenCalledWith('id: 1\nname: Alice\nrole: Developer');
    });

    test('should handle export functionality', () => {
        // Mock URL.createObjectURL and document methods
        const mockCreateObjectURL = jest.fn().mockReturnValue('blob:mock-url');
        const mockClick = jest.fn();
        const mockAppendChild = jest.fn();
        const mockRemoveChild = jest.fn();

        global.URL.createObjectURL = mockCreateObjectURL;
        
        const mockLink = {
            href: '',
            setAttribute: jest.fn(),
            click: mockClick
        };

        jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
        jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
        jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

        // Test exportToCSV method directly
        grid.exportToCSV();

        expect(mockCreateObjectURL).toHaveBeenCalled();
        expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
        expect(mockClick).toHaveBeenCalled();
        expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
        expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'export.csv');

        // Restore mocks
        document.createElement.mockRestore();
        document.body.appendChild.mockRestore();
        document.body.removeChild.mockRestore();
    });
});