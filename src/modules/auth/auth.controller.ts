import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { signupSchema } from './dto/signup.dto';
import { loginSchema } from './dto/login.dto';
import type { SignupDto } from './dto/signup.dto';
import type { LoginDto } from './dto/login.dto';
import { ZodError } from 'zod';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({
    summary: 'Signup (with or without invitation)',
    description:
      'Two modes: (1) Normal signup - creates new organization with admin user. (2) Invitation signup - creates account and joins existing organization. If email contains "+test", account is auto-activated.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'admin+test@example.com',
          description:
            'User email address. Include "+test" for auto-activation (e.g., admin+test@example.com), otherwise email verification will be required.',
        },
        password: {
          type: 'string',
          minLength: 8,
          example: 'password123',
          description: 'Password (minimum 8 characters)',
        },
        organization_name: {
          type: 'string',
          minLength: 1,
          example: 'Acme Corporation',
          description:
            'Organization name. Required for normal signup, not needed when using invitation_token.',
        },
        invitation_token: {
          type: 'string',
          example: 'abc123def456...',
          description:
            'Optional. Invitation token to join an existing organization. When provided, organization_name is not required.',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created organization and user',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            organization_id: { type: 'string', format: 'uuid' },
            role: { type: 'string', enum: ['admin', 'member'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        organization: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        message: {
          type: 'string',
          description: 'Status message about email verification',
          example:
            'Account created and activated successfully. You can login now.',
        },
        email_verified: {
          type: 'boolean',
          description:
            'Whether the email was auto-verified (true if email contains +test)',
          example: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or creation error',
  })
  async signup(@Body() body: SignupDto) {
    try {
      const dto = signupSchema.parse(body);
      return await this.authService.signup(dto);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.issues,
        });
      }
      throw error;
    }
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description:
      'Authenticate a user with email and password. Returns access token, refresh token, and user profile.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'admin@example.com',
          description: 'User email address',
        },
        password: {
          type: 'string',
          example: 'password123',
          description: 'User password',
        },
        invitation_token: {
          type: 'string',
          example: 'abc123def456...',
          description:
            'Optional. Invitation token to accept while logging in. When provided, user will be added to the invited organization.',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          description: 'JWT access token (use in Authorization header)',
        },
        refresh_token: {
          type: 'string',
          description: 'JWT refresh token (use to get new access token)',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            organization_id: { type: 'string', format: 'uuid' },
            role: { type: 'string', enum: ['admin', 'member'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password',
  })
  async login(@Body() body: LoginDto) {
    try {
      const dto = loginSchema.parse(body);
      return await this.authService.login(dto);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.issues,
        });
      }
      throw error;
    }
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Retrieve the profile of the currently authenticated user. Requires valid JWT token in Authorization header.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        email: { type: 'string', format: 'email' },
        organization_id: { type: 'string', format: 'uuid' },
        role: { type: 'string', enum: ['admin', 'member'] },
        created_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Authorization header is missing',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid token or user not found',
  })
  async getProfile(@Headers('authorization') authorization?: string) {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }

    const token = authorization.replace('Bearer ', '');
    return await this.authService.getProfile(token);
  }
}
