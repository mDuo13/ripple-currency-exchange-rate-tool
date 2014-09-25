var cxr = $("#cxr_1");

var issuers = {
    "USD": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",//~snapswap
    "BTC": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",//~bitstamp
    "CNY": "razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA",//~ripplechina
    "XRP": ""//no issuer, because xrp
};

var DATA_API = "https://api.ripplecharts.com/api";

$(document).ready(function() {

    gen_request_json();
    
    //events
    cxr.find("form").submit(do_submit);
    cxr.find("select.from").change(gen_request_json);
    cxr.find("select.to").change(gen_request_json);
    cxr.find(".flip").click(flip_currencies);

});

function gen_request_json() {
    //requires cxr to be a jQuery object matching the wrapper div
    var from_currency = cxr.find("select.from").val();
    var to_currency = cxr.find("select.to").val();
    
    new_json = JSON.stringify({
        "base": {
            "currency": from_currency,
            "issuer": issuers[from_currency]
        },
        "counter": {
            "currency": to_currency,
            "issuer": issuers[to_currency]
        },
        "last": true
    }, null, 2);
    
    cxr.find("textarea.request").val(new_json);
}


function flip_currencies() {
    var from_currency = cxr.find("select.from").val();
    var to_currency = cxr.find("select.to").val();
    
    cxr.find("select.from").val(to_currency);
    cxr.find("select.to").val(from_currency);
    
    //update the json to reflect new values
    gen_request_json();
}

function do_submit() {
    req_body = cxr.find("textarea.request").val();
    $.ajax(DATA_API+"/exchangerates", {
        method: "POST",
        data: req_body,
        contentType: 'application/json',
        processData: false
    }).done(get_response);

    //don't do the normal form submit thing
    return false;
}

function get_response(body,status,xhr) {
    console.log(body);
    resp = cxr.find("textarea.json.response");
    resp.val(JSON.stringify(body, null, 2));
    
    human = cxr.find(".human.response");
    human.empty();
    for (i=0; i<body.length; i++) {
        base = body[i].base.currency;
        counter = body[i].counter.currency;
        rate = body[i].last;
        human.append('<p>By spending 1 <span class="from currency">'+base+'</span>, you can buy <span class="to amount">'+rate+'</span> <span class="to currency">'+counter+'</span>.</p>');
    }
}
