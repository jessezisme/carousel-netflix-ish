var expect = chai.expect;

/**
 *
 * Carousel Options
 *
 */
describe("Options: Responsive", function() {
    it("if provided, correctly sets number of items based on screen size", function() {
        var getWindowWidth = $(window).width();
        var getRowSize = window.carousel.options && window.carousel.options.responsive ? window.carousel.options.rowSize : false;
        var isCorrect;

        // break out of test, if no responsive options are set
        if (!getRowSize) {
            expect(isCorrect).to.equal(true);
            return false;
        }
        // if responsive options are provided
        if (window.matchMedia("(max-width: 767px)").matches && getRowSize === 2) {
            isCorrect = true;
        } else if (window.matchMedia("(min-width: 768px)").matches && window.matchMedia("(max-width: 991px)").matches && getRowSize === 3) {
            isCorrect = true;
        } else if (window.matchMedia("(min-width: 992px)").matches && getRowSize === 7) {
            isCorrect = true;
        }
        // expect
        expect(isCorrect).to.equal(true);
    });
});
/* /end carousel options */

/**
 *
 * Carousel Row
 *
 */
describe("Carousel Row", function() {
    it("has x-positioning", function() {
        var hasPosition =
            $(window.carousel.options.selector).find(".car_row").length ==
            $(window.carousel.options.selector)
                .find(".car_row")
                .filter("[data-carousel-row-x]").length
                ? true
                : false;
        expect(hasPosition).to.equal(true);
    });
});

/* /end carousel row */

/**
 *
 * Carousel Items
 *
 */
describe("Carousel Items", function() {
    it("sets x-positioning of each item", function() {
        var itemsLength = $(window.carousel.options.selector + " .car_item").length;
        var itemsLengthSetPos = $(window.carousel.options.selector + " .car_item[data-carousel-item-x]").length;
        expect(itemsLength).to.equal(itemsLengthSetPos);
    });
    it("has unique x-positioning value for each item", function() {
        var isUnique = true;
        var getPosition;
        // loop through items; compare next and previous x-position to check if equal to current one
        $(window.carousel.options.selector)
            .first()
            .find(".car_item")
            .each(function(index) {
                getPosition = parseFloat($(this).attr("data-carousel-item-x"));
                getNextPosition = $(this).next().length
                    ? parseFloat(
                          $(this)
                              .next()
                              .attr("data-carousel-item-x")
                      )
                    : false;
                getPreviousPosition = $(this).prev().length
                    ? parseFloat(
                          $(this)
                              .prev()
                              .attr("data-carousel-item-x")
                      )
                    : false;

                if (getNextPosition && getNextPosition === getPosition) {
                    isUnique = false;
                } else if (getPreviousPosition && getPreviousPosition === getPosition) {
                    isUnique = false;
                }
            });
        // expect
        expect(isUnique).to.equal(true);
    });
});

/* /end carousel items */
