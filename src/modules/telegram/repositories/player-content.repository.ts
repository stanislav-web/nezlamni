import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  PlayerContent,
  PlayerContentDocument,
} from '../schemas/player-content.schema';
import { Player, PlayerDocument } from '../schemas/player.schema';

@Injectable()
export class PlayerContentRepository {
  constructor(
    @InjectModel(PlayerContent.name)
    private readonly playerContentModel: Model<PlayerContentDocument>,
  ) {}

  /**
   * Add content
   * @param {PlayerContent} content
   * @return Promise<Player>
   */
  async add(
    content: PlayerContent,
  ): Promise<PlayerContent & { _id: Types.ObjectId }> {
    const created = new this.playerContentModel(content);
    return await created.save();
  }

  /**
   * Get players content list
   * @param {any} filter
   * @return Promise<PlayerContent[] | null>
   */
  async findAll(filter?: any): Promise<PlayerContent[] | null> {
    return this.playerContentModel.find(filter).exec();
  }

  /**
   * Update player content by Id
   * @param {string} id
   * @param {PlayerContent} content
   * @return Promise<Player | null>
   */
  async update(id: string, content: PlayerContent): Promise<Player | null> {
    return this.playerContentModel.findByIdAndUpdate(id, content, {
      new: true,
    });
  }

  /**
   * Delete player content by credentials
   * @param {Partial<PlayerContent>} filter
   * @return Promise<any>
   */
  async findOneAndRemove(filter: Partial<PlayerContent>): Promise<any> {
    return this.playerContentModel.findOneAndRemove(filter, {});
  }
}
