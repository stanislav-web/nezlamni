import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {Player, PlayerDocument} from "../schemas/player.schema";

@Injectable()
export class PlayerRepository {
    constructor(@InjectModel(Player.name) private playerModel: Model<PlayerDocument>) {}

    /**
     * Create player
     * @param {Player} player
     * @return Promise<Player>
     */
    async create(player: Player): Promise<Player> {
        const created = new this.playerModel(player);
        return await created.save();
    }

    /**
     * Get players list
     * @return Promise<Player[]>
     */
    async findAll(): Promise<Player[]> {
        return await this.playerModel.find().exec();
    }

    /**
     * Get players list
     * @param {Partial<Player>} filter
     * @param {Partial<Player>} data
     * @return Promise<Player>
     */
    async findOneAndUpdate(filter: Partial<Player>, data: Partial<Player>): Promise<Player> {
        return await this.playerModel.findOneAndUpdate(filter, data).exec();
    }

    /**
     * Update player by Id
     * @param {string} id
     * @param {Player} player
     * @return Promise<Player>
     */
    async update(id: string, player: Player): Promise<Player> {
        return this.playerModel.findByIdAndUpdate(id, player, {new: true});
    }

    /**
     * Delete player by Id
     * @param {string} id
     * @return Promise<any>
     */
    async delete(id: string): Promise<any> {
        return this.playerModel.findByIdAndRemove(id);
    }
}
