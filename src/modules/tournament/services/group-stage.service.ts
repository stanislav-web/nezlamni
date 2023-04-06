import { Injectable } from '@nestjs/common';
import group from 'group';
import { Player } from '../../telegram/schemas/player.schema';

@Injectable()
export class GroupStageService {
  /**
   * Generate group stage buckets
   * @param {Player} players
   * @param {number} groupSize
   * @param {boolean} isMarked
   * @return [Player[]]
   */
  public generateBuckets(
    players: Player[],
    groupSize = 4,
    isMarked?: boolean,
  ): any[] {
    players = players.sort(() => Math.random() - 0.5);
    const groups: [Player[]] = group.fromArray(players, groupSize);
    if (isMarked) {
      const chars = Array.from(Array(26)).map((e, i) => i + 65);
      const alphabet = chars.map((x) => String.fromCharCode(x));
      const newArr = [];
      for (let i = 0; i < groups.length; i++) {
        newArr.push({ [alphabet[i]]: groups[i] });
      }
      return newArr;
    }
    return groups;
  }
}
