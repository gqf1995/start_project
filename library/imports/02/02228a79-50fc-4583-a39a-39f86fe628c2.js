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