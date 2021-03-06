import UIScene from '../UIScene';
import {CardManager} from '../../managers/CardManager';
import {CardUnit, MagicSpellCard} from '../../classes/CardUnit';
import Edge from '../../classes/Edge';
import PlayerManager from '../../managers/PlayerManager';
import EdgeMenu from '../../classes/EdgeMenu';
import RoadManager from '../../managers/RoadManager';
import {EdgeType} from '../../enums/EdgeType';
import {Counter, ItemUnit, Obstacle} from '../../classes/ItemUnit';
import SocketManager from '../../managers/SocketManager';
import ItemManager from '../../managers/ItemManager';
import GameManager from '../../managers/GameManager';
import {GameVariant} from '../../enums/GameVariant';
import Town from '../../classes/Town';
import Game from '../../components/Game';

export default class SelectionScene extends Phaser.Scene {
  private selectedCardSprites!: Array<Phaser.GameObjects.Sprite>;
  private selectedEdge!: Edge;
  private edgeMenus!: Array<EdgeMenu>;
  private selectedTown!: Town;
  private callback!: Function;

  constructor() {
    super('selectionscene');
  }

  create(callback: Function) {
    this.selectedCardSprites = [];
    this.edgeMenus = [];
    this.callback = callback;
    this.createUIBanner();

    // Only allow local player to interact with UI if its their turn
    if (
      PlayerManager.getInstance().getCurrentPlayer() ===
      PlayerManager.getInstance().getLocalPlayer()
    ) {
      this.makeCardsInteractive();
      this.makeEdgesInteractive();
      this.createUIPassTurnButton();
    }
    SocketManager.getInstance().setScene(this.scene);
  }

  // Button to skip turn
  private createUIPassTurnButton(): void {
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

        if (
          GameManager.getInstance().getGameVariant() === GameVariant.elfengold
        ) {
          this.scene.launch('choosecoinscene', () => {
            this.scene.get('choosecoinscene').scene.stop();
            PlayerManager.getInstance().getCurrentPlayer().setPassedTurn(true);
            PlayerManager.getInstance().setNextPlayer();
            this.scene.get('uiscene').scene.restart();
            let finishedPlayers: integer = 0;
            PlayerManager.getInstance()
              .getPlayers()
              .forEach(player => {
                if (player.getPassedTurn() === true) {
                  finishedPlayers++;
                }
              });

            if (
              finishedPlayers ===
              PlayerManager.getInstance().getPlayers().length
            ) {
              SocketManager.getInstance().emitStatusChange({
                nextPhase: true,
                CardManager: CardManager.getInstance(),
                ItemManager: ItemManager.getInstance(),
                PlayerManager: PlayerManager.getInstance(),
              });
            } else {
              SocketManager.getInstance().emitStatusChange({
                CardManager: CardManager.getInstance(),
                ItemManager: ItemManager.getInstance(),
                PlayerManager: PlayerManager.getInstance(),
              });
            }
          });
        } else {
          PlayerManager.getInstance().getCurrentPlayer().setPassedTurn(true);
          PlayerManager.getInstance().setNextPlayer();
          this.scene.get('uiscene').scene.restart();
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
            SocketManager.getInstance().emitStatusChange({
              nextPhase: true,
              CardManager: CardManager.getInstance(),
              ItemManager: ItemManager.getInstance(),
              PlayerManager: PlayerManager.getInstance(),
            });
          } else {
            SocketManager.getInstance().emitStatusChange({
              CardManager: CardManager.getInstance(),
              ItemManager: ItemManager.getInstance(),
              PlayerManager: PlayerManager.getInstance(),
            });
          }
        }
      });
  }

  // UI banner that displays what Phase of Elfenroads is being played
  private createUIBanner(): void {
    // Create text to notify that it is draw counter phase
    const selectCardnEdgeText: Phaser.GameObjects.Text = this.add.text(
      10,
      6,
      'To Select Cards & Edge',
      {
        fontFamily: 'MedievalSharp',
        fontSize: '30px',
      }
    );

    const gameWidth: number = this.cameras.main.width;
    // Create brown ui panel element relative to the size of the text
    const brownPanel: Phaser.GameObjects.RenderTexture = this.add
      .nineslice(0, 0, selectCardnEdgeText.width + 20, 40, 'brown-panel', 24)
      .setOrigin(0, 0);

    // Initialize container to group elements
    // Need to center the container relative to the gameWidth and the size of the text box
    const container: Phaser.GameObjects.Container = this.add.container(
      gameWidth / 2 - brownPanel.width / 2,
      90
    );

    // Render the brown panel and text
    container.add(brownPanel);
    container.add(selectCardnEdgeText);
  }

  private chooseMagicFlight(): void {
    // Create small button with the "next" icon
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const magicFlightButton = this.add.sprite(
      width - 100,
      height - 30,
      'brown-box'
    );
    this.add
      .image(magicFlightButton.x, magicFlightButton.y, 'witch-flight')
      .setScale(0.07);

    // Add interactive pointer options for passTurnButton
    // After click, currentPlayer is updated via playerManager
    magicFlightButton
      .setInteractive()
      .on('pointerdown', () => {
        magicFlightButton.setTint(0xd3d3d3);
      })
      .on('pointerout', () => {
        magicFlightButton.clearTint();
      })
      .on('pointerup', () => {
        magicFlightButton.clearTint();
        this.makeTownsInteractive();
      });
  }

  private makeTownsInteractive(): void {
    RoadManager.getInstance()
      .getTowns()
      .forEach(town => {
        const pos = UIScene.getResponsivePosition(
          this,
          town.getPosition()[0],
          town.getPosition()[1]
        );
        const confirmBtn = this.add
          .image(pos[0], pos[1], 'green-box')
          .setScale(0.7);
        confirmBtn
          .setInteractive()
          .on('pointerdown', () => {
            confirmBtn.setTint(0xd3d3d3);
          })
          .on('pointerout', () => {
            confirmBtn.clearTint();
          })
          .on('pointerup', () => {
            confirmBtn.clearTint();
            this.selectedTown = town;
            this.attemptMagicFlight(
              this.selectedCardSprites,
              this.selectedTown,
              this
            );
          });
      });
  }

  private attemptMagicFlight(
    selectedCardSprites: Array<Phaser.GameObjects.Sprite>,
    selectedTown: Town,
    currentScene: Phaser.Scene
  ): void {
    let selectedCard: CardUnit | undefined = undefined;
    if (selectedCardSprites.length > 0) {
      // check if each card sprites are valid and collect each cards
      for (const card of selectedCardSprites) {
        const c = CardManager.getInstance().getSelectedCard(
          PlayerManager.getInstance().getCurrentPlayer(),
          card.name
        );
        if (c === undefined) {
          card.y += 50;
          selectedCardSprites.splice(selectedCardSprites.indexOf(card), 1);
        } else {
          card.removeInteractive();
          if (c instanceof MagicSpellCard) {
            selectedCard = c;
          }
        }
      }
      const currPlayer = PlayerManager.getInstance().getCurrentPlayer();
      const town = selectedTown;
      if (
        town !== undefined &&
        selectedCard !== undefined &&
        CardManager.getInstance().isMagicFlight(currPlayer, selectedCard)
      ) {
        // remove played witch cards sprite and update the player's hand
        for (const card of selectedCardSprites) {
          const c = CardManager.getInstance().getSelectedCard(
            PlayerManager.getInstance().getCurrentPlayer(),
            card.name
          );
          if (c === undefined) {
            selectedCardSprites.splice(selectedCardSprites.indexOf(card), 1);
          } else {
            if (c instanceof MagicSpellCard) {
              UIScene.cardSprites.splice(UIScene.cardSprites.indexOf(card), 1);
              card.destroy();
              CardManager.getInstance().addToPile(
                PlayerManager.getInstance().getCurrentPlayer(),
                c
              );
              PlayerManager.getInstance().setCurrentTown(
                PlayerManager.getInstance().getCurrentPlayerIndex(),
                town
              );
            }
          }
        }
        SocketManager.getInstance().emitStatusChange({
          CardManager: CardManager.getInstance(),
          ItemManager: ItemManager.getInstance(),
          PlayerManager: PlayerManager.getInstance(),
        });
      } else {
        for (let i = 0; i < selectedCardSprites.length; i++) {
          // remove selection of card
          const card = selectedCardSprites[i];
          card.y += 50;
          selectedCardSprites.splice(i, 1);
          // set the card be interactive again
          card
            .setInteractive()
            .on('pointerover', () => {
              card.setTint(0xd3d3d3);
            })
            .on('pointerdown', () => {
              const index: number = this.selectedCardSprites.indexOf(card);
              if (index === -1) {
                card.y -= 50;
                this.selectedCardSprites.push(card);
              } else {
                card.y += 50;
                this.selectedCardSprites.splice(index, 1);
              }
            })
            .on('pointerout', () => {
              card.clearTint();
            })
            .on('pointerup', () => {
              card.clearTint();
            });
          SocketManager.getInstance().emitStatusChange({
            CardManager: CardManager.getInstance(),
            ItemManager: ItemManager.getInstance(),
            PlayerManager: PlayerManager.getInstance(),
          });
        }
      }
    }
  }

  // Sets interactive options for CurrentPlayer's Cards.
  private makeCardsInteractive(): void {
    // make every cards in hand selectable
    for (const cardSprite of UIScene.cardSprites) {
      // make it possible to select cardSprite
      cardSprite
        .setInteractive()
        .on('pointerover', () => {
          cardSprite.setTint(0xd3d3d3);
        })
        .on('pointerdown', () => {
          const index: number = this.selectedCardSprites.indexOf(cardSprite);
          if (index === -1) {
            cardSprite.y -= 50;
            this.selectedCardSprites.push(cardSprite);
            const c = CardManager.getInstance().getSelectedCard(
              PlayerManager.getInstance().getCurrentPlayer(),
              cardSprite.name
            );
            if (c === undefined) {
              cardSprite.y += 50;
              this.selectedCardSprites.splice(index, 1);
            } else {
              if (c instanceof MagicSpellCard) {
                this.chooseMagicFlight();
              }
            }
          } else {
            cardSprite.y += 50;
            this.selectedCardSprites.splice(index, 1);
          }
        })
        .on('pointerout', () => {
          cardSprite.clearTint();
        })
        .on('pointerup', () => {
          cardSprite.clearTint();
        });
    }
  }

  // Sets interactive options for Items on the map's Edges.
  private makeEdgesInteractive(): void {
    // Make the itemSprites interactive
    UIScene.itemSpritesOnEdges.forEach(itemSprite => {
      const itemObject: ItemUnit = itemSprite.getData('item');

      // Only make travel counters interactable
      if (itemObject instanceof Counter) {
        const edgeMenu = new EdgeMenu(
          itemSprite.getData('mainScene'),
          itemSprite.getCenter().x,
          itemSprite.getCenter().y,
          this.attemptMoveBoot
        );

        this.edgeMenus.push(edgeMenu);

        itemSprite
          .setInteractive()
          .on('pointerdown', () => {
            itemSprite.setTint(0xd3d3d3);
          })
          .on('pointerout', () => {
            itemSprite.clearTint();
          })
          .on('pointerup', () => {
            itemSprite.clearTint();

            this.selectedEdge = itemSprite.getData('currentEdge');
            const args = [this.selectedCardSprites, this.selectedEdge, this];

            edgeMenu.setArgs(args);

            if (edgeMenu.isOpen) {
              edgeMenu.hide();
            } else {
              this.edgeMenus.forEach(menu => {
                menu.hide();
              });
              edgeMenu.show();
            }
          });
      }
    });

    // make river and lakes selectable
    RoadManager.getInstance()
      .getEdges()
      .forEach(edge => {
        if (
          edge.getType() === EdgeType.River ||
          edge.getType() === EdgeType.Lake
        ) {
          const pos = UIScene.getResponsivePosition(
            this,
            edge.getPosition()[0],
            edge.getPosition()[1]
          );
          const confirmBtn = this.add
            .image(pos[0], pos[1], 'green-box')
            .setScale(0.7);
          confirmBtn
            .setInteractive()
            .on('pointerdown', () => {
              confirmBtn.setTint(0xd3d3d3);
            })
            .on('pointerout', () => {
              confirmBtn.clearTint();
            })
            .on('pointerup', () => {
              confirmBtn.clearTint();
              this.selectedEdge = edge;
              this.attemptMoveBoot(
                this.selectedCardSprites,
                this.selectedEdge,
                this
              );
            });
        }
      });
  }

  // Function that attempts to move boot.
  private attemptMoveBoot(
    selectedCardSprites: Array<Phaser.GameObjects.Sprite>,
    selectedEdge: Edge,
    currentScene: Phaser.Scene
  ): void {
    const selectedCards: Array<CardUnit> = [];
    if (selectedCardSprites.length > 0) {
      // check if each card sprites are valid and collect each cards
      for (const card of selectedCardSprites) {
        const c = CardManager.getInstance().getSelectedCard(
          PlayerManager.getInstance().getCurrentPlayer(),
          card.name
        );
        if (c === undefined) {
          card.y += 50;
          selectedCardSprites.splice(selectedCardSprites.indexOf(card), 1);
        } else {
          card.removeInteractive();
          selectedCards.push(c);
        }
      }
      const currPlayer = PlayerManager.getInstance().getCurrentPlayer();
      const edge = selectedEdge;
      if (
        edge !== undefined &&
        selectedCards.length > 0 &&
        CardManager.getInstance().isValidSelection(
          currPlayer,
          selectedCards,
          edge
        )
      ) {
        // remove all played cards sprite and update the player's hand
        for (const card of selectedCardSprites) {
          const c = CardManager.getInstance().getSelectedCard(
            PlayerManager.getInstance().getCurrentPlayer(),
            card.name
          );
          if (c === undefined) {
            selectedCardSprites.splice(selectedCardSprites.indexOf(card), 1);
          } else {
            card.destroy();
            CardManager.getInstance().addToPile(
              PlayerManager.getInstance().getCurrentPlayer(),
              c
            );
          }
        }
        PlayerManager.getInstance().movePlayer(
          PlayerManager.getInstance().getCurrentPlayer(),
          edge,
          GameManager.getInstance().getGameVariant() === GameVariant.elfengold
        );
        SocketManager.getInstance().emitStatusChange({
          CardManager: CardManager.getInstance(),
          ItemManager: ItemManager.getInstance(),
          PlayerManager: PlayerManager.getInstance(),
        });
      } else {
        for (let i = 0; i < selectedCardSprites.length; i++) {
          // remove selection of card
          const card = selectedCardSprites[i];
          card.y += 50;
          selectedCardSprites.splice(i, 1);
          // set the card be interactive again
          card
            .setInteractive()
            .on('pointerover', () => {
              card.setTint(0xd3d3d3);
            })
            .on('pointerdown', () => {
              const index: number = this.selectedCardSprites.indexOf(card);
              if (index === -1) {
                card.y -= 50;
                this.selectedCardSprites.push(card);
              } else {
                card.y += 50;
                this.selectedCardSprites.splice(index, 1);
              }
            })
            .on('pointerout', () => {
              card.clearTint();
            })
            .on('pointerup', () => {
              card.clearTint();
            });
          currentScene.scene.get('uiscene').scene.restart();
          currentScene.scene.restart();
        }
      }
    }
  }
  public nextPhase(): void {
    this.callback();
  }
}
