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
        this.load.image('bulletTwo', 'assets/bullet.png');
        this.load.image('boundbox', 'assets/boundbox.png');
        this.load.image('boundboxTopBottom', 'assets/boundboxTopBottom.png');
        this.load.image('bossOne', 'assets/ships/bossOne.png');
        this.load.image('bossShot', 'assets/bossShot.png');
        this.load.spritesheet('player', 'assets/ships/playerShip.png', {frameWidth: 20, frameHeight: 15});
        this.load.spritesheet('enemyRedOne', 'assets/ships/enemyRedOne.png', {frameWidth:20, frameHeight: 20});
        this.load.spritesheet('playerShipExplosion', 'assets/ships/playerShipExplosion.png', {frameWidth:20, frameHeight: 20});
        this.load.spritesheet('enemyRedShipExplosion', 'assets/ships/enemyRedShipExplosion.png', {frameWidth:20, frameHeight: 20});
        this.load.spritesheet('powerUpDual', 'assets/powerUps/powerUpDual.png', {frameWidth: 20, frameHeight: 20});
    },

    create: function ()
    {
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

      //powerup animation
      this.anims.create({
        key: 'powerUpDualAnim',
        frames: this.anims.generateFrameNumbers('powerUpDual', {frames: [1,2,3,4,5,6,7,8]}),
        frameRate: 7,
        repeat: -1
      });

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
        var countShots = 0;


        scoreText = this.add.text(16, 16, 'score: '+ score, { fontSize: '20px', fill: '#FFF' });


        //add player sprite
        this.player = this.physics.add.sprite(50, 100, 'player', 0);
        //add player bounds
        this.physics.world.bounds.width = config.width;
        this.physics.world.bounds.height = config.height;
        this.player.setCollideWorldBounds(true);
        //scale player and setCollider
        this.player.body.setSize(12);
        this.player.displayWidth = config.width *.07;
        this.player.scaleY = this.player.scaleX;

        //add bullets sprite
        this.bullets = this.physics.add.sprite(this.player.x, this.player.y, 'bullet');
        this.bullets.setVisible(false);
        this.bullets.setVelocityX(0);

        //add dual bullet sprite
        this.bulletsTwo = this.physics.add.sprite(this.player.x, this.player.y, 'bullet');
        this.bulletsTwo.setVisible(false);
        this.bulletsTwo.setVelocityX(0);
        this.bulletsTwo.setActive(false);

        this.bossOne = this.physics.add.sprite('bossOne');
        this.bossOne.setActive(false);

        //add collision box for easy destroy of old objects
        this.leftBound = this.physics.add.sprite(0, config.height/2, 'boundbox');



        //create comets
        function comets(){
          this.rocks = this.physics.add.group();
          if(this.bossOne.active === false){
            if(score < 100){
              for(let i = 0; i < 1; i++){
                let x = Phaser.Math.RND.between(this.physics.world.bounds.width+32, this.physics.world.bounds.width);
                let y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
                let move = Phaser.Math.RND.between(-125, -150);
                this.rocks = this.physics.add.sprite(x, y, 'comet');
                this.rocks.displayWidth = config.width *.07;
                this.rocks.scaleY = this.rocks.scaleX;
                this.rocks.setVelocityX(move);
                this.physics.add.collider(this.player, this.rocks, rockCollision, null, this);
                this.physics.add.overlap(this.bullets, this.rocks, shotRock, null, this);
                this.physics.add.overlap(this.bulletsTwo, this.rocks, shotRockSecond, null, this);
                this.physics.add.overlap(this.rocks, this.leftBound, destroyObjRock, null, this);
              }
            }else if(score >= 100){
              for(let i = 0; i < 1; i++){
                let x = Phaser.Math.RND.between(this.physics.world.bounds.width+32, this.physics.world.bounds.width);
                let y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
                let move = Phaser.Math.RND.between(-150, -225);
                this.rocks = this.physics.add.sprite(x, y, 'comet');
                this.rocks.displayWidth = config.width *.07;
                this.rocks.scaleY = this.rocks.scaleX;
                this.rocks.setVelocityX(move);
                this.physics.add.collider(this.player, this.rocks, rockCollision, null, this);
                this.physics.add.overlap(this.bullets, this.rocks, shotRock, null, this);
                this.physics.add.overlap(this.bulletsTwo, this.rocks, shotRockSecond, null, this);
                this.physics.add.overlap(this.rocks, this.leftBound, destroyObjRock, null, this);
              }
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
          if(this.bossOne.active === false){
            if(score <= 200){
              for(let i = 0; i < 1; i++){
                let enemyX = Phaser.Math.RND.between(this.physics.world.bounds.width+32, this.physics.world.bounds.width);
                let enemyY = Phaser.Math.RND.between(20,this.physics.world.bounds.height-20);
                var enemyMove = Phaser.Math.RND.between(-75, -110);
                this.enemyRedOne = this.physics.add.sprite(enemyX, enemyY, 'enemyRedOne', 3);
                this.enemyRedOne.displayWidth = config.width *.05;
                this.enemyRedOne.scaleY = this.enemyRedOne.scaleX;
                this.enemyRedOne.flipX = true;
                this.enemyRedOne.body.setVelocityX(enemyMove);
                this.physics.add.collider(this.player, this.enemyRedOne, enemyRedCollision, null, this);
                this.physics.add.overlap(this.bullets, this.enemyRedOne, shotEnemy, null, this);
                this.physics.add.overlap(this.bulletsTwo, this.enemyRedOne, shotEnemySecond, null, this);
                this.physics.add.overlap(this.enemyRedOne, this.leftBound, destroyObjEn, null, this);
              }
            }else if (score >= 200){
              for(let i = 0; i < 2; i++){
                let enemyX = Phaser.Math.RND.between(this.physics.world.bounds.width+32, this.physics.world.bounds.width);
                let enemyY = Phaser.Math.RND.between(20,this.physics.world.bounds.height-20);
                var enemyMove = Phaser.Math.RND.between(-110, -150);
                this.enemyRedOne = this.physics.add.sprite(enemyX, enemyY, 'enemyRedOne', 3);
                this.enemyRedOne.displayWidth = config.width *.05;
                this.enemyRedOne.scaleY = this.enemyRedOne.scaleX;
                this.enemyRedOne.flipX = true;
                this.enemyRedOne.body.setVelocityX(enemyMove);
                this.physics.add.collider(this.player, this.enemyRedOne, enemyRedCollision, null, this);
                this.physics.add.overlap(this.bullets, this.enemyRedOne, shotEnemy, null, this);
                this.physics.add.overlap(this.bulletsTwo, this.enemyRedOne, shotEnemySecond, null, this);
                this.physics.add.overlap(this.enemyRedOne, this.leftBound, destroyObjEn, null, this);
              }
            }
          }
        }

      //random spawn red enemy
      this.time.addEvent({delay: 1000, callback: enemyRed, callbackScope: this, loop: true});



      //create bossOne
      function bossOneCreate(){
        if(score >= 300 && score < 400 && this.bossOne.active === false){
          let bossOneX = this.physics.world.bounds.width-100; //this.physics.world.bounds.width*.75;
          let bossOneY = this.physics.world.bounds.height/2; //this.physics.world.bounds.height*.5;
          this.bossOne = this.physics.add.sprite(bossOneX, bossOneY, 'bossOne');
          this.bossOne.setActive(true);
          var bossOneMoveX = Phaser.Math.RND.between(-150, 0);
          var bossOneMoveY = Phaser.Math.RND.between(-150, 150);
          this.bossOne.setVelocity(bossOneMoveX, bossOneMoveY);
          this.time.delayedCall(0, bossBoundsCreate, [], this);
        }
        if(this.bossOne.active === true){
          this.physics.add.collider(this.bossOne, this.rightBound, bossOneMovement, null, this);
          this.physics.add.collider(this.bossOne, this.leftBoundEnemy, bossOneMovement, null, this);
          this.physics.add.collider(this.bossOne, this.topBound, bossOneMovement, null, this);
          this.physics.add.collider(this.bossOne, this.bottomBound, bossOneMovement, null, this);
          this.physics.add.collider(this.bossOne, this.bullets, shotBossOne, null, this);
          this.physics.add.collider(this.bossOne, this.bulletsTwo, shotBossOne, null, this);
          this.time.delayedCall(2000, bossOneShoot, [], this);
        }
      }

      this.time.addEvent({delay:1000, callback: bossOneCreate, callbackScope: this, loop: true})

      function bossBoundsCreate(){
        if(this.bossOne.active === true){
        this.rightBound = this.physics.add.sprite(config.width, config.height/2, 'boundbox');
        this.rightBound.immovable = true;
        this.rightBound.body.moves = false;
        this.leftBoundEnemy = this.physics.add.sprite(config.width/2, config.height/2, 'boundbox')
        this.leftBoundEnemy.immovable = true;
        this.leftBoundEnemy.body.moves = false;
        this.topBound = this.physics.add.sprite(config.width/2, 0, 'boundboxTopBottom');
        this.topBound.immovable = true;
        this.topBound.body.moves = false;
        this.bottomBound = this.physics.add.sprite(config.width/2, config.height, 'boundboxTopBottom');
        this.bottomBound.immovable = true;
        this.bottomBound.body.moves = false;
      }
    }

      function bossOneMovement(){
        if(this.bossOne.active === true){
          this.bossOne.setVelocityX(Phaser.Math.RND.between(-175, 175));
          this.bossOne.setVelocityY(Phaser.Math.RND.between(-175, 175));
        }
      }

      function bossOneShoot(){
        if(this.bossOne.active === true){
          this.bossShot = this.physics.add.group();
          for(let i = 0; i < 4; i++){
            let bossShotX = Phaser.Math.RND.between(-300, -150);
            let bossShotY = Phaser.Math.RND.between(-35, 35);
            var shiftShot = Phaser.Math.RND.between(-50, 50);
            this.bossShot = this.physics.add.sprite(this.bossOne.x, this.bossOne.y+shiftShot, 'bossShot');
            this.bossShot.body.setVelocity(bossShotX, bossShotY);
            this.physics.add.collider(this.player, this.bossShot, shotPlayer, null, this);
          }
        }
      }

        //create powerup Dual
        function powerUps(){
          if(this.bossOne.active === false){
            this.powerUpDual = this.physics.add.group();
            let powerUpX = Phaser.Math.RND.between(this.physics.world.bounds.width+32, this.physics.world.bounds.width);
            let powerUpY = Phaser.Math.RND.between(20,this.physics.world.bounds.height-20);
            var powerUpMove = Phaser.Math.RND.between(-25, -45);
            this.powerUpDual = this.physics.add.sprite(powerUpX, powerUpY, 'powerUpDual', 0);
            this.powerUpDual.displayWidth = config.width *.05;
            this.powerUpDual.scaleY = this.enemyRedOne.scaleX;
            this.powerUpDual.anims.play('powerUpDualAnim', true);
            this.powerUpDual.setVelocityX(powerUpMove);
            this.physics.add.overlap(this.player, this.powerUpDual, dualGuns, null, this);
        }
      }

        //call random powerup Dual
        this.time.addEvent({delay: Phaser.Math.RND.between(1000*10, 7000*10), callback: powerUps, callbackScope: this, loop: true});

        //Shot player
        function shotPlayer(player, bossShot){
          bossShot.disableBody(true,true);
          bossShot.destroy();
          this.player.anims.play('playerCollision', true);
          this.cameras.main.shake(300);
          this.time.delayedCall(400, function(){
            this.scene.restart();
          }, [], this);
        }

        //Shot BossOne
        function shotBossOne(bullets, bossOne, bulletsTwo){
          countShots += 1;
          this.bullets.x = this.player.x;
          this.bullets.y = this.player.y;
          this.bullets.setVisible(false);
          this.bullets.setVelocity(0,0);
          this.bulletsTwo.x = this.player.x;
          this.bulletsTwo.y = this.player.y;
          this.bulletsTwo.setVisible(false);
          this.bulletsTwo.setVelocity(0,0);
          if(countShots == 3){
            this.bossOne.setActive(false);
            this.bossOne.disableBody(true,true);
            this.bossOne.destroy();
            this.time.delayedCall(0, destroyBossBounds, [], this);
            score += 100;
            scoreText.setText('Score: ' + score);
            countShots = 0;
          }
        }

        //destroy boss bounds
        function destroyBossBounds(rightBound, leftBoundEnemy, topBound, bottomBound){
          this.rightBound.destroy();
          this.leftBoundEnemy.destroy();
          this.topBound.destroy();
          this.bottomBound.destroy();
        }

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

        //called when red enemy is shot
        function shotEnemy(bullets, enemyRedOne){
          enemyRedOne.anims.play('enemyRedShot', true);
          this.time.delayedCall(200, function(){
            enemyRedOne.destroy();
          }, [], this);
          this.time.delayedCall(50, function(){
            enemyRedOne.disableBody(true, true)
          }, [], this);
          this.bullets.x = this.player.x;
          this.bullets.y = this.player.y;
          this.bullets.setVisible(false);
          this.bullets.setVelocityX(0);

          //change score for each enemy destoryed
          score += 10;
          scoreText.setText('Score: ' + score);
        }

        //called when dual bullet hits emenyRed
        function shotEnemySecond(bulletsTwo, enemyRedOne){
          enemyRedOne.anims.play('enemyRedShot', true);
          this.time.delayedCall(200, function(){
            enemyRedOne.destroy();
          }, [], this);
          this.time.delayedCall(50, function(){
            enemyRedOne.disableBody(true, true)
          }, [], this);
          this.bulletsTwo.x = this.player.x;
          this.bulletsTwo.y = this.player.y;
          this.bulletsTwo.setVisible(false);
          this.bulletsTwo.setVelocityX(0);
          //Update score
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

        //called when dual bullet hits comet
        function shotRockSecond(bulletsTwo, rocks){
          this.bulletsTwo.x = this.player.x;
          this.bulletsTwo.y = this. player.y
          this.bulletsTwo.setVisible(false);
          this.bulletsTwo.setVelocityX(0);
        }

        //Destroys red enemys when they reach edge of scene
        function destroyObjEn(enemyRedOne){
          this.time.delayedCall(150, function(){
            enemyRedOne.destroy();
          }, [], this);
        //console.log('destroyedEn');
      }

        //Destorys comets when the reach edge of scene
        function destroyObjRock(rocks){
          this.time.delayedCall(150, function(){
            rocks.destroy();
          }, [], this);
          //console.log('destroyrock');
        }

        //destroy powerup Dual on collision
        function dualGuns(player, powerUpDual){
            this.time.delayedCall(200, function(){
              powerUpDual.destroy();
            }, [], this);
            this.time.delayedCall(50, function(){
              powerUpDual.disableBody(true, true)
            }, [], this);
            this.bulletsTwo.setActive(true);
            this.player.setTexture('player', 2);
            //update score when powerupDual collected
            score += 20;
            scoreText.setText('Score: ' + score);

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
        this.player.body.setVelocityX(-160);
        //moves bullet with player
        if(this.bullets.visible === false){
        this.bullets.x = this.player.x;
      }
        //moves dual bullet if it is not fired
        if(this.bulletsTwo.visible === false){
        this.bulletsTwo.x = this.player.x;
      }
    }else if (this.cursors.right.isDown){
        this.player.body.setVelocityX(160);
        //moves bullet with player
        if(this.bullets.visible === false){
        this.bullets.x = this.player.x;
      }
      //moves dual bullet if it is not fired
      if(this.bulletsTwo.visible === false){
      this.bulletsTwo.x = this.player.x;
      }
    }


      //Veticale Movement
      if(this.cursors.up.isDown){
        this.player.body.setVelocityY(-160);
        //moves bullet with player
        if(this.bullets.visible === false){
        this.bullets.y = this.player.y;
      }
      //moves dual bullet if it is not fired
      if(this.bulletsTwo.visible === false){
      this.bulletsTwo.y = this.player.y;
      }
    }else if(this.cursors.down.isDown){
        this.player.body.setVelocityY(160);
        //moves bullet with player
        if(this.bullets.visible === false){
        this.bullets.y = this.player.y;
      }
      //moves dual bullet if it is not fired
      if(this.bulletsTwo.visible === false){
      this.bulletsTwo.y = this.player.y;
      }
    }

      //shoot on spacebar justdown
      if(Phaser.Input.Keyboard.JustDown(spacebar)){
        if(this.bullets.visible === false){
          this.bullets.x = this.player.x + 22;
          this.bullets.setVisible(true);
          this.bullets.setVelocityX(300);
        }
        //shoot dual bullets on spacebar if dual has been collected
        if(this.bulletsTwo.visible === false && this.bulletsTwo.active === true){
          this.bulletsTwo.x = this.player.x + 22;
          //set the bullets apart
          this.bulletsTwo.y = this.player.y+ this.player.scaleY*7;
          this.bullets.y = this.player.y- this.player.scaleY*7
          this.bulletsTwo.setVisible(true);
          this.bulletsTwo.setVelocityX(300);
        }
      }

      // resets bullet when it leaves the screen
      if (this.bullets.x > this.physics.world.bounds.width){
        this.bullets.x = this.player.x;
        this.bullets.y = this.player.y;
        this.bullets.setVelocityX(0);
        this.bullets.setVisible(false);
      }
      //resets dual bullet when it leaves the screen
      if(this.bulletsTwo.x > this.physics.world.bounds.width){
        this.bulletsTwo.x = this.player.x;
        this.bulletsTwo.y = this.player.y;
        this.bulletsTwo.setVelocityX(0);
        this.bulletsTwo.setVisible(false);
      }

  },



});



var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 640,
    height: 420,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
        gravity: { y: 0 },
        //debug: true
      }
    },
    scene: [
        BootScene,
        WorldScene
    ]
};
var game = new Phaser.Game(config);
