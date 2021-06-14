import { ApiProperty } from '@nestjs/swagger';

export class ContactCountDto {
  @ApiProperty({
    type: Number,
    example: 1401,
  })
  count: number;
}
