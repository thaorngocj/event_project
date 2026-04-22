import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './modules/users/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.userRepo.count();
    if (count > 0) {
      this.logger.log(`DB already has ${count} users – skipping seed.`);
      return;
    }

    this.logger.log('Seeding default users...');

    const seeds = [
      { username: 'superadmin1', email: 'superadmin1@school.edu', password: 'super123',  role: 'SUPER_ADMIN' },
      { username: 'admin',       email: 'admin@school.edu',       password: 'admin123',  role: 'ADMIN'       },
      { username: 'sv01',        email: 'sv01@school.edu',        password: '123456',    role: 'STUDENT'     },
      { username: 'sv02',        email: 'sv02@school.edu',        password: '123456',    role: 'STUDENT'     },
    ] as const;

    for (const seed of seeds) {
      const hashed = await bcrypt.hash(seed.password, 10);
      const user = this.userRepo.create({ ...seed, password: hashed });
      await this.userRepo.save(user);
      this.logger.log(`  ✓ ${seed.username} (${seed.role})`);
    }

    this.logger.log('Seed complete.');
  }
}
