/**
 * Test Suite 4.1: Context Menu & Clipboard Operations
 * Phase 4 - Context Menu & Export Features
 *
 * Coverage targets:
 * - Lines 688-773 (createContextMenu)
 * - Lines 775-818 (copyRow, fallbackCopyToClipboard)
 * - Lines 838-845 (closeContextMenu)
 */

const OpenGrid = require('../src/opengrid.js');

describe('OpenGrid Context Menu & Clipboard', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.className = 'test-grid';
        document.body.appendChild(container);

        // Mock clipboard API
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn(() => Promise.resolve())
            }
        });

        // Mock for secure context check
        Object.defineProperty(window, 'isSecureContext', {
            writable: true,
            value: true
        });

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

    describe('Default Context Menu Creation', () => {
        test('should create default context menu with Copy Row and Export CSV', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const row = container.querySelector('.opengridjs-grid-row');
            const contextMenuEvent = new MouseEvent('contextmenu', {
                bubbles: true,
                clientX: 100,
                clientY: 100
            });

            row.dispatchEvent(contextMenuEvent);

            const contextMenu = container.querySelector('.opengridjs-contextMenu');
            expect(contextMenu).toBeTruthy();

            const buttons = contextMenu.querySelectorAll('.opengridjs-context-menu-button');
            expect(buttons.length).toBe(2);
            expect(buttons[0].textContent).toBe('Copy Row');
            expect(buttons[1].textContent).toBe('Export to CSV');
        });

        test('should create context menu with custom options', () => {
            const data = [{ id: 1, name: 'Test' }];
            const setup = {
                contextMenuOptions: [
                    { actionName: 'Custom Action 1', actionFunctionName: 'action1', className: 'custom-1' },
                    { actionName: 'Custom Action 2', actionFunctionName: 'action2', className: 'custom-2' }
                ]
            };

            const grid = new OpenGrid('test-grid', data, 400, setup);

            const row = container.querySelector('.opengridjs-grid-row');
            row.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                clientX: 50,
                clientY: 50
            }));

            const buttons = container.querySelectorAll('.opengridjs-context-menu-button');
            expect(buttons.length).toBe(2);
            expect(buttons[0].textContent).toBe('Custom Action 1');
            expect(buttons[1].textContent).toBe('Custom Action 2');
        });

        test('should set custom context menu title', () => {
            const data = [{ id: 1, name: 'Test' }];
            const setup = {
                contextMenuTitle: 'Row Actions'
            };

            const grid = new OpenGrid('test-grid', data, 400, setup);

            const row = container.querySelector('.opengridjs-grid-row');
            row.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));

            const title = container.querySelector('.opengridjs-title');
            expect(title.textContent).toBe('Row Actions');
        });

        test('should position context menu at mouse coordinates', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const row = container.querySelector('.opengridjs-grid-row');
            const contextMenuEvent = new MouseEvent('contextmenu', {
                bubbles: true,
                clientX: 150,
                clientY: 200
            });

            row.dispatchEvent(contextMenuEvent);

            const contextMenu = container.querySelector('.opengridjs-contextMenu');
            expect(contextMenu.style.left).toContain('px');
            expect(contextMenu.style.top).toContain('px');
        });

        test('should store selected row data in gridSelectedObject', () => {
            const data = [
                { id: 1, name: 'Alice', age: 30 },
                { id: 2, name: 'Bob', age: 25 }
            ];
            const grid = new OpenGrid('test-grid', data, 400);

            const rows = container.querySelectorAll('.opengridjs-grid-row');
            const secondRow = rows[1];

            secondRow.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));

            expect(grid.gridSelectedObject.id).toBe(2);
            expect(grid.gridSelectedObject.name).toBe('Bob');
        });

        test('should add selected class to row on context menu open', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const row = container.querySelector('.opengridjs-grid-row');
            row.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));

            expect(row.classList.contains('opengridjs-selected-grid-row')).toBe(true);
        });
    });

    describe('Context Menu Interactions', () => {
        test('should call built-in copyRow when Copy Row is clicked', () => {
            const data = [{ id: 1, name: 'Test', email: 'test@example.com' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const copyRowSpy = jest.spyOn(grid, 'copyRow');

            const row = container.querySelector('.opengridjs-grid-row');
            row.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));

            const copyButton = Array.from(container.querySelectorAll('.opengridjs-context-menu-button'))
                .find(btn => btn.textContent === 'Copy Row');

            copyButton.click();

            expect(copyRowSpy).toHaveBeenCalled();
        });

        test('should call exportToCSV when Export to CSV is clicked', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const exportSpy = jest.spyOn(grid, 'exportToCSV');

            const row = container.querySelector('.opengridjs-grid-row');
            row.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));

            const exportButton = Array.from(container.querySelectorAll('.opengridjs-context-menu-button'))
                .find(btn => btn.textContent === 'Export to CSV');

            exportButton.click();

            expect(exportSpy).toHaveBeenCalled();
        });

        test('should close context menu after action is clicked', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const row = container.querySelector('.opengridjs-grid-row');
            row.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));

            expect(container.querySelector('.opengridjs-contextMenu')).toBeTruthy();

            const copyButton = Array.from(container.querySelectorAll('.opengridjs-context-menu-button'))
                .find(btn => btn.textContent === 'Copy Row');

            copyButton.click();

            expect(container.querySelector('.opengridjs-contextMenu')).toBeFalsy();
        });
    });

    describe('closeContextMenu Method', () => {
        test('should remove context menu from DOM', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const row = container.querySelector('.opengridjs-grid-row');
            row.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));

            expect(container.querySelector('.opengridjs-contextMenu')).toBeTruthy();

            grid.closeContextMenu();

            expect(container.querySelector('.opengridjs-contextMenu')).toBeFalsy();
        });

        test('should remove selected class from rows', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const row = container.querySelector('.opengridjs-grid-row');
            row.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));

            expect(row.classList.contains('opengridjs-selected-grid-row')).toBe(true);

            grid.closeContextMenu();

            expect(row.classList.contains('opengridjs-selected-grid-row')).toBe(false);
        });

        test('should execute callback action if provided', () => {
            const data = [{ id: 1, name: 'Test', value: 42 }];
            const grid = new OpenGrid('test-grid', data, 400);

            const row = container.querySelector('.opengridjs-grid-row');
            row.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));

            const mockAction = jest.fn();
            grid.closeContextMenu(mockAction);

            expect(mockAction).toHaveBeenCalledWith(grid.gridSelectedObject);
        });

        test('should close context menu when clicking on row', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            const row = container.querySelector('.opengridjs-grid-row');
            row.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));

            expect(container.querySelector('.opengridjs-contextMenu')).toBeTruthy();

            row.click();

            expect(container.querySelector('.opengridjs-contextMenu')).toBeFalsy();
        });
    });

    describe('copyRow Method', () => {
        test('should copy row data to clipboard using Clipboard API', async () => {
            const data = [{ id: 1, name: 'Alice', email: 'alice@test.com', age: 30 }];
            const grid = new OpenGrid('test-grid', data, 400);

            const row = container.querySelector('.opengridjs-grid-row');
            row.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));

            grid.copyRow({ id: 1, name: 'Alice', email: 'alice@test.com', age: 30 });

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(navigator.clipboard.writeText).toHaveBeenCalled();
            const callArg = navigator.clipboard.writeText.mock.calls[0][0];
            expect(callArg).toContain('id: 1');
            expect(callArg).toContain('name: Alice');
            expect(callArg).toContain('email: alice@test.com');
            expect(callArg).toContain('age: 30');
        });

        test('should format row data with key-value pairs', async () => {
            const data = [{ id: 1, status: 'active' }];
            const grid = new OpenGrid('test-grid', data, 400);

            grid.copyRow({ id: 1, status: 'active' });

            await new Promise(resolve => setTimeout(resolve, 10));

            const callArg = navigator.clipboard.writeText.mock.calls[0][0];
            expect(callArg).toBe('id: 1\nstatus: active');
        });

        test('should use fallback when Clipboard API fails', async () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            // Make Clipboard API fail
            navigator.clipboard.writeText = jest.fn(() => Promise.reject(new Error('Clipboard error')));

            const fallbackSpy = jest.spyOn(grid, 'fallbackCopyToClipboard');

            grid.copyRow({ id: 1, name: 'Test' });

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(fallbackSpy).toHaveBeenCalled();
        });

        test('should use fallback in non-secure context', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            // Simulate non-secure context
            Object.defineProperty(window, 'isSecureContext', {
                writable: true,
                value: false
            });

            const fallbackSpy = jest.spyOn(grid, 'fallbackCopyToClipboard');

            grid.copyRow({ id: 1, name: 'Test' });

            expect(fallbackSpy).toHaveBeenCalled();
        });
    });

    describe('fallbackCopyToClipboard Method', () => {
        test('should create temporary textarea for copy', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            // Mock execCommand
            document.execCommand = jest.fn(() => true);

            const text = 'Test copy text';
            grid.fallbackCopyToClipboard(text);

            expect(document.execCommand).toHaveBeenCalledWith('copy');
        });

        test('should remove textarea after copy', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            document.execCommand = jest.fn(() => true);

            const initialTextareas = document.querySelectorAll('textarea').length;

            grid.fallbackCopyToClipboard('Test text');

            const finalTextareas = document.querySelectorAll('textarea').length;
            expect(finalTextareas).toBe(initialTextareas);
        });

        test('should handle execCommand errors gracefully', () => {
            const data = [{ id: 1, name: 'Test' }];
            const grid = new OpenGrid('test-grid', data, 400);

            document.execCommand = jest.fn(() => {
                throw new Error('execCommand failed');
            });

            // Should not throw
            expect(() => grid.fallbackCopyToClipboard('Test')).not.toThrow();
        });
    });
});
