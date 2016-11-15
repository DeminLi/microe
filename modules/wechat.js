let async = require('async'); 
let jsSHA = require('jssha');
let request = require('request');
let redis = require('./db/redis-client');

let db = new redis();
module.exports = function (config, url, callback)
{
    db.getTicket(function (ticket)
    {
        if(!ticket)
        {
            async.waterfall([
            function(cb)
            {
                getToken(config, cb);
            },
            function(token, cb)
            {
                getNewTicket(token, cb);
            }
            ], function(err, ticket)
            {
                var timestamp = getTimesTamp();
                var noncestr = getNonceStr();
                var str = 'jsapi_ticket=' + ticket + '&noncestr='+ noncestr+'&timestamp=' + timestamp + '&url=' + url;
                let shaObj = new jsSHA(str, 'TEXT');
                var signature = shaObj.getHash('SHA-1', 'HEX');
                callback(null, {
                    appId: config.appId,
                    timestamp: timestamp,
                    nonceStr: noncestr,
                    signature: signature
                });
            })
        }
        else
        {
            var timestamp = getTimesTamp();
            var noncestr = getNonceStr();
            var str = 'jsapi_ticket=' + ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + url;
            let shaObj = new jsSHA(str, 'TEXT');
            var signature = shaObj.getHash('SHA-1', 'HEX');
            callback(null, {
                appId: config.appId,
                timestamp: timestamp,
                nonceStr: noncestr,
                signature: signature
            });
        }
    });
}

function getTimesTamp() {
    return parseInt(new Date().getTime() / 1000) + '';
}
                
function getNonceStr() {
    return Math.random().toString(36).substr(2, 15);
}

function getToken(config, cb) {
    var tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appId=' + config.appId + '&secret=' + config.appSecret;
    request.get(tokenUrl, function(error, response, body) {
        if (error) {
            cb('getToken error', error);
        }
        else {
            try {
                var token = JSON.parse(body).access_token;
                cb(null, token);
            }
            catch (e) {
                cb('getToken error', e);
            }
        }
    });
}

function getNewTicket(token, cb) {
    request.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + token + '&type=jsapi', function(error, res, body) {
        if (error) {
            cb('getNewTicket error', error);
        }
        else {
            var ticket = JSON.parse(body).ticket;
            db.updateTicket(ticket);
            cb(null, ticket);
        }
    });
}