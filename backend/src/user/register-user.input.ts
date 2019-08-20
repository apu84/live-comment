import { IsEmail, Length } from "class-validator";
import { Field, InputType } from "type-graphql";
import { IsEmailAlreadyExist } from "./user.validator";

@InputType()
export class RegisterUserInputType {
  @Field()
  @Length(3, 255)
  name: string;

  @Field()
  @Length(2, 32)
  userId: string;

  @Field()
  password: string;

  @Field()
  @IsEmail()
  @IsEmailAlreadyExist({
    message: "Use account with $value already exists."
  })
  email: string;
}
