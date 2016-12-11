require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Game":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'ca1e0wj+9lFiqeztSQKNjFA', 'Game');
// scripts\Game.js

var Player = require('Player');
var ScoreFX = require('ScoreFX');
var Star = require('Star');

var Game = cc.Class({
    'extends': cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        //生成的星星
        starPrefab: {
            'default': null,
            type: cc.Prefab
        },
        //生成的爆炸动画
        scoreFXPrefab: {
            'default': null,
            type: cc.Prefab
        },
        //开始按钮
        btnNode: {
            'default': null,
            type: cc.Node
        },
        //结束提示
        gameOverNode: {
            'default': null,
            type: cc.Node
        },
        // 星星产生后消失时间的随机范围
        maxStarDuration: 5,
        minStarDuration: 3,
        // 地面节点，用于确定星星生成的高度
        ground: {
            'default': null,
            type: cc.Node
        },
        // player 节点，用于获取主角弹跳的高度，和控制主角行动开关
        player: {
            'default': null,
            type: Player
        },
        scoreDisplay: {
            'default': null,
            type: cc.Label
        },
        // 得分音效资源
        scoreAudio: {
            'default': null,
            url: cc.AudioClip
        }
    },

    // use this for initialization
    onLoad: function onLoad() {
        // 获取地平面的 y 轴坐标
        this.groundY = this.ground.y + this.ground.height / 2;

        // 重置星星
        this.currentStar = null;
        this.currentStarX = 0;

        // 初始化计时器
        this.timer = 0;
        this.starDuration = 0;
        /*// 生成一个新的星星
        this.spawnNewStar();*/
        // 初始化计分
        //this.score = 0;

        // 设置判断游戏是否进行中
        this.isRunning = false;

        // initialize star and score pool
        this.starPool = new cc.NodePool('Star');
        this.scorePool = new cc.NodePool('ScoreFX');
        cc.log("onLoad");
    },
    gainScore: function gainScore(pos) {
        this.score += 1;
        // 更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = 'Score: ' + this.score.toString();

        // 播放特效
        var fx = this.spawnScoreFX();
        this.node.addChild(fx.node);
        fx.node.setPosition(pos);
        fx.play();

        // 播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio, false);
    },

    spawnNewStar: function spawnNewStar() {
        var newStar = null;

        // 使用给定的模板在场景中生成一个新节点
        if (this.starPool.size() > 0) {
            newStar = this.starPool.get().getComponent('Star'); // this will be passed to Star's reuse method
        } else {
                newStar = cc.instantiate(this.starPrefab).getComponent('Star');
            }
        // 开起消失计时
        this.startTimer();

        // 为星星设置一个随机位置
        //设置不了位置
        var p = this.getNewStarPosition();

        this.currentStar = newStar;
        // 将新增的节点添加到 Canvas 节点下面
        this.node.addChild(this.currentStar.node);

        cc.log("p2");
        this.currentStar.node.setPosition(p);

        this.currentStar.init(this);
        // 初始化星星
        //newStar.getComponent('Star').init(this);
    },
    despawnStar: function despawnStar(star) {
        this.starPool.put(star);
        this.spawnNewStar();
    },
    //启动星星消失计时
    startTimer: function startTimer() {

        // 设置持续时间
        this.starDuration = this.minStarDuration + cc.random0To1() * (this.maxStarDuration - this.minStarDuration);
        cc.log("starDuration" + this.starDuration);
        //开始计时
        this.timer = 0;
    },

    spawnScoreFX: function spawnScoreFX() {
        var fx;
        if (this.scorePool.size() > 0) {
            //如果已经产生了一次特效则复用
            fx = this.scorePool.get();
            return fx.getComponent('ScoreFX');
        } else {
            //创建新的特效精灵
            fx = cc.instantiate(this.scoreFXPrefab).getComponent('ScoreFX');
            fx.init(this);
            return fx;
        }
    },
    getNewStarPosition: function getNewStarPosition() {
        cc.log("getNewStarPosition");
        if (!this.currentStar) {
            this.currentStarX = cc.randomMinus1To1() * this.node.width / 2;
        }

        var randX = 0;
        // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
        var randY = this.groundY + cc.random0To1() * this.player.getComponent('Player').jumpHeight + 50;
        // 根据屏幕宽度，随机得到一个星星 x 坐标
        var maxX = this.node.width / 2;
        if (this.currentStarX >= 0) {
            randX = -cc.random0To1() * maxX;
        } else {
            randX = cc.random0To1() * maxX;
        }
        randX = cc.randomMinus1To1() * maxX;
        // 返回星星坐标
        return cc.p(randX, randY);
    },
    despawnScoreFX: function despawnScoreFX(scoreFX) {
        this.scorePool.put(scoreFX);
    },
    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        if (!this.isRunning) return;
        // 每帧更新计时器，超过限度还没有生成新的星星
        // 就会调用游戏失败逻辑
        if (this.timer > this.starDuration) {
            this.gameOver();
            return;
        }
        this.timer += dt;
    },
    //重置分数
    resetScore: function resetScore() {
        this.score = 0;
        this.scoreDisplay.string = 'Score: ' + this.score.toString();
    },
    onStartGame: function onStartGame() {
        cc.log("onStartGame");

        // 初始化计分
        this.resetScore();
        // set game state to running
        this.isRunning = true;
        // 设置开始按钮位置
        this.btnNode.setPositionX(3000);
        this.gameOverNode.active = false;

        // 设置player初始位置
        this.player.startMoveAt(cc.p(0, this.groundY));

        // 产生一个新的星星
        this.spawnNewStar();
    },
    gameOver: function gameOver() {
        /*this.player.stopAllActions(); //停止 player 节点的跳跃动作
        cc.director.loadScene('game');*/
        cc.log("gameOver");
        this.currentStar.node.destroy();
        this.gameOverNode.active = true;
        this.player.enabled = false;
        this.player.stopMove();
        this.isRunning = false;
        this.btnNode.setPositionX(0);
    }
});

cc._RFpop();
},{"Player":"Player","ScoreFX":"ScoreFX","Star":"Star"}],"Player":[function(require,module,exports){
"use strict";
cc._RFpush(module, '1ce9bJGJL9NXb4vn1I1cgAY', 'Player');
// scripts\Player.js

cc.Class({
    "extends": cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        // 主角跳跃高度
        jumpHeight: 0,
        // 主角跳跃持续时间
        jumpDuration: 0,
        // 辅助形变动作时间
        squashDuration: 0,
        // 最大移动速度
        maxMoveSpeed: 0,
        // 加速度
        accel: 0,
        // 跳跃音效资源
        jumpAudio: {
            "default": null,
            url: cc.AudioClip
        }

    },

    setJumpAction: function setJumpAction() {
        cc.log("player:setJumpAction");
        // 跳跃上升
        var jumpUp = cc.moveBy(this.jumpDuration, cc.p(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        // 下落
        var jumpDown = cc.moveBy(this.jumpDuration, cc.p(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());
        // 形变
        var squash = cc.scaleTo(this.squashDuration, 1, 0.6);
        var stretch = cc.scaleTo(this.squashDuration, 1, 1.2);
        var scaleBack = cc.scaleTo(this.squashDuration, 1, 1);
        // 添加一个回调函数，用于在动作结束时调用我们定义的其他方法
        var callback = cc.callFunc(this.playJumpSound, this);
        // 不断重复，而且每次完成落地动作后调用回调来播放声音
        return cc.repeatForever(cc.sequence(jumpUp, jumpDown, callback));
    },
    playJumpSound: function playJumpSound() {
        // 调用声音引擎播放声音
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },
    getCenterPos: function getCenterPos() {
        var centerPos = cc.p(this.node.x, this.node.y + this.node.height / 2);
        return centerPos;
    },
    startMoveAt: function startMoveAt(pos) {
        cc.log("player:startMoveAt");
        this.enabled = true;
        this.xSpeed = 0;
        this.node.setPosition(pos);
        this.node.runAction(this.setJumpAction());
    },

    stopMove: function stopMove() {
        cc.log("player:stopMove");
        this.node.stopAllActions();
    },
    setInputControl: function setInputControl() {
        var self = this;
        // 添加键盘事件监听
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            // 有按键按下时，判断是否是我们指定的方向控制键，并设置向对应方向加速
            onKeyPressed: function onKeyPressed(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                        self.accLeft = true;
                        self.accRight = false;
                        break;
                    case cc.KEY.d:
                        self.accLeft = false;
                        self.accRight = true;
                        break;
                }
            },
            // 松开按键时，停止向该方向的加速
            onKeyReleased: function onKeyReleased(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                        self.accLeft = false;
                        break;
                    case cc.KEY.d:
                        self.accRight = false;
                        break;
                }
            }

        }, self.node);
    },

    onEnter: function onEnter() {
        cc.inputManager.setAccelerometerEnabled(true);
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.ACCELERATION,
            callback: function callback(acc, event) {
                var facingUp = -1;
                if (acc.z > 0) {
                    facingUp = +1;
                }
                var tiltLR = Math.round(acc.x / 9.81 * -90);
                var tiltFB = Math.round((acc.y + 9.81) / 9.81 * 90 * facingUp);

                /*cc.log("LR"+tiltLR);
                cc.log("FB"+tiltFB);
                 cc.log("x"+acc.x);
                  cc.log("y"+acc.y);*/
                //判断左右重力
                if (tiltLR > 0) {
                    self.accLeft = true;
                    self.accRight = false;
                } else if (tiltLR < 0) {
                    self.accLeft = false;
                    self.accRight = true;
                } else {
                    self.accLeft = false;
                    self.accRight = false;
                }
            }
        }, self.node);
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.enabled = false;
        cc.log("player:onLoad");
        // 加速度方向开关
        this.accLeft = false;
        this.accRight = false;
        // 主角当前水平方向速度
        this.xSpeed = 0;

        // 设置左右边距
        //this.minPosX = -this.node.parent.width/2;
        //this.maxPosX = this.node.parent.width/2;

        this.node.setPositionY(0 + this.node.height / 2);

        // 初始化跳跃动作
        this.jumpAction = this.setJumpAction();
        //this.node.runAction(this.jumpAction);

        // 初始化键盘输入监听
        this.setInputControl();
        this.onEnter();
    },

    update: function update(dt) {
        // 根据当前加速度方向每帧更新速度
        if (this.accLeft) {
            this.xSpeed -= this.accel * dt;
        } else if (this.accRight) {
            this.xSpeed += this.accel * dt;
        }
        // 限制主角的速度不能超过最大值
        if (Math.abs(this.xSpeed) > this.maxMoveSpeed) {
            // if speed reach limit, use max speed with current direction
            this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
        }

        //cc.log("player:update");
        // 根据当前速度更新主角的位置
        this.node.x += this.xSpeed * dt;

        //判断是否到达屏幕边缘

        if (this.node.x > this.node.parent.width / 2) {
            this.node.x = this.node.parent.width / 2;
            this.xSpeed = 0;
        } else if (this.node.x < -this.node.parent.width / 2) {
            this.node.x = -this.node.parent.width / 2;
            this.xSpeed = 0;
        }
    }
});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();
},{}],"ScoreAnim":[function(require,module,exports){
"use strict";
cc._RFpush(module, '2dc19ndslJJYJIMItwPVAW8', 'ScoreAnim');
// scripts\ScoreAnim.js

cc.Class({
    "extends": cc.Component,
    //动画组件
    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function onLoad() {},

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    init: function init(scoreFX) {
        this.scoreFX = scoreFX;
    },

    hideFX: function hideFX() {
        this.scoreFX.despawn();
    }
});

cc._RFpop();
},{}],"ScoreFX":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'f76bbgQPAFJeLhoO+eTSe5l', 'ScoreFX');
// scripts\ScoreFX.js

cc.Class({
    'extends': cc.Component,

    properties: {
        anim: {
            'default': null,
            type: cc.Animation
        }
    },

    init: function init(game) {
        this.game = game;
        this.anim.getComponent('ScoreAnim').init(this);
    },

    despawn: function despawn() {
        this.game.despawnScoreFX(this.node);
    },

    play: function play() {
        //播放帧动画
        this.anim.play('score_pop');
    }
});

cc._RFpop();
},{}],"Star":[function(require,module,exports){
"use strict";
cc._RFpush(module, '02228p5UPxFg6OaOfhv5ijC', 'Star');
// scripts\Star.js

cc.Class({
    "extends": cc.Component,

    properties: {

        //碰撞距离
        pickRadius: 60,
        //游戏对象
        game: {
            "default": null,
            serializable: false
        }
    },

    onLoad: function onLoad() {
        this.enabled = false;
        cc.log("star:onLoad");
    },
    //加载游戏对象
    init: function init(g) {
        cc.log("star:init");
        this.game = g;
        this.enabled = true;
        //设置透明度
        this.node.opacity = 255;
    },

    reuse: function reuse(game) {
        this.init(game);
    },

    getPlayerDistance: function getPlayerDistance() {

        // 根据 player 节点位置判断距离
        var playerPos = this.game.player.node.getPosition();
        cc.log("star:getPlayerDistance" + playerPos.x);
        // 根据两点位置计算两点之间距离
        var dist = cc.pDistance(this.node.position, playerPos);

        return dist;
    },

    onPicked: function onPicked() {
        cc.log("star:onPicked");
        var pos = this.node.getPosition();
        // 调用 Game 脚本的得分方法
        this.game.gainScore(pos);
        // 当星星被收集时，调用 Game 脚本中的接口，销毁当前星星节点，生成一个新的星星
        this.game.despawnStar(this.node);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    update: function update(dt) {
        cc.log("21");
        // 根据 Game 脚本中的计时器更新星星的透明度
        var opacityRatio = 1 - this.game.timer / this.game.starDuration;
        var minOpacity = 50;
        //设置透明度
        this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
        // 每帧判断和主角之间的距离是否小于收集距离
        if (this.getPlayerDistance() < this.pickRadius) {
            // 调用收集行为
            this.onPicked();
            return;
        } else {}
    }

});

cc._RFpop();
},{}]},{},["Star","Player","ScoreAnim","Game","ScoreFX"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2NvY29zY3JlYXRvci9Db2Nvc0NyZWF0b3IvcmVzb3VyY2VzL2FwcC5hc2FyL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvc2NyaXB0cy9HYW1lLmpzIiwiYXNzZXRzL3NjcmlwdHMvUGxheWVyLmpzIiwiYXNzZXRzL3NjcmlwdHMvU2NvcmVBbmltLmpzIiwiYXNzZXRzL3NjcmlwdHMvU2NvcmVGWC5qcyIsImFzc2V0cy9zY3JpcHRzL1N0YXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICdjYTFlMHdqKzlsRmlxZXp0U1FLTmpGQScsICdHYW1lJyk7XG4vLyBzY3JpcHRzXFxHYW1lLmpzXG5cbnZhciBQbGF5ZXIgPSByZXF1aXJlKCdQbGF5ZXInKTtcbnZhciBTY29yZUZYID0gcmVxdWlyZSgnU2NvcmVGWCcpO1xudmFyIFN0YXIgPSByZXF1aXJlKCdTdGFyJyk7XG5cbnZhciBHYW1lID0gY2MuQ2xhc3Moe1xuICAgICdleHRlbmRzJzogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyBmb286IHtcbiAgICAgICAgLy8gICAgZGVmYXVsdDogbnVsbCwgICAgICAvLyBUaGUgZGVmYXVsdCB2YWx1ZSB3aWxsIGJlIHVzZWQgb25seSB3aGVuIHRoZSBjb21wb25lbnQgYXR0YWNoaW5nXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gYSBub2RlIGZvciB0aGUgZmlyc3QgdGltZVxuICAgICAgICAvLyAgICB1cmw6IGNjLlRleHR1cmUyRCwgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHR5cGVvZiBkZWZhdWx0XG4gICAgICAgIC8vICAgIHNlcmlhbGl6YWJsZTogdHJ1ZSwgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICB2aXNpYmxlOiB0cnVlLCAgICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgZGlzcGxheU5hbWU6ICdGb28nLCAvLyBvcHRpb25hbFxuICAgICAgICAvLyAgICByZWFkb25seTogZmFsc2UsICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIGZhbHNlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vIC4uLlxuICAgICAgICAvL+eUn+aIkOeahOaYn+aYn1xuICAgICAgICBzdGFyUHJlZmFiOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5QcmVmYWJcbiAgICAgICAgfSxcbiAgICAgICAgLy/nlJ/miJDnmoTniIbngrjliqjnlLtcbiAgICAgICAgc2NvcmVGWFByZWZhYjoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuUHJlZmFiXG4gICAgICAgIH0sXG4gICAgICAgIC8v5byA5aeL5oyJ6ZKuXG4gICAgICAgIGJ0bk5vZGU6IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGVcbiAgICAgICAgfSxcbiAgICAgICAgLy/nu5PmnZ/mj5DnpLpcbiAgICAgICAgZ2FtZU92ZXJOb2RlOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOaYn+aYn+S6p+eUn+WQjua2iOWkseaXtumXtOeahOmaj+acuuiMg+WbtFxuICAgICAgICBtYXhTdGFyRHVyYXRpb246IDUsXG4gICAgICAgIG1pblN0YXJEdXJhdGlvbjogMyxcbiAgICAgICAgLy8g5Zyw6Z2i6IqC54K577yM55So5LqO56Gu5a6a5pif5pif55Sf5oiQ55qE6auY5bqmXG4gICAgICAgIGdyb3VuZDoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxuICAgICAgICB9LFxuICAgICAgICAvLyBwbGF5ZXIg6IqC54K577yM55So5LqO6I635Y+W5Li76KeS5by56Lez55qE6auY5bqm77yM5ZKM5o6n5Yi25Li76KeS6KGM5Yqo5byA5YWzXG4gICAgICAgIHBsYXllcjoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogUGxheWVyXG4gICAgICAgIH0sXG4gICAgICAgIHNjb3JlRGlzcGxheToge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTGFiZWxcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5b6X5YiG6Z+z5pWI6LWE5rqQXG4gICAgICAgIHNjb3JlQXVkaW86IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHVybDogY2MuQXVkaW9DbGlwXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgICAgIC8vIOiOt+WPluWcsOW5s+mdoueahCB5IOi9tOWdkOagh1xuICAgICAgICB0aGlzLmdyb3VuZFkgPSB0aGlzLmdyb3VuZC55ICsgdGhpcy5ncm91bmQuaGVpZ2h0IC8gMjtcblxuICAgICAgICAvLyDph43nva7mmJ/mmJ9cbiAgICAgICAgdGhpcy5jdXJyZW50U3RhciA9IG51bGw7XG4gICAgICAgIHRoaXMuY3VycmVudFN0YXJYID0gMDtcblxuICAgICAgICAvLyDliJ3lp4vljJborqHml7blmahcbiAgICAgICAgdGhpcy50aW1lciA9IDA7XG4gICAgICAgIHRoaXMuc3RhckR1cmF0aW9uID0gMDtcbiAgICAgICAgLyovLyDnlJ/miJDkuIDkuKrmlrDnmoTmmJ/mmJ9cclxuICAgICAgICB0aGlzLnNwYXduTmV3U3RhcigpOyovXG4gICAgICAgIC8vIOWIneWni+WMluiuoeWIhlxuICAgICAgICAvL3RoaXMuc2NvcmUgPSAwO1xuXG4gICAgICAgIC8vIOiuvue9ruWIpOaWrea4uOaIj+aYr+WQpui/m+ihjOS4rVxuICAgICAgICB0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemUgc3RhciBhbmQgc2NvcmUgcG9vbFxuICAgICAgICB0aGlzLnN0YXJQb29sID0gbmV3IGNjLk5vZGVQb29sKCdTdGFyJyk7XG4gICAgICAgIHRoaXMuc2NvcmVQb29sID0gbmV3IGNjLk5vZGVQb29sKCdTY29yZUZYJyk7XG4gICAgICAgIGNjLmxvZyhcIm9uTG9hZFwiKTtcbiAgICB9LFxuICAgIGdhaW5TY29yZTogZnVuY3Rpb24gZ2FpblNjb3JlKHBvcykge1xuICAgICAgICB0aGlzLnNjb3JlICs9IDE7XG4gICAgICAgIC8vIOabtOaWsCBzY29yZURpc3BsYXkgTGFiZWwg55qE5paH5a2XXG4gICAgICAgIHRoaXMuc2NvcmVEaXNwbGF5LnN0cmluZyA9ICdTY29yZTogJyArIHRoaXMuc2NvcmUudG9TdHJpbmcoKTtcblxuICAgICAgICAvLyDmkq3mlL7nibnmlYhcbiAgICAgICAgdmFyIGZ4ID0gdGhpcy5zcGF3blNjb3JlRlgoKTtcbiAgICAgICAgdGhpcy5ub2RlLmFkZENoaWxkKGZ4Lm5vZGUpO1xuICAgICAgICBmeC5ub2RlLnNldFBvc2l0aW9uKHBvcyk7XG4gICAgICAgIGZ4LnBsYXkoKTtcblxuICAgICAgICAvLyDmkq3mlL7lvpfliIbpn7PmlYhcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUucGxheUVmZmVjdCh0aGlzLnNjb3JlQXVkaW8sIGZhbHNlKTtcbiAgICB9LFxuXG4gICAgc3Bhd25OZXdTdGFyOiBmdW5jdGlvbiBzcGF3bk5ld1N0YXIoKSB7XG4gICAgICAgIHZhciBuZXdTdGFyID0gbnVsbDtcblxuICAgICAgICAvLyDkvb/nlKjnu5nlrprnmoTmqKHmnb/lnKjlnLrmma/kuK3nlJ/miJDkuIDkuKrmlrDoioLngrlcbiAgICAgICAgaWYgKHRoaXMuc3RhclBvb2wuc2l6ZSgpID4gMCkge1xuICAgICAgICAgICAgbmV3U3RhciA9IHRoaXMuc3RhclBvb2wuZ2V0KCkuZ2V0Q29tcG9uZW50KCdTdGFyJyk7IC8vIHRoaXMgd2lsbCBiZSBwYXNzZWQgdG8gU3RhcidzIHJldXNlIG1ldGhvZFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1N0YXIgPSBjYy5pbnN0YW50aWF0ZSh0aGlzLnN0YXJQcmVmYWIpLmdldENvbXBvbmVudCgnU3RhcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAvLyDlvIDotbfmtojlpLHorqHml7ZcbiAgICAgICAgdGhpcy5zdGFydFRpbWVyKCk7XG5cbiAgICAgICAgLy8g5Li65pif5pif6K6+572u5LiA5Liq6ZqP5py65L2N572uXG4gICAgICAgIC8v6K6+572u5LiN5LqG5L2N572uXG4gICAgICAgIHZhciBwID0gdGhpcy5nZXROZXdTdGFyUG9zaXRpb24oKTtcblxuICAgICAgICB0aGlzLmN1cnJlbnRTdGFyID0gbmV3U3RhcjtcbiAgICAgICAgLy8g5bCG5paw5aKe55qE6IqC54K55re75Yqg5YiwIENhbnZhcyDoioLngrnkuIvpnaJcbiAgICAgICAgdGhpcy5ub2RlLmFkZENoaWxkKHRoaXMuY3VycmVudFN0YXIubm9kZSk7XG5cbiAgICAgICAgY2MubG9nKFwicDJcIik7XG4gICAgICAgIHRoaXMuY3VycmVudFN0YXIubm9kZS5zZXRQb3NpdGlvbihwKTtcblxuICAgICAgICB0aGlzLmN1cnJlbnRTdGFyLmluaXQodGhpcyk7XG4gICAgICAgIC8vIOWIneWni+WMluaYn+aYn1xuICAgICAgICAvL25ld1N0YXIuZ2V0Q29tcG9uZW50KCdTdGFyJykuaW5pdCh0aGlzKTtcbiAgICB9LFxuICAgIGRlc3Bhd25TdGFyOiBmdW5jdGlvbiBkZXNwYXduU3RhcihzdGFyKSB7XG4gICAgICAgIHRoaXMuc3RhclBvb2wucHV0KHN0YXIpO1xuICAgICAgICB0aGlzLnNwYXduTmV3U3RhcigpO1xuICAgIH0sXG4gICAgLy/lkK/liqjmmJ/mmJ/mtojlpLHorqHml7ZcbiAgICBzdGFydFRpbWVyOiBmdW5jdGlvbiBzdGFydFRpbWVyKCkge1xuXG4gICAgICAgIC8vIOiuvue9ruaMgee7reaXtumXtFxuICAgICAgICB0aGlzLnN0YXJEdXJhdGlvbiA9IHRoaXMubWluU3RhckR1cmF0aW9uICsgY2MucmFuZG9tMFRvMSgpICogKHRoaXMubWF4U3RhckR1cmF0aW9uIC0gdGhpcy5taW5TdGFyRHVyYXRpb24pO1xuICAgICAgICBjYy5sb2coXCJzdGFyRHVyYXRpb25cIiArIHRoaXMuc3RhckR1cmF0aW9uKTtcbiAgICAgICAgLy/lvIDlp4vorqHml7ZcbiAgICAgICAgdGhpcy50aW1lciA9IDA7XG4gICAgfSxcblxuICAgIHNwYXduU2NvcmVGWDogZnVuY3Rpb24gc3Bhd25TY29yZUZYKCkge1xuICAgICAgICB2YXIgZng7XG4gICAgICAgIGlmICh0aGlzLnNjb3JlUG9vbC5zaXplKCkgPiAwKSB7XG4gICAgICAgICAgICAvL+WmguaenOW3sue7j+S6p+eUn+S6huS4gOasoeeJueaViOWImeWkjeeUqFxuICAgICAgICAgICAgZnggPSB0aGlzLnNjb3JlUG9vbC5nZXQoKTtcbiAgICAgICAgICAgIHJldHVybiBmeC5nZXRDb21wb25lbnQoJ1Njb3JlRlgnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8v5Yib5bu65paw55qE54m55pWI57K+54G1XG4gICAgICAgICAgICBmeCA9IGNjLmluc3RhbnRpYXRlKHRoaXMuc2NvcmVGWFByZWZhYikuZ2V0Q29tcG9uZW50KCdTY29yZUZYJyk7XG4gICAgICAgICAgICBmeC5pbml0KHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIGZ4O1xuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXROZXdTdGFyUG9zaXRpb246IGZ1bmN0aW9uIGdldE5ld1N0YXJQb3NpdGlvbigpIHtcbiAgICAgICAgY2MubG9nKFwiZ2V0TmV3U3RhclBvc2l0aW9uXCIpO1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFN0YXIpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFN0YXJYID0gY2MucmFuZG9tTWludXMxVG8xKCkgKiB0aGlzLm5vZGUud2lkdGggLyAyO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJhbmRYID0gMDtcbiAgICAgICAgLy8g5qC55o2u5Zyw5bmz6Z2i5L2N572u5ZKM5Li76KeS6Lez6LeD6auY5bqm77yM6ZqP5py65b6X5Yiw5LiA5Liq5pif5pif55qEIHkg5Z2Q5qCHXG4gICAgICAgIHZhciByYW5kWSA9IHRoaXMuZ3JvdW5kWSArIGNjLnJhbmRvbTBUbzEoKSAqIHRoaXMucGxheWVyLmdldENvbXBvbmVudCgnUGxheWVyJykuanVtcEhlaWdodCArIDUwO1xuICAgICAgICAvLyDmoLnmja7lsY/luZXlrr3luqbvvIzpmo/mnLrlvpfliLDkuIDkuKrmmJ/mmJ8geCDlnZDmoIdcbiAgICAgICAgdmFyIG1heFggPSB0aGlzLm5vZGUud2lkdGggLyAyO1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50U3RhclggPj0gMCkge1xuICAgICAgICAgICAgcmFuZFggPSAtY2MucmFuZG9tMFRvMSgpICogbWF4WDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJhbmRYID0gY2MucmFuZG9tMFRvMSgpICogbWF4WDtcbiAgICAgICAgfVxuICAgICAgICByYW5kWCA9IGNjLnJhbmRvbU1pbnVzMVRvMSgpICogbWF4WDtcbiAgICAgICAgLy8g6L+U5Zue5pif5pif5Z2Q5qCHXG4gICAgICAgIHJldHVybiBjYy5wKHJhbmRYLCByYW5kWSk7XG4gICAgfSxcbiAgICBkZXNwYXduU2NvcmVGWDogZnVuY3Rpb24gZGVzcGF3blNjb3JlRlgoc2NvcmVGWCkge1xuICAgICAgICB0aGlzLnNjb3JlUG9vbC5wdXQoc2NvcmVGWCk7XG4gICAgfSxcbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKGR0KSB7XG4gICAgICAgIGlmICghdGhpcy5pc1J1bm5pbmcpIHJldHVybjtcbiAgICAgICAgLy8g5q+P5bin5pu05paw6K6h5pe25Zmo77yM6LaF6L+H6ZmQ5bqm6L+Y5rKh5pyJ55Sf5oiQ5paw55qE5pif5pifXG4gICAgICAgIC8vIOWwseS8muiwg+eUqOa4uOaIj+Wksei0pemAu+i+kVxuICAgICAgICBpZiAodGhpcy50aW1lciA+IHRoaXMuc3RhckR1cmF0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50aW1lciArPSBkdDtcbiAgICB9LFxuICAgIC8v6YeN572u5YiG5pWwXG4gICAgcmVzZXRTY29yZTogZnVuY3Rpb24gcmVzZXRTY29yZSgpIHtcbiAgICAgICAgdGhpcy5zY29yZSA9IDA7XG4gICAgICAgIHRoaXMuc2NvcmVEaXNwbGF5LnN0cmluZyA9ICdTY29yZTogJyArIHRoaXMuc2NvcmUudG9TdHJpbmcoKTtcbiAgICB9LFxuICAgIG9uU3RhcnRHYW1lOiBmdW5jdGlvbiBvblN0YXJ0R2FtZSgpIHtcbiAgICAgICAgY2MubG9nKFwib25TdGFydEdhbWVcIik7XG5cbiAgICAgICAgLy8g5Yid5aeL5YyW6K6h5YiGXG4gICAgICAgIHRoaXMucmVzZXRTY29yZSgpO1xuICAgICAgICAvLyBzZXQgZ2FtZSBzdGF0ZSB0byBydW5uaW5nXG4gICAgICAgIHRoaXMuaXNSdW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgLy8g6K6+572u5byA5aeL5oyJ6ZKu5L2N572uXG4gICAgICAgIHRoaXMuYnRuTm9kZS5zZXRQb3NpdGlvblgoMzAwMCk7XG4gICAgICAgIHRoaXMuZ2FtZU92ZXJOb2RlLmFjdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIOiuvue9rnBsYXllcuWIneWni+S9jee9rlxuICAgICAgICB0aGlzLnBsYXllci5zdGFydE1vdmVBdChjYy5wKDAsIHRoaXMuZ3JvdW5kWSkpO1xuXG4gICAgICAgIC8vIOS6p+eUn+S4gOS4quaWsOeahOaYn+aYn1xuICAgICAgICB0aGlzLnNwYXduTmV3U3RhcigpO1xuICAgIH0sXG4gICAgZ2FtZU92ZXI6IGZ1bmN0aW9uIGdhbWVPdmVyKCkge1xuICAgICAgICAvKnRoaXMucGxheWVyLnN0b3BBbGxBY3Rpb25zKCk7IC8v5YGc5q2iIHBsYXllciDoioLngrnnmoTot7Pot4PliqjkvZxcclxuICAgICAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoJ2dhbWUnKTsqL1xuICAgICAgICBjYy5sb2coXCJnYW1lT3ZlclwiKTtcbiAgICAgICAgdGhpcy5jdXJyZW50U3Rhci5ub2RlLmRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy5nYW1lT3Zlck5vZGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBsYXllci5zdG9wTW92ZSgpO1xuICAgICAgICB0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmJ0bk5vZGUuc2V0UG9zaXRpb25YKDApO1xuICAgIH1cbn0pO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnMWNlOWJKR0pMOU5YYjR2bjFJMWNnQVknLCAnUGxheWVyJyk7XG4vLyBzY3JpcHRzXFxQbGF5ZXIuanNcblxuY2MuQ2xhc3Moe1xuICAgIFwiZXh0ZW5kc1wiOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIGZvbzoge1xuICAgICAgICAvLyAgICBkZWZhdWx0OiBudWxsLCAgICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZCBvbmx5IHdoZW4gdGhlIGNvbXBvbmVudCBhdHRhY2hpbmdcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICB0byBhIG5vZGUgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICAgIC8vICAgIHVybDogY2MuVGV4dHVyZTJELCAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHlwZW9mIGRlZmF1bHRcbiAgICAgICAgLy8gICAgc2VyaWFsaXphYmxlOiB0cnVlLCAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIHZpc2libGU6IHRydWUsICAgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICBkaXNwbGF5TmFtZTogJ0ZvbycsIC8vIG9wdGlvbmFsXG4gICAgICAgIC8vICAgIHJlYWRvbmx5OiBmYWxzZSwgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgZmFsc2VcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8gLi4uXG4gICAgICAgIC8vIOS4u+inkui3s+i3g+mrmOW6plxuICAgICAgICBqdW1wSGVpZ2h0OiAwLFxuICAgICAgICAvLyDkuLvop5Lot7Pot4PmjIHnu63ml7bpl7RcbiAgICAgICAganVtcER1cmF0aW9uOiAwLFxuICAgICAgICAvLyDovoXliqnlvaLlj5jliqjkvZzml7bpl7RcbiAgICAgICAgc3F1YXNoRHVyYXRpb246IDAsXG4gICAgICAgIC8vIOacgOWkp+enu+WKqOmAn+W6plxuICAgICAgICBtYXhNb3ZlU3BlZWQ6IDAsXG4gICAgICAgIC8vIOWKoOmAn+W6plxuICAgICAgICBhY2NlbDogMCxcbiAgICAgICAgLy8g6Lez6LeD6Z+z5pWI6LWE5rqQXG4gICAgICAgIGp1bXBBdWRpbzoge1xuICAgICAgICAgICAgXCJkZWZhdWx0XCI6IG51bGwsXG4gICAgICAgICAgICB1cmw6IGNjLkF1ZGlvQ2xpcFxuICAgICAgICB9XG5cbiAgICB9LFxuXG4gICAgc2V0SnVtcEFjdGlvbjogZnVuY3Rpb24gc2V0SnVtcEFjdGlvbigpIHtcbiAgICAgICAgY2MubG9nKFwicGxheWVyOnNldEp1bXBBY3Rpb25cIik7XG4gICAgICAgIC8vIOi3s+i3g+S4iuWNh1xuICAgICAgICB2YXIganVtcFVwID0gY2MubW92ZUJ5KHRoaXMuanVtcER1cmF0aW9uLCBjYy5wKDAsIHRoaXMuanVtcEhlaWdodCkpLmVhc2luZyhjYy5lYXNlQ3ViaWNBY3Rpb25PdXQoKSk7XG4gICAgICAgIC8vIOS4i+iQvVxuICAgICAgICB2YXIganVtcERvd24gPSBjYy5tb3ZlQnkodGhpcy5qdW1wRHVyYXRpb24sIGNjLnAoMCwgLXRoaXMuanVtcEhlaWdodCkpLmVhc2luZyhjYy5lYXNlQ3ViaWNBY3Rpb25JbigpKTtcbiAgICAgICAgLy8g5b2i5Y+YXG4gICAgICAgIHZhciBzcXVhc2ggPSBjYy5zY2FsZVRvKHRoaXMuc3F1YXNoRHVyYXRpb24sIDEsIDAuNik7XG4gICAgICAgIHZhciBzdHJldGNoID0gY2Muc2NhbGVUbyh0aGlzLnNxdWFzaER1cmF0aW9uLCAxLCAxLjIpO1xuICAgICAgICB2YXIgc2NhbGVCYWNrID0gY2Muc2NhbGVUbyh0aGlzLnNxdWFzaER1cmF0aW9uLCAxLCAxKTtcbiAgICAgICAgLy8g5re75Yqg5LiA5Liq5Zue6LCD5Ye95pWw77yM55So5LqO5Zyo5Yqo5L2c57uT5p2f5pe26LCD55So5oiR5Lus5a6a5LmJ55qE5YW25LuW5pa55rOVXG4gICAgICAgIHZhciBjYWxsYmFjayA9IGNjLmNhbGxGdW5jKHRoaXMucGxheUp1bXBTb3VuZCwgdGhpcyk7XG4gICAgICAgIC8vIOS4jeaWremHjeWkje+8jOiAjOS4lOavj+asoeWujOaIkOiQveWcsOWKqOS9nOWQjuiwg+eUqOWbnuiwg+adpeaSreaUvuWjsOmfs1xuICAgICAgICByZXR1cm4gY2MucmVwZWF0Rm9yZXZlcihjYy5zZXF1ZW5jZShqdW1wVXAsIGp1bXBEb3duLCBjYWxsYmFjaykpO1xuICAgIH0sXG4gICAgcGxheUp1bXBTb3VuZDogZnVuY3Rpb24gcGxheUp1bXBTb3VuZCgpIHtcbiAgICAgICAgLy8g6LCD55So5aOw6Z+z5byV5pOO5pKt5pS+5aOw6Z+zXG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QodGhpcy5qdW1wQXVkaW8sIGZhbHNlKTtcbiAgICB9LFxuICAgIGdldENlbnRlclBvczogZnVuY3Rpb24gZ2V0Q2VudGVyUG9zKCkge1xuICAgICAgICB2YXIgY2VudGVyUG9zID0gY2MucCh0aGlzLm5vZGUueCwgdGhpcy5ub2RlLnkgKyB0aGlzLm5vZGUuaGVpZ2h0IC8gMik7XG4gICAgICAgIHJldHVybiBjZW50ZXJQb3M7XG4gICAgfSxcbiAgICBzdGFydE1vdmVBdDogZnVuY3Rpb24gc3RhcnRNb3ZlQXQocG9zKSB7XG4gICAgICAgIGNjLmxvZyhcInBsYXllcjpzdGFydE1vdmVBdFwiKTtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy54U3BlZWQgPSAwO1xuICAgICAgICB0aGlzLm5vZGUuc2V0UG9zaXRpb24ocG9zKTtcbiAgICAgICAgdGhpcy5ub2RlLnJ1bkFjdGlvbih0aGlzLnNldEp1bXBBY3Rpb24oKSk7XG4gICAgfSxcblxuICAgIHN0b3BNb3ZlOiBmdW5jdGlvbiBzdG9wTW92ZSgpIHtcbiAgICAgICAgY2MubG9nKFwicGxheWVyOnN0b3BNb3ZlXCIpO1xuICAgICAgICB0aGlzLm5vZGUuc3RvcEFsbEFjdGlvbnMoKTtcbiAgICB9LFxuICAgIHNldElucHV0Q29udHJvbDogZnVuY3Rpb24gc2V0SW5wdXRDb250cm9sKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vIOa3u+WKoOmUruebmOS6i+S7tuebkeWQrFxuICAgICAgICBjYy5ldmVudE1hbmFnZXIuYWRkTGlzdGVuZXIoe1xuICAgICAgICAgICAgZXZlbnQ6IGNjLkV2ZW50TGlzdGVuZXIuS0VZQk9BUkQsXG4gICAgICAgICAgICAvLyDmnInmjInplK7mjInkuIvml7bvvIzliKTmlq3mmK/lkKbmmK/miJHku6zmjIflrprnmoTmlrnlkJHmjqfliLbplK7vvIzlubborr7nva7lkJHlr7nlupTmlrnlkJHliqDpgJ9cbiAgICAgICAgICAgIG9uS2V5UHJlc3NlZDogZnVuY3Rpb24gb25LZXlQcmVzc2VkKGtleUNvZGUsIGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChrZXlDb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmE6XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NSaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjUmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIOadvuW8gOaMiemUruaXtu+8jOWBnOatouWQkeivpeaWueWQkeeahOWKoOmAn1xuICAgICAgICAgICAgb25LZXlSZWxlYXNlZDogZnVuY3Rpb24gb25LZXlSZWxlYXNlZChrZXlDb2RlLCBldmVudCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoa2V5Q29kZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5hOlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NMZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuZDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjUmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LCBzZWxmLm5vZGUpO1xuICAgIH0sXG5cbiAgICBvbkVudGVyOiBmdW5jdGlvbiBvbkVudGVyKCkge1xuICAgICAgICBjYy5pbnB1dE1hbmFnZXIuc2V0QWNjZWxlcm9tZXRlckVuYWJsZWQodHJ1ZSk7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgY2MuZXZlbnRNYW5hZ2VyLmFkZExpc3RlbmVyKHtcbiAgICAgICAgICAgIGV2ZW50OiBjYy5FdmVudExpc3RlbmVyLkFDQ0VMRVJBVElPTixcbiAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbiBjYWxsYmFjayhhY2MsIGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIGZhY2luZ1VwID0gLTE7XG4gICAgICAgICAgICAgICAgaWYgKGFjYy56ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBmYWNpbmdVcCA9ICsxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgdGlsdExSID0gTWF0aC5yb3VuZChhY2MueCAvIDkuODEgKiAtOTApO1xuICAgICAgICAgICAgICAgIHZhciB0aWx0RkIgPSBNYXRoLnJvdW5kKChhY2MueSArIDkuODEpIC8gOS44MSAqIDkwICogZmFjaW5nVXApO1xuXG4gICAgICAgICAgICAgICAgLypjYy5sb2coXCJMUlwiK3RpbHRMUik7XHJcbiAgICAgICAgICAgICAgICBjYy5sb2coXCJGQlwiK3RpbHRGQik7XHJcbiAgICAgICAgICAgICAgICAgY2MubG9nKFwieFwiK2FjYy54KTtcclxuICAgICAgICAgICAgICAgICAgY2MubG9nKFwieVwiK2FjYy55KTsqL1xuICAgICAgICAgICAgICAgIC8v5Yik5pat5bem5Y+z6YeN5YqbXG4gICAgICAgICAgICAgICAgaWYgKHRpbHRMUiA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NSaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGlsdExSIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NSaWdodCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NMZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjUmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHNlbGYubm9kZSk7XG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgY2MubG9nKFwicGxheWVyOm9uTG9hZFwiKTtcbiAgICAgICAgLy8g5Yqg6YCf5bqm5pa55ZCR5byA5YWzXG4gICAgICAgIHRoaXMuYWNjTGVmdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmFjY1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgIC8vIOS4u+inkuW9k+WJjeawtOW5s+aWueWQkemAn+W6plxuICAgICAgICB0aGlzLnhTcGVlZCA9IDA7XG5cbiAgICAgICAgLy8g6K6+572u5bem5Y+z6L656LedXG4gICAgICAgIC8vdGhpcy5taW5Qb3NYID0gLXRoaXMubm9kZS5wYXJlbnQud2lkdGgvMjtcbiAgICAgICAgLy90aGlzLm1heFBvc1ggPSB0aGlzLm5vZGUucGFyZW50LndpZHRoLzI7XG5cbiAgICAgICAgdGhpcy5ub2RlLnNldFBvc2l0aW9uWSgwICsgdGhpcy5ub2RlLmhlaWdodCAvIDIpO1xuXG4gICAgICAgIC8vIOWIneWni+WMlui3s+i3g+WKqOS9nFxuICAgICAgICB0aGlzLmp1bXBBY3Rpb24gPSB0aGlzLnNldEp1bXBBY3Rpb24oKTtcbiAgICAgICAgLy90aGlzLm5vZGUucnVuQWN0aW9uKHRoaXMuanVtcEFjdGlvbik7XG5cbiAgICAgICAgLy8g5Yid5aeL5YyW6ZSu55uY6L6T5YWl55uR5ZCsXG4gICAgICAgIHRoaXMuc2V0SW5wdXRDb250cm9sKCk7XG4gICAgICAgIHRoaXMub25FbnRlcigpO1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShkdCkge1xuICAgICAgICAvLyDmoLnmja7lvZPliY3liqDpgJ/luqbmlrnlkJHmr4/luKfmm7TmlrDpgJ/luqZcbiAgICAgICAgaWYgKHRoaXMuYWNjTGVmdCkge1xuICAgICAgICAgICAgdGhpcy54U3BlZWQgLT0gdGhpcy5hY2NlbCAqIGR0O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYWNjUmlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMueFNwZWVkICs9IHRoaXMuYWNjZWwgKiBkdDtcbiAgICAgICAgfVxuICAgICAgICAvLyDpmZDliLbkuLvop5LnmoTpgJ/luqbkuI3og73otoXov4fmnIDlpKflgLxcbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMueFNwZWVkKSA+IHRoaXMubWF4TW92ZVNwZWVkKSB7XG4gICAgICAgICAgICAvLyBpZiBzcGVlZCByZWFjaCBsaW1pdCwgdXNlIG1heCBzcGVlZCB3aXRoIGN1cnJlbnQgZGlyZWN0aW9uXG4gICAgICAgICAgICB0aGlzLnhTcGVlZCA9IHRoaXMubWF4TW92ZVNwZWVkICogdGhpcy54U3BlZWQgLyBNYXRoLmFicyh0aGlzLnhTcGVlZCk7XG4gICAgICAgIH1cblxuICAgICAgICAvL2NjLmxvZyhcInBsYXllcjp1cGRhdGVcIik7XG4gICAgICAgIC8vIOagueaNruW9k+WJjemAn+W6puabtOaWsOS4u+inkueahOS9jee9rlxuICAgICAgICB0aGlzLm5vZGUueCArPSB0aGlzLnhTcGVlZCAqIGR0O1xuXG4gICAgICAgIC8v5Yik5pat5piv5ZCm5Yiw6L6+5bGP5bmV6L6557yYXG5cbiAgICAgICAgaWYgKHRoaXMubm9kZS54ID4gdGhpcy5ub2RlLnBhcmVudC53aWR0aCAvIDIpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS54ID0gdGhpcy5ub2RlLnBhcmVudC53aWR0aCAvIDI7XG4gICAgICAgICAgICB0aGlzLnhTcGVlZCA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5ub2RlLnggPCAtdGhpcy5ub2RlLnBhcmVudC53aWR0aCAvIDIpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS54ID0gLXRoaXMubm9kZS5wYXJlbnQud2lkdGggLyAyO1xuICAgICAgICAgICAgdGhpcy54U3BlZWQgPSAwO1xuICAgICAgICB9XG4gICAgfVxufSk7XG4vLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcblxuLy8gfSxcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzJkYzE5bmRzbEpKWUpJTUl0d1BWQVc4JywgJ1Njb3JlQW5pbScpO1xuLy8gc2NyaXB0c1xcU2NvcmVBbmltLmpzXG5cbmNjLkNsYXNzKHtcbiAgICBcImV4dGVuZHNcIjogY2MuQ29tcG9uZW50LFxuICAgIC8v5Yqo55S757uE5Lu2XG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyBmb286IHtcbiAgICAgICAgLy8gICAgZGVmYXVsdDogbnVsbCwgICAgICAvLyBUaGUgZGVmYXVsdCB2YWx1ZSB3aWxsIGJlIHVzZWQgb25seSB3aGVuIHRoZSBjb21wb25lbnQgYXR0YWNoaW5nXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gYSBub2RlIGZvciB0aGUgZmlyc3QgdGltZVxuICAgICAgICAvLyAgICB1cmw6IGNjLlRleHR1cmUyRCwgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHR5cGVvZiBkZWZhdWx0XG4gICAgICAgIC8vICAgIHNlcmlhbGl6YWJsZTogdHJ1ZSwgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICB2aXNpYmxlOiB0cnVlLCAgICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgZGlzcGxheU5hbWU6ICdGb28nLCAvLyBvcHRpb25hbFxuICAgICAgICAvLyAgICByZWFkb25seTogZmFsc2UsICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIGZhbHNlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vIC4uLlxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHt9LFxuXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICAvLyB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuXG4gICAgLy8gfSxcbiAgICBpbml0OiBmdW5jdGlvbiBpbml0KHNjb3JlRlgpIHtcbiAgICAgICAgdGhpcy5zY29yZUZYID0gc2NvcmVGWDtcbiAgICB9LFxuXG4gICAgaGlkZUZYOiBmdW5jdGlvbiBoaWRlRlgoKSB7XG4gICAgICAgIHRoaXMuc2NvcmVGWC5kZXNwYXduKCk7XG4gICAgfVxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICdmNzZiYmdRUEFGSmVMaG9PK2VUU2U1bCcsICdTY29yZUZYJyk7XG4vLyBzY3JpcHRzXFxTY29yZUZYLmpzXG5cbmNjLkNsYXNzKHtcbiAgICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgYW5pbToge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuQW5pbWF0aW9uXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdChnYW1lKSB7XG4gICAgICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgICAgIHRoaXMuYW5pbS5nZXRDb21wb25lbnQoJ1Njb3JlQW5pbScpLmluaXQodGhpcyk7XG4gICAgfSxcblxuICAgIGRlc3Bhd246IGZ1bmN0aW9uIGRlc3Bhd24oKSB7XG4gICAgICAgIHRoaXMuZ2FtZS5kZXNwYXduU2NvcmVGWCh0aGlzLm5vZGUpO1xuICAgIH0sXG5cbiAgICBwbGF5OiBmdW5jdGlvbiBwbGF5KCkge1xuICAgICAgICAvL+aSreaUvuW4p+WKqOeUu1xuICAgICAgICB0aGlzLmFuaW0ucGxheSgnc2NvcmVfcG9wJyk7XG4gICAgfVxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICcwMjIyOHA1VVB4Rmc2T2FPZmh2NWlqQycsICdTdGFyJyk7XG4vLyBzY3JpcHRzXFxTdGFyLmpzXG5cbmNjLkNsYXNzKHtcbiAgICBcImV4dGVuZHNcIjogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuXG4gICAgICAgIC8v56Kw5pKe6Led56a7XG4gICAgICAgIHBpY2tSYWRpdXM6IDYwLFxuICAgICAgICAvL+a4uOaIj+WvueixoVxuICAgICAgICBnYW1lOiB7XG4gICAgICAgICAgICBcImRlZmF1bHRcIjogbnVsbCxcbiAgICAgICAgICAgIHNlcmlhbGl6YWJsZTogZmFsc2VcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgIGNjLmxvZyhcInN0YXI6b25Mb2FkXCIpO1xuICAgIH0sXG4gICAgLy/liqDovb3muLjmiI/lr7nosaFcbiAgICBpbml0OiBmdW5jdGlvbiBpbml0KGcpIHtcbiAgICAgICAgY2MubG9nKFwic3Rhcjppbml0XCIpO1xuICAgICAgICB0aGlzLmdhbWUgPSBnO1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgICAvL+iuvue9rumAj+aYjuW6plxuICAgICAgICB0aGlzLm5vZGUub3BhY2l0eSA9IDI1NTtcbiAgICB9LFxuXG4gICAgcmV1c2U6IGZ1bmN0aW9uIHJldXNlKGdhbWUpIHtcbiAgICAgICAgdGhpcy5pbml0KGdhbWUpO1xuICAgIH0sXG5cbiAgICBnZXRQbGF5ZXJEaXN0YW5jZTogZnVuY3Rpb24gZ2V0UGxheWVyRGlzdGFuY2UoKSB7XG5cbiAgICAgICAgLy8g5qC55o2uIHBsYXllciDoioLngrnkvY3nva7liKTmlq3ot53nprtcbiAgICAgICAgdmFyIHBsYXllclBvcyA9IHRoaXMuZ2FtZS5wbGF5ZXIubm9kZS5nZXRQb3NpdGlvbigpO1xuICAgICAgICBjYy5sb2coXCJzdGFyOmdldFBsYXllckRpc3RhbmNlXCIgKyBwbGF5ZXJQb3MueCk7XG4gICAgICAgIC8vIOagueaNruS4pOeCueS9jee9ruiuoeeul+S4pOeCueS5i+mXtOi3neemu1xuICAgICAgICB2YXIgZGlzdCA9IGNjLnBEaXN0YW5jZSh0aGlzLm5vZGUucG9zaXRpb24sIHBsYXllclBvcyk7XG5cbiAgICAgICAgcmV0dXJuIGRpc3Q7XG4gICAgfSxcblxuICAgIG9uUGlja2VkOiBmdW5jdGlvbiBvblBpY2tlZCgpIHtcbiAgICAgICAgY2MubG9nKFwic3RhcjpvblBpY2tlZFwiKTtcbiAgICAgICAgdmFyIHBvcyA9IHRoaXMubm9kZS5nZXRQb3NpdGlvbigpO1xuICAgICAgICAvLyDosIPnlKggR2FtZSDohJrmnKznmoTlvpfliIbmlrnms5VcbiAgICAgICAgdGhpcy5nYW1lLmdhaW5TY29yZShwb3MpO1xuICAgICAgICAvLyDlvZPmmJ/mmJ/ooqvmlLbpm4bml7bvvIzosIPnlKggR2FtZSDohJrmnKzkuK3nmoTmjqXlj6PvvIzplIDmr4HlvZPliY3mmJ/mmJ/oioLngrnvvIznlJ/miJDkuIDkuKrmlrDnmoTmmJ/mmJ9cbiAgICAgICAgdGhpcy5nYW1lLmRlc3Bhd25TdGFyKHRoaXMubm9kZSk7XG4gICAgfSxcbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuICAgIC8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbiAgICAvLyB9LFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKGR0KSB7XG4gICAgICAgIGNjLmxvZyhcIjIxXCIpO1xuICAgICAgICAvLyDmoLnmja4gR2FtZSDohJrmnKzkuK3nmoTorqHml7blmajmm7TmlrDmmJ/mmJ/nmoTpgI/mmI7luqZcbiAgICAgICAgdmFyIG9wYWNpdHlSYXRpbyA9IDEgLSB0aGlzLmdhbWUudGltZXIgLyB0aGlzLmdhbWUuc3RhckR1cmF0aW9uO1xuICAgICAgICB2YXIgbWluT3BhY2l0eSA9IDUwO1xuICAgICAgICAvL+iuvue9rumAj+aYjuW6plxuICAgICAgICB0aGlzLm5vZGUub3BhY2l0eSA9IG1pbk9wYWNpdHkgKyBNYXRoLmZsb29yKG9wYWNpdHlSYXRpbyAqICgyNTUgLSBtaW5PcGFjaXR5KSk7XG4gICAgICAgIC8vIOavj+W4p+WIpOaWreWSjOS4u+inkuS5i+mXtOeahOi3neemu+aYr+WQpuWwj+S6juaUtumbhui3neemu1xuICAgICAgICBpZiAodGhpcy5nZXRQbGF5ZXJEaXN0YW5jZSgpIDwgdGhpcy5waWNrUmFkaXVzKSB7XG4gICAgICAgICAgICAvLyDosIPnlKjmlLbpm4booYzkuLpcbiAgICAgICAgICAgIHRoaXMub25QaWNrZWQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHt9XG4gICAgfVxuXG59KTtcblxuY2MuX1JGcG9wKCk7Il19
