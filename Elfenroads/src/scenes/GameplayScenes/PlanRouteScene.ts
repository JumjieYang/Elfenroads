import {GameObjects} from 'phaser';
import Edge from '../../classes/Edge';
import {ItemUnit} from '../../classes/ItemUnit';
import {ObstacleType} from '../../enums/ObstacleType';
import PlayerManager from '../../managers/PlayerManager';
import RoadManager from '../../managers/RoadManager';
import InventoryScene from '../UIScenes/InventoryScene';

export default class PlanRouteScene extends Phaser.Scene {
  selectedItemSprite!: Phaser.GameObjects.Sprite;
  selectedItem!: ItemUnit;
  cb: any;

  constructor() {
    super('planroutescene');
  }

  create(cb: any) {
    this.cb = cb;
    // Create text to notify that it is draw counter phase

    const drawCounterText: Phaser.GameObjects.Text = this.add.text(
      10,
      6,
      'To Plan Route',
      {
        fontFamily: 'MedievalSharp',
        fontSize: '30px',
      }
    );

    const gameWidth: number = this.cameras.main.width;
    // Create brown ui panel element relative to the size of the text
    const brownPanel: Phaser.GameObjects.RenderTexture = this.add
      .nineslice(0, 0, drawCounterText.width + 20, 40, 'brown-panel', 24)
      .setOrigin(0, 0);

    // Initialize container to group elements
    // Need to center the container relative to the gameWidth and the size of the text box
    const container: Phaser.GameObjects.Container = this.add.container(
      gameWidth / 2 - brownPanel.width / 2,
      90
    );

    // Render the brown panel and text
    container.add(brownPanel);
    container.add(drawCounterText);

    /**
     * SHOWCASE FOR CHANGING PLAYER TURN
     */
    // Create small button with the "next" icon
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const passTurnButton = this.add.sprite(
      width - 30,
      height - 30,
      'brown-box'
    );
    this.add.image(passTurnButton.x, passTurnButton.y, 'next').setScale(0.7);

    // Add interactive pointer options for passTurnButton
    // After click, currentPlayer is updated via playerManager
    // PlayerTurnScene is rerendered to show whose turn it is
    passTurnButton
      .setInteractive()
      .on('pointerdown', () => {
        passTurnButton.setTint(0xd3d3d3);
      })
      .on('pointerout', () => {
        passTurnButton.clearTint();
      })
      .on('pointerup', () => {
        passTurnButton.clearTint();
        this.sound.play('pass');
        PlayerManager.getInstance().getCurrentPlayer().setPassedTurn(true);
        PlayerManager.getInstance().setNextPlayer();
        this.scene.get('playerturnscene').scene.restart();
        let finishedPlayers: integer = 0;
        PlayerManager.getInstance()
          .getPlayers()
          .forEach(player => {
            if (player.getPassedTurn() === true) {
              finishedPlayers++;
            }
          });

        if (
          finishedPlayers === PlayerManager.getInstance().getPlayers().length
        ) {
          this.cb();
        } else {
          this.scene.restart();
        }
      });

    this.planRoute();
  }

  drawAllowedEdges(
    item: Phaser.GameObjects.Sprite,
    graphics: any,
    zoneRadius: number
  ) {
    graphics.lineStyle(8, 0x8a6440, 0.7);
    // highlight every draggable counter
    RoadManager.getInstance()
      .getEdges()
      .forEach(edge => {
        if (item.data.values.allowedEdges.includes(edge.getType())) {
          graphics.strokeCircle(
            (edge.getPosition()[0] / 1600) * this.cameras.main.width,
            (edge.getPosition()[1] / 750) * this.cameras.main.height,
            zoneRadius / 3
          );
        }
      });
  }

  selectItem(
    item: Phaser.GameObjects.Sprite,
    zoneRadius: number,
    graphics: GameObjects.Graphics
  ) {
    item.clearTint();
    graphics.clear();
    this.drawAllowedEdges(item, graphics, zoneRadius);
    this.selectedItemSprite = item;
    const playerItems: Array<ItemUnit> = PlayerManager.getInstance()
      .getCurrentPlayer()
      .getItems();

    for (let i = 0; i < playerItems.length; i++) {
      const item: ItemUnit = playerItems[i];
      if (item.getName() === this.selectedItemSprite.data.values.name) {
        this.selectedItem = item;
        break;
      }
    }
  }

  placeItem(edge: Edge, graphics: GameObjects.Graphics) {
    if (this.selectedItemSprite) {
      if (
        (this.selectedItem.getAllowedEdges().includes(edge.getType()) &&
          edge.getItems().length === 0 &&
          this.selectedItem.getName() !== ObstacleType.Tree) ||
        (this.selectedItem.getName() === ObstacleType.Tree &&
          edge.getItems().length === 1)
      ) {
        this.sound.play('place');
        graphics.clear();
        PlayerManager.getInstance()
          .getCurrentPlayer()
          .removeItem(this.selectedItem);
        edge.addItem(this.selectedItem);
        this.selectedItemSprite.destroy();
        PlayerManager.getInstance().setNextPlayer();
        this.scene.get('renderedgescene').scene.restart();
        this.scene.get('playerturnscene').scene.restart();
        this.scene.get('inventoryscene').scene.restart();
        this.scene.get('playericonscene').scene.restart();
      }
    }
  }

  planRoute() {
    const graphics = this.add.graphics();
    const zoneRadius = (30 / 1600) * this.cameras.main.width;

    // creating all the dropzones for counters
    RoadManager.getInstance()
      .getEdges()
      .forEach(edge => {
        this.add
          .zone(
            (edge.getPosition()[0] / 1600) * this.cameras.main.width,
            (edge.getPosition()[1] / 750) * this.cameras.main.height,
            10,
            10
          )
          .setData(edge)
          .setInteractive()
          .on('pointerup', () => {
            this.placeItem(edge, graphics);
          });
      });

    // make items draggable
    if (
      PlayerManager.getInstance().getCurrentPlayer() ===
      PlayerManager.getInstance().getLocalPlayer()
    ) {
      InventoryScene.itemSprites.forEach(item => {
        item
          .setInteractive()
          .on('pointerdown', () => {
            item.setTint(0xd3d3d3);
          })
          .on('pointerout', () => {
            item.clearTint();
          })
          .on('pointerup', () => {
            this.selectItem(item, zoneRadius, graphics);
          });
      });
    }
  }
}
