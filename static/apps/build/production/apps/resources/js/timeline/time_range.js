Splunk.TimeRange=$.klass({_absoluteArgs:{},_relativeArgs:{},_fallbackAbsoluteTimeFormat:"%s.%Q",_isSubRangeOfJob:false,_unitMap:{},YEAR:0,MONTH:1,DAY:2,HOUR:3,MINUTE:4,SECOND:5,MILLISECOND:6,CUSTOM_RELATIVE_RANGE_HEADER:_("over custom relative time range"),GENERIC_REAL_TIME_RANGE_HEADER:_("%s (real-time)"),CUSTOM_REAL_TIME_RANGE_HEADER:_("in custom real-time range"),DATE_METHODS:[{name:"year",getter:"getFullYear",setter:"setFullYear",minValue:"1974"},{name:"month",getter:"getMonth",setter:"setMonth",minValue:"0"},{name:"day",getter:"getDate",setter:"setDate",minValue:"1"},{name:"hour",getter:"getHours",setter:"setHours",minValue:"0"},{name:"minute",getter:"getMinutes",setter:"setMinutes",minValue:"0"},{name:"second",getter:"getSeconds",setter:"setSeconds",minValue:"0"},{name:"millisecond",getter:"getMilliseconds",setter:"setMilliseconds",minValue:"0"}],initialize:function(h,e){this._constructorArgs=[h,e];var f=this._unitMap;f.s=f.sec=f.secs=f.second=f.seconds=_("second");f.m=f.min=f.mins=f.minute=f.minutes=_("minute");f.h=f.hr=f.hrs=f.hour=f.hours=_("hour");f.d=f.day=f.days=_("day");f.w=f.week=_("week");f.mon=f.month=f.months=_("month");f.y=f.yr=f.yrs=f.year=f.years=_("year");this._absoluteArgs={earliest:false,latest:false};this._relativeArgs={earliest:false,latest:false};if(h=="now"){h="0s"}if(e=="now"){e="0s"}this.logger=Splunk.Logger.getLogger("time_range.js");this._isSubRangeOfJob=false;this._absoluteArgs.earliest=this.parseAbsoluteArgs(h);this._absoluteArgs.latest=this.parseAbsoluteArgs(e);if(this.isAbsolute()){var g=Splunk.Globals.timeZone;this.serverOffsetAtEarliest=g.getOffset(this._absoluteArgs.earliest.valueOf()/1000)/60;this.serverOffsetAtLatest=g.getOffset(this._absoluteArgs.latest.valueOf()/1000)/60}if(!this._absoluteArgs.earliest){this._relativeArgs.earliest=this.parseRelativeArgs(h)}if(!this._absoluteArgs.latest){this._relativeArgs.latest=this.parseRelativeArgs(e)}},containsTime:function(e){var f=this.getAbsoluteEarliestTime();var d=this.getAbsoluteLatestTime();if(!f&&!d){return true}return(f<=e&&d>e)},containsRange:function(b){if(this.isAllTime()){return true}if(b.isAllTime()){return false}if(this.equalToRange(b)){return true}if(this.relativeTerm&&!b.relativeTerm){return true}if(this.getEarliestTimeTerms()==b.getEarliestTimeTerms()&&this.getLatestTimeTerms()==b.getLatestTimeTerms()){return true}if(this.getAbsoluteEarliestTime()>b.getAbsoluteEarliestTime()){return false}else{if(this.getAbsoluteLatestTime()<b.getAbsoluteLatestTime()){return false}}return true},normalizeEquivalentNowValues:function(b){if(b=="+0s"){return"now"}else{return b}},equalToRange:function(f){if(this===f){return true}if(this.normalizeEquivalentNowValues(this.getRelativeEarliestTime())!=this.normalizeEquivalentNowValues(f.getRelativeEarliestTime())){return false}if(this.normalizeEquivalentNowValues(this.getRelativeLatestTime())!=this.normalizeEquivalentNowValues(f.getRelativeLatestTime())){return false}if(typeof(this.getAbsoluteEarliestTime())!=typeof(f.getAbsoluteEarliestTime())){return false}if(typeof(this.getAbsoluteLatestTime())!=typeof(f.getAbsoluteLatestTime())){return false}var d=f.getAbsoluteEarliestTime();if(this.getAbsoluteEarliestTime()&&d&&this.getAbsoluteEarliestTime().getTime()!=d.getTime()){return false}var e=f.getAbsoluteLatestTime();if(this.getAbsoluteLatestTime()&&e&&this.getAbsoluteLatestTime().getTime()!=e.getTime()){return false}return true},getDuration:function(){if(this.relativeTerm){return -1}else{if(this.getAbsoluteLatestTime()&&this.getAbsoluteEarliestTime()){return this.getAbsoluteLatestTime()-this.getAbsoluteEarliestTime()}else{return -1}}},isAllTime:function(){return(this.isAbsolute()||this.isRelative())?false:true},isAbsolute:function(){return((this.getAbsoluteEarliestTime()&&this.getAbsoluteEarliestTime().valueOf()!=0)||this.getAbsoluteLatestTime())?true:false},isRelative:function(){return(this._relativeArgs.earliest||this._relativeArgs.latest)?true:false},isRealTime:function(){if(this._relativeArgs.earliest&&this._relativeArgs.earliest.isRealTime){return true}else{if(this._relativeArgs.latest&&this._relativeArgs.latest.isRealTime){return true}}return false},isSubRangeOfJob:function(){return this._isSubRangeOfJob},setAsSubRangeOfJob:function(b){this._isSubRangeOfJob=b},getEarliestTimeTerms:function(){var d=[];if(this.getAbsoluteEarliestTime()){var c=this.getAbsoluteEarliestTime().getTime()/1000;d.push(c)}else{if(this._relativeArgs.earliest){d.push(this.getRelativeEarliestTime())}}return d.join(" ")},getLatestTimeTerms:function(){var d=[];if(this.getAbsoluteLatestTime()){var c=this.getAbsoluteLatestTime().getTime()/1000;d.push(c)}else{if(this._relativeArgs.latest){d.push(this.getRelativeLatestTime())}}return d.join(" ")},zoomIn:function(){var b=this.getDuration();if(!b){this.logger.error("Assertion failed - TimeRange.zoomOut not implemented for relative time terms range="+this.toConciseString())}this._absoluteArgs.earliest.setTime(this.getAbsoluteEarliestTime().getTime()+Math.round(b/2));return new Splunk.TimeRange(this._absoluteArgs.earliest,this._absoluteArgs.latest,this.serverOffsetAtEarliest,this.serverOffsetAtLatest)},zoomOut:function(){if(!this.getDuration()){this.logger.error("Assertion failed - TimeRange.zoomOut not implemented for relative time terms range="+this.toConciseString())}var p=splunk.time.DateTime;var z=splunk.time.Duration;var s=splunk.time.SplunkTimeZone;var y=splunk.time.TimeUtils;var o=new s(Splunk.util.getConfigValue("SERVER_ZONEINFO"));var r=new p(this._absoluteArgs.earliest.getTime()/1000).toTimeZone(o);var t=new p(this._absoluteArgs.latest.getTime()/1000).toTimeZone(o);var u=y.subtractDates(t,r);var q=new z();if((u.years>0)||(u.months>0)){q.years=1}else{if(u.days>0){q.months=1}else{if(u.hours>0){q.days=1}else{if(u.minutes>0){q.hours=1}else{if(u.seconds>=1){q.minutes=1}else{if(u.seconds>0){q.seconds=1}}}}}}u=(u.years<1)?q.clone():new z(Math.ceil((u.years*2)/10)*10);t=y.ceilDate(t,u);var n=false;var x=y.ceilDate(new p().toTimeZone(o),q);if(t.getTime()>=x.getTime()){t=x;n=true}var v=y.subtractDateDuration(t,u);r=(v.getTime()<=r.getTime())?v:y.floorDate(r,q);var w=false;if(r.getTime()<=0){r.setTime(1);w=true}if(w&&n){this._absoluteArgs.earliest=false;this._absoluteArgs.latest=false;return new Splunk.TimeRange(0)}this._absoluteArgs.earliest.setTime(r.getTime()*1000);this._absoluteArgs.latest.setTime(t.getTime()*1000);return new Splunk.TimeRange(r.getTime(),t.getTime())},genericGetForRelativeArg:function(d){if(d=="earliest"&&this._constructorArgs[0]){return this._constructorArgs[0]}else{if(this._constructorArgs[1]){return this._constructorArgs[1]}}if(!this._relativeArgs.hasOwnProperty(d)){return false}var f=this._relativeArgs[d];var e=[];if(f.isRealTime){e.push("rt")}if(f.hasOwnProperty("count")){if(f.count>=0){e.push("+")}e.push(f.count)}if(f.hasOwnProperty("units")){e.push(f.units)}if(f.hasOwnProperty("snapUnits")){e.push("@"+f.snapUnits)}return e.join("")},getRelativeEarliestTime:function(){return this.genericGetForRelativeArg("earliest")},getRelativeLatestTime:function(){return this.genericGetForRelativeArg("latest")},getAbsoluteEarliestTime:function(){return this._absoluteArgs.earliest},getAbsoluteLatestTime:function(){return this._absoluteArgs.latest},parseRelativeArgs:function(e){if(!e){return false}if(e.indexOf(" ")!=-1){this.logger.error("Assertion failed - Currently we can only deal with a single relative term at a time. ")}var d={};if(e.indexOf("rt")==0){d.isRealTime=true;e=e.substring(2)}var f=e.split("@");e=f[0]||false;if(f.length>1){d.snapUnits=f[1]}if(e&&Splunk.util.isInt(parseInt(e,10))){d.count=parseInt(e,10);d.units=Splunk.util.trim(e.replace(d.count,""),"+")||"s"}return d},parseAbsoluteArgs:function(f,h){if(!f&&!Splunk.util.isInt(f)){return false}if(f&&f.charAt&&(f.charAt(0)=="+"||f.charAt(0)=="-"||f.substring(0,2)=="rt"||f=="now")){return false}if(f instanceof Date){return f}else{if(f&&(""+f).match(Splunk.TimeRange.UTCRegex)){var g=new Date();g.setTime(f*1000);return g}else{var d=Splunk.util.parseDate(f,this.getTimeFormat());return d}}return false},toString:function(){var b=[];if(this.getAbsoluteEarliestTime()){b.push(this.getAbsoluteEarliestTime())}if(this.getAbsoluteLatestTime()){b.push(this.getAbsoluteLatestTime())}if(this.getRelativeEarliestTime()){b.push(this.getRelativeEarliestTime())}if(this.getRelativeLatestTime()){b.push(this.getRelativeLatestTime())}return b.join(" ")},toConciseString:function(){if(this.isAbsolute()){var j=null;var f=null;if(this.getAbsoluteEarliestTime()){j=new Date();j.setTime(this._absoluteArgs.earliest.valueOf());if(Splunk.TimeRange.CORRECT_OFFSET_ON_DISPLAY){var g=Splunk.util.getTimezoneOffsetDelta(this.serverOffsetAtEarliest,j);j.setTime(j.valueOf()-g)}}if(this.getAbsoluteLatestTime()){f=new Date();f.setTime(this._absoluteArgs.latest.valueOf());if(Splunk.TimeRange.CORRECT_OFFSET_ON_DISPLAY){var h=Splunk.util.getTimezoneOffsetDelta(this.serverOffsetAtLatest,f);f.setTime(f.valueOf()-h)}}return format_datetime_range(Splunk.util.getConfigValue("LOCALE","NONE"),j,f)}else{if(this.isRealTime()){var i=this.formatRelativeRange();if(i==this.CUSTOM_RELATIVE_RANGE_HEADER){return this.CUSTOM_REAL_TIME_RANGE_HEADER}else{return sprintf(this.GENERIC_REAL_TIME_RANGE_HEADER,i)}}else{if(this.isRelative()&&!this.isRealTime()){return this.formatRelativeRange()}else{return _("over all time")}}}},formatRelativeRange:function(){var c=this._relativeArgs.earliest;var d=this._relativeArgs.latest;if(c.hasOwnProperty("snapUnits")){if(d.hasOwnProperty("snapUnits")!=d.hasOwnProperty("snapUnits")){throw ("Assertion failed - we dont support cases where one side has snapUnits and the other does not.")}if(this._unitMap[c.snapUnits]=="day"&&this._unitMap[d.snapUnits]=="day"){if(!c.hasOwnProperty("count")&&d.hasOwnProperty("count")&&d.count==1){return _("today")}else{if(!d.hasOwnProperty("count")&&c.hasOwnProperty("count")&&c.count==-1){return _("yesterday")}}}if(!c.hasOwnProperty("count")&&d.hasOwnProperty("count")&&d.count==1){return sprintf(_("during this %(singleUnitOfTime)s"),{singleUnitOfTime:this._unitMap[c.snapUnits]})}if(!d.hasOwnProperty("count")&&c.hasOwnProperty("count")&&c.count==-1){if(c.hasOwnProperty("snapUnits")&&(c.snapUnits==c.units)){if(d.hasOwnProperty("snapUnits")&&(d.snapUnits==c.units)){return sprintf(_("during last %(singleUnitOfTime)s"),{singleUnitOfTime:this._unitMap[c.snapUnits]})}}}}if(c.hasOwnProperty("units")&&this._unitMap.hasOwnProperty(c.units)&&!d.hasOwnProperty("snapUnits")&&((!d.hasOwnProperty("units")&&!d.hasOwnProperty("count"))||d.count==0)){if(c.hasOwnProperty("count")&&c.count==-1){if(!c.hasOwnProperty("snapUnits")||(c.snapUnits==c.units)){return sprintf(_("in the last %(unitOfTime)s"),{unitOfTime:this._unitMap[c.units]})}}else{if(c.hasOwnProperty("units")&&c.hasOwnProperty("count")){if(!c.hasOwnProperty("snapUnits")||c.snapUnits==c.units){return sprintf(_("in the last %(count)s %(unitOfTime)ss"),{count:-c.count,unitOfTime:this._unitMap[c.units]})}}}}return this.CUSTOM_RELATIVE_RANGE_HEADER},clone:function(){var b=new Splunk.TimeRange(this._constructorArgs[0],this._constructorArgs[1],this._constructorArgs[2],this._constructorArgs[3]);b.setAsSubRangeOfJob(this.isSubRangeOfJob());return b},copy:function(){return this.clone()},strftime:function(d,c){return d.strftime(c||this.getTimeFormat())},getTimeFormat:function(){return Splunk.util.getConfigValue("DISPATCH_TIME_FORMAT",this._fallbackAbsoluteTimeFormat)}});Splunk.TimeRange.UTCRegex=new RegExp("^[0-9]*(.[0-9]+)?$");Splunk.TimeRange.CORRECT_OFFSET_ON_DISPLAY=true;Splunk.TimeRange.relativeArgsToString=function(j,f,h){var i="earliest";var g=new Splunk.TimeRange();g._relativeArgs[i]={count:j,units:f,snapUnits:h};return g.genericGetForRelativeArg(i)};Splunk.TimeZone=$.klass({initialize:function(b){this._serializedTimeZone=b;this._standardOffset=null;this._serializedTimeZone=null;this._isConstant=false;this._offsetList=[];this._timeList=[];this._indexList=[];this._parseSerializedTimeZone(b)},getSerializedTimeZone:function(){return this._serializedTimeZone},numericBinarySearch:function(i,j){if(!i){throw new TypeError("Parameter list must be non-null.")}var k=i.length-1;if(k<0){return -1}var h=0;var l;var g;while(h<=k){l=parseInt(h+(k-h)/2,10);g=(j-i[l]);if(g<0){k=l-1}else{if(g>0){h=l+1}else{return l}}}return -h-1},getOffset:function(j){if(this._isConstant){return this._standardOffset}var l=this._offsetList;var m=l.length;if(m==0){return 0}if(m==1){return l[0]}var k=this._timeList;var i=k.length;if(i==0){return 0}var h;if(i==1){h=0}else{h=this.numericBinarySearch(k,j);if(h<-1){h=-h-2}else{if(h==-1){h=0}}}var n=this._indexList[h];return l[n]},_parseSerializedTimeZone:function(h){if(!h){return}var f=h.split(";");for(var e=0;e<f.length;e++){var g=f[e];if(g){switch(g.charAt(0)){case"C":if(this._parseC(g.substring(1,g.length))){return}break;case"Y":this._parseY(g.substring(1,g.length));break;case"@":this._parseAt(g.substring(1,g.length));break;default:break}}}this._standardOffset=this.getOffset(0)},_parseC:function(d){if(!d){return false}var c=parseInt(d,10);if(c!=c){return false}this._standardOffset=c;this._isConstant=true;return true},_parseY:function(e){if(!e){return}var h=e.split(" ");if(h.length<1){return}var f=h[0];if(!f){return}var g=parseInt(f,10);if(g!=g){return}this._offsetList.push(g)},_parseAt:function(j){if(!j){return}var i=j.split(" ");if(i.length<2){return}var f=i[0];if(!f){return}var h=parseInt(f,10);if(h!=h){return}f=i[1];if(!f){return}var g=parseInt(f,10);if(g!=g){return}g=parseInt(g,10);if((g<0)||(g>=this._offsetList.length)){return}this._timeList.push(h);this._indexList.push(g)}});