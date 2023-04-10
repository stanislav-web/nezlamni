import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import mongoose, { Document, Types } from 'mongoose';
import { Player } from './player.schema';
import { PlayerContentTypeEnum } from '../enums/player-content-type.enum';

export type PlayerContentDocument = PlayerContent & Document;

@Schema({
  collection: 'players_content',
  bufferTimeoutMS: 3000,
  minimize: true,
  optimisticConcurrency: true,
  safe: true,
  strict: true,
  validateBeforeSave: true,
  timestamps: true,
})
export class PlayerContent {
  @Transform(({ value }) => value.toString())
  _id?: Types.ObjectId;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true })
  player: Player;
  @Prop({ type: String, enum: PlayerContentTypeEnum, required: true })
  type: PlayerContentTypeEnum;
  @Prop({ type: String, required: true })
  caption: string;
  @Prop({ type: String, required: true })
  fileId: string;
  @Prop({ type: String, required: true })
  filePath: string;
}

export const PlayerContentSchema = SchemaFactory.createForClass(PlayerContent);
