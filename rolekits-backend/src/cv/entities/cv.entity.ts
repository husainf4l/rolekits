import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class Experience {
  @Field()
  company: string;

  @Field()
  position: string;

  @Field()
  startDate: string;

  @Field({ nullable: true })
  endDate?: string;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType()
export class Education {
  @Field()
  institution: string;

  @Field()
  degree: string;

  @Field()
  fieldOfStudy: string;

  @Field()
  startDate: string;

  @Field({ nullable: true })
  endDate?: string;
}

@ObjectType()
export class Language {
  @Field()
  language: string;

  @Field()
  proficiency: string;
}

@ObjectType()
export class Certification {
  @Field()
  name: string;

  @Field()
  issuer: string;

  @Field()
  date: string;
}

@ObjectType()
export class Project {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  url?: string;
}

@ObjectType()
export class Reference {
  @Field()
  name: string;

  @Field()
  position: string;

  @Field()
  company: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone?: string;
}

@Entity('cvs')
@ObjectType()
export class CV {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  userId: string;

  @ManyToOne(() => User, user => user.cvs)
  @Field(() => User)
  user: User;

  // Personal Information
  @Column({ nullable: true })
  @Field({ nullable: true })
  fullName?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  linkedin?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  github?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  website?: string;

  // Professional Summary
  @Column('text', { nullable: true })
  @Field({ nullable: true })
  summary?: string;

  // JSON columns for complex data
  @Column('jsonb', { nullable: true })
  @Field(() => [Experience], { nullable: true })
  experience?: Experience[];

  @Column('jsonb', { nullable: true })
  @Field(() => [Education], { nullable: true })
  education?: Education[];

  @Column('jsonb', { nullable: true })
  @Field(() => [String], { nullable: true })
  skills?: string[];

  @Column('jsonb', { nullable: true })
  @Field(() => [Language], { nullable: true })
  languages?: Language[];

  @Column('jsonb', { nullable: true })
  @Field(() => [Certification], { nullable: true })
  certifications?: Certification[];

  @Column('jsonb', { nullable: true })
  @Field(() => [Project], { nullable: true })
  projects?: Project[];

  @Column('jsonb', { nullable: true })
  @Field(() => [Reference], { nullable: true })
  references?: Reference[];

  // Metadata
  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
