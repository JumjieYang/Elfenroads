import Phaser from 'phaser';
import Player from '../../classes/Player';
import {GameVariant, SubVariant} from '../../enums/GameVariant';
import GameManager from '../../managers/GameManager';
import PlayerManager from '../../managers/PlayerManager';

export default class WinnerScene extends Phaser.Scene {
  constructor() {
    super('winnerscene');
  }

  public create() {
    this.scene.bringToTop();

    this.createGameOverBanner(); // Create game over text panel
    this.createWinnerDisplay(); // Create text panel displaying winning colour boot
    this.createExitButton(); // Create toggle exit button
    this.createScoreBoard(); // Create the score board
    this.createSmokeBackground(); // Create shaded out background
    this.createFireWorks(); // Create fireworks animation
  }

  // Create game over text panel
  private createGameOverBanner(): void {
    // Create text to notify game over.
    const gameOverText: Phaser.GameObjects.Text = this.add
      .text(10, 5, 'GAME OVER', {
        fontFamily: 'MedievalSharp',
        fontSize: '50px',
      })
      .setColor('white');

    // Grab width of text to determine size of panel behind
    const textWidth: number = gameOverText.width;

    // Create brown ui panel element relative to the size of the text
    const brownPanel: Phaser.GameObjects.RenderTexture = this.add
      .nineslice(0, 0, textWidth + 20, 60, 'brown-panel', 24)
      .setOrigin(0, 0);

    // Grab width of current game to center our container
    const {width, height} = this.scale;

    // Initialize container to group elements
    // Need to center the container relative to the gameWidth and the size of the text box
    const container: Phaser.GameObjects.Container = this.add.container(
      width / 2 - brownPanel.width / 2,
      140
    );

    // Render the brown panel and text
    container.add(brownPanel).setDepth(4);
    container.add(gameOverText).setDepth(4);
  }

  // Create text panel displaying winning colour boot
  private createWinnerDisplay(): void {
    // Get the winningPlayer
    const winningPlayer: Player = PlayerManager.getInstance().getWinner();

    // Extract substring of boot color from boot enum
    const bootString: string = winningPlayer
      .getBootColour()
      .slice(0, winningPlayer.getBootColour().indexOf('-'));

    // Create text to notify which player has won
    const playerText: Phaser.GameObjects.Text = this.add.text(
      10,
      5,
      `${bootString.toUpperCase()} WINS`,
      {
        fontFamily: 'MedievalSharp',
        fontSize: '80px',
        color: `${bootString.toLowerCase()}`,
      }
    );

    // Grab width of text to determine size of panel behind
    const textWidth: number = playerText.width;

    // Create brown ui panel element relative to the size of the text
    const brownPanel: Phaser.GameObjects.RenderTexture = this.add
      .nineslice(0, 0, textWidth + 20, 90, 'brown-panel', 24)
      .setOrigin(0, 0);

    // Grab width of current game to center our container
    const {width, height} = this.scale;

    // Initialize container to group elements
    // Need to center the container relative to the gameWidth and the size of the text box
    const container: Phaser.GameObjects.Container = this.add.container(
      width / 2 - brownPanel.width / 2,
      205
    );

    // Render the brown panel and text
    container.add(brownPanel).setDepth(4);
    container.add(playerText).setDepth(4);
  }

  // Create toggle exit button
  private createExitButton() {
    const {width, height} = this.scale;

    // Create grey ui button element
    const toggleExit = this.add
      .image(width / 2, 330, 'brown-box')
      .setDepth(4)
      .setScale(1.3);

    // Create exit icon element
    this.add
      .image(toggleExit.getCenter().x, toggleExit.getCenter().y, 'door')
      .setScale(1)
      .setDepth(4);

    // interactive pointer options for toggleExit button
    toggleExit
      .setInteractive()
      .on('pointerdown', () => {
        toggleExit.setTint(0xd3d3d3);
      })
      .on('pointerout', () => {
        toggleExit.clearTint();
      })
      .on('pointerup', () => {
        toggleExit.clearTint();
        /**
         * @TODO Route player to main menu on click.
         */
      });
  }

  private createScoreBoard() {
    const {width, height} = this.scale;
    const WinnerList: Array<Player> =
      PlayerManager.getInstance().getWinnerList();
    let offset = 400;
    const playerText: Phaser.GameObjects.Text = this.add
      .text(10, 12, 'Colour', {
        fontFamily: 'MedievalSharp',
        fontSize: '36px',
      })
      .setColor('white');
    const playerScore: Phaser.GameObjects.Text = this.add
      .text(200, 12, 'Score', {
        fontFamily: 'MedievalSharp',
        fontSize: '36px',
      })
      .setColor('white');
    let altString = '';
    if (GameManager.getInstance().getGameVariant() === GameVariant.elfenland) {
      altString = 'Travel Cards';
    } else {
      altString = 'Gold';
    }
    const playerAlt: Phaser.GameObjects.Text = this.add
      .text(400, 12, `${altString}`, {
        fontFamily: 'MedievalSharp',
        fontSize: '36px',
      })
      .setColor('white');
    const brownPanel: Phaser.GameObjects.RenderTexture = this.add
      .nineslice(0, 0, 650, 60, 'brown-panel', 24)
      .setOrigin(0, 0);
    const container: Phaser.GameObjects.Container = this.add.container(
      width / 2 - brownPanel.width / 2,
      offset
    );
    container.add(brownPanel).setDepth(4);
    container.add(playerText).setDepth(4);
    container.add(playerScore).setDepth(4);
    container.add(playerAlt).setDepth(4);
    offset += 70;
    for (const player of WinnerList) {
      const bootString: string = player
        .getBootColour()
        .slice(0, player.getBootColour().indexOf('-'));
      const playerText: Phaser.GameObjects.Text = this.add.text(
        10,
        12,
        `${bootString.toUpperCase()}`,
        {
          fontFamily: 'MedievalSharp',
          fontSize: '36px',
          color: `${bootString.toLowerCase()}`,
        }
      );
      let distanceString = '';
      if (
        player.getTownDistance() !== -1 &&
        GameManager.getInstance().getSubVariant() === SubVariant.destination
      ) {
        distanceString = ` - ${player.getTownDistance()}`;
      }
      const playerScore: Phaser.GameObjects.Text = this.add
        .text(200, 12, `${player.getScore()}${distanceString}`, {
          fontFamily: 'MedievalSharp',
          fontSize: '36px',
        })
        .setColor('white');
      let altString = -1;
      if (
        GameManager.getInstance().getGameVariant() === GameVariant.elfenland
      ) {
        altString = player.getCards().length;
      } else {
        altString = player.getGold();
      }
      const playerAlt: Phaser.GameObjects.Text = this.add
        .text(400, 12, `${altString}`, {
          fontFamily: 'MedievalSharp',
          fontSize: '36px',
        })
        .setColor('white');
      const brownPanel: Phaser.GameObjects.RenderTexture = this.add
        .nineslice(0, 0, 650, 60, 'brown-panel', 24)
        .setOrigin(0, 0);
      const container: Phaser.GameObjects.Container = this.add.container(
        width / 2 - brownPanel.width / 2,
        offset
      );
      container.add(brownPanel).setDepth(4);
      container.add(playerText).setDepth(4);
      container.add(playerScore).setDepth(4);
      container.add(playerAlt).setDepth(4);
      offset += 70;
    }
  }

  // Create shaded out background
  private createSmokeBackground(): void {
    this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x000000)
      .setDepth(3)
      .setOrigin(0, 0)
      .setAlpha(0.5);
  }

  // Create fireworks animation
  private createFireWorks(): void {
    const emitterConfig = {
      alpha: {start: 1, end: 0, ease: 'Cubic.easeIn'},
      angle: {start: 0, end: 360, steps: 100},
      blendMode: 'ADD',
      frame: {
        frames: ['red', 'yellow', 'green', 'blue'],
        cycle: true,
        quantity: 500,
      },
      frequency: 2000,
      gravityY: 300,
      lifespan: 1000,
      quantity: 500,
      reserve: 500,
      scale: {min: 0.05, max: 0.15},
      speed: {min: 300, max: 600},
      x: 512,
      y: 384,
    };

    const {FloatBetween} = Phaser.Math;

    const particles = this.add.particles('flares').setDepth(3);

    const emitter = particles.createEmitter(emitterConfig);

    const {width, height} = this.scale;

    this.time.addEvent({
      delay: 500,
      startAt: 500,
      repeat: -1,
      callback: () => {
        emitter.setPosition(
          width * FloatBetween(0.25, 0.75),
          height * FloatBetween(0, 0.5)
        );
      },
    });
  }
}
