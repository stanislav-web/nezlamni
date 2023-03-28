import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type Document = Product & Document;

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
export class Players {
  @Prop()
  name: string;

  @Prop()
  manufacturer: string;

  @Prop()
  manufactureYear: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
