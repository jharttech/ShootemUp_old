var BootScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function BootScene ()
    {
        Phaser.Scene.call(this, { key: 'BootScene' });
    },

    preload: function ()
    {
        // load the resources here
        this.load.image('background', 'assets/ShootemUpBackg.png');
        this.load.image('comet', 'assets/comet.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('boundbox', 'assets/boundbox.png');
        this.load.spritesheet('player', 'assets/ships/playerShip.png', {frameWidth: 20, frameHeight: 15});
        this.load.spritesheet('enemyRedOne', 'assets/ships/enemyRedOne.png', {frameWidth:20, frameHeight: 20});
        this.load.spritesheet('playerShipExplosion', 'assets/ships/playerShipExplosion.png', {frameWidth:20, frameHeight: 20});
        this.load.spritesheet('enemyRedShipExplosion', 'assets/ships/enemyRedShipExplosion.png', {frameWidth:20, frameHeight: 20});
    },

    create: function ()
    {
        this.scene.start('WorldScene');
    }
});

var WorldScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function WorldScene ()
    {
        Phaser.Scene.call(this, { key: 'WorldScene' });
    },
    preload: function ()
    {

    },
    create: function ()
    {
        // create your world here

        var score = 0;
        var scoreText;

        scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '12px', fill: '#FFF' });

        //add player sprite
        this.player = this.physics.add.sprite(50, 100, 'player', 0);
        //add player bounds
        this.physics.world.bounds.width = config.width;
        this.physics.world.bounds.height = config.height;
        this.player.setCollideWorldBounds(true);

        //add bullets sprite
        this.bullets = this.physics.add.sprite(this.player.x, this.player.y, 'bullet');
        this.bullets.setVisible(false);
        this.bullets.setVelocityX(0);

        //add collision box for easy destroy
        this.leftBound = this.physics.add.sprite(0, config.height/2, 'boundbox');
        this.leftBound.setVisible(false);

        //create comets
        function comets(){
          this.rocks = this.physics.add.group();
          for(let i = 0; i < 1; i++){
            let x = Phaser.Math.RND.between(this.physics.world.bounds.width+32, this.physics.world.bounds.width);
            let y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
            let move = Phaser.Math.RND.between(-75, -150);
            this.rocks.create(x, y, 'comet');
            this.rocks.setVelocityX(move);
            this.physics.add.collider(this.player, this.rocks, rockCollision, null, this);
            this.physics.add.overlap(this.bullets, this.rocks, shotRock, null, this);
            this.physics.add.overlap(this.leftBound, this.rocks, destroyObjRock, null, this);
            if(this.rocks.x <= 0){
              this.rocks.destroy();
              console.log("destroyedRock");
            }
          }
        }

        //random spawn of comets
        this.time.addEvent({delay: 1000, callback: comets, callbackScope: this, loop: true});

        //comet collision with player
        function rockCollision(player, rocks){
          rocks.disableBody(true, true);
          rocks.destroy();
          this.player.anims.play('playerCollision', true);
          this.cameras.main.shake(300);
          this.time.delayedCall(400, function(){
            this.scene.restart();
          }, [], this);
        }

        //create red enemys
        function enemyRed(){
          this.enemyRedOne = this.physics.add.group();
            let enemyX = Phaser.Math.RND.between(this.physics.world.bounds.width+32, this.physics.world.bounds.width);
            let enemyY = Phaser.Math.RND.between(20,this.physics.world.bounds.height-20);
            let enemyMove = Phaser.Math.RND.between(-45, -55);
            this.enemyRedOne = this.physics.add.sprite(enemyX, enemyY, 'enemyRedOne', 3);
            this.enemyRedOne.flipX = true;
            this.enemyRedOne.body.setVelocityX(enemyMove);
            this.physics.add.collider(this.player, this.enemyRedOne, enemyRedCollision, null, this);
            this.physics.add.overlap(this.bullets, this.enemyRedOne, shotEnemy, null, this);
            this.physics.add.overlap(this.leftBound, this.enemyRedOne, destroyObj, null, this);
          }

        //random spawn red enemy
        this.time.addEvent({delay: 1000, callback: enemyRed, callbackScope: this, loop: true});



        //collision red enemy with player
        function enemyRedCollision(player, enemyRedOne){
          enemyRedOne.disableBody(true, true);
          enemyRedOne.destroy();
          this.player.anims.play('playerCollision', true);
          this.cameras.main.shake(300);
          this.time.delayedCall(400, function(){
            this.scene.restart();
          }, [], this);
        }

        //collision animation
        this.anims.create({
          key: 'playerCollision',
          frames: this.anims.generateFrameNumbers('playerShipExplosion', {frames: [1,2,3,4,5]}),
          frameRate: 10,
          repeat: 0
        });

        //enemy Shot animation
        this.anims.create({
          key: 'enemyRedShot',
          frames: this.anims.generateFrameNumbers('enemyRedShipExplosion', {frames: [1,2,3,4,5]}),
          frameRate: 7,
          repeat: 0
        });

        //called when red enemy is shot
        function shotEnemy(bullets, enemyRedOne){
          enemyRedOne.anims.play('enemyRedShot', true);
          this.time.delayedCall(200, function(){
            enemyRedOne.destroy();
          }, [], this);
          this.time.delayedCall(50, function(){
            enemyRedOne.disableBody(true, true);
          }, [], this);
          this.bullets.x = this.player.x;
          this.bullets.y = this.player.y;
          this.bullets.setVisible(false);
          this.bullets.setVelocityX(0);
          //change score for each enemy destoryed
          score += 10;
          scoreText.setText('Score: ' + score);
        }

        //called when bullet hits comet
        function shotRock(bullets, rocks){
          this.bullets.x = this.player.x;
          this.bullets.y = this.player.y;
          this.bullets.setVisible(false);
          this.bullets.setVelocityX(0);
        }


        //Destroys red enemys when they reach edge of scene
        function destroyObj(enemyRedOne){
          this.time.delayedCall(100, function(){
          enemyRedOne.destroy();
        }, [], this);
      }

      //Destorys comets when the reach edge of scene
      function destroyObjRock(rocks){
        this.time.delayedCall(100, function(){
        rocks.destroy();
      }, [], this);
    }

        //allow movement
        this.cursors = this.input.keyboard.createCursorKeys();
        spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    },

    update: function (time, delta)
    {
      //Stops ship when no button is pushed
      this.player.body.setVelocity(0);

      //Horizontal
      if(this.cursors.left.isDown){
        this.player.body.setVelocityX(-80);
        //moves bullet with player
        if(Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.bullets.getBounds())){
        this.bullets.x = this.player.x;
      }
    }else if (this.cursors.right.isDown){
        this.player.body.setVelocityX(80);
        //moves bullet with player
        if(Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.bullets.getBounds())){
        this.bullets.x = this.player.x;
      }
    }


      //Veticale Movement
      if(this.cursors.up.isDown){
        this.player.body.setVelocityY(-80);
        //moves bullet with player
        if(Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.bullets.getBounds())){
        this.bullets.y = this.player.y;
      }
    }else if(this.cursors.down.isDown){
        this.player.body.setVelocityY(80);
        //moves bullet with player
        if(Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.bullets.getBounds())){
        this.bullets.y = this.player.y;
      }
    }

      //shoot on spacebar justdown
      if(Phaser.Input.Keyboard.JustDown(spacebar) && Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.bullets.getBounds())){
          this.bullets.x = this.player.x + 22;
          this.bullets.setVisible(true);
          this.bullets.setVelocityX(200);
        }
      // resets bullet when it leaves the screen
      if (this.bullets.x > this.physics.world.bounds.width){
        this.bullets.x = this.player.x;
        this.bullets.y = this.player.y;
        this.bullets.setVelocityX(0);
        this.bullets.setVisible(false);
      }

  },


});



var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 320,
    height: 240,
    zoom: 2,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
        gravity: { y: 0 },
        debug: true
      }
    },
    scene: [
        BootScene,
        WorldScene
    ]
};
var game = new Phaser.Game(config);
