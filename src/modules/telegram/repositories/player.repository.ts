import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Player, PlayerDocument } from '../schemas/player.schema';

@Injectable()
export class PlayerRepository {
  constructor(
    @InjectModel(Player.name)
    private readonly playerModel: Model<PlayerDocument>,
  ) {}

  /**
   * Create player
   * @param {Player} player
   * @return Promise<Player>
   */
  async create(player: Player): Promise<Player & { _id: Types.ObjectId }> {
    const created = new this.playerModel(player);
    return await created.save();
  }

  /**
   * Get players list
   * @param {any} filter
   * @return Promise<Player[] | null>
   */
  async findAll(filter?: any): Promise<Player[] | null> {
    return this.playerModel.find(filter).exec();
  }

  /**
   * Get player
   * @param {Partial<Player>} filter
   * @return Promise<Player | null>
   */
  async findOne(filter: Partial<Player>): Promise<Player | null> {
    return this.playerModel.findOne(filter);
  }

  /**
   * Get players list
   * @param {Partial<Player>} filter
   * @param {Partial<Player>} data
   * @return Promise<Player | null>
   */
  async findOneAndUpdate(
    filter: Partial<Player>,
    data: Partial<Player>,
  ): Promise<Player | null> {
    return this.playerModel.findOneAndUpdate(filter, data);
  }

  /**
   * Update player by Id
   * @param {string} id
   * @param {Player} player
   * @return Promise<Player | null>
   */
  async update(id: string, player: Player): Promise<Player | null> {
    return this.playerModel.findByIdAndUpdate(id, player, { new: true });
  }

  /**
   * Delete player by Id
   * @param {string} id
   * @return Promise<any>
   */
  async delete(id: string): Promise<any> {
    return this.playerModel.findByIdAndRemove(id);
  }

  /**
   * Delete player by credentials
   * @param {Partial<Player>} filter
   * @return Promise<any>
   */
  async findOneAndRemove(filter: Partial<Player>): Promise<any> {
    return this.playerModel.findOneAndRemove(filter, {});
  }
}
