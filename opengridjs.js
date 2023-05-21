class Opengridjs {
    constructor(className, data, gridHeight, setup) {
        this.gridData = [];
        this.headerData = [];
        this.gridRowPxSize = 35;
        this.gridRowPxVisibleArea = gridHeight;
        this.gridColumnNames = Object.keys(data[0]).map(key => ({headerName: key, field: key}));
        this.gridSelectedObject = {};
        this.initGrid(className);
        this.processData(data);
        this.generateGridHeader(setup);
        this.generateGridRows();
        this.addEventListeners(setup);
        this.contextMenuItems = setup.contextMenuOptions;
        this.contextMenuTitle = setup.contextMenuTitle;
        document.querySelector(`.${className}`).gridInstance = this;
    }

    initGrid(className) {
        const grid = document.getElementsByClassName(className)[0];
        grid.classList.add("grid-container");
        grid.innerHTML = `
        <div class='grid-additional'></div>
        <div class='grid-header'></div>
        <div class='grid-rows-container'></div>`;
    }

    processData(data) {
        this.gridData = data.map((dataItem, currentPosition) => ({
            data: dataItem,
            position: currentPosition * this.gridRowPxSize,
            isRendered: false
        }));
    }

    generateGridHeader(setup) {
        const gridHeader = document.querySelector(".grid-header");
        gridHeader.setAttribute("data-pos", gridHeader.offsetTop);

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
                    width: setup.columnHeaderNames[i].columnWidth ? `min-width:${setup.columnHeaderNames[i].columnWidth}px` : gridItemWidthStyle});
            }
        }
        this.headerData = headerData;

        gridHeader.innerHTML = this.headerData.map(header =>
            `<div class='grid-header-item' data-header='${header.data}' style='${header.width}'>${header.headerName}<span class='sort-indicator'></span></div>`
        ).join('');

    }

    generateGridRows() {
        const gridRowsContainer = document.querySelector('.grid-rows-container');
        gridRowsContainer.style.height = `${this.gridRowPxVisibleArea}px`;
        gridRowsContainer.innerHTML = "<div class='grid-rows'></div>";

        const gridRows = document.querySelector(".grid-rows");
        gridRows.style.height = `${this.gridRowPxSize * this.gridData.length}px`;

        this.renderVisible(gridRowsContainer, gridRows);
    }

    rerender() {
        this.processData(this.gridData.map(x => x.data));
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
        const rowClassName = `grid-row-${rowItem.position}`;
        gridRows.innerHTML += `<div data-id='${rowItem.data.id}' class='grid-row ${rowClassName}' style='top:${rowItem.position}px'></div>`;
        const gridRow = gridRows.getElementsByClassName(rowClassName)[0];

        gridRow.innerHTML = this.headerData.map(header => {
            const found = rowItem.data[header.data];
            return `<div class='grid-column-item' style='${header.width}'>${found ? found : '&nbsp;'}</div>`;
        }).join('');
    }

    removeRow(rowItem) {
        rowItem.isRendered = false;
        const rowClassName = `grid-row-${rowItem.position}`;
        const found = document.querySelector(`.${rowClassName}`);
        if (found) {
            found.remove();
        }
    }

    addEventListeners(setup) {
        const gridRowsContainer = document.querySelector('.grid-rows-container');
        gridRowsContainer.addEventListener('scroll', () => {
            this.rerender();
            this.closeContextMenu()
        });
        this.createContextMenu(setup.contextMenuOptions);
        this.addHeaderActions();
    }

    addHeaderActions() {
        const gridHeader = document.querySelector(".grid-header");
        gridHeader.addEventListener('click', e => {
            const header = e.target.getAttribute("data-header");
            const headerData = this.headerData.find(x => x.data == header);

            if(headerData) {
                headerData.sortDirection = headerData.sortDirection == null || headerData.sortDirection == 'desc' ? 'asc' : 'desc';
                const sortDirection = headerData.sortDirection;

                this.gridData.sort((a, b) => {
                    a = a.data[header];
                    b = b.data[header];

                    if (a == null) return b == null ? 0 : -1;
                    if (b == null) return 1;

                    if (sortDirection == 'asc') return a > b ? 1 : (a < b ? -1 : 0);
                    if (sortDirection == 'desc') return a > b ? -1 : (a < b ? 1 : 0);
                });

                // Update sort indicators
                const headerElements = Array.from(gridHeader.getElementsByClassName('grid-header-item'));
                headerElements.forEach(headerElement => {
                    headerElement.classList.remove('sort-asc', 'sort-desc');
                    if (headerElement.getAttribute('data-header') === header) {
                        headerElement.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
                    }
                });

                this.rerender()
                this.closeContextMenu()
            }
        });
    }

    createContextMenu(options) {
        if(options){
            const gridRows = document.querySelectorAll('.grid-row');
            gridRows.forEach(gridRow => {
                gridRow.addEventListener('contextmenu', e => {
                    e.preventDefault();
                    this.closeContextMenu();
                    gridRow.classList.add('selected-grid-row');

                    const id = gridRow.getAttribute("data-id");
                    this.gridSelectedObject = this.gridData.find(x => x.data.id == id).data;

                    const title = this.contextMenuTitle ?? "Title";
                    const left = `${e.pageX}px`;
                    const top = `${e.pageY}px`;
                    const selections = `
                <div class="contextMenu" style="left:${left}; top: ${top}">
                    <div class="title">${title}</div><hr/>
                    ${options.map(option => `<button data-id="${id}" class="${option.className} btn" onclick="this.closest('.grid').gridInstance.closeContextMenu(() => ${option.actionFunctionName}(this.closest('.grid').gridInstance.gridSelectedObject))">${option.actionName}</button>`).join('')}
                    <br/>&nbsp;
                </div>`;

                    document.querySelector('.grid-additional').innerHTML += selections;
                });

                gridRow.addEventListener('click', () => this.closeContextMenu());
            });
        }
    }
    closeContextMenu(action) {
        document.querySelectorAll('.contextMenu').forEach(item => item.remove());
        document.querySelectorAll('.selected-grid-row').forEach(item => item.classList.remove('selected-grid-row'));
        if (action) {
            action(this.gridSelectedObject);
        }
    }
}

