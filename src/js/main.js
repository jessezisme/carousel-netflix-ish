function Carousel(options) {
    /**
     * -------------------------------------
     * Polyfills
     * -------------------------------------
     */
    // Matches polyfill
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }
    // end matches polyfill
    // closest polyfill
    if (!Element.prototype.closest) {
        Element.prototype.closest = function(s) {
            var el = this;
            do {
                if (el.matches(s)) return el;
                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };
    }
    // end closest polyfill
    /**
     * /end polyfills
     * -------------------------------------
     */

    this.options = options;
    /*
        Event Array:
        holds an array of objects containing the references to the element, event-name, and callback for all added event listeners; 
        this is used to subsequently remove all event listners; 
    */
    var eventArray = eventArray ? eventArray : [];
    this.eventArray = eventArray;

    this.selectors = function() {
        var carouselSelector = this.options.selector;
        return {
            elListCarousel: document.querySelectorAll(carouselSelector),
            elListItems: document.querySelectorAll(carouselSelector + " .car_item"),
            elListRow: document.querySelectorAll(carouselSelector + " .car_row")
        };
    };
    this.initialize = function() {
        try {
            this._setOptionRowSize();
            this._initRow();
            this._initItem();
            this._removeAllEventListeners();
            this._initEventListeners();
            this._showCarousel();
        } catch (err) {
            console.log(err);
        }
    };
    this.reInitialize = function(getOptions) {
        try {
            if (getOptions) {
                this.options = getOptions;
                this.initialize();
            }
        } catch (err) {
            console.log(erro);
        }
    };
    this.goTo = function(getWhere) {
        try {
            this._goToItem(getWhere);
        } catch (err) {
            console.log(err);
        }
    };
    this.removeEvents = function() {
        try {
            this._removeAllEventListeners();
        } catch (err) {
            console.log(err);
        }
    };
    this.remove = function() {
        try {
            this.removeEvents();
            this._removeCarousel();
        } catch (err) {
            console.log(err);
        }
    };
}

/*
 * Set row size:
 * sorts the row size options, if responsive option is used;
 * checks for correct row-size based on viewport/options, and updates row-size option accordingly
 */
Carousel.prototype._setOptionRowSize = function() {
    var self = this;
    var isResponsive = self.options.responsive ? true : false;
    var getRowSize;
    /*
       If custom responsive breakpoints are set (rather than one default for all), 
       there needs to be a check for both: viewport width, and the custom breakpoints.          
    */
    if (isResponsive) {
        /*
          Sort breakpoints from high to low;
          then loop array and check if viewport width is still greater than breakpoint, using matchMedia
          if greater than breakpoint, set default rowSize to new size
       */
        self.options.responsive.sort(function(a, b) {
            return a.breakpoint - b.breakpoint;
        });

        for (var i = 0; i < self.options.responsive.length; i++) {
            var getBreakpoint = self.options.responsive[i].breakpoint;
            var getItems = self.options.responsive[i].items;
            var matchMediaQuery = "(min-width: " + self.options.responsive[i].breakpoint + "px)";

            if (window.matchMedia(matchMediaQuery).matches) {
                getRowSize = getItems;
            }
        }
        self.options.rowSize = getRowSize;
    }
};

/**
 *
 * Init Row:
 * sets horizontal/x-position to 0 on init
 *
 */
Carousel.prototype._initRow = function() {
    var self = this;
    Array.prototype.forEach.call(self.selectors().elListCarousel, function(el, index) {
        var elRow = el.querySelector(".car_row");
        self._setRowPosition(elRow, 0);
    });
};

/**
 *
 * Get Row Position:
 * returns row's x-position
 * @param {elRow}: row element
 *
 */
Carousel.prototype._getRowPosition = function(elRow) {
    var getHorizontal = elRow.hasAttribute("data-carousel-row-x") && elRow.getAttribute("data-carousel-row-x") ? elRow.getAttribute("data-carousel-row-x") : 0;
    return parseFloat(getHorizontal);
};

/**
 *
 * Set Row position:
 * For carousel row, set x-position as attribute for reference; also set autoprefixed translateX style tags for positioning
 * @param {elRow}: row element
 * @param {xPosition}: the provided x-position used to set position
 *
 */
Carousel.prototype._setRowPosition = function(elRow, xPosition) {
    var xPosition = parseFloat(xPosition);
    var xPositionNegative = -Math.abs(xPosition);
    var xTranslateStyle;

    function setStyle() {
        xTranslateStyle = "-webkit-transform: translateX(" + xPositionNegative + "%);";
        xTranslateStyle += " ms-transform: translateX(" + xPositionNegative + "%);";
        xTranslateStyle += " transform: translateX(" + xPositionNegative + "%);";
        elRow.setAttribute("style", xTranslateStyle);
        elRow.setAttribute("data-carousel-row-x", xPosition);
    }
    setStyle();
};

/**
 *
 * @TODO Need to finish this
 *
 */
Carousel.prototype._initItem = function() {
    var elItemList;
    var self = this;

    Array.prototype.forEach.call(this.selectors().elListCarousel, function(el, index) {
        elItemList = el.querySelectorAll(".car_item");
        Array.prototype.forEach.call(elItemList, function(el, index) {
            self._setItemSize(el);
            self._setItemPosition(el, index);
        });
    });
};

/*
 * Set item positioning:
 * this sets the attribute used as reference for x-positioning (where the element begins on x-axis)
 *
 */
Carousel.prototype._setItemPosition = function(elItem, index) {
    var self = this;
    if (elItem) {
        elItem.setAttribute("data-carousel-item-x", index * parseFloat((1 / self.options.rowSize) * 100));
    } else {
        Array.prototype.forEach.call(this.selectors().elListCarousel, function(el, index) {
            var elItemList = el.querySelectorAll(".car_item");
            Array.prototype.forEach.call(elItemList, function(el, index) {
                el.setAttribute("data-carousel-item-x", index * parseFloat((1 / self.options.rowSize) * 100));
            });
        });
    }
};

/*
 * Set item width:
 * Adds style tag for width %
 */
Carousel.prototype._setItemSize = function(elItem) {
    var getWidth = parseFloat((1 / this.options.rowSize) * 100) + "%";

    if (elItem) {
        elItem.style.width = getWidth;
        elItem.style.minWidth = getWidth;
    } else {
        Array.prototype.forEach.call(this.selectors().elListCarousel, function(el, index) {
            var elItemList = el.querySelectorAll(".car_item");
            Array.prototype.forEach.call(elItemList, function(elItem, index) {
                elItem.style.width = getWidth;
                elItem.style.minWidth = getWidth;
            });
        });
    }
};

/**
 *
 * Go to:
 * used to go next, previous, or specific item index;
 * @param {getWhere}: pass in 'next', 'previous', or index number
 *
 */
Carousel.prototype._goToItem = function(getWhere) {
    var self = this;
    /*
        - loops through all carousels and items;
        - converts nodelist of items to array
        - if 'next' or 'previous'
        -- filters arrya based on x-position
        --- if 'next', filter by items whose x-position is greater than current position
        --- if 'previous', filter by items whose x-position is less than; 
        - if @parem is index number, get x-position of that index (if item exists) and go to directly             
    */
    Array.prototype.forEach.call(self.selectors().elListCarousel, function(el, index) {
        var elRow = el.querySelector(".car_row");
        var getRowPos = parseInt(self._getRowPosition(elRow));
        var elItemList = el.querySelectorAll(".car_item");
        var elItemArray = Array.prototype.slice.call(elItemList) || [];

        var elItemArrayFiltered;
        /*
                if next, get items whose x-postion is greater than row's x-position
            */
        if (getWhere === "next") {
            elItemArrayFiltered = elItemArray.filter(function(el, index) {
                var getItemPos = parseInt(elItemList[index].getAttribute("data-carousel-item-x"));
                if (getItemPos > getRowPos) {
                    return true;
                }
                return false;
            });
        } else if (getWhere === "previous") {
            /*
                if previous, get items whose x-position is less than row's x-position 
            */
            elItemArrayFiltered = elItemArray.filter(function(el, index) {
                var getItemPos = parseInt(elItemList[index].getAttribute("data-carousel-item-x"));
                if (getItemPos < getRowPos) {
                    return true;
                }
                return false;
            });
            // reverse filtered list, otherise [0] index will always simply be first carousel item;
            elItemArrayFiltered = elItemArrayFiltered.reverse();
        }
        /*
                if next or previous, get first item's position from filtered array and go to
            */
        if (getWhere === "next" || getWhere === "previous") {
            var getPosition = elItemArrayFiltered[0] && elItemArrayFiltered[0].getAttribute("data-carousel-item-x") ? elItemArrayFiltered[0].getAttribute("data-carousel-item-x") : false;
            getPosition ? self._setRowPosition(elRow, getPosition) : true;
        } else if (parseInt(getWhere)) {
            /*
                else, if index-position is passed, just go to that specific item's x-position; 
                no need to use filtered-list, can use un-filtered list instead
            */
            var getPosition = elItemList[parseInt(getWhere)] && elItemList[parseInt(getWhere)].getAttribute("data-carousel-item-x") ? elItemList[parseInt(getWhere)].getAttribute("data-carousel-item-x") : false;
            getPosition ? self._setRowPosition(elRow, getPosition) : true;
        }
    });
};

/**
 *
 * Remove Active:
 * remove all attributes associated with "active" status
 *
 */
Carousel.prototype._removeActiveItem = function() {
    Array.prototype.forEach.call(this.selectors().elListItems, function(el, index) {
        var elRow = el.closest(".car_row");
        el.hasAttribute("data-carousel-active") && el.removeAttribute("data-carousel-active");
        // el.getAttribute("data-carousel-move") && el.removeAttribute("data-carousel-move");
        el.hasAttribute("data-carousel-item-pos") && el.removeAttribute("data-carousel-item-pos");
        if (elRow) {
            elRow.hasAttribute("data-carousel-active") && elRow.removeAttribute("data-carousel-active");
            elRow.hasAttribute("data-carousel-item-pos") && elRow.removeAttribute("data-carousel-item-pos");
        }
    });
};

/**
 *
 * Set active item:
 * The positioning of active item and it's siblings depends on if the item is at the beginning, middle, or end;
 * on the active item and row, a positioning and active attribute is set
 *
 */
Carousel.prototype._setActiveItem = function(passThis) {
    var getThis = passThis;

    var getItemsAll = this._getSiblingsAndSelf(getThis);
    var elRow = passThis.closest(".car_row");
    var rowPosition = this._getRowPosition(elRow);
    var positionActiveType;

    for (var i = 0; i < getItemsAll.length; i++) {
        var itemPosition = parseFloat(getItemsAll[i].getAttribute("data-carousel-item-x"));
        var itemNextPosition = getItemsAll[i + 1] ? parseFloat(getItemsAll[i + 1].getAttribute("data-carousel-item-x")) : false;
        var itemNextMidpoint = itemNextPosition ? (itemPosition + itemNextPosition) / 2 : false;
        var firstIndex;

        if (rowPosition >= itemPosition) {
            getItemsAll[i].setAttribute("data-carousel-item-pos", "begin");
            firstIndex = i;
            positionActiveType = "begin";
        } else if (itemNextPosition && rowPosition > itemNextMidpoint) {
            getItemsAll[i + 1].setAttribute("data-carousel-item-pos", "begin");
            positionActiveType = "begin";
        } else if (i >= firstIndex + this.options.rowSize - 1) {
            getItemsAll[i].setAttribute("data-carousel-item-pos", "end");
            getItemsAll[i + 1] && getItemsAll[i + 1].setAttribute("data-carousel-item-pos", "end");
            positionActiveType = "end";
            break;
        } else {
            getItemsAll[i].setAttribute("data-carousel-item-pos", "middle");
            positionActiveType = "middle";
        }
    }

    positionActiveType = getThis.getAttribute("data-carousel-item-pos");

    getThis.setAttribute("data-carousel-active", "true");
    elRow.setAttribute("data-carousel-active", "true");
    elRow.setAttribute("data-carousel-item-pos", positionActiveType);
};

/*
    Resize event:
    On resize, need to:
    re-calculate row-size (which may change if responsive breakpoint options are used)
    update item position; 
    update item size; 
*/
Carousel.prototype._resizeEvent = function(event) {
    this._setOptionRowSize();
    this._setItemPosition();
    this._setItemSize();
};

/*
 * Event Listeners:
 *
 */

/**
 *
 * Initialize Event Listeners
 *
 */
Carousel.prototype._initEventListeners = function() {
    var self = this;
    Array.prototype.forEach.call(
        this.selectors().elListItems,
        function(el, index, array) {
            // mouseenter
            self._addEventListener.call(this, el, "mouseenter", self._mouseenterEvent.bind(self));
            // mouseleave
            self._addEventListener.call(this, el, "mouseleave", self._mouseleaveEvent.bind(self));
        },
        this
    );
    // resize
    self._addEventListener.call(this, window, "resize", self._resizeEvent.bind(self));
    self._addEventListener.call(this, window, "orientationchange", self._resizeEvent.bind(self));
};

/*
    Add event listener: 
    creates custom event object, pushes to event array; 
    also applies the event-listeners
*/
Carousel.prototype._addEventListener = function(getEl, getEventName, getCallback) {
    var eventObj = {};
    // build event object and push into event array for later removal if necessary
    eventObj.el = getEl;
    eventObj.eventName = getEventName;
    eventObj.callback = getCallback;
    // push into event array
    this.eventArray.push(eventObj);
    // add event to element
    eventObj.el.addEventListener(eventObj.eventName, eventObj.callback);
};

/**
 *
 * Remove event listeners:
 * removes all event listeners from event array
 *
 */
Carousel.prototype._removeAllEventListeners = function() {
    var self = this;
    this.eventArray.forEach(function(val, index, array) {
        if (val) {
            val.el.removeEventListener(val.eventName, val.callback);
        }
    });
    this.eventArray = [];
};

/**
 *
 * Mouseenter
 *
 */
Carousel.prototype._mouseenterEvent = function(event) {
    var self = this;

    // add mouseenter class
    event.target.classList.add("carousel-mouseenter");
    // set timeout for slight delay before removing/adding active items; recheck if mouseenter class is still present (which is removed on mouseleave);
    window.setTimeout(function() {
        if (event.target.classList.contains("carousel-mouseenter")) {
            self._setActiveItem(event.target);
        }
    }, 150);
};

/**
 *
 *  Mouseleave
 *
 */
Carousel.prototype._mouseleaveEvent = function(event) {
    var self = this;
    // remove mouseenter class, if present
    if (event.target.classList.contains("carousel-mouseenter")) {
        event.target.classList.remove("carousel-mouseenter");
    } // add delay before removal; similar delay is used for mouseenter

    window.setTimeout(function() {
        if (!event.target.classList.contains("carousel-mouseenter")) {
            self._removeActiveItem(event.target);
        }
    }, 150);
};

/**
 *
 * /end event listeners
 *
 */

/**
 * Show carousel:
 * necessary because user can optionally hide before initialized to avoid flickering of wrong size, etc...
 */
Carousel.prototype._showCarousel = function() {
    if (this.selectors().elListCarousel) {
        Array.prototype.forEach.call(this.selectors().elListCarousel, function(el, index) {
            el.removeAttribute("data-carousel-hidden");
        });
    }
};

/**
 * Remove carousel:
 * completely remove carousel
 */
Carousel.prototype._removeCarousel = function() {
    Array.prototype.forEach.call(this.selectors().elListCarousel, function(el, index) {
        el.parentNode.removeChild(el);
    });
};

/**
 * Helper functions
 *
 */
//  NextUntil
Carousel.prototype._nextUntil = function(elem, selector, filter) {
    // Setup siblings array
    var siblings = [];
    // Get the next sibling element
    elem = elem.nextElementSibling;
    // As long as a sibling exists
    while (elem) {
        // If we've reached our match, bail
        if (elem.matches(selector)) break;
        // If filtering by a selector, check if the sibling matches
        if (filter && !elem.matches(filter)) {
            elem = elem.nextElementSibling;
            continue;
        }
        // Otherwise, push it to the siblings array
        siblings.push(elem);
        // Get the next sibling element
        elem = elem.nextElementSibling;
    }
    return siblings;
};
// Siblings
Carousel.prototype._getSiblings = function(elem) {
    // Setup siblings array and get the first sibling
    var siblings = [];
    var sibling = elem.parentNode.firstChild;
    // Loop through each sibling and push to the array
    while (sibling) {
        if (sibling.nodeType === 1 && sibling !== elem) {
            siblings.push(sibling);
        }
        sibling = sibling.nextSibling;
    }
    return siblings;
};

// Siblings and Self
Carousel.prototype._getSiblingsAndSelf = function(elem) {
    // Setup siblings array and get the first sibling
    var siblings = [];
    var sibling = elem.parentNode.firstChild;
    // Loop through each sibling and push to the array
    while (sibling) {
        if (sibling.nodeType === 1) {
            siblings.push(sibling);
        }
        sibling = sibling.nextSibling;
    }
    return siblings;
};

// Previous siblings
Carousel.prototype._getPreviousSiblings = function(el, filter) {
    var siblings = [];
    while ((el = el.previousElementSibling)) {
        if (!filter || filter(el)) siblings.push(el);
    }
    return siblings;
};
/**
 *  /end helper functions
 */
