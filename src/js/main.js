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

    /**
     * Helper functions
     *
     */
    //  NextUntil
    var nextUntil = function(elem, selector, filter) {
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
    var getSiblings = function(elem) {
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
    var getSiblingsAndSelf = function(elem) {
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
    function getPreviousSiblings(el, filter) {
        var siblings = [];
        while ((el = el.previousElementSibling)) {
            if (!filter || filter(el)) siblings.push(el);
        }
        return siblings;
    }
    /**
     *  /end helper functions
     */

    var options = options;
    var carouselSelector = options.selector;
    var elListCarousel = document.querySelectorAll(carouselSelector);
    var elListItems = document.querySelectorAll(carouselSelector + " .car_item");
    var elListRow = document.querySelectorAll(carouselSelector + " .car_row");

    /**
     * Update carousel and carousel items querySelector
     */
    function updateSelectors() {
        elListCarousel = document.querySelectorAll(carouselSelector);
        elListRow = document.querySelectorAll(carouselSelector + " .car_row");
        elListItems = document.querySelectorAll(carouselSelector + " .car_item");
    }

    /*
     * Set row size:
     * sorts the row size options, if responsive option is used;
     * checks for correct row-size based on viewport/options, and updates row-size option accordingly
     */
    function setOptionRowSize() {
        var isResponsive = options.responsive ? true : false;
        var getRowSize;

        /*
           If custom responsive breakpoints are set, rather than a default for all sizes:
           there needs to be a check for viewport width, and the custom breakpoints needs to be checked               
        */
        if (isResponsive) {
            /*
              Sort breakpoints from high to low;
              then loop array and check if viewport width is still greater than breakpoint;
              if greater than breakpoint, set default rowSize to new size
           */
            options.responsive.sort(function(a, b) {
                return a.breakpoint - b.breakpoint;
            });

            for (var i = 0; i < options.responsive.length; i++) {
                var getBreakpoint = options.responsive[i].breakpoint;
                var getItems = options.responsive[i].items;
                var matchMediaQuery = "(min-width: " + options.responsive[i].breakpoint + "px)";

                if (window.matchMedia(matchMediaQuery).matches) {
                    getRowSize = getItems;
                }
            }
            options.rowSize = getRowSize;
        }
    }

    /**
     *
     * Init Row:
     * Sets row x-position to 0 on initialization
     *
     */

    function initRow() {
        var elRow;
        Array.prototype.forEach.call(elListCarousel, function(el, index) {
            elRow = el.querySelector(".car_row");
            setRowPosition(elRow, 0);
        });
    }

    /**
     *
     * Horizontal Scroll (translateX) Position of carousel-row container:
     * get position
     *
     */
    function getRowPosition(elRow) {
        var getHorizontal = elRow.hasAttribute("data-carousel-row-x") && elRow.getAttribute("data-carousel-row-x") ? elRow.getAttribute("data-carousel-row-x") : 0;
        return parseFloat(getHorizontal);
    }

    /**
     *
     * Horizontal Scroll (translateX) Position of carousel-row container:
     * set position as data-attribute;
     * also set autoprefixed translateX style tags
     * @param {xPosition}: the horizontal position used for tracking setting translateX
     * @param {elCarRow}: if there are multiple carousels instantiated with the same name, use this to pass in one specific row element; otherwise, all will be set
     *
     */

    function setRowPosition(elRow, xPosition) {
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
    }

    function initItem() {
        var elItemList;

        Array.prototype.forEach.call(elListCarousel, function(el, index) {
            elItemList = el.querySelectorAll(".car_item");
            Array.prototype.forEach.call(elItemList, function(el, index) {
                setItemSize(el);
                setItemPosition(el, index);
            });
        });
    }
    /*
     * Set item positioning:
     * this is needed to determine the 1st and Last items in the active carousel row;
     * these first/last items require different animations and affect previous/next elements positioning
     */
    function setItemPosition(elItem, index) {
        if (elItem) {
            elItem.setAttribute("data-carousel-item-x", index * parseFloat((1 / options.rowSize) * 100));
        } else {
            Array.prototype.forEach.call(elListCarousel, function(el, index) {
                var elItemList = el.querySelectorAll(".car_item");
                Array.prototype.forEach.call(elItemList, function(el, index) {
                    el.setAttribute("data-carousel-item-x", index * parseFloat((1 / options.rowSize) * 100));
                });
            });
        }
    }

    /*
     * Set item width:
     * based on option row size
     */
    function setItemSize(elItem) {
        var getWidth = parseFloat((1 / options.rowSize) * 100) + "%";

        if (elItem) {
            elItem.style.width = getWidth;
            elItem.style.minWidth = getWidth;
        } else {
            Array.prototype.forEach.call(elListCarousel, function(el, index) {
                var elItemList = el.querySelectorAll(".car_item");
                Array.prototype.forEach.call(elItemList, function(elItem, index) {
                    elItem.style.width = getWidth;
                    elItem.style.minWidth = getWidth;
                });
            });
        }
    }

    function nextItem() {
        Array.prototype.forEach.call(elListCarousel, function(el, index) {
            var elRow = el.querySelector(".car_row");
            var getRowPos = getRowPosition(elRow);
            var elItemList = el.querySelectorAll(".car_item");
            var getItemPos;

            for (var i = 0; i < elItemList.length; i++) {
                getItemPos = elItemList[i].getAttribute("data-carousel-item-x");

                if (parseInt(getItemPos) > parseInt(getRowPos)) {
                    setRowPosition(elRow, getItemPos);
                    break;
                }
            }
        });
    }

    /**
     *  Remove active item;
     *  only 1 item should be active per carousel; there isn't a need to find only the active carousel; can simply target all
     *
     */
    function removeActiveItem() {
        var elRow;

        Array.prototype.forEach.call(elListItems, function(el, index) {
            elRow = el.closest(".car_row");
            el.getAttribute("data-carousel-active") && el.removeAttribute("data-carousel-active");
            // el.getAttribute("data-carousel-move") && el.removeAttribute("data-carousel-move");
            el.getAttribute("data-carousel-item-pos") && el.removeAttribute("data-carousel-item-pos");
        });
        if (elRow) {
            elRow.hasAttribute("data-carousel-active") && elRow.removeAttribute("data-carousel-active");
            elRow.hasAttribute("data-carousel-item-pos") && elRow.removeAttribute("data-carousel-item-pos");
        }
    }

    /**
     *
     * Sets active carousel item and positions items
     * The positioning of both the active items and adjacent items depends on which item is active - whether it be first, last, or in between.
     * if first, the active items scale towards towards the right (so it doesn't go offscreen) and pushes following siblings to right fully
     * if last, it's essentially the opposite of the first (scales left and pushes other items left);
     * if somewhere in between, the active item scale is normal
     *
     *
     */
    function setActiveItem(passThis) {
        var getThis = passThis;

        var getNextUntil = nextUntil(getThis);
        var getPrevUntil = getPreviousSiblings(getThis);
        var getItemsSiblings = getSiblings(getThis);
        var getItemsAll = getSiblingsAndSelf(getThis);
        var elRow = passThis.closest(".car_row");
        var rowPosition = getRowPosition(elRow);
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
            } else if (i >= firstIndex + options.rowSize - 1) {
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
    }

    /*
     * Event Listeners:
     *
     */
    /*
        Event Array:
        holds an array of objects containing the references to the element, event-name, and callback for all added event listeners; 
        this is used to subsequently remove all event listners; 
    */
    var eventArray = [];
    /*
        Add event listener: 
        creates custom event object, pushes to event array; 
        also applies the event-listeners
    */
    function addEventListener(getEl, getEventName, getCallback) {
        var eventObj = {};
        // build event object and push into event array for later removal if necessary
        eventObj.el = getEl;
        eventObj.eventName = getEventName;
        eventObj.callback = getCallback;
        eventArray.push(eventObj);
        // add event to element
        eventObj.el.addEventListener(eventObj.eventName, eventObj.callback);
    }
    /*
        Remove event listners:
        removes all event listners from the event array 
    */
    function removeAllEventListeners() {
        eventArray.forEach(function(val) {
            if (val) {
                val.el.removeEventListener(val.eventName, val.callback);
            }
        });
    }
    /*
        Resize event:
        On resize, need to:
            re-calculate row-size (which may change if responsive breakpoint options are used)
            update item position; 
            update item size; 
    */
    function resizeEvent(event) {
        // removeActiveItem();
        setOptionRowSize();
        setItemPosition();
        setItemSize();
    }
    /*
        MouseEnter
    */
    function mouseenterEvent(event) {
        // add mouseenter class
        event.target.classList.add("carousel-mouseenter");
        // set timeout for slight delay before removing/adding active items; recheck if mouseenter class is still present (which is removed on mouseleave);
        window.setTimeout(function() {
            if (event.target.classList.contains("carousel-mouseenter")) {
                setActiveItem(event.target);
            }
        }, 150);
    }
    /*
        Mouseleave: 
    */
    function mouseleaveEvent(event) {
        // remove mouseenter class, if present
        if (event.target.classList.contains("carousel-mouseenter")) {
            event.target.classList.remove("carousel-mouseenter");
        }
        // add delay before removal; similar delay is used for mouseenter
        window.setTimeout(function() {
            if (!event.target.classList.contains("carousel-mouseenter")) {
                removeActiveItem(event.target);
            }
        }, 150);
    }
    /*
        Initialize Event Listeners
    */
    function initEventListeners() {
        Array.prototype.forEach.call(elListItems, function(el, index) {
            // mouseenter
            addEventListener(el, "mouseenter", mouseenterEvent);
            // mouseleave
            addEventListener(el, "mouseleave", mouseleaveEvent);
        });
        // resize
        window.addEventListener("resize", resizeEvent);
        window.addEventListener("orientationchange", resizeEvent);
    }
    /**
     * Show carousel:
     * necessary because user can optionally hide before initialized to avoid flickering of wrong size, etc...
     */
    function showCarousel() {
        if (elListCarousel) {
            Array.prototype.forEach.call(elListCarousel, function(el, index) {
                el.removeAttribute("data-carousel-hidden");
            });
        }
    }
    /**
     * Remove carousel:
     * completely remove carousel
     */
    function removeCarousel() {
        updateSelectors();
        Array.prototype.forEach.call(elListCarousel, function(el, index) {
            el.parentNode.removeChild(el);
        });
    }

    return {
        initialize: function() {
            updateSelectors();
            setOptionRowSize();
            initRow();
            initItem();
            removeAllEventListeners();
            initEventListeners();
            showCarousel();
        },
        reInitialize: function(getOptions) {
            if (getOptions) {
                options = getOptions;
                this.initialize();
            }
        },
        nextItem: function() {
            nextItem();
        },

        removeEvents: function() {
            removeAllEventListeners();
        },
        remove: function() {
            this.removeEvents();
            removeCarousel();
        }
    };
}

document.addEventListener("DOMContentLoaded", function(event) {
    var carousel = new Carousel({
        selector: ".car",
        rowSize: 5,
        responsive: [
            {
                breakpoint: 0,
                items: 2
            },
            {
                breakpoint: 768,
                items: 3
            },
            {
                breakpoint: 992,
                items: 7
            }
        ]
    });
    carousel.initialize();
    console.log(carousel);
});
