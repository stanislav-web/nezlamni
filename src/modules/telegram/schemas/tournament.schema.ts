import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { HydratedDocument, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { Player } from './player.schema';
import { TournamentStatusEnum } from '../enums/tournament-status.enum';
import { TournamentTypeEnum } from '../enums/tournament-type.enum';

export type TournamentDocument = HydratedDocument<Tournament>;

@Schema({
  collection: 'tournaments',
  bufferTimeoutMS: 3000,
  minimize: true,
  optimisticConcurrency: true,
  safe: true,
  strict: true,
  validateBeforeSave: true,
  timestamps: true,
})
export class Tournament {
  @Transform(({ value }) => value.toString())
  _id?: Types.ObjectId;

  @Prop({
    type: Number,
    default: () => Math.floor(new Date().getTime() / 1000),
  })
  tournamentId?: number;

  @Prop({
    required: true,
    set: (title: string) => {
      return title.trim();
    },
  })
  title: string;

  @Prop({
    type: String,
    enum: Object.values(TournamentTypeEnum),
    required: true,
  })
  type: TournamentTypeEnum;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ contentType: String, data: Buffer })
  logo?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Player' })
  winner?: Player;

  @Prop({
    type: String,
    enum: Object.values(TournamentStatusEnum),
    required: true,
    default: TournamentStatusEnum.OPEN,
  })
  status?: TournamentStatusEnum;
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);
