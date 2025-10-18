import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsArray } from 'class-validator';
import { Experience, Education, Language, Certification, Project, Reference } from '../entities/cv.entity';

@InputType()
class ExperienceInput {
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

@InputType()
class EducationInput {
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

@InputType()
class LanguageInput {
  @Field()
  language: string;

  @Field()
  proficiency: string;
}

@InputType()
class CertificationInput {
  @Field()
  name: string;

  @Field()
  issuer: string;

  @Field()
  date: string;
}

@InputType()
class ProjectInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  url?: string;
}

@InputType()
class ReferenceInput {
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

@InputType()
export class CreateCVInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fullName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  github?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  website?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  summary?: string;

  @Field(() => [ExperienceInput], { nullable: true })
  @IsOptional()
  @IsArray()
  experience?: ExperienceInput[];

  @Field(() => [EducationInput], { nullable: true })
  @IsOptional()
  @IsArray()
  education?: EducationInput[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  skills?: string[];

  @Field(() => [LanguageInput], { nullable: true })
  @IsOptional()
  @IsArray()
  languages?: LanguageInput[];

  @Field(() => [CertificationInput], { nullable: true })
  @IsOptional()
  @IsArray()
  certifications?: CertificationInput[];

  @Field(() => [ProjectInput], { nullable: true })
  @IsOptional()
  @IsArray()
  projects?: ProjectInput[];

  @Field(() => [ReferenceInput], { nullable: true })
  @IsOptional()
  @IsArray()
  references?: ReferenceInput[];
}
