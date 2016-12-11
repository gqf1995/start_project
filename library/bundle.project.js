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
        //得分label
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2NvY29zY3JlYXRvci9Db2Nvc0NyZWF0b3IvcmVzb3VyY2VzL2FwcC5hc2FyL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvc2NyaXB0cy9HYW1lLmpzIiwiYXNzZXRzL3NjcmlwdHMvUGxheWVyLmpzIiwiYXNzZXRzL3NjcmlwdHMvU2NvcmVBbmltLmpzIiwiYXNzZXRzL3NjcmlwdHMvU2NvcmVGWC5qcyIsImFzc2V0cy9zY3JpcHRzL1N0YXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJ2NhMWUwd2orOWxGaXFlenRTUUtOakZBJywgJ0dhbWUnKTtcbi8vIHNjcmlwdHNcXEdhbWUuanNcblxudmFyIFBsYXllciA9IHJlcXVpcmUoJ1BsYXllcicpO1xudmFyIFNjb3JlRlggPSByZXF1aXJlKCdTY29yZUZYJyk7XG52YXIgU3RhciA9IHJlcXVpcmUoJ1N0YXInKTtcblxudmFyIEdhbWUgPSBjYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIGZvbzoge1xuICAgICAgICAvLyAgICBkZWZhdWx0OiBudWxsLCAgICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZCBvbmx5IHdoZW4gdGhlIGNvbXBvbmVudCBhdHRhY2hpbmdcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICB0byBhIG5vZGUgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAgICAgIC8vICAgIHVybDogY2MuVGV4dHVyZTJELCAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHlwZW9mIGRlZmF1bHRcbiAgICAgICAgLy8gICAgc2VyaWFsaXphYmxlOiB0cnVlLCAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIHZpc2libGU6IHRydWUsICAgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICBkaXNwbGF5TmFtZTogJ0ZvbycsIC8vIG9wdGlvbmFsXG4gICAgICAgIC8vICAgIHJlYWRvbmx5OiBmYWxzZSwgICAgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgZmFsc2VcbiAgICAgICAgLy8gfSxcbiAgICAgICAgLy8gLi4uXG4gICAgICAgIC8v55Sf5oiQ55qE5pif5pifXG4gICAgICAgIHN0YXJQcmVmYWI6IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLlByZWZhYlxuICAgICAgICB9LFxuICAgICAgICAvL+eUn+aIkOeahOeIhueCuOWKqOeUu1xuICAgICAgICBzY29yZUZYUHJlZmFiOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5QcmVmYWJcbiAgICAgICAgfSxcbiAgICAgICAgLy/lvIDlp4vmjInpkq5cbiAgICAgICAgYnRuTm9kZToge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxuICAgICAgICB9LFxuICAgICAgICAvL+e7k+adn+aPkOekulxuICAgICAgICBnYW1lT3Zlck5vZGU6IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGVcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5pif5pif5Lqn55Sf5ZCO5raI5aSx5pe26Ze055qE6ZqP5py66IyD5Zu0XG4gICAgICAgIG1heFN0YXJEdXJhdGlvbjogNSxcbiAgICAgICAgbWluU3RhckR1cmF0aW9uOiAzLFxuICAgICAgICAvLyDlnLDpnaLoioLngrnvvIznlKjkuo7noa7lrprmmJ/mmJ/nlJ/miJDnmoTpq5jluqZcbiAgICAgICAgZ3JvdW5kOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgICAgIH0sXG4gICAgICAgIC8vIHBsYXllciDoioLngrnvvIznlKjkuo7ojrflj5bkuLvop5LlvLnot7PnmoTpq5jluqbvvIzlkozmjqfliLbkuLvop5LooYzliqjlvIDlhbNcbiAgICAgICAgcGxheWVyOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBQbGF5ZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy/lvpfliIZsYWJlbFxuICAgICAgICBzY29yZURpc3BsYXk6IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOW+l+WIhumfs+aViOi1hOa6kFxuICAgICAgICBzY29yZUF1ZGlvOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB1cmw6IGNjLkF1ZGlvQ2xpcFxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICAvLyDojrflj5blnLDlubPpnaLnmoQgeSDovbTlnZDmoIdcbiAgICAgICAgdGhpcy5ncm91bmRZID0gdGhpcy5ncm91bmQueSArIHRoaXMuZ3JvdW5kLmhlaWdodCAvIDI7XG5cbiAgICAgICAgLy8g6YeN572u5pif5pifXG4gICAgICAgIHRoaXMuY3VycmVudFN0YXIgPSBudWxsO1xuICAgICAgICB0aGlzLmN1cnJlbnRTdGFyWCA9IDA7XG5cbiAgICAgICAgLy8g5Yid5aeL5YyW6K6h5pe25ZmoXG4gICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgICAgICB0aGlzLnN0YXJEdXJhdGlvbiA9IDA7XG4gICAgICAgIC8qLy8g55Sf5oiQ5LiA5Liq5paw55qE5pif5pifXHJcbiAgICAgICAgdGhpcy5zcGF3bk5ld1N0YXIoKTsqL1xuICAgICAgICAvLyDliJ3lp4vljJborqHliIZcbiAgICAgICAgLy90aGlzLnNjb3JlID0gMDtcblxuICAgICAgICAvLyDorr7nva7liKTmlq3muLjmiI/mmK/lkKbov5vooYzkuK1cbiAgICAgICAgdGhpcy5pc1J1bm5pbmcgPSBmYWxzZTtcblxuICAgICAgICAvLyBpbml0aWFsaXplIHN0YXIgYW5kIHNjb3JlIHBvb2xcbiAgICAgICAgdGhpcy5zdGFyUG9vbCA9IG5ldyBjYy5Ob2RlUG9vbCgnU3RhcicpO1xuICAgICAgICB0aGlzLnNjb3JlUG9vbCA9IG5ldyBjYy5Ob2RlUG9vbCgnU2NvcmVGWCcpO1xuICAgICAgICBjYy5sb2coXCJvbkxvYWRcIik7XG4gICAgfSxcbiAgICBnYWluU2NvcmU6IGZ1bmN0aW9uIGdhaW5TY29yZShwb3MpIHtcbiAgICAgICAgdGhpcy5zY29yZSArPSAxO1xuICAgICAgICAvLyDmm7TmlrAgc2NvcmVEaXNwbGF5IExhYmVsIOeahOaWh+Wtl1xuICAgICAgICB0aGlzLnNjb3JlRGlzcGxheS5zdHJpbmcgPSAnU2NvcmU6ICcgKyB0aGlzLnNjb3JlLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgLy8g5pKt5pS+54m55pWIXG4gICAgICAgIHZhciBmeCA9IHRoaXMuc3Bhd25TY29yZUZYKCk7XG4gICAgICAgIHRoaXMubm9kZS5hZGRDaGlsZChmeC5ub2RlKTtcbiAgICAgICAgZngubm9kZS5zZXRQb3NpdGlvbihwb3MpO1xuICAgICAgICBmeC5wbGF5KCk7XG5cbiAgICAgICAgLy8g5pKt5pS+5b6X5YiG6Z+z5pWIXG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QodGhpcy5zY29yZUF1ZGlvLCBmYWxzZSk7XG4gICAgfSxcblxuICAgIHNwYXduTmV3U3RhcjogZnVuY3Rpb24gc3Bhd25OZXdTdGFyKCkge1xuICAgICAgICB2YXIgbmV3U3RhciA9IG51bGw7XG5cbiAgICAgICAgLy8g5L2/55So57uZ5a6a55qE5qih5p2/5Zyo5Zy65pmv5Lit55Sf5oiQ5LiA5Liq5paw6IqC54K5XG4gICAgICAgIGlmICh0aGlzLnN0YXJQb29sLnNpemUoKSA+IDApIHtcbiAgICAgICAgICAgIG5ld1N0YXIgPSB0aGlzLnN0YXJQb29sLmdldCgpLmdldENvbXBvbmVudCgnU3RhcicpOyAvLyB0aGlzIHdpbGwgYmUgcGFzc2VkIHRvIFN0YXIncyByZXVzZSBtZXRob2RcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdTdGFyID0gY2MuaW5zdGFudGlhdGUodGhpcy5zdGFyUHJlZmFiKS5nZXRDb21wb25lbnQoJ1N0YXInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgLy8g5byA6LW35raI5aSx6K6h5pe2XG4gICAgICAgIHRoaXMuc3RhcnRUaW1lcigpO1xuXG4gICAgICAgIC8vIOS4uuaYn+aYn+iuvue9ruS4gOS4qumaj+acuuS9jee9rlxuICAgICAgICAvL+iuvue9ruS4jeS6huS9jee9rlxuICAgICAgICB2YXIgcCA9IHRoaXMuZ2V0TmV3U3RhclBvc2l0aW9uKCk7XG5cbiAgICAgICAgdGhpcy5jdXJyZW50U3RhciA9IG5ld1N0YXI7XG4gICAgICAgIC8vIOWwhuaWsOWinueahOiKgueCuea3u+WKoOWIsCBDYW52YXMg6IqC54K55LiL6Z2iXG4gICAgICAgIHRoaXMubm9kZS5hZGRDaGlsZCh0aGlzLmN1cnJlbnRTdGFyLm5vZGUpO1xuXG4gICAgICAgIGNjLmxvZyhcInAyXCIpO1xuICAgICAgICB0aGlzLmN1cnJlbnRTdGFyLm5vZGUuc2V0UG9zaXRpb24ocCk7XG5cbiAgICAgICAgdGhpcy5jdXJyZW50U3Rhci5pbml0KHRoaXMpO1xuICAgICAgICAvLyDliJ3lp4vljJbmmJ/mmJ9cbiAgICAgICAgLy9uZXdTdGFyLmdldENvbXBvbmVudCgnU3RhcicpLmluaXQodGhpcyk7XG4gICAgfSxcbiAgICBkZXNwYXduU3RhcjogZnVuY3Rpb24gZGVzcGF3blN0YXIoc3Rhcikge1xuICAgICAgICB0aGlzLnN0YXJQb29sLnB1dChzdGFyKTtcbiAgICAgICAgdGhpcy5zcGF3bk5ld1N0YXIoKTtcbiAgICB9LFxuICAgIC8v5ZCv5Yqo5pif5pif5raI5aSx6K6h5pe2XG4gICAgc3RhcnRUaW1lcjogZnVuY3Rpb24gc3RhcnRUaW1lcigpIHtcblxuICAgICAgICAvLyDorr7nva7mjIHnu63ml7bpl7RcbiAgICAgICAgdGhpcy5zdGFyRHVyYXRpb24gPSB0aGlzLm1pblN0YXJEdXJhdGlvbiArIGNjLnJhbmRvbTBUbzEoKSAqICh0aGlzLm1heFN0YXJEdXJhdGlvbiAtIHRoaXMubWluU3RhckR1cmF0aW9uKTtcbiAgICAgICAgY2MubG9nKFwic3RhckR1cmF0aW9uXCIgKyB0aGlzLnN0YXJEdXJhdGlvbik7XG4gICAgICAgIC8v5byA5aeL6K6h5pe2XG4gICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgIH0sXG5cbiAgICBzcGF3blNjb3JlRlg6IGZ1bmN0aW9uIHNwYXduU2NvcmVGWCgpIHtcbiAgICAgICAgdmFyIGZ4O1xuICAgICAgICBpZiAodGhpcy5zY29yZVBvb2wuc2l6ZSgpID4gMCkge1xuICAgICAgICAgICAgLy/lpoLmnpzlt7Lnu4/kuqfnlJ/kuobkuIDmrKHnibnmlYjliJnlpI3nlKhcbiAgICAgICAgICAgIGZ4ID0gdGhpcy5zY29yZVBvb2wuZ2V0KCk7XG4gICAgICAgICAgICByZXR1cm4gZnguZ2V0Q29tcG9uZW50KCdTY29yZUZYJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL+WIm+W7uuaWsOeahOeJueaViOeyvueBtVxuICAgICAgICAgICAgZnggPSBjYy5pbnN0YW50aWF0ZSh0aGlzLnNjb3JlRlhQcmVmYWIpLmdldENvbXBvbmVudCgnU2NvcmVGWCcpO1xuICAgICAgICAgICAgZnguaW5pdCh0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiBmeDtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2V0TmV3U3RhclBvc2l0aW9uOiBmdW5jdGlvbiBnZXROZXdTdGFyUG9zaXRpb24oKSB7XG4gICAgICAgIGNjLmxvZyhcImdldE5ld1N0YXJQb3NpdGlvblwiKTtcbiAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRTdGFyKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGFyWCA9IGNjLnJhbmRvbU1pbnVzMVRvMSgpICogdGhpcy5ub2RlLndpZHRoIC8gMjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByYW5kWCA9IDA7XG4gICAgICAgIC8vIOagueaNruWcsOW5s+mdouS9jee9ruWSjOS4u+inkui3s+i3g+mrmOW6pu+8jOmaj+acuuW+l+WIsOS4gOS4quaYn+aYn+eahCB5IOWdkOagh1xuICAgICAgICB2YXIgcmFuZFkgPSB0aGlzLmdyb3VuZFkgKyBjYy5yYW5kb20wVG8xKCkgKiB0aGlzLnBsYXllci5nZXRDb21wb25lbnQoJ1BsYXllcicpLmp1bXBIZWlnaHQgKyA1MDtcbiAgICAgICAgLy8g5qC55o2u5bGP5bmV5a695bqm77yM6ZqP5py65b6X5Yiw5LiA5Liq5pif5pifIHgg5Z2Q5qCHXG4gICAgICAgIHZhciBtYXhYID0gdGhpcy5ub2RlLndpZHRoIC8gMjtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFN0YXJYID49IDApIHtcbiAgICAgICAgICAgIHJhbmRYID0gLWNjLnJhbmRvbTBUbzEoKSAqIG1heFg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByYW5kWCA9IGNjLnJhbmRvbTBUbzEoKSAqIG1heFg7XG4gICAgICAgIH1cbiAgICAgICAgcmFuZFggPSBjYy5yYW5kb21NaW51czFUbzEoKSAqIG1heFg7XG4gICAgICAgIC8vIOi/lOWbnuaYn+aYn+WdkOagh1xuICAgICAgICByZXR1cm4gY2MucChyYW5kWCwgcmFuZFkpO1xuICAgIH0sXG4gICAgZGVzcGF3blNjb3JlRlg6IGZ1bmN0aW9uIGRlc3Bhd25TY29yZUZYKHNjb3JlRlgpIHtcbiAgICAgICAgdGhpcy5zY29yZVBvb2wucHV0KHNjb3JlRlgpO1xuICAgIH0sXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShkdCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNSdW5uaW5nKSByZXR1cm47XG4gICAgICAgIC8vIOavj+W4p+abtOaWsOiuoeaXtuWZqO+8jOi2hei/h+mZkOW6pui/mOayoeacieeUn+aIkOaWsOeahOaYn+aYn1xuICAgICAgICAvLyDlsLHkvJrosIPnlKjmuLjmiI/lpLHotKXpgLvovpFcbiAgICAgICAgaWYgKHRoaXMudGltZXIgPiB0aGlzLnN0YXJEdXJhdGlvbikge1xuICAgICAgICAgICAgdGhpcy5nYW1lT3ZlcigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZXIgKz0gZHQ7XG4gICAgfSxcbiAgICAvL+mHjee9ruWIhuaVsFxuICAgIHJlc2V0U2NvcmU6IGZ1bmN0aW9uIHJlc2V0U2NvcmUoKSB7XG4gICAgICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgICAgICB0aGlzLnNjb3JlRGlzcGxheS5zdHJpbmcgPSAnU2NvcmU6ICcgKyB0aGlzLnNjb3JlLnRvU3RyaW5nKCk7XG4gICAgfSxcbiAgICBvblN0YXJ0R2FtZTogZnVuY3Rpb24gb25TdGFydEdhbWUoKSB7XG4gICAgICAgIGNjLmxvZyhcIm9uU3RhcnRHYW1lXCIpO1xuXG4gICAgICAgIC8vIOWIneWni+WMluiuoeWIhlxuICAgICAgICB0aGlzLnJlc2V0U2NvcmUoKTtcbiAgICAgICAgLy8gc2V0IGdhbWUgc3RhdGUgdG8gcnVubmluZ1xuICAgICAgICB0aGlzLmlzUnVubmluZyA9IHRydWU7XG4gICAgICAgIC8vIOiuvue9ruW8gOWni+aMiemSruS9jee9rlxuICAgICAgICB0aGlzLmJ0bk5vZGUuc2V0UG9zaXRpb25YKDMwMDApO1xuICAgICAgICB0aGlzLmdhbWVPdmVyTm9kZS5hY3RpdmUgPSBmYWxzZTtcblxuICAgICAgICAvLyDorr7nva5wbGF5ZXLliJ3lp4vkvY3nva5cbiAgICAgICAgdGhpcy5wbGF5ZXIuc3RhcnRNb3ZlQXQoY2MucCgwLCB0aGlzLmdyb3VuZFkpKTtcblxuICAgICAgICAvLyDkuqfnlJ/kuIDkuKrmlrDnmoTmmJ/mmJ9cbiAgICAgICAgdGhpcy5zcGF3bk5ld1N0YXIoKTtcbiAgICB9LFxuICAgIGdhbWVPdmVyOiBmdW5jdGlvbiBnYW1lT3ZlcigpIHtcbiAgICAgICAgLyp0aGlzLnBsYXllci5zdG9wQWxsQWN0aW9ucygpOyAvL+WBnOatoiBwbGF5ZXIg6IqC54K555qE6Lez6LeD5Yqo5L2cXHJcbiAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKCdnYW1lJyk7Ki9cbiAgICAgICAgY2MubG9nKFwiZ2FtZU92ZXJcIik7XG4gICAgICAgIHRoaXMuY3VycmVudFN0YXIubm9kZS5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMuZ2FtZU92ZXJOb2RlLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMucGxheWVyLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuc3RvcE1vdmUoKTtcbiAgICAgICAgdGhpcy5pc1J1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5idG5Ob2RlLnNldFBvc2l0aW9uWCgwKTtcbiAgICB9XG59KTtcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzFjZTliSkdKTDlOWGI0dm4xSTFjZ0FZJywgJ1BsYXllcicpO1xuLy8gc2NyaXB0c1xcUGxheWVyLmpzXG5cbmNjLkNsYXNzKHtcbiAgICBcImV4dGVuZHNcIjogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyBmb286IHtcbiAgICAgICAgLy8gICAgZGVmYXVsdDogbnVsbCwgICAgICAvLyBUaGUgZGVmYXVsdCB2YWx1ZSB3aWxsIGJlIHVzZWQgb25seSB3aGVuIHRoZSBjb21wb25lbnQgYXR0YWNoaW5nXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gYSBub2RlIGZvciB0aGUgZmlyc3QgdGltZVxuICAgICAgICAvLyAgICB1cmw6IGNjLlRleHR1cmUyRCwgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHR5cGVvZiBkZWZhdWx0XG4gICAgICAgIC8vICAgIHNlcmlhbGl6YWJsZTogdHJ1ZSwgLy8gb3B0aW9uYWwsIGRlZmF1bHQgaXMgdHJ1ZVxuICAgICAgICAvLyAgICB2aXNpYmxlOiB0cnVlLCAgICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgZGlzcGxheU5hbWU6ICdGb28nLCAvLyBvcHRpb25hbFxuICAgICAgICAvLyAgICByZWFkb25seTogZmFsc2UsICAgIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIGZhbHNlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIC8vIC4uLlxuICAgICAgICAvLyDkuLvop5Lot7Pot4Ppq5jluqZcbiAgICAgICAganVtcEhlaWdodDogMCxcbiAgICAgICAgLy8g5Li76KeS6Lez6LeD5oyB57ut5pe26Ze0XG4gICAgICAgIGp1bXBEdXJhdGlvbjogMCxcbiAgICAgICAgLy8g6L6F5Yqp5b2i5Y+Y5Yqo5L2c5pe26Ze0XG4gICAgICAgIHNxdWFzaER1cmF0aW9uOiAwLFxuICAgICAgICAvLyDmnIDlpKfnp7vliqjpgJ/luqZcbiAgICAgICAgbWF4TW92ZVNwZWVkOiAwLFxuICAgICAgICAvLyDliqDpgJ/luqZcbiAgICAgICAgYWNjZWw6IDAsXG4gICAgICAgIC8vIOi3s+i3g+mfs+aViOi1hOa6kFxuICAgICAgICBqdW1wQXVkaW86IHtcbiAgICAgICAgICAgIFwiZGVmYXVsdFwiOiBudWxsLFxuICAgICAgICAgICAgdXJsOiBjYy5BdWRpb0NsaXBcbiAgICAgICAgfVxuXG4gICAgfSxcblxuICAgIHNldEp1bXBBY3Rpb246IGZ1bmN0aW9uIHNldEp1bXBBY3Rpb24oKSB7XG4gICAgICAgIGNjLmxvZyhcInBsYXllcjpzZXRKdW1wQWN0aW9uXCIpO1xuICAgICAgICAvLyDot7Pot4PkuIrljYdcbiAgICAgICAgdmFyIGp1bXBVcCA9IGNjLm1vdmVCeSh0aGlzLmp1bXBEdXJhdGlvbiwgY2MucCgwLCB0aGlzLmp1bXBIZWlnaHQpKS5lYXNpbmcoY2MuZWFzZUN1YmljQWN0aW9uT3V0KCkpO1xuICAgICAgICAvLyDkuIvokL1cbiAgICAgICAgdmFyIGp1bXBEb3duID0gY2MubW92ZUJ5KHRoaXMuanVtcER1cmF0aW9uLCBjYy5wKDAsIC10aGlzLmp1bXBIZWlnaHQpKS5lYXNpbmcoY2MuZWFzZUN1YmljQWN0aW9uSW4oKSk7XG4gICAgICAgIC8vIOW9ouWPmFxuICAgICAgICB2YXIgc3F1YXNoID0gY2Muc2NhbGVUbyh0aGlzLnNxdWFzaER1cmF0aW9uLCAxLCAwLjYpO1xuICAgICAgICB2YXIgc3RyZXRjaCA9IGNjLnNjYWxlVG8odGhpcy5zcXVhc2hEdXJhdGlvbiwgMSwgMS4yKTtcbiAgICAgICAgdmFyIHNjYWxlQmFjayA9IGNjLnNjYWxlVG8odGhpcy5zcXVhc2hEdXJhdGlvbiwgMSwgMSk7XG4gICAgICAgIC8vIOa3u+WKoOS4gOS4quWbnuiwg+WHveaVsO+8jOeUqOS6juWcqOWKqOS9nOe7k+adn+aXtuiwg+eUqOaIkeS7rOWumuS5ieeahOWFtuS7luaWueazlVxuICAgICAgICB2YXIgY2FsbGJhY2sgPSBjYy5jYWxsRnVuYyh0aGlzLnBsYXlKdW1wU291bmQsIHRoaXMpO1xuICAgICAgICAvLyDkuI3mlq3ph43lpI3vvIzogIzkuJTmr4/mrKHlrozmiJDokL3lnLDliqjkvZzlkI7osIPnlKjlm57osIPmnaXmkq3mlL7lo7Dpn7NcbiAgICAgICAgcmV0dXJuIGNjLnJlcGVhdEZvcmV2ZXIoY2Muc2VxdWVuY2UoanVtcFVwLCBqdW1wRG93biwgY2FsbGJhY2spKTtcbiAgICB9LFxuICAgIHBsYXlKdW1wU291bmQ6IGZ1bmN0aW9uIHBsYXlKdW1wU291bmQoKSB7XG4gICAgICAgIC8vIOiwg+eUqOWjsOmfs+W8leaTjuaSreaUvuWjsOmfs1xuICAgICAgICBjYy5hdWRpb0VuZ2luZS5wbGF5RWZmZWN0KHRoaXMuanVtcEF1ZGlvLCBmYWxzZSk7XG4gICAgfSxcbiAgICBnZXRDZW50ZXJQb3M6IGZ1bmN0aW9uIGdldENlbnRlclBvcygpIHtcbiAgICAgICAgdmFyIGNlbnRlclBvcyA9IGNjLnAodGhpcy5ub2RlLngsIHRoaXMubm9kZS55ICsgdGhpcy5ub2RlLmhlaWdodCAvIDIpO1xuICAgICAgICByZXR1cm4gY2VudGVyUG9zO1xuICAgIH0sXG4gICAgc3RhcnRNb3ZlQXQ6IGZ1bmN0aW9uIHN0YXJ0TW92ZUF0KHBvcykge1xuICAgICAgICBjYy5sb2coXCJwbGF5ZXI6c3RhcnRNb3ZlQXRcIik7XG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMueFNwZWVkID0gMDtcbiAgICAgICAgdGhpcy5ub2RlLnNldFBvc2l0aW9uKHBvcyk7XG4gICAgICAgIHRoaXMubm9kZS5ydW5BY3Rpb24odGhpcy5zZXRKdW1wQWN0aW9uKCkpO1xuICAgIH0sXG5cbiAgICBzdG9wTW92ZTogZnVuY3Rpb24gc3RvcE1vdmUoKSB7XG4gICAgICAgIGNjLmxvZyhcInBsYXllcjpzdG9wTW92ZVwiKTtcbiAgICAgICAgdGhpcy5ub2RlLnN0b3BBbGxBY3Rpb25zKCk7XG4gICAgfSxcbiAgICBzZXRJbnB1dENvbnRyb2w6IGZ1bmN0aW9uIHNldElucHV0Q29udHJvbCgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAvLyDmt7vliqDplK7nm5jkuovku7bnm5HlkKxcbiAgICAgICAgY2MuZXZlbnRNYW5hZ2VyLmFkZExpc3RlbmVyKHtcbiAgICAgICAgICAgIGV2ZW50OiBjYy5FdmVudExpc3RlbmVyLktFWUJPQVJELFxuICAgICAgICAgICAgLy8g5pyJ5oyJ6ZSu5oyJ5LiL5pe277yM5Yik5pat5piv5ZCm5piv5oiR5Lus5oyH5a6a55qE5pa55ZCR5o6n5Yi26ZSu77yM5bm26K6+572u5ZCR5a+55bqU5pa55ZCR5Yqg6YCfXG4gICAgICAgICAgICBvbktleVByZXNzZWQ6IGZ1bmN0aW9uIG9uS2V5UHJlc3NlZChrZXlDb2RlLCBldmVudCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoa2V5Q29kZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5hOlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjUmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5kOlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NMZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyDmnb7lvIDmjInplK7ml7bvvIzlgZzmraLlkJHor6XmlrnlkJHnmoTliqDpgJ9cbiAgICAgICAgICAgIG9uS2V5UmVsZWFzZWQ6IGZ1bmN0aW9uIG9uS2V5UmVsZWFzZWQoa2V5Q29kZSwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuYTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjTGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSwgc2VsZi5ub2RlKTtcbiAgICB9LFxuXG4gICAgb25FbnRlcjogZnVuY3Rpb24gb25FbnRlcigpIHtcbiAgICAgICAgY2MuaW5wdXRNYW5hZ2VyLnNldEFjY2VsZXJvbWV0ZXJFbmFibGVkKHRydWUpO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGNjLmV2ZW50TWFuYWdlci5hZGRMaXN0ZW5lcih7XG4gICAgICAgICAgICBldmVudDogY2MuRXZlbnRMaXN0ZW5lci5BQ0NFTEVSQVRJT04sXG4gICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24gY2FsbGJhY2soYWNjLCBldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBmYWNpbmdVcCA9IC0xO1xuICAgICAgICAgICAgICAgIGlmIChhY2MueiA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZmFjaW5nVXAgPSArMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHRpbHRMUiA9IE1hdGgucm91bmQoYWNjLnggLyA5LjgxICogLTkwKTtcbiAgICAgICAgICAgICAgICB2YXIgdGlsdEZCID0gTWF0aC5yb3VuZCgoYWNjLnkgKyA5LjgxKSAvIDkuODEgKiA5MCAqIGZhY2luZ1VwKTtcblxuICAgICAgICAgICAgICAgIC8qY2MubG9nKFwiTFJcIit0aWx0TFIpO1xyXG4gICAgICAgICAgICAgICAgY2MubG9nKFwiRkJcIit0aWx0RkIpO1xyXG4gICAgICAgICAgICAgICAgIGNjLmxvZyhcInhcIithY2MueCk7XHJcbiAgICAgICAgICAgICAgICAgIGNjLmxvZyhcInlcIithY2MueSk7Ki9cbiAgICAgICAgICAgICAgICAvL+WIpOaWreW3puWPs+mHjeWKm1xuICAgICAgICAgICAgICAgIGlmICh0aWx0TFIgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjTGVmdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjUmlnaHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRpbHRMUiA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NMZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjUmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjTGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCBzZWxmLm5vZGUpO1xuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgIGNjLmxvZyhcInBsYXllcjpvbkxvYWRcIik7XG4gICAgICAgIC8vIOWKoOmAn+W6puaWueWQkeW8gOWFs1xuICAgICAgICB0aGlzLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5hY2NSaWdodCA9IGZhbHNlO1xuICAgICAgICAvLyDkuLvop5LlvZPliY3msLTlubPmlrnlkJHpgJ/luqZcbiAgICAgICAgdGhpcy54U3BlZWQgPSAwO1xuXG4gICAgICAgIC8vIOiuvue9ruW3puWPs+i+uei3nVxuICAgICAgICAvL3RoaXMubWluUG9zWCA9IC10aGlzLm5vZGUucGFyZW50LndpZHRoLzI7XG4gICAgICAgIC8vdGhpcy5tYXhQb3NYID0gdGhpcy5ub2RlLnBhcmVudC53aWR0aC8yO1xuXG4gICAgICAgIHRoaXMubm9kZS5zZXRQb3NpdGlvblkoMCArIHRoaXMubm9kZS5oZWlnaHQgLyAyKTtcblxuICAgICAgICAvLyDliJ3lp4vljJbot7Pot4PliqjkvZxcbiAgICAgICAgdGhpcy5qdW1wQWN0aW9uID0gdGhpcy5zZXRKdW1wQWN0aW9uKCk7XG4gICAgICAgIC8vdGhpcy5ub2RlLnJ1bkFjdGlvbih0aGlzLmp1bXBBY3Rpb24pO1xuXG4gICAgICAgIC8vIOWIneWni+WMlumUruebmOi+k+WFpeebkeWQrFxuICAgICAgICB0aGlzLnNldElucHV0Q29udHJvbCgpO1xuICAgICAgICB0aGlzLm9uRW50ZXIoKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoZHQpIHtcbiAgICAgICAgLy8g5qC55o2u5b2T5YmN5Yqg6YCf5bqm5pa55ZCR5q+P5bin5pu05paw6YCf5bqmXG4gICAgICAgIGlmICh0aGlzLmFjY0xlZnQpIHtcbiAgICAgICAgICAgIHRoaXMueFNwZWVkIC09IHRoaXMuYWNjZWwgKiBkdDtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmFjY1JpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLnhTcGVlZCArPSB0aGlzLmFjY2VsICogZHQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8g6ZmQ5Yi25Li76KeS55qE6YCf5bqm5LiN6IO96LaF6L+H5pyA5aSn5YC8XG4gICAgICAgIGlmIChNYXRoLmFicyh0aGlzLnhTcGVlZCkgPiB0aGlzLm1heE1vdmVTcGVlZCkge1xuICAgICAgICAgICAgLy8gaWYgc3BlZWQgcmVhY2ggbGltaXQsIHVzZSBtYXggc3BlZWQgd2l0aCBjdXJyZW50IGRpcmVjdGlvblxuICAgICAgICAgICAgdGhpcy54U3BlZWQgPSB0aGlzLm1heE1vdmVTcGVlZCAqIHRoaXMueFNwZWVkIC8gTWF0aC5hYnModGhpcy54U3BlZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9jYy5sb2coXCJwbGF5ZXI6dXBkYXRlXCIpO1xuICAgICAgICAvLyDmoLnmja7lvZPliY3pgJ/luqbmm7TmlrDkuLvop5LnmoTkvY3nva5cbiAgICAgICAgdGhpcy5ub2RlLnggKz0gdGhpcy54U3BlZWQgKiBkdDtcblxuICAgICAgICAvL+WIpOaWreaYr+WQpuWIsOi+vuWxj+W5lei+uee8mFxuXG4gICAgICAgIGlmICh0aGlzLm5vZGUueCA+IHRoaXMubm9kZS5wYXJlbnQud2lkdGggLyAyKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUueCA9IHRoaXMubm9kZS5wYXJlbnQud2lkdGggLyAyO1xuICAgICAgICAgICAgdGhpcy54U3BlZWQgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubm9kZS54IDwgLXRoaXMubm9kZS5wYXJlbnQud2lkdGggLyAyKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGUueCA9IC10aGlzLm5vZGUucGFyZW50LndpZHRoIC8gMjtcbiAgICAgICAgICAgIHRoaXMueFNwZWVkID0gMDtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbi8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbi8vIH0sXG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICcyZGMxOW5kc2xKSllKSU1JdHdQVkFXOCcsICdTY29yZUFuaW0nKTtcbi8vIHNjcmlwdHNcXFNjb3JlQW5pbS5qc1xuXG5jYy5DbGFzcyh7XG4gICAgXCJleHRlbmRzXCI6IGNjLkNvbXBvbmVudCxcbiAgICAvL+WKqOeUu+e7hOS7tlxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gZm9vOiB7XG4gICAgICAgIC8vICAgIGRlZmF1bHQ6IG51bGwsICAgICAgLy8gVGhlIGRlZmF1bHQgdmFsdWUgd2lsbCBiZSB1c2VkIG9ubHkgd2hlbiB0aGUgY29tcG9uZW50IGF0dGFjaGluZ1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvIGEgbm9kZSBmb3IgdGhlIGZpcnN0IHRpbWVcbiAgICAgICAgLy8gICAgdXJsOiBjYy5UZXh0dXJlMkQsICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0eXBlb2YgZGVmYXVsdFxuICAgICAgICAvLyAgICBzZXJpYWxpemFibGU6IHRydWUsIC8vIG9wdGlvbmFsLCBkZWZhdWx0IGlzIHRydWVcbiAgICAgICAgLy8gICAgdmlzaWJsZTogdHJ1ZSwgICAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyB0cnVlXG4gICAgICAgIC8vICAgIGRpc3BsYXlOYW1lOiAnRm9vJywgLy8gb3B0aW9uYWxcbiAgICAgICAgLy8gICAgcmVhZG9ubHk6IGZhbHNlLCAgICAvLyBvcHRpb25hbCwgZGVmYXVsdCBpcyBmYWxzZVxuICAgICAgICAvLyB9LFxuICAgICAgICAvLyAuLi5cbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7fSxcblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4gICAgLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcblxuICAgIC8vIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdChzY29yZUZYKSB7XG4gICAgICAgIHRoaXMuc2NvcmVGWCA9IHNjb3JlRlg7XG4gICAgfSxcblxuICAgIGhpZGVGWDogZnVuY3Rpb24gaGlkZUZYKCkge1xuICAgICAgICB0aGlzLnNjb3JlRlguZGVzcGF3bigpO1xuICAgIH1cbn0pO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnZjc2YmJnUVBBRkplTGhvTytlVFNlNWwnLCAnU2NvcmVGWCcpO1xuLy8gc2NyaXB0c1xcU2NvcmVGWC5qc1xuXG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGFuaW06IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLkFuaW1hdGlvblxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uIGluaXQoZ2FtZSkge1xuICAgICAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgICAgICB0aGlzLmFuaW0uZ2V0Q29tcG9uZW50KCdTY29yZUFuaW0nKS5pbml0KHRoaXMpO1xuICAgIH0sXG5cbiAgICBkZXNwYXduOiBmdW5jdGlvbiBkZXNwYXduKCkge1xuICAgICAgICB0aGlzLmdhbWUuZGVzcGF3blNjb3JlRlgodGhpcy5ub2RlKTtcbiAgICB9LFxuXG4gICAgcGxheTogZnVuY3Rpb24gcGxheSgpIHtcbiAgICAgICAgLy/mkq3mlL7luKfliqjnlLtcbiAgICAgICAgdGhpcy5hbmltLnBsYXkoJ3Njb3JlX3BvcCcpO1xuICAgIH1cbn0pO1xuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnMDIyMjhwNVVQeEZnNk9hT2ZodjVpakMnLCAnU3RhcicpO1xuLy8gc2NyaXB0c1xcU3Rhci5qc1xuXG5jYy5DbGFzcyh7XG4gICAgXCJleHRlbmRzXCI6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcblxuICAgICAgICAvL+eisOaSnui3neemu1xuICAgICAgICBwaWNrUmFkaXVzOiA2MCxcbiAgICAgICAgLy/muLjmiI/lr7nosaFcbiAgICAgICAgZ2FtZToge1xuICAgICAgICAgICAgXCJkZWZhdWx0XCI6IG51bGwsXG4gICAgICAgICAgICBzZXJpYWxpemFibGU6IGZhbHNlXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG4gICAgICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICBjYy5sb2coXCJzdGFyOm9uTG9hZFwiKTtcbiAgICB9LFxuICAgIC8v5Yqg6L295ri45oiP5a+56LGhXG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdChnKSB7XG4gICAgICAgIGNjLmxvZyhcInN0YXI6aW5pdFwiKTtcbiAgICAgICAgdGhpcy5nYW1lID0gZztcbiAgICAgICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgLy/orr7nva7pgI/mmI7luqZcbiAgICAgICAgdGhpcy5ub2RlLm9wYWNpdHkgPSAyNTU7XG4gICAgfSxcblxuICAgIHJldXNlOiBmdW5jdGlvbiByZXVzZShnYW1lKSB7XG4gICAgICAgIHRoaXMuaW5pdChnYW1lKTtcbiAgICB9LFxuXG4gICAgZ2V0UGxheWVyRGlzdGFuY2U6IGZ1bmN0aW9uIGdldFBsYXllckRpc3RhbmNlKCkge1xuXG4gICAgICAgIC8vIOagueaNriBwbGF5ZXIg6IqC54K55L2N572u5Yik5pat6Led56a7XG4gICAgICAgIHZhciBwbGF5ZXJQb3MgPSB0aGlzLmdhbWUucGxheWVyLm5vZGUuZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgY2MubG9nKFwic3RhcjpnZXRQbGF5ZXJEaXN0YW5jZVwiICsgcGxheWVyUG9zLngpO1xuICAgICAgICAvLyDmoLnmja7kuKTngrnkvY3nva7orqHnrpfkuKTngrnkuYvpl7Tot53nprtcbiAgICAgICAgdmFyIGRpc3QgPSBjYy5wRGlzdGFuY2UodGhpcy5ub2RlLnBvc2l0aW9uLCBwbGF5ZXJQb3MpO1xuXG4gICAgICAgIHJldHVybiBkaXN0O1xuICAgIH0sXG5cbiAgICBvblBpY2tlZDogZnVuY3Rpb24gb25QaWNrZWQoKSB7XG4gICAgICAgIGNjLmxvZyhcInN0YXI6b25QaWNrZWRcIik7XG4gICAgICAgIHZhciBwb3MgPSB0aGlzLm5vZGUuZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgLy8g6LCD55SoIEdhbWUg6ISa5pys55qE5b6X5YiG5pa55rOVXG4gICAgICAgIHRoaXMuZ2FtZS5nYWluU2NvcmUocG9zKTtcbiAgICAgICAgLy8g5b2T5pif5pif6KKr5pS26ZuG5pe277yM6LCD55SoIEdhbWUg6ISa5pys5Lit55qE5o6l5Y+j77yM6ZSA5q+B5b2T5YmN5pif5pif6IqC54K577yM55Sf5oiQ5LiA5Liq5paw55qE5pif5pifXG4gICAgICAgIHRoaXMuZ2FtZS5kZXNwYXduU3Rhcih0aGlzLm5vZGUpO1xuICAgIH0sXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbiAgICAvLyB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuXG4gICAgLy8gfSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShkdCkge1xuICAgICAgICBjYy5sb2coXCIyMVwiKTtcbiAgICAgICAgLy8g5qC55o2uIEdhbWUg6ISa5pys5Lit55qE6K6h5pe25Zmo5pu05paw5pif5pif55qE6YCP5piO5bqmXG4gICAgICAgIHZhciBvcGFjaXR5UmF0aW8gPSAxIC0gdGhpcy5nYW1lLnRpbWVyIC8gdGhpcy5nYW1lLnN0YXJEdXJhdGlvbjtcbiAgICAgICAgdmFyIG1pbk9wYWNpdHkgPSA1MDtcbiAgICAgICAgLy/orr7nva7pgI/mmI7luqZcbiAgICAgICAgdGhpcy5ub2RlLm9wYWNpdHkgPSBtaW5PcGFjaXR5ICsgTWF0aC5mbG9vcihvcGFjaXR5UmF0aW8gKiAoMjU1IC0gbWluT3BhY2l0eSkpO1xuICAgICAgICAvLyDmr4/luKfliKTmlq3lkozkuLvop5LkuYvpl7TnmoTot53nprvmmK/lkKblsI/kuo7mlLbpm4bot53nprtcbiAgICAgICAgaWYgKHRoaXMuZ2V0UGxheWVyRGlzdGFuY2UoKSA8IHRoaXMucGlja1JhZGl1cykge1xuICAgICAgICAgICAgLy8g6LCD55So5pS26ZuG6KGM5Li6XG4gICAgICAgICAgICB0aGlzLm9uUGlja2VkKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7fVxuICAgIH1cblxufSk7XG5cbmNjLl9SRnBvcCgpOyJdfQ==
