import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class TenantDataSourceService {
  private readonly logger = new Logger(TenantDataSourceService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async createTenantSchema(schemaName: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.createSchema(schemaName, true);
      this.logger.log(`Schema created: ${schemaName}`);
    } finally {
      await queryRunner.release();
    }
  }

  async dropTenantSchema(schemaName: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
      this.logger.log(`Schema dropped: ${schemaName}`);
    } finally {
      await queryRunner.release();
    }
  }

  async setTenantSchema(queryRunner: QueryRunner, schemaName: string): Promise<void> {
    await queryRunner.query(`SET search_path TO "${schemaName}", public`);
  }

  getQueryRunnerWithSchema(_schemaName: string): QueryRunner {
    return this.dataSource.createQueryRunner();
  }

  get connection(): DataSource {
    return this.dataSource;
  }
}
