// 宣告表格變數與遊戲狀態變數
let table;                     // 用來存放從 Google 試算表讀取的 CSV 表格資料
let questions = [];            // 存放從題庫中隨機抽出的 5 道題目
let currentQuestion = 0;       // 目前作答到第幾題的索引
let score = 0;                 // 累計答對的題數
let selectedOption = null;     // 玩家目前點選的選項索引
let isAnswered = false;        // 記錄當前題目是否已經作答
let quizCompleted = false;     // 記錄是否已經完成所有測驗

let nextButton;                // 宣告「下一題」按鈕變數

// 請將下方引號內的網址替換成你的 Google 試算表 CSV 匯出連結
let sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSiq28I9PN9gdqEJcBPbORrpVqQ2a3omycEqgQH77SSwJxlXLrIP0Dx_a0TnsoymKl8NDiq1n_thGPg/pub?gid=240720359&single=true&output=csv';

function preload() {
  // 動態載入 Google Fonts：Noto Serif TC (中文) 與 Isometra (英文)
  let fontLink = document.createElement('link');
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Isometra&family=Noto+Serif+TC:wght@200..900&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);

  // 直接從線上 Google 試算表讀取遠端 CSV 資料（包含標題列）
  table = loadTable(sheetURL, 'csv', 'header');
}

function setup() {
  // 建立佔滿整個瀏覽器視窗的全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 將載入的 Google 試算表表格資料轉換為 JavaScript 物件陣列
  let allQuestions = [];
  for (let i = 0; i < table.getRowCount(); i++) {
    let q = {
      question: table.getString(i, 'question'),
      options: [
        table.getString(i, 'opt0'),
        table.getString(i, 'opt1'),
        table.getString(i, 'opt2'),
        table.getString(i, 'opt3')
      ],
      answer: int(table.getString(i, 'answer')) // 將字串答案轉為整數
    };
    allQuestions.push(q);
  }
  
  // 隨機打亂題庫順序，並從中抽出前 5 題
  allQuestions = shuffle(allQuestions);
  questions = allQuestions.slice(0, 5);
  
  // 建立「下一題」按鈕並設定其樣式與初始位置
  nextButton = createButton('下一題');
  nextButton.position(width / 2 - 60, height - 120);
  nextButton.size(120, 45);
  nextButton.style('font-family', '"Noto Serif TC", "Isometra", serif');
  nextButton.style('font-size', '16px');
  nextButton.style('background-color', '#ffffff');
  nextButton.style('border', '2px solid #333333');
  nextButton.style('border-radius', '8px');
  nextButton.style('cursor', 'pointer');
  nextButton.hide(); // 剛開始作答時先隱藏按鈕
  
  // 設定按鈕點擊時觸發的函式
  nextButton.mousePressed(handleNextQuestion);
}

function draw() {
  // 設定畫布的背景顏色
  background(250, 250, 248);
  
  // 判斷測驗是否已經全部結束
  if (quizCompleted) {
    drawCompletionScreen(); // 顯示結算畫面
  } else {
    drawQuizScreen();       // 顯示測驗題目與選項
  }
}

// 繪製測驗作答畫面
function drawQuizScreen() {
  // 如果題庫尚未讀取完成或發生錯誤防範
  if (questions.length === 0) return;
  
  let q = questions[currentQuestion];
  
  // 顯示目前的題數進度（英文採用 Isometra 字型）
  push();
  textSize(16);
  fill(120);
  textFont('Isometra');
  text(`Question ${currentQuestion + 1} / ${questions.length}`, 60, 80);
  pop();
  
  // 顯示目前的題目文字（中文採用 Noto Serif TC 字型）
  push();
  textSize(24);
  fill(40);
  textFont('Noto Serif TC');
  textStyle(BOLD);
  text(q.question, 60, 130, width - 120); // 設定自動換行寬度
  pop();
  
  // 定義四個選項按鈕的繪製參數
  let startY = 240;
  let boxHeight = 65;
  let boxSpacing = 20;
  
  // 迴圈繪製四個選項
  for (let i = 0; i < q.options.length; i++) {
    let boxY = startY + i * (boxHeight + boxSpacing);
    let isHovered = mouseX > 60 && mouseX < width - 60 && mouseY > boxY && mouseY < boxY + boxHeight;
    
    // 初始化選項的背景色與外框色
    let fillColorValue = color(255);
    let strokeColorValue = color(210);
    
    // 當題目已經作答時的顏色邏輯
    if (isAnswered) {
      if (selectedOption !== q.answer && i === q.answer) {
        // 答錯時：在正確選項上加上指定背景顏色 #606c38
        fillColorValue = color(96, 108, 56);
        strokeColorValue = color(50);
      } else if (selectedOption === q.answer && i === q.answer) {
        // 答對時：正確選項顯示綠色提示
        fillColorValue = color(140, 180, 130);
        strokeColorValue = color(96, 108, 56);
      } else if (i === selectedOption && selectedOption !== q.answer) {
        // 玩家點錯的選項顯示灰色背景
        fillColorValue = color(220, 220, 220);
        strokeColorValue = color(150);
      }
    } else if (isHovered) {
      // 滑鼠懸停時的互動背景色
      fillColorValue = color(240, 240, 235);
      strokeColorValue = color(120);
    }
    
    // 繪製選項的外框與背景矩形
    push();
    fill(fillColorValue);
    stroke(strokeColorValue);
    strokeWeight(2);
    rect(60, boxY, width - 120, boxHeight, 10);
    pop();
    
    // 顯示選項的文字內容（程式指令採用 Isometra 字型）
    push();
    textSize(20);
    textFont('Isometra');
    // 如果因為答錯導致背景變為 #606c38，文字改為白色以確保清晰
    if (isAnswered && selectedOption !== q.answer && i === q.answer) {
      fill(255);
    } else {
      fill(40);
    }
    noStroke();
    text(`${String.fromCharCode(65 + i)}.  ${q.options[i]}`, 90, boxY + 41);
    pop();
  }
}

// 繪製最終結算畫面
function drawCompletionScreen() {
  push();
  textAlign(CENTER, CENTER);
  
  // 顯示測驗完成標題
  textSize(36);
  textFont('Noto Serif TC');
  textStyle(BOLD);
  fill(40);
  text("測驗已完成！", width / 2, height / 2 - 80);
  
  // 顯示總答對題數結果
  textSize(24);
  textFont('Noto Serif TC');
  fill(80);
  text(`你總共答對了 ${score} 題（滿分 ${questions.length} 題）`, width / 2, height / 2 - 10);
  
  // 顯示評語
  textSize(18);
  textFont('Noto Serif TC');
  fill(120);
  if (score === questions.length) {
    text("太棒了！你對 p5.js 已經非常熟悉！", width / 2, height / 2 + 50);
  } else {
    text("再接再厲！多練習幾次就會更熟練喔！", width / 2, height / 2 + 50);
  }
  pop();
  
  // 結算畫面上隱藏下一題按鈕
  nextButton.hide();
}

// 滑鼠點擊事件：偵測玩家點選選項
function mousePressed() {
  // 如果題庫未載入、已經作答或測驗已結束，則不重複處理點擊
  if (questions.length === 0 || isAnswered || quizCompleted) return;
  
  let startY = 240;
  let boxHeight = 65;
  let boxSpacing = 20;
  let q = questions[currentQuestion];
  
  // 檢查滑鼠是否點擊在任一選項範圍內
  for (let i = 0; i < q.options.length; i++) {
    let boxY = startY + i * (boxHeight + boxSpacing);
    
    if (mouseX > 60 && mouseX < width - 60 && mouseY > boxY && mouseY < boxY + boxHeight) {
      selectedOption = i;
      isAnswered = true;
      
      // 判斷是否答對並累加分數
      if (selectedOption === q.answer) {
        score++;
      }
      
      // 根據是否為最後一題來變更按鈕文字並顯示按鈕
      if (currentQuestion === questions.length - 1) {
        nextButton.html('查看結算結果');
      } else {
        nextButton.html('下一題');
      }
      nextButton.show();
      break;
    }
  }
}

// 點擊「下一題」按鈕後的處理函式
function handleNextQuestion() {
  currentQuestion++;
  isAnswered = false;
  selectedOption = null;
  nextButton.hide();
  
  // 檢查是否超過總題數，若超過則標記測驗完成
  if (currentQuestion >= questions.length) {
    quizCompleted = true;
  }
}

// 當瀏覽器視窗大小改變時自動調整畫布與按鈕位置
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  nextButton.position(width / 2 - 60, height - 120);
}