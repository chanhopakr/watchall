ace.define('ace/mode/zenlog', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/text', 'ace/tokenizer', 'ace/mode/zenlog_highlight_rules', 'ace/range'], function(require, exports/*, module*/) {

    var oop = require("../lib/oop");
    var TextMode = require("./text").Mode;
    var Tokenizer = require("../tokenizer").Tokenizer;
    var SqlHighlightRules = require("./zenlog_highlight_rules").SqlHighlightRules;
    // var Range = require("../range").Range;

    var Mode = function() {
        var highlighter = new SqlHighlightRules();

        this.$tokenizer = new Tokenizer(highlighter.getRules());
        this.$keywordList = highlighter.$keywordList;
        this.completer = {
            getCompletions: function() {
                return []
            }
        }
    };
    oop.inherits(Mode, TextMode);

//(function() {
//
//    this.lineCommentStart = "--";
//
//}).call(Mode.prototype);

    exports.Mode = Mode;

});

ace.define('ace/mode/zenlog_highlight_rules', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/text_highlight_rules'], function(require, exports/*, module*/) {


    var oop = require("../lib/oop");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var SqlHighlightRules = function() {
        // -7d, case
        var keywordMapper = this.createKeywordMapper({
            "variable.language": "as|in|match|regexp|and|or|import|not",
            "support.function": "groupby|count|dcount|lookup|lookups|sum|avg|min|max|humantime|rank|unixtime|limit|round|" +
            "substitute|timeline|condition|orderby|host|parser|tag|collector|excludedate|startdate|enddate|extract|regexp|" +
            "cidr|concatenate|value|ltrim|rtrim|trim|nullif|substr|group_concat|range|mode|list|eq|neq|gt|gte|lt|lte|" +
            "perc",
            "keyword": "add|bottom|chart|columnhide|columnname|concurrency|dbinsert|dedup|define|eval|fields|for|from|innerjoin|join|rename|" +
            "metadata|logtype|outerjoin|overlay|replace|rex|save|saveas|saveadd|set|sort|stats|timestats|top|transaction|concurrency|where|" +
            "iplocation|countrylocation",
            "constant.language": "true|false|null|_date|_raw|_event|now|_ip|_host|_logtype|_tag|_collector|_parser|_sourcename|_source"
        }, "identifier", true);

        this.$rules = {
            "start": [ //{
                //    token : "comment",
                //    regex : "--.*$"
                //},
                {
                    token: "string",           // " string
                    regex: '".*?"'
                },
                {
                    token: "string",           // ' string
                    regex: "'.*?'"
                },
                {
                    token: "constant.numeric", // float
                    regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
                    //}, {
                    //    token : "keyword",
                    //    regex : "(timestatsby|top|bottom|fields)\\d+"
                },
                {
                    token: keywordMapper,
                    regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
                },
                {
                    token: "keyword.operator",
                    regex: "\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|="
                },
                {
                    token: "paren.lparen",
                    regex: "[\\(]"
                },
                {
                    token: "paren.rparen",
                    regex: "[\\)]"
                },
                {
                    token: "text",
                    regex: "\\s+"
                }
            ]
        };
    };

    oop.inherits(SqlHighlightRules, TextHighlightRules);

    exports.SqlHighlightRules = SqlHighlightRules;
});

define("ace/snippets/zenlog", ["require", "exports", "module"], function(require, exports/*, module*/) {
    "use strict";

    exports.snippetText = [
        //명령어
        "snippet where", "\twhere ",
        "snippet top", "\ttop ",
        "snippet bottom", "\tbottom ",
        "snippet stats", "\tstats ",
        "snippet fields", "\tfields ",
        "snippet chart", "\tchart ",
        "snippet timestats", "\ttimestats ",
        "snippet transaction", "\ttransaction ",
        "snippet concurrency", "\tconcurrency ",
        "snippet sort", "\tsort ",
        "snippet eval", "\teval(${1}) ",
        "snippet columnname", "\tcolumnname ",
        "snippet columnhide", "\tcolumnhide ",
        "snippet dedup", "\tdedup ",
        "snippet overlay", "\toverlay ",
        "snippet from", "\tfrom ",
        "snippet import", "\timport ",
        "snippet load", "\tload ",
        "snippet set", "\tset ",
        "snippet for", "\tfor ",

        "snippet int", "\tint(${1})",
        "snippet groupby", "\tgroupby(${1})",
        "snippet limit", "\tlimit=",
        "snippet orderby", "\torderby(${1})",
        "snippet startdate", "\tstartdate='${1}'",
        "snippet enddate", "\tenddate='${1}'",
        "snippet excludedate", "\texcludedate='${1}'",
        // scalar function
        "snippet abs", "\tabs(${1})",
        "snippet capitalize", "\tcapitalize(${1})",
        "snippet ceil", "\tceil(${1})",
        "snippet cidr", "\tcidr('${1}', ${2})",
        "snippet coalesce", "\tcoalesce(${1})",
        "snippet eq", "\teq(${1}, ${2})",
        "snippet extract", "\textract(${1}, '${2}')",
        "snippet floor", "\tfloor(${1})",
        "snippet gt", "\tgt(${1}, ${2})",
        "snippet gte", "\tgte(${1}, ${2})",
        "snippet humantime", "\thumantime(${1}, '${2}')",
        "snippet ifnull", "\tifnull(${1}, ${2})",
        "snippet instr", "\tinstr(${1}, ${2})",
        "snippet length", "\tlength(${1})",
        "snippet like", "\tlike('${1}', ${2})",
        "snippet ln", "\tln(${1})",
        "snippet log", "\tlog(${1}, ${2})",
        "snippet lookup", "\tlookup(${1})",
        "snippet lower", "\tlower(${1})",
        "snippet lt", "\tlt(${1}, ${2})",
        "snippet lte", "\tlte(${1}, ${2})",
        "snippet ltrim", "\tltrim(${1}, ${2})",
        "snippet neq", "\tneq(${1}, ${2})",
        "snippet nullif", "\tnullif(${1}, ${2})",
        "snippet pow", "\tpow(${1}, ${2})",
        "snippet regexp", "\tregexp('${1}', ${2})",
        "snippet replace", "\treplace(${1}, '${2}', '${3}')",
        "snippet round", "\tround(${1}, ${2})",
        "snippet rtrim", "\trtrim(${1}, ${2})",
        "snippet sqrt", "\tsqrt(${1})",
        "snippet substitute", "\tsubstitute(${1}, ${2}, ${3}, '${4}')",
        "snippet substr", "\tsubstr(${1})",
        "snippet trim", "\ttrim(${1}, ${2})",
        "snippet upper", "\tupper(${1})",
        // aggregate function
        "snippet avg", "\tavg(${1})",
        "snippet count", "\tcount(${1})",
        "snippet dcount", "\tdcount(${1})",
        "snippet group_concat", "\tgroup_concat(${1})",
        "snippet list", "\tlist(${1})",
        "snippet max", "\tmax(${1})",
        "snippet min", "\tmin(${1})",
        "snippet mode", "\tmode(${1})",
        "snippet range", "\trange(${1})",
        "snippet sum", "\tsum(${1})",
        "snippet total", "\ttotal(${1})",
        "snippet value", "\tvalue(${1})"
    ].join('\n');

    exports.scope = "zenlog";

});
