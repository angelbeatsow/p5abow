let touch = { x: 0, y: 0, type: null };
const bricks = ["赤", "青", "緑", "黄", "紫", "桃"];
const colors = {
  赤: "rgb(240,110,110)",
  青: "rgb(120,120,255)",
  緑: "rgb(140,200,50)",
  黄: "rgb(250,250,40)",
  紫: "rgb(200,100,240)",
  桃: "rgb(250,190,190)",
};
let selectedBricks = []; //ブロック座標の配列をいれる。[縦,横]
let selectedColor = "";
const fallSpead = 8; //ブロックの落下速度
let bricksSettei = {
  赤: true,
  青: true,
  緑: true,
  黄: true,
  紫: true,
  桃: true,
};

function resetFunction(){
  //bricksSetteiのtrueが２つ以上か
  let _num = 0;
  let _bricks = [];
  for (_b of bricks) {
    if (bricksSettei[_b]) {
      _num++;
      _bricks.push(_b);
    }
  }
  if (_num <= 1) {
    window.alert("ブロックを２つ以上設定してください");
    return;
  }
  let _con = window.confirm("リセットしますか?");
  if (_con == false) return;
  //リセットする
  game.reset(_bricks);
}

function randomNum(_min = 0, _max = 10) {
  return Math.floor(Math.random() * (_max + 1 - _min) + _min);
}

function setup() {
  window.addEventListener(
    "touchstart",
    function (event) {
      event.preventDefault();
    },
    { passive: false }
  );
  window.addEventListener(
    "touchmove",
    function (event) {
      event.preventDefault();
    },
    { passive: false }
  );

  createCanvas(300, 400);

  //ボタン作成
  for (let _b = 0; _b < bricks.length; _b++) {
    let _button = createButton(bricks[_b]);
    _button.position(width - 40, 10 + 30 * _b);
    _button.value = bricks[_b];
    _button.touchStarted(() => {
      bricksSettei[_button.value] = !bricksSettei[_button.value];
    });
  }
  let resetButton = createButton("リセット");
  resetButton.position(width - 140, 10);
  resetButton.touchStarted(resetFunction);
}

class Game {
  constructor() {
    this.score = 0;
    this.time = 0;
    this.timerFlag = true;
    this.rapScore = [];
    this.rapInterval = 300; //msごと
    this.bricks = [].concat(bricks);

    this.timerIntervalFunc();
  }

  scorePlus(_num) {
    this.score += _num;
  }

  reset(_bricks = this.bricks) {
    this.bricks = [].concat(_bricks);
    puzzle.bricks = [].concat(this.bricks);
    puzzle.banmenSet();
    puzzle.refresh();
    this.time = 0;
    this.score = 0;
    this.rapScore = [];
  }

  returnTimeText() {
    let _byou = Math.floor(this.time / 10);
    let _hun = Math.floor(_byou / 60);
    if (_hun < 10) _hun = "0" + _hun;
    _byou = _byou % 60;
    if (_byou < 10) _byou = "0" + _byou;
    let _syousuuByou = this.time % 10;
    return _hun + ":" + _byou + "." + _syousuuByou;
  }

  timerIntervalFunc() {
    let _timer = setInterval(() => {
      this.time += 1;
      if (this.time % this.rapInterval == 0) this.rapScore.push(this.score);
      if (this.timerFlag == false) {
        clearInterval(_timer);
      }
    }, 100);
  }
}

let game = new Game();


class Puzzle {
  constructor(_bricks = [].concat(bricks)) {
    this.diameter = 30; //ブロックの直径
    this.bricks = _bricks;
    this.banmen = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ];
    this.banmen2 = []; //描画用
    this.fall = []; //落下の処理用
    for (let i = 0; i < this.banmen.length; i++) {
      this.banmen2.push([].concat(this.banmen[0]));
      this.fall.push([].concat(this.banmen[0]));
    }
    this.maxfall = 0;
    this.nowfall = 0;
    this.fallFlag = false; //this.banmen2をthis.banmenと同期させる時に使用

    this.banmenSet(this.bricks);
    this.hanteiPoints = [[], [], [], [], [], [], [], [], [], [], [], []]; //draw時に一度だけ設定。ブロックの中心の座標を入れる。
    this.hanteiPointsFlag = false;
  }

  banmenSet(_bricks = [].concat(this.bricks)) {
    for (let n = 0; n < this.banmen.length; n++) {
      for (let m = 0; m < this.banmen[n].length; m++) {
        let _brick = _bricks[randomNum(0, _bricks.length - 1)];
        this.banmen[n][m] = _brick;
        this.banmen2[n][m] = _brick;
      }
    }
  }

  returnTouchingBrick() {
    for (let n = 6; n < this.hanteiPoints.length; n++) {
      //下半分のみ
      for (let m = 0; m < this.hanteiPoints[n].length; m++) {
        //ブロックの中心とtouch座標との距離がブロック半径以下ならブロック座標を返す。ブロックをタッチしていないなら[-1,-1]を返す。
        let _kyori = Math.sqrt(
          (touch.x - this.hanteiPoints[n][m][0]) ** 2 +
            (touch.y - this.hanteiPoints[n][m][1]) ** 2
        );
        if (_kyori < this.diameter / 2) return [n, m];
      }
    }
    return [-1, -1];
  }

  touchEvent() {
    if (touch.type == "touchstart") {
      if (selectedBricks.length == 0 && this.maxfall == 0) {
        let _zahyou = this.returnTouchingBrick();
        if (_zahyou[0] >= 6) {
          //下半分のみ
          //ブロックがタッチされている
          selectedBricks.push([].concat(_zahyou));
          selectedColor = this.banmen[_zahyou[0]][_zahyou[1]];
        }
      }
    } else if (touch.type == "touchmove") {
      if (selectedBricks.length != 0) {
        let _zahyou = this.returnTouchingBrick();
        if (_zahyou[0] >= 6) {
          //下半分のみ
          //ブロックがタッチされている
          let _isSameColor =
            selectedColor == this.banmen[_zahyou[0]][_zahyou[1]];
          if (_isSameColor) {
            //同じ色
            let _isNew = true;
            for (let n = 0; n < selectedBricks.length; n++) {
              if (
                selectedBricks[n][0] == _zahyou[0] &&
                selectedBricks[n][1] == _zahyou[1]
              )
                _isNew = false;
            }
            if (_isNew) {
              //選択済みでない
              let _isTonari = false;
              let _lastZahyou = selectedBricks[selectedBricks.length - 1];
              if (
                Math.abs(_lastZahyou[0] - _zahyou[0]) <= 1 &&
                Math.abs(_lastZahyou[1] - _zahyou[1]) <= 1
              )
                _isTonari = true;
              if (_isTonari) {
                //隣り合う
                selectedBricks.push([].concat(_zahyou));
              }
            }
          }
        }
      }
    } else if (touch.type == "touchend") {
      if (selectedBricks.length >= 2 && this.fallFlag == false) {
        this.fallFlag = true;
        //スコアに加算
        let _scorePlus =
          (selectedBricks.length - 1) *
          10 *
          (1 + (selectedBricks.length - 2) / 10);
        game.scorePlus(_scorePlus);
        for (let _zahyou of selectedBricks) {
          //消えるブロックとその上にあるブロックすべてに対して、this.fallに加算
          for (let _h = 0; _h < _zahyou[0]; _h++) {
            this.fall[_h][_zahyou[1]] += this.diameter;
          }
        }
        //this.maxfallを更新
        for (let n = 0; n < this.fall.length; n++) {
          for (let m = 0; m < this.fall[n].length; m++) {
            this.maxfall = Math.max(this.maxfall, this.fall[n][m]);
          }
        }
        //this.banmenを変更
        //消えたブロックを無にする
        for (let _zahyou of selectedBricks) {
          this.banmen[_zahyou[0]][_zahyou[1]] = "無";
        }
        //無を上へ移動させる
        for (let c = 0; c < this.banmen.length - 1; c++) {
          //回数
          for (let n = 0; n < this.banmen.length; n++) {
            for (let m = 0; m < this.banmen[n].length; m++) {
              let _n = this.banmen.length - 1 - n;
              if (_n == 0) continue;
              if (this.banmen[_n][m] == "無") {
                //上と入れ換える
                this.banmen[_n][m] = this.banmen[_n - 1][m];
                this.banmen[_n - 1][m] = "無";
              }
            }
          }
        }
        //無に代入する
        for (let n = 0; n < this.banmen.length; n++) {
          for (let m = 0; m < this.banmen[n].length; m++) {
            if (this.banmen[n][m] == "無") {
              this.banmen[n][m] = this.bricks[
                randomNum(0, this.bricks.length - 1)
              ];
            }
          }
        }
      }

      if (selectedBricks.length == 1) {
        selectedBricks = [];
        selectedColor = "";
      }
    } //touchendの処理終了

    //this.banmen2の同期
    if (this.maxfall <= 0 && this.fallFlag) {
      this.refresh();
      for (let n = 0; n < this.banmen.length; n++) {
        this.banmen2[n] = [].concat(this.banmen[n]);
      }
    }
  }

  refresh() {
    selectedBricks = [];
    selectedColor = "";
    this.maxfall = 0;
    this.fallFlag = false;
    this.nowfall = 0;
    this.fall = [];
    for (let n = 0; n < this.banmen.length; n++) {
      let _arr = [];
      for (let m = 0; m < this.banmen[n].length; m++) {
        _arr.push(0);
      }
      this.fall.push(_arr);
    }
  }
}

let puzzle = new Puzzle();

function touchStarted() {
  touch.x = Math.floor(touches[0].x);
  touch.y = Math.floor(touches[0].y);
  touch.type = "touchstart";
}
function touchMoved() {
  touch.x = Math.floor(touches[0].x);
  touch.y = Math.floor(touches[0].y);
  touch.type = "touchmove";
}
function touchEnded() {
  //touch.x = Math.floor(touches[0].x);
  //touch.y = Math.floor(touches[0].y);
  touch.type = "touchend";
}

function draw() {
  background(220);

  //デバッグ用
  /*
  push();
  fill(0);
  text("タッチ座標: " + touch.x + "," + touch.y + "," + touch.type , 0,10);
  let _b = puzzle.returnTouchingBrick();
  text("タッチ中のブロック: " + _b[0] + "," + _b[1],0,20);
  if(selectedBricks.length >=1){
    text("選択中:"+selectedBricks.length,0,30);
  }
  pop();
  */

  //パズルの処理
  puzzle.touchEvent();

  //パズルの表示
  if (puzzle.maxfall > 0) puzzle.nowfall += fallSpead; //落下を加算
  let diameter = puzzle.diameter; //ブロックの大きさ(直径)
  const x1 = (width - diameter * puzzle.banmen[0].length) / 2 + diameter / 2; //パズルが中央にくるように左上のブロックの中心座標を設定
  const y1 = (height - diameter * puzzle.banmen.length) / 2 + diameter / 2; //同上
  //ブロック座標から、ブロックの位置の中心のピクセル座標を返す関数
  function returnBrickPosition(_n, _m) {
    return [x1 + _m * diameter, y1 + _n * diameter];
  }

  for (let n = 0; n < puzzle.banmen.length; n++) {
    for (let m = 0; m < puzzle.banmen[n].length; m++) {
      let _brick = puzzle.banmen2[n][m];
      if (_brick == "無") continue; //無なら処理しない
      //落下中かつselectedBricksにあるブロックならcontinueして非表示にする
      if (puzzle.maxfall > 0) {
        let _isSelected = false;
        for (let _zahyou of selectedBricks) {
          if (_zahyou[0] == n && _zahyou[1] == m) {
            _isSelected = true;
            continue;
          }
        }
        if (_isSelected) continue;
      }
      let _color = colors[_brick];
      //puzzle.fallを適用させる
      let _fall = puzzle.fall[n][m];
      if (_fall == null || _fall == NaN || _fall == undefined) _fall = 0;
      if (_fall > 0) {
        _fall = Math.min(_fall, puzzle.nowfall);
      }

      let _position = returnBrickPosition(n, m);
      //初回に判定を設定
      if (puzzle.hanteiPointsFlag == false) {
        puzzle.hanteiPoints[n].push([].concat(_position));
      }
      //描画
      push();
      fill(_color);
      if (_brick != "桃") {
        circle(_position[0], _position[1] + _fall, diameter);
      } else {
        //桃は正方形にする
        square(
          _position[0] - diameter / 2,
          _position[1] - diameter / 2 + _fall,
          diameter
        );
      }
      pop();
    }
  } //for終了

  //lineの描画
  if (touch.type == "touchmove" && selectedBricks.length >= 2) {
    for (let n = 0; n < selectedBricks.length - 1; n++) {
      push();
      let _p1 = returnBrickPosition(selectedBricks[n][0], selectedBricks[n][1]);
      let _p2 = returnBrickPosition(
        selectedBricks[n + 1][0],
        selectedBricks[n + 1][1]
      );
      strokeWeight(5);
      blendMode(SCREEN);
      stroke(225, 225, 225, 220);
      line(_p1[0], _p1[1], _p2[0], _p2[1]);
      pop();
    }
  }

  //puzzle.hanteiPointFlagを変更。初回に一度だけ行う
  if (puzzle.hanteiPointsFlag == false) puzzle.hanteiPointsFlag = true;
  //puzzle.maxfallをfallSpead分減らす
  if (puzzle.maxfall > 0) {
    puzzle.maxfall -= fallSpead;
    puzzle.maxfall = Math.max(0, puzzle.maxfall);
  }

  push();
  //上半分を隠す
  fill(220);
  rect(0, 0, width, height / 2);
  line(width / 2, 0, width / 2, height / 2);
  //ポインタ
  /*
  if(touch.type == "touchstart" || touch.type == "touchmove"){
    fill(225,225,225,50);
    circle(touch.x,touch.y,10);
  }
  */
  pop();

  //スコアの描画
  text("スコア:" + game.score, 10, 30);
  text("■ラップスコア■", 10, 50);
  let _rapHyoujisuu = 10;
  let _count = 0;
  for (let n = 0; n < game.rapScore.length; n++) {
    if (game.rapScore.length > _rapHyoujisuu) {
      if (n < game.rapScore.length - _rapHyoujisuu) continue;
    }
    let _time = game.rapInterval * (n + 1);
    let _hun = Math.floor(_time / 600);
    let _byou = (_time % 600) / 10;
    if (_hun < 10) _hun = "0" + _hun;
    if (_byou < 10) _byou = "0" + _byou;
    text(_hun + ":" + _byou + ".0:" + game.rapScore[n], 10, 60 + 10 * _count);
    _count++;
  }

  //タイムの描画
  text(game.returnTimeText(), 10, 10);

  //ブロック設定の表示
  for (let n = 0; n < bricks.length; n++) {
    let txt = "◯";
    let col = "red";
    if (bricksSettei[bricks[n]] == false) {
      txt = "×";
      col = "black";
    }
    push();
    fill(col);
    text(txt, width - 60, 30 + 30 * n);
    pop();
  }
}
