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
                ? this.gridColumnNames.map(columnNames => columnNames.headerName)
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
                        width: setup.columnHeaderNames[i].columnWidth ? `min-width:${setup.columnHeaderNames[i].columnWidth}px` : gridItemWidthStyle,
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
            const headerStyle = (header.width.includes('min-width') || header.width.includes('width:')) ? 
                `${header.width}; flex-grow: 0; flex-shrink: 0;` : 
                header.width;
            return `<div class='opengridjs-grid-header-item' draggable="true" data-header='${header.data}' style='${headerStyle}'>${header.headerName}<span class='opengridjs-sort-indicator'></span><span class='opengridjs-resize-handle'></span></div>`;
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
            const newWidth = Math.max(50, startWidth + deltaX);
            
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
        const gridRows = this.rootElement.querySelectorAll('.opengridjs-grid-row');
        gridRows.forEach(row => {
            const columnItems = row.querySelectorAll('.opengridjs-grid-column-item');
            columnItems.forEach((item, index) => {
                if (this.headerData[index]) {
                    item.style.cssText = this.headerData[index].width;
                    if (this.headerData[index].width.includes('min-width') || this.headerData[index].width.includes('width:')) {
                        item.style.flexGrow = '0';
                        item.style.flexShrink = '0';
                    }
                }
            });
        });
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
            this.processData(this.filteredData.map(x => x.data));
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

            const columnStyle = (header.width.includes('min-width') || header.width.includes('width:')) ? 
                `${header.width}; flex-grow: 0; flex-shrink: 0;` : 
                header.width;
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
            // Check if this click is from a resize operation
            const headerItem = e.target.closest('.opengridjs-grid-header-item');
            if (headerItem && headerItem._wasResizing && headerItem._wasResizing()) {
                return; // Don't sort if we just finished resizing
            }
            
            const header = e.target.getAttribute("data-header");
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

                this.sortData();
                this.rerender()
                this.closeContextMenu()
            }
        });
    }

    sortData() {
        this.gridData.sort((a, b) => {
            a = a.data[this.sortState.header];
            b = b.data[this.sortState.header];

            if (a == null) return b == null ? 0 : -1;
            if (b == null) return 1;

            if (this.sortState.sortDirection == 'asc') return a > b ? 1 : (a < b ? -1 : 0);
            if (this.sortState.sortDirection == 'desc') return a > b ? -1 : (a < b ? 1 : 0);
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

                    document.querySelector('.opengridjs-grid-additional').innerHTML += selections;

                    document.querySelectorAll('.opengridjs-context-menu-button').forEach(button => {
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
        document.querySelectorAll('.opengridjs-contextMenu').forEach(item => item.remove());
        document.querySelectorAll('.opengridjs-selected-grid-row').forEach(item => item.classList.remove('opengridjs-selected-grid-row'));
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
}
