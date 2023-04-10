import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, Types } from 'mongoose';

export type PlayerDocument = Player & Document;

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

  @Prop({ type: Number, required: true, unique: true })
  telegramUserId: number;

  @Prop({ type: String, required: true })
  telegramFirstName: string;

  @Prop({ type: String, required: true })
  telegramUsername: string;

  @Prop({ type: String, required: true })
  telegramChannelId: number;

  @Prop({
    required: false,
    type: String,
    set: (playerNickname: string) => {
      return playerNickname.trim();
    },
  })
  playerNickname?: string;

  @Prop({
    required: false,
    type: String,
    set: (playerNation: string) => {
      return playerNation.trim();
    },
  })
  playerNation?: string;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
