var windowKit = new windowKit({
  account: 34681503,
  // skillId: 1933536430,
  //skillId: 1933526730,
  skillId: 1912201930,

  //skillId: 12341234 - optional skill ID
});

$("#hideSegment").hide();

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
        //console.log(res.participantId);
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

  // console.log(res);
});

windowKit.onReady(function (res) {
  // console.log(res);
});

windowKit.onMessageEvent(function (res) {
  //console.log(res);
  // console.log(res.conversationId);
});

//when the agent sends a text message
windowKit.onAgentTextEvent(function (text) {
  var jwt = text.substring(0, 3);
  if (jwt === "jwt") {
    // console.log(text.substring(4, text.length));
    sendVariable(text.substring(4, text.length), jwtCallback().jwt);
    //console.log(jwtCallback().jwt);
    // console.log(windowKit.initStack[0].jwt);
    // windowKit.sendMessage(jwtCallback().jwt);
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
  console.log(content);
  //render the structured content using JsonPollock
  var line1 = createLine({
    by: "Bot",
    text: content.elements[0].text,
    source: "agent",
    type: "rttext",
  });

  $("#chatLines").append(line1);
  // content.elements.splice(0, 1);
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
  // console.log(res);
  //console.log(res.conversationId);
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

/////////////////////////////////////////////////////////////////

// Post data to Web View API
async function postData(url = "", auth, data = {}) {
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return await response.json();
}

// method to sha256 encode string
async function sha256(message) {
  const msgBuffer = new TextEncoder("utf-8").encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => ("00" + b.toString(16)).slice(-2)).join("");
}

// Send Variable
async function sendVariable(botid, jwt) {
  // Get data from query string
  const userId = windowKit.participantId;
  const conversationId = Object.keys(windowKit.openConvs)[0];
  const botId = botid;

  // use correct domain for your region
  const domain =
    "https://va.bc-intg.liveperson.net/thirdparty-services-0.1/webview";

  // encode auth string
  const authString = `${conversationId} || ${botId}`;
  const auth = await sha256(authString);

  const res = await postData(domain, auth, {
    botId,
    conversationId,
    userId,
    message: "request successful", // optional
    contextVariables: [
      { name: "jwt", value: jwt },
      { name: "color", value: "ccccccccccccccc" },
      { name: "swallow", value: "ssssssssssss" },
    ],
  });
}
