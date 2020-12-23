/// <reference path="jquery.min.js" />
/// <reference path="layer.min.js" />

var winWidth, winHight, singleStar,
    canvasMain, canvasBg, canvasMouse,
    ctxMain, ctxBg, ctxMouse,
    starPoints, name, stars,
    groupName, cha_count, left_time, practiseType;
groups = ["白虎", "青龙", "朱雀", "玄武"];

$(document).ready(function () {
    starPoints = [];
    cha_count = 3;
    left_time = 40;
    singleStar = document.getElementById("star");
    if (document.location.search.indexOf("draw") > -1)
        $("#btnDraw").show();
    //try {
    //    var strJson = localStorage["stars"];
    //    stars = JSON.parse(strJson);

    //    initSmallImg();
    //}
    //catch (ex) {
    $.getJSON("stars.json", function (result) {
        stars = result;
        initSmallImg();
    });

    //}
    winWidth = $(window).width();
    winHight = $(window).height();
    if(winWidth > 1680) {
      $(".pratise_times").css("right","280px");
      $(".copyright").css("right","280px");
    }


    canvasMouse = document.getElementById("mouse");
    ctxMouse = canvasMouse.getContext("2d");
    canvasMouse.width = winWidth;
    canvasMouse.height = winHight;

    canvasMain = document.getElementById("main");
    ctxMain = canvasMain.getContext("2d");
    canvasMain.width = winWidth;
    canvasMain.height = winHight;

    canvasBg = document.getElementById("bg");
    ctxBg = canvasBg.getContext("2d");
    canvasBg.width = winWidth;
    canvasBg.height = winHight;

    drawBg();
    $("#btnClear").click(clear);
    $("#btnDraw").click(draw);
    $("#btnNext").click(drawNext);
    $("#btnCompleted").click(drawCompleted);
    $("#btnPractise").click(practiseRandom);
    $("#btnPractiseSingle").click(function () {
        practiseSingle(name);
    });
    $("#btnCancel").click(function () {
        $("#demoStar").hide();
        $("#smallMap").show();
        canvasMouse.onmousemove = null;
        canvasMouse.onclick = null;
        ctxMouse.clearRect(0, 0, winWidth, winHight);
        ctxMain.clearRect(0, 0, winWidth, winHight);
        swichOptBar("type");
    });
    $("#btnPratiseCancel").click(function () {
        clearInterval(timer2);
        clear();
        practiseType = null;
        timer2 = null;
        canvasMouse.onmousemove = null;
        canvasMouse.onclick = null;
        ctxMouse.clearRect(0, 0, winWidth, winHight);
        ctxMain.clearRect(0, 0, winWidth, winHight);
        $(".pratise_times span[name=times]").text("");
        $(".pratise_times span[name=count]").text("");
        $("#demoStar").hide();
        $("#smallMap").show();
        $("#btnPractiseSingle").hide();
        swichOptBar("type");
    });
    

});
var timer = null;
function initSmallImg() {
    stars.sort(function (a, b) {
        if (a.groupName != b.groupName) return -1;
        else return 0;
    });

    var $imgBar = $("#smallMap");
    $imgBar.html("");
    for (var n = 0; n < groups.length; n++) {
        var gn = groups[n];
        var divRow = document.createElement("div");
        divRow.className = "img_row";


        for (var i = 0; i < stars.length; i++) {
            var sName = stars[i].name;
            var gpName = stars[i].groupName;

            if (gpName != gn) continue;

            var divContainer = document.createElement("div");
            divContainer.className = "img_container";

            var label = document.createElement("span");
            label.className = "img_name";
            label.innerText = gpName + " • " + sName;
            var oImg = new Image();
            oImg.src = "small/" + gpName + "/" + sName + ".jpg";
            oImg.setAttribute("sName", sName);
            oImg.setAttribute("gpName", gpName);

            divContainer.appendChild(label);
            divContainer.appendChild(oImg);
            divContainer.onclick = function () {
                var sName = $(this).find("img[sName]").attr("sName");
                var gpName = $(this).find("img[sName]").attr("gpName");
                $("#btnPractiseSingle").show();
                drawDemo(gpName, sName);
            }
            divRow.appendChild(divContainer);
        }
        $imgBar.append(divRow);
        
    }

    $("#smallMap").on("mouseover", function () {
        if (timer != null) clearTimeout(timer);
        if ($(this).width() < 200)
            $(this).animate({ width: 118 * 3 + "px", height: 64 * 4 + "px" });
    });
    $("#smallMap").on("mouseout", function () {
        var $this = $(this);
        timer = setTimeout(function () {
            $this.animate({ width: '118px', height: '64px' });
            timer = null;
        }, 100);
    });

}

var timer2
function practiseRandom() {
    var nNum = randomNum(0, stars.length - 1);
    var oStar = stars[nNum];
    practiseSingle(oStar.name);
    practiseType = "Random";
}

function practiseSingle(sname) {
    practiseType = "Single";
    cha_count = 3;
    left_time = 40;
    $(".pratise_times span[name=times]").text("时间: " + left_time);
    $(".pratise_times span[name=count]").text("次数: " + cha_count);
    if (timer2 == null) {
        timer2 = setInterval(function () {
            left_time--;
            $(".pratise_times span[name=times]").text("时间: " + left_time);
            if (left_time < 0) {
                layer.msg("时间到啦！下一个！", {
                    icon: 5, time: 1500, end: function () {
                        if (practiseType == "Single")
                            practiseSingle(name);
                        else
                            practiseRandom();
                    }
                });
            }

        }, 1 * 1000);
    }
    if (stars == null || stars.length == 0) throw "没有星位数据，无法初始化点位";
    swichOptBar("pratise");
    var nNum = null;

    for (var i = 0; i < stars.length; i++) {
        if (sname == stars[i].name) {
            nNum = i;
            break;
        }
    }
    if (nNum == null) throw "没有找到对应星位数据，无法初始化点位";

    var oStar = stars[nNum];

    name = oStar.name;
    groupName = oStar.groupName;
    starPoints = JSON.parse(JSON.stringify(oStar.points));
    

    


    var nA = randomNum(0, starPoints.length - 1);
    var missStar = starPoints[nA];

    starPoints.splice(nA, 1);

    if (oStar == null) throw "没有找到对应的星位数据，无法绘制";

    drawBg(groupName);
    drawPoints(starPoints);

    initSmallDemoStar(groupName, name);

    canvasMouse.onmousemove = function (e) {
        var x = e.offsetX;
        var y = e.offsetY;

        ctxMouse.clearRect(0, 0, winWidth, winHight);
        ctxMouse.drawImage(singleStar, x - singleStar.width / 2, y - singleStar.height / 2, singleStar.width, singleStar.height);
    };

    canvasMouse.onclick = function (e) {
        var x = e.offsetX;
        var y = e.offsetY;
        var dx = missStar.x - x;
        var dy = missStar.y - y;

        dx = dx < 0 ? dx * -1 : dx;
        dy = dy < 0 ? dy * -1 : dy;

        var rulld = 20

        if (dx >= 0 && dx <= rulld && dy >= 0 && dy <= rulld) {
            ctxMain.drawImage(singleStar, x - singleStar.width / 2, y - singleStar.height / 2, singleStar.width, singleStar.height);
            starPoints.push({ x: x, y: y });

            layer.msg("哦吼！不错哟！靓仔", {
                icon: 1,
                time: 1500,
                end: function () {
                    if (practiseType == "Single")
                        practiseSingle(name);
                    else
                        practiseRandom();
                }
            });
            
        }
        else {
            cha_count--;
            $(".pratise_times span[name=count]").text("次数: " + cha_count);
            if (cha_count == 0) {
                layer.msg("你个憨批！不对！没机会了，换一个！", {
                    icon: 5, time: 1500, end: function () {
                        if (practiseType == "Single")
                            practiseSingle(name);
                        else
                            practiseRandom();
                    }
                });
            }
            else {
                layer.msg("你个憨批！不对！", { icon: 5, time: 1500 });
            }
        }
    }
    
}

function initSmallDemoStar(group, name) {
    var divContainer = document.createElement("div");
    divContainer.className = "img_container";

    var label = document.createElement("span");
    label.className = "img_name";
    label.innerText = group + " • " + name;
    var oImg = new Image();
    oImg.src = "small/" + group + "/" + name + ".jpg";
    oImg.setAttribute("gpName", group);
    oImg.setAttribute("sName", name);


    divContainer.appendChild(label);
    divContainer.appendChild(oImg);
    divContainer.onclick = function () {
        var sName = $(this).find("img[sName]").attr("sName");
        var gpName = $(this).find("img[sName]").attr("gpName");
        layer.photos({
            photos: {
                title: gpName + " • " + sName,
                id: 123,
                start: 0,
                data: [
                    {
                        alt: gpName + " • " + sName,
                        pid: 1,
                        src: "big/" + gpName + "/" + sName + ".jpg",
                        thumb: "small/" + gpName + "/" + sName + ".jpg",
                    }
                ]
            },
            anim: 0,
            shadeClose: true,
            area: [winWidth * 0.8 + "px", winHight * 0.8 + "px"]
        });
    }
    $("#smallMap").hide();
    $("#demoStar").show();
    $("#demoStar").html("");
    $("#demoStar").append(divContainer);
}

function drawNext() {
    drawCompleted();
    newStar();
}

function drawCompleted() {
    var obj = { name: name, groupName: groupName, points: starPoints };
    for (var i = 0; i < stars.length; i++) {
        if (stars[i].name == name && groupName == stars[i].groupName) {
            stars.splice(i, 1);
            break;
        }
    }
    stars.push(obj);
    starPoints = [];
    clear();
    var strJson = JSON.stringify(stars);
    localStorage.setItem("stars", strJson);
}

function newStar(fn) {
    var html = $("#tmpAlert").html();

    //$html.find("#btnAlertOK").click(function () { alert("1"); });
    //$html.find("#btnAlertClose").click(function () { alert("1"); });

    layer.open({
        type: 1,
        skin: 'layui-layer-demo', //样式类名
        closeBtn: 0, //不显示关闭按钮
        anim: 2,
        shadeClose: true, //开启遮罩关闭
        area: ['450px', '250px'],
        content: html,
        success: function (obj, index) {
            $(obj).find("#btnAlertOK").click(function () {
                var sName = $(obj).find("#starName").val();
                var gpName = $("select").find("option:selected").parent().attr("label");

                groupName = gpName;
                name = sName;

                initSmallDemoStar(gpName, sName);
                drawBg(groupName);
                clear();
                if (fn != null) fn();
                layer.closeAll();
            });
            $(obj).find("#btnAlertClose").click(function () {
                layer.closeAll();
            });
        }
    });
}


///////画板///////



function clear() {
    starPoints = [];
    ctxMain.clearRect(0, 0, winWidth, winHight);
}

function swichOptBar(t) {
    if (t == "type") {
        $("#div_type").show();
        $("#div_pratise").hide();
        $("#div_draw").hide();
    }
    else if (t == "pratise") {
        $("#div_pratise").show();
        $("#div_type").hide();
        $("#div_draw").hide();
    }
    else if (t == "draw") {
        $("#div_draw").show();
        $("#div_type").hide();
        $("#div_pratise").hide();
    }
}

function draw() {

    newStar(function () {

        swichOptBar("draw");
        canvasMouse.onmousemove = function (e) {
            var x = e.offsetX;
            var y = e.offsetY;

            ctxMouse.clearRect(0, 0, winWidth, winHight);
            ctxMouse.drawImage(singleStar, x - singleStar.width / 2, y - singleStar.height / 2, singleStar.width, singleStar.height);
        };

        canvasMouse.onclick = function (e) {
            var x = e.offsetX;
            var y = e.offsetY;
            ctxMain.drawImage(singleStar, x - singleStar.width / 2, y - singleStar.height / 2, singleStar.width, singleStar.height);
            starPoints.push({ x: x, y: y });
        }
    });
}

function drawStar(sname) {
    var starCurrent = null;
    for (var i = 0; i < stars.length; i++) {
        if (stars[i].name == sname) {
            starCurrent = stars[i];
            break;
        }
    }

    if (starCurrent == null) throw "没有找到对应的星位数据，无法绘制";

    name = starCurrent.name;
    groupName = starCurrent.groupName;

    drawBg(starCurrent.groupName);
    drawPoints(starCurrent.points);
}

function drawDemo(group, sname) {
    ctxBg.clearRect(0, 0, winWidth, winHight);
    name = sname;
    groupName = group;
    var imgBg = new Image();

    imgBg.src = "big/" + group + "/" + sname + ".jpg";

    imgBg.onload = function () {
        ctxBg.drawImage(imgBg, 0, 0);
        $("#btnPractiseSingle").show();
    }
}

function drawBg(group) {
    ctxBg.clearRect(0, 0, winWidth, winHight);

    var imgBg = new Image();

    if (group == null) {
        var nNum = randomNum(0, 3);
        groupName = groups[nNum];
        imgBg.src = "bg/" + groupName + ".jpg";
    }
    else {
        imgBg.src = "bg/" + group + ".jpg";
    }

    imgBg.onload = function () {
        ctxBg.drawImage(imgBg, 0, 0);
    }
}

function drawPoints(points) {
    if (points == null || points.length == 0) throw "没有星位数据，无法绘制点位";
    clear();

    for (var i = 0; i < points.length; i++) {
        var x = points[i].x;
        var y = points[i].y;

        ctxMain.drawImage(singleStar, x - singleStar.width / 2, y - singleStar.height / 2, singleStar.width, singleStar.height);
    }
}


CanvasRenderingContext2D.prototype.drawCycle = function (x, y, w) {
    this.beginPath();
    this.arc(x, y, w, 0, Math.PI * 2, true);
    this.closePath();
    this.fillStyle = 'green';
    this.fill();
}

CanvasRenderingContext2D.prototype.drawImageAlpha = function (image, x, y, alpha) {
    // 绘制图片
    this.drawImage(image, x, y);
    // 获取从x、y开始，宽为image.width、高为image.height的图片数据
    // 也就是获取绘制的图片数据
    var imgData = this.getImageData(x, y, image.width, image.height);
    for (var i = 0, len = imgData.data.length ; i < len ; i += 4) {
        // 改变每个像素的透明度
        imgData.data[i + 3] = imgData.data[i + 3] * alpha;
    }
    // 将获取的图片数据放回去。
    this.putImageData(imgData, x, y);
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