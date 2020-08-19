var quizTimer = 60;
var Android;


var quizStarted = false;

var apptitle = "webquiz";
var appData = {
	title : apptitle,
	score : 0,
	highscore : 0
};

if(localStorage.getItem(appData.title) === null){
	saveData();
}

appData = JSON.parse(localStorage.getItem(appData.title));

function saveData(){
	localStorage.setItem(appData.title, JSON.stringify(appData));
}

var correctS, wrongS, tickS, timesoverS;
$("document").ready(function(){
	firstPage();
	correctS = new Howl({
		src: ["correct.mp3"]
	});
	wrongS = new Howl({
		src: ["wrong.mp3"]
	});
	tickS = new Howl({
		src: ["tick.mp3"]
	});
	timesoverS = new Howl({
		src: ["timesover.mp3"]
	});
});

function firstPage(){
	$("#quizholder").html("<h2>Are you ready?</h2><p>You have limited time to answer as many questions as possible.</p><button onclick='startGame()'>Start!</button>");
}

function gameoverPage(){
	quizStarted = false;
	$("#quizholder").html("<h2>Time is over.</h2><p>Score:</p><p style='font-size: 35px; text-align: center'>" +appData.score+ "</p><div style='text-align: center'><button onclick='restart()'>Back</button></div>");
}

function restart(){
	location.href = "index.html";
}

var time = quizTimer;
var timer;
function startTimer(){
	time = quizTimer;
	updateTimerAndScore();
	timer = setInterval(function(){
		if(!paused){
			updateTimerAndScore();
			tickS.play();
			if(time < 1){
				$(".choice").prop('onclick',null).off('click');
				endGame();
				gameoverPage();
				showAlert("Waktu telah habis.");
				timesoverS.play();
			}
			time -= 1;
		}
	}, 1000);
}

var paused = false;
function pauseGame(){
	paused = true;
}
function resumeGame(){
	paused = false;
}

function updateTimerAndScore(){
	$("#timer").html(time);
	$("#score").html(appData.score);
	$("#highscore").html(appData.highscore);
}

function endGame(){
	clearInterval(timer);
	$("#scoreholder").fadeOut(300);
	quizStarted = false;
	if(appData.score > appData.highscore){
		appData.highscore = appData.score;
		//leaderboard
		try {
			cl.update(appData.highscore)
		} catch (e) {
			console.log(e)
		}
	}
}

function flash(n){
	if(n == 0){
		$("#flasher").css({"background-color" : "red"}).fadeIn(100, function(){
			$("#flasher").fadeOut(500);
		});
	}else{
		$("#flasher").css({"background-color" : "lime"}).fadeIn(100, function(){
			$("#flasher").fadeOut(500);
		});
	}
}

var currentQuestion;
function showQuestion(){
	if(quizStarted){
		var randomQ = requestRandomQ();
		currentQuestion = randomQ;
		if(qst.length > 0){
			if(navigator.onLine){
				var question = qst[randomQ].q;
				var answers = "<div id='choices'>";
				var ansArray = [];
				for(var i = 0; i < qst[randomQ].a.length; i ++){
					var clickF;
					if(qst[randomQ].ca == i+1)
						clickF = "id='correctAnswer' onclick='userAnswer(1)'";
					else 
						clickF = "onclick='userAnswer(0)'";
					ansArray.push("<div class='choice' " +clickF+ ">" + qst[randomQ].a[i] + "</div>");
				}
				ansArray = shuffle(ansArray);
				for(var i = 0; i < ansArray.length; i++){
					answers += ansArray[i];
				}
				answers += "</div>";
				$("#quizholder").html(question + answers);
				$("#quizholder").fadeIn(300);
			}
		}else{
			$("#quizholder").html("<p align='Center'>Great! You answered all the questions.</p><div style='text-align: center'><button onclick='restart()'>Back</button></div>");
			$("#quizholder").fadeIn(300);
			endGame();
		}
	}else{
		endGame();
	}
}

function startGame(){
	quizStarted = true;
	$("#quizholder").fadeOut(300, function(){
		appData.score = 0;
		saveData();
		showQuestion();
		startTimer();
		$("#scoreholder").fadeIn(300);
	});
}

function requestRandomQ(){
	return Math.floor(Math.random()*qst.length);
}

function userAnswer(n){
	if(n == 1){
		showAlert("Correct!");
		flash(1);
		appData.score += 10;
		if(appData.score > appData.highscore){
			appData.highscore = appData.score;
			//leaderboard
			try {
				cl.update(appData.highscore)
			} catch (e) {
				console.log(e)
			}
		}
		saveData();
		$("#score").html(appData.score);
		qst.splice(currentQuestion, 1);
		$("#quizholder").fadeOut(300, function(){
			showQuestion();
		});
		correctS.play();
	}else{
		showAlert("Wrong!");
		flash(0);
		appData.score -= 3;
		if(appData.score < 0) appData.score = 0;
		saveData();
		$("#score").html(appData.score);
		$("#correctAnswer").css({"background-color" : "green", "color" : "white"});
		$(".choice").prop('onclick',null).off('click');
		setTimeout(function(){
			showQuestion();
		}, 1500);
		wrongS.play();
	}	
}

var drawerShown = false;
function showDrawer(){
	if(!drawerShown){
		$("#drawer").animate({ left : "0px" });
		$("#mainscreen").animate({ left : "250px", right : "-250px"});
		drawerShown = true;
	}else{
		$("#mainscreen").animate({ left : "0px", right : "0px" });
		$("#drawer").animate({ left : "-250px" });
		drawerShown = false;
	}
}

function showAlert(msg){
	$("#notification").html(msg);
	$("#notification").fadeIn(300);
	setTimeout(function(){
		$("#notification").fadeOut(300);
	}, 1500);
}

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;
	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

setTimeout(function(){
	$("#mainscreen").css({ "height" : innerHeight - 150, "overflow" : "auto" });
}, 50);