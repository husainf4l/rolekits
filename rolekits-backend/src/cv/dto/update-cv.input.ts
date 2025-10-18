import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateCVInput } from './create-cv.input';

@InputType()
export class UpdateCVInput extends PartialType(CreateCVInput) {}
