import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { HydratedDocument, Types } from 'mongoose';

export type PlayerDocument = HydratedDocument<Player>;

@Schema({
  collection: 'players',
  bufferTimeoutMS: 3000,
  minimize: true,
  optimisticConcurrency: true,
  safe: true,
  strict: true,
  validateBeforeSave: true,
  timestamps: true,
})
export class Player {
  @Transform(({ value }) => value.toString())
  _id?: Types.ObjectId;

  @Prop({ required: true, unique: true })
  telegramUserId: number;

  @Prop({ required: true })
  telegramFirstName: string;

  @Prop({ required: true })
  telegramUsername: string;

  @Prop({ required: true })
  telegramChannelId: number;

  @Prop({
    required: false,
    set: (playerNickname: string) => {
      return playerNickname.trim();
    },
  })
  playerNickname?: string;

  @Prop({
    required: false,
    set: (playerNation: string) => {
      return playerNation.trim();
    },
  })
  playerNation?: string;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
