var windowKit = new windowKit({
  account: 34681503,
  //skillId: 1933526730,
  skillId: 1933536430,
  //skillId: 12341234 - optional skill ID
});

$("#hideSegment").hide();

//windowKit.lpUtils.

//connect to LE
windowKit.connect();
windowKit.onConnect(function (res) {
  
  //Start Chat Button Binding
  $(document).ready(function () {
    $("#startChat").click(function () {
      setTimeout(function () {
        windowKit.sendMessage("reset"); //restart chat
        windowKit.sendMessage("hi"); //initiate chat
        $("#chatLines").empty();
        $("#hideSegment").show();
        $("#startHere").hide();
        console.log(res);
        console.log(res.participantId);
        scrollToBottom();
      }, 1000);
    });
  });
  //Close Chat Button Binding
  $(document).ready(function () {
    $("#closeChat").click(function () {
      localStorage.clear();
      $("#chatLines").empty();
      $("#hideSegment").hide();
      //   delete windowKit;
      window.location.reload(true);
    });
  });
  //Hide Chat Segments
  $("#hideSegment").hide();
  //Send Chat Message Button Binding
  $(document).ready(function () {
    $("#sendButton").click(function () {
      var line = createLine({
        by: "You",
        text: $("#textline").val(),
        source: "visitor",
        type: "text",
      });
      $("#chatLines").append(line);
      windowKit.sendMessage($("#textline").val());
      $("#textline").val("");
      scrollToBottom();
    });
  });

   console.log(res);
});

windowKit.onReady(function (res) {
  // console.log(res);
});

windowKit.onMessageEvent(function (res) {
  console.log(res);
});

//when the agent sends a text message
windowKit.onAgentTextEvent(function (text) {
  if (text === "jwt") {

    console.log(windowKit.openConvs);
   // console.log(windowKit.openConvs[0]);
    //sendVariable(windowKit.openConvs,windowKit.participantId);

    // console.log(windowKit.initStack[0].jwt);
    console.log(jwtCallback().jwt);
    windowKit.sendMessage(jwtCallback().jwt);
    return;
  }
  //append the message's contents to the DOM
  var line = createLine({
    by: "Bot",
    text: text,
    source: "agent",
    type: "text",
  });
  $("#chatLines").append(line);
  //grab all the agent texts so far
  var botTexts = document.getElementsByClassName("response");
  //find the last one
  var latestText = botTexts[botTexts.length - 1];
  //scroll the window to the last text. This is used to create a scroll effect in the conversation.
  scrollToBottom();
});

//when the agent sends a rich content message
windowKit.onAgentRichContentEvent(function (content) {
  //console.log(content.elements[0].text);
  //render the structured content using JsonPollock
  var line1 = createLine({
    by: "Bot",
    text: content.elements[0].text,
    source: "agent",
    type: "rttext",
  });

  $("#chatLines").append(line1);
  content.elements.splice(0, 1);
  var structuredText = JsonPollock.render(content);

  var line2 = createLine({
    by: "Bot",
    text: structuredText,
    source: "agent",
    type: "rtext",
  });

  //append the results of the render to the DOM
  $("#chatLines").append(line2);
  scrollToBottom();
  //console.log(line2);
  //when a user clicks on a structured content button
  $(".lp-json-pollock-element-button").on("click", function () {
    //grab the text of the button
    var scText = $(this).text();
    //send the text to LE for the bot to process
    windowKit.sendMessage(scText);
    //append the text to the DOM so it shows up as the user's side of the conversation
    var line_button = createLine({
      by: "You",
      text: $(this).text(),
      source: "visitor",
      type: "text",
    });
    $("#chatLines").append(line_button);
    //same scroll effect as above
    // console.log(scText);
    scrollToBottom();
  });
});

JsonPollock.registerAction("publishText", (data) => {
  windowKit.sendMessage(data.actionData.text);
  var line = createLine({
    by: "You",
    text: data.actionData.text,
    source: "visitor",
    type: "text",
  });
  scrollToBottom();
});

windowKit.onMessageSent(function (res) {
  console.log(res);
});

function scrollToBottom() {
  $("#chatLines").scrollTop(
    $("#chatLines")[0].scrollHeight - $("#chatLines")[0].clientHeight
  );
}

//Create a chat line
function createLine(line) {
  var div = document.createElement("P");

  if (line.source === "visitor") {
    div.innerHTML =
      "<img src='/assets/image/you.PNG' style='width: 40px; height: 40px;'/><b>" +
      line.by +
      "</b>: ";
    div.setAttribute("class", "request");
    div.appendChild(document.createTextNode(line.text));
  } else {
    if (line.type === "rtext") {
      div.append(line.text);
    } else if (line.type === "rttext") {
      div.innerHTML =
        "<img src='/assets/image/boticon.PNG' style='width: 40px; height: 40px;'/><b>" +
        line.by +
        "</b>: ";
      div.setAttribute("class", "response1");
      div.innerHTML += line.text;
    } else {
      div.innerHTML =
        "<img src='/assets/image/boticon.PNG' style='width: 40px; height: 40px;'/><b>" +
        line.by +
        "</b>: ";
      div.setAttribute("class", "response");
      div.innerHTML += line.text;
    }
  }

  return div;
}

windowKit.onAgentChatState(function (res) {
  // console.log(res);
  if (res === "COMPOSING") {
    $("#agentIsTyping").html("Agent is typing...");
  } else {
    $("#agentIsTyping").html("");
  }
});


///////////////////////////////////////////////////////////////////////////////////
function sendVariable(convid, userid){
  var auth = SHA256(convid + ' || ' + "ba580212-3512-4dcd-a3b8-e374b144ea04");
  console.log(SHA256(auth));

  var url = 'https://va.bc-intg.liveperson.net/thirdparty-services-0.1/webview';
var data = {
          "botId": "ba580212-3512-4dcd-a3b8-e374b144ea04",
          "conversationId": convid,
          "message":"webrequest",
          "userId": userid,
          "contextVariables": [{"name": "PaymentId","value": "534e34fc89050304e6f6827c41c50410d7"}, {"name": "PaymentStatus","value": "PROCESSED"}]};
  fetch(url, {
    body: JSON.stringify(data),
    headers: {
      'Authorization': auth,
      'content-type': 'application/json'
    },
    method: 'POST',
    redirect: 'follow'
  })
  .then(response => {
    if (response.status === 200) {
      console.log(response.text());
  } else {
   throw new Error('Something went wrong on api server!');
  }
})
.catch(error => {
  console.error(error);
});
}



//////////////////////////////////////////////////////////////////////////////////

function SHA256(s){
  var chrsz  = 8;
  var hexcase = 0;
  function safe_add (x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
  }
  function S (X, n) { return ( X >>> n ) | (X << (32 - n)); }
  function R (X, n) { return ( X >>> n ); }
  function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
  function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
  function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
  function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
  function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
  function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }
  function core_sha256 (m, l) {
  var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
  var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
  var W = new Array(64);
  var a, b, c, d, e, f, g, h, i, j;
  var T1, T2;
  m[l >> 5] |= 0x80 << (24 - l % 32);
  m[((l + 64 >> 9) << 4) + 15] = l;
  for ( var i = 0; i<m.length; i+=16 ) {
  a = HASH[0];
  b = HASH[1];
  c = HASH[2];
  d = HASH[3];
  e = HASH[4];
  f = HASH[5];
  g = HASH[6];
  h = HASH[7];
  for ( var j = 0; j<64; j++) {
  if (j < 16) W[j] = m[j + i];
  else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
  T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
  T2 = safe_add(Sigma0256(a), Maj(a, b, c));
  h = g;
  g = f;
  f = e;
  e = safe_add(d, T1);
  d = c;
  c = b;
  b = a;
  a = safe_add(T1, T2);
  }
  HASH[0] = safe_add(a, HASH[0]);
  HASH[1] = safe_add(b, HASH[1]);
  HASH[2] = safe_add(c, HASH[2]);
  HASH[3] = safe_add(d, HASH[3]);
  HASH[4] = safe_add(e, HASH[4]);
  HASH[5] = safe_add(f, HASH[5]);
  HASH[6] = safe_add(g, HASH[6]);
  HASH[7] = safe_add(h, HASH[7]);
  }
  return HASH;
  }
  function str2binb (str) {
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz) {
  bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
  }
  return bin;
  }
  function Utf8Encode(string) {
  string = string.replace(/\r\n/g,"\n");
  var utftext = "";
  for (var n = 0; n < string.length; n++) {
  var c = string.charCodeAt(n);
  if (c < 128) {
  utftext += String.fromCharCode(c);
  }
  else if((c > 127) && (c < 2048)) {
  utftext += String.fromCharCode((c >> 6) | 192);
  utftext += String.fromCharCode((c & 63) | 128);
  }
  else {
  utftext += String.fromCharCode((c >> 12) | 224);
  utftext += String.fromCharCode(((c >> 6) & 63) | 128);
  utftext += String.fromCharCode((c & 63) | 128);
  }
  }
  return utftext;
  }
  function binb2hex (binarray) {
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++) {
  str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
  hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8 )) & 0xF);
  }
  return str;
  }
  s = Utf8Encode(s);
  return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
 }














 /*
 
 // Post data to Web View API
async function postData(url = '', auth, data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return await response.json();
};

// method to sha256 encode string
async function sha256(message) {
  const msgBuffer = new TextEncoder('utf-8').encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
}

// Post data when form is submitted
submitForm = async function() {
  // Get data from query string
  const queryParams = new URLSearchParams(document.location.search);
  const userId = queryParams.get('userId');
  const conversationId = queryParams.get('convId');
  const botId = queryParams.get('botId');

  // Get data from form
  const name = document.querySelector('input[name="user_name"]').value;
  const color = document.querySelector('input[name="favorite_color"]').value;
  const swallow = document.querySelector('input[name="unladen_swallow"]').value;

  // use correct domain for your region
  const domain = 'https://va.bc-intg.liveperson.net/thirdparty-services-0.1/webview';
  
  // encode auth string
  const authString = `${conversationId} || ${botId}`;
  const auth = await sha256(authString);

  const res = await postData(domain, auth, {
    botId,
    conversationId,
    userId,
    message: "request successful", // optional
    contextVariables: [
      {"name": "name", "value": name},
      {"name": "color", "value": color},
      {"name": "swallow", "value": swallow}
    ],
  });
}
 */