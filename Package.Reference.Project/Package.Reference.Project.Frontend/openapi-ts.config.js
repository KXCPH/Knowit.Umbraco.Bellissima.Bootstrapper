import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    client: 'fetch',
    debug: true,
    input: 'https://localhost:44348/umbraco/swagger/Package.Reference.Project-api-v1/swagger.json',
    output: {
        path: 'src/api',
        format: 'prettier',
        lint: 'eslint',
    },
    schemas: false,
    services: {
        asClass: true,
    },
    types: {
        enums: 'typescript',
    }
});