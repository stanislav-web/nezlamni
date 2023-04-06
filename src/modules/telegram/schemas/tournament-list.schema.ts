import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Tournament } from './tournament.schema';
import { TournamentTypeEnum } from '../enums/tournament-type.enum';

export type TournamentDocument = HydratedDocument<Tournament>;

@Schema({
  collection: 'tournament_list',
  bufferTimeoutMS: 3000,
  minimize: true,
  optimisticConcurrency: true,
  safe: true,
  strict: true,
  validateBeforeSave: true,
  timestamps: true,
})
export class TournamentList {
  @Prop({ required: true })
  title: string;

  @Prop({
    type: String,
    enum: Object.values(TournamentTypeEnum),
    required: true,
  })
  type: TournamentTypeEnum;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ contentType: String, data: Buffer })
  logo?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' })
  tournament?: Tournament;
}

export const TournamentListSchema =
  SchemaFactory.createForClass(TournamentList);
