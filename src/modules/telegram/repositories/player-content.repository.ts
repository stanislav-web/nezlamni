import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PlayerContent,
  PlayerContentDocument,
} from '../schemas/player-content.schema';
import { Player } from '../schemas/player.schema';

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
   * @param {Partial<PlayerContent>} filter
   * @param {number} limit
   * @return Promise<PlayerContent[] | null>
   */
  async findAll(
    filter?: Partial<PlayerContent>,
    limit?: number,
  ): Promise<PlayerContent[] | null> {
    return this.playerContentModel.find(filter).limit(limit).exec();
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
