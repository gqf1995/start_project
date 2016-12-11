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