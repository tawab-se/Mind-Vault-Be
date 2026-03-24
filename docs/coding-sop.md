# Standard Operating Procedure (SOP) for Coding with Standards
## Mind Vault Backend (NestJS)

**Version**: 0.2.0
**Maintained By**: Development Team
**Changelog**:
- v0.2.0: Added comprehensive package-specific best practices (Resend, @nestjs/config, compression, RxJS)
- v0.1.0: Initial SOP for Mind Vault Backend project

---

## Table of Contents
1. [Pre-Development Checklist](#1-pre-development-checklist)
2. [Development Standards](#2-development-standards)
3. [Quality Gates Workflow](#3-quality-gates-workflow)
4. [NestJS Architecture Standards](#4-nestjs-architecture-standards)
5. [Data Validation Standards](#5-data-validation-standards)
6. [Database & Supabase Standards](#6-database--supabase-standards)
7. [Security Standards](#7-security-standards)
8. [Email Service Standards (Resend)](#8-email-service-standards-resend)
9. [Configuration Management (@nestjs/config)](#9-configuration-management-nestjsconfig)
10. [Performance & Optimization](#10-performance--optimization)
11. [Testing Requirements](#11-testing-requirements)
12. [Git & Version Control](#12-git--version-control)
13. [Documentation Requirements](#13-documentation-requirements)
14. [Quick Reference](#14-quick-reference)
15. [Troubleshooting](#15-troubleshooting)

---

## 1. Pre-Development Checklist

### 1.1 Environment Setup Verification

**Before starting any development work:**

- [ ] Environment variables configured (`.env` file created from `.env.example`)
- [ ] Dependencies installed: `npm install`
- [ ] Development server starts successfully: `npm run start:dev`
- [ ] Git configured with correct user credentials
- [ ] IDE/Editor configured with ESLint and TypeScript support
- [ ] Supabase project accessible and credentials valid
- [ ] Resend API key configured (for email functionality)

**Verify your setup:**
```bash
# Check Node version (should be v20 or higher for NestJS 11)
node -v

# Verify dependencies are installed
npm list --depth=0

# Start dev server to ensure everything works
npm run start:dev
# Server should start at http://localhost:8000
# Swagger docs available at http://localhost:8000/api/docs
```

### 1.2 Documentation Review Requirements

**Read before coding:**

- [ ] Review [README.md](../README.md) for project setup
- [ ] Check relevant feature documentation in `docs/` directory
- [ ] Understand NestJS module architecture
- [ ] Review existing modules before creating new ones
- [ ] Check Supabase schema and relationships

**Key documentation files:**

- `docs/coding-sop.md` (this file) - Development standards
- NestJS docs: https://docs.nestjs.com/
- Supabase docs: https://supabase.com/docs
- Resend docs: https://resend.com/docs
- Zod docs: https://zod.dev/
- `README.md` - Project setup and overview

### 1.3 Codebase Familiarity Guidelines

**Before implementing new functionality:**

1. **Search for existing solutions:**
   ```bash
   # Search for similar modules
   find src/ -name "*[keyword]*"

   # Search for similar functionality in code
   grep -r "functionName" src/
   ```

2. **Check existing modules:**
   - Browse `src/modules/` for feature modules
   - Check `src/common/` for shared utilities (guards, decorators, DTOs)
   - Review `src/utils/` for helper functions
   - Check `src/config/` for configuration modules

3. **Review NestJS patterns:**
   - Understand module/controller/service architecture
   - Check dependency injection patterns
   - Review guard and decorator usage

---

## 2. Development Standards

### 2.1 Code Style & Formatting

#### ESLint Configuration
**Base Rules** (TypeScript ESLint with Recommended Type Checked):

The project uses TypeScript ESLint with type checking enabled:
- `@eslint/js` recommended config
- `typescript-eslint` recommended type checked
- `eslint-plugin-prettier/recommended`

```javascript
// Key rules enforced:
// - TypeScript type checking
// - Prettier formatting
// - No explicit any (should be enabled)
// - Floating promises warnings
// - Unsafe argument warnings
```

**Quick Style Rules:**
- ✅ Use single quotes for strings: `'hello'`
- ✅ Semicolons are optional (follow existing patterns)
- ✅ 2-space indentation
- ✅ Use Prettier defaults
- ❌ No `any` types (use `unknown` if type is truly unknown)
- ❌ No unused variables or imports
- ❌ No debugger statements in production code
- ❌ No console.log in production (use NestJS Logger)

#### TypeScript Standards

**Type Safety Requirements:**
```typescript
// ✅ GOOD: Explicit interfaces
interface ICreateUserDto {
  email: string;
  password: string;
  organization_id: string;
  role: 'admin' | 'member';
}

// ✅ GOOD: Proper typing for service methods
async createUser(dto: ICreateUserDto): Promise<IUser> {
  // Implementation
}

// ❌ BAD: Using any
const handleData = (data: any) => {  // Avoid any!
  // ...
};

// ✅ GOOD: Proper typing with unknown
const handleData = (data: unknown) => {
  if (typeof data === 'object' && data !== null) {
    // Type guard logic
  }
};
```

**Type Export Pattern:**
```typescript
// ✅ GOOD: Interfaces with 'I' prefix (extendable)
export interface IUser {
  id: string;
  email: string;
  organization_id: string;
  role: Role;
  created_at: string;
}

// ✅ GOOD: Types with 'T' prefix
export type TUserRole = 'admin' | 'member';
export type TInvitationStatus = 'pending' | 'accepted';

// Generic types
export type TApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

// Benefits of I/T prefix convention:
// - Clear distinction between interfaces and type aliases
// - Identify extendable types (interfaces) at a glance
// - Consistent naming across the codebase
```

### 2.2 Architecture Compliance

#### Naming Conventions

**Files & Folders:**
```
kebab-case for files:       user.controller.ts, auth.service.ts
kebab-case for folders:     common/, modules/
DTOs in dto/ folder:        signup.dto.ts, login.dto.ts
Module structure:           module-name.module.ts
```

**TypeScript Naming:**
```typescript
// PascalCase for classes, decorators
export class AuthService {}
export class AuthController {}
@Injectable()
@Controller('auth')

// Interfaces: 'I' prefix (extendable types)
export interface IUser {
  id: string;
  email: string;
}
export interface ICreateUserDto {
  email: string;
  password: string;
}

// Types: 'T' prefix (type aliases)
export type TUserRole = 'admin' | 'member';
export type TApiResponse<T> = {
  data: T;
  message: string;
};

// camelCase for functions, variables, parameters
export const getUserById = (id: string) => {};
const isActive = true;
const handleRequest = async (userId: string) => {};

// UPPER_SNAKE_CASE for constants
export const API_VERSION = 'v1';
export const MAX_RETRY_COUNT = 3;
export const DEFAULT_PAGE_SIZE = 20;
export const TOKEN_EXPIRY_DAYS = 7;
```

#### Database Naming (Supabase)
```sql
-- snake_case for all database identifiers
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT,
  organization_id UUID,
  created_at TIMESTAMP
);

-- Consistent snake_case for all fields
CREATE TABLE invitations (
  id UUID PRIMARY KEY,
  email TEXT,
  organization_id UUID,
  role TEXT,
  token TEXT,
  status TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### 2.3 NestJS Architecture Patterns

#### Module Structure
```
src/
├── modules/
│   ├── auth/
│   │   ├── dto/
│   │   │   ├── signup.dto.ts
│   │   │   └── login.dto.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
├── common/
│   ├── guards/
│   │   └── auth.guard.ts
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   ├── dto/
│   │   └── types.ts
│   └── pipes/
├── config/
│   ├── app.config.ts
│   └── validation.schema.ts
├── utils/
│   ├── supabase-client.ts
│   └── email.service.ts
├── app.module.ts
└── main.ts
```

---

## 3. Quality Gates Workflow

### 3.1 Build Verification

**Before finalizing MR/PR:**

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix

# Type check
npx tsc --noEmit

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Production build test
npm run build

# Start production build locally
npm run start:prod
# Visit http://localhost:8000/api/v1 to verify
```

### 3.2 Quality Gate Checklist

**Before every commit:**
- [ ] No console.logs (use Logger instead)
- [ ] All imports used
- [ ] No TypeScript errors
- [ ] Service methods have proper return types

**Before every MR/PR:**
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] Manual testing completed (see Section 11.4)
- [ ] No unused imports or variables
- [ ] No commented-out code (clean it up)
- [ ] DTOs properly validated with Zod
- [ ] Error handling comprehensive
- [ ] Database queries optimized
- [ ] Swagger documentation updated
- [ ] Interfaces use `I` prefix, types use `T` prefix
- [ ] Security best practices followed
- [ ] Email templates tested (if modified)
- [ ] Environment variables documented in .env.example

**Periodically (weekly/sprint):**
- [ ] Review API response times
- [ ] Review database query performance
- [ ] Update documentation
- [ ] Check Swagger docs accuracy

---

## 4. NestJS Architecture Standards

### 4.1 Module Structure Template

**Feature Module:**

```typescript
// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [],  // Import other modules if needed
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],  // Export if used by other modules
})
export class UsersModule {}
```

**Controller Template:**

```typescript
// src/modules/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '@/common/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { IUser } from '@/common/dto/types';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users in organization' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@CurrentUser() currentUser: IUser) {
    return this.usersService.findAll(currentUser.organization_id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: IUser
  ) {
    return this.usersService.findOne(id, currentUser.organization_id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser() currentUser: IUser
  ) {
    return this.usersService.create(dto, currentUser.organization_id);
  }
}
```

**Service Template:**

```typescript
// src/modules/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { supabase } from '@/utils/supabase-client';
import { IUser } from '@/common/dto/types';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async findAll(organizationId: string): Promise<IUser[]> {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`);
      throw new BadRequestException('Failed to fetch users');
    }

    return users || [];
  }

  async findOne(id: string, organizationId: string): Promise<IUser> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single<IUser>();

    if (error || !user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(dto: CreateUserDto, organizationId: string): Promise<IUser> {
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        ...dto,
        organization_id: organizationId,
      })
      .select()
      .single<IUser>();

    if (error || !user) {
      this.logger.error(`Failed to create user: ${error?.message}`);
      throw new BadRequestException('Failed to create user');
    }

    return user;
  }
}
```

### 4.2 Best Practices

#### ✅ DO:

```typescript
// ✅ Use Logger instead of console.log
import { Logger } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  async doSomething() {
    this.logger.log('Operation started');
    this.logger.error('Operation failed', error.stack);
    this.logger.warn('Warning message');
    this.logger.debug('Debug information');
  }
}

// ✅ Use dependency injection
@Injectable()
export class UsersService {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService
  ) {}
}

// ✅ Use custom decorators
@Get('profile')
@UseGuards(AuthGuard)
async getProfile(@CurrentUser() user: IUser) {
  return user;
}

// ✅ Use guards for authentication/authorization
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
@Get('admin')
async adminOnly() {
  // Admin-only endpoint
}

// ✅ Use pipes for validation (ValidationPipe configured globally)
@Post()
async create(@Body() dto: CreateUserDto) {
  return this.service.create(dto);
}

// ✅ Use proper HTTP status codes
@Post()
@HttpCode(HttpStatus.CREATED)
async create() {}

@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
async delete() {}

// ✅ Use Swagger decorators for API documentation
@ApiOperation({ summary: 'Create user' })
@ApiResponse({ status: 201, description: 'User created successfully' })
@ApiResponse({ status: 400, description: 'Bad request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@Post()
async create() {}

// ✅ Use object parameters for 3+ params
interface ICreateUserParams {
  email: string;
  password: string;
  organizationId: string;
  role: 'admin' | 'member';
}

async createUser(params: ICreateUserParams): Promise<IUser> {
  const { email, password, organizationId, role } = params;
  // Implementation
}

// ✅ Handle async operations properly
@Post()
async create(@Body() dto: CreateUserDto) {
  try {
    return await this.service.create(dto);
  } catch (error) {
    this.logger.error('Failed to create user', error.stack);
    throw error;
  }
}
```

#### ❌ DON'T:

```typescript
// ❌ Don't use console.log
console.log('User created'); // BAD - use Logger

// ❌ Don't use any types
async getData(params: any): Promise<any> {
  // BAD - use proper interfaces
}

// ❌ CRITICAL: Don't use too many function parameters (3+ params)
async createUser(
  email: string,
  password: string,
  organizationId: string,
  role: string
) {
  // BAD - Use object destructuring instead
}

// ❌ Don't ignore errors
const { data } = await supabase.from('users').select();
return data; // What if error occurs?

// ❌ Don't return raw database responses without types
@Get()
async findAll() {
  const { data } = await supabase.from('users').select();
  return data; // BAD - use proper DTOs
}

// ❌ Don't expose sensitive data
return {
  user: {
    id: user.id,
    email: user.email,
    password: user.password, // BAD - never return passwords
  }
};

// ❌ Don't skip validation
@Post()
async create(@Body() dto: any) { // BAD - validate with DTOs
  return this.service.create(dto);
}

// ❌ Don't create synchronous blocking operations
@Get()
findAll() {
  // BAD - expensive synchronous operation
  const result = expensiveSync Operation();
  return result;
}

// GOOD - use async
@Get()
async findAll() {
  const result = await expensiveAsyncOperation();
  return result;
}
```

### 4.3 Common Patterns

**Controller with CRUD operations:**
```typescript
@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new user' })
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
```

**Custom Guard:**
```typescript
// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return requiredRoles.includes(user.role);
  }
}

// Usage
@SetMetadata('roles', ['admin'])
@UseGuards(AuthGuard, RolesGuard)
@Get('admin')
async adminEndpoint() {}
```

**Custom Decorator:**
```typescript
// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Usage
@Get('profile')
@UseGuards(AuthGuard)
async getProfile(@CurrentUser() user: IUser) {
  return user;
}
```

**Custom Pipe:**
```typescript
// src/common/pipes/parse-uuid.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { z } from 'zod';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string> {
  transform(value: string): string {
    const uuidSchema = z.string().uuid();
    const result = uuidSchema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException('Invalid UUID format');
    }

    return value;
  }
}

// Usage
@Get(':id')
async findOne(@Param('id', ParseUUIDPipe) id: string) {
  return this.service.findOne(id);
}
```

---

## 5. Data Validation Standards

### 5.1 Validation Strategy

**This project uses Zod for validation:**
- ✅ **Zod** - Primary validation library (schema-based, TypeScript-first)
- ❌ **class-validator** - Installed but NOT used (decorator-based approach)
- ❌ **Joi** - Installed but NOT used (use Zod instead)

**Why Zod?**
- TypeScript-first with excellent type inference
- Composable and reusable schemas
- Better error messages
- Smaller bundle size
- Consistent with validation approach

### 5.2 Zod Validation Pattern

**DTO with Zod:**

```typescript
// src/modules/auth/dto/signup.dto.ts
import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organization_name: z
    .string()
    .min(1, 'Organization name is required')
    .optional(),
  invitation_token: z.string().optional(),
});

export type SignupDto = z.infer<typeof signupSchema>;
```

**Complex Validation:**

```typescript
import { z } from 'zod';

// Nested object validation
export const createInvitationSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  role: z.enum(['admin', 'member'], {
    errorMap: () => ({ message: 'Role must be admin or member' }),
  }),
  organization_id: z.string().uuid('Invalid organization ID'),
  expires_in_days: z.number().min(1).max(30).optional().default(7),
});

// Array validation
export const bulkCreateSchema = z.object({
  users: z.array(
    z.object({
      email: z.string().email(),
      role: z.enum(['admin', 'member']),
    })
  ).min(1, 'At least one user required').max(100, 'Maximum 100 users'),
});

// Conditional validation
export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(['admin', 'member']).optional(),
  organization_id: z.string().uuid().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' }
);

// Password strength validation
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Email domain validation
export const emailSchema = z.string()
  .email('Invalid email format')
  .toLowerCase()
  .trim()
  .refine(
    (email) => {
      const blockedDomains = ['tempmail.com', 'throwaway.email'];
      const domain = email.split('@')[1];
      return !blockedDomains.includes(domain);
    },
    { message: 'Email domain not allowed' }
  );

export type CreateInvitationDto = z.infer<typeof createInvitationSchema>;
export type BulkCreateDto = z.infer<typeof bulkCreateSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
```

### 5.3 Global Validation Pipe

**Already configured in main.ts:**

```typescript
// src/main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // Strip props not in DTO
    forbidNonWhitelisted: true,   // Throw error if extra props
    transform: true,              // Auto-transform to DTO type
    transformOptions: {
      enableImplicitConversion: true,  // Convert string to number, etc.
    },
  }),
);
```

### 5.4 Manual Validation in Services

**When you need to validate programmatically:**

```typescript
import { signupSchema } from './dto/signup.dto';
import { BadRequestException } from '@nestjs/common';

async signup(data: unknown) {
  // Validate with Zod
  const result = signupSchema.safeParse(data);

  if (!result.success) {
    const errors = result.error.format();
    throw new BadRequestException({
      message: 'Validation failed',
      errors,
    });
  }

  const validData = result.data;
  // Continue with valid data
}
```

### 5.5 Validation Best Practices

#### ✅ DO:

```typescript
// ✅ Use specific error messages
z.string().min(8, 'Password must be at least 8 characters')

// ✅ Use appropriate validators
z.string().email('Invalid email format')
z.string().uuid('Invalid UUID format')
z.string().url('Invalid URL format')

// ✅ Sanitize input (lowercase, trim)
z.string().email().toLowerCase().trim()

// ✅ Use enums for fixed values
z.enum(['admin', 'member'], {
  errorMap: () => ({ message: 'Role must be admin or member' }),
})

// ✅ Use optional with defaults
z.number().min(1).max(100).optional().default(10)

// ✅ Use refine for custom validation
z.object({ password: z.string() })
  .refine(
    (data) => data.password.length >= 8,
    { message: 'Password too short', path: ['password'] }
  )

// ✅ Validate related fields together
z.object({
  password: z.string(),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
)
```

#### ❌ DON'T:

```typescript
// ❌ Don't use generic error messages
z.string().min(8) // BAD - no error message

// ❌ Don't skip validation
async create(data: any) { // BAD - validate input
  await supabase.from('users').insert(data);
}

// ❌ Don't trust client input
async create(dto: CreateUserDto) {
  // BAD - dto.role could be 'superadmin' if not validated
  await supabase.from('users').insert(dto);
}

// ❌ Don't use class-validator in this project
import { IsEmail, MinLength } from 'class-validator'; // BAD - use Zod

// ❌ Don't use Joi in this project
import * as Joi from 'joi'; // BAD - use Zod
```

---

## 6. Database & Supabase Standards

### 6.1 Supabase Client Pattern

**Singleton Client:**

```typescript
// src/utils/supabase-client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**Using in Services:**

```typescript
import { supabase } from '@/utils/supabase-client';

async findOne(id: string): Promise<IUser> {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single<IUser>();

  if (error || !user) {
    throw new NotFoundException('User not found');
  }

  return user;
}
```

### 6.2 Query Patterns

**Select with filters:**

```typescript
// Single record
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single<IUser>();

// Multiple records
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('organization_id', orgId);

// With relations (joins)
const { data, error } = await supabase
  .from('users')
  .select(`
    *,
    organizations(id, name)
  `)
  .eq('id', userId)
  .single();

// With multiple conditions
const { data, error } = await supabase
  .from('invitations')
  .select('*')
  .eq('email', email)
  .eq('status', 'pending')
  .gte('expires_at', new Date().toISOString());

// With pagination
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('organization_id', orgId)
  .range(0, 9); // First 10 records

// With ordering
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('organization_id', orgId)
  .order('created_at', { ascending: false });
```

**Insert operations:**

```typescript
// Single insert
const { data, error } = await supabase
  .from('users')
  .insert({
    email: dto.email,
    organization_id: orgId,
    role: 'member',
  })
  .select()
  .single<IUser>();

// Bulk insert
const { data, error } = await supabase
  .from('users')
  .insert(usersArray)
  .select();

// Insert with conflict handling
const { data, error } = await supabase
  .from('users')
  .upsert({
    email: dto.email,
    organization_id: orgId,
  })
  .select()
  .single<IUser>();
```

**Update operations:**

```typescript
// Update single record
const { data, error } = await supabase
  .from('users')
  .update({ role: 'admin' })
  .eq('id', userId)
  .select()
  .single<IUser>();

// Update multiple records
const { data, error } = await supabase
  .from('invitations')
  .update({ status: 'expired' })
  .lt('expires_at', new Date().toISOString());
```

**Delete operations:**

```typescript
// Delete single record
const { error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId);

// Delete multiple records
const { error } = await supabase
  .from('invitations')
  .delete()
  .eq('organization_id', orgId)
  .eq('status', 'expired');
```

### 6.3 Transaction Management

**Manual Rollback Pattern:**

```typescript
async signup(dto: SignupDto) {
  // 1. Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name: dto.organization_name })
    .select()
    .single<IOrganization>();

  if (orgError || !org) {
    throw new BadRequestException('Failed to create organization');
  }

  // 2. Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: dto.email,
    password: dto.password,
  });

  if (authError || !authData.user) {
    // Rollback: delete organization
    await supabase.from('organizations').delete().eq('id', org.id);
    throw new BadRequestException('Failed to create user');
  }

  // 3. Create user record
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: dto.email,
      organization_id: org.id,
      role: 'admin',
    })
    .select()
    .single<IUser>();

  if (userError || !user) {
    // Rollback: delete auth user and organization
    await supabase.auth.admin.deleteUser(authData.user.id);
    await supabase.from('organizations').delete().eq('id', org.id);
    throw new BadRequestException('Failed to create user record');
  }

  return { user, organization: org };
}
```

### 6.4 Database Best Practices

#### ✅ DO:

```typescript
// ✅ Always check for errors
const { data, error } = await supabase.from('users').select();
if (error) {
  this.logger.error(`Query failed: ${error.message}`);
  throw new BadRequestException('Failed to fetch users');
}

// ✅ Use proper types
const { data, error } = await supabase
  .from('users')
  .select()
  .single<IUser>();

// ✅ Use organization_id filters for multi-tenancy
const { data } = await supabase
  .from('users')
  .select()
  .eq('organization_id', currentUser.organization_id);

// ✅ Use indexes for common queries
// CREATE INDEX idx_users_organization_id ON users(organization_id);
// CREATE INDEX idx_users_email ON users(email);

// ✅ Implement rollback for multi-step operations

// ✅ Use select() after insert/update to get the result
const { data } = await supabase
  .from('users')
  .insert(dto)
  .select()
  .single<IUser>();
```

#### ❌ DON'T:

```typescript
// ❌ Don't ignore errors
const { data } = await supabase.from('users').select();
return data; // What if error occurred?

// ❌ Don't query without organization_id (multi-tenancy)
const { data } = await supabase.from('users').select(); // BAD - all users!

// ❌ Don't use SELECT * in production (unless needed)
// Fetch only required fields for better performance
const { data } = await supabase
  .from('users')
  .select('id, email, role'); // GOOD - specific fields

// ❌ Don't use N+1 queries
for (const user of users) {
  const org = await supabase.from('organizations').select().eq('id', user.organization_id);
}
// GOOD - Use joins instead
const { data } = await supabase
  .from('users')
  .select('*, organizations(*)');

// ❌ Don't forget to add .select() after insert/update
const { data } = await supabase.from('users').insert(dto); // BAD - no select()
```

---

## 7. Security Standards

### 7.1 Helmet (Security Headers)

**Already configured in main.ts:**

```typescript
import helmet from 'helmet';

app.use(helmet());
```

**What Helmet does:**
- Sets X-DNS-Prefetch-Control header
- Sets X-Frame-Options to prevent clickjacking
- Sets X-Content-Type-Options to prevent MIME sniffing
- Sets Strict-Transport-Security for HTTPS
- Removes X-Powered-By header

**Custom Helmet configuration (if needed):**
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

### 7.2 CORS Configuration

**Configured in main.ts:**

```typescript
if (configService.get<boolean>('app.cors.enabled')) {
  app.enableCors({
    origin: configService.get<string>('app.cors.origin'),
    credentials: true,
  });
}
```

**Best practices:**
```typescript
// ✅ GOOD: Specific origins in production
app.enableCors({
  origin: 'https://yourdomain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// ❌ BAD: Wildcard in production
app.enableCors({
  origin: '*', // BAD - allows all origins
  credentials: true,
});
```

### 7.3 Authentication & Authorization

**Auth Guard Pattern:**

```typescript
// src/common/guards/auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { supabase } from '@/utils/supabase-client';
import { IUser } from '../dto/types';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Authorization header required');
    }

    const token = authorization.replace('Bearer ', '');

    try {
      // Verify JWT token
      const { data: authData, error } = await supabase.auth.getUser(token);

      if (error || !authData.user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Fetch user from database
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single<IUser>();

      if (userError || !user) {
        throw new UnauthorizedException('User not found');
      }

      // Attach user to request
      request.user = user;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

**Role-Based Authorization:**

```typescript
// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

// Usage
@SetMetadata('roles', ['admin'])
@UseGuards(AuthGuard, RolesGuard)
@Delete(':id')
async deleteUser(@Param('id') id: string) {
  return this.service.delete(id);
}
```

### 7.4 Input Sanitization

**Always validate and sanitize:**

```typescript
// ✅ Use Zod validation with sanitization
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(128),
  organization_name: z.string().trim().min(1).max(255),
});

// ✅ Use ValidationPipe (already configured globally)
@Post()
async create(@Body() dto: CreateUserDto) {
  // ValidationPipe automatically strips extra properties
  return this.service.create(dto);
}
```

### 7.5 Secrets Management

**Environment Variables:**

```bash
# .env
NODE_ENV=development
PORT=8000

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com

# Frontend
FRONTEND_URL=http://localhost:3000

# CORS
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:3000

# Never commit .env file
# Always use .env.example for documentation
```

**Accessing Secrets via ConfigService:**

```typescript
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  async doSomething() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const port = this.configService.get<number>('app.port');
    const corsOrigin = this.configService.get<string>('app.cors.origin');
  }
}
```

### 7.6 Security Best Practices

#### ✅ DO:

```typescript
// ✅ Use helmet for security headers (already configured)
app.use(helmet());

// ✅ Enable CORS properly with specific origins
app.enableCors({
  origin: 'https://yourdomain.com',
  credentials: true,
});

// ✅ Hash passwords (Supabase handles this)
// Never store plain-text passwords

// ✅ Validate all input with Zod
@Post()
async create(@Body() dto: CreateUserDto) {
  // ValidationPipe ensures dto is valid
}

// ✅ Use parameterized queries (Supabase handles this)
const { data } = await supabase
  .from('users')
  .select()
  .eq('email', userInput); // Safe from SQL injection

// ✅ Implement rate limiting (use @nestjs/throttler)
// npm install @nestjs/throttler
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
})

// ✅ Log security events
this.logger.warn(`Failed login attempt for ${email}`);
this.logger.error(`Unauthorized access attempt to ${endpoint}`);

// ✅ Use HTTPS in production
// Configure in reverse proxy (Nginx, Caddy)
```

#### ❌ DON'T:

```typescript
// ❌ Don't expose sensitive data
return {
  user: {
    password: user.password, // NEVER return passwords
    jwt_secret: process.env.JWT_SECRET, // NEVER expose secrets
  }
};

// ❌ Don't trust client input
@Delete(':id')
async delete(@Param('id') id: string, @Body() body: any) {
  // BAD - client could send organization_id to delete other org's users
  await supabase.from('users').delete().eq('id', id);

  // GOOD - always use current user's organization_id
  await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .eq('organization_id', currentUser.organization_id);
}

// ❌ Don't use weak validation
z.string() // BAD - no constraints
z.string().min(1).max(255) // GOOD - proper constraints

// ❌ Don't log sensitive data
this.logger.log(`Password: ${password}`); // NEVER log passwords
this.logger.log(`Token: ${token}`); // NEVER log tokens
this.logger.log(`API Key: ${apiKey}`); // NEVER log API keys

// ❌ Don't hardcode secrets
const apiKey = 'sk_test_1234567890'; // BAD
const apiKey = this.configService.get('API_KEY'); // GOOD
```

---

## 8. Email Service Standards (Resend)

### 8.1 Resend Setup

**Install Resend (already installed):**
```bash
npm install resend
```

**Environment variables:**
```bash
# .env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=http://localhost:3000
```

**Get API key:** https://resend.com/api-keys

### 8.2 Email Service Pattern

**Utility Service (current implementation):**

```typescript
// src/utils/email.service.ts
import { Resend } from 'resend';
import { Logger } from '@nestjs/common';

const logger = new Logger('EmailService');

export interface ISendInvitationEmailParams {
  to: string;
  inviterName: string;
  organizationName: string;
  inviteToken: string;
  role: string;
}

export class EmailService {
  static async sendInvitationEmail(params: ISendInvitationEmailParams): Promise<void> {
    const { to, inviterName, organizationName, inviteToken, role } = params;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const inviteUrl = `${frontendUrl}/auth/accept-invite?token=${inviteToken}`;

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key-here') {
      logger.warn('⚠️  RESEND_API_KEY not configured. Email will NOT be sent.');
      logger.warn(`⚠️  Share this link manually: ${inviteUrl}`);
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

    try {
      logger.log(`📧 Sending invitation email to: ${to}`);

      const result = await resend.emails.send({
        from: fromEmail,
        to,
        subject: `You've been invited to join ${organizationName}`,
        html: `<!-- Email template -->`,
      });

      logger.log(`✅ Email sent successfully! Email ID: ${result.data?.id || 'N/A'}`);
    } catch (error) {
      logger.error('❌ Failed to send invitation email:', error);
      logger.error(`Invite link (share manually): ${inviteUrl}`);
      // Don't throw error - we don't want to fail the invitation creation if email fails
    }
  }
}
```

**Injectable Service Pattern (recommended for larger apps):**

```typescript
// src/modules/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface ISendEmailParams {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('FROM_EMAIL') || 'onboarding@resend.dev';

    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not configured');
    } else {
      this.resend = new Resend(apiKey);
    }
  }

  async sendEmail(params: ISendEmailParams): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured, skipping email');
      return;
    }

    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        ...params,
      });

      this.logger.log(`Email sent to ${params.to}, ID: ${result.data?.id}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${params.to}`, error);
      // Don't throw - email is not critical
    }
  }

  async sendInvitationEmail(params: ISendInvitationEmailParams): Promise<void> {
    const { to, inviterName, organizationName, inviteToken, role } = params;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const inviteUrl = `${frontendUrl}/auth/accept-invite?token=${inviteToken}`;

    await this.sendEmail({
      to,
      subject: `You've been invited to join ${organizationName}`,
      html: this.getInvitationTemplate({
        inviterName,
        organizationName,
        role,
        inviteUrl,
      }),
    });
  }

  private getInvitationTemplate(data: {
    inviterName: string;
    organizationName: string;
    role: string;
    inviteUrl: string;
  }): string {
    // Return HTML template
    return `<!-- Template content -->`;
  }
}
```

### 8.3 Email Templates

**Use HTML templates for better email rendering:**

```typescript
private getInvitationTemplate(data: {
  inviterName: string;
  organizationName: string;
  role: string;
  inviteUrl: string;
}): string {
  const { inviterName, organizationName, role, inviteUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to ${organizationName}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
    <h1 style="color: #2c3e50; margin-top: 0;">You're Invited! 🎉</h1>
    <p style="font-size: 16px;">
      <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> as a <strong>${role}</strong>.
    </p>
  </div>

  <div style="background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #495057; margin-top: 0;">Getting Started</h2>
    <p style="font-size: 14px; color: #6c757d;">
      Click the button below to accept your invitation:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteUrl}"
         style="background-color: #007bff; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        Accept Invitation
      </a>
    </div>

    <p style="font-size: 12px; color: #6c757d; margin-top: 20px;">
      Or copy and paste this link:<br>
      <a href="${inviteUrl}" style="color: #007bff; word-break: break-all;">${inviteUrl}</a>
    </p>
  </div>

  <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
    <p style="font-size: 13px; color: #856404; margin: 0;">
      ⏰ <strong>Note:</strong> This invitation will expire in 7 days.
    </p>
  </div>

  <div style="text-align: center; font-size: 12px; color: #6c757d; padding-top: 20px; border-top: 1px solid #e9ecef;">
    <p>If you didn't expect this invitation, you can safely ignore this email.</p>
    <p>© ${new Date().getFullYear()} ${organizationName}. All rights reserved.</p>
  </div>
</body>
</html>
  `;
}
```

### 8.4 Email Best Practices

#### ✅ DO:

```typescript
// ✅ Use ConfigService for configuration
constructor(private configService: ConfigService) {
  this.apiKey = this.configService.get<string>('RESEND_API_KEY');
}

// ✅ Handle missing API key gracefully
if (!this.resend) {
  this.logger.warn('Email service not configured');
  return;
}

// ✅ Don't throw errors for email failures
try {
  await this.sendEmail(params);
} catch (error) {
  this.logger.error('Email failed', error);
  // Don't throw - email is not critical
}

// ✅ Log email events
this.logger.log(`Email sent to ${to}, ID: ${id}`);

// ✅ Use HTML templates for better rendering
html: this.getInvitationTemplate(data)

// ✅ Provide fallback for missing API key
logger.warn(`Share this link manually: ${inviteUrl}`);

// ✅ Use descriptive email subjects
subject: `You've been invited to join ${organizationName}`

// ✅ Include plain text alternative
text: `You've been invited to join ${organizationName}...`

// ✅ Test emails in development
if (nodeEnv === 'development') {
  this.logger.debug(`Email preview: ${inviteUrl}`);
}
```

#### ❌ DON'T:

```typescript
// ❌ Don't hardcode API keys
const resend = new Resend('re_hardcoded_key'); // BAD

// ❌ Don't throw errors for email failures
try {
  await this.sendEmail(params);
} catch (error) {
  throw error; // BAD - might break the flow
}

// ❌ Don't use console.log
console.log('Email sent'); // BAD - use Logger

// ❌ Don't send emails without checking configuration
await this.resend.emails.send({}); // BAD - might fail if not configured

// ❌ Don't use plain text only
text: 'Click here: https://...' // BAD - use HTML template

// ❌ Don't forget to handle errors
await this.resend.emails.send({}); // BAD - no error handling

// ❌ Don't expose email service errors to client
catch (error) {
  throw new BadRequestException(error.message); // BAD - exposes internal error
}
```

---

## 9. Configuration Management (@nestjs/config)

### 9.1 ConfigModule Setup

**Already configured in app.module.ts:**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import validationSchema from './config/validation.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
  ],
})
export class AppModule {}
```

### 9.2 Configuration Files

**App Configuration (src/config/app.config.ts):**

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8000', 10),
  name: process.env.APP_NAME || 'mind-vault-be',
  apiPrefix: process.env.API_PREFIX || 'api',
  apiVersion: process.env.API_VERSION || 'v1',
  cors: {
    enabled: process.env.CORS_ENABLED === 'true',
    origin: process.env.CORS_ORIGIN || '*',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },
}));
```

**Validation Schema (src/config/validation.schema.ts):**

```typescript
import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(8000),
  SUPABASE_URL: Joi.string().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
  RESEND_API_KEY: Joi.string().optional(),
  FROM_EMAIL: Joi.string().email().optional(),
  FRONTEND_URL: Joi.string().uri().required(),
  CORS_ENABLED: Joi.boolean().default(true),
  CORS_ORIGIN: Joi.string().default('*'),
});
```

### 9.3 Using ConfigService

**In Services:**

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MyService {
  constructor(private configService: ConfigService) {}

  async doSomething() {
    // Access root-level env vars
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    // Access namespaced config
    const port = this.configService.get<number>('app.port');
    const corsOrigin = this.configService.get<string>('app.cors.origin');
    const isProduction = this.configService.get<string>('app.nodeEnv') === 'production';

    // With default value
    const timeout = this.configService.get<number>('REQUEST_TIMEOUT', 5000);

    // Get required value (throws if missing)
    const required = this.configService.getOrThrow<string>('REQUIRED_VAR');
  }
}
```

**In main.ts:**

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get<number>('app.port', 8000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  const corsEnabled = configService.get<boolean>('app.cors.enabled');

  if (corsEnabled) {
    app.enableCors({
      origin: configService.get<string>('app.cors.origin'),
      credentials: true,
    });
  }

  await app.listen(port);
}
```

### 9.4 Multiple Configuration Files

**Feature-specific configuration:**

```typescript
// src/config/database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.SUPABASE_URL,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
}));

// src/config/email.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  apiKey: process.env.RESEND_API_KEY,
  from: process.env.FROM_EMAIL || 'noreply@example.com',
}));

// Load in ConfigModule
ConfigModule.forRoot({
  load: [appConfig, databaseConfig, emailConfig],
})

// Use in services
const emailApiKey = this.configService.get<string>('email.apiKey');
const dbUrl = this.configService.get<string>('database.url');
```

### 9.5 Configuration Best Practices

#### ✅ DO:

```typescript
// ✅ Use ConfigModule globally
ConfigModule.forRoot({
  isGlobal: true,
})

// ✅ Validate environment variables
import * as Joi from 'joi';

validationSchema: Joi.object({
  PORT: Joi.number().required(),
  NODE_ENV: Joi.string().valid('development', 'production'),
})

// ✅ Use typed getters
const port = this.configService.get<number>('app.port');

// ✅ Provide defaults
const timeout = this.configService.get<number>('TIMEOUT', 5000);

// ✅ Namespace related config
registerAs('app', () => ({ ... }))
registerAs('database', () => ({ ... }))

// ✅ Use getOrThrow for required config
const apiKey = this.configService.getOrThrow<string>('API_KEY');

// ✅ Document all env vars in .env.example
# .env.example
PORT=8000
NODE_ENV=development
SUPABASE_URL=https://...
```

#### ❌ DON'T:

```typescript
// ❌ Don't access process.env directly
const port = process.env.PORT; // BAD - use ConfigService

// ❌ Don't skip validation
ConfigModule.forRoot({
  // No validationSchema - BAD
})

// ❌ Don't hardcode values
const apiUrl = 'https://api.example.com'; // BAD - use config

// ❌ Don't use string literals repeatedly
this.configService.get('app.cors.origin'); // Prone to typos

// GOOD - use constants
const CORS_ORIGIN = 'app.cors.origin';
this.configService.get(CORS_ORIGIN);

// ❌ Don't forget to handle missing config
const apiKey = this.configService.get('API_KEY'); // might be undefined

// GOOD - provide default or throw
const apiKey = this.configService.get('API_KEY', 'default');
const apiKey = this.configService.getOrThrow('API_KEY');
```

---

## 10. Performance & Optimization

### 10.1 Compression Middleware

**Already configured in main.ts:**

```typescript
import compression from 'compression';

app.use(compression());
```

**What compression does:**
- Compresses response bodies (gzip/deflate)
- Reduces bandwidth usage
- Improves response time
- Automatic for responses > 1KB

**Custom compression configuration:**
```typescript
app.use(compression({
  filter: (req, res) => {
    // Don't compress responses with this header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression for everything else
    return compression.filter(req, res);
  },
  threshold: 1024, // Only compress if > 1KB
  level: 6, // Compression level (0-9, default: 6)
}));
```

### 10.2 Query Optimization

**Use Indexes:**
```sql
-- Add indexes for commonly queried fields
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);
```

**Optimize Queries:**
```typescript
// ✅ GOOD: Select specific fields
const { data } = await supabase
  .from('users')
  .select('id, email, role')
  .eq('organization_id', orgId);

// ❌ BAD: Select all fields
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('organization_id', orgId);

// ✅ GOOD: Use joins instead of N+1 queries
const { data } = await supabase
  .from('users')
  .select(`
    id,
    email,
    organizations(id, name)
  `)
  .eq('organization_id', orgId);

// ❌ BAD: N+1 queries
const users = await getUsers();
for (const user of users) {
  const org = await getOrganization(user.organization_id);
}
```

### 10.3 Caching Strategies

**Response Caching (add if needed):**
```typescript
// npm install @nestjs/cache-manager cache-manager

import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60, // seconds
      max: 100, // maximum number of items in cache
    }),
  ],
})

// Use in service
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async findOne(id: string): Promise<IUser> {
    const cacheKey = `user:${id}`;

    // Check cache first
    const cachedUser = await this.cacheManager.get<IUser>(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }

    // Query database
    const user = await this.queryDatabase(id);

    // Cache result
    await this.cacheManager.set(cacheKey, user, 60 * 1000); // 1 minute

    return user;
  }
}
```

### 10.4 RxJS Best Practices

**RxJS is installed and available for reactive programming:**

```typescript
import { from, map, catchError, of } from 'rxjs';

// ✅ GOOD: Use RxJS for streams
@Get('users/stream')
async getUsersStream(): Observable<IUser[]> {
  return from(this.usersService.findAll()).pipe(
    map((users) => users.filter(u => u.isActive)),
    catchError((error) => {
      this.logger.error('Stream error', error);
      return of([]);
    })
  );
}

// ✅ GOOD: Use RxJS for event handling
import { Subject } from 'rxjs';
import { filter, debounceTime } from 'rxjs/operators';

@Injectable()
export class EventService {
  private events$ = new Subject<Event>();

  emitEvent(event: Event) {
    this.events$.next(event);
  }

  getEvents() {
    return this.events$.pipe(
      filter(event => event.type === 'important'),
      debounceTime(1000)
    );
  }
}
```

### 10.5 Logging Best Practices

**Use NestJS Logger:**
```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async create(dto: CreateUserDto) {
    this.logger.log(`Creating user with email: ${dto.email}`);

    try {
      const user = await this.createInDatabase(dto);
      this.logger.log(`User created successfully: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Use different log levels
  this.logger.verbose('Detailed information');
  this.logger.debug('Debug information');
  this.logger.log('General information');
  this.logger.warn('Warning message');
  this.logger.error('Error message', error.stack);
}
```

**Configure logging in main.ts:**
```typescript
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'log', 'debug', 'verbose'],
});

// Or conditionally based on environment
const logLevels = configService.get<string>('app.nodeEnv') === 'production'
  ? ['error', 'warn', 'log']
  : ['error', 'warn', 'log', 'debug', 'verbose'];

const app = await NestFactory.create(AppModule, {
  logger: logLevels,
});
```

---

## 11. Testing Requirements

### 11.1 Testing Setup

**Testing Libraries (already configured):**

```bash
# Unit tests with Jest
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch

# Debug tests
npm run test:debug
```

**Jest Configuration (already configured in package.json):**
```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

### 11.2 Unit Testing Patterns

**Service Unit Test:**

```typescript
// src/modules/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';

// Mock Supabase
jest.mock('@/utils/supabase-client', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    }),
  },
}));

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        organization_id: 'org1',
        role: 'member',
      };

      const { supabase } = require('@/utils/supabase-client');
      supabase.from().select().eq().single.mockResolvedValue({
        data: mockUser,
        error: null,
      });

      const result = await service.findOne('1', 'org1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      const { supabase } = require('@/utils/supabase-client');
      supabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(service.findOne('1', 'org1')).rejects.toThrow(NotFoundException);
    });
  });
});
```

**Controller Unit Test:**

```typescript
// src/modules/users/users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com' },
        { id: '2', email: 'user2@example.com' },
      ];

      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const currentUser = { organization_id: 'org1' };
      const result = await controller.findAll(currentUser as any);

      expect(result).toEqual(mockUsers);
      expect(service.findAll).toHaveBeenCalledWith('org1');
    });
  });
});
```

### 11.3 E2E Testing Patterns

**E2E Test:**

```typescript
// test/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/signup (POST)', () => {
    it('should create a new user and organization', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          organization_name: 'Test Org',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('organization');
          expect(res.body.user.email).toBe('test@example.com');
        });
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'password123',
          organization_name: 'Test Org',
        })
        .expect(400);
    });
  });
});
```

### 11.4 Manual Testing Checklist

**Before creating MR/PR:**

**Functionality Testing:**
- [ ] Feature works as expected in happy path
- [ ] Edge cases handled correctly
- [ ] Error states return proper HTTP codes (200, 201, 400, 401, 403, 404, 500)
- [ ] Validation works correctly (test with invalid data)
- [ ] Multi-tenancy enforced (organization_id filters)

**API Testing:**
- [ ] All endpoints return correct status codes
- [ ] Response bodies match expected format
- [ ] Error messages are descriptive and user-friendly
- [ ] Authentication required where needed (Bearer token)
- [ ] Authorization enforced correctly (role-based access)
- [ ] Swagger documentation matches actual behavior

**Database Testing:**
- [ ] Data persists correctly
- [ ] Queries are optimized (check query logs)
- [ ] Rollbacks work on errors
- [ ] Indexes used properly (EXPLAIN ANALYZE)
- [ ] No orphaned records after failures

**Performance Testing:**
- [ ] No slow queries (> 100ms)
- [ ] No N+1 query problems
- [ ] Compression works (check response headers)
- [ ] Response times acceptable (< 500ms for most endpoints)

**Security Testing:**
- [ ] Cannot access other organization's data
- [ ] Cannot perform admin actions as member
- [ ] Sensitive data not exposed in responses
- [ ] SQL injection attempts fail
- [ ] XSS attempts fail

---

## 12. Git & Version Control

### 12.1 Branch Naming Convention

```bash
# Feature branches
feature/add-auth
feature/implement-notifications
feature/add-user-management

# Bug fix branches
fix/resolve-login-error
fix/correct-data-validation
fix/patch-security-issue

# Refactoring branches
refactor/update-service-architecture
refactor/simplify-queries
refactor/optimize-database

# Hotfix branches
hotfix/critical-security-patch
hotfix/production-bug-fix

# Documentation branches
docs/update-readme
docs/add-api-documentation
```

### 12.2 Commit Message Standards

**Format:**
```
<type>: <subject>

<optional body>

<optional footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `style`: Formatting changes (no code logic change)
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `chore`: Build process or tooling changes
- `perf`: Performance improvements
- `security`: Security fixes

**Examples:**
```bash
# Feature
git commit -m "feat: Add invitation system with email notifications"

# Bug fix
git commit -m "fix: Resolve token validation issue in auth guard"

# Security fix
git commit -m "security: Prevent unauthorized access to admin endpoints"

# Refactoring
git commit -m "refactor: Simplify database query logic in users service"

# Multiple line commit
git commit -m "feat: Add bulk user import functionality

- Support CSV file upload
- Validate all rows before import
- Rollback on any error
- Send email summary after import"

# With issue reference
git commit -m "fix: Correct organization filter in user queries

Resolves #12345"
```

### 12.3 Pull Request Template

```markdown
## Description
Brief description of what this PR accomplishes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation update
- [ ] Security fix
- [ ] Performance improvement

## Changes Made
- Added invitation module with email sending
- Implemented role-based authorization
- Updated Swagger documentation
- Added comprehensive error handling
- Optimized database queries

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed
- [ ] Tested with Postman/Insomnia
- [ ] Security testing performed

## Quality Gates
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] No console.logs (using Logger)

## Security
- [ ] No sensitive data exposed
- [ ] Input validation implemented
- [ ] Multi-tenancy enforced
- [ ] Authorization checks in place

## Checklist
- [ ] Code follows project standards (see docs/coding-sop.md)
- [ ] DTOs validated with Zod
- [ ] Error handling comprehensive
- [ ] Swagger documentation updated
- [ ] Multi-tenancy enforced (organization_id filters)
- [ ] No sensitive data exposed
- [ ] No commented-out code
- [ ] No unused imports or variables
- [ ] Used Logger instead of console.log
- [ ] Interfaces use `I` prefix, types use `T` prefix
- [ ] Functions with 3+ params use object destructuring
- [ ] Environment variables documented in .env.example

## Screenshots/API Examples (if applicable)
[Add Postman/Insomnia screenshots or curl examples]
```

---

## 13. Documentation Requirements

### 13.1 Code Documentation

**When to add comments:**
- Complex business logic
- Non-obvious algorithms
- Security-sensitive code
- Public APIs
- Transaction rollback logic

**When NOT to add comments:**
- Self-explanatory code
- Obvious operations

**Swagger Documentation:**
```typescript
@Controller('users')
@ApiTags('users')
export class UsersController {
  @Get()
  @ApiOperation({ summary: 'Get all users in organization' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', type: [IUser] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async findAll(@CurrentUser() user: IUser) {
    return this.service.findAll(user.organization_id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully', type: IUser })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }
}
```

**JSDoc for complex functions:**
```typescript
/**
 * Creates a new user with organization and handles rollback on failure
 *
 * @param dto - Signup data including email, password, and organization name
 * @returns Created user and organization
 * @throws BadRequestException if any step fails
 *
 * @remarks
 * This function performs a multi-step operation:
 * 1. Create organization
 * 2. Create auth user in Supabase
 * 3. Create user record in database
 *
 * If any step fails, previous steps are rolled back to maintain data consistency.
 */
async signup(dto: SignupDto): Promise<{ user: IUser; organization: IOrganization }> {
  // Implementation
}
```

---

## 14. Quick Reference

### 14.1 Common Commands

```bash
# Development
npm run start:dev          # Start dev server with watch mode
npm run start:debug        # Start with debug mode

# Build
npm run build              # Build for production
npm run prebuild           # Clean dist folder

# Production
npm run start:prod         # Start production server

# Linting
npm run lint               # Run ESLint
npm run lint -- --fix      # Fix ESLint issues
npm run format             # Format with Prettier

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run E2E tests
npm run test:debug         # Debug tests

# Type checking
npx tsc --noEmit           # Check TypeScript errors

# Docker
npm run docker:build       # Build Docker image
npm run docker:run         # Run Docker container
```

### 14.2 Import Paths

```typescript
// Path aliases (from tsconfig.json)
import { UsersService } from '@/modules/users/users.service';
import { AuthGuard } from '@/common/guards/auth.guard';
import { IUser } from '@/common/dto/types';
import { supabase } from '@/utils/supabase-client';
import appConfig from '@/config/app.config';

// NestJS imports
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger, Injectable } from '@nestjs/common';

// External packages
import { z } from 'zod';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import compression from 'compression';
import helmet from 'helmet';
```

### 14.3 Environment Variables Quick Reference

```bash
# Server
NODE_ENV=development
PORT=8000

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email
RESEND_API_KEY=re_your_api_key
FROM_EMAIL=noreply@yourdomain.com

# Frontend
FRONTEND_URL=http://localhost:3000

# CORS
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:3000

# Optional
API_PREFIX=api
API_VERSION=v1
APP_NAME=mind-vault-be
LOG_LEVEL=debug
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

---

## 15. Troubleshooting

### 15.1 Common Issues

**Issue: Build fails with TypeScript errors**
```bash
# Check for type errors
npx tsc --noEmit

# Common issues:
# - Missing types: Ensure all interfaces defined
# - Wrong import paths: Check tsconfig paths
# - Any types: Replace with proper types
# - Missing return types on functions
```

**Issue: Validation not working**
```typescript
// Ensure ValidationPipe is configured globally in main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);

// Ensure DTOs use Zod schemas, not class-validator
```

**Issue: Supabase queries failing**
```typescript
// Always check for errors
const { data, error } = await supabase.from('users').select();
if (error) {
  this.logger.error(`Query failed: ${error.message}`);
  throw new BadRequestException('Failed to fetch users');
}

// Check environment variables
console.log(process.env.SUPABASE_URL);
console.log(process.env.SUPABASE_SERVICE_ROLE_KEY);
```

**Issue: Emails not sending**
```bash
# Check Resend API key
echo $RESEND_API_KEY

# Check logs for email service warnings
# Logger will show: "RESEND_API_KEY not configured"

# Verify FROM_EMAIL domain is verified in Resend dashboard
```

**Issue: CORS errors**
```typescript
// Check CORS configuration in main.ts
app.enableCors({
  origin: configService.get<string>('app.cors.origin'),
  credentials: true,
});

// Ensure CORS_ORIGIN in .env matches frontend URL
CORS_ORIGIN=http://localhost:3000
```

**Issue: Module not found errors**
```bash
# Check path aliases in tsconfig.json
{
  "paths": {
    "@/*": ["src/*"],
    "@config/*": ["src/config/*"],
    "@modules/*": ["src/modules/*"],
    "@common/*": ["src/common/*"],
    "@utils/*": ["src/utils/*"]
  }
}

# Restart dev server after changing tsconfig
npm run start:dev
```

---

## Appendix A: Checklist Summary

### Pre-Development Checklist
- [ ] Environment setup verified (.env configured)
- [ ] Documentation reviewed (README, SOP)
- [ ] Existing solutions searched
- [ ] Module architecture understood
- [ ] Supabase schema reviewed
- [ ] Resend API key configured (if email needed)

### During Development Checklist
- [ ] Using NestJS best practices (DI, modules, guards)
- [ ] Following TypeScript standards (Interfaces: `I` prefix, Types: `T` prefix)
- [ ] No `any` types (use `unknown` if needed)
- [ ] Using Logger instead of console.log
- [ ] DTOs validated with Zod (not class-validator)
- [ ] Error handling comprehensive (try/catch, proper exceptions)
- [ ] Multi-tenancy enforced (organization_id filters)
- [ ] Functions with 3+ params use object destructuring
- [ ] No sensitive data exposed (passwords, secrets)
- [ ] Swagger documentation added (@ApiOperation, @ApiResponse)
- [ ] Using ConfigService for environment variables
- [ ] Email service error handling (don't throw on email failure)

### Pre-Commit Checklist
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] All imports used (no unused imports)
- [ ] Endpoints tested manually (Postman/Insomnia)
- [ ] No unused variables
- [ ] No console.logs (using Logger)

### Pre-MR/PR Checklist
- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run test` passes
- [ ] `npm run build` succeeds
- [ ] Manual testing completed (see Section 11.4)
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Documentation updated (if needed)
- [ ] No commented-out code
- [ ] Swagger docs updated and accurate
- [ ] Environment variables documented in .env.example
- [ ] Security testing performed (authorization, multi-tenancy)

---

**End of SOP Document**
