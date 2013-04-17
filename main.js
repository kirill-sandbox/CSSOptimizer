var fs = require('fs');

String.prototype.trim = function () {return this.replace(/^\s+|\s+$/g, '');}
String.prototype.leftTrim = function () {return this.replace(/^\s+/,'');}
String.prototype.rightTrim = function () {return this.replace(/\s+$/,'');}
String.prototype.fullTrim = function () {return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');}

var filePath = 'test.css';
fs.readFile(filePath, 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }

    var parsedCSS = parseCSS(data);
    var pairs = generatePairs(parsedCSS);
    pairs = compare (pairs);
    pairs = clearNotEnoughMatch (pairs, 3);
    pairs = sort (pairs);
    display(pairs);
});

function removeTabsAndNewLines (text) {
    return text.replace('\n', '').replace('\r', '').replace('\t', '');
}

function parseCSS (data) {
    data = removeTabsAndNewLines(data);

    var parts = data.split('}');
    var result = [];

    for (var i = 0; i < parts.length; i++) {
        var selectorAndProperties = parts[i].split('{');

        if (String(selectorAndProperties).fullTrim() == '') {
            continue;
        }

        var propertiesWithValues = String(selectorAndProperties[1]).split(';');
        var properties = [];
        for(var j = 0; j < propertiesWithValues.length; j++) {
            var propertyNameAndPropertyValue = String(propertiesWithValues[j]).split(':');

            var propertyNameText = String(propertyNameAndPropertyValue[0]).fullTrim();
            var propertyValueText = String(propertyNameAndPropertyValue[1]).fullTrim();

            if (propertyNameText == '') continue;
            if (propertyValueText == '') continue;

            properties.push({
                propertyName: propertyNameText,
                propertyValue: propertyValueText
            });
        }

        result.push({
            selector: new String(selectorAndProperties[0]).fullTrim(),
            property: properties
        });
    }

    return result;
}

function generatePairs (parsedCSS) {
    var pairCombinations = {};
    var result = [];
    for (var i = 0; i < parsedCSS.length; i++) {
        for (var j = 0; j < parsedCSS.length; j++) {
            if (i == j) continue;
            if (pairCombinations[j + '_' + i] == 1) continue;
            pairCombinations[i + '_' + j] = 1;
            result.push({
                objects: [parsedCSS[i], parsedCSS[j]],
                matchCount: 0
            });
        }
    }
    return result;
}

function compare (pairs) {
    for (var i = 0; i < pairs.length; i++) {
        for(var j = 0; j < pairs[i].objects[0].property.length; j++) {
            for(var k = 0; k < pairs[i].objects[1].property.length; k++) {
                if (pairs[i].objects[0].property[j].propertyName == pairs[i].objects[1].property[k].propertyName) {
                    if (pairs[i].objects[0].property[j].propertyValue == pairs[i].objects[1].property[k].propertyValue) {
                        pairs[i].matchCount++;
                    }
                }
            }
        }
    }
    return pairs;
}

function clearNotEnoughMatch (pairs, matchCount) {
    var result = [];
    for (var i = 0; i < pairs.length; i++) {
        if (pairs[i].matchCount < matchCount) continue;
        result.push(pairs[i]);
    }
    return result;
}

function sort (pairs) {
    for (var i = 0; i < pairs.length; i++) {
        for (var j = 0; j < pairs.length; j++) {
            if (pairs[i].matchCount > pairs[j].matchCount) {
                var tmp = pairs[i];
                pairs[i] = pairs[j];
                pairs[j] = tmp;
            }
        }
    }
    return pairs;
}

function display (pairs) {
    for (var i = 0; i < pairs.length; i++) {
        console.log(pairs[i].matchCount, ' ||| ', pairs[i].objects[0].selector, ' ||| ', pairs[i].objects[1].selector);
    }
}