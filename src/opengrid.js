class OpenGrid {
    loadMoreDataFunction = null;
    canLoadMoreData = true;
    isLoadingMoreData = false;
    loadedAtGridHeight = []

    constructor(className, data, gridHeight, setup = {}, loadMoreDataFunction = null) {
        this.className = className;
        this.sortState = { column: null, direction: null };
        this.gridData = [];
        this.headerData = [];
        this.gridRowPxSize = 35;
        this.gridRowPxVisibleArea = gridHeight;
        this.gridSelectedObject = {};
        this.contextMenuItems = setup.contextMenuOptions;
        this.contextMenuTitle = setup.contextMenuTitle;
        this.loadMoreDataFunction = loadMoreDataFunction;
        this.columnFilters = {}; // Store active filters for each column
        this.filteredData = null; // Store filtered data separately

        this.rootElement = document.querySelector(`.${className}`);
        this.rootElement.gridInstance = this;
        this.rootElement.classList.add('opengridjs-grid');

        if (typeof data === 'function') {
            data().then(fetchedData => {
                this.originalData = JSON.parse(JSON.stringify(fetchedData));
                if(fetchedData.length > 0) {
                    this.gridColumnNames = Object.keys(fetchedData[0]).map(key => ({headerName: key, field: key}));
                }
                this.initGrid();
                this.processData(fetchedData);
                this.generateGridHeader(setup);
                this.generateGridRows();
                this.addEventListeners(setup);
            });
        } else {
            this.originalData = JSON.parse(JSON.stringify(data));
            if(data.length > 0){
                this.gridColumnNames = Object.keys(data[0]).map(key => ({headerName: key, field: key}));
            }
            this.initGrid();
            this.processData(data);
            this.generateGridHeader(setup);
            this.generateGridRows();
            this.addEventListeners(setup);
            
            // Calculate content-based minimum widths after initial render
            setTimeout(() => this.updateColumnWidths(), 0);
        }
    } 

    debounce(func, delay) {
        let inDebounce;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(inDebounce);
            inDebounce = setTimeout(() => func.apply(context, args), delay);
        };
    }

    generateGUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    initGrid() {
        this.rootElement.classList.add("opengridjs-grid-container");
        this.rootElement.innerHTML = `
        <div class='opengridjs-grid-additional'></div>
        <div class='opengridjs-grid-header'></div>
        <div class='opengridjs-grid-rows-container'></div>`;
    }

    processData(data) {
        this.gridData = data.map((dataItem, currentPosition) => {
            if (dataItem.id === undefined || dataItem.id === null || dataItem.id === '') {
                dataItem.id = this.generateGUID();
            }
            return {
                data: dataItem,
                position: currentPosition * this.gridRowPxSize,
                isRendered: false
            };
        });
        this.sortData();
        this.createContextMenu(this.contextMenuItems);
    }

    generateGridHeader(setup, headerDataOverride) {
        const gridHeader = this.rootElement.querySelector(".opengridjs-grid-header");
        gridHeader.setAttribute("data-pos", gridHeader.offsetTop);

        if(!headerDataOverride) {
            const headers = setup.columnHeaderNames == null
                ? (this.gridColumnNames || []).map(columnNames => columnNames.headerName)
                : setup.columnHeaderNames.map(headerName => headerName.columnName);

            const headerData = [];

            const gridItemWidth = 100 / headers.length;
            const gridItemWidthStyle = `width:${gridItemWidth}%`;

            if(setup.columnHeaderNames == null){
                for(let i = 0; i < headers.length; i++){
                    headerData.push({
                        data: headers[i],
                        headerName: headers[i],
                        width: gridItemWidthStyle });
                }
            } else {
                for(let i = 0; i < setup.columnHeaderNames.length; i++){
                    headerData.push({
                        data: setup.columnHeaderNames[i].columnName,
                        headerName: setup.columnHeaderNames[i].columnNameDisplay ?? setup.columnHeaderNames[i].columnName,
                        width: setup.columnHeaderNames[i].columnWidth ? `min-width:${setup.columnHeaderNames[i].columnWidth}` : gridItemWidthStyle,
                        format: setup.columnHeaderNames[i].format,
                    });
                }
            }
            this.headerData = headerData;
        }

        gridHeader.innerHTML = this.headerData.map(header => {
            if (!header || !header.width) {
                console.warn('Invalid header data:', header);
                return '';
            }
            const headerStyle = this.getColumnStyle(header);
            return `<div class='opengridjs-grid-header-item' draggable="true" data-header='${header.data}' style='${headerStyle}'>
                <span class='opengridjs-header-text'>${header.headerName}</span>
                <span class='opengridjs-header-actions'>
                    <span class='opengridjs-filter-button' data-column='${header.data}' title='Filter'>▼</span>
                    <span class='opengridjs-sort-indicator'></span>
                </span>
                <span class='opengridjs-resize-handle'></span>
            </div>`;
        }).filter(html => html !== '').join('');

        const headerItems = Array.from(gridHeader.getElementsByClassName('opengridjs-grid-header-item'));
        var headerOrder = 0;
        headerItems.forEach(headerItem => {
            const sortDirection = this.headerData.find(x => x.data == headerItem.getAttribute('data-header')).sortDirection;
            if(sortDirection) {
                headerItem.classList.add(sortDirection === 'asc' ? 'opengridjs-sort-asc' : 'opengridjs-sort-desc');
            }

            headerItem.setAttribute('data-order', headerOrder++);
            headerItem.addEventListener('dragenter', e => this.dragOver(e));
            
            const resizeHandle = headerItem.querySelector('.opengridjs-resize-handle');
            if(resizeHandle) {
                this.addResizeHandleEvents(resizeHandle, headerItem);
            }
        });
    }

    dragOver(e) {
        e.preventDefault();

        if(e.relatedTarget && e.relatedTarget.classList.contains('opengridjs-grid-header-item') && !e.target.classList.contains('opengridjs-sort-indicator')) {
            const relatedTargetOrder = parseInt(e.relatedTarget.getAttribute('data-order'));
            const currentOrder = parseInt(e.target.getAttribute('data-order'));

            // Validate indices
            if (isNaN(relatedTargetOrder) || isNaN(currentOrder) || 
                relatedTargetOrder < 0 || currentOrder < 0 ||
                relatedTargetOrder >= this.headerData.length || currentOrder >= this.headerData.length ||
                !this.headerData[relatedTargetOrder] || !this.headerData[currentOrder]) {
                return;
            }

            const temp = this.headerData[relatedTargetOrder];
            this.headerData[relatedTargetOrder] = this.headerData[currentOrder];
            this.headerData[currentOrder] = temp;

            this.generateGridHeader(null, this.headerData);
            this.rerender();
        }
    }

    addResizeHandleEvents(resizeHandle, headerItem) {
        let isResizing = false;
        let startX = 0;
        let startWidth = 0;
        let headerIndex = 0;
        let wasResizing = false;

        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            isResizing = true;
            startX = e.clientX;
            startWidth = headerItem.offsetWidth;
            headerIndex = parseInt(headerItem.getAttribute('data-order'));
            
            headerItem.classList.add('opengridjs-resizing');
            headerItem.setAttribute('draggable', 'false');
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });

        resizeHandle.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.autoResizeColumns();
        });

        const handleMouseMove = (e) => {
            if (!isResizing) return;
            
            const deltaX = e.clientX - startX;
            const minAllowedWidth = this.headerData[headerIndex].contentMinWidth || 80;
            const newWidth = Math.max(minAllowedWidth, startWidth + deltaX);
            
            this.headerData[headerIndex].width = `min-width:${newWidth}px`;
            headerItem.style.width = `${newWidth}px`;
            headerItem.style.flexGrow = '0';
            headerItem.style.flexShrink = '0';
            
            this.updateColumnWidths();
        };

        const handleMouseUp = () => {
            if (!isResizing) return;
            
            wasResizing = true;
            isResizing = false;
            headerItem.classList.remove('opengridjs-resizing');
            headerItem.setAttribute('draggable', 'true');
            
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            this.rerender();
            
            // Reset the flag after a short delay to prevent sort trigger
            setTimeout(() => {
                wasResizing = false;
            }, 10);
        };
        
        // Store reference to wasResizing flag on the header item
        headerItem._wasResizing = () => wasResizing;
    }

    updateColumnWidths() {
        // Calculate content-based minimum widths first
        this.calculateContentMinWidths();
        
        const gridRows = this.rootElement.querySelectorAll('.opengridjs-grid-row');
        gridRows.forEach(row => {
            const columnItems = row.querySelectorAll('.opengridjs-grid-column-item');
            columnItems.forEach((item, index) => {
                if (this.headerData[index]) {
                    const columnStyle = this.getColumnStyle(this.headerData[index]);
                    item.style.cssText = columnStyle;
                }
            });
        });
        
        // Update header widths to match
        this.updateHeaderWidths();
    }

    calculateContentMinWidths() {
        // Get a sample of visible rows to calculate content widths
        const visibleRows = this.rootElement.querySelectorAll('.opengridjs-grid-row');
        const headerItems = this.rootElement.querySelectorAll('.opengridjs-grid-header-item');
        
        this.headerData.forEach((header, columnIndex) => {
            let maxContentWidth = 0;
            
            // Check header content width (text + actions)
            if (headerItems[columnIndex]) {
                const headerText = headerItems[columnIndex].querySelector('.opengridjs-header-text');
                const headerActions = headerItems[columnIndex].querySelector('.opengridjs-header-actions');
                
                if (headerText) {
                    const headerTextWidth = this.measureTextWidth(headerText.textContent, headerText);
                    let headerActionsWidth = 0;
                    
                    // Estimate actions width (filter button + sort indicator + gap)
                    if (headerActions) {
                        headerActionsWidth = 50; // Approximate width for filter button + sort indicator + spacing
                    }
                    
                    // Add padding (16px each side = 32px total) + actions width
                    const totalHeaderWidth = headerTextWidth + headerActionsWidth + 32;
                    maxContentWidth = Math.max(maxContentWidth, totalHeaderWidth);
                }
            }
            
            // Check a sample of cell contents
            const sampleSize = Math.min(10, visibleRows.length); // Only check first 10 rows for performance
            for (let i = 0; i < sampleSize; i++) {
                const row = visibleRows[i];
                const cell = row.querySelectorAll('.opengridjs-grid-column-item')[columnIndex];
                if (cell) {
                    const cellWidth = this.measureTextWidth(cell.textContent, cell);
                    // Add same padding as headers (16px each side = 32px total)
                    const totalCellWidth = cellWidth + 32;
                    maxContentWidth = Math.max(maxContentWidth, totalCellWidth);
                }
            }
            
            // Enforce minimum width of 80px
            header.contentMinWidth = Math.max(80, maxContentWidth);
        });
    }

    measureTextWidth(text, element) {
        try {
            // Create a temporary element to measure text width
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (!context) {
                throw new Error('Canvas context not available');
            }
            
            // Get computed styles from the element
            const styles = window.getComputedStyle(element);
            context.font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
            
            // Measure the text
            const metrics = context.measureText(text || '');
            return Math.ceil(metrics.width);
        } catch (error) {
            // Fallback for environments without canvas support (like JSDOM tests)
            return this.estimateTextWidth(text, element);
        }
    }

    estimateTextWidth(text, element) {
        // Fallback method using DOM measurement
        const testElement = document.createElement('span');
        testElement.style.position = 'absolute';
        testElement.style.visibility = 'hidden';
        testElement.style.whiteSpace = 'nowrap';
        testElement.style.pointerEvents = 'none';
        
        // Copy relevant styles from the original element
        if (element && window.getComputedStyle) {
            const styles = window.getComputedStyle(element);
            testElement.style.font = styles.font;
            testElement.style.fontSize = styles.fontSize;
            testElement.style.fontFamily = styles.fontFamily;
            testElement.style.fontWeight = styles.fontWeight;
        } else {
            // Default styles for test environments
            testElement.style.fontSize = '14px';
            testElement.style.fontFamily = 'Arial, sans-serif';
            testElement.style.fontWeight = 'normal';
        }
        
        testElement.textContent = text || '';
        document.body.appendChild(testElement);
        
        let width = testElement.offsetWidth;
        document.body.removeChild(testElement);
        
        // If DOM measurement fails (like in JSDOM), use character-based estimation
        if (width === 0 && text) {
            // Rough estimation: assume average character width of 7px for 14px font
            const avgCharWidth = 7;
            width = (text.length * avgCharWidth);
        }
        
        return width;
    }

    updateHeaderWidths() {
        const headerItems = this.rootElement.querySelectorAll('.opengridjs-grid-header-item');
        headerItems.forEach((headerItem, index) => {
            if (this.headerData[index]) {
                const columnStyle = this.getColumnStyle(this.headerData[index]);
                headerItem.style.cssText = columnStyle;
            }
        });
    }

    getColumnStyle(header) {
        let baseStyle = header.width;
        let minWidthConstraint = '';
        
        // Add content-based minimum width if calculated
        if (header.contentMinWidth) {
            minWidthConstraint = `min-width: ${header.contentMinWidth}px; `;
        }
        
        // Ensure consistent styling between headers and cells
        if (header.width.includes('min-width') || header.width.includes('width:')) {
            // Fixed width columns should not grow or shrink, but respect content min-width
            return `${minWidthConstraint}${baseStyle}; flex-grow: 0; flex-shrink: 0; box-sizing: border-box;`;
        } else {
            // Percentage or flex-based columns can grow but still respect content min-width
            return `${minWidthConstraint}${baseStyle}; box-sizing: border-box;`;
        }
    }

    autoResizeColumns() {
        const gridHeader = this.rootElement.querySelector('.opengridjs-grid-header');
        if (!gridHeader) return;

        const containerWidth = gridHeader.offsetWidth;
        const columnCount = this.headerData.length;
        const equalWidth = Math.floor(containerWidth / columnCount);

        // Reset all columns to equal width
        this.headerData.forEach((header, index) => {
            if (header) {
                header.width = `width:${equalWidth}px`;
            }
        });

        // Re-render the grid with new column widths
        this.generateGridHeader(null, this.headerData);
        this.rerender();
    }

    generateGridRows() {
        const gridRowsContainer = this.rootElement.querySelector('.opengridjs-grid-rows-container');
        gridRowsContainer.style.height = `${this.gridRowPxVisibleArea}px`;
        gridRowsContainer.innerHTML = "<div class='opengridjs-grid-rows'></div>";

        const gridRows = this.rootElement.querySelector(".opengridjs-grid-rows");
        gridRows.style.height = `${this.gridRowPxSize * this.gridData.length}px`;

        this.renderVisible(gridRowsContainer, gridRows);
    }

    rerender() {
        if (this.filteredData) {
            // filteredData is already raw data, not grid data items
            this.processData(this.filteredData);
        } else {
            this.processData(this.gridData.map(x => x.data));
        }
        this.generateGridRows();
    }

    renderVisible(gridRowsContainer, gridRows) {
        const currentPosition = gridRowsContainer.scrollTop;
        const visibleItems = this.gridData.filter(data => data.isRendered === false
            && data.position >= currentPosition
            && data.position <= currentPosition + this.gridRowPxVisibleArea);
        const invisibleItems = this.gridData.filter(data => data.isRendered === true
            && data.position < (currentPosition - (this.gridRowPxSize * 2))
            || data.position > (currentPosition + this.gridRowPxVisibleArea)
        );

        visibleItems.forEach(rowItem => {
            this.addRow(gridRows, rowItem);
        });

        invisibleItems.forEach(rowItem => {
            this.removeRow(rowItem);
        });

        this.createContextMenu(this.contextMenuItems);
    }

    addRow(gridRows, rowItem) {
        rowItem.isRendered = true;
        const rowClassName = `opengridjs-grid-row-${rowItem.position}`;
        gridRows.innerHTML += `<div data-id='${rowItem.data.id}' class='opengridjs-grid-row ${rowClassName}' style='top:${rowItem.position}px'></div>`;
        const gridRow = gridRows.getElementsByClassName(rowClassName)[0];

        gridRow.innerHTML = this.headerData.map(header => {
            let found = '&nbsp;';

            if(header.data.includes('.')){
                const keys = header.data.split('.');
                found = rowItem.data;
                keys.forEach(key => {
                    found = found[key];
                });
            }else{
                found = rowItem.data[header.data] ?? '&nbsp;';
            }

            var formatter = header.format;

            if (formatter) {
                found = formatter(found);
            }

            const columnStyle = this.getColumnStyle(header);
            return `<div class='opengridjs-grid-column-item' style='${columnStyle}'>${found}</div>`;
        }).join('');
    }

    removeRow(rowItem) {
        rowItem.isRendered = false;
        const rowClassName = `opengridjs-grid-row-${rowItem.position}`;
        const found = document.querySelector(`.${rowClassName}`);
        if (found) {
            found.remove();
        }
    }

    addEventListeners(setup) {
        const gridRowsContainer = this.rootElement.querySelector('.opengridjs-grid-rows-container');
        const debouncedLoadMore = this.debounce(() => {
            if (this.isNearBottom(gridRowsContainer) && this.canLoadMoreData && !this.isLoadingMoreData) {
                this.isLoadingMoreData = true;
                this.loadMoreDataFunction(() => {
                    this.isLoadingMoreData = false;
                });
            }
        }, 300);
        gridRowsContainer.addEventListener('scroll', debouncedLoadMore);
        gridRowsContainer.addEventListener('scroll', () => {
            this.rerender();
            this.closeContextMenu()

            if (this.isNearBottom(gridRowsContainer) && this.canLoadMoreData && this.loadMoreDataFunction) {
                this.loadMoreDataFunction();
            }
        });
        this.addHeaderActions();
    }

    addHeaderActions() {
        const gridHeader = this.rootElement.querySelector(".opengridjs-grid-header");
        gridHeader.addEventListener('click', e => {
            // Check if click is on filter button
            if (e.target.classList.contains('opengridjs-filter-button')) {
                e.stopPropagation();
                this.toggleFilterMenu(e.target);
                return;
            }
            
            // Check if this click is from a resize operation
            const headerItem = e.target.closest('.opengridjs-grid-header-item');
            if (headerItem && headerItem._wasResizing && headerItem._wasResizing()) {
                return; // Don't sort if we just finished resizing
            }
            
            const header = e.target.getAttribute("data-header") || e.target.closest('.opengridjs-grid-header-item')?.getAttribute("data-header");
            const headerData = this.headerData.find(x => x.data == header);

            if(headerData) {
                headerData.sortDirection = headerData.sortDirection == null || headerData.sortDirection == 'desc' ? 'asc' : 'desc';
                const sortDirection = headerData.sortDirection;

                this.sortState = {
                    header: header,
                    sortDirection: sortDirection
                };

                const headerElements = Array.from(gridHeader.getElementsByClassName('opengridjs-grid-header-item'));
                headerElements.forEach(headerElement => {
                    headerElement.classList.remove('opengridjs-sort-asc', 'opengridjs-sort-desc');
                    if (headerElement.getAttribute('data-header') === header) {
                        headerElement.classList.add(sortDirection === 'asc' ? 'opengridjs-sort-asc' : 'opengridjs-sort-desc');
                    }
                });

                // If filters are active, reapply them with sorting
                if (Object.keys(this.columnFilters).length > 0) {
                    this.applyAllFilters();
                } else {
                    this.sortData();
                    this.rerender();
                }
                this.closeContextMenu()
            }
        });

        // Add right-click context menu for header columns to open filter menu
        gridHeader.addEventListener('contextmenu', e => {
            const headerItem = e.target.closest('.opengridjs-grid-header-item');
            if (headerItem) {
                e.preventDefault();
                e.stopPropagation();
                
                const column = headerItem.getAttribute('data-header');
                if (column) {
                    // Find the filter button for this column and trigger filter menu
                    const filterButton = headerItem.querySelector('.opengridjs-filter-button');
                    if (filterButton) {
                        this.toggleFilterMenu(filterButton);
                    }
                }
            }
        });
    }

    sortData() {
        // Only sort if we have a sort state
        if (!this.sortState.header) return;
        
        this.gridData.sort((a, b) => {
            a = a.data[this.sortState.header];
            b = b.data[this.sortState.header];

            if (a == null) return b == null ? 0 : -1;
            if (b == null) return 1;

            if (this.sortState.sortDirection == 'asc') return a > b ? 1 : (a < b ? -1 : 0);
            if (this.sortState.sortDirection == 'desc') return a > b ? -1 : (a < b ? 1 : 0);
        });
        
        // Recalculate positions after sorting
        this.gridData.forEach((item, index) => {
            item.position = index * this.gridRowPxSize;
            item.isRendered = false; // Force re-render
        });
    }
    searchFilter(term) {
        const filteredData = this.originalData.filter(row => {
            return Object.values(row).some(value =>
                value.toString().toLowerCase().includes(term.toString().toLowerCase())
            );
        });
        this.processData(filteredData);
        this.rerender();
    }

    reset() {
        this.processData(this.originalData);
        this.rerender();
    }

    createContextMenu(options) {
        if (options) {
            const gridRows = this.rootElement.querySelectorAll('.opengridjs-grid-row');
            gridRows.forEach(gridRow => {
                if (gridRow.getAttribute('data-has-context-menu') === 'true') {
                    return;
                }

                gridRow.addEventListener('contextmenu', e => {
                    e.preventDefault();
                    this.closeContextMenu();
                    gridRow.classList.add('opengridjs-selected-grid-row');
                    gridRow.setAttribute('data-has-context-menu', 'true');

                    const id = gridRow.getAttribute("data-id");

                    if(id === "undefined") {
                        console.error("No Id detected in the selected row");
                        return;
                    }

                    this.gridSelectedObject = this.gridData.find(x => x.data.id.toString() === id).data;

                    const title = this.contextMenuTitle ?? "Title";
                    
                    // Get the grid container's position relative to the viewport
                    const gridRect = this.rootElement.getBoundingClientRect();
                    const left = `${e.clientX - gridRect.left}px`;
                    const top = `${e.clientY - gridRect.top}px`;
                    
                    const selections = `
                <div class="opengridjs-contextMenu" style="left:${left}; top: ${top}">
                    <div class="opengridjs-title">${title}</div><hr/>
                    ${options.map((option, index) => `<button data-id="${id}" class="opengridjs-context-menu-button ${option.className} opengridjs-btn" data-action="${option.actionFunctionName}">${option.actionName}</button>`).join('')}
                    <br/>&nbsp;
                </div>`;

                    this.rootElement.querySelector('.opengridjs-grid-additional').innerHTML += selections;

                    this.rootElement.querySelectorAll('.opengridjs-context-menu-button').forEach(button => {
                        button.addEventListener('click', (event) => {
                            const actionFunctionName = event.target.getAttribute('data-action');
                            window[actionFunctionName](this.gridSelectedObject);
                            this.closeContextMenu();
                        });
                    });
                });

                gridRow.addEventListener('click', () => this.closeContextMenu());
            });
        }
    }

    exportToCSV() {
        const items = this.gridData.map(x => x.data);
        const replacer = (key, value) => value === null ? '' : value;
        const header = Object.keys(items[0]);
        let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
        csv.unshift(header.join(','));
        csv = csv.join('\r\n');

        const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const csvUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement('a');
        link.href = csvUrl;
        link.setAttribute('download', 'export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    closeContextMenu(action) {
        // Only close context menus within this grid instance
        this.rootElement.querySelectorAll('.opengridjs-contextMenu').forEach(item => item.remove());
        this.rootElement.querySelectorAll('.opengridjs-selected-grid-row').forEach(item => item.classList.remove('opengridjs-selected-grid-row'));
        if (action) {
            action(this.gridSelectedObject);
        }
    }

    isNearBottom(container) {
        var result = container.scrollHeight == container.scrollTop + this.gridRowPxVisibleArea + 4;
        if(result && !this.loadedAtGridHeight.includes(container.scrollTop)) {
            this.loadedAtGridHeight.push(container.scrollTop);
            return true;
        }
        return false;
    }

    appendData(newData) {
        if (typeof newData === 'function') {
            newData().then(fetchedData => {
                if (fetchedData && fetchedData.length > 0) {
                    this.originalData = [...this.originalData, ...fetchedData];
                    this.processData(this.originalData);
                    this.rerender();
                } else {
                    this.canLoadMoreData = false;
                }
            });
        } else {
            if (newData && newData.length > 0) {
                this.originalData = [...this.originalData, ...newData];
                this.processData(this.originalData);
                this.rerender();
            } else {
                this.canLoadMoreData = false;
            }
        }
    }

    updateData(newData) {
        if (typeof newData === 'function') {
            newData().then(fetchedData => {
                this.originalData = fetchedData;
                this.processData(this.originalData);
                this.rerender();
            });
        } else {
            this.originalData = newData;
            this.processData(this.originalData);
            this.rerender();
        }
    }

    stopLoadingMoreData() {
        this.canLoadMoreData = false;
    }

    toggleFilterMenu(filterButton) {
        const column = filterButton.getAttribute('data-column');
        const existingMenu = this.rootElement.querySelector('.opengridjs-filter-menu');
        
        // Close existing menu if clicking the same button
        if (existingMenu && existingMenu.getAttribute('data-column') === column) {
            existingMenu.remove();
            return;
        }
        
        // Close any existing menu
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // Create and show new filter menu
        this.showFilterMenu(filterButton, column);
    }

    showFilterMenu(filterButton, column) {
        // Get unique values from the column
        const uniqueValues = this.getUniqueColumnValues(column);
        
        // Get current filter state for this column
        const currentFilter = this.columnFilters[column] || new Set(uniqueValues);
        
        // Create filter menu
        const filterMenu = document.createElement('div');
        filterMenu.className = 'opengridjs-filter-menu';
        filterMenu.setAttribute('data-column', column);
        
        // Position the menu below the filter button
        const buttonRect = filterButton.getBoundingClientRect();
        const gridRect = this.rootElement.getBoundingClientRect();
        filterMenu.style.position = 'absolute';
        filterMenu.style.left = `${buttonRect.left - gridRect.left}px`;
        filterMenu.style.top = `${buttonRect.bottom - gridRect.top}px`;
        filterMenu.style.zIndex = '1000';
        
        // Build menu content
        let menuContent = `
            <div class="opengridjs-filter-menu-header">
                <button class="opengridjs-filter-select-all">Select All</button>
                <button class="opengridjs-filter-clear-all">Clear All</button>
            </div>
            <div class="opengridjs-filter-search">
                <input type="text" placeholder="Search..." class="opengridjs-filter-search-input">
            </div>
            <div class="opengridjs-filter-options">`;
        
        uniqueValues.forEach(value => {
            const displayValue = value === null || value === undefined || value === '' ? '(Empty)' : value;
            const isChecked = currentFilter.has(value);
            menuContent += `
                <label class="opengridjs-filter-option">
                    <input type="checkbox" value="${this.escapeHtml(String(value))}" ${isChecked ? 'checked' : ''}>
                    <span>${this.escapeHtml(String(displayValue))}</span>
                </label>`;
        });
        
        menuContent += `
            </div>
            <div class="opengridjs-filter-menu-footer">
                <button class="opengridjs-filter-apply">Apply</button>
                <button class="opengridjs-filter-cancel">Cancel</button>
            </div>`;
        
        filterMenu.innerHTML = menuContent;
        
        // Add menu to grid
        this.rootElement.querySelector('.opengridjs-grid-additional').appendChild(filterMenu);
        
        // Add event listeners
        this.attachFilterMenuEvents(filterMenu, column, uniqueValues);
        
        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', this.closeFilterMenuOnClickOutside);
        }, 0);
    }

    attachFilterMenuEvents(filterMenu, column, uniqueValues) {
        // Select All button
        filterMenu.querySelector('.opengridjs-filter-select-all').addEventListener('click', () => {
            filterMenu.querySelectorAll('.opengridjs-filter-option input').forEach(checkbox => {
                checkbox.checked = true;
            });
        });
        
        // Clear All button
        filterMenu.querySelector('.opengridjs-filter-clear-all').addEventListener('click', () => {
            filterMenu.querySelectorAll('.opengridjs-filter-option input').forEach(checkbox => {
                checkbox.checked = false;
            });
        });
        
        // Search functionality
        const searchInput = filterMenu.querySelector('.opengridjs-filter-search-input');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterMenu.querySelectorAll('.opengridjs-filter-option').forEach(option => {
                const text = option.querySelector('span').textContent.toLowerCase();
                option.style.display = text.includes(searchTerm) ? 'flex' : 'none';
            });
        });
        
        // Apply button
        filterMenu.querySelector('.opengridjs-filter-apply').addEventListener('click', () => {
            const selectedValues = new Set();
            filterMenu.querySelectorAll('.opengridjs-filter-option input:checked').forEach(checkbox => {
                const value = checkbox.value;
                // Convert back to original type
                const originalValue = uniqueValues.find(v => String(v) === value);
                selectedValues.add(originalValue);
            });
            
            this.applyColumnFilter(column, selectedValues);
            filterMenu.remove();
            document.removeEventListener('click', this.closeFilterMenuOnClickOutside);
        });
        
        // Cancel button
        filterMenu.querySelector('.opengridjs-filter-cancel').addEventListener('click', () => {
            filterMenu.remove();
            document.removeEventListener('click', this.closeFilterMenuOnClickOutside);
        });
    }

    closeFilterMenuOnClickOutside = (e) => {
        const filterMenu = this.rootElement.querySelector('.opengridjs-filter-menu');
        if (filterMenu && !filterMenu.contains(e.target) && !e.target.classList.contains('opengridjs-filter-button')) {
            filterMenu.remove();
            document.removeEventListener('click', this.closeFilterMenuOnClickOutside);
        }
    }

    getUniqueColumnValues(column) {
        const values = new Set();
        const dataToUse = this.originalData || this.gridData.map(item => item.data);
        
        dataToUse.forEach(row => {
            let value = row[column];
            values.add(value);
        });
        
        return Array.from(values).sort((a, b) => {
            if (a === null || a === undefined) return 1;
            if (b === null || b === undefined) return -1;
            if (typeof a === 'string' && typeof b === 'string') {
                return a.localeCompare(b);
            }
            return a > b ? 1 : a < b ? -1 : 0;
        });
    }

    applyColumnFilter(column, selectedValues) {
        // Store the filter
        if (selectedValues.size === this.getUniqueColumnValues(column).length) {
            // If all values are selected, remove the filter
            delete this.columnFilters[column];
        } else {
            this.columnFilters[column] = selectedValues;
        }
        
        // Apply all filters
        this.applyAllFilters();
        
        // Update visual indicator
        this.updateFilterIndicators();
    }

    applyAllFilters() {
        // Start with original data
        let filteredData = [...this.originalData];
        
        // Apply each column filter
        Object.keys(this.columnFilters).forEach(column => {
            const allowedValues = this.columnFilters[column];
            filteredData = filteredData.filter(row => {
                return allowedValues.has(row[column]);
            });
        });
        
        // Store filtered data and rerender
        this.filteredData = filteredData;
        this.processData(filteredData);
        // Sort data after processing if we have an active sort
        if (this.sortState && this.sortState.header) {
            this.sortData();
        }
        this.rerender();
    }

    updateFilterIndicators() {
        // Update filter button appearance for columns with active filters
        const headerItems = this.rootElement.querySelectorAll('.opengridjs-grid-header-item');
        headerItems.forEach(headerItem => {
            const column = headerItem.getAttribute('data-header');
            const filterButton = headerItem.querySelector('.opengridjs-filter-button');
            
            if (filterButton) {
                if (this.columnFilters[column] && this.columnFilters[column].size > 0) {
                    filterButton.classList.add('opengridjs-filter-active');
                } else {
                    filterButton.classList.remove('opengridjs-filter-active');
                }
            }
        });
    }

    clearAllFilters() {
        this.columnFilters = {};
        this.filteredData = null;
        this.processData(this.originalData);
        // Maintain sort if one exists
        if (this.sortState && this.sortState.header) {
            this.sortData();
        }
        this.rerender();
        this.updateFilterIndicators();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
