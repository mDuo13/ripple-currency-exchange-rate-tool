var cxr = $("#cxr_1");

var issuers = {
    "USD": "rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq",//~gatehub
    "BTC": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",//~bitstamp
    "CNY": "razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA",//~ripplechina
    "JPY": "r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN",//~tokyojpy
    "XRP": ""//no issuer, because xrp
};

var DATA_API = "https://data.ripple.com/v2/exchange_rates/";

$(document).ready(function() {

    gen_request_path();
    
    //events
    cxr.find("form").submit(do_submit);
    cxr.find("select.from").change(gen_request_path);
    cxr.find("select.to").change(gen_request_path);
    cxr.find("#strict_conversions_check").change(gen_request_path);
    cxr.find(".flip").click(flip_currencies);

});

function gen_request_path() {
    //requires cxr to be a jQuery object matching the wrapper div
    var from_currency = cxr.find("select.from").val();
    var to_currency = cxr.find("select.to").val();
    
    if (from_currency !== "XRP") {
        from_currency = from_currency + "+" + issuers[from_currency];
    }
    if (to_currency !== "XRP") {
        to_currency = to_currency + "+" + issuers[to_currency];
    }
    
    var new_path = DATA_API + from_currency + "/" + to_currency;
    
    if (!cxr.find("#strict_conversions_check").prop("checked")) {
        new_path = new_path + "?strict=false";
    }
    
    cxr.find(".request").text(new_path);
}


function flip_currencies() {
    var from_currency = cxr.find("select.from").val();
    var to_currency = cxr.find("select.to").val();
    
    cxr.find("select.from").val(to_currency);
    cxr.find("select.to").val(from_currency);
    
    //update the json to reflect new values
    gen_request_path();
}

function do_submit() {
    var req_path = cxr.find(".request").text();
    $.ajax(req_path, {
        method: "GET",
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
    
    var from_currency = cxr.find("select.from").val();
    var to_currency = cxr.find("select.to").val();
    
    if (body.rate == 0) {
        human.append('<p>There was not sufficient exchange volume to determine a rate between <span class="from currency">'+from_currency+'</span> and <span class="to currency">'+to_currency+'</span>.</p>');
    } else {
        human.append('<p>By spending 1 <span class="from currency">'+from_currency+'</span>, you can buy <span class="to amount">'+body.rate+'</span> <span class="to currency">'+to_currency+'</span>.</p>');
        if (!cxr.find("#strict_conversions_check").prop("checked")) {
            human.append("<p>(Caution: This exchange rate may be determined on the basis of fewer than 10 exchanges.)</p>");
        }
    }
}
