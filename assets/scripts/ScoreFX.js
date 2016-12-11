cc.Class({
    extends: cc.Component,

    properties: {
        anim: {
            default: null,
            type: cc.Animation
        }
    },

    init (game) {
        this.game = game;
        this.anim.getComponent('ScoreAnim').init(this);
    },

    despawn () {
        this.game.despawnScoreFX(this.node);
    },

    play: function () {
        //播放帧动画
        this.anim.play('score_pop');
    }
});