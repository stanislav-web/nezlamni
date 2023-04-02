import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
  @Prop({ required: true })
  telegramUserId: number;
  @Prop({ required: true })
  telegramFirstName: string;
  @Prop({ required: true })
  telegramUsername: string;
  @Prop({ required: true })
  telegramChannelId: number;
  @Prop({ required: false })
  playerNickname?: string;
  @Prop({ required: false })
  playerNation?: string;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
