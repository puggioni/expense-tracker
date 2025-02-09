import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './entities/account.entity';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(
    @Request() req,
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<Account> {
    return this.accountsService.create(createAccountDto, req.user);
  }

  @Get()
  findAll(@Request() req): Promise<Account[]> {
    return this.accountsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string): Promise<Account> {
    return this.accountsService.findOne(id, req.user.id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string): Promise<void> {
    return this.accountsService.remove(id, req.user.id);
  }
}
