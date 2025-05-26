let video;
let facemesh;
let handpose;
let predictions = [];
let handPredictions = [];
let targetPoint = 'forehead'; // 預設圓圈位置為額頭
let img; // 用於存放 3.png 的變數
let maskImg; // 用於存放面具圖片的變數

function preload() {
  img = loadImage('3.png'); // 載入 3.png 圖片
  maskImg = loadImage('libraries/3.png'); // 載入面具圖片
}

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // 初始化 FaceMesh
  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  // 初始化 Handpose
  handpose = ml5.handpose(video, modelReady);
  handpose.on('predict', results => {
    handPredictions = results;
  });
}

function modelReady() {
  console.log('Model Loaded!');
}

function draw() {
  image(video, 0, 0, width, height);

  // 繪製臉部辨識的圓圈
  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    let x, y;
    if (targetPoint === 'forehead') {
      [x, y] = keypoints[10]; // 額頭
    } else if (targetPoint === 'leftEye') {
      [x, y] = keypoints[33]; // 左眼
    } else if (targetPoint === 'rightEye') {
      [x, y] = keypoints[263]; // 右眼
    } else if (targetPoint === 'leftCheek') {
      [x, y] = keypoints[234]; // 左臉頰
    } else if (targetPoint === 'rightCheek') {
      [x, y] = keypoints[454]; // 右臉頰
    }

    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    ellipse(x, y, 50, 50);
  }

  // 手勢辨識邏輯
  if (handPredictions.length > 0) {
    const landmarks = handPredictions[0].landmarks;

    // 簡單的剪刀石頭布邏輯
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];

    const distanceThumbIndex = dist(thumbTip[0], thumbTip[1], indexTip[0], indexTip[1]);
    const distanceIndexMiddle = dist(indexTip[0], indexTip[1], middleTip[0], middleTip[1]);

    if (distanceThumbIndex < 30 && distanceIndexMiddle > 50) {
      targetPoint = 'forehead'; // 石頭 -> 額頭
    } else if (distanceThumbIndex > 50 && distanceIndexMiddle > 50) {
      targetPoint = 'leftEye'; // 剪刀 -> 左眼
      image(maskImg, 200, 100, 200, 200); // 顯示面具圖片
    } else if (distanceThumbIndex > 50 && distanceIndexMiddle < 30) {
      targetPoint = 'rightCheek'; // 布 -> 右臉頰
      image(img, 10, 10, 100, 100); // 顯示 3.png 圖片
    }
  }
}
