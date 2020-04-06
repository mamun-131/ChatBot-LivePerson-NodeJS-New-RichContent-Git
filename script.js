//cc97ea36f27e44a29b2f416f71f8d901
//721c180b09eb463d9f3191c41762bb68
//http://127.0.0.1:8080/index.html?site=34681503&lptag=false

var appKey = "721c180b09eb463d9f3191c41762bb68",
  logsStarted = false,
  engagementData = {},
  getEngagementMaxRetries = 25,
  chatWindow,
  chatContainer,
  chat,
  chatState,
  chatArea,
  logsLastChild;

initDemo();

function initDemo() {
  callObject();
  if (lptag === "true") {
    //  createExternalJsMethodName();
  } else {
    initChat(getEngagement);
  }
  $(document).ready(function() {
    $("#startChat").click(function() {
      // alert("mmmm");
      $("#hideSegment").show();
      $("#startHere").hide();
    });
  });

  $("#hideSegment").hide();
  $("#startHere").show();
  // myChatObj.getEngagement();
}

function callObject() {}

function createExternalJsMethodName() {
  window.externalJsMethodName = function(data) {
    engagementData = data;
    initChat(createWindow);
  };
}

function createWindow() {
  chatWindow = $("html").html();

  // chatWindow = document.getElementById("chatWindow");

  //chatWindow = $.window({
  /* chatWindow = $(document).ready({
    width: 650,
    height: 500,
    title: "Chat Demo",
    content: $("#chatWindow").html(),
    footerContent: $("#agentIsTyping").html(),
    onShow: function() {
      startChat();
    },
    onClose: function() {
      chatWindow = chatContainer = chatArea = null;
    }
  });
 
   chatWindow = {
    content: $("#chatWindow").html(),
    footerContent: $("#agentIsTyping").html()
  };
  startChat();*/
  // chatContainer = chatWindow;
  startChat();
  chatContainer = $("html").html();
}

function initChat(onInit) {
  var chatConfig = {
    lpNumber: site,
    appKey: appKey,
    onInit: [
      onInit,
      function(data) {
        writeLog("onInit", data);
      }
    ],
    onInfo: function(data) {
      writeLog("onInfo", data);
    },
    onLine: [
      addLines,
      function(data) {
        writeLog("onLine", data);
      }
    ],
    onState: [
      updateChatState,
      function(data) {
        writeLog("onState", data);
      }
    ],
    onStart: [
      updateChatState,
      bindEvents,
      bindInputForChat,
      function(data) {
        writeLog("onStart", data);
      }
    ],
    onStop: [updateChatState, unBindInputForChat],
    onAddLine: function(data) {
      writeLog("onAddLine", data);
    },
    onAgentTyping: [
      agentTyping,
      function(data) {
        writeLog("onAgentTyping", data);
      }
    ],
    onRequestChat: function(data) {
      writeLog("onRequestChat", data);
    },
    onEngagement: function(data) {
      if ("Available" === data.status) {
        createEngagement(data);
        writeLog("onEngagement", data);
      } else if ("NotAvailable" === data.status) {
        writeLog("onEngagement", data);
      } else {
        if (getEngagementMaxRetries > 0) {
          writeLog(
            "Failed to get engagement. Retry number " + getEngagementMaxRetries,
            data
          );
          window.setTimeout(getEngagement, 100);
          getEngagementMaxRetries--;
        }
      }
    }
  };
  chat = new lpTag.taglets.ChatOverRestAPI(chatConfig);
}

function getEngagement() {
  chat.getEngagement();
}

function createEngagement(data) {
  $(document).ready(function() {
    $("#startChat").click(function() {
      engagementData = data;
      createWindow();
      $("#hideSegment").show();
      $("#startChat").hide();
    });
  });

  /*
  var $engagement = $(
    '<button id="engagement" class="btn-lg">Start Chat</button>'
  );
  $engagement.click(function() {
    engagementData = data;
    createWindow();
  });
  $engagement.appendTo($("#engagementPlaceholder"));*/
}

function startChat() {
  engagementData = engagementData || {};
  engagementData.engagementDetails = engagementData.engagementDetails || {};
  var chatRequest = {
    LETagVisitorId: engagementData.visitorId || engagementData.svid,
    LETagSessionId: engagementData.sessionId || engagementData.ssid,
    LETagContextId:
      engagementData.engagementDetails.contextId || engagementData.scid,
    skill: engagementData.engagementDetails.skillName,
    engagementId:
      engagementData.engagementDetails.engagementId || engagementData.eid,
    campaignId:
      engagementData.engagementDetails.campaignId || engagementData.cid,
    language: engagementData.engagementDetails.language || engagementData.lang
  };
  writeLog("startChat", chatRequest);
  chat.requestChat(chatRequest);
}

//Add lines to the chat from events
function addLines(data) {
  var linesAdded = false;
  for (var i = 0; i < data.lines.length; i++) {
    var line = data.lines[i];
    if (line.source !== "visitor" || chatState != chat.chatStates.CHATTING) {
      var chatLine = createLine(line);
      addLineToDom(chatLine);
      linesAdded = true;
    }
  }
  // if (linesAdded) {
  scrollToBottom();
  // }
}

//Create a chat line
function createLine(line) {
  var div = document.createElement("P");

  if (
    line.text ===
    "Thank you for choosing to chat with us.  An agent will be with you shortly."
  ) {
    return;
  }

  //div.innerHTML =
  //  "<img src='/assets/image/boticon.PNG'/><b>" + line.by + "</b>: ";
  if (line.source === "visitor") {
    div.innerHTML =
      "<img src='/assets/image/you.PNG' style='width: 40px; height: 40px;'/><b>" +
      line.by +
      "</b>: ";
    div.setAttribute("class", "response");
    div.appendChild(document.createTextNode(line.text));
    /* div.appendChild(
      document
        .createElement("span")
        .appendChild(document.createTextNode("mmmmmm"))
        
    );*/
    //div.appendChild(document.createTextNode("Time")).className="timeShow";
  } else {
    div.innerHTML =
      "<img src='/assets/image/boticon.PNG' style='width: 40px; height: 40px;'/><b>" +
      line.by +
      "</b>: ";
    div.setAttribute("class", "request");
    div.innerHTML += line.text;
  }

  return div;
}

//Add a line to the chat view DOM
function addLineToDom(line) {
  /* if (!chatArea) {
    chatArea = chatContainer.find("#chatLines");
    chatArea = chatArea && chatArea[0];
  }
  chatArea.append(line);*/
  $("#chatLines").append(line);
}

//Scroll to the bottom of the chat view
function scrollToBottom() {
  /*  if (!chatArea) {
    chatArea = chatContainer.find("#chatLines");
    chatArea = chatArea && chatArea[0];
  }
  chatArea.scrollTop = chatArea.scrollHeight;*/
  //alert($("#chatLines").scrollHeight);
  // $("#chatLines").scrollTop() = $("#chatLines").scrollHeight();
  $("#chatLines").scrollTop(
    $("#chatLines")[0].scrollHeight - $("#chatLines")[0].clientHeight
  );
}

//Sends a chat line
function sendLine(userinput) {
  //alert(userinput);
  // var $textline = chatContainer.find("#textline");
  //var text = $textline.val();

  var text = userinput;
  if (text && chat) {
    var line = createLine({
      by: chat.getVisitorName(),
      text: text,
      source: "visitor"
    });

    chat.addLine({
      text: text,
      error: function() {
        line.className = "error";
      }
    });
    addLineToDom(line);
    // $textline.val("");
    $("#textline").val("");
    scrollToBottom();
  }
}

//Listener for enter events in the text area
function keyChanges(e) {
  e = e || window.event;
  var key = e.keyCode || e.which;
  if (key == 13) {
    if (e.type == "keyup") {
      sendLine();
      setVisitorTyping(false);
    }
    return false;
  } else {
    setVisitorTyping(true);
  }
}

//Set the visitor typing state
function setVisitorTyping(typing) {
  if (chat) {
    chat.setVisitorTyping({ typing: typing });
  }
}

//Set the visitor name
function setVisitorName() {
  var name = $("#visitorName").val();
  if (chat && name) {
    chat.setVisitorName({ visitorName: name });
  }
}

//Ends the chat
function endChat() {
  if (chat) {
    chat.endChat({
      disposeVisitor: true,
      success: function() {
        // chatWindow.close();
      }
    });
  }
}

//Sends an email of the transcript when the chat has ended
function sendEmail() {
  var email = chatContainer.find("#emailAddress").val();
  if (chat && email) {
    chat.requestTranscript({ email: email });
  }
}

//Sets the local chat state
function updateChatState(data) {
  if (data.state === "ended" && chatState !== "ended") {
    chat.disposeVisitor();
  }
  chatState = data.state;
}

function agentTyping(data) {
  if (data.agentTyping) {
    //  chatWindow.setFooterContent("Agent is typing...");
    $("#agentIsTyping").html("Agent is typing...");
  } else {
    // chatWindow.setFooterContent("");
    $("#agentIsTyping").html("");
  }
}

function bindInputForChat() {
  chatContainer
    .find("#sendButton")
    .removeAttr("disabled")
    .click(sendLine);
  chatContainer
    .find("#chatInput")
    .keyup(keyChanges)
    .keydown(keyChanges);
}

function unBindInputForChat() {
  chatContainer.find("#sendButton").off();
  chatContainer.find("#chatInput").off();
}

function bindEvents() {
  //chatContainer.find("#closeChat").click(endChat);
  $(document).ready(function() {
    $("#sendButton").click(function() {
      sendLine($("#textline").val());
    });
  });

  $(document).ready(function() {
    $("#closeChat").click(function() {
      $("#startChat").show();
      $("#hideSegment").hide();
      endChat();
      window.location.reload();
    });
  });
  $(document).ready(function() {
    $("#setvisitorName").click(function() {
      setVisitorName();
    });
  });
  $(document).ready(function() {
    $("#sendTranscript").click(function() {
      sendEmail();
    });
  });

  // chatContainer.find("#setvisitorName").click(setVisitorName);
  // chatContainer.find("#sendTranscript").click(sendEmail);
}

function writeLog(logName, data) {
  var log = document.createElement("DIV");
  try {
    data = typeof data === "string" ? data : JSON.stringify(data);
  } catch (exc) {
    return;
  }
  var time = new Date().toTimeString().slice(0, 8);
  log.innerHTML = time + " " + logName + (data ? " : " + data : "");
  if (!logsStarted) {
    document.getElementById("logs").appendChild(log);
    logsStarted = true;
  } else {
    document.getElementById("logs").insertBefore(log, logsLastChild);
  }
  logsLastChild = log;
}
