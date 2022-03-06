import Phaser from 'phaser';
import CardInventory from '../classes/CardInventory';
import {ObstacleType} from '../enums/ObstacleType';
import RoadManager from '../managers/RoadManager';
import PlayerManager from '../managers/PlayerManager';

export default class InventoryScene extends Phaser.Scene {
  constructor() {
    super('inventoryscene');
  }

  create() {
    this.createCounterInventory();
    this.createCardInventory();
  }

  createCounterInventory() {
    const graphics = this.add.graphics();
    const zoneRadius = (30 / 1600) * this.cameras.main.width;

    // creating all the dropzones for counters
    RoadManager.getInstance()
      .getEdges()
      .forEach(edge => {
        const zone = this.add
          .zone(
            (edge.position[0] / 1600) * this.cameras.main.width,
            (edge.position[1] / 750) * this.cameras.main.height,
            1,
            1
          )
          .setCircleDropZone(zoneRadius);
        // assign edge object to each zone
        zone.setData(edge);
      });

    // SIMULATING ONE SINGLE PLAYER. THIS IS NOT FINAL.
    const currentPlayer = PlayerManager.getInstance().getCurrentPlayer();

    // Dynamically updates the counter inventory based on the currentPlayer counter array.
    let counterX = (750 / 1600) * this.cameras.main.width;
    currentPlayer.getCounters().forEach(counter => {
      const counterSprite = this.add
        .sprite(
          (counterX / 1600) * this.cameras.main.width,
          (670 / 750) * this.cameras.main.height,
          counter.counterType
        )
        .setInteractive();
      // set sprite data
      counterSprite.setData(counter);
      // set initial position and relative size
      counterSprite.setScale(0.25);
      // make counter draggable to any position
      this.input.setDraggable(counterSprite);
      counterX += (50 / 1600) * this.cameras.main.width;
    });
    // //// block ends here //////

    this.input.on(
      'dragstart',
      (pointer: any, gameObject: {setTint: (arg0: number) => void}) => {
        gameObject.setTint(0x808080);
      }
    );

    this.input.on(
      'drag',
      (pointer: any, gameObject: any, dragX: any, dragY: any) => {
        // cannot drag placed counters
        if (gameObject.active) {
          gameObject.x = dragX;
          gameObject.y = dragY;
          graphics.lineStyle(8, 0x8a6440, 0.7);
          // highlight every draggable counter
          RoadManager.getInstance()
            .getEdges()
            .forEach(edge => {
              if (gameObject.data.list.allowedEdges.includes(edge.edgeType)) {
                graphics.strokeCircle(
                  (edge.position[0] / 1600) * this.cameras.main.width,
                  (edge.position[1] / 750) * this.cameras.main.height,
                  zoneRadius / 3
                );
              }
            });
        }
      }
    );

    // if the counter is dragged to the drop zone, it will stay in it
    this.input.on('drop', (pointer: any, gameObject: any, dropZone: any) => {
      if (
        gameObject.data.values.allowedEdges.includes(
          dropZone.data.values.edgeType
        ) &&
        dropZone.data.values.items.length === 0 &&
        gameObject.data.values.obstacleType !== ObstacleType.Tree
      ) {
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;
        dropZone.data.values.items.push(gameObject.data.values);
        gameObject.setActive(false);
      } else if (
        gameObject.data.values.obstacleType === ObstacleType.Tree &&
        dropZone.data.values.items.length === 1
      ) {
        gameObject.x = dropZone.x - 30;
        gameObject.y = dropZone.y;
        dropZone.data.values.items.push(gameObject.data.values);
        gameObject.setActive(false);
      } else {
        gameObject.x = gameObject.input.dragStartX;
        gameObject.y = gameObject.input.dragStartY;
      }
    });

    this.input.on('dragend', (pointer: any, gameObject: any, dropped: any) => {
      gameObject.clearTint();
      // otherwise the counter will be back to original position
      if (!dropped) {
        gameObject.x = gameObject.input.dragStartX;
        gameObject.y = gameObject.input.dragStartY;
      }
      // clear edges highlight
      graphics.clear();
    });
  }

  createCardInventory() {
    // Create our CardInventory.
    const cardInventory = new CardInventory(this);

    const {height} = this.scale;

    // Create Inventory button at bottom left corner to toggle all types of inventories.
    const inventoryButton = this.add.sprite(30, height - 30, 'brown-box');
    this.add
      .image(inventoryButton.x, inventoryButton.y, 'open-box')
      .setScale(0.7);

    // Make Inventory button interactive.
    inventoryButton
      .setInteractive()
      .on('pointerdown', () => {
        inventoryButton.setTint(0xd3d3d3);
      })
      .on('pointerout', () => {
        inventoryButton.clearTint();
      })
      .on('pointerup', () => {
        inventoryButton.clearTint();
        if (cardInventory.isOpen) {
          cardInventory.hide();
        } else {
          cardInventory.show();
        }
      });

    // SIMULATING ONE SINGLE PLAYER. THIS IS NOT FINAL.
    const currentPlayer = PlayerManager.getInstance().getCurrentPlayer();
    const playerCards = currentPlayer.getCards();

    // display all the cards on screen
    playerCards.forEach(card => {
      cardInventory.addCard(card.name);
    });
  }
}
