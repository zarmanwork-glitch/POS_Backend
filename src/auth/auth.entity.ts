import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { applyIdVirtual } from 'src/shared/utils/genericFunctions';


@Schema({
  collection: 'users',
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})
export class User {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
    select: false, 
  })
  password: string;


  @Prop({ 
    default: false 
  })
  isDeleted?: boolean;


  @Prop({ type: Number, default: 0 })
  invoiceCounter: number;

}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);




UserSchema.pre<UserDocument>('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


UserSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate() as any;

  if (update?.password) {
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
    this.setUpdate(update);
  }
});


applyIdVirtual(UserSchema, { removeFields: ['password'] });