import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { CV } from '../../cv/entities/cv.entity';

@Entity('users')
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ unique: true })
  @Field()
  username: string;

  @Column()
  hashedPassword: string; // Not exposed in GraphQL

  @OneToMany(() => CV, cv => cv.user, { cascade: true })
  @Field(() => [CV], { nullable: true })
  cvs?: CV[];
}
