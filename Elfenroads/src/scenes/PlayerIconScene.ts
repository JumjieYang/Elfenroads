import Phaser from 'phaser';
import PlayerIcon from '../classes/PlayerIcon';
import PlayerManager from '../managers/PlayerManager';
import Player from '../classes/Player';

export default class PlayerTokenScene extends Phaser.Scene {
  constructor() {
    super('playericonscene');
  }

  private createPlayerIcons(): void {
    const icons: Array<PlayerIcon> = [];
    const players: Array<Player> = PlayerManager.getInstance().getPlayers();

    for (let i = 0; i < players.length; i++) {
      icons.push(
        new PlayerIcon(
          this,
          this.cameras.main.width / 7,
          this.cameras.main.height / 4 + 70 * i,
          players[i].getBootColour()
        )
      );
    }
  }

  create() {
    this.createPlayerIcons();

    //   player1.addCounter('unknown-counter');
    //   player1.addCounter('pig-counter');
    //   player1.addCounter('cloud-counter');

    //   player2.addCounter('unknown-counter');
  }
}
