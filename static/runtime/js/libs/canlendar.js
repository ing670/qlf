define(function(){



    function Calendar(para) {
        var now = new Date();
        this.now_year = now.getFullYear();
        this.now_month = now.getMonth() + 1;
        this.now_day = now.getDate();

        this.OneDayAreaCount = 6 * 7;
        var testStyle = document.createElement("DIV").style;
        if ("-webkit-transform" in testStyle) {
          this.transitionend = "webkitTransitionEnd";
          this.transform = "-webkit-transform";
          this.transition = "-webkit-transition";
        }
        else {
          this.transitionend = "transitionend";
          this.transform = "transform";
          this.transition = "transition";
        }
        this.alertWay = "BOTTOM";
        this.container=document.body;
        if(para){
          this.alertWay = para.alertWay;
          if(para.container){
            this.container =para.container;
          }
        }
        this.YearMonthDayModel = "day";
        this.Modal = "年月日";

        this._initLayout();

        this.SelectedMonthLi = null;

        this.maxYear = 2020;
        this.minYear = 1900;

        this.callbacks = {};
        this.WrapperWidth = window.innerWidth;
        this.autoScrollOffsetX = 50;

    }

    Calendar.prototype = {
        _createElementWithClass: function (tagName, className) {
            var classList = className.split(" ");
            var ele = document.createElement(tagName);
            for (var i = 0, j = classList.length; i < j; i++) {
                if (/^\s*$/.test(classList[i])) {
                    continue;
                }
                ele.classList.add(classList[i]);
            }
            return ele;
        },
        setModal: function (modal) {
            this.Modal = modal || "年月日";
            if (this.Modal == "年月") {
                this.Days_Wrapper.classList.remove("yy-clda-wrapper-v");
                this.Years_Wrapper.classList.add("yy-clda-wrapper-v");
                this.YearMonthDayModel = "year";
            }
            return this;
        },
        _createCldaBtnWrapper: function () {
            var _this = this;
            var ele = this._createElementWithClass("DIV", "yy-clda-btn-wrapper yy-clda-table");
            var CancelBtn = this._createElementWithClass("DIV", "yy-clda-cell yy-clda-btn yy-clda-vcenter");
            CancelBtn.innerHTML = "取消";
            CancelBtn.addEventListener("click", function (e) {
                _this.hide();

            }, false)
            var EmptyArea = this._createElementWithClass("DIV", "yy-clda-cell");
            var OkBtn = this._createElementWithClass("DIV", "yy-clda-cell yy-clda-btn yy-clda-vcenter");
            OkBtn.innerHTML = "确定";
            OkBtn.addEventListener("click", function (e) {
                _this.hide();
                var callback = _this.callbacks["ok"];
                var varDate = new Date(_this.year_val, _this.month_val - 1, _this.day_val);
                _this._setValuePar(varDate.getFullYear(), varDate.getMonth() + 1, varDate.getDate());
                var valStr = _this.year_val + "-" + (_this.month_val < 10 ? ("0" + _this.month_val) : _this.month_val) ;
                var dayStr = "-" + (_this.day_val < 10 ? ("0" + _this.day_val) : _this.day_val);
                if(_this.Modal=="年月日"){
                    valStr+=dayStr;
                }
                callback && typeof(callback) == "function" && callback(valStr);
            }, false)
            ele.appendChild(CancelBtn);
            ele.appendChild(EmptyArea);
            ele.appendChild(OkBtn);
            return ele;
        },
        bind: function (eventName, callback) {
            this.callbacks[eventName] = callback;
            return this;
        },
        hide: function () {
            this.Clda_BK.classList.remove("yy-clda-bk-show");
            this.Clda_Dialog.classList.remove("yy-clda-dialog-show");
            return this;
        },
        _hasInitYearArea: false,
        show: function (val) {
            this.setValue(val);
            var _this = this;
            if (this.Modal == "年月" && !this._hasInitYearArea) {
                this._reCreateYearsArea();
                this._hasInitYearArea = true;
            }
            if(this.alertWay!="INLINE"){
              window.setTimeout(function () {
                  _this.Clda_BK.classList.add("yy-clda-bk-show");
                  _this.Clda_Dialog.classList.add("yy-clda-dialog-show");
              }, 0);
            }
            return this;
        },
        _getRealYearAndMonth: function (year, month) {
            var CurDate = new Date(year, month, 0);
            return {"month": ( CurDate.getMonth() + 1), "year": CurDate.getFullYear()}
        },
        _titleLogic: function () {
            var _this = this;
            this.Month_Title.addEventListener("click", function (e) {
                if (_this.YearMonthDayModel == "day") {
                    _this._setMonthLiSeletced();
                    _this.Days_Wrapper.classList.remove("yy-clda-wrapper-v");
                    _this.Months_Wrapper.classList.add("yy-clda-wrapper-v");
                    _this.YearMonthDayModel = "month";
                } else if (_this.YearMonthDayModel == "month" && _this.Modal == "年月日") {
                    _this.Days_Wrapper.classList.add("yy-clda-wrapper-v");
                    _this.Months_Wrapper.classList.remove("yy-clda-wrapper-v");
                    _this.YearMonthDayModel = "day";
                } else if (_this.YearMonthDayModel == "year") {
                    _this._setMonthLiSeletced();
                    _this.Months_Wrapper.classList.add("yy-clda-wrapper-v");
                    _this.Years_Wrapper.classList.remove("yy-clda-wrapper-v");
                    _this.YearMonthDayModel = "month";
                }
            }, false);

            this.Year_Title.addEventListener("click", function (e) {
                if (_this.YearMonthDayModel == "day") {
                    _this.Days_Wrapper.classList.remove("yy-clda-wrapper-v");
                    _this.Years_Wrapper.classList.add("yy-clda-wrapper-v");
                    _this.YearMonthDayModel = "year";
                    _this._reCreateYearsArea();
                } else if (_this.YearMonthDayModel == "month") {
                    _this.Years_Wrapper.classList.add("yy-clda-wrapper-v");
                    _this.Months_Wrapper.classList.remove("yy-clda-wrapper-v");
                    _this.YearMonthDayModel = "year";
                    _this._reCreateYearsArea();
                } else if (_this.YearMonthDayModel == "year" && _this.Modal == "年月日") {
                    _this.Days_Wrapper.classList.add("yy-clda-wrapper-v");
                    _this.Years_Wrapper.classList.remove("yy-clda-wrapper-v");
                    _this.YearMonthDayModel = "day";
                }
            }, false);
        },
        _getCurDaysAreaArr: function () {
            var preIndex = this.DayAreaShowIndex == 0 ? 2 : this.DayAreaShowIndex - 1;
            var nextIndex = this.DayAreaShowIndex == 2 ? 0 : this.DayAreaShowIndex + 1;
            return [preIndex, this.DayAreaShowIndex, nextIndex];
        },
        _rebindDaysAreaByYearAndMonth: function (year, month) {
            var Arr = this._getCurDaysAreaArr();
            for (var i = 0; i <= 2; i++) {
                var D = new Date(year,((i - 1) + month-1),1);
                this._fillDaysArea(this.DayAreaArr[Arr[i]], D.getFullYear(), D.getMonth()+1);
            }
        },
        _GoNextMonth: function () {
            var _this = this;
            _this.month += 1;
            var CurMonthInfo = _this._getRealYearAndMonth(_this.year, _this.month)
            _this.month = CurMonthInfo.month;
            _this.year = CurMonthInfo.year;
            _this.DayAreaArr[_this.DayAreaShowIndex].style[_this.transition] = _this.transform+" ease 0.2s";
            _this.DayAreaArr[_this.DayAreaShowIndex].style[_this.transform] = "translate3d(" + (-1 * _this.WrapperWidth) + "px, 0px, 0px)";
            var preIndex = _this.DayAreaShowIndex == 0 ? 2 : _this.DayAreaShowIndex - 1;
            _this.DayAreaShowIndex = _this.DayAreaShowIndex == 2 ? 0 : (_this.DayAreaShowIndex + 1);
            _this.DayAreaArr[_this.DayAreaShowIndex].style[_this.transition] = _this.transform+" ease 0.2s";
            _this.DayAreaArr[_this.DayAreaShowIndex].style[_this.transform] = "translate3d(0, 0px, 0px)";
            //transition: -webkit-transform ease 0.3s
            _this.DayAreaArr[preIndex].style[_this.transition] = "none";
            _this.DayAreaArr[preIndex].style[_this.transform] = "translate3d(" + (1 * _this.WrapperWidth) + "px, 0px, 0px)";
            _this.rebindMonthAndYearTitle();
            var NextMonthInfo = _this._getRealYearAndMonth(_this.year, _this.month + 1);
            _this._fillDaysArea(_this.DayAreaArr[preIndex], NextMonthInfo.year, NextMonthInfo.month);
            _this._setMonthLiSeletced();
            if (_this.YearMonthDayModel == "year") {
                _this._setYearSelected(_this.year);
            }
            if(_this.Modal=="年月"){
                _this.year_val=_this.year;
                _this.month_val=_this.month;
            }
        },
        _GoPreMonth: function () {
            var _this = this;
            _this.month -= 1;
            var CurMonthInfo = _this._getRealYearAndMonth(_this.year, _this.month)
            _this.month = CurMonthInfo.month;
            _this.year = CurMonthInfo.year;
            _this.DayAreaArr[_this.DayAreaShowIndex].style[_this.transition] =_this.transform +" ease 0.2s";
            _this.DayAreaArr[_this.DayAreaShowIndex].style[_this.transform] = "translate3d(" + (1 * _this.WrapperWidth) + "px, 0px, 0px)";
            var nextIndex = _this.DayAreaShowIndex == 2 ? 0 : _this.DayAreaShowIndex + 1;
            _this.DayAreaShowIndex = _this.DayAreaShowIndex == 0 ? 2 : _this.DayAreaShowIndex - 1;
            _this.DayAreaArr[_this.DayAreaShowIndex].style[_this.transition] =_this.transform+ " ease 0.2s";
            _this.DayAreaArr[_this.DayAreaShowIndex].style[_this.transform] = "translate3d(0, 0px, 0px)";
            //transition: -webkit-transform ease 0.3s
            _this.DayAreaArr[nextIndex].style[_this.transition] = "none";
            _this.DayAreaArr[nextIndex].style[_this.transform] = "translate3d(" + (-1 * _this.WrapperWidth) + "%, 0px, 0px)";
            _this.rebindMonthAndYearTitle();
            var PreMonthInfo = _this._getRealYearAndMonth(_this.year, _this.month - 1);
            _this._fillDaysArea(_this.DayAreaArr[nextIndex], PreMonthInfo.year, PreMonthInfo.month);
            _this._setMonthLiSeletced();
            if (_this.YearMonthDayModel == "year") {
                _this._setYearSelected(_this.year);
            }
            if(_this.Modal=="年月"){
                _this.year_val=_this.year;
                _this.month_val=_this.month;
            }
        },
        _createCldaSwitchWrapper: function () {
            var ele = this._createElementWithClass("DIV", "yy-clda-switch-wrapper yy-clda-table");
            this.Year_Left_Icon = this._createElementWithClass("DIV", "yy-clda-cell yy-clda-switch-icon yy-clda-switch-icon-left");
            this.Year_Title = this._createElementWithClass("DIV", "yy-clda-cell yy-clda-vcenter");
            this.Year_Right_Icon = this._createElementWithClass("DIV", "yy-clda-cell yy-clda-switch-icon");

            this.Month_Left_Icon = this._createElementWithClass("DIV", "yy-clda-cell yy-clda-switch-icon  yy-clda-switch-icon-left");
            this.Month_Title = this._createElementWithClass("DIV", "yy-clda-cell yy-clda-vcenter");
            this.Month_Right_Icon = this._createElementWithClass("DIV", "yy-clda-cell yy-clda-switch-icon");
            var _this = this;
            this._titleLogic();
            this.Year_Right_Icon.addEventListener("click", function (e) {

                //年份加一 然后月份减一 然后调用_fillDaysArea 将三个块进行填充 然后调用 GoNextMonth 进行移动到正确的月份
                _this.year = _this.year + 1;
                _this.month = _this.month - 1; //为了配合 GoNextMonth实现动画效果

                _this._rebindDaysAreaByYearAndMonth(_this.year, _this.month);
                _this._GoNextMonth();

            }, false);

            this.Month_Right_Icon.addEventListener("click", function (e) {
                _this._GoNextMonth();
            }, false)


            this.Year_Left_Icon.addEventListener("click", function (e) {
                _this.year = _this.year - 1;
                _this.month = _this.month + 1;
                _this._rebindDaysAreaByYearAndMonth(_this.year, _this.month);
                _this._GoPreMonth();
            }, false);

            this.Month_Left_Icon.addEventListener("click", function (e) {
                _this._GoPreMonth();
            }, false);


            ele.appendChild(this.Year_Left_Icon);
            ele.appendChild(this.Year_Title);
            ele.appendChild(this.Year_Right_Icon);
            ele.appendChild(this.Month_Left_Icon);
            ele.appendChild(this.Month_Title);
            ele.appendChild(this.Month_Right_Icon);
            return ele;

        },
        rebindMonthAndYearTitle: function () {
            this.Year_Title.innerHTML = (this.year);
            this.Month_Title.innerHTML = (this.month) + "月";
        },
        _createDayScrollWrapper: function () {
            var ele = this._createElementWithClass("DIV", "yy-clda-day-scroll");
            var FirstDaysArea = this._createElementWithClass("DIV", "yy-clda-day-area");
            var SecondDaysArea = this._createElementWithClass("DIV", "yy-clda-day-area");
            var ThirdDaysArea = this._createElementWithClass("DIV", "yy-clda-day-area");

            FirstDaysArea.style[this.transform] = "translate3d(-100%, 0px, 0px)";
            SecondDaysArea.style[this.transform] = "translate3d(0, 0px, 0px)";
            ThirdDaysArea.style[this.transform] = "translate3d(100%, 0px, 0px)";

            this.DayAreaArr = [FirstDaysArea, SecondDaysArea, ThirdDaysArea];
            ele.appendChild(FirstDaysArea);
            ele.appendChild(SecondDaysArea);
            ele.appendChild(ThirdDaysArea);
            return ele;

        },
        _createDaysWrapper: function () {
            var ele = this._createElementWithClass("DIV", "yy-clda-day-wrapper");
            var weekBar = this._createElementWithClass("DIV", "yy-clda-week-bar yy-clda-table");
            var weekArr = ["日", "一", "二", "三", "四", "五", "六"];
            for (var i = 0, j = weekArr.length; i < j; i++) {
                var w = this._createElementWithClass("DIV", "yy-clda-cell yy-clda-vcenter");
                w.innerHTML = weekArr[i];
                weekBar.appendChild(w);
            }
            this.DayScrollWraper = this._createDayScrollWrapper();
            ele.appendChild(weekBar);

            ele.appendChild(this.DayScrollWraper);
            return ele;
        },
        _setMonthLiSeletced: function () {
            if (this.SelectedMonthLi) {
                this.SelectedMonthLi.classList.remove("yy-clda-month-selected");
            }
            var selectedLIObj = this.MonthLiArr[this.month - 1];
            this.SelectedMonthLi = selectedLIObj;
            this.SelectedMonthLi.classList.add("yy-clda-month-selected");
        },
        _createMonthWrapper: function () {
            this.MonthLiArr = [];
            var ele = this._createElementWithClass("DIV", "yy-clda-month-wrapper");
            var UL = this._createElementWithClass("UL", "");
            var Arr = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
            for (var i = 0; i < Arr.length; i++) {
                var li = document.createElement("LI");
                var span = document.createElement("SPAN");
                span.innerHTML = Arr[i];
                li.appendChild(span);
                li.setAttribute("data-month", (i + 1));
                li.setAttribute("data-month-zh", Arr[i]);
                this.MonthLiArr.push(li);
                UL.appendChild(li);
            }
            ele.appendChild(UL);
            ele.addEventListener("touchmove",function(e){e.preventDefault()},false);
            return ele;
        },
        _createYearsWrapper: function () {
            var ele = this._createElementWithClass("DIV", "yy-clda-year-wrapper");
            var FirstYearArea = this._createElementWithClass("DIV", "yy-clda-year-area");
            var SecondYearArea = this._createElementWithClass("DIV", "yy-clda-year-area");
            var ThirdYearArea = this._createElementWithClass("DIV", "yy-clda-year-area");

            FirstYearArea.style[this.transform] = "translate3d(-100%, 0px, 0px)";
            SecondYearArea.style[this.transform] = "translate3d(0, 0px, 0px)";
            ThirdYearArea.style[this.transform] = "translate3d(100%, 0px, 0px)";

            this.YearAreaArr = [FirstYearArea, SecondYearArea, ThirdYearArea];
            this.YearAreaConfig = [{}, {}, {}];
            this.CurYearAreaIndex = 1;
            ele.appendChild(FirstYearArea);
            ele.appendChild(SecondYearArea);
            ele.appendChild(ThirdYearArea);
            return ele;
        },
        _getCurYearAreaIndexArr: function () {
            var preIndex = this.CurYearAreaIndex == 0 ? 2 : this.CurYearAreaIndex - 1;
            var nextIndex = this.CurYearAreaIndex == 2 ? 0 : this.CurYearAreaIndex + 1;
            return [preIndex, this.CurYearAreaIndex, nextIndex];
        },
        _reCreateYearsArea: function () {
            var CurYearAreaIndexArr = this._getCurYearAreaIndexArr();
            this.YearAreaConfig[CurYearAreaIndexArr[1]].start = this.year - 4;
            this.YearAreaConfig[CurYearAreaIndexArr[0]].start = this.YearAreaConfig[CurYearAreaIndexArr[1]].start - 12;
            this.YearAreaConfig[CurYearAreaIndexArr[2]].start = this.YearAreaConfig[CurYearAreaIndexArr[1]].start + 12;
            for (var i = 0; i <= 2; i++) {
                this._createSingleYearArea(this.YearAreaArr[CurYearAreaIndexArr[i]], this.YearAreaConfig[CurYearAreaIndexArr[i]].start);
            }

            this._setYearSelected(this.year);
        },
        _createSingleYearArea: function (yeararea, start) {
            yeararea.innerHTML = "";
            if (start == (-1000)) {
                return;
            }
            var UL = document.createElement("UL");
            var end = start + 11;
            for (var i = start; i <= end; i++) {

                var li = document.createElement("LI");
                var span = document.createElement("SPAN");
                li.setAttribute("data-year", i);
                if (i == this.year) {
                    li.classList.add("yy-clda-year-selected");
                }
                span.innerHTML = i;
                li.appendChild(span);
                UL.appendChild(li);
            }
            yeararea.appendChild(UL);
        },
        _bindWrapperEvents: function () {
            var _this = this;
            this.Months_Wrapper.addEventListener("click", function (e) {
                var target = e.target;
                var tagName = target.tagName;
                if (tagName != "UL") {
                    while (target && target.tagName != "BODY" && tagName != "LI") {
                        target = target.parentNode;
                        if (target.tagName == "LI") {
                            break;
                        }
                    }
                }
                var month = target.getAttribute("data-month");
                if (month && !isNaN(month)) {
                    month = parseInt(month);
                    _this.month = month;
                    _this._rebindDaysAreaByYearAndMonth(_this.year, _this.month);
                    _this._setMonthLiSeletced();

                    if (_this.Modal == "年月日") {
                        _this.Days_Wrapper.classList.add("yy-clda-wrapper-v");
                        _this.Months_Wrapper.classList.remove("yy-clda-wrapper-v");
                        _this.YearMonthDayModel = "day";
                    } else {
                        _this.month_val = month;
                    }
                    _this.rebindMonthAndYearTitle();
                }
            }, false);

            var yearTouchStartX = 0, yearTouchMovingX = 0, yearTouchDiff = 0, CurYearAreaArr;
            this.Years_Wrapper.addEventListener("touchstart", function (e) {
                CurYearAreaArr = _this._getCurYearAreaIndexArr();
                yearTouchStartX = e.touches[0].pageX;
            }, false);

            this.Years_Wrapper.addEventListener("touchmove", function (e) {
                e.preventDefault();
                yearTouchMovingX = e.touches[0].pageX;
                yearTouchDiff = yearTouchMovingX - yearTouchStartX;
                //this.YearAreaArr
                for (var i = 0; i <= 2; i++) {
                    var yearArea = _this.YearAreaArr[CurYearAreaArr[i]];
                    var pos = (i - 1) * _this.WrapperWidth + yearTouchDiff;
                    yearArea.style[_this.transition] = "none";
                    yearArea.style[_this.transform] = "translate3d(" + (pos) + "px, 0px, 0px)";
                }

            }, false);

            function touchEnd(e, eventtype) {
                if (Math.abs(yearTouchDiff) < _this.autoScrollOffsetX) {
                    for (var i = 0; i <= 2; i++) {
                        var yearArea = _this.YearAreaArr[CurYearAreaArr[i]];
                        var pos = (i - 1) * _this.WrapperWidth;
                        yearArea.style[_this.transition] =_this.transform+ " ease 0.2s";
                        yearArea.style[_this.transform] = "translate3d(" + (pos) + "px, 0px, 0px)";
                    }
                } else {
                    if (yearTouchDiff > 0) {
                        _this._GoPreYearArea(CurYearAreaArr);
                    } else if (yearTouchDiff < 0) {
                        _this._GoNextYearArea(CurYearAreaArr);
                    }
                }
                if (yearTouchDiff == 0) {
                    //click
                }
                yearTouchDiff = 0;
            }

            this.Years_Wrapper.addEventListener("click", function (e) {
                var target = e.target;
                var tagName = target.tagName;
                if (tagName != "UL") {
                    while (target && target.tagName != "BODY" && tagName != "LI") {
                        target = target.parentNode;
                        if (target.tagName == "LI") {
                            break;
                        }
                    }
                    var year = target.getAttribute("data-year");
                    if (year) {
                        _this._clearCurrentYearSelected();
                        target.classList.add("yy-clda-year-selected");
                        year = parseInt(year);
                        _this.year = year;
                        _this._rebindDaysAreaByYearAndMonth(_this.year, _this.month);
                        _this._setMonthLiSeletced();
                        if (_this.Modal == "年月日") {
                            _this.Days_Wrapper.classList.add("yy-clda-wrapper-v");
                            _this.Years_Wrapper.classList.remove("yy-clda-wrapper-v");
                            _this.YearMonthDayModel = "day";
                        } else {
                            _this.year_val = year;
                        }
                        _this.rebindMonthAndYearTitle();
                    }
                }

            }, false);

            this.Years_Wrapper.addEventListener("touchend", function (e) {
                touchEnd(e, "end");
            }, false);

            this.Years_Wrapper.addEventListener("touchcancel", function (e) {
                touchEnd(e, "cancel");
            }, false);


            this._bindDaysWrapperEvents();

        },
        _bindDaysWrapperEvents: function () {
            var dayTouchStartX = 0, dayTouchMovingX = 0, dayTouchDiff = 0, CurDayAreaIndexArr, _this = this;
            this.Days_Wrapper.addEventListener("touchstart", function (e) {
                CurDayAreaIndexArr = _this._getCurDaysAreaArr();
                dayTouchStartX = e.touches[0].pageX;
            }, false);
            this.Days_Wrapper.addEventListener("touchmove", function (e) {
                e.preventDefault();
                dayTouchMovingX = e.touches[0].pageX;
                dayTouchDiff = dayTouchMovingX - dayTouchStartX;
                for (var i = 0; i <= 2; i++) {
                    var dayArea = _this.DayAreaArr[CurDayAreaIndexArr[i]];
                    var pos = (i - 1) * _this.WrapperWidth + dayTouchDiff;
                    dayArea.style[_this.transition] = "none";
                    dayArea.style[_this.transform] = "translate3d(" + (pos) + "px, 0px, 0px)";
                }

            }, false);
            this.Days_Wrapper.addEventListener("touchend", function (e) {
                if (Math.abs(dayTouchDiff) < _this.autoScrollOffsetX) {
                    for (var i = 0; i <= 2; i++) {
                        var dayArea = _this.DayAreaArr[CurDayAreaIndexArr[i]];
                        var pos = (i - 1) * _this.WrapperWidth;
                        dayArea.style[_this.transition] = _this.transform+" ease 0.2s";
                        dayArea.style[_this.transform] = "translate3d(" + (pos) + "px, 0px, 0px)";
                    }
                } else {
                    if (dayTouchDiff > 0) {
                        _this._GoPreMonth();
                    } else if (dayTouchDiff < 0) {
                        _this._GoNextMonth();
                    }
                }

                dayTouchDiff = 0;
            }, false);

            this.Days_Wrapper.addEventListener("click", function (e) {
                var target = e.target;
                var tagName = target.tagName;
                if (tagName != "UL") {
                    while (target && target.tagName != "BODY" && tagName != "LI") {
                        target = target.parentNode;
                        if (target.tagName == "LI") {
                            break;
                        }
                    }
                    var year = target.getAttribute("data-year");
                    var month = target.getAttribute("data-month");
                    var day = target.getAttribute("data-day");
                    if (year && month && day) {
                        year = parseInt(year);
                        month = parseInt(month);
                        day = parseInt(day);
                        _this.day_val = day;
                        _this.month_val = month;
                        _this.year_val = year;
                        _this._clearDaySelectedStyle();

                        if ((month > _this.month && year == _this.year) || (_this.year < year && month == 1)) {
                            _this._GoNextMonth();
                        }
                        if ((month < _this.month && year == _this.year) || (_this.year > year && month == 12)) {
                            _this._GoPreMonth();
                        }

                    }
                }
            }, false)
        },
        _clearDaySelectedStyle: function (year, month, day) {
            for (var i = 0, j = this.DayAreaArr.length; i < j; i++) {
                var dayArr = this.DayAreaArr[i];
                var dayArrlis = dayArr.childNodes[0].childNodes;
                for (var m = 0, n = dayArrlis.length; m < n; m++) {
                    var li = dayArrlis[m];
                    li.classList.remove("yy-clda-day-selected");
                    var year_li = li.getAttribute("data-year");
                    var month_li = li.getAttribute("data-month");
                    var day_li = li.getAttribute("data-day");
                    if (year_li && month_li && day_li) {
                        year_li = parseInt(year_li);
                        month_li = parseInt(month_li);
                        day_li = parseInt(day_li);
                        if (year_li == this.year_val && month_li == this.month_val && day_li == this.day_val) {
                            li.classList.add("yy-clda-day-selected");
                        } else {
                            li.classList.remove("yy-clda-day-selected");
                        }
                    }
                }
            }
        },
        _GoNextYearArea: function (CurYearAreaArr) {
            var _this = this;
            //第一个变成第三个（第一个重新计算） 第二变成第一个  第三变成第二

            var MidYearArea = _this.YearAreaArr[CurYearAreaArr[1]];
            var FirstYearArea = _this.YearAreaArr[CurYearAreaArr[0]];
            var SecondYearArea = _this.YearAreaArr[CurYearAreaArr[2]];


            MidYearArea.style[_this.transition] =_this.transform+ " ease 0.3s";
            MidYearArea.style[_this.transform] = "translate3d(" + (_this.WrapperWidth * -1) + "px, 0px, 0px)";


            SecondYearArea.style[_this.transition] =_this.transform+ " ease 0.3s";
            SecondYearArea.style[_this.transform] = "translate3d(" + (0) + "px, 0px, 0px)";


            FirstYearArea.style[_this.transition] = "none";
            FirstYearArea.style[_this.transform] = "translate3d(" + (this.WrapperWidth * 1) + "px, 0px, 0px)";

            _this.YearAreaConfig[CurYearAreaArr[0]].start = _this.YearAreaConfig[CurYearAreaArr[2]].start + 12;
            _this._createSingleYearArea(FirstYearArea, _this.YearAreaConfig[CurYearAreaArr[0]].start);
            _this.CurYearAreaIndex = _this.CurYearAreaIndex == 2 ? 0 : _this.CurYearAreaIndex + 1;
        },
        _GoPreYearArea: function (CurYearAreaArr) {
            var _this = this;
            var MidYearArea = _this.YearAreaArr[CurYearAreaArr[1]];
            var FirstYearArea = _this.YearAreaArr[CurYearAreaArr[0]];
            var SecondYearArea = _this.YearAreaArr[CurYearAreaArr[2]];

            MidYearArea.style[_this.transition] =_this.transform+ " ease 0.3s";
            MidYearArea.style[_this.transform] = "translate3d(" + (_this.WrapperWidth * 1) + "px, 0px, 0px)";


            FirstYearArea.style[_this.transition] =_this.transform+ " ease 0.3s";
            FirstYearArea.style[_this.transform] = "translate3d(" + (0) + "px, 0px, 0px)";


            SecondYearArea.style[_this.transition] = "none";
            SecondYearArea.style[_this.transform] = "translate3d(" + (_this.WrapperWidth * -1) + "px, 0px, 0px)";

            _this.YearAreaConfig[CurYearAreaArr[2]].start = _this.YearAreaConfig[CurYearAreaArr[0]].start - 12;
            _this._createSingleYearArea(SecondYearArea, _this.YearAreaConfig[CurYearAreaArr[2]].start);
            _this.CurYearAreaIndex = _this.CurYearAreaIndex == 0 ? 2 : _this.CurYearAreaIndex - 1;
        },

        _clearCurrentYearSelected: function () {
            var CurYearAreaIndexArr = this._getCurYearAreaIndexArr();
            var MidYearArea = this.YearAreaArr[CurYearAreaIndexArr[1]];
            var midlis = MidYearArea.childNodes[0].childNodes;
            for (var i = 0, j = midlis.length; i < j; i++) {
                midlis[i].classList.remove("yy-clda-year-selected");
            }
            return {CurYearAreaIndexArr: CurYearAreaIndexArr, midlis: midlis};
        },
        _setYearSelected: function (year) {
            var clearResult = this._clearCurrentYearSelected();
            var CurYearAreaIndexArr = clearResult.CurYearAreaIndexArr;
            var MidConfig = this.YearAreaConfig[CurYearAreaIndexArr[1]];
            if (year >= MidConfig.start && year < MidConfig.start + 12) {
                clearResult.midlis[year - MidConfig.start].classList.add("yy-clda-year-selected");
            } else if (year < MidConfig.start && year > MidConfig.start - 12) {
                this._GoPreYearArea(CurYearAreaIndexArr);
                this._setYearSelected(this.year);
            } else if (year >= MidConfig.start + 12 && year < MidConfig.start + 12 + 12) {
                this._GoNextYearArea(CurYearAreaIndexArr);
                this._setYearSelected(this.year);
            } else if (year > MidConfig.start) {
                //使用滑动 然后点击箭头 已经向左偏离很远了 需要重新构建YearAreas
                //创建出一个
//                    var CurYearAreaIndexArr = this._getCurYearAreaIndexArr();
                this.YearAreaConfig[CurYearAreaIndexArr[2]].start = this.year - 4;
                this.YearAreaConfig[CurYearAreaIndexArr[1]].start = this.YearAreaConfig[CurYearAreaIndexArr[2]].start - 12;
                this.YearAreaConfig[CurYearAreaIndexArr[0]].start = this.YearAreaConfig[CurYearAreaIndexArr[1]].start - 12;
                for (var i = 0; i <= 2; i++) {
                    this._createSingleYearArea(this.YearAreaArr[CurYearAreaIndexArr[i]], this.YearAreaConfig[CurYearAreaIndexArr[i]].start);
                }
                //
                this._GoNextYearArea(CurYearAreaIndexArr);
                this._setYearSelected(this.year);
                //
            } else if (year < MidConfig.start) {
                //已经向右偏离很远了 需要重新构建YearAreas
                var CurYearAreaIndexArr = this._getCurYearAreaIndexArr();
                this.YearAreaConfig[CurYearAreaIndexArr[0]].start = this.year - 4;
                this.YearAreaConfig[CurYearAreaIndexArr[1]].start = this.YearAreaConfig[CurYearAreaIndexArr[0]].start + 12;
                this.YearAreaConfig[CurYearAreaIndexArr[2]].start = this.YearAreaConfig[CurYearAreaIndexArr[1]].start + 12;
                for (var i = 0; i <= 2; i++) {
                    this._createSingleYearArea(this.YearAreaArr[CurYearAreaIndexArr[i]], this.YearAreaConfig[CurYearAreaIndexArr[i]].start);
                }
                this._GoPreYearArea(CurYearAreaIndexArr);
                this._setYearSelected(this.year);
            }

        },
        _createCldaSelectorWrapper: function () {
            var ele = this._createElementWithClass("DIV", "yy-clda-selector-wrapper");
            this.Days_Wrapper = this._createDaysWrapper();
            this.Months_Wrapper = this._createMonthWrapper();
            this.Years_Wrapper = this._createYearsWrapper();
            ele.appendChild(this.Days_Wrapper);
            ele.appendChild(this.Months_Wrapper);
            ele.appendChild(this.Years_Wrapper);
            this._bindWrapperEvents();
            return ele;
        },

        _initLayout: function () {
            this.Clda_BK = this._createElementWithClass("DIV", "yy-clda-bk");
            this.Clda_Dialog = this._createElementWithClass("DIV",this.alertWay=="INLINE"?"yy-clda-dialog-inline": "yy-clda-dialog");
            this.Clda_Switch_Wrapper = this._createCldaSwitchWrapper();
            this.Clda_Selector_Wrapper = this._createCldaSelectorWrapper();
            if(this.alertWay!="INLINE"){
              this.Clda_Btn_Wrapper = this._createCldaBtnWrapper();
              this.Clda_Dialog.appendChild(this.Clda_Btn_Wrapper);
            }
            this.Clda_Dialog.appendChild(this.Clda_Switch_Wrapper);
            this.Clda_Dialog.appendChild(this.Clda_Selector_Wrapper);
            this.Days_Wrapper.classList.add("yy-clda-wrapper-v");
            this.container.appendChild(this.Clda_BK);
            this.container.appendChild(this.Clda_Dialog);
            this.DayAreaShowIndex = 1;
            var _this = this;
            this.Clda_BK.addEventListener("click", function (e) {
                _this.hide();
            }, false);
        },
        _setValuePar: function (year, month, day) {
            this.year = year;
            this.year_val = year;
            this.month = month;
            this.month_val = month;
            this.day = day;
            this.day_val = day;
        },
        setValue: function (dataStr) {
            this._setValuePar(this.now_year, this.now_month, this.now_day);
            if (typeof dataStr == "string") {
                var valArr = dataStr.split("-");
                if (valArr.length == 3&&this.Modal=="年月日") {
                    var f_int = parseInt(valArr[0]);
                    var s_int = parseInt(valArr[1]);
                    var t_int = parseInt(valArr[2]);
                    var D = new Date(f_int, s_int - 1, t_int);
                    this._setValuePar(D.getFullYear(), D.getMonth() + 1, D.getDate());
                }else if(valArr.length ==2){
                    var f_int = parseInt(valArr[0]);
                    var s_int = parseInt(valArr[1]);
                    var t_int = 1;
                    var D = new Date(f_int, s_int - 1, t_int);
                    this._setValuePar(D.getFullYear(), D.getMonth() + 1, D.getDate());
                }
            }
            this.rebindMonthAndYearTitle();
            this._rebindDaysAreaByYearAndMonth(this.year,this.month);

        },
        _getMonthDayCount: function (year, month) {
            var CurDateObj = new Date(year, month, 0); //获取天数的时候月份不减1
            return CurDateObj.getDate();
        },
        _fillDaysArea: function (AreaWraperObj, year, month) {
            AreaWraperObj.innerHTML = "";
            var UL = document.createElement("UL");
            var CurMonthDayCount = this._getMonthDayCount(year, month);
            var CurMonthFirstDateObj = new Date(year, month - 1, 1);
            var CurMonthFirstWhichWeeek = CurMonthFirstDateObj.getDay();
            var PreMonthShowDayCount = CurMonthFirstWhichWeeek;
            var NextMonthCount = this.OneDayAreaCount - CurMonthDayCount - PreMonthShowDayCount;
            var PreShowMonthInfo = {start: 0, end: 0};
            var NextShowMonthInfo = {start: 1, end: NextMonthCount};
            var PreYear = year;
            var PreMonth;
            if (PreMonthShowDayCount > 0) {
                var PreMonthDate = new Date(year, month - 1, 0);//获取上一个月的天数
                PreYear = PreMonthDate.getFullYear();
                PreMonth = PreMonthDate.getMonth() + 1;
                var PreMonthDayCount = PreMonthDate.getDate();
                PreShowMonthInfo.end = PreMonthDayCount;
                PreShowMonthInfo.start = PreMonthDayCount - PreMonthShowDayCount + 1;
            }

            if (PreShowMonthInfo.start > 0) {
                for (var i = PreShowMonthInfo.start; i <= PreShowMonthInfo.end; i++) {
                    this._appendDayUnitLiToUl(UL, PreYear, PreMonth, i, "yy-clda-no-curmonth-day");
                }
            }

            for (var i = 1; i <= CurMonthDayCount; i++) {
                this._appendDayUnitLiToUl(UL, year, month, i);
            }

            var NextMonthDateObje = new Date(year, month, 1);
            var NextYear = NextMonthDateObje.getFullYear();
            var NextMonth = NextMonthDateObje.getMonth() + 1;
            for (var i = NextShowMonthInfo.start; i <= NextShowMonthInfo.end; i++) {
                this._appendDayUnitLiToUl(UL, NextYear, NextMonth, i, "yy-clda-no-curmonth-day");
            }

            AreaWraperObj.appendChild(UL);
        },
        _appendDayUnitLiToUl: function (ul, year, month, day, classname) {
            var li = document.createElement("LI");
            var span = document.createElement("SPAN");
            classname && li.classList.add(classname);
            span.innerHTML = day;
            li.setAttribute("data-year", year);
            li.setAttribute("data-month", month);
            li.setAttribute("data-day", day);
            li.appendChild(span);
            if (year == this.year_val && month == this.month_val && this.day_val == day) {
                li.classList.add("yy-clda-day-selected");
            }
            ul.appendChild(li);
        },
        Destory: function () {
            //移除事件 销毁DOM
            this.Clda_BK&&this.container.removeChild(this.Clda_BK);
            this.Clda_Dialog&&this.container.removeChild(this.Clda_Dialog);
            this.Clda_Dialog = null;
            this.Clda_BK = null;
        }
    };

    return {Calendar:Calendar};

});
/**
 * Created by xiaoz on 15/11/4.
 */
