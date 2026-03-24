import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  BadRequestException,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { createInvitationSchema } from './dto/create-invitation.dto';
import { acceptInvitationSchema } from './dto/accept-invitation.dto';
import type { CreateInvitationDto } from './dto/create-invitation.dto';
import type { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { ZodError } from 'zod';
import { supabase } from '../../utils/supabase-client';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create invitation (Admin only)',
    description:
      'Create an invitation to join the organization. Only admin users can create invitations. Returns invitation details and an invite link.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'role'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'newuser@example.com',
          description: 'Email address of the user to invite',
        },
        role: {
          type: 'string',
          enum: ['admin', 'member'],
          example: 'member',
          description: 'Role to assign to the invited user',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Invitation created successfully',
    schema: {
      type: 'object',
      properties: {
        invitation: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            organization_id: { type: 'string', format: 'uuid' },
            role: { type: 'string', enum: ['admin', 'member'] },
            token: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'accepted'] },
            expires_at: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        inviteLink: {
          type: 'string',
          example: '/invite?token=abc123...',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or authorization header missing',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid token',
  })
  @ApiResponse({
    status: 403,
    description: 'Only admins can create invitations',
  })
  async createInvitation(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: CreateInvitationDto,
  ) {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }

    try {
      const dto = createInvitationSchema.parse(body);
      const token = authorization.replace('Bearer ', '');

      // Get user ID from token
      const { data: authData } = await supabase.auth.getUser(token);

      if (!authData.user) {
        throw new BadRequestException('Invalid token');
      }

      return await this.invitationsService.createInvitation(
        authData.user.id,
        dto,
      );
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

  @Get('validate')
  @ApiOperation({
    summary: 'Validate invitation token',
    description:
      'Check if an invitation token is valid and determine if the user needs to signup or login. This endpoint does not require authentication.',
  })
  @ApiQuery({
    name: 'token',
    type: 'string',
    required: true,
    description: 'Invitation token from the invite link',
    example: 'abc123def456...',
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation validation result',
    schema: {
      type: 'object',
      properties: {
        valid: {
          type: 'boolean',
          description: 'Whether the invitation token is valid',
        },
        invitation: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            organization_name: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'member'] },
            expires_at: { type: 'string', format: 'date-time' },
          },
        },
        user_exists: {
          type: 'boolean',
          description: 'Whether a Supabase auth user exists with this email',
        },
        action_required: {
          type: 'string',
          enum: ['signup', 'login', null],
          description: 'What action the user needs to take',
        },
        message: {
          type: 'string',
          description: 'Human-readable message about the invitation status',
        },
      },
    },
  })
  async validateInvitation(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token query parameter is required');
    }
    return await this.invitationsService.validateInvitation(token);
  }

  @Post('accept')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Accept invitation (Advanced - requires existing JWT)',
    description:
      'Accept a pending invitation and join the organization. Requires a valid invitation token and user authentication. Most users should use the signup or login endpoints with invitation_token instead.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['token'],
      properties: {
        token: {
          type: 'string',
          example: 'abc123def456...',
          description: 'Invitation token from the invite link',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation accepted successfully, user created',
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
    description:
      'Validation failed, invitation already used, or invitation expired',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid authentication token',
  })
  @ApiResponse({
    status: 404,
    description: 'Invitation not found',
  })
  async acceptInvitation(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: AcceptInvitationDto,
  ) {
    if (!authorization) {
      throw new BadRequestException('Authorization header is required');
    }

    try {
      const dto = acceptInvitationSchema.parse(body);
      const token = authorization.replace('Bearer ', '');
      return await this.invitationsService.acceptInvitation(token, dto);
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

  @Get('organization/:organizationId')
  @ApiOperation({
    summary: 'Get invitations by organization',
    description:
      'Retrieve all invitations for a specific organization, ordered by creation date (newest first).',
  })
  @ApiParam({
    name: 'organizationId',
    type: 'string',
    format: 'uuid',
    description: 'Organization ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of invitations',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          organization_id: { type: 'string', format: 'uuid' },
          role: { type: 'string', enum: ['admin', 'member'] },
          token: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'accepted'] },
          expires_at: { type: 'string', format: 'date-time' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to fetch invitations',
  })
  async getInvitations(@Param('organizationId') organizationId: string) {
    return await this.invitationsService.getInvitationsByOrganization(
      organizationId,
    );
  }
}
