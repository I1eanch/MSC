import { PartialType } from '@nestjs/swagger';
import { CreateOnboardingDto } from './create-onboarding.dto';
import { InputType } from '@nestjs/graphql';

@InputType()
export class UpdateOnboardingDto extends PartialType(CreateOnboardingDto) {}
