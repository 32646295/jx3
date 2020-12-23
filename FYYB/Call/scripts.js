/// <reference path="layer.min.js" />
/// <reference path="jquery.min.js" />
/// <reference path="libgif.js" />
/// <reference path="rubbable.js" />

var gif0, gif1, gif2, gif3, gifProgress;
var says = ["嘿", "嗨", "唔", "呼"];
var canvasBg, canvasYourTurn;
var keypressID;
var sequence = [];
var fans = true;
var enablePress = false;
$(document).ready(function () {
    init();
    $("#btnPratise").click(function () {
        
        $(".ready").show().html("准备开始");
        var now = Date.now();
        var tid = setInterval(function () {
            $("#btnPratise, #btnTeam").hide();
            $("#btnChange").show();
            var timeleft = 5 - parseInt((Date.now() - now) / 1000);
            if (timeleft < 4) $(".ready").html(timeleft);
            if (timeleft == 0) {
                $(".ready").hide();
                clearInterval(tid);
                start();
            }
        }, 100);
    });
    
    $("#btnTeam").click(function () {

    });
    $("#btnChange").click(function () {
        start();
    });
});

function init() {
    winWidth = $(window).width();
    winHight = $(window).height();
    if (winWidth < 1500 && winWidth > 1400) {
        $("body").css("position", "absolute");
        $("body").css("top", "-195px");
        $("body").css("left", "-8px");
    }
    else if (winWidth < 1700 && winWidth > 1600) {
        $("body").css("position", "absolute");
        $("body").css("top", "-45px");
        $("body").css("left", "-8px");
    }
    canvasBg = document.getElementById("bg");
    ctxBg = canvasBg.getContext("2d");
    canvasBg.width = 1920;
    canvasBg.height = 1080;

    canvasYourTurn = document.getElementById("yourTurn");
    ctxYourTurn = canvasYourTurn.getContext("2d");
    ctxYourTurn.clearRect(0, 0, 1920, 1080);

    var imgctxYourTurn = new Image();
    imgctxYourTurn.src = "imgs/LightSkill.png";
    imgctxYourTurn.onload = function () {
        ctxYourTurn.drawImage(imgctxYourTurn, 0, 0);
    }

    

    gif0 = new SuperGif({
        gif: document.getElementById("say0"),
        loop_mode: true,
        progressbar_height: 0,
        auto_play: 1,
    });
    gif0.load(function () { });

    gif1 = new SuperGif({
        gif: document.getElementById("say1"),
        loop_mode: true,
        progressbar_height: 0,
        auto_play: 1,
    });
    gif1.load(function () { });

    gif2 = new SuperGif({
        gif: document.getElementById("say2"),
        loop_mode: true,
        progressbar_height: 0,
        auto_play: 1,
    });
    gif2.load(function () { });

    gif3 = new SuperGif({
        gif: document.getElementById("say3"),
        loop_mode: true,
        progressbar_height: 0,
        auto_play: 1,
    });
    gif3.load(function () { });

    gifProgress = new SuperGif({
        gif: document.getElementById("progress"),
        loop_mode: false,
        progressbar_height: 0,
        auto_play: 0,
        on_end: function () {
            $("#progress_container").hide();
            gifProgress.move_to(0);
        }
    });
    gifProgress.load(function () {
        gifProgress.move_to(0);
    });
    
}

var play_date = null;
var play_count = -1;
var play_TotalTime = 35;

var timeleftID;
var timeID;
function start() {
    fans = randomNum(0, 1) == 1 ? true : false;
    drawBg(fans);

    clearInterval(timeID);
    clearInterval(timeleftID);

    timeID = null;
    timeleftID = null;
    play_date = null;
    play_count = -1;
    alreadyCheck = false;
    enablePress = false;
    userPress = [];

    $(".say, .progress").hide();
    $("#yourTurn").hide();
    $(".time").show().html("准备");
    
    setTimeout(function () { 
        alreadyCheck = false;
        sequence = [];
        while (sequence.length < 4) {
            var nA = randomNum(0, 3);
            if ($.inArray(nA, sequence) >= 0)
                continue;
            else
                sequence.push(nA);
        }
        var now = Date.now();
        timeleftID = setInterval(function () {
            var timeleft = play_TotalTime - parseInt((Date.now() - now) / 1000);
            $(".time").show().html(timeleft);
            if (timeleft < 0) {
                if (alreadyCheck == false) {
                    enablePress = false;
                    finalCheck(userPress);
                }
                clearInterval(timeleftID);
                $(".time").hide();
            }
        }, 100);
        timeID = setInterval(function () {
            if (play_date != null) {
                var time = Date.now() - play_date;
                var seconds = parseFloat(time / 1000 % 60);
                if (seconds >= 3.5) {
                    $("#say" + sequence[play_count] + "_container").hide();
                }
                if (play_count == sequence.length) {
                    clearInterval(timeID);
                    yourTurn();
                    return;
                }
                if (seconds < 4.5) return;
            }
            play_count++;
            play_date = Date.now();
            $("#say" + sequence[play_count] + "_container").show();
        }, 10);
    }, 2000);
}

var userPress = [];
var alreadyCheck = false;
function yourTurn() {
    $("#yourTurn").show();
    enablePress = true;
     
    $(document).keypress(function (event) {
        if (enablePress)
            enablePress = false;
        else
            return;

        if (event.keyCode == 49 || event.keyCode == 50 || event.keyCode == 51 || event.keyCode == 52) {
            $("#progress_container").show();
            userPress.push(event.keyCode - 49);

            gifProgress.move_to(0);
            gifProgress.play();
            setTimeout(function () {
                if (userPress.length >= 4) {
                    enablePress = false;
                    finalCheck(userPress);
                }
                else {
                    enablePress = true;
                }
            }, 2600);
        }
        else {
            enablePress = true;
        }
    });
}

function finalCheck(userPress) {

        if (userPress.length != 4)
            youLost("失败！你个憨批");
        else if (fans == true && (userPress[0] == sequence[0] &&
                        userPress[1] == sequence[1] &&
                        userPress[2] == sequence[2] &&
                        userPress[3] == sequence[3])) {
            alert("成功！");
        }
        else if (fans == false && (userPress[0] == sequence[3] &&
                                    userPress[1] == sequence[2] &&
                                    userPress[2] == sequence[1] &&
                                    userPress[3] == sequence[0])) {
            alert("成功！");
        }
        else {
            youLost("失败！你个憨批");
        }
        alreadyCheck = true;
    
}

function youLost(msg) {
    alert(msg);
}

function drawBg(fans) {
    ctxBg.clearRect(0, 0, winWidth, winHight);

    var imgBg = new Image();

    if (fans == true) 
        imgBg.src = "imgs/TrueBackground.png";
    else
        imgBg.src = "imgs/FalseBackgroud.png";


    imgBg.onload = function () {
        ctxBg.drawImage(imgBg, 0, 0);
    }

}



//生成从minNum到maxNum的随机数
function randomNum(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
            break;
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
            break;
        default:
            return 0;
            break;
    }
}