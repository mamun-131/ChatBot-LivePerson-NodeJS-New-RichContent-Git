var windowKit = new windowKit({
  account: 34681503,
  skillId: 1933536430,
  //skillId: 12341234 - optional skill ID
});

$("#hideSegment").hide();

//connect to LE
windowKit.connect();
windowKit.onConnect(function (res) {
  console.log(res);
  //alert(res);

  $(document).ready(function () {
    $("#startChat").click(function () {
      setTimeout(function () {
        //alert("Hello");
        windowKit.sendMessage("reset");
        windowKit.sendMessage("hi");
        $("#chatLines").empty();
        $("#hideSegment").show();
        $("#startHere").hide();
        scrollToBottom();
      }, 1000);
    });
  });
  $(document).ready(function () {
    $("#closeChat").click(function () {
      localStorage.clear();

      $("#chatLines").empty();
      $("#hideSegment").hide();

      //windowKit.sendChatState("ended");
      windowKit.sendMessage("reset");

      // windowKit.sendMessageClose();
      //console.log("Mamun");
      delete windowKit;
      window.location.reload(true);

      //  $("#startHere").show();
    });
  });

  $("#hideSegment").hide();

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
  //console.log(JSON.stringify(res.initStack));
  //console.log(res.initStack);
});
windowKit.onReady(function (res) {
  // console.log(res);
});

windowKit.onMessageEvent(function (res) {
  // console.log(res);
});

//when the agent sends a text message
windowKit.onAgentTextEvent(function (text) {
  //  if (text === "Session deleted") {
  //  return;
  // }
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
  console.log("Agent: " + text);
});

//when the agent sends a rich content message
windowKit.onAgentRichContentEvent(function (content) {
  //console.log(content.elements[0].text);
  //render the structured content using JsonPollock
  console.log("Agent:");
  console.log(content);
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
  // $("#agentIsTyping").html("ooooo");
  console.log(res);
  // alert("Agent is typing");
  if (res === "COMPOSING") {
    //  chatWindow.setFooterContent("Agent is typing...");
    $("#agentIsTyping").html("Agent is typing...");
    // $("#agentIsTyping").innerHTML = "Agent is typing...";
  } else {
    // chatWindow.setFooterContent("");
    $("#agentIsTyping").html("");
  }
});
