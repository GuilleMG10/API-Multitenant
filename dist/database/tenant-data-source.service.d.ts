import { DataSource, QueryRunner } from 'typeorm';
export declare class TenantDataSourceService {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    createTenantSchema(schemaName: string): Promise<void>;
    dropTenantSchema(schemaName: string): Promise<void>;
    setTenantSchema(queryRunner: QueryRunner, schemaName: string): Promise<void>;
    getQueryRunnerWithSchema(_schemaName: string): QueryRunner;
    get connection(): DataSource;
}
