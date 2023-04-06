import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tournament, TournamentDocument } from '../schemas/tournament.schema';

@Injectable()
export class TournamentRepository {
  constructor(
    @InjectModel(Tournament.name)
    private readonly tournamentModel: Model<TournamentDocument>,
  ) {}

  /**
   * Create tournament
   * @param {Tournament} tournament
   * @return Promise<Tournament>
   */
  async create(
    tournament: Tournament,
  ): Promise<Tournament & { _id: Types.ObjectId }> {
    const created = new this.tournamentModel(tournament);
    return await created.save();
  }
}
