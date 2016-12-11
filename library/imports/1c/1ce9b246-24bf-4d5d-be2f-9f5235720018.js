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