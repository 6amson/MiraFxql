import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNumber, IsString, IsPositive, IsInt, Min, IsNotEmpty } from 'class-validator';
import { HydratedDocument } from 'mongoose';

export type FXQLDocument = HydratedDocument<FXQL>;

@Schema({ timestamps: true })
export class FXQL {
  @Prop({ required: true, uppercase: true })
  @IsString()
  @IsNotEmpty()
  SourceCurrency: string;

  @Prop({ required: true, uppercase: true })
  @IsString()
  @IsNotEmpty()
  DestinationCurrency: string;

  @Prop({ required: true })
  @IsNumber()
  @IsPositive()
  BuyPrice: number;

  @Prop({ required: true })
  @IsNumber()
  @IsPositive()
  SellPrice: number;

  @Prop({ required: true })
  @IsInt()
  @Min(0)
  CapAmount: number;
}

// Create the Mongoose Schema factory
export const FXQLSchema = SchemaFactory.createForClass(FXQL);
