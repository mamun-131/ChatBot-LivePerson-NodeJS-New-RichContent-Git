var windowKit = new windowKit({
  account: 34681503,
  //skillId: 12341234 - optional skill ID
});

//connect to LE
windowKit.connect();
windowKit.onConnect(function (res) {
  //alert(res);
  $(document).ready(function () {
    $("#sendButton").click(function () {
      windowKit.sendMessage($("#textline").val());
    });
  });

   console.log(res);
  //console.log(JSON.stringify(res.initStack));
  //console.log(res.initStack);
});
windowKit.onReady(function (res) {
  // console.log(res);
});

windowKit.onMessageEvent(function (res) {
  //console.log(res);
});

//windowKit.sendMessage("Hello World!");
//when the agent sends a text message
windowKit.onAgentTextEvent(function (text) {
  //append the message's contents to the DOM
  $("#chatbox").append('<div class="agentText">' + text + "</div>");
  //grab all the agent texts so far
  var botTexts = document.getElementsByClassName("agentText");
  //find the last one
  var latestText = botTexts[botTexts.length - 1];
  //scroll the window to the last text. This is used to create a scroll effect in the conversation.
  $("body, html").animate({ scrollTop: $(latestText).offset().top }, 1000);
  // alert("mmm");
  // console.log("Agent: " + text);
});

//windowKit.setInteractions(1).sendMessage("hi");

//when the agent sends a rich content message
windowKit.onAgentRichContentEvent(function (content) {
  //render the structured content using JsonPollock
  var structuredText = JsonPollock.render(content);
  //append the results of the render to the DOM
  $("#chatbox").append(structuredText);
  //next three rows create the same scrolling effect as above
  var botTextsSC = document.getElementsByClassName("lp-json-pollock");
  var latestSC = botTextsSC[botTextsSC.length - 1];
  $("body, html").animate({ scrollTop: $(latestSC).offset().top }, 1000);
  console.log("Agent: ", structuredText);
  //when a user clicks on a structured content button
  $(".lp-json-pollock-element-button").on("click", function () {
    //grab the text of the button
    var scText = $(this).text();
    //send the text to LE for the bot to process
    windowKit.sendMessage(scText);
    //append the text to the DOM so it shows up as the user's side of the conversation
    $("#chatbox").append('<div class="consumerText">' + scText + "</div>");
    //same scroll effect as above
    console.log("Agent: " + scText);
    var consumerTexts = document.getElementsByClassName("consumerText");
    var latestConsumerText = consumerTexts[consumerTexts.length - 1];
    $("body, html").animate(
      { scrollTop: $(latestConsumerText).offset().top },
      1000
    );
  });
});

JsonPollock.registerAction("publishText", (data) => {
  alert(JSON.stringify(data));
  alert(data.actionData.text);
  $("#textline").val(data.actionData.text);
  windowKit.sendMessage(data.actionData.text);
});

windowKit.onMessageSent(function (res) {
  console.log("mmmm" + res);
});
