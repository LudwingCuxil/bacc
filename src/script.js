var regexDouble = /(^(\d*[0-9]\.\d*)\d+$)|^(\d*[0-9]+$)/;
var regexDoubleWithFormat = /(^\$(\d*[0-9]\.\d*)\d+$|^(\d*[0-9]+$))/;
var regexDate = /((0[1-9]|[12][0-9]|3[01])(\W)(0[1-9]|1[012])(\W)\d\d\d\d)/;

function removeMoneyMask(htmlObject) {
  txt = $(htmlObject).val();
  txt = txt.replace(/([a-z]|[A-Z]|[<>%\$])/g, '');
  txt = txt.replace(/,/g, '');
  $(htmlObject).val(txt);
};

function numbersOnlyWithDecimal(objectHtml, event) {
  // Allow special chars + arrows
  if (event.keyCode == 46 || event.keyCode == 190 || event.keyCode == 110
    || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27
    || event.keyCode == 13
    || (event.keyCode == 65 && event.ctrlKey === true)
    || (event.keyCode >= 35 && event.keyCode <= 39)) {
    return;
  } else {
    // If it's not a number stop the keypress
    if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)
      && (event.keyCode < 96 || event.keyCode > 105)) {
      event.preventDefault();
    } else {

    }
  }
};

function numbersOnlyWithDecimalNonObject(event) {
  // Allow special chars + arrows
  if (event.keyCode == 46 || event.keyCode == 190 || event.keyCode == 110
    || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27
    || event.keyCode == 13
    || (event.keyCode == 65 && event.ctrlKey === true)
    || (event.keyCode >= 35 && event.keyCode <= 39)) {
    return;
  } else {
    // If it's not a number stop the keypress
    if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)
      && (event.keyCode < 96 || event.keyCode > 105)) {
      event.preventDefault();
    }
  }
};

function isValidMount(val) {
  var str = parseFloat(val);
  if (regexDouble.test(str)) {
    return true;
  } else {
    return false;
  }
};

function isValidMountWithFormat(val) {
  if (regexDoubleWithFormat.test(val)) {
    return true;
  } else {
    return false;
  }
};

//var revenue = 12345678.1;
//alert(revenue.formatMoney(2, 'Q'));
Number.prototype.formatMoney = function(places, symbol, thousand, decimal) {
  places = !isNaN(places = Math.abs(places)) ? places : 2;
  symbol = symbol !== undefined ? symbol : "Q";
  /*if (symbol === "GTQ") {
   symbol = "Q";
   } else {
   symbol = "$";
   }*/
  thousand = thousand || ",";
  decimal = decimal || ".";
  var number = this, negative = number < 0 ? "-" : "", i = parseInt(
      number = Math.abs(+number || 0).toFixed(places), 10)
    + "", j = (j = i.length) > 3 ? j % 3 : 0;
  return symbol
    + negative
    + (j ? i.substr(0, j) + thousand : "")
    + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand)
    + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2)
      : "");
};

Number.prototype.formatPercent = function(places, symbol, thousand, decimal) {
  places = !isNaN(places = Math.abs(places)) ? places : 2;
  symbol = "%";
  /*if (symbol === "GTQ") {
   symbol = "Q";
   } else {
   symbol = "$";
   }*/
  thousand = thousand || ",";
  decimal = decimal || ".";
  var number = this, negative = number < 0 ? "-" : "", i = parseInt(
      number = Math.abs(+number || 0).toFixed(places), 10)
    + "", j = (j = i.length) > 3 ? j % 3 : 0;
  return negative
    + (j ? i.substr(0, j) + thousand : "")
    + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand)
    + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2)
      : "")
    + symbol;
};

function numbersOnly(event) {
  // Allow special chars + arrows
  if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9
    || event.keyCode == 27 || event.keyCode == 13
    || (event.keyCode == 65 && event.ctrlKey === true)
    || (event.keyCode >= 35 && event.keyCode <= 39)){
    return;
  }else {
    // If it's not a number stop the keypress
    if (event.shiftKey || (event.altKey && ((event.keycode >=49 && event.keycode <=57) || (event.keycode >=96 && event.keycode <=105))) || event.keyCode == 17 || event.keyCode == 225 || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
      event.preventDefault();
    }
  }
}

function realNumbersOnly(event) {
  // Allow special chars + arrows
  if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9
    || event.keyCode == 27 || event.keyCode == 13
    || (event.keyCode == 65 && event.ctrlKey === true)
    || (event.keyCode >= 35 && event.keyCode <= 39)){
    return;
  }else {
    // If it's not a number stop the keypress
    if (event.shiftKey || (event.altKey && ((event.keycode >=49 && event.keycode <=57) || (event.keycode >=96 && event.keycode <=105))) || event.keyCode == 17 || event.keyCode == 225 || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )
      && event.keyCode != 110 && event.keyCode != 190) {
      event.preventDefault();
    }
  }
};

function removeMoneyMask(htmlObject) {
  txt = $(htmlObject).val();
  txt = txt.replace(/([a-z]|[A-Z]|[<>%\$])/g, '');
  txt = txt.replace(/,/g, '');
  $(htmlObject).val(txt);
}

function removeMoneyMaskVal(object) {
  if(object == null){
    return 0;
  }
  txt = object;
  if (txt !== undefined && txt.replace !== undefined) {
    txt = txt.replace(/([a-z]|[A-Z]|[<>%\$])/g, '');
    txt = txt.replace(/,/g, '');
    return txt;
  }else{
    return object;
  }
};

function applyMoneyPattern(htmlObject, currencySymbol) {
  if ($(htmlObject)[0] === undefined) {
    return;
  }
  var txt = $(htmlObject).val();
  if (txt !== "") {
    txt = txt.replace(/([a-z]|[A-Z]|[<>%\$])/g, '');
    txt = txt.replace(/,/g, '');
    txt = txt.substring(0, parseInt($(htmlObject).attr('maxlength')));
    if (isValidMount(txt)) {
      var value = parseFloat(txt);
      $(htmlObject).val(value.formatMoney(2, currencySymbol, ",", "."));
      $(htmlObject).removeClass("error-input");
      $(htmlObject).addClass("required-input");
    } else {
      $(htmlObject).val(0);
      $(htmlObject).addClass("error-input");
      $(htmlObject).removeClass("required-input");
    }
  } else {
    $(htmlObject).val(0);
  }
}

function applyPercentPattern(htmlObject, currencySymbol) {
  if ($(htmlObject)[0] === undefined) {
    return;
  }
  var txt = $(htmlObject).val();
  if (txt !== "") {
    txt = txt.replace(/([a-z]|[A-Z]|[<>%\$])/g, '');
    txt = txt.replace(/,/g, '');
    txt = txt.substring(0, parseInt($(htmlObject).attr('maxlength')));
    if (isValidMount(txt)) {
      var value = parseFloat(txt);
      $(htmlObject).val(value.formatPercent(2, currencySymbol, ",", "."));
      $(htmlObject).removeClass("error-input");
      $(htmlObject).addClass("required-input");
    } else {
      $(htmlObject).val(0);
      $(htmlObject).addClass("error-input");
      $(htmlObject).removeClass("required-input");
    }
  } else {
    $(htmlObject).val(0);
  }
}

function applyMoneyPatternText(htmlObject, currencySymbol) {
  var txt = $(htmlObject).text();
  if (txt !== "") {
    txt = txt.replace(/([a-z]|[A-Z]|[<>%\$])/g, '');
    txt = txt.replace(/,/g, '');
    txt = txt.substring(0, parseInt($(htmlObject).attr('maxlength')));
    if (isValidMount(txt)) {
      var value = parseFloat(txt);
      $(htmlObject).text(value.formatMoney(2, currencySymbol, ",", "."));
      $(htmlObject).removeClass("error-input");
      $(htmlObject).addClass("required-input");
    } else {
      $(htmlObject).val(0);
      $(htmlObject).addClass("error-input");
      $(htmlObject).removeClass("required-input");
    }
  }
}
