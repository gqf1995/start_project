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