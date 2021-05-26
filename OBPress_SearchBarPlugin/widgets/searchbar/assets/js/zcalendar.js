/*
 *  zyrgon-calendar.js alpha | http://zyrgon.com | (c) 2020
 */


jQuery("document").ready(function () {
  moment.tz.setDefault("UTC");

  var ZyrgonCalendar = function (options) {
    //initializing the calendar, first run, and default options

    this.element = options.element;

    this.promo = options.promo;

    if (!window.moment) {
      //no moment, no calendar
      return;
    }

    //set the element and field where calendar will be created
    if (options.field != null) {
      this.widget = options.field;
    } else {
      this.widget = document.querySelector(options.element); //if no element #calendar is default
    }
    // this.field = document.querySelector(".zhs-calendar");
    this.field = this.widget;
    if (this.field == null) {
      // console.log("Sorry, i cant find that element");
      return;
    }

    //set moment settings (locale)
    this.locale = jQuery("#lang_curr").data("code");
    moment.locale(this.locale);

    this.openWith = options.openWith;

    //what to show
    this.showMonthsNum = options.showMonthsNum || 1;

    //output fields hidden and visible
    this.outputDateFormat = options.outputDateFormat || "DDMMYYYY";
    this.outputShowFormat = options.outputShowFormat || "DD/MM/YYYY";

    //min max days allowed to pick
    this.daysMin = options.daysMin || 1; //number of min days allowed to select
    this.daysMax = options.daysMax || null; //number of max days allowed to select

    this.width = options.width;

    //today this month ,ADAPTED FOR NEW TASK

    this.startDate = moment(jQuery("#date_from").val(), "DDMMYYYY").add(
      12,
      "hours"
    );

    //this.startDate =  moment( "19112020", 'DDMMYYYY').add(12,'hours');

    this.today = this.startDate;
    this.month = this.today.clone().startOf("month").utc().format("X");

    this.realToday = moment().startOf("day").add(12, "hours");

    //initial setup, without picking dates are today and tomorrow
    this.first = this.today.clone().startOf("day").add(12, "hours"); //first pick
    this.second = this.first
      .clone()
      .add(this.daysMin, "days")
      .startOf("day")
      .add(12, "hours"); //second pick

    //default values
    this.start = this.first.clone();
    this.end = this.second.clone();

    if (options.doFetch || options.doFetch == null) {
      this.doFetch = true;
    } else {
      this.doFetch = false;
    }

    this.disablePromoDates = false;
    this.disablePromoDatesAtQ = 0;

    this.onSelect = options.onSelect || function () {};

    this.data = {};

    this.hover = null; //holds the hover YMD format

    this.isRangeSelected = true;

    this.fresh = true;

    this.promos = [];

    // check if its new promo or normal request
    this.newRequest = false;

    this.drawCalendar();

    this.setOmnibeesDates();

    this.currencies = {
      1: "Lek",
      2: "?",
      3: "AR$",
      4: "ƒ",
      5: "$",
      6: "$",
      7: "$",
      8: "$",
      9: "p",
      10: "B",
      11: "$",
      12: "$b",
      13: "KM",
      14: "P",
      15: "$",
      16: "R$",
      17: "$",
      18: "?",
      19: "$",
      20: "$",
      21: "CL$",
      22: "¥",
      23: "COP",
      24: "¢",
      25: "k",
      26: "?",
      27: "Kc",
      28: "k",
      29: "RD$",
      30: "$",
      31: "£",
      32: "$",
      33: "k",
      34: "€",
      43: "$",
      44: "F",
      46: "₨",
      47: "Rp",
      50: "?",
      52: "¥",
      56: "?",
      59: "L",
      62: "L",
      64: "RM",
      66: "MXN",
      72: "$",
      76: "k",
      82: "?",
      83: "z",
      85: "l",
      86: "?",
      91: "$",
      94: "R",
      97: "k",
      98: "CHF",
      102: "?",
      104: "T",
      108: "£",
      109: "US$",
      117: "DH",
      118: "MZN",
      119: "VEF",
      120: "S/.",
      121: "?.?",
      122: "₫",
    };

    // this.fetchDates(this.first.format("YYYY-MM-DD"),this.first.clone().add("1","months").endOf("month").format("YYYY-MM-DD"));

    return this;
  };

  // ZyrgonCalendar.prototype.disablePromos = function(){
  // 	console.log('disable promos');
  // 	this.disablePromoDatesAtQ = this.getQ();
  // 	this.disablePromoDates = true;
  // 	var ranges = $(".date-range");
  // 	var today = moment().startOf('day').add(12,'hours');
  // 	if(ranges.length>0){
  // 		for(var i=0; i<ranges.length;i++){
  // 			var range = $(".date-range").eq(i);
  // 			var range_start = moment(range.attr("data-start")).clone().startOf('day').add(12,'hours');
  //       		var range_end = moment(range.attr("data-end")).clone().startOf('day').add(12,'hours');
  //       		while(range_start <= range_end) {
  //       			range_start = range_start.clone().startOf('day').add(12,'hours');
  //       			var unix = Number(range_start.utc().format("X"));
  //       			if(!this.promos.includes(unix) && range_start.isSameOrAfter(today)){
  //       				this.promos.push(unix);
  //       			}
  //     			range_start.add(1, 'days');
  // 			}
  // 		}
  // 	}

  // 	this.gotoDate(this.promos[0]);

  // 	return this;
  // };

  ZyrgonCalendar.prototype.createListeners = function () {
    //date listeners
    var dates = this.field.querySelectorAll(".zc-date");

    for (var i = 0; i < dates.length; i++) {
      //date click listener
      dates[i].addEventListener(
        "click",
        function (e) {
          this.selectDate(e);
        }.bind(this)
      );

      //date hover listener
      dates[i].addEventListener(
        "mouseenter",
        function (e) {
          this.onDateHover(e);
        }.bind(this)
      );
    }

    jQuery(document).mouseup(
      function (e) {
        var container = jQuery(this.field);
        if (!container.is(e.target) && container.has(e.target).length === 0) {
          this.hide();
        }
      }.bind(this)
    );

    //escape key unselects dates
    this.widget.onkeydown = function (evt) {
      evt = evt || window.event;
      var isEscape = false;
      if ("key" in evt) {
        isEscape = evt.key === "Escape" || evt.key === "Esc";
      } else {
        isEscape = evt.keyCode === 27;
      }
      if (isEscape) {
        this.unselect();
      }
    }.bind(this);

    //on change refill calendar
    jQuery("#hotel_code").change(this.destinationChange.bind(this));
    // document.querySelector("#hotel_code").addEventListener('change', this.destinationChange.bind(this));
    document
      .querySelector("input[name='c']")
      .addEventListener("change", function () {
        this.destinationChange.bind(this).bind(this);
      });

    //month prev next listners
    jQuery(document).on("click", ".zc-close", this.hide.bind(this));
    jQuery(document).on("click", ".zc-btn-prev", this.prevMonth.bind(this));
    jQuery(document).on("click", ".zc-btn-next", this.nextMonth.bind(this));

    if (this.element == ".zcalendar") {
      // when click on book now
      jQuery(document).on(
        "click",
        "#promoton_redirect",
        this.bookNow.bind(this)
      );
    }

    var use = jQuery(document);

    if (jQuery(this.widget).parent().find(this.openWith).length) {
      use = jQuery(this.widget).parent();
    } else {
      if (jQuery(this.widget).parent().parent().find(this.openWith).length) {
        use = jQuery(this.widget).parent().parent();
      }
    }

    // CLICK ON DATE INPUT

    use.on(
      "click",
      this.openWith,
      function () {
        if (jQuery(this.widget).is(":visible")) {
          this.hide();
          jQuery(".ob-searchbar-calendar").removeClass("opened");
        } else {
          this.show();
          jQuery(".ob-searchbar-calendar").addClass("opened");
        }

        // // if click on date, promo is on and request is new, fill normal dates
        // if (this.promo == true)  {
        // 	this.promo = false;
        // 	this.newRequest = true;
        // 	this.fill();
        // }
      }.bind(this)
    );
  };

  ZyrgonCalendar.prototype.show = function () {
    jQuery(this.widget).slideDown(200);
    jQuery(".ob-searchbar-calendar").addClass("opened");
  };

  ZyrgonCalendar.prototype.hide = function () {
    jQuery(this.widget).slideUp(200);
    jQuery(".ob-searchbar-calendar").removeClass("opened");
    jQuery(".section1").css("display", "block");
    jQuery(".header-top-spacer").css("display", "block");
  };

  ZyrgonCalendar.prototype.goToSelection = function () {
    //move calendar to selected
  };

  ZyrgonCalendar.prototype.destinationChange = function () {
    var q = this.getQ();
    if (q != this.disablePromoDatesAtQ) {
      this.disablePromoDates = false;
      this.disablePromoDatesAtQ = 0;
    }

    this.unselect();
    this.fill();

    return this;
  };

  ZyrgonCalendar.prototype.drawCalendar = function (advanced) {
    if (advanced == "advanced") {
      this.startDate = moment("19112020", "DDMMYYYY").add(12, "hours");
    }

    this.field.innerHTML = "";

    // console.log(this.field,'field');

    //button prev
    var leftBtn = document.createElement("button");
    leftBtn.setAttribute("type", "button");
    leftBtn.classList.add("zc-btn");
    leftBtn.classList.add("zc-btn-prev");
    this.field.appendChild(leftBtn);

    //button next
    var rightBtn = document.createElement("button");
    rightBtn.setAttribute("type", "button");
    rightBtn.classList.add("zc-btn");
    rightBtn.classList.add("zc-btn-next");
    this.field.appendChild(rightBtn);
    //create

    //months
    var months = document.createElement("div");
    months.classList.add("zc-months");
    this.field.appendChild(months);

    //month
    var month = document.createElement("div");
    month.classList.add("zc-month");

    //month info
    var monthInfo = document.createElement("div");
    monthInfo.classList.add("zc-month-info");
    month.appendChild(monthInfo);

    var monthName = document.createElement("span");
    monthName.classList.add("zc-month-name");
    monthInfo.appendChild(monthName);

    var monthYear = document.createElement("span");
    monthYear.classList.add("zc-month-year");
    monthInfo.appendChild(monthYear);

    //week days
    var weekDays = document.createElement("div");
    weekDays.classList.add("zc-weekdays");
    month.appendChild(weekDays);

    var weekDay = document.createElement("div");
    weekDay.classList.add("zc-weekday");

    for (var i = 0; i < 7; i++) {
      weekDays.appendChild(weekDay.cloneNode(true));
    }

    //month dates
    var dates = document.createElement("div");
    dates.classList.add("zc-dates");
    month.appendChild(dates);

    var date = document.createElement("div");
    date.classList.add("zc-date");

    var dateInner = document.createElement("div");
    dateInner.classList.add("zc-date-inner");
    date.appendChild(dateInner);

    var dateBox = document.createElement("div");
    dateBox.classList.add("zc-date-box");
    dateInner.appendChild(dateBox);

    var dateDate = document.createElement("div");
    dateDate.classList.add("zc-date-date");
    dateBox.appendChild(dateDate);

    var datePriceBox = document.createElement("div");
    datePriceBox.classList.add("zc-date-price");
    dateBox.appendChild(datePriceBox);

    //make fields for of the month (7 days per week, max 6 weeks = 42)
    for (i = 0; i < 42; i++) {
      dates.appendChild(date.cloneNode(true));
    }

    //duplicate month
    for (i = 0; i < this.showMonthsNum; i++) {
      months.appendChild(month.cloneNode(true));
    }
    if (this.doFetch) {
      var info = document.createElement("div");
      var infoDetailsPrices = "" + this.field.getAttribute("data-unavilable");
      var infoDetailsPromo =
        '<span class="zc-info-bar-promo"></span> ' +
        this.field.getAttribute("data-promotional");
      info.innerHTML = infoDetailsPrices + infoDetailsPromo;
      info.classList.add("zc-info-bar");
      this.field.appendChild(info);

      var close = document.createElement("div");
      close.classList.add("zc-close");
      close.innerHTML =
        '<img src="/icons/icons_White/iconWhite_Xclose.svg" alt="close">';
      this.field.appendChild(close);
    }
    this.fill();
    this.createListeners();

    return this;
  };

  // press on the next button
  ZyrgonCalendar.prototype.nextMonth = function (monthDifference) {
    this.month = moment(this.month, "X").add("1", "M").utc().format("X");
    this.field.querySelector(".zc-btn-prev").disabled = false;
    this.fill();
    return this;
  };

  // press on the prev button (check if its current month, do not allow back)
  ZyrgonCalendar.prototype.prevMonth = function () {
    var monthM = moment(this.month, "X");

    if (moment().isSame(monthM.utc().format("YYYY-MM-DD"), "month")) {
      this.field.querySelector(".zc-btn-prev").disabled = true;
      return this;
    } else {
      this.month = monthM.subtract("1", "M").utc().format("X");
      // console.log(this.month);
    }

    this.fill();
    return this;
  };

  // return month when open advanced search after error
  ZyrgonCalendar.prototype.prevMonthAdv = function (begginingUnix) {
    this.month = begginingUnix;
    this.fill();
    return this;
  };

  ZyrgonCalendar.prototype.gotoDate = function (unix) {
    var monthM = moment(this.month, "X").startOf("month");
    this.month = monthM.utc().format("X");
  };

  ZyrgonCalendar.prototype.unselect = function () {
    var today = moment();
    // this.first = today.clone();
    // this.second = this.first.clone().add(this.daysMin,'days');

    // this.start = this.first.clone();
    // this.end = this.second.clone();
    this.isRangeSelected = true;
    this.fresh = true;
    this.setRange(this.first, this.second);
    this.fill();
  };

  ZyrgonCalendar.prototype.selectDate = function (e) {
    var target = e.target ? e.target : e.srcElement;
    var target = this.getDateElement(target);
    if (target.hasAttribute("data-disabled")) return; // if date is disabled you cant select it

    var day = moment(target.getAttribute("data-unix"), "X");

    if (!day.isValid()) return; // if date doesnt have the unix timestamp you cant select it

    this.fresh = false; //calendar is not fresh any more, someone picked a date

    var dates = this.field.querySelectorAll("." + target.className);
    if (this.isRangeSelected == true) {
      //first date picked

      this.first = day.clone();
      this.second = this.first.clone().add(this.daysMin, "days"); // set second to min days of first
      this.isRangeSelected = false;
      this.setRange(this.first, this.second);
      this.showSingle(this.first); //if single date
    } else {
      //now its a full range
      if (this.first.utc().format("X") == day.utc().format("X")) return; //you cant pick the same date

      this.second = day.clone();
      this.isRangeSelected = true;
      this.setRange(this.first, this.second);
      this.showRange(this.start, this.end);

      this.hide();
    }
    // console.log(this.isRangeSelected);
    this.onSelect();

    this.showDisabled();

    return this;
  };

  ZyrgonCalendar.prototype.setRange = function (first, second) {
    //first, second date
    this.start = this.second.isAfter(this.first)
      ? this.first.clone()
      : this.second.clone();
    this.end = this.second.isAfter(this.first)
      ? this.second.clone()
      : this.first.clone();

    this.setOmnibeesDates(this.start, this.end);
    // this.isRangeSelected = true;
    this.fresh = false;

    this.showRange(this.start, this.end);
  };

  ZyrgonCalendar.prototype.setDateRange = function (first, second) {
    this.first = first.clone().startOf("day").add(12, "hours");
    this.start = first.clone().startOf("day").add(12, "hours");
    this.second = second.clone().startOf("day").add(12, "hours");
    this.end = second.clone().startOf("day").add(12, "hours");
    this.setRange(this.start, this.end);
    // this.showRange(this.start,this.end);
    this.onSelect();
    // this.fill();
  };

  ZyrgonCalendar.prototype.showRange = function (firstM, secondM) {
    var q = this.getQ();

    var dates = this.field.querySelectorAll(".zc-date");
    if (this.fresh == true) {
      //unselect all
      for (i = 0; i < dates.length; i++) {
        this.showDateClean(dates[i]);
      }
      return;
    }

    var start = secondM.isAfter(firstM) ? firstM.clone() : secondM.clone();
    var end = secondM.isAfter(firstM) ? secondM.clone() : firstM.clone();

    var startUnix = Number(start.utc().format("X"));
    var endUnix = Number(end.utc().format("X"));

    var first = this.first.utc().format("X");
    var firstAvailStart = null;
    var firstAvailEnd = null;

    for (i = 0; i < dates.length; i++) {
      this.showDateClean(dates[i]); //clean out the data attributes

      var unix =
        dates[i].getAttribute("data-unix") != null
          ? Number(dates[i].getAttribute("data-unix"))
          : null;

      if (unix == null) continue; //skip if null

      if (unix >= startUnix && unix <= endUnix) {
        dates[i].setAttribute("data-in-range", "true");
      }

      if (unix == startUnix) {
        dates[i].setAttribute("data-start", "true");

        if (this.isRangeSelected == true) {
          dates[i].setAttribute("data-title", "Check In");
        }
      }

      if (unix == endUnix) {
        dates[i].setAttribute("data-end", "true"); //set end
        if (this.isRangeSelected == true) {
          dates[i].setAttribute("data-title", "Check Out");
        }
      }

      var nights = this.getNights(start, end);
      if (
        this.isRangeSelected == false &&
        this.hover != null &&
        unix == this.hover.utc().format("X")
      ) {
        if (nights == 1) {
          dates[i].setAttribute(
            "data-title",
            nights + " " + jQuery("[data-night]").eq(0).data("night")
          );
        } else {
          dates[i].setAttribute(
            "data-title",
            nights + " " + jQuery("[data-nights]").eq(0).data("nights")
          );
        }
      }

      if (
        this.isRangeSelected == true &&
        dates[i].getAttribute("data-title") == null
      ) {
        dates[i].setAttribute("data-title", "Check In");
      }
    }

    return this;
  };

  ZyrgonCalendar.prototype.showSingle = function (firstM) {
    var q = this.getQ();
    var first = firstM.utc().format("X");
    var dates = this.field.querySelectorAll(".zc-date");
    for (i = 0; i < dates.length; i++) {
      this.showDateClean(dates[i]); //clean out the data attributes

      var unix =
        dates[i].getAttribute("data-unix") != null
          ? Number(dates[i].getAttribute("data-unix"))
          : null;

      if (unix == null) continue; //skip if null

      if (unix == first) {
        dates[i].setAttribute("data-first", "true");
      }
    }
    return this;
  };

  ZyrgonCalendar.prototype.showDateClean = function (dateDiv) {
    var q = this.getQ();

    dateDiv.removeAttribute("data-start");
    dateDiv.removeAttribute("data-end");
    dateDiv.removeAttribute("data-in-range");
    dateDiv.removeAttribute("data-first");

    var unix = dateDiv.getAttribute("data-unix");

    if (
      this.data[q] != null &&
      this.data[q].calendar[unix] != null &&
      this.data[q].calendar[unix].promo == true
    ) {
      dateDiv.setAttribute("data-promo", "true");
      dateDiv.setAttribute("data-title", jQuery(this.field).data("promo"));
    } else {
      dateDiv.removeAttribute("data-promo");
    }

    if (this.fresh == false) {
      dateDiv.removeAttribute("data-title");
    }
    return this;
  };

  ZyrgonCalendar.prototype.getQ = function () {
    var qInput = document.querySelector("input[name='q']").value;
    // console.log(qInput,'qInput')
    if (qInput == null) {
      q = 0;
    } else {
      q = Number(qInput);
    }
    return Number(q);
  };

  //display disabled dates
  ZyrgonCalendar.prototype.showDisabled = function () {
    var q = this.getQ();

    var disableBefore = this.first
      .clone()
      .subtract(this.daysMax - 1, "days")
      .format("X");
    var disableAfter = this.first
      .clone()
      .add(this.daysMax - 1, "days")
      .format("X");
    //yesterday unix
    var today = this.realToday.format("X");

    var first = this.first.clone().startOf("day").add(12, "hours").format("X");

    //disabled all unavailable dates before
    var prevDisabled = null;
    var nextDisabled = null;

    var dates = this.field.querySelectorAll(".zc-date");

    //find first disabled before the picked time
    if (this.isRangeSelected == false) {
      for (i = 0; i < dates.length; i++) {
        var date = dates[i].getAttribute("data-unix");
        if (date == null) continue;
        var unix = Number(date);
        if (
          this.data[q] != null &&
          this.data[q].calendar[unix] != null &&
          this.data[q].calendar[unix].available == false &&
          unix < first
        ) {
          prevDisabled = unix;
        }
      }
    }

    // ako je promo, uzmi datume i pretvori ih u Unix

    if (this.promo == true) {
      var offerDates = jQuery(".date-range");
      var startPromoDates = [];
      var endPromoDates = [];

      jQuery.each(offerDates, function (index, value) {
        var dataStart = value.getAttribute("data-start");
        var dataEnd = value.getAttribute("data-end");

        var startPromoDateSubstring = dataStart.substring(0, 10);
        var endPromoDateSubstring = dataEnd.substring(0, 10);

        var startPromoDateMoments =
          moment(startPromoDateSubstring).unix() + 43200;

        // end one day to end date, visitor will check out day after last day of promo
        var endPromoDateMoments =
          moment(endPromoDateSubstring).unix() + 43200 + 86400;

        startPromoDates.push(startPromoDateMoments);
        endPromoDates.push(endPromoDateMoments);
      });
    }

    // start of loop
    for (i = 0; i < dates.length; i++) {
      //FIX FOR EVERYONE THAT WAS COSTAO

      // var qInput = document.querySelector("input[name='q']").value;

      // if (qInput == "4937")  {

      dates[i].removeAttribute("data-disabled");

      dates[i].removeAttribute("data-gray");

      var date = dates[i].getAttribute("data-unix");
      if (date == null) continue; //skip one if null

      // If it is promo calendar and its not offer date, disable that date
      if (this.promo == true) {
        dates[i].setAttribute("data-disabled", "true");

        for (j = 0; j < startPromoDates.length; j++) {
          if (
            Number(dates[i].getAttribute("data-unix")) >= startPromoDates[j] &&
            Number(dates[i].getAttribute("data-unix") <= endPromoDates[j])
          ) {
            dates[i].removeAttribute("data-disabled");
          }
        }
      }

      var unix = Number(date); //unix timestamp

      //disable dates before today
      if (unix < today) {
        dates[i].setAttribute("data-disabled", "true");
        continue;
      }
      if (this.disablePromoDates && this.promos.length > 0) {
        if (this.promos.includes(unix)) {
          dates[i].removeAttribute("data-disabled");
          // console.log(unix,'remove');
        } else {
          //dates[i].setAttribute("data-disabled","true" );
        }
      }

      if (this.isRangeSelected == true) {
        //range is selected

        if (
          this.data[q] != null &&
          this.data[q].calendar[unix] != null &&
          this.data[q].calendar[unix].available == false
        ) {
          dates[i].setAttribute("data-gray", "true");
        }
      } else {
        //first date is selected

        //disable outside max date range
        if (unix != 0 && (unix < disableBefore || unix > disableAfter)) {
          dates[i].setAttribute("data-disabled", "true");
          continue;
        }

        // keep current disabled dates until picked date
        if (
          unix != 0 &&
          unix < first &&
          this.data[q] != null &&
          this.data[q].calendar[unix] != null &&
          this.data[q].calendar[unix].available == false
        ) {
          //dates[i].setAttribute("data-disabled","true");
          continue;
        }

        // shift dates after picked date by 1
        var dayAfter = Number(
          moment(unix, "X")
            .subtract(1, "days")
            .startOf("day")
            .add(12, "hours")
            .format("X")
        );
        if (
          unix != null &&
          unix > first &&
          this.data[q].calendar[dayAfter] != null &&
          this.data[q].calendar[dayAfter].available == false
        ) {
          if (nextDisabled == null) {
            nextDisabled = unix;
          }
          //dates[i].setAttribute("data-disabled","true");
          continue;
        }

        //shift disabled promo dates dates
        if (this.disablePromoDates && this.promos.length > 0) {
          var dayBefore = Number(
            moment(unix, "X")
              .subtract(1, "days")
              .startOf("day")
              .add(12, "hours")
              .format("X")
          );
          // console.log(this.promos, dayBefore);
          if (unix != null && unix > first && this.promos.includes(dayBefore)) {
            //dates[i].removeAttribute("data-disabled" );
          }
          continue;
        }

        //disable dates before the first previously disabled date
        if (prevDisabled != null && unix < prevDisabled) {
          //dates[i].setAttribute("data-disabled","true");
          continue;
        }

        //disable dates after the first next disabled dates
        if (nextDisabled != null && unix >= nextDisabled) {
          //dates[i].setAttribute("data-disabled","true");
        }
      }

      // Gray out the day after last promo date
      if (this.promo == true) {
        for (k = 0; k < startPromoDates.length; k++) {
          if (
            Number(dates[i].getAttribute("data-unix")) >= startPromoDates[k] &&
            Number(dates[i].getAttribute("data-unix") <= endPromoDates[k])
          ) {
            dates[i].removeAttribute("data-gray");
          }
        }
      }

      // }  else {  /* END OF FIX FOR COSTAO , NORMAL CALENDAR  */

      // 	dates[i].removeAttribute("data-disabled");

      // 	var date = dates[i].getAttribute("data-unix");
      // 	if(date==null) continue;//skip one if null

      // 	// If it is promo calendar and its not offer date, disable that date
      // 	if (this.promo == true)  {

      // 		//dates[i].setAttribute("data-disabled","true");

      //         for (j=0 ; j < startPromoDates.length; j++)  {

      //         	if ( Number(dates[i].getAttribute("data-unix") ) >= startPromoDates[j] &&  Number(dates[i].getAttribute("data-unix")  <= endPromoDates[j] )  )  {

      // 				dates[i].removeAttribute("data-disabled");

      // 		    }

      //         }

      // 	};

      // 	var unix = Number(date); //unix timestamp

      // 	//disable dates before today
      // 	if(unix<today){
      // 		dates[i].setAttribute("data-disabled","true");
      // 		continue;
      // 	}

      // 	moment.tz.setDefault("UTC");

      // 		if(this.disablePromoDates && this.promos.length>0){
      // 			if(this.promos.includes(unix)){
      // 				dates[i].removeAttribute("data-disabled" );
      // 				// console.log(unix,'remove');
      // 			}else{
      // 				dates[i].setAttribute("data-disabled","true" );
      // 			}
      // 		}

      // 		if(this.isRangeSelected==true){ //range is selected

      // 			if(this.data[q]!=null &&this.data[q].calendar[unix]!=null && this.data[q].calendar[unix].available==false){
      // 				dates[i].setAttribute("data-disabled","true" );
      // 			}

      // 		}else{ //first date is selected

      // 						//disable outside max date range
      // 						if(unix!=0 && (unix<disableBefore || unix>disableAfter) ){
      // 							dates[i].setAttribute("data-disabled","true");
      // 							continue;
      // 						}

      // 						// keep current disabled dates until picked date
      // 						if(unix!=0 && (unix<first &&this.data[q]!=null && this.data[q].calendar[unix]!=null && this.data[q].calendar[unix].available==false)){
      // 							dates[i].setAttribute("data-disabled","true");
      // 							continue;
      // 						}

      // 						// shift dates after picked date by 1
      // 						var dayAfter = Number(moment(unix,"X").subtract(1,'days').startOf('day').add(12,'hours').format("X"));
      // 						if(unix!=null && unix>first && this.data[q].calendar[dayAfter]!=null && this.data[q].calendar[dayAfter].available==false){
      // 							if(nextDisabled==null){ nextDisabled=unix; }
      // 								dates[i].setAttribute("data-disabled","true");
      // 							continue;
      // 						}

      // 						//shift disabled promo dates dates
      // 						if(this.disablePromoDates && this.promos.length>0){
      // 							var dayBefore = Number(moment(unix,"X").subtract(1,'days').startOf('day').add(12,'hours').format("X"));
      // 							// console.log(this.promos, dayBefore);
      // 							if(unix!=null && unix>first && this.promos.includes(dayBefore)){
      // 								dates[i].removeAttribute("data-disabled" );
      // 							}
      // 							continue;
      // 						}

      // 						//disable dates before the first previously disabled date
      // 						if(prevDisabled!=null && unix<prevDisabled){
      // 							dates[i].setAttribute("data-disabled","true");
      // 							continue;
      // 						}

      // 						//disable dates after the first next disabled dates
      // 						if(nextDisabled!=null && unix>=nextDisabled){
      // 							dates[i].setAttribute("data-disabled","true");
      // 						}

      // 		}

      // 				// Gray out the day after last promo date
      // 			    if (this.promo == true)  {

      // 					for (k=0 ; k < startPromoDates.length; k++)  {

      // 			        	if ( Number(dates[i].getAttribute("data-unix") ) >= startPromoDates[k] &&  Number(dates[i].getAttribute("data-unix")  <= endPromoDates[k] )  )  {

      // 							dates[i].removeAttribute("data-gray");

      // 					    }

      // 			        }

      // 			    };

      // }  // end of else
    } // end of loop
  };

  ZyrgonCalendar.prototype.onDateHover = function (e) {
    var target = this.getDateElement(e.target);
    if (target == null) return;
    var unix = target.getAttribute("data-unix");
    if (unix == null) return;
    if (target.getAttribute("data-disabled") != null) return;
    this.hover = moment(unix, "X");

    if (target.hasAttribute("data-disabled")) return;

    if (this.isRangeSelected == false) {
      //on first date picked, on hover makes the start (current date) - end (hovered date) range visible
      if (unix == this.first.format("X")) {
        target.setAttribute("data-first", "true");
        this.showSingle(this.first);
        return;
      } else {
        this.showRange(this.first, this.hover);
      }
    }
  };

  ZyrgonCalendar.prototype.getDateElement = function (el) {
    //on inside date click, sometimes we click on some inner div, and it doesnt contain date data, so we need to go into parents div
    for (var i = 0; i < 4; i++) {
      // go only 3 times
      if (el.className == "zc-date") {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  };

  //nights between 2 moments
  ZyrgonCalendar.prototype.getNights = function (first, second) {
    return Math.abs(first.diff(second, "days"));
  };

  //setters
  ZyrgonCalendar.prototype.setStart = function (moment) {
    this.start = moment;
  };
  ZyrgonCalendar.prototype.setEnd = function (moment) {
    this.end = moment;
  };

  ZyrgonCalendar.prototype.setOmnibeesDates = function () {
    //set checkin and checkout
  };

  //fill in the design
  ZyrgonCalendar.prototype.fill = function () {
    this.fillMonths(); //fill dates and all

    //fetch 2 month intervals for dates on screen
    this.fetchDates();

    this.showRange(this.start, this.end);
    this.showDisabled();

    return this;
  };

  //fill in the design
  ZyrgonCalendar.prototype.fillAdvanced = function (firstAvailStartAdvanced) {
    this.startDate = firstAvailStartAdvanced;

    this.fillMonths(); //fill dates and all

    this.doFetch = true;

    this.openAdvancedWithError = true;

    //fetch 2 month intervals for dates on screen
    this.fetchDates();

    this.showRange(this.start, this.end);
    this.showDisabled();

    return this;
  };

  //draw all months
  ZyrgonCalendar.prototype.fillMonths = function () {
    for (var i = 0; i < this.showMonthsNum; i++) {
      this.fillMonth(i);
    }
    return this;
  };

  ZyrgonCalendar.prototype.fillMonth = function (i) {
    var q = this.getQ();

    var month = moment(this.month, "X").clone().add(i, "months"); //first month that is picked

    var first = month.clone().startOf("month"); //first day of the month
    var last = month.clone().endOf("month"); //last day of the month

    if (this.data[q] == null) {
      this.data[q] = {};
      this.data[q].calendar = {};
    }

    var monthDiv = this.field.querySelectorAll(".zc-month")[i];
    monthDiv.querySelector(".zc-month-name").innerHTML =
    month.format("MMMM") + ",";
    monthDiv.querySelector(".zc-month-year").innerHTML = month.format("YYYY");

    var week = first.clone().startOf("week");

    var weekDays = [];
    var weekFields = monthDiv.querySelectorAll(".zc-weekday");
    for (var i = 0; i < 7; i++) {
      weekFields[i].innerHTML = week.format("ddd").substring(0, 2);
      week.add("1", "days");
    }

    var calendar = [];

    for (i = 0; i < first.weekday(); i++) {
      calendar.push(null);
    }

    var day = first.clone().startOf("day").add(12, "hours");

    while (!day.isAfter(last, "day")) {
      calendar.push(day);
      day = day.clone().add(1, "days").startOf("day").add(12, "hours");
    }

    var lang = Number(jQuery("#lang_curr").attr("data-lang"));

    var dates = monthDiv.querySelectorAll(".zc-date");
    var firstNonFetched = null;

    for (i = 0; i < 42; i++) {

      dates[i].querySelector(".zc-date-price").innerHTML = "";

      if (calendar[i] != null) {
        var unix = Number(calendar[i].format("X"));

        dates[i].setAttribute("data-unix", unix);
        dates[i].querySelector(".zc-date-date").innerHTML =
        calendar[i].format("D");

        if (this.data[q].calendar[unix] != null) {
          if (this.data[q].calendar[unix].available == false) {
            dates[i].setAttribute("data-disabled", "true");
          } else {
            //price in front or back depends on the language
            var currency = this.data[q].calendar[unix].currency;
            currency = this.currencies[currency];
            var value = this.data[q].calendar[unix].price.toFixed(2);
            var price = value + currency;


            if (lang != 1 && currency != "COP") {
              var vp = value.split(".");
              value = vp[0];
            }

            if (lang == 1 || lang == 8) {
              price = currency + value;
            } else {
              price = value + currency;
            }

            if (currency == "COP") {
              var valuta = " mil";

              if (lang == 1 || lang == 2) {
                var valuta = " k";
              }

              price = Math.floor(value / 1000) + valuta;
            }

            dates[i].querySelector(".zc-date-price").innerHTML = price;
            dates[i].setAttribute("data-title", "Check In");
          }
        }
      } else {
        //non day
        dates[i].removeAttribute("data-closed");
        dates[i].querySelector(".zc-date-date").innerHTML = "";
        dates[i].querySelector(".zc-date-price").innerHTML = "";
        dates[i].removeAttribute("data-title");
        dates[i].removeAttribute("data-unix");
      }
    }

    return this;
  };

  //this.addDate(q, x, avail, price, currency, promo, open);
  ZyrgonCalendar.prototype.hasDate = function (q, unix) {
    if (!this.data.hasOwnProperty(q)) {
      this.data[q] = {};
      this.data[q].calendar = {};
    }
    if (this.data[q].calendar.hasOwnProperty(unix)) {
      return true;
    }
    return false;
  };

  //this.addDate(q, x, avail, price, currency, promo, open);
  ZyrgonCalendar.prototype.addDate = function (
    q,
    unix,
    avail,
    price,
    currency,
    promo,
    open
  ) {
    if (!this.data.hasOwnProperty(q)) {
      this.data[q] = {};
      this.data[q].calendar = {};
    }

    this.data[q].calendar[unix] = {};
    this.data[q].calendar[unix].available = avail;
    this.data[q].calendar[unix].price = price;
    this.data[q].calendar[unix].currency = currency;
    this.data[q].calendar[unix].promo = promo;
    this.data[q].calendar[unix].open = open;
  };

  ZyrgonCalendar.prototype.fetchDates = function () {
    if (this.doFetch == false) return;

    var q = this.getQ(); //get hotel id, if its 0 it is chain

    var c = null;

    if (q === 0) {
      // it is chain
      c = Number(document.querySelector("input[name='c']").value);
    }

    // GET FOLDER, IF ITS CLICKED ,FIND IS THERE ONLY ONE HOTEL IN IT AND SELECT IT

    var hotelFolder = jQuery("#hotel_folder").val();

    if (hotelFolder !== "") {
      var folderChildren = jQuery(
        "form .hotels_hotel[data-parent-id='" + hotelFolder + "']"
      );

      var folderChildrenNumber = folderChildren.length;

      if (folderChildrenNumber == 1) {
        q = folderChildren.attr("data-id");
        c = null;
        //$("#hotel_code").val(q);
        //$("#hotel_folder").val("");
      }
    }

    // IF MORE THAN ONE HOTEL IS SELECTED, DONT SEND REQUEST, LEAVE DATES EMPTY

    if (q === 0) return;

    var datesDivs = this.field.querySelectorAll(".zc-date[data-unix]");

    if (datesDivs.length == 0) return; //nothing to do

    var firstUnix = Number(datesDivs[0].getAttribute("data-unix"));
    var lastUnix = Number(
      datesDivs[datesDivs.length - 1].getAttribute("data-unix")
    );

    //first and last date are fetched, nothing to do here, ne dopusta da se pokrene ako je popunjen kalendar

    // ALI AKO JE PROMO A POSLAT JE OBICAN, ILI OBRNUTO, PUSTI GA DALJE

    if (
      this.hasDate(q, lastUnix) &&
      this.hasDate(q, firstUnix) &&
      this.newRequest == false
    )
      return;

    this.newRequest = false;

    // check if folder with one hotel is clicked

    // if ( $("#hotel_code").val() !== "" &&  $("#hotel_folder").val() !== "" )  {
    // 	$("#hotel_code").val("");
    // 	revert = "true";
    // }

    //find first non checked and go 2 months from that one
    var unix = firstUnix;
    for (var i = 0; i < datesDivs.length; i++) {
      unix = Number(datesDivs[i].getAttribute("data-unix"));
      if (!this.hasDate(q, unix)) {
        break;
      }
    }

    // var unix = moment( this.startDate  ).format("X");
    //    var lastUnix = moment( this.startDate  ).format("X");

    //save all dates
    var firstM = moment(unix, "X").startOf("day").add(12, "hours");
    var first = firstM.format("YYYY-MM-DD");

    var secondM = firstM
      .clone()
      .add(1, "months")
      .endOf("month")
      .startOf("day")
      .add(12, "hours");
    var second = secondM.format("YYYY-MM-DD");

    //save all days into an array, because the api is responding only with a list of available days
    //later we compare this list with the available days to get unavailable days
    var dates = [];
    var day = firstM;
    while (!day.isAfter(secondM, "day")) {
      dates.push(Number(day.format("X")));
      day = day.clone().add(1, "days").startOf("day").add(12, "hours");
    }

    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
      if (xhr.status == 500) {
        //try again, wait 5ms
        setTimeout(
          function () {
            this.fill();
          }.bind(this),
          5
        );
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        var available = []; //temp to save avail dates
        var res = xhr.response ? xhr.response : xhr.responseText;

        // res = JSON.stringify(res);

        var arr = JSON.parse(res);

        for (var i = 0; i < arr.length; i++) {
          var x = Number(
            moment(arr[i].date).startOf("day").add(12, "hours").format("X")
          );

          var open = false;
          if (arr[i].status == "Open") {
            open = true;
          }

          var avail = true;
          var price = arr[i].price;
          var currency = arr[i].currency;
          var promo = arr[i].promo;
          var fetched = true;

          this.addDate(q, x, avail, price, currency, promo, open);
          available.push(x);
        }

        //compare available days with all days to get unavailable days (disabled)
        for (var i = 0; i < dates.length; i++) {
          if (!available.includes(dates[i])) {
            this.addDate(q, dates[i], false, 0, 0, false, false);
          }
        }

        this.fill();
      } else {
        // console.log("error, cant fetch, try again ");
      }
    }.bind(this);

    var currencyId = jQuery("#occupancy_dropdown").attr(
      "data-default-currency"
    );

    if (this.promo == true) {
      var packageId = jQuery(".section3").attr("data-packageid");

      var languageId = jQuery("#lang_curr").attr("data-lang");

      xhr.open(
        "GET",
        "/availability/offer/" +
          q +
          "/" +
          currencyId +
          "/" +
          packageId +
          "/" +
          languageId,
        true
      );
    } else if (c == null && this.promo !== true) {
      var action = "get_hotel_availability";
      // xhr.open('GET', searchbarAjax.ajaxurl+'?'+q+'/'+currencyId+'/'+first+'/'+ second, true);


      xhr.open(
        "GET",
        searchbarAjax.ajaxurl +
          "?q=" +
          q +
          "&currency_id=" +
          currencyId +
          "&first=" +
          first +
          "&second=" +
          second +
          "&action=" +
          action,
        true
      );
    } else {
      var action = "get_chain_availability";

      var chain = jQuery("input[name='c']").attr("value");
      xhr.open(
        "GET",
        searchbarAjax.ajaxurl +
          "?chain=" +
          chain +
          "&currency_id=" +
          currencyId +
          "&first=" +
          first +
          "&second=" +
          second +
          "&action=" +
          action,
        true
      );
    }

    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhr.send();

    return this;
  };

  // PROMO CALENDAR

  ZyrgonCalendar.prototype.bookNow = function () {
    // pick hotel
    var hotel_id = jQuery("#hotel").attr("data-hotel-id");

    jQuery("#hotel_code").val(hotel_id); //set hotel id

    jQuery("#as-hotel-id").val(hotel_id); //set hotel id

    jQuery("#hotel_code").trigger("change");

    jQuery("#hotels").val(
      jQuery(".hotels_hotel[data-id=" + hotel_id + "]")
        .eq(0)
        .text()
    ); //set hotel name

    //create input
    if (jQuery("#promotion_id").val() != null) {
      var promotion_id = jQuery("#promotion_id").val();
      var prid = document.createElement("input");
      prid.setAttribute("type", "hidden");
      prid.setAttribute("name", "prid");
      prid.value = promotion_id;
      jQuery(".search").eq(0).prepend(prid);
    }

    //replace to go to step2
    var action = jQuery("#hotel_search").attr("action");
    action = action.replace(/chainresults/g, "hotelresults");
    jQuery("#hotel_search").attr("action", action);

    if (width < 992) {
      jQuery(".menu_icon").attr("data-active", "false");

      if (jQuery(".header-search-bar").is(":visible")) {
        jQuery(".header-search-bar").hide();
      } else {
        jQuery(".menu_icon").attr("data-active", "false");
        jQuery(".mobile_search").attr("data-active", "true");
        jQuery(".mob-menu-toggle").hide();
        jQuery(".header-search-bar").show();
      }

      jQuery("#hotel_search").slideToggle(50, function () {
        if (jQuery(this).is(":visible")) {
          jQuery(this).css("display", "block");
        }
      });

      jQuery(".section1").css("display", "none");
      jQuery(".header-top-spacer").css("display", "none");
    }

    if (jQuery(".zcalendar").is(":visible")) {
      jQuery(".zcalendar").slideUp(200);
    } else {
      jQuery(".zcalendar").slideDown(200);
    }

    // find promo dates from data attribute, and set it in inputs

    var offerDates = jQuery(".date-range");

    var startPromoDates = [];

    var endPromoDates = [];

    var startPromoDatesSlash = [];

    var endPromoDatesSlash = [];

    jQuery.each(offerDates, function (index, value) {
      var dataStart = value.getAttribute("data-start");
      var dataEnd = value.getAttribute("data-end");

      var startPromoDateSubstring = dataStart.substring(0, 10);
      var endPromoDateSubstring = dataEnd.substring(0, 10);

      var startPromoDateMoment = moment(startPromoDateSubstring).format(
        "DDMMYYYY"
      );
      var endPromoDateMoment = moment(endPromoDateSubstring).format("DDMMYYYY");

      var startPromoDateMomentSlash = moment(startPromoDateSubstring).format(
        "DD/MM/YYYY"
      );
      var endPromoDateMomentSlash = moment(endPromoDateSubstring).format(
        "DD/MM/YYYY"
      );

      startPromoDates.push(startPromoDateMoment);
      endPromoDates.push(endPromoDateMoment);

      startPromoDatesSlash.push(startPromoDateMomentSlash);
      endPromoDatesSlash.push(endPromoDateMomentSlash);
    });

    // ako nema datum, izadji
    if (startPromoDates.length == 0) return;

    // change dates in hidden input
    jQuery("#date_from").val(startPromoDates[0]);

    jQuery("#date_to").val(endPromoDates[0]);

    // change dates in dates input

    jQuery("#calendar_dates").val(
      startPromoDatesSlash[0] + " - " + endPromoDatesSlash[0]
    );

    //FIND DATE IN CHECK IN INPUT, AND SET IT AS START DATE IN CALENDAR

    this.startDate = moment(jQuery("#date_from").val(), "DDMMYYYY").add(
      12,
      "hours"
    );

    this.today = this.startDate;

    this.month = this.today.clone().startOf("month").utc().format("X");

    this.realToday = moment().startOf("day").add(12, "hours");

    // if click on date, promo is on and request is new, fill normal dates
    if (this.promo == false) {
      this.promo = true;
      this.newRequest = true;
      this.fill();
    }

    return this;
  };

  // get language number
  var lang_number = jQuery("#lang_curr").attr("data-lang");

  var widget = new ZyrgonCalendar({
    element: ".zcalendar",
    openWith: "#calendar_dates",
    showMonthsNum: 4 /* min days to pick */,
    daysMax: 91 /* max days allowed to pick */,
    doFetch: true,
    promo: false,
    onSelect: function () {
      document.querySelector("input[name='CheckIn']").value = this.start.format(
        this.outputDateFormat
      );
      document.querySelector("input[name='CheckOut']").value = this.end.format(
        this.outputDateFormat
      );

      if (jQuery("#as-date-from").length) {
        document.querySelector("#as-date-from").value = this.first.format(
          this.outputDateFormat
        );
        document.querySelector("#as-date-to").value = this.end.format(
          this.outputDateFormat
        );
      }

      //set dates to be shown

      var range = this.start.format(this.outputShowFormat);

      if (lang_number == 1) {
        range = moment(range, "DD/MM/YYYY").format("MM/DD/YYYY");
      }

      // .innerHTML = this.start.format(this.outputShowFormat);
      if (this.isRangeSelected == true) {
        // if second date is good

        if (lang_number != 1) {
          range = range + " - " + this.end.format(this.outputShowFormat);
        }

        if (lang_number == 1) {
          var end_date = this.end.format(this.outputShowFormat);
          range =
            range + " - " + moment(end_date, "DD/MM/YYYY").format("MM/DD/YYYY");
        }

        jQuery("input[name='CheckOut']").trigger("change");
      } else {
        range = range + " - " + " . . . ";
      }
      document.querySelector("#calendar_dates").value = range;
      // document.querySelector("#as-date-from").value = this.start.format(this.outputDateFormat);
      // document.querySelector("#as-date-to").value = this.end.format(this.outputDateFormat);
    },
  });

  // SHOW SELECTED DATES IN STEP 2

  this.startDate =
    moment(jQuery("#date_from").val(), "DDMMYYYY").unix() + 43200;

  var endDate = moment(jQuery("#date_to").val(), "DDMMYYYY").unix() + 43200;
  // console.log(endDate);
  jQuery(".zc-dates")
    .find("div[data-unix=" + this.startDate + "]")
    .click();

  jQuery(".zc-dates")
    .find("div[data-unix=" + endDate + "]")
    .click();
});
